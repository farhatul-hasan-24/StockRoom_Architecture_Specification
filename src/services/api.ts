import { v4 as uuidv4 } from 'uuid';
import {
  User, Role, Product, Category, Supplier, Customer,
  Purchase, PurchaseItem, Sale, SaleItem, CartItem,
  DashboardSummary, StockMovement
} from '../types';
import { store } from './dataStore';
import { InventoryService } from './InventoryService';

// ============================================================
// API Service — simulates DRF endpoints with JWT + RBAC
// ============================================================

let currentUser: User | null = null;

function getCurrentUser(): User {
  if (!currentUser) throw new Error('Not authenticated');
  return currentUser;
}

function checkPermission(permission: string) {
  const user = getCurrentUser();
  const perms: Record<Role, string[]> = {
    admin: ['view_dashboard','manage_products','view_products','manage_suppliers','view_suppliers','process_sales','view_sales','view_reports','view_audit_logs','manage_users'],
    manager: ['view_dashboard','manage_products','view_products','manage_suppliers','view_suppliers','process_sales','view_sales','view_reports'],
    sales_staff: ['view_dashboard','view_products','view_suppliers','process_sales','view_sales'],
  };
  if (!perms[user.role].includes(permission)) {
    throw new Error(`Permission denied: ${permission} required`);
  }
}

// Auth
export const authAPI = {
  login(email: string, _password: string): { user: User; token: string } {
    const user = store.getUsers().find(u => u.email === email);
    if (!user) throw new Error('Invalid credentials');
    if (!user.is_active) throw new Error('Account disabled');
    currentUser = user;
    return { user, token: `jwt_${uuidv4()}` };
  },
  logout() { currentUser = null; },
  getCurrentUser(): User | null { return currentUser; },
  setCurrentUser(user: User) { currentUser = user; },
};

// Dashboard
export const dashboardAPI = {
  getSummary(): DashboardSummary {
    checkPermission('view_dashboard');
    const products = InventoryService.getProducts();
    const sales = store.getSales();
    const today = new Date().toDateString();
    const todaySales = sales.filter(s => new Date(s.created_at).toDateString() === today);
    return {
      total_products: products.length,
      low_stock_alerts: products.filter(p => p.current_stock > 0 && p.current_stock <= p.minimum_stock).length,
      out_of_stock: products.filter(p => p.current_stock === 0).length,
      today_sales_bdt: todaySales.reduce((sum, s) => sum + s.total_amount, 0),
      total_revenue_bdt: sales.reduce((sum, s) => sum + s.total_amount, 0),
      total_purchases_bdt: store.getPurchases().reduce((sum, p) => sum + p.total_amount, 0),
    };
  },
  getSalesChartData() {
    const sales = store.getSales();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toDateString();
    });
    return last7Days.map(date => {
      const daySales = sales.filter(s => new Date(s.created_at).toDateString() === date);
      return {
        date: new Date(date).toLocaleDateString('en', { weekday: 'short' }),
        sales: daySales.reduce((sum, s) => sum + s.total_amount, 0),
        count: daySales.length,
      };
    });
  },
  getCategoryData() {
    const categories = store.getCategories();
    const products = InventoryService.getProducts();
    return categories.map(cat => ({
      name: cat.name,
      products: products.filter(p => p.category_id === cat.id).length,
      stockValue: products.filter(p => p.category_id === cat.id).reduce((sum, p) => sum + p.current_stock * p.purchase_price, 0),
    }));
  },
};

// Products
export const productsAPI = {
  getAll(): Product[] {
    checkPermission('view_products');
    return InventoryService.getProducts();
  },
  getById(id: string): Product | undefined {
    checkPermission('view_products');
    return InventoryService.getProduct(id);
  },
  create(data: Omit<Product, 'id'>): Product {
    checkPermission('manage_products');
    const product: Product = { ...data, id: uuidv4() };
    InventoryService.addProduct(product);
    return product;
  },
  update(id: string, data: Partial<Product>): Product {
    checkPermission('manage_products');
    const existing = InventoryService.getProduct(id);
    if (!existing) throw new Error('Product not found');
    const updated = { ...existing, ...data };
    InventoryService.updateProduct(updated);
    return updated;
  },
  delete(id: string): void {
    checkPermission('manage_products');
    InventoryService.removeProduct(id);
  },
};

