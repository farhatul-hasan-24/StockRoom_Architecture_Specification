import React, { useState, useEffect } from 'react';
import { purchasesAPI, suppliersAPI, productsAPI } from '../services/api';
import { InventoryService } from '../services/InventoryService';
import { Purchase, Supplier, Product } from '../types';
import { Plus, X, Package, Truck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Purchases() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission('manage_suppliers');
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [supplierId, setSupplierId] = useState('');
  const [items, setItems] = useState<Array<{ product_id: string; quantity: number; unit_cost: number }>>([]);

  useEffect(() => {
    loadData();
    const unsub = InventoryService.subscribe(() => loadData());
    return () => { unsub(); };
  }, []);

  function loadData() {
    setPurchases(purchasesAPI.getAll());
    setSuppliers(suppliersAPI.getAll());
    setProducts(productsAPI.getAll());
  }

  const getSupplierName = (id: string) => suppliers.find(s => s.id === id)?.company_name || '-';
  const getProductName = (id: string) => products.find(p => p.id === id)?.name || '-';

  const addItem = () => {
    setItems([...items, { product_id: products[0]?.id || '', quantity: 1, unit_cost: 0 }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      if (product) updated[index].unit_cost = product.purchase_price;
    }
    setItems(updated);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || items.length === 0) return;
    purchasesAPI.create(supplierId, items);
    setShowModal(false);
    setItems([]);
    setSupplierId('');
    loadData();
  };

  const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.unit_cost, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-500 text-sm mt-1">{purchases.length} purchases recorded</p>
        </div>
        {canManage && (
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">
            <Plus className="w-4 h-4" /> New Purchase
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">PO ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Supplier</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Items</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Total</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map(p => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-xs text-gray-600">{p.id.slice(0, 8).toUpperCase()}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{getSupplierName(p.supplier_id)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{p.items.length} items</td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">৳{p.total_amount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {purchases.length === 0 && <div className="text-center py-12 text-gray-500">No purchases yet</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">New Purchase Order</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                <select required value={supplierId} onChange={e => setSupplierId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value="">Select supplier</option>
                  {suppliers.filter(s => s.status === 'active').map(s => <option key={s.id} value={s.id}>{s.company_name}</option>)}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Items</label>
                  <button type="button" onClick={addItem} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">+ Add Item</button>
                </div>
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <select value={item.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)} className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm">
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <input type="number" min="1" value={item.quantity} onChange={e => updateItem(i, 'quantity', +e.target.value)} placeholder="Qty" className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm" />
                      <input type="number" min="0" step="0.01" value={item.unit_cost} onChange={e => updateItem(i, 'unit_cost', +e.target.value)} placeholder="Cost" className="w-24 px-2 py-1.5 border border-gray-300 rounded text-sm" />
                      <button type="button" onClick={() => removeItem(i)} className="p-1 text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {items.length > 0 && (
                <div className="text-right text-lg font-bold text-gray-900">
                  Total: ৳{totalAmount.toLocaleString()}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={!supplierId || items.length === 0} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">Create Purchase</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
