import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../services/api';
import { DollarSign, TrendingUp, ShoppingBag, Percent, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Reports() {
  const [financial, setFinancial] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    try {
      setFinancial(reportsAPI.getFinancialSummary());
      setTopProducts(reportsAPI.getTopProducts());
    } catch (e) { /* ignore */ }
  }, []);

  if (!financial) return <div className="flex items-center justify-center h-64"><p className="text-gray-500">No access to reports</p></div>;

  const summaryCards = [
    { label: 'Total Revenue', value: `৳${financial.total_revenue_bdt.toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-500', bgLight: 'bg-emerald-50' },
    { label: 'Cost of Goods', value: `৳${financial.total_cost_of_goods_bdt.toLocaleString()}`, icon: ShoppingBag, color: 'bg-blue-500', bgLight: 'bg-blue-50' },
    { label: 'Gross Profit', value: `৳${financial.gross_profit_bdt.toLocaleString()}`, icon: TrendingUp, color: 'bg-purple-500', bgLight: 'bg-purple-50' },
    { label: 'Profit Margin', value: `${financial.profit_margin_pct.toFixed(1)}%`, icon: Percent, color: 'bg-amber-500', bgLight: 'bg-amber-50' },
    { label: 'Total Sales', value: financial.total_sales_count.toString(), icon: BarChart3, color: 'bg-indigo-500', bgLight: 'bg-indigo-50' },
    { label: 'Avg Sale Value', value: `৳${financial.avg_sale_value_bdt.toFixed(0)}`, icon: DollarSign, color: 'bg-pink-500', bgLight: 'bg-pink-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
        <p className="text-gray-500 text-sm mt-1">Revenue, profit, and performance analytics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryCards.map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5">
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

      {/* Top Products Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products by Revenue</h3>
        {topProducts.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `৳${v}`} />
              <YAxis type="category" dataKey="product_name" width={150} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => [`৳${value.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue_bdt" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">No sales data available</p>
        )}
      </div>

      {/* Top Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Product Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">#</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Qty Sold</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-400 font-medium">{i + 1}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{p.product_name}</td>
                  <td className="py-3 px-4 text-right text-gray-600">{p.quantity_sold}</td>
                  <td className="py-3 px-4 text-right font-semibold text-emerald-600">৳{p.revenue_bdt.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {topProducts.length === 0 && <div className="text-center py-12 text-gray-500">No data</div>}
      </div>
    </div>
  );
}
