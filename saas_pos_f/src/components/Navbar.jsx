import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Store,
  ShieldCheck,
  UserCheck,
  LogOut,
  Sparkles,
  Layers,
  Building2,
  Terminal,
} from 'lucide-react';

export const Navbar = () => {
  const { user, role, businessName, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = () => {
    if (role === 'ROLE_SUPER_ADMIN' || role === 'SUPER_ADMIN' || role === 'ROLE_OWNER') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          Platform Super Admin
        </span>
      );
    }
    if (role === 'ROLE_BUSINESS_OWNER') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Building2 className="w-3.5 h-3.5" />
          Business Owner
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
        <Terminal className="w-3.5 h-3.5" />
        Cashier Terminal
      </span>
    );
  };

  const getHomeLink = () => {
    if (role === 'ROLE_SUPER_ADMIN' || role === 'SUPER_ADMIN' || role === 'ROLE_OWNER') return '/admin/dashboard';
    if (role === 'ROLE_BUSINESS_OWNER') return '/business/dashboard';
    return '/pos/terminal';
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-900/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          to={getHomeLink()}
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                OmniPOS
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                SaaS
              </span>
            </div>
            {businessName && (
              <p className="text-xs text-slate-400 flex items-center gap-1 truncate max-w-[200px]">
                <Layers className="w-3 h-3 text-slate-500" />
                {businessName}
              </p>
            )}
          </div>
        </Link>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs text-slate-400">{user?.uEmail}</span>
            <div className="mt-0.5">{getRoleBadge()}</div>
          </div>

          <button
            id="nav-logout-btn"
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-red-500/20 hover:border-red-500/30 border border-slate-700/80 transition-all duration-150"
            title="Sign out of system"
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-400" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
