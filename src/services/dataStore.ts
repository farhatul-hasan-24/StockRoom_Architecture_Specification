import { v4 as uuidv4 } from 'uuid';
import {
  User, Category, Supplier, Customer, Product,
  Purchase, Sale, StockMovement
} from '../types';
import { InventoryService } from './InventoryService';

// ============================================================
// Seed Data — simulates PostgreSQL database
// ============================================================

const now = new Date().toISOString();
const yesterday = new Date(Date.now() - 86400000).toISOString();
const lastWeek = new Date(Date.now() - 604800000).toISOString();

export const seedUsers: User[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@stockroom.com', role: 'admin', is_active: true, created_at: lastWeek },
  { id: 'u2', name: 'Manager Khan', email: 'manager@stockroom.com', role: 'manager', is_active: true, created_at: lastWeek },
  { id: 'u3', name: 'Sales Staff Rahim', email: 'sales@stockroom.com', role: 'sales_staff', is_active: true, created_at: lastWeek },
];

export const seedCategories: Category[] = [
  { id: 'c1', name: 'Electronics', description: 'Electronic devices and accessories', created_at: lastWeek },
  { id: 'c2', name: 'Groceries', description: 'Food and household items', created_at: lastWeek },
  { id: 'c3', name: 'Clothing', description: 'Apparel and fashion items', created_at: lastWeek },
  { id: 'c4', name: 'Stationery', description: 'Office and school supplies', created_at: lastWeek },
];

export const seedSuppliers: Supplier[] = [
  { id: 's1', company_name: 'Dhaka Electronics Ltd.', contact_person: 'Karim Ahmed', phone: '01711000001', email: 'karim@dhakaelectronics.com', address: 'Gulshan-2, Dhaka', status: 'active' },
  { id: 's2', company_name: 'Fresh Foods BD', contact_person: 'Nasreen Akter', phone: '01711000002', email: 'nasreen@freshfoods.com', address: 'Dhanmondi, Dhaka', status: 'active' },
  { id: 's3', company_name: 'Chittagong Textiles', contact_person: 'Mohammad Ali', phone: '01711000003', email: 'ali@ctextiles.com', address: 'Agrabad, Chittagong', status: 'active' },
  { id: 's4', company_name: 'Office Supplies Co.', contact_person: 'Farhana Rahman', phone: '01711000004', email: 'farhana@officesupplies.com', address: 'Uttara, Dhaka', status: 'inactive' },
];

export const seedCustomers: Customer[] = [
  { id: 'cust1', name: 'Walk-in Customer', phone: '', email: '', address: '', created_at: lastWeek },
  { id: 'cust2', name: 'Rafiq Enterprises', phone: '01811000001', email: 'rafiq@enterprise.com', address: 'Mirpur, Dhaka', created_at: lastWeek },
  { id: 'cust3', name: 'Sultana Trading', phone: '01811000002', email: 'sultana@trading.com', address: 'Savar, Dhaka', created_at: yesterday },
  { id: 'cust4', name: 'Hasan Corporation', phone: '01811000003', email: 'hasan@corp.com', address: 'Narayanganj', created_at: yesterday },
];

