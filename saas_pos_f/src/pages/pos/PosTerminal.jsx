import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Navbar } from '../../components/Navbar';
import { ReceiptModal } from '../../components/ReceiptModal';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  User,
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Clock,
  Package,
  Layers,
  Sparkles,
  Receipt,
  X,
} from 'lucide-react';

export const PosTerminal = () => {
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Cart state: [{ itemId, name, unitPrice, qty, maxStock }]
  const [cart, setCart] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // CASH, CARD, ONLINE

  // Checkout & Receipt
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  // Shift orders history drawer
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [shiftOrders, setShiftOrders] = useState([]);

  // New Customer Modal
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState({ name: '', mobile: '', email: '' });
  const [customerError, setCustomerError] = useState('');

  const fetchCatalogAndCustomers = async () => {
    try {
      setLoading(true);
      const [itemsRes, custRes] = await Promise.all([
        api.get('/api/pos/items'),
        api.get('/api/pos/customers'),
      ]);
      setItems(itemsRes.data);
      setCustomers(custRes.data);
    } catch (err) {
      console.error('Failed to load POS catalog', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchShiftOrders = async () => {
    try {
      const res = await api.get('/api/pos/orders');
      setShiftOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch order history', err);
    }
  };

  useEffect(() => {
    fetchCatalogAndCustomers();
  }, []);

  // Cart logic
  const addToCart = (item) => {
    if (item.currentStock <= 0) return;

    setCart((prev) => {
      const existing = prev.find((p) => p.itemId === item.itemId);
      if (existing) {
        if (existing.qty >= item.currentStock) {
          alert(`Cannot add more than ${item.currentStock} units in stock for ${item.name}`);
          return prev;
        }
        return prev.map((p) =>
          p.itemId === item.itemId ? { ...p, qty: p.qty + 1 } : p
        );
      }
      return [
        ...prev,
        {
          itemId: item.itemId,
          name: item.name,
          unitPrice: Number(item.unitPrice),
          qty: 1,
          maxStock: item.currentStock,
        },
      ];
    });
  };

  const updateQuantity = (itemId, change) => {
    setCart((prev) =>
      prev
        .map((p) => {
          if (p.itemId === itemId) {
            const nextQty = p.qty + change;
            if (nextQty > p.maxStock) {
              alert(`Maximum available stock is ${p.maxStock} units`);
              return p;
            }
            return { ...p, qty: nextQty };
          }
          return p;
        })
        .filter((p) => p.qty > 0)
    );
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((p) => p.itemId !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    setCheckoutError('');
  };

  const calculateTotal = () => {
    return cart.reduce((acc, curr) => acc + curr.unitPrice * curr.qty, 0);
  };

  // Checkout process
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutError('');
    setCheckoutLoading(true);

    try {
      const payload = {
        cusId: selectedCustomerId ? Number(selectedCustomerId) : null,
        paymentMethod: paymentMethod,
        items: cart.map((c) => ({
          itemId: c.itemId,
          qty: c.qty,
          unitPrice: c.unitPrice,
        })),
      };

      const res = await api.post('/api/pos/orders', payload);
      setCompletedOrder(res.data);
      clearCart();
      fetchCatalogAndCustomers(); // Refresh live stock counts
    } catch (err) {
      setCheckoutError(err.response?.data?.message || 'Checkout failed. Please check stock levels.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Quick Customer Creation
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setCustomerError('');
    try {
      const res = await api.post('/api/pos/customers', customerForm);
      setCustomers((prev) => [...prev, res.data]);
      setSelectedCustomerId(res.data.cusId);
      setIsNewCustomerOpen(false);
      setCustomerForm({ name: '', mobile: '', email: '' });
    } catch (err) {
      setCustomerError(err.response?.data?.message || 'Failed to create customer');
    }
  };

  const filteredItems = items.filter(
    (it) =>
      it.name?.toLowerCase().includes(search.toLowerCase()) ||
      it.description?.toLowerCase().includes(search.toLowerCase()) ||
      String(it.itemId).includes(search)
  );

  const grandTotal = calculateTotal();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Terminal Header & Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>POS Billing Terminal</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                LIVE
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Rapid barcode & catalog item selection with instant inventory batch deduction
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="pos-history-btn"
              onClick={() => {
                fetchShiftOrders();
                setIsHistoryOpen(true);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Shift Orders</span>
            </button>
            <button
              id="pos-refresh-catalog-btn"
              onClick={fetchCatalogAndCustomers}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh Catalog Stock"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Split Layout: Catalog Grid (Left 65%) vs Cart & Checkout (Right 35%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Product Catalog */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            {/* Search and Filter */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="pos-item-search-input"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search catalog by name, category, or item ID..."
                className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 shadow-lg backdrop-blur-xl transition-colors"
              />
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {filteredItems.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800/80">
                  <Package className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs">No matching products found.</p>
                </div>
              ) : (
                filteredItems.map((item, index) => {
                  const isOutOfStock = item.currentStock <= 0;
                  const inCartItem = cart.find((c) => c.itemId === item.itemId);
                  const isLowStock = item.currentStock > 0 && item.currentStock <= 5;

                  return (
                    <div
                      key={item.itemId}
                      className={`group relative bg-slate-900/80 border rounded-2xl p-4 flex flex-col justify-between backdrop-blur-xl transition-all duration-150 ${
                        isOutOfStock
                          ? 'border-slate-800/50 opacity-60'
                          : 'border-slate-800 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="font-mono text-[10px] text-slate-500 font-semibold">
                            #{index + 1}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isOutOfStock
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                : isLowStock
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}
                          >
                            {isOutOfStock
                              ? 'Out of Stock'
                              : `${item.currentStock} in stock`}
                          </span>
                        </div>

                        <h3 className="font-bold text-sm text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          {item.description || 'General retail stock item'}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-500 font-semibold uppercase">
                            Price
                          </div>
                          <div className="text-base font-extrabold text-white">
                            {formatCurrency(item.unitPrice)}
                          </div>
                        </div>

                        <button
                          id={`add-to-cart-${item.itemId}`}
                          onClick={() => addToCart(item)}
                          disabled={isOutOfStock}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            isOutOfStock
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              : inCartItem
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                              : 'bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{inCartItem ? `(${inCartItem.qty})` : 'Add'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: Real-time Invoice Cart */}
          <div className="lg:col-span-5 xl:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-xl sticky top-20 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-indigo-400" />
                <h2 className="font-bold text-sm text-white">Invoice Cart</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {cart.reduce((a, c) => a + c.qty, 0)} items
                </span>
              </div>
              {cart.length > 0 && (
                <button
                  id="pos-clear-cart-btn"
                  onClick={clearCart}
                  className="text-[11px] text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {/* Error banner */}
            {checkoutError && (
              <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{checkoutError}</span>
              </div>
            )}

            {/* Cart Items List */}
            <div className="mt-4 divide-y divide-slate-800/60 max-h-[280px] overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <ShoppingCart className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-xs">Your cart is empty.</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Click "Add" on any product to start invoice
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.itemId} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex-1 truncate">
                      <div className="font-semibold text-slate-200 truncate">{item.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {formatCurrency(item.unitPrice)} each
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                      <button
                        onClick={() => updateQuantity(item.itemId, -1)}
                        className="p-0.5 text-slate-400 hover:text-white transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-xs text-white min-w-[20px] text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.itemId, 1)}
                        className="p-0.5 text-slate-400 hover:text-white transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right min-w-[65px]">
                      <div className="font-bold text-white">
                        {formatCurrency(item.unitPrice * item.qty)}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.itemId)}
                        className="text-slate-500 hover:text-rose-400 p-0.5 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Customer Selector */}
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  Customer
                </span>
                <button
                  type="button"
                  id="pos-new-customer-btn"
                  onClick={() => setIsNewCustomerOpen(true)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  + New Customer
                </button>
              </div>

              <select
                id="pos-customer-select"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Walk-in Client (Default)</option>
                {customers.map((c) => (
                  <option key={c.cusId} value={c.cusId}>
                    {c.name} {c.mobile ? `(${c.mobile})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method Selector */}
            <div className="mt-3 space-y-1.5">
              <span className="text-xs font-semibold text-slate-400 block">
                Payment Method
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  id="pay-cash-btn"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                    paymentMethod === 'CASH'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5" />
                  <span>CASH</span>
                </button>

                <button
                  type="button"
                  id="pay-card-btn"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                    paymentMethod === 'CARD'
                      ? 'bg-blue-500/15 text-blue-400 border-blue-500/40 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>CARD</span>
                </button>

                <button
                  type="button"
                  id="pay-online-btn"
                  onClick={() => setPaymentMethod('ONLINE')}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                    paymentMethod === 'ONLINE'
                      ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR / DIGITAL</span>
                </button>
              </div>
            </div>

            {/* Total Breakdown & Checkout Button */}
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(grandTotal)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-dashed border-slate-800">
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  Grand Total
                </span>
                <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                  {formatCurrency(grandTotal)}
                </span>
              </div>

              <button
                id="pos-checkout-btn"
                onClick={handleCheckout}
                disabled={cart.length === 0 || checkoutLoading}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50 cursor-pointer"
              >
                {checkoutLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Complete Checkout & Print</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* QUICK NEW CUSTOMER MODAL */}
      {isNewCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Quick Add Customer</h3>
              <button
                onClick={() => setIsNewCustomerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-5 space-y-3 text-xs">
              {customerError && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                  {customerError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Full Name *</label>
                <input
                  id="customer-name-input"
                  type="text"
                  required
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Mobile / Phone</label>
                <input
                  id="customer-mobile-input"
                  type="text"
                  value={customerForm.mobile}
                  onChange={(e) => setCustomerForm({ ...customerForm, mobile: e.target.value })}
                  placeholder="555-0123"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Email</label>
                <input
                  id="customer-email-input"
                  type="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                  placeholder="client@mail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewCustomerOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  id="submit-customer-btn"
                  type="submit"
                  className="px-4 py-1.5 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
                >
                  Save & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SHIFT ORDERS DRAWER */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col p-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Shift Order History</h3>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 my-3">
              {shiftOrders.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No orders completed during this shift.
                </div>
              ) : (
                shiftOrders.map((o) => (
                  <div key={o.oId} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-mono text-indigo-400 font-bold">{o.reference}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {o.customerName} • {o.paymentMethod}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(o.date).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-white text-sm">
                        {formatCurrency(o.grandTotal)}
                      </div>
                      <button
                        onClick={() => {
                          setCompletedOrder(o);
                        }}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium mt-1 inline-flex items-center gap-1"
                      >
                        <Receipt className="w-3 h-3" />
                        <span>Receipt</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL ON CHECKOUT SUCCESS */}
      {completedOrder && (
        <ReceiptModal
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
        />
      )}
    </div>
  );
};
