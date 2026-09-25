import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { InventoryService } from '../services/InventoryService';
import { DashboardSummary } from '../types';
import { Package, AlertTriangle, XCircle, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [salesChart, setSalesChart] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    const unsub = InventoryService.subscribe(() => { loadData(); });
    return () => { unsub(); };
  }, []);

  function loadData() {
    try {
      setSummary(dashboardAPI.getSummary());
      setSalesChart(dashboardAPI.getSalesChartData());
      setCategoryData(dashboardAPI.getCategoryData());
      const products = InventoryService.getProducts();
      setLowStockProducts(
        products.filter(p => p.current_stock <= p.minimum_stock && p.current_stock > 0)
          .sort((a, b) => (a.current_stock / a.minimum_stock) - (b.current_stock / b.minimum_stock))
      );
    } catch (e) { /* ignore permission errors */ }
  }

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (!summary) return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Loading...</p></div>;

  const kpiCards = [
    { label: 'Total Products', value: summary.total_products, icon: Package, color: 'bg-blue-500', bgLight: 'bg-blue-50' },
    { label: 'Low Stock Alerts', value: summary.low_stock_alerts, icon: AlertTriangle, color: 'bg-amber-500', bgLight: 'bg-amber-50' },
    { label: 'Out of Stock', value: summary.out_of_stock, icon: XCircle, color: 'bg-red-500', bgLight: 'bg-red-50' },
    { label: "Today's Sales", value: `৳${summary.today_sales_bdt.toLocaleString()}`, icon: TrendingUp, color: 'bg-emerald-500', bgLight: 'bg-emerald-50' },
    { label: 'Total Revenue', value: `৳${summary.total_revenue_bdt.toLocaleString()}`, icon: DollarSign, color: 'bg-purple-500', bgLight: 'bg-purple-50' },
    { label: 'Total Purchases', value: `৳${summary.total_purchases_bdt.toLocaleString()}`, icon: ShoppingBag, color: 'bg-indigo-500', bgLight: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your inventory and sales performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`${card.bgLight} p-3 rounded-xl`}>
                <card.icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salesChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => [`৳${value.toLocaleString()}`, 'Sales']} />
              <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Value by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="stockValue"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {categoryData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`৳${value.toLocaleString()}`, 'Value']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Low Stock Alerts
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-600">Product</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-600">SKU</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">Current Stock</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">Min. Stock</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map(p => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2.5 px-3 font-medium text-gray-900">{p.name}</td>
                    <td className="py-2.5 px-3 text-gray-500 font-mono text-xs">{p.sku}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-amber-600">{p.current_stock}</td>
                    <td className="py-2.5 px-3 text-right text-gray-500">{p.minimum_stock}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.current_stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {p.current_stock === 0 ? 'Out of Stock' : 'Low Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