export const seedProducts: Product[] = [
  { id: 'p1', sku: 'ELEC-001', barcode: '8901234567890', name: 'USB-C Charging Cable', category_id: 'c1', supplier_id: 's1', purchase_price: 150, selling_price: 299, current_stock: 45, minimum_stock: 10, unit: 'pcs', image_url: '', status: 'active' },
  { id: 'p2', sku: 'ELEC-002', barcode: '8901234567891', name: 'Wireless Mouse', category_id: 'c1', supplier_id: 's1', purchase_price: 450, selling_price: 799, current_stock: 22, minimum_stock: 5, unit: 'pcs', image_url: '', status: 'active' },
  { id: 'p3', sku: 'ELEC-003', barcode: '8901234567892', name: 'Bluetooth Speaker', category_id: 'c1', supplier_id: 's1', purchase_price: 800, selling_price: 1499, current_stock: 8, minimum_stock: 5, unit: 'pcs', image_url: '', status: 'active' },
  { id: 'p4', sku: 'GROC-001', barcode: '8901234567893', name: 'Basmati Rice (5kg)', category_id: 'c2', supplier_id: 's2', purchase_price: 380, selling_price: 520, current_stock: 60, minimum_stock: 15, unit: 'bags', image_url: '', status: 'active' },
  { id: 'p5', sku: 'GROC-002', barcode: '8901234567894', name: 'Sunflower Oil (1L)', category_id: 'c2', supplier_id: 's2', purchase_price: 180, selling_price: 240, current_stock: 3, minimum_stock: 10, unit: 'bottles', image_url: '', status: 'active' },
  { id: 'p6', sku: 'GROC-003', barcode: '8901234567895', name: 'Sugar (1kg)', category_id: 'c2', supplier_id: 's2', purchase_price: 95, selling_price: 130, current_stock: 0, minimum_stock: 20, unit: 'packets', image_url: '', status: 'active' },
  { id: 'p7', sku: 'CLTH-001', barcode: '8901234567896', name: 'Cotton T-Shirt (M)', category_id: 'c3', supplier_id: 's3', purchase_price: 250, selling_price: 499, current_stock: 35, minimum_stock: 10, unit: 'pcs', image_url: '', status: 'active' },
  { id: 'p8', sku: 'CLTH-002', barcode: '8901234567897', name: 'Denim Jeans (32)', category_id: 'c3', supplier_id: 's3', purchase_price: 800, selling_price: 1450, current_stock: 18, minimum_stock: 5, unit: 'pcs', image_url: '', status: 'active' },
  { id: 'p9', sku: 'STAT-001', barcode: '8901234567898', name: 'A4 Paper (500 sheets)', category_id: 'c4', supplier_id: 's4', purchase_price: 280, selling_price: 420, current_stock: 50, minimum_stock: 10, unit: 'reams', image_url: '', status: 'active' },
  { id: 'p10', sku: 'STAT-002', barcode: '8901234567899', name: 'Ballpoint Pen (Box 12)', category_id: 'c4', supplier_id: 's4', purchase_price: 60, selling_price: 120, current_stock: 120, minimum_stock: 20, unit: 'boxes', image_url: '', status: 'active' },
];

export const seedPurchases: Purchase[] = [
  { id: 'po1', supplier_id: 's1', items: [{ id: uuidv4(), product_id: 'p1', quantity: 50, unit_cost: 150 }, { id: uuidv4(), product_id: 'p2', quantity: 25, unit_cost: 450 }], total_amount: 18750, created_by: 'u1', created_at: lastWeek },
  { id: 'po2', supplier_id: 's2', items: [{ id: uuidv4(), product_id: 'p4', quantity: 100, unit_cost: 380 }, { id: uuidv4(), product_id: 'p5', quantity: 50, unit_cost: 180 }], total_amount: 47000, created_by: 'u1', created_at: lastWeek },
];

export const seedSales: Sale[] = [
  { id: 'sale1', customer_id: 'cust2', items: [{ id: uuidv4(), product_id: 'p1', quantity: 5, unit_price: 299, subtotal: 1495 }, { id: uuidv4(), product_id: 'p2', quantity: 2, unit_price: 799, subtotal: 1598 }], total_amount: 3093, created_by: 'u3', created_at: yesterday },
  { id: 'sale2', customer_id: null, items: [{ id: uuidv4(), product_id: 'p4', quantity: 3, unit_price: 520, subtotal: 1560 }, { id: uuidv4(), product_id: 'p10', quantity: 10, unit_price: 120, subtotal: 1200 }], total_amount: 2760, created_by: 'u3', created_at: yesterday },
  { id: 'sale3', customer_id: 'cust3', items: [{ id: uuidv4(), product_id: 'p7', quantity: 4, unit_price: 499, subtotal: 1996 }, { id: uuidv4(), product_id: 'p8', quantity: 2, unit_price: 1450, subtotal: 2900 }], total_amount: 4896, created_by: 'u2', created_at: now },
];