// Categories
export const categoriesAPI = {
  getAll(): Category[] { return store.getCategories(); },
  create(data: Omit<Category, 'id' | 'created_at'>): Category {
    checkPermission('manage_products');
    const cat: Category = { ...data, id: uuidv4(), created_at: new Date().toISOString() };
    store.addCategory(cat);
    return cat;
  },
  update(id: string, data: Partial<Category>): Category {
    checkPermission('manage_products');
    const existing = store.getCategories().find(c => c.id === id);
    if (!existing) throw new Error('Category not found');
    const updated = { ...existing, ...data };
    store.updateCategory(updated);
    return updated;
  },
  delete(id: string): void {
    checkPermission('manage_products');
    store.deleteCategory(id);
  },
};

// Suppliers
export const suppliersAPI = {
  getAll(): Supplier[] {
    checkPermission('view_suppliers');
    return store.getSuppliers();
  },
  create(data: Omit<Supplier, 'id'>): Supplier {
    checkPermission('manage_suppliers');
    const supplier: Supplier = { ...data, id: uuidv4() };
    store.addSupplier(supplier);
    return supplier;
  },
  update(id: string, data: Partial<Supplier>): Supplier {
    checkPermission('manage_suppliers');
    const existing = store.getSuppliers().find(s => s.id === id);
    if (!existing) throw new Error('Supplier not found');
    const updated = { ...existing, ...data };
    store.updateSupplier(updated);
    return updated;
  },
  delete(id: string): void {
    checkPermission('manage_suppliers');
    store.deleteSupplier(id);
  },
};

// Customers
export const customersAPI = {
  getAll(): Customer[] { return store.getCustomers(); },
  create(data: Omit<Customer, 'id' | 'created_at'>): Customer {
    const customer: Customer = { ...data, id: uuidv4(), created_at: new Date().toISOString() };
    store.addCustomer(customer);
    return customer;
  },
  update(id: string, data: Partial<Customer>): Customer {
    const existing = store.getCustomers().find(c => c.id === id);
    if (!existing) throw new Error('Customer not found');
    const updated = { ...existing, ...data };
    store.updateCustomer(updated);
    return updated;
  },
  delete(id: string): void {
    store.deleteCustomer(id);
  },
};

// Purchases — creates purchase + increments stock via InventoryService
export const purchasesAPI = {
  getAll(): Purchase[] {
    checkPermission('view_suppliers');
    return store.getPurchases();
  },
  create(supplierId: string, items: Array<{ product_id: string; quantity: number; unit_cost: number }>): Purchase {
    checkPermission('manage_suppliers');
    const user = getCurrentUser();
    const purchaseId = uuidv4();

    // Use InventoryService for atomic stock increment
    const changes = items.map(item => ({
      productId: item.product_id,
      quantity: item.quantity,
      movementType: 'PURCHASE' as const,
      refType: 'purchase',
      refId: purchaseId,
    }));

    InventoryService.batchChangeStock(changes, user.id);

    const purchaseItems: PurchaseItem[] = items.map(item => ({
      id: uuidv4(),
      product_id: item.product_id,
      quantity: item.quantity,
      unit_cost: item.unit_cost,
    }));

    const purchase: Purchase = {
      id: purchaseId,
      supplier_id: supplierId,
      items: purchaseItems,
      total_amount: items.reduce((sum, i) => sum + i.quantity * i.unit_cost, 0),
      created_by: user.id,
      created_at: new Date().toISOString(),
    };

    store.addPurchase(purchase);
    return purchase;
  },
};

