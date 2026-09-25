import React, { useState, useEffect, useCallback } from 'react';
import { salesAPI, productsAPI, customersAPI } from '../services/api';
import { InventoryService } from '../services/InventoryService';
import { Product, Customer, CartItem, Sale } from '../types';
import { Search, ShoppingCart, Plus, Minus, Trash2, X, Check, AlertCircle, CreditCard, Banknote } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function POS() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [successSale, setSuccessSale] = useState<Sale | null>(null);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');

  useEffect(() => {
    loadData();
    const unsub = InventoryService.subscribe(() => loadData());
    return () => { unsub(); };
  }, []);

  function loadData() {
    setProducts(productsAPI.getAll().filter(p => p.status === 'active'));
    setCustomers(customersAPI.getAll());
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode.includes(search)
  );

  const addToCart = useCallback((product: Product) => {
    setError('');
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity + 1 > product.current_stock) {
          setError(`Insufficient stock for ${product.name}`);
          return prev;
        }
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      if (product.current_stock < 1) {
        setError(`${product.name} is out of stock`);
        return prev;
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = (productId: string, delta: number) => {
    setError('');
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return item;
        if (newQty > item.product.current_stock) {
          setError(`Insufficient stock. Max: ${item.product.current_stock}`);
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.selling_price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    setError('');
    try {
      const sale = salesAPI.checkout(
        selectedCustomer || null,
        cart
      );
      setSuccessSale(sale);
      setCart([]);
      setSelectedCustomer('');
      setShowCheckout(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Checkout failed');
    }
  };

  const getCustomerName = (id: string | null) => {
    if (!id) return 'Walk-in Customer';
    return customers.find(c => c.id === id)?.name || 'Unknown';
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Products Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">POS Terminal</h1>
          <p className="text-gray-500 text-sm mt-1">Search or scan barcode to add items</p>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products or scan barcode..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-lg"
          />
        </div>

        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 content-start">
          {filteredProducts.map(p => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              disabled={p.current_stock === 0}
              className={`p-3 rounded-xl border text-left transition hover:shadow-md ${
                p.current_stock === 0
                  ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                  : p.current_stock <= p.minimum_stock
                    ? 'bg-amber-50 border-amber-200 hover:border-amber-300'
                    : 'bg-white border-gray-200 hover:border-emerald-300'
              }`}
            >
              <p className="font-medium text-gray-900 text-sm truncate">{p.name}</p>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">{p.sku}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-emerald-600 font-bold text-sm">৳{p.selling_price}</span>
                <span className={`text-xs font-medium ${p.current_stock === 0 ? 'text-red-500' : 'text-gray-500'}`}>
                  {p.current_stock} {p.unit}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Panel */}
      <div className="lg:w-96 bg-white rounded-xl border border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Cart ({cartCount})
            </h2>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} className="text-xs text-red-500 hover:text-red-700">Clear</button>
            )}
          </div>

          {/* Customer Select */}
          <select
            value={selectedCustomer}
            onChange={e => setSelectedCustomer(e.target.value)}
            className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="">Walk-in Customer</option>
            {customers.filter(c => c.name !== 'Walk-in Customer').map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                  <p className="text-xs text-gray-500">৳{item.product.selling_price} × {item.quantity}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQuantity(item.product.id, -1)} className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-gray-200 hover:bg-gray-100">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, 1)} className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-gray-200 hover:bg-gray-100">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">৳{(item.product.selling_price * item.quantity).toLocaleString()}</p>
                  <button onClick={() => removeFromCart(item.product.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer */}
        <div className="p-4 border-t border-gray-200 space-y-3">
          <div className="flex items-center justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-emerald-600">৳{cartTotal.toLocaleString()}</span>
          </div>
          <button
            onClick={() => setShowCheckout(true)}
            disabled={cart.length === 0}
            className="w-full py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-lg"
          >
            Checkout
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Confirm Checkout</h2>
              <button onClick={() => setShowCheckout(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Customer: <span className="font-medium text-gray-900">{getCustomerName(selectedCustomer || null)}</span></p>
                <p className="text-sm text-gray-500">Items: <span className="font-medium text-gray-900">{cartCount}</span></p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2 max-h-40 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.product.name} × {item.quantity}</span>
                    <span className="font-medium">৳{(item.product.selling_price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xl font-bold pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-emerald-600">৳{cartTotal.toLocaleString()}</span>
              </div>

              {/* Payment Method */}
              <div className="flex gap-3">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition ${
                    paymentMethod === 'cash' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <Banknote className="w-5 h-5" /> Cash
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition ${
                    paymentMethod === 'card' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <CreditCard className="w-5 h-5" /> Card
                </button>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition"
              >
                Complete Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successSale && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm text-center p-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Sale Complete!</h2>
            <p className="text-gray-500 mb-1">Invoice #{successSale.id.slice(0, 8).toUpperCase()}</p>
            <p className="text-2xl font-bold text-emerald-600 mb-6">৳{successSale.total_amount.toLocaleString()}</p>
            <button
              onClick={() => setSuccessSale(null)}
              className="w-full py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition"
            >
              New Sale
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
