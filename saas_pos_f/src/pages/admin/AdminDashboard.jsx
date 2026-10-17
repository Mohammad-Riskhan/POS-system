import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Navbar } from '../../components/Navbar';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  Building2,
  Users,
  DollarSign,
  ShoppingCart,
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Edit2,
  Trash2,
  X,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    bName: '',
    email: '',
    phone: '',
    ownerName: '',
    ownerPassword: '',
  });

  const [editData, setEditData] = useState({
    bName: '',
    email: '',
    phone: '',
  });

  const [formError, setFormError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, bizRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/businesses'),
      ]);
      setStats(statsRes.data);
      setBusinesses(bizRes.data);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateBusiness = async (e) => {
    e.preventDefault();
    setFormError('');
    setActionLoading(true);

    const payload = {
      businessName: formData.bName,
      businessEmail: formData.email,
      phone: formData.phone,
      ownerName: formData.ownerName,
      ownerEmail: (formData.ownerEmail && formData.ownerEmail.trim()) || formData.email,
      password: formData.ownerPassword,
    };

    try {
      await api.post('/api/admin/businesses', payload);
      setIsCreateOpen(false);
      setFormData({
        bName: '',
        email: '',
        phone: '',
        ownerName: '',
        ownerPassword: '',
      });
      fetchData();
    } catch (err) {
      const errors = err.response?.data?.errors;
      const msg = errors
        ? Object.values(errors).join(', ')
        : (err.response?.data?.message || 'Failed to onboard business');
      setFormError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditBusiness = async (e) => {
    e.preventDefault();
    setFormError('');
    setActionLoading(true);

    const bId = selectedBusiness?.businessId || selectedBusiness?.bId;
    const payload = {
      businessName: editData.bName,
      businessEmail: editData.email,
      phone: editData.phone,
      bName: editData.bName,
      email: editData.email,
    };

    try {
      await api.put(`/api/admin/businesses/${bId}`, payload);
      setIsEditOpen(false);
      setSelectedBusiness(null);
      fetchData();
    } catch (err) {
      const errors = err.response?.data?.errors;
      const msg = errors
        ? Object.values(errors).join(', ')
        : (err.response?.data?.message || 'Failed to update business');
      setFormError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (bId, currentStatus) => {
    let newStatus = 'ACTIVE';
    if (currentStatus === 'ACTIVE') newStatus = 'SUSPENDED';
    else if (currentStatus === 'SUSPENDED') newStatus = 'INACTIVE';
    else newStatus = 'ACTIVE';

    try {
      await api.patch(`/api/admin/businesses/${bId}/status`, {
        bStatus: newStatus,
        status: newStatus,
      });
      fetchData();
    } catch (err) {
      const errors = err.response?.data?.errors;
      const msg = errors
        ? Object.values(errors).join(', ')
        : (err.response?.data?.message || 'Failed to update status');
      alert(msg);
    }
  };

  const handleDeleteBusiness = async (bId, bName) => {
    if (!window.confirm(`Are you sure you want to delete "${bName}"? All data will be permanently removed.`)) {
      return;
    }
    try {
      await api.delete(`/api/admin/businesses/${bId}`);
      fetchData();
    } catch (err) {
      const errors = err.response?.data?.errors;
      const msg = errors
        ? Object.values(errors).join(', ')
        : (err.response?.data?.message || 'Failed to delete business');
      alert(msg);
    }
  };

  const openEditModal = (biz) => {
    setSelectedBusiness(biz);
    setEditData({
      bName: biz.businessName || biz.bName || '',
      email: biz.businessEmail || biz.email || '',
      phone: biz.phone || '',
    });
    setFormError('');
    setIsEditOpen(true);
  };

  const filteredBusinesses = businesses.filter((b) => {
    const name = b.businessName || b.bName || '';
    const email = b.businessEmail || b.email || '';
    const owner = b.ownerName || '';
    const query = search.toLowerCase();
    return (
      name.toLowerCase().includes(query) ||
      email.toLowerCase().includes(query) ||
      owner.toLowerCase().includes(query)
    );
  });

  const getStatusBadge = (status) => {
    if (status === 'ACTIVE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle className="w-3 h-3" />
          ACTIVE
        </span>
      );
    }
    if (status === 'SUSPENDED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <AlertTriangle className="w-3 h-3" />
          SUSPENDED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <XCircle className="w-3 h-3" />
        INACTIVE
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Platform Administration
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Global overview of multi-tenant accounts, subscription status, and platform performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              id="admin-refresh-btn"
              onClick={fetchData}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh Platform Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              id="admin-onboard-business-btn"
              onClick={() => {
                setFormError('');
                setIsCreateOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all duration-150"
            >
              <Plus className="w-4 h-4" />
              <span>Onboard Business</span>
            </button>
          </div>
        </div>

        {/* Global KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Businesses
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-white">
                {stats?.totalBusinesses ?? 0}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                <span className="text-emerald-400 font-medium">
                  {stats?.activeBusinesses ?? 0} Active
                </span>
                <span>•</span>
                <span className="text-amber-400 font-medium">
                  {stats?.suspendedBusinesses ?? 0} Suspended
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Global Revenue
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-white">
                {formatCurrency(stats?.totalPlatformRevenue)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Combined tenant checkout total</p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Orders
              </span>
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-white">
                {stats?.totalOrders ?? 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">Processed across platform</p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Platform Users
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-white">
                {stats?.totalUsers ?? 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">Owners, Cashiers & Admins</p>
            </div>
          </div>
        </div>

        {/* Business Accounts Management Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Business Registry</h2>
              <p className="text-xs text-slate-400">
                Manage registered business entities, subscription statuses, and business owners
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-search-business-input"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by business, email, owner..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wider">#</th>
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wider">Business Name</th>
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wider">Status</th>
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wider">Business Owner</th>
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wider">Contact Email</th>
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wider">Phone</th>
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wider">Created</th>
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredBusinesses.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-500">
                      No business accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredBusinesses.map((biz, index) => {
                    const id = biz.businessId || biz.bId;
                    const name = biz.businessName || biz.bName;
                    const status = biz.status || biz.bStatus;
                    const email = biz.businessEmail || biz.email;
                    return (
                      <tr key={id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-400">#{index + 1}</td>
                        <td className="py-3.5 px-4 font-bold text-white">
                          {name}
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleStatusChange(id, status)}
                            title="Click to toggle status (ACTIVE -> SUSPENDED -> INACTIVE)"
                            className="cursor-pointer transition-transform hover:scale-105"
                          >
                            {getStatusBadge(status)}
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          <div>
                            <div className="font-semibold text-slate-200">{biz.ownerName}</div>
                            <div className="text-[11px] text-slate-500">{biz.ownerEmail}</div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">{email}</td>
                        <td className="py-3.5 px-4 text-slate-400">{biz.phone || '—'}</td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {biz.createdAt ? new Date(biz.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(biz)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                              title="Edit Business Information"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteBusiness(id, name)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                              title="Delete Business"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Onboard Business Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Onboard New Business</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Provisions business tenant and initial owner credentials
                </p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBusiness} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">
                    Business Name *
                  </label>
                  <input
                    id="admin-biz-name-input"
                    type="text"
                    required
                    value={formData.bName}
                    onChange={(e) => setFormData({ ...formData, bName: e.target.value })}
                    placeholder="e.g. Metro Mart & Electronics"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Business Email *
                  </label>
                  <input
                    id="admin-biz-email-input"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@metromart.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Business Phone
                  </label>
                  <input
                    id="admin-biz-phone-input"
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1-555-0100"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="col-span-2 pt-2 border-t border-slate-800">
                  <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] block mb-2">
                    Initial Business Owner Credentials
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Owner Full Name *
                  </label>
                  <input
                    id="admin-owner-name-input"
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    placeholder="Alex Morgan"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Owner Password *
                  </label>
                  <input
                    id="admin-owner-password-input"
                    type="password"
                    required
                    minLength={6}
                    value={formData.ownerPassword}
                    onChange={(e) => setFormData({ ...formData, ownerPassword: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="admin-submit-onboard-btn"
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Provisioning...' : 'Provision Business'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Business Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Edit Business Details</h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditBusiness} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                  {formError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  value={editData.bName}
                  onChange={(e) => setEditData({ ...editData, bName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Phone</label>
                <input
                  type="text"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
