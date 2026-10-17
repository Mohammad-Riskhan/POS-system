import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Navbar } from '../../components/Navbar';
import { ReceiptModal } from '../../components/ReceiptModal';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Truck,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Layers,
  Calendar,
  Edit2,
  Trash2,
  X,
  RefreshCw,
  Eye,
  FileText,
} from 'lucide-react';

export const BusinessDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, cashiers, inventory, suppliers, orders
  const [analytics, setAnalytics] = useState(null);
  const [cashiers, setCashiers] = useState([]);
  const [items, setItems] = useState([]);
  const [batches, setBatches] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCashierModalOpen, setIsCashierModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);

  // Form states
  const [cashierForm, setCashierForm] = useState({ uName: '', uEmail: '', uPassword: '' });
  const [itemForm, setItemForm] = useState({ name: '', description: '' });
  const [batchForm, setBatchForm] = useState({ itemId: '', sId: '', qty: '', unitPrice: '' });
  const [supplierForm, setSupplierForm] = useState({ sName: '', mobile: '', address: '' });

  const [formError, setFormError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [analyticsRes, cashiersRes, itemsRes, batchesRes, suppliersRes, ordersRes] = await Promise.all([
        api.get('/api/business/analytics'),
        api.get('/api/business/staff'),
        api.get('/api/business/items'),
        api.get('/api/business/batches'),
        api.get('/api/business/suppliers'),
        api.get('/api/pos/orders'),
      ]);
      setAnalytics(analyticsRes.data);
      setCashiers(cashiersRes.data);
      setItems(itemsRes.data);
      setBatches(batchesRes.data);
      setSuppliers(suppliersRes.data);
      setOrders(ordersRes.data);
    } catch (err) {
      console.error('Failed to load business dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Cashier handlers
  const handleCreateCashier = async (e) => {
    e.preventDefault();
    setFormError('');
    setActionLoading(true);
    try {
      await api.post('/api/business/staff', cashierForm);
      setIsCashierModalOpen(false);
      setCashierForm({ uName: '', uEmail: '', uPassword: '' });
      fetchAll();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create cashier');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleCashierStatus = async (cashierId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      await api.patch(`/api/business/staff/${cashierId}/status`, { status: newStatus });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update cashier status');
    }
  };

  const handleDeleteCashier = async (cashierId, name) => {
    if (!window.confirm(`Are you sure you want to delete cashier "${name}"?`)) return;
    try {
      await api.delete(`/api/business/staff/${cashierId}`);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete cashier');
    }
  };

  // Item handlers
  const handleCreateItem = async (e) => {
    e.preventDefault();
    setFormError('');
    setActionLoading(true);
    try {
      await api.post('/api/business/items', itemForm);
      setIsItemModalOpen(false);
      setItemForm({ name: '', description: '' });
      fetchAll();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create item');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteItem = async (itemId, name) => {
    if (!window.confirm(`Are you sure you want to delete item "${name}"?`)) return;
    try {
      await api.delete(`/api/business/items/${itemId}`);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item');
    }
  };

  // Batch handlers
  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setFormError('');
    setActionLoading(true);
    try {
      await api.post('/api/business/batches', {
        itemId: Number(batchForm.itemId),
        sId: Number(batchForm.sId),
        qty: Number(batchForm.qty),
        unitPrice: Number(batchForm.unitPrice),
      });
      setIsBatchModalOpen(false);
      setBatchForm({ itemId: '', sId: '', qty: '', unitPrice: '' });
      fetchAll();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to register incoming batch');
    } finally {
      setActionLoading(false);
    }
  };

  // Supplier handlers
  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    setFormError('');
    setActionLoading(true);
    try {
      await api.post('/api/business/suppliers', supplierForm);
      setIsSupplierModalOpen(false);
      setSupplierForm({ sName: '', mobile: '', address: '' });
      fetchAll();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create supplier');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSupplier = async (sId, name) => {
    if (!window.confirm(`Are you sure you want to delete supplier "${name}"?`)) return;
    try {
      await api.delete(`/api/business/suppliers/${sId}`);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete supplier');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Business Management Center
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Store analytics, inventory control, cashier operations, and batch tracking
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              id="biz-refresh-btn"
              onClick={fetchAll}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs font-semibold">
          <button
            id="tab-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'analytics'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Sales & Analytics</span>
          </button>

          <button
            id="tab-cashiers"
            onClick={() => setActiveTab('cashiers')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'cashiers'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Cashier Staff ({cashiers.length})</span>
          </button>

          <button
            id="tab-inventory"
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'inventory'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Inventory & Batches</span>
          </button>

          <button
            id="tab-suppliers"
            onClick={() => setActiveTab('suppliers')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'suppliers'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Suppliers ({suppliers.length})</span>
          </button>

          <button
            id="tab-orders"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'orders'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Orders History ({orders.length})</span>
          </button>
        </div>

        {/* TAB 1: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Total Revenue
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-extrabold text-white">
                    {formatCurrency(analytics?.totalRevenue)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Total revenue collected</p>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Completed Orders
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-extrabold text-white">
                    {analytics?.totalOrders ?? 0}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">POS terminal checkouts</p>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Inventory Items
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-extrabold text-white">
                    {analytics?.totalItems ?? 0}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Active catalog products</p>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Active Cashiers
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-extrabold text-white">
                    {analytics?.totalCashiers ?? 0}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Authorized terminal staff</p>
                </div>
              </div>
            </div>

            {/* Low Stock Alerts & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Low Stock Alerts */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">Low Stock Alerts</h3>
                  </div>
                  <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    {analytics?.lowStockItems?.length ?? 0} Items
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[350px] overflow-y-auto">
                  {!analytics?.lowStockItems || analytics.lowStockItems.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">
                      All item batches have adequate stock levels!
                    </p>
                  ) : (
                    analytics.lowStockItems.map((item) => (
                      <div
                        key={item.itemId}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-200 truncate max-w-[160px]">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            ID: #{item.itemId}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                            {item.currentStock} left
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">Recent POS Transactions</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    View All Orders →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Reference</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Payment</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3 text-right">Grand Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-slate-300">
                      {!analytics?.recentOrders || analytics.recentOrders.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-6 text-center text-slate-500">
                            No transactions recorded yet.
                          </td>
                        </tr>
                      ) : (
                        analytics.recentOrders.map((ord) => (
                          <tr key={ord.oId} className="hover:bg-slate-800/20">
                            <td className="py-2.5 px-3 font-mono text-slate-300">
                              {ord.reference}
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-200">
                              {ord.customerName}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-emerald-400">
                              {ord.paymentMethod}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500">
                              {new Date(ord.date).toLocaleDateString()}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-white">
                              {formatCurrency(ord.grandTotal)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CASHIERS */}
        {activeTab === 'cashiers' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
            <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Cashier Staff Access</h2>
                <p className="text-xs text-slate-400">
                  Manage POS cashier credentials scoped directly to your business account
                </p>
              </div>
              <button
                id="biz-add-cashier-btn"
                onClick={() => {
                  setFormError('');
                  setIsCashierModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Cashier</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Cashier Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {cashiers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-500">
                        No cashiers created yet. Click "Add Cashier" above.
                      </td>
                    </tr>
                  ) : (
                    cashiers.map((c, index) => (
                      <tr key={c.uId} className="hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-mono text-slate-400">#{index + 1}</td>
                        <td className="py-3 px-4 font-semibold text-white">{c.uName}</td>
                        <td className="py-3 px-4 text-slate-300">{c.uEmail}</td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {c.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleCashierStatus(c.uId, c.status)}
                            className="cursor-pointer"
                            title="Click to toggle status"
                          >
                            {c.status === 'ACTIVE' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <CheckCircle className="w-3 h-3" />
                                ACTIVE
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                <XCircle className="w-3 h-3" />
                                DISABLED
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteCashier(c.uId, c.uName)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete Cashier"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: INVENTORY & BATCHES */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Catalog Items Section */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl">
              <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-white">Product Catalog</h2>
                  <p className="text-xs text-slate-400">Products sold at the POS terminal</p>
                </div>
                <button
                  id="biz-add-item-btn"
                  onClick={() => {
                    setFormError('');
                    setIsItemModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product Item</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Stock on Hand</th>
                      <th className="py-3 px-4">Active Price</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-6 text-center text-slate-500">
                          No items in catalog.
                        </td>
                      </tr>
                    ) : (
                      items.map((it, index) => (
                        <tr key={it.itemId} className="hover:bg-slate-800/30">
                          <td className="py-3 px-4 font-mono text-slate-400">#{index + 1}</td>
                          <td className="py-3 px-4 font-bold text-white">{it.name}</td>
                          <td className="py-3 px-4 text-slate-400 truncate max-w-xs">{it.description || '—'}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-bold ${
                                it.currentStock > 10
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-rose-500/10 text-rose-400'
                              }`}
                            >
                              {it.currentStock} Units
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-emerald-400">
                            {formatCurrency(it.unitPrice)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteItem(it.itemId, it.name)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inventory Batches Section */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl">
              <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-white">Stock Batches</h2>
                  <p className="text-xs text-slate-400">Incoming inventory with specific supplier and unit pricing</p>
                </div>
                <button
                  id="biz-add-batch-btn"
                  onClick={() => {
                    setFormError('');
                    setIsBatchModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Receive Incoming Batch</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Product Item</th>
                      <th className="py-3 px-4">Supplier</th>
                      <th className="py-3 px-4">Remaining Qty</th>
                      <th className="py-3 px-4">Unit Price</th>
                      <th className="py-3 px-4">Date Received</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {batches.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-6 text-center text-slate-500">
                          No batches registered yet.
                        </td>
                      </tr>
                    ) : (
                      batches.map((bt, index) => (
                        <tr key={bt.btId} className="hover:bg-slate-800/30">
                          <td className="py-3 px-4 font-mono text-slate-400">BATCH-{index + 1}</td>
                          <td className="py-3 px-4 font-bold text-white">{bt.itemName}</td>
                          <td className="py-3 px-4 text-slate-300">{bt.supplierName}</td>
                          <td className="py-3 px-4 font-semibold text-cyan-400">{bt.qty}</td>
                          <td className="py-3 px-4 font-bold text-emerald-400">
                            {formatCurrency(bt.unitPrice)}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {new Date(bt.date).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SUPPLIERS */}
        {activeTab === 'suppliers' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl">
            <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Registered Suppliers</h2>
                <p className="text-xs text-slate-400">Supply vendors providing batch shipments</p>
              </div>
              <button
                id="biz-add-supplier-btn"
                onClick={() => {
                  setFormError('');
                  setIsSupplierModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Supplier</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Supplier Name</th>
                    <th className="py-3 px-4">Mobile</th>
                    <th className="py-3 px-4">Address</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {suppliers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-500">
                        No suppliers registered yet.
                      </td>
                    </tr>
                  ) : (
                    suppliers.map((s, index) => (
                      <tr key={s.sId} className="hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-mono text-slate-400">#{index + 1}</td>
                        <td className="py-3 px-4 font-bold text-white">{s.sName}</td>
                        <td className="py-3 px-4 text-slate-300">{s.mobile || '—'}</td>
                        <td className="py-3 px-4 text-slate-400">{s.address || '—'}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteSupplier(s.sId, s.sName)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: ORDERS HISTORY */}
        {activeTab === 'orders' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl">
            <div className="p-5 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">Full Sales & Order History</h2>
              <p className="text-xs text-slate-400">All completed billing transactions and invoices</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Invoice Ref</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Items Count</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Date Time</th>
                    <th className="py-3 px-4">Grand Total</th>
                    <th className="py-3 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-slate-500">
                        No orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o, index) => (
                      <tr key={o.oId} className="hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-mono text-slate-400">#{index + 1}</td>
                        <td className="py-3 px-4 font-mono text-indigo-400 font-bold">{o.reference}</td>
                        <td className="py-3 px-4 font-medium text-slate-200">{o.customerName}</td>
                        <td className="py-3 px-4 text-slate-400">{o.items?.length || 0} line items</td>
                        <td className="py-3 px-4 font-bold text-emerald-400">{o.paymentMethod}</td>
                        <td className="py-3 px-4 text-slate-500">{new Date(o.date).toLocaleString()}</td>
                        <td className="py-3 px-4 font-extrabold text-white">
                          {formatCurrency(o.grandTotal)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedReceiptOrder(o)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: ADD CASHIER */}
      {isCashierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Provision Cashier Account</h3>
              <button
                onClick={() => setIsCashierModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCashier} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                  {formError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Cashier Full Name *</label>
                <input
                  id="cashier-name-input"
                  type="text"
                  required
                  value={cashierForm.uName}
                  onChange={(e) => setCashierForm({ ...cashierForm, uName: e.target.value })}
                  placeholder="e.g. Jordan Lee"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Cashier Email *</label>
                <input
                  id="cashier-email-input"
                  type="email"
                  required
                  value={cashierForm.uEmail}
                  onChange={(e) => setCashierForm({ ...cashierForm, uEmail: e.target.value })}
                  placeholder="cashier@store.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Password *</label>
                <input
                  id="cashier-password-input"
                  type="password"
                  required
                  minLength={6}
                  value={cashierForm.uPassword}
                  onChange={(e) => setCashierForm({ ...cashierForm, uPassword: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCashierModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  id="submit-cashier-btn"
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
                >
                  {actionLoading ? 'Creating...' : 'Create Cashier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PRODUCT ITEM */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Add Product to Catalog</h3>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                  {formError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Product Name *</label>
                <input
                  id="item-name-input"
                  type="text"
                  required
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="e.g. Wireless Headset"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  id="item-desc-input"
                  rows={3}
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  placeholder="Optional details, specs or category"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  id="submit-item-btn"
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
                >
                  {actionLoading ? 'Saving...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD BATCH */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Receive Inventory Batch</h3>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                  {formError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Select Product *</label>
                <select
                  id="batch-item-select"
                  required
                  value={batchForm.itemId}
                  onChange={(e) => setBatchForm({ ...batchForm, itemId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose Item --</option>
                  {items.map((it) => (
                    <option key={it.itemId} value={it.itemId}>
                      {it.name} (Current: {it.currentStock} in stock)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Select Supplier *</label>
                <select
                  id="batch-supplier-select"
                  required
                  value={batchForm.sId}
                  onChange={(e) => setBatchForm({ ...batchForm, sId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose Supplier --</option>
                  {suppliers.map((s) => (
                    <option key={s.sId} value={s.sId}>
                      {s.sName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Quantity *</label>
                  <input
                    id="batch-qty-input"
                    type="number"
                    min="1"
                    required
                    value={batchForm.qty}
                    onChange={(e) => setBatchForm({ ...batchForm, qty: e.target.value })}
                    placeholder="e.g. 50"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Unit Price (Rs. / LKR) *</label>
                  <input
                    id="batch-price-input"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={batchForm.unitPrice}
                    onChange={(e) => setBatchForm({ ...batchForm, unitPrice: e.target.value })}
                    placeholder="e.g. 19.99"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  id="submit-batch-btn"
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
                >
                  {actionLoading ? 'Receiving...' : 'Receive Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SUPPLIER */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Add New Supplier</h3>
              <button
                onClick={() => setIsSupplierModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                  {formError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Supplier Company Name *</label>
                <input
                  id="supplier-name-input"
                  type="text"
                  required
                  value={supplierForm.sName}
                  onChange={(e) => setSupplierForm({ ...supplierForm, sName: e.target.value })}
                  placeholder="e.g. Acme Wholesale Supplies"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Phone / Mobile</label>
                <input
                  id="supplier-mobile-input"
                  type="text"
                  value={supplierForm.mobile}
                  onChange={(e) => setSupplierForm({ ...supplierForm, mobile: e.target.value })}
                  placeholder="+1-800-555-0199"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Address / Notes</label>
                <textarea
                  id="supplier-address-input"
                  rows={2}
                  value={supplierForm.address}
                  onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                  placeholder="Warehouse location or warehouse details"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  id="submit-supplier-btn"
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
                >
                  {actionLoading ? 'Saving...' : 'Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL PREVIEW */}
      {selectedReceiptOrder && (
        <ReceiptModal
          order={selectedReceiptOrder}
          onClose={() => setSelectedReceiptOrder(null)}
        />
      )}
    </div>
  );
};
