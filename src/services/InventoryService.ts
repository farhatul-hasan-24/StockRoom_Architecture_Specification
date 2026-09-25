import { Product, StockMovement, MovementType } from '../types';
import { v4 as uuidv4 } from 'uuid';

// ============================================================
// InventoryService — Single source of truth for all stock changes
// No other code may modify current_stock directly.
// Every write is wrapped in a simulated transaction and produces
// an immutable StockMovement ledger row.
// ============================================================

type StockChangeCallback = () => void;

class InventoryServiceClass {
  private products: Product[] = [];
  private movements: StockMovement[] = [];
  private listeners: Set<StockChangeCallback> = new Set();

  subscribe(cb: StockChangeCallback) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  setProducts(products: Product[]) {
    this.products = products;
  }

  setMovements(movements: StockMovement[]) {
    this.movements = movements;
  }

  getProducts(): Product[] {
    return [...this.products];
  }

  getMovements(): StockMovement[] {
    return [...this.movements];
  }

  getProduct(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  /**
   * Core atomic stock change method.
   * Simulates @transaction.atomic + SELECT FOR UPDATE pattern.
   * Returns the new product or throws on validation failure.
   */
  changeStock(
    productId: string,
    quantity: number,
    movementType: MovementType,
    refType: string,
    refId: string,
    userId: string
  ): Product {
    // Step 1: "Lock" — find product (simulating SELECT FOR UPDATE)
    const productIndex = this.products.findIndex(p => p.id === productId);
    if (productIndex === -1) {
      throw new Error(`Product ${productId} not found`);
    }

    const product = { ...this.products[productIndex] };
    const prevStock = product.current_stock;
    const newStock = prevStock + quantity;

    // Step 2: Validate — no negative stock ever
    if (newStock < 0) {
      throw new Error(
        `Insufficient stock for ${product.name}. ` +
        `Available: ${prevStock}, Requested: ${Math.abs(quantity)}`
      );
    }

    // Step 3: Apply change
    product.current_stock = newStock;
    this.products[productIndex] = product;

    // Step 4: Log immutable StockMovement
    const movement: StockMovement = {
      id: uuidv4(),
      product_id: productId,
      movement_type: movementType,
      quantity: quantity,
      prev_stock: prevStock,
      new_stock: newStock,
      ref_type: refType,
      ref_id: refId,
      created_by: userId,
      created_at: new Date().toISOString(),
    };
    this.movements.push(movement);

    // Step 5: Commit & notify
    this.notify();

    return product;
  }

  /**
   * Batch stock changes in a single "transaction"
   * If any item fails, all are rolled back.
   */
  batchChangeStock(
    changes: Array<{
      productId: string;
      quantity: number;
      movementType: MovementType;
      refType: string;
      refId: string;
    }>,
    userId: string
  ): Product[] {
    // Save snapshot for rollback
    const snapshot = this.products.map(p => ({ ...p }));
    const movementsSnapshot = [...this.movements];

    try {
      const results: Product[] = [];
      for (const change of changes) {
        const result = this.changeStock(
          change.productId,
          change.quantity,
          change.movementType,
          change.refType,
          change.refId,
          userId
        );
        results.push(result);
      }
      return results;
    } catch (error) {
      // Full rollback — restore snapshot
      this.products = snapshot;
      this.movements = movementsSnapshot;
      throw error;
    }
  }

  updateProduct(product: Product) {
    const index = this.products.findIndex(p => p.id === product.id);
    if (index !== -1) {
      this.products[index] = product;
      this.notify();
    }
  }

  addProduct(product: Product) {
    this.products.push(product);
    this.notify();
  }

  removeProduct(id: string) {
    this.products = this.products.filter(p => p.id !== id);
    this.notify();
  }
}

export const InventoryService = new InventoryServiceClass();
