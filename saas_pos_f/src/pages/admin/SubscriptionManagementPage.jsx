import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Navbar } from '../../components/Navbar';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  Sparkles,
  ShieldCheck,
  CreditCard,
  Plus,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Users,
  Package,
  Layers,
  ArrowRight,
  Edit2,
  X,
  History,
  Building2,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export const SubscriptionManagementPage = () => {
  const [plans, setPlans] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [businessSubs, setBusinessSubs] = useState({}); // bId -> active subscription
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, EXPIRED

  // Modals
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [isEditPlanOpen, setIsEditPlanOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyBusiness, setHistoryBusiness] = useState(null);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Form states - Plan
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    price: '',
    billingCycle: 'MONTHLY',
    maxCashiers: 2,
    maxItems: 500,
  });
  const [planFormError, setPlanFormError] = useState('');
  const [planActionLoading, setPlanActionLoading] = useState(false);

  // Form states - Assignment
  const [assignForm, setAssignForm] = useState({
    businessId: '',
    planId: '',
    durationMonths: 1,
    notes: '',
  });
  const [assignError, setAssignError] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  // Load all plans, businesses and their active subscriptions
  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, bizRes] = await Promise.all([
        api.get('/api/admin/subscriptions/plans'),
        api.get('/api/admin/businesses'),
      ]);

      const planList = plansRes.data || [];
      const bizList = bizRes.data || [];
      setPlans(planList);
      setBusinesses(bizList);

      // Load active subscriptions for each business
      const subsMap = {};
      await Promise.all(
        bizList.map(async (b) => {
          const bId = b.businessId || b.bId;
          try {
            const subRes = await api.get(`/api/admin/subscriptions/business/${bId}/active`);
            if (subRes.data && subRes.status === 200) {
              subsMap[bId] = subRes.data;
            } else {
              subsMap[bId] = null;
            }
          } catch {
            subsMap[bId] = null;
          }
        })
      );
      setBusinessSubs(subsMap);
    } catch (err) {
      console.error('Failed to load subscription data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle plan create
  const handleCreatePlan = async (e) => {
    e.preventDefault();
    setPlanFormError('');

    if (!planForm.name.trim()) {
      setPlanFormError('Plan name is required');
      return;
    }
    if (parseFloat(planForm.price) < 0 || isNaN(parseFloat(planForm.price))) {
      setPlanFormError('Price must be a valid positive number');
      return;
    }
    if (parseInt(planForm.maxCashiers) <= 0) {
      setPlanFormError('Max cashiers must be at least 1');
      return;
    }
    if (parseInt(planForm.maxItems) <= 0) {
      setPlanFormError('Max items must be at least 1');
      return;
    }

    setPlanActionLoading(true);
    try {
      await api.post('/api/admin/subscriptions/plans', {
        name: planForm.name.trim(),
        description: planForm.description.trim(),
        price: parseFloat(planForm.price),
        billingCycle: planForm.billingCycle,
        maxCashiers: parseInt(planForm.maxCashiers),
        maxItems: parseInt(planForm.maxItems),
      });
      setIsCreatePlanOpen(false);
      setPlanForm({
        name: '',
        description: '',
        price: '',
        billingCycle: 'MONTHLY',
        maxCashiers: 2,
        maxItems: 500,
      });
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create subscription plan';
      setPlanFormError(msg);
    } finally {
      setPlanActionLoading(false);
    }
  };

  // Handle plan update
  const handleUpdatePlan = async (e) => {
    e.preventDefault();
    setPlanFormError('');
    setPlanActionLoading(true);
    try {
      await api.put(`/api/admin/subscriptions/plans/${selectedPlan.planId}`, {
        name: planForm.name.trim(),
        description: planForm.description.trim(),
        price: parseFloat(planForm.price),
        billingCycle: planForm.billingCycle,
        maxCashiers: parseInt(planForm.maxCashiers),
        maxItems: parseInt(planForm.maxItems),
      });
      setIsEditPlanOpen(false);
      setSelectedPlan(null);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update plan';
      setPlanFormError(msg);
    } finally {
      setPlanActionLoading(false);
    }
  };

  // Toggle plan active status
  const handleTogglePlan = async (planId) => {
    try {
      await api.patch(`/api/admin/subscriptions/plans/${planId}/toggle`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle plan status');
    }
  };

  // Open edit plan modal
  const openEditModal = (plan) => {
    setSelectedPlan(plan);
    setPlanForm({
      name: plan.name,
      description: plan.description || '',
      price: plan.price.toString(),
      billingCycle: plan.billingCycle,
      maxCashiers: plan.maxCashiers,
      maxItems: plan.maxItems,
    });
    setPlanFormError('');
    setIsEditPlanOpen(true);
  };

  // Open assign / renew modal
  const openAssignModal = (business) => {
    const bId = business.businessId || business.bId;
    const currentSub = businessSubs[bId];
    setSelectedBusiness(business);
    setAssignForm({
      businessId: bId,
      planId: currentSub?.planId || (plans[0]?.planId || ''),
      durationMonths: 1,
      notes: currentSub ? 'Plan renewal' : 'Initial plan assignment',
    });
    setAssignError('');
    setIsAssignOpen(true);
  };

  // Handle plan assignment / renewal
  const handleAssignSubscription = async (e) => {
    e.preventDefault();
    setAssignError('');
    setAssignLoading(true);
    try {
      await api.post('/api/admin/subscriptions/assign', {
        businessId: parseInt(assignForm.businessId),
        planId: parseInt(assignForm.planId),
        durationMonths: parseInt(assignForm.durationMonths),
        notes: assignForm.notes,
      });
      setIsAssignOpen(false);
      setSelectedBusiness(null);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to assign subscription';
      setAssignError(msg);
    } finally {
      setAssignLoading(false);
    }
  };

  // Open history drawer
  const openHistoryDrawer = async (business) => {
    const bId = business.businessId || business.bId;
    setHistoryBusiness(business);
    setIsHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const res = await api.get(`/api/admin/subscriptions/business/${bId}/history`);
      setHistoryRecords(res.data || []);
    } catch (err) {
      console.error('Failed to load history', err);
      setHistoryRecords([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Filtered businesses
  const filteredBusinesses = businesses.filter((biz) => {
    const bId = biz.businessId || biz.bId;
    const name = (biz.businessName || biz.bName || '').toLowerCase();
    const email = (biz.businessEmail || biz.email || '').toLowerCase();
    const q = search.toLowerCase();
    const matchesSearch = name.includes(q) || email.includes(q);

    const sub = businessSubs[bId];
    const isAct = sub && sub.status === 'ACTIVE' && !sub.isExpired;

    if (statusFilter === 'ACTIVE') return matchesSearch && isAct;
    if (statusFilter === 'EXPIRED') return matchesSearch && (!sub || sub.isExpired || sub.status !== 'ACTIVE');
    return matchesSearch;
  });

  // Calculate summary metrics
  const totalActiveSubscriptions = Object.values(businessSubs).filter(
    (s) => s && s.status === 'ACTIVE' && !s.isExpired
  ).length;

  const totalExpiredSubscriptions = Object.values(businessSubs).filter(
    (s) => !s || s.isExpired || s.status !== 'ACTIVE'
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Top Breadcrumb & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1.5">
              <Link to="/admin/dashboard" className="hover:text-indigo-400 transition-colors">
                Admin Dashboard
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-indigo-400 font-semibold">Subscription Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <CreditCard className="w-7 h-7 text-indigo-400" />
              Subscription &amp; Tenant Lifecycle
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Configure tiered pricing plans, monitor tenant renewal cycles, and enforce automated store access.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="admin-sub-refresh-btn"
              onClick={fetchData}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              id="admin-create-plan-btn"
              onClick={() => {
                setPlanFormError('');
                setIsCreatePlanOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-600/25 transition-all duration-150"
            >
              <Plus className="w-4 h-4" />
              <span>Create Plan</span>
            </button>
          </div>
        </div>

        {/* Global Lifecycle Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Active Pricing Plans
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-white">
                {plans.filter((p) => p.isActive).length}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {plans.length} total tiers configured
              </p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Active Tenant Stores
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-emerald-400">
                {totalActiveSubscriptions}
              </div>
              <p className="text-xs text-slate-500 mt-1">Stores with unexpired active access</p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Expired / Blocked Stores
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <XCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-rose-400">
                {totalExpiredSubscriptions}
              </div>
              <p className="text-xs text-slate-500 mt-1">Access automatically blocked at login</p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Businesses
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-white">{businesses.length}</div>
              <p className="text-xs text-slate-500 mt-1">Registered tenant accounts</p>
            </div>
          </div>
        </div>

        {/* SECTION 1: Plan Catalog Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Subscription Plan Catalog
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage pricing tiers, staff cashier allowances, item limits, and public availability.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.planId}
                className={`relative rounded-2xl border transition-all duration-200 overflow-hidden backdrop-blur-xl flex flex-col justify-between ${
                  plan.isActive
                    ? 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/40 shadow-xl shadow-indigo-950/20'
                    : 'bg-slate-900/40 border-slate-800/60 opacity-70'
                }`}
              >
                {/* Top Banner glow */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400"></div>

                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white tracking-tight">
                          {plan.name}
                        </h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            plan.billingCycle === 'YEARLY'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}
                        >
                          {plan.billingCycle}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {plan.description || 'Full-featured tier designed for streamlined operations.'}
                      </p>
                    </div>

                    <button
                      id={`edit-plan-${plan.planId}-btn`}
                      onClick={() => openEditModal(plan)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Edit Plan"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Price display */}
                  <div className="py-2">
                    <span className="text-3xl font-extrabold text-white">
                      ${Number(plan.price).toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-400 ml-1.5">
                      / {plan.billingCycle === 'YEARLY' ? 'year' : 'month'}
                    </span>
                  </div>

                  {/* Limits */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 text-xs">
                    <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/60 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400">Max Staff</div>
                        <div className="font-bold text-slate-200">{plan.maxCashiers} Cashiers</div>
                      </div>
                    </div>

                    <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/60 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400">Catalog Limit</div>
                        <div className="font-bold text-slate-200">{plan.maxItems} Items</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer status toggle */}
                <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        plan.isActive ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-slate-600'
                      }`}
                    ></span>
                    <span className={`font-semibold ${plan.isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {plan.isActive ? 'Active Tier' : 'Inactive Tier'}
                    </span>
                  </div>

                  <button
                    id={`toggle-plan-${plan.planId}-btn`}
                    onClick={() => handleTogglePlan(plan.planId)}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                      plan.isActive
                        ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {plan.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: Business Subscription Assignment Table */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                Tenant Subscription Management
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Assign or renew pricing tiers, audit active cycles, and inspect store expiration states.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter Tabs */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
                {['ALL', 'ACTIVE', 'EXPIRED'].map((tab) => (
                  <button
                    key={tab}
                    id={`filter-${tab.toLowerCase()}-btn`}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      statusFilter === tab
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-sub-search-input"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter store or email..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Business Subscriptions Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-4 font-semibold uppercase tracking-wider">Business Tenant</th>
                    <th className="py-4 px-4 font-semibold uppercase tracking-wider">Current Plan</th>
                    <th className="py-4 px-4 font-semibold uppercase tracking-wider">Start Date</th>
                    <th className="py-4 px-4 font-semibold uppercase tracking-wider">End Date</th>
                    <th className="py-4 px-4 font-semibold uppercase tracking-wider">Subscription Status</th>
                    <th className="py-4 px-4 font-semibold uppercase tracking-wider">Tenant Access</th>
                    <th className="py-4 px-4 font-semibold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredBusinesses.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-10 text-center text-slate-500">
                        No business records matching criteria found.
                      </td>
                    </tr>
                  ) : (
                    filteredBusinesses.map((biz) => {
                      const bId = biz.businessId || biz.bId;
                      const name = biz.businessName || biz.bName;
                      const email = biz.businessEmail || biz.email;
                      const sub = businessSubs[bId];

                      const isActive = sub && sub.status === 'ACTIVE' && !sub.isExpired;
                      const isExpired = sub && (sub.isExpired || sub.status === 'EXPIRED');

                      return (
                        <tr key={bId} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-bold text-white text-sm">{name}</div>
                            <div className="text-[11px] text-slate-500">{email}</div>
                          </td>

                          <td className="py-4 px-4">
                            {sub ? (
                              <div className="flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                <span className="font-semibold text-slate-200">
                                  {sub.planName}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-500 italic">No plan assigned</span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-slate-400">
                            {sub?.startDate
                              ? new Date(sub.startDate).toLocaleDateString()
                              : '—'}
                          </td>

                          <td className="py-4 px-4">
                            {sub?.endDate ? (
                              <div className="font-mono text-slate-300">
                                {new Date(sub.endDate).toLocaleDateString()}
                              </div>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>

                          <td className="py-4 px-4">
                            {isActive ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <CheckCircle className="w-3 h-3" />
                                ACTIVE
                              </span>
                            ) : isExpired ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                <XCircle className="w-3 h-3" />
                                EXPIRED
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <AlertTriangle className="w-3 h-3" />
                                UNASSIGNED
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-4">
                            {isActive ? (
                              <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                Login Allowed
                              </span>
                            ) : (
                              <span className="text-rose-400 text-xs font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                                Blocked (403)
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                id={`assign-btn-${bId}`}
                                onClick={() => openAssignModal(biz)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>{sub ? 'Renew / Change' : 'Assign Plan'}</span>
                              </button>

                              <button
                                id={`history-btn-${bId}`}
                                onClick={() => openHistoryDrawer(biz)}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                                title="View Subscription History"
                              >
                                <History className="w-3.5 h-3.5" />
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
        </section>
      </main>

      {/* CREATE PLAN MODAL */}
      {isCreatePlanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Create Pricing Plan</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Define new pricing tier for onboarding retail tenants
                </p>
              </div>
              <button
                onClick={() => setIsCreatePlanOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="p-6 space-y-4 text-xs">
              {planFormError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                  {planFormError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Plan Name *</label>
                <input
                  id="plan-name-input"
                  type="text"
                  required
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  placeholder="e.g. Professional Growth"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  id="plan-desc-input"
                  rows={2}
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  placeholder="Outline feature highlights and intended business scale..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Price ($) *</label>
                  <input
                    id="plan-price-input"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                    placeholder="49.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Billing Cycle *</label>
                  <select
                    id="plan-cycle-select"
                    value={planForm.billingCycle}
                    onChange={(e) => setPlanForm({ ...planForm, billingCycle: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="MONTHLY">MONTHLY</option>
                    <option value="YEARLY">YEARLY</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Max Cashiers *</label>
                  <input
                    id="plan-cashiers-input"
                    type="number"
                    min="1"
                    required
                    value={planForm.maxCashiers}
                    onChange={(e) => setPlanForm({ ...planForm, maxCashiers: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Max Catalog Items *</label>
                  <input
                    id="plan-items-input"
                    type="number"
                    min="1"
                    required
                    value={planForm.maxItems}
                    onChange={(e) => setPlanForm({ ...planForm, maxItems: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreatePlanOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="submit-create-plan-btn"
                  type="submit"
                  disabled={planActionLoading}
                  className="px-5 py-2 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50"
                >
                  {planActionLoading ? 'Creating...' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PLAN MODAL */}
      {isEditPlanOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Edit Pricing Plan</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update plan tier features and limits
                </p>
              </div>
              <button
                onClick={() => setIsEditPlanOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePlan} className="p-6 space-y-4 text-xs">
              {planFormError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                  {planFormError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Plan Name *</label>
                <input
                  type="text"
                  required
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Billing Cycle *</label>
                  <select
                    value={planForm.billingCycle}
                    onChange={(e) => setPlanForm({ ...planForm, billingCycle: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="MONTHLY">MONTHLY</option>
                    <option value="YEARLY">YEARLY</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Max Cashiers *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={planForm.maxCashiers}
                    onChange={(e) => setPlanForm({ ...planForm, maxCashiers: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Max Catalog Items *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={planForm.maxItems}
                    onChange={(e) => setPlanForm({ ...planForm, maxItems: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditPlanOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="submit-edit-plan-btn"
                  type="submit"
                  disabled={planActionLoading}
                  className="px-5 py-2 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50"
                >
                  {planActionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN / RENEW PLAN MODAL */}
      {isAssignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Assign / Renew Subscription</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Provisions tenant subscription and sets access validity window
                </p>
              </div>
              <button
                onClick={() => setIsAssignOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubscription} className="p-6 space-y-4 text-xs">
              {assignError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                  {assignError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Target Business *</label>
                <select
                  id="assign-business-select"
                  required
                  value={assignForm.businessId}
                  onChange={(e) => setAssignForm({ ...assignForm, businessId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select a business...</option>
                  {businesses.map((b) => {
                    const bId = b.businessId || b.bId;
                    const name = b.businessName || b.bName;
                    return (
                      <option key={bId} value={bId}>
                        {name} ({b.businessEmail || b.email})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Subscription Plan *</label>
                <select
                  id="assign-plan-select"
                  required
                  value={assignForm.planId}
                  onChange={(e) => setAssignForm({ ...assignForm, planId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select a tier...</option>
                  {plans
                    .filter((p) => p.isActive)
                    .map((p) => (
                      <option key={p.planId} value={p.planId}>
                        {p.name} - ${Number(p.price).toFixed(2)} ({p.billingCycle})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Subscription Duration (Months) *
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[1, 3, 6, 12].map((m) => (
                    <button
                      key={m}
                      type="button"
                      id={`duration-${m}m-btn`}
                      onClick={() => setAssignForm({ ...assignForm, durationMonths: m })}
                      className={`py-2 rounded-xl font-bold transition-all ${
                        assignForm.durationMonths === m
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {m} {m === 1 ? 'Month' : 'Months'}
                    </button>
                  ))}
                </div>

                {/* Duration Preview Card */}
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-[11px] text-slate-400">
                  <div>
                    <span className="text-slate-500 block">Start Date:</span>
                    <span className="font-semibold text-slate-200">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-indigo-400" />
                  <div>
                    <span className="text-slate-500 block">Valid Until (Calculated):</span>
                    <span className="font-semibold text-indigo-300">
                      {(() => {
                        const d = new Date();
                        d.setMonth(d.getMonth() + parseInt(assignForm.durationMonths || 1));
                        return d.toLocaleDateString();
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Audit Notes / Reference</label>
                <input
                  id="assign-notes-input"
                  type="text"
                  value={assignForm.notes}
                  onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                  placeholder="e.g. Bank transfer ref #1084, renewed for Q1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAssignOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="submit-assign-sub-btn"
                  type="submit"
                  disabled={assignLoading}
                  className="px-5 py-2 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50"
                >
                  {assignLoading ? 'Enforcing...' : 'Confirm Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBSCRIPTION HISTORY DRAWER / MODAL */}
      {isHistoryOpen && historyBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-bold text-white text-base">Subscription Audit History</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tenant: <span className="text-white font-semibold">{historyBusiness.businessName || historyBusiness.bName}</span> ({historyBusiness.businessEmail || historyBusiness.email})
                </p>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {historyLoading ? (
                <div className="py-12 flex justify-center">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : historyRecords.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No past subscription cycles recorded for this business.
                </div>
              ) : (
                <div className="space-y-3">
                  {historyRecords.map((item, idx) => (
                    <div
                      key={item.subscriptionId || idx}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            {item.planName}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              item.status === 'ACTIVE' && !item.isExpired
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {item.status === 'ACTIVE' && !item.isExpired ? 'ACTIVE' : 'EXPIRED'}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {item.paymentStatus}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {item.startDate ? new Date(item.startDate).toLocaleDateString() : '—'}
                          </span>
                          <span>→</span>
                          <span className="flex items-center gap-1 font-semibold text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            {item.endDate ? new Date(item.endDate).toLocaleDateString() : '—'}
                          </span>
                        </div>

                        {item.notes && (
                          <p className="text-[11px] text-slate-500 italic mt-1">
                            Notes: "{item.notes}"
                          </p>
                        )}
                      </div>

                      <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4">
                        <span className="text-[10px] font-mono text-slate-500 block">
                          ID: #{item.subscriptionId}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                Close Audit Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