export const seedMovements: StockMovement[] = [
  { id: 'm1', product_id: 'p1', movement_type: 'PURCHASE', quantity: 50, prev_stock: 0, new_stock: 50, ref_type: 'purchase', ref_id: 'po1', created_by: 'u1', created_at: lastWeek },
  { id: 'm2', product_id: 'p2', movement_type: 'PURCHASE', quantity: 25, prev_stock: 0, new_stock: 25, ref_type: 'purchase', ref_id: 'po1', created_by: 'u1', created_at: lastWeek },
  { id: 'm3', product_id: 'p4', movement_type: 'PURCHASE', quantity: 100, prev_stock: 0, new_stock: 100, ref_type: 'purchase', ref_id: 'po2', created_by: 'u1', created_at: lastWeek },
  { id: 'm4', product_id: 'p5', movement_type: 'PURCHASE', quantity: 50, prev_stock: 0, new_stock: 50, ref_type: 'purchase', ref_id: 'po2', created_by: 'u1', created_at: lastWeek },
  { id: 'm5', product_id: 'p1', movement_type: 'SALE', quantity: -5, prev_stock: 50, new_stock: 45, ref_type: 'sale', ref_id: 'sale1', created_by: 'u3', created_at: yesterday },
  { id: 'm6', product_id: 'p2', movement_type: 'SALE', quantity: -2, prev_stock: 25, new_stock: 23, ref_type: 'sale', ref_id: 'sale1', created_by: 'u3', created_at: yesterday },
  { id: 'm7', product_id: 'p4', movement_type: 'SALE', quantity: -3, prev_stock: 100, new_stock: 97, ref_type: 'sale', ref_id: 'sale2', created_by: 'u3', created_at: yesterday },
  { id: 'm8', product_id: 'p10', movement_type: 'SALE', quantity: -10, prev_stock: 130, new_stock: 120, ref_type: 'sale', ref_id: 'sale2', created_by: 'u3', created_at: yesterday },
];

// Initialize InventoryService with seed data
InventoryService.setProducts(seedProducts);
InventoryService.setMovements(seedMovements);

// ============================================================
// Data Store — simulates database tables
// ============================================================

class DataStore {
  users: User[] = [...seedUsers];
  categories: Category[] = [...seedCategories];
  suppliers: Supplier[] = [...seedSuppliers];
  customers: Customer[] = [...seedCustomers];
  purchases: Purchase[] = [...seedPurchases];
  sales: Sale[] = [...seedSales];

  // Users
  getUsers() { return [...this.users]; }
  addUser(user: User) { this.users.push(user); }
  updateUser(user: User) { this.users = this.users.map(u => u.id === user.id ? user : u); }
  deleteUser(id: string) { this.users = this.users.filter(u => u.id !== id); }

  // Categories
  getCategories() { return [...this.categories]; }
  addCategory(cat: Category) { this.categories.push(cat); }
  updateCategory(cat: Category) { this.categories = this.categories.map(c => c.id === cat.id ? cat : c); }
  deleteCategory(id: string) { this.categories = this.categories.filter(c => c.id !== id); }

  // Suppliers
  getSuppliers() { return [...this.suppliers]; }
  addSupplier(s: Supplier) { this.suppliers.push(s); }
  updateSupplier(s: Supplier) { this.suppliers = this.suppliers.map(x => x.id === s.id ? s : x); }
  deleteSupplier(id: string) { this.suppliers = this.suppliers.filter(s => s.id !== id); }

  // Customers
  getCustomers() { return [...this.customers]; }
  addCustomer(c: Customer) { this.customers.push(c); }
  updateCustomer(c: Customer) { this.customers = this.customers.map(x => x.id === c.id ? c : x); }
  deleteCustomer(id: string) { this.customers = this.customers.filter(c => c.id !== id); }

  // Purchases
  getPurchases() { return [...this.purchases]; }
  addPurchase(p: Purchase) { this.purchases.push(p); }

  // Sales
  getSales() { return [...this.sales]; }
  addSale(s: Sale) { this.sales.push(s); }
}

export const store = new DataStore();