// Sales — Atomic checkout sequence
export const salesAPI = {
  getAll(): Sale[] {
    checkPermission('view_sales');
    return store.getSales();
  },
  /**
   * Atomic Checkout Sequence (exact order):
   * 1. Start transaction
   * 2. Lock product rows (SELECT FOR UPDATE)
   * 3. Validate stock levels
   * 4. Create Sale record
   * 5. Create SaleItems
   * 6. Decrement stock via InventoryService
   * 7. Log StockMovement entry
   * 8. Commit
   * Any failure → full rollback
   */
  checkout(customerId: string | null, cartItems: CartItem[]): Sale {
    checkPermission('process_sales');
    const user = getCurrentUser();
    const saleId = uuidv4();

    // Steps 1-3: Validate all stock levels first (simulates SELECT FOR UPDATE)
    for (const item of cartItems) {
      const product = InventoryService.getProduct(item.product.id);
      if (!product) throw new Error(`Product ${item.product.name} not found`);
      if (product.current_stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${product.name}. ` +
          `Available: ${product.current_stock}, Requested: ${item.quantity}`
        );
      }
    }

    // Step 4-5: Create Sale record and items
    const saleItems: SaleItem[] = cartItems.map(item => ({
      id: uuidv4(),
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price: item.product.selling_price,
      subtotal: item.quantity * item.product.selling_price,
    }));

    // Step 6-7: Decrement stock via InventoryService (batch = atomic)
    const changes = cartItems.map(item => ({
      productId: item.product.id,
      quantity: -item.quantity,
      movementType: 'SALE' as const,
      refType: 'sale',
      refId: saleId,
    }));

    InventoryService.batchChangeStock(changes, user.id);

    // Step 8: Commit sale
    const sale: Sale = {
      id: saleId,
      customer_id: customerId,
      items: saleItems,
      total_amount: saleItems.reduce((sum, i) => sum + i.subtotal, 0),
      created_by: user.id,
      created_at: new Date().toISOString(),
    };

    store.addSale(sale);
    return sale;
  },
};

// Inventory Movements (audit trail)
export const inventoryAPI = {
  getMovements(productId?: string): StockMovement[] {
    checkPermission('view_audit_logs');
    const movements = InventoryService.getMovements();
    if (productId) {
      return movements.filter(m => m.product_id === productId);
    }
    return movements.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
};

// Reports
export const reportsAPI = {
  getFinancialSummary() {
    checkPermission('view_reports');
    const sales = store.getSales();
    const purchases = store.getPurchases();
    const products = InventoryService.getProducts();

    const totalRevenue = sales.reduce((sum, s) => sum + s.total_amount, 0);
    const totalCost = purchases.reduce((sum, p) => sum + p.total_amount, 0);

    // Calculate COGS from sales
    let cogs = 0;
    for (const sale of sales) {
      for (const item of sale.items) {
        const product = products.find(p => p.id === item.product_id);
        if (product) {
          cogs += product.purchase_price * item.quantity;
        }
      }
    }

    return {
      total_revenue_bdt: totalRevenue,
      total_cost_of_goods_bdt: cogs,
      gross_profit_bdt: totalRevenue - cogs,
      profit_margin_pct: totalRevenue > 0 ? ((totalRevenue - cogs) / totalRevenue * 100) : 0,
      total_purchases_bdt: totalCost,
      total_sales_count: sales.length,
      avg_sale_value_bdt: sales.length > 0 ? totalRevenue / sales.length : 0,
    };
  },
  getTopProducts() {
    checkPermission('view_reports');
    const sales = store.getSales();
    const products = InventoryService.getProducts();
    const productSales: Record<string, { qty: number; revenue: number }> = {};

    for (const sale of sales) {
      for (const item of sale.items) {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = { qty: 0, revenue: 0 };
        }
        productSales[item.product_id].qty += item.quantity;
        productSales[item.product_id].revenue += item.subtotal;
      }
    }

    return Object.entries(productSales)
      .map(([productId, data]) => {
        const product = products.find(p => p.id === productId);
        return {
          product_name: product?.name || 'Unknown',
          quantity_sold: data.qty,
          revenue_bdt: data.revenue,
        };
      })
      .sort((a, b) => b.revenue_bdt - a.revenue_bdt);
  },
};

// Users (admin only)
export const usersAPI = {
  getAll(): User[] {
    checkPermission('manage_users');
    return store.getUsers();
  },
  create(data: { name: string; email: string; role: Role }): User {
    checkPermission('manage_users');
    const user: User = {
      ...data,
      id: uuidv4(),
      is_active: true,
      created_at: new Date().toISOString(),
    };
    store.addUser(user);
    return user;
  },
  update(id: string, data: Partial<User>): User {
    checkPermission('manage_users');
    const existing = store.getUsers().find(u => u.id === id);
    if (!existing) throw new Error('User not found');
    const updated = { ...existing, ...data };
    store.updateUser(updated);
    return updated;
  },
  delete(id: string): void {
    checkPermission('manage_users');
    store.deleteUser(id);
  },
};
