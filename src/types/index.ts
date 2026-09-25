export type Role = 'admin' | 'manager' | 'sales_staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Supplier {
  id: string;
  company_name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  status: 'active' | 'inactive';
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  created_at: string;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category_id: string;
  supplier_id: string;
  purchase_price: number;
  selling_price: number;
  current_stock: number;
  minimum_stock: number;
  unit: string;
  image_url: string;
  status: 'active' | 'inactive';
}

export interface PurchaseItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
}

export interface Purchase {
  id: string;
  supplier_id: string;
  items: PurchaseItem[];
  total_amount: number;
  created_by: string;
  created_at: string;
}

export interface SaleItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  customer_id: string | null;
  items: SaleItem[];
  total_amount: number;
  created_by: string;
  created_at: string;
}

export type MovementType = 'PURCHASE' | 'SALE' | 'DAMAGED' | 'ADJUSTMENT';

export interface StockMovement {
  id: string;
  product_id: string;
  movement_type: MovementType;
  quantity: number;
  prev_stock: number;
  new_stock: number;
  ref_type: string;
  ref_id: string;
  created_by: string;
  created_at: string;
}

export interface DashboardSummary {
  total_products: number;
  low_stock_alerts: number;
  out_of_stock: number;
  today_sales_bdt: number;
  total_revenue_bdt: number;
  total_purchases_bdt: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type Permission = 
  | 'view_dashboard'
  | 'manage_products'
  | 'view_products'
  | 'manage_suppliers'
  | 'view_suppliers'
  | 'process_sales'
  | 'view_sales'
  | 'view_reports'
  | 'view_audit_logs'
  | 'manage_users';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    'view_dashboard', 'manage_products', 'view_products',
    'manage_suppliers', 'view_suppliers', 'process_sales',
    'view_sales', 'view_reports', 'view_audit_logs', 'manage_users'
  ],
  manager: [
    'view_dashboard', 'manage_products', 'view_products',
    'manage_suppliers', 'view_suppliers', 'process_sales',
    'view_sales', 'view_reports'
  ],
  sales_staff: [
    'view_dashboard', 'view_products', 'view_suppliers',
    'process_sales', 'view_sales'
  ],
};
