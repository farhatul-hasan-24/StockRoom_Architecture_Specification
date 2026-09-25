import React, { useState, useEffect } from 'react';
import { inventoryAPI, productsAPI } from '../services/api';
import { InventoryService } from '../services/InventoryService';
import { StockMovement, Product } from '../types';
import { ArrowUpRight, ArrowDownRight, AlertTriangle, Wrench, Filter } from 'lucide-react';

export default function InventoryMovements() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filterProduct, setFilterProduct] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    loadData();
    const unsub = InventoryService.subscribe(() => loadData());
    return () => { unsub(); };
  }, []);

  function loadData() {
    setProducts(productsAPI.getAll());
    try {
      setMovements(inventoryAPI.getMovements(filterProduct || undefined));
    } catch (e) {
      setMovements(InventoryService.getMovements().filter(m => !filterProduct || m.product_id === filterProduct));
    }
  }

  useEffect(() => { loadData(); }, [filterProduct]);

  const filtered = filterType ? movements.filter(m => m.movement_type === filterType) : movements;

  const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'Unknown';
  const getProductSku = (id: string) => products.find(p => p.id === id)?.sku || '-';

  const typeConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
    PURCHASE: { icon: ArrowDownRight, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Purchase' },
    SALE: { icon: ArrowUpRight, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Sale' },
    DAMAGED: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', label: 'Damaged' },
    ADJUSTMENT: { icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Adjustment' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Stock Movements</h1>
        <p className="text-gray-500 text-sm mt-1">Immutable audit trail — append-only ledger</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
            <option value="">All Products</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
          </select>
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
          <option value="">All Types</option>
          <option value="PURCHASE">Purchase</option>
          <option value="SALE">Sale</option>
          <option value="DAMAGED">Damaged</option>
          <option value="ADJUSTMENT">Adjustment</option>
        </select>
        <span className="self-center text-sm text-gray-500">{filtered.length} movements</span>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Qty Change</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Prev Stock</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">New Stock</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Reference</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const config = typeConfig[m.movement_type];
                const Icon = config.icon;
                return (
                  <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-500 text-xs">
                      {new Date(m.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{getProductName(m.product_id)}</p>
                      <p className="text-xs text-gray-400 font-mono">{getProductSku(m.product_id)}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                        <Icon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${m.quantity > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {m.quantity > 0 ? '+' : ''}{m.quantity}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">{m.prev_stock}</td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">{m.new_stock}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-mono text-gray-500">{m.ref_type}:{m.ref_id.slice(0, 8)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-12 text-gray-500">No movements found</div>}
      </div>
    </div>
  );
}
