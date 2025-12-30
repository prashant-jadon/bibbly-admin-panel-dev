'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { formatNumber, formatCurrency } from '@/lib/utils';
import {
  Users,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Shield,
  Flag,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';

function DashboardContent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => adminApi.getDashboard(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-dark-700"></div>
          <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-dark p-6 border-rose-500/30">
        <div className="flex items-center gap-3 text-rose-400">
          <AlertCircle className="h-5 w-5" />
          <p>Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  const overview = data?.data?.overview || {};
  const appStatus = data?.data?.appStatus || {};

  const stats = [
    {
      name: 'Total Users',
      value: formatNumber(overview.totalUsers || 0),
      icon: Users,
      change: `+${overview.newUsersToday || 0} today`,
      changeType: 'positive',
      color: 'from-cyan-500 to-blue-500',
      iconBg: 'bg-cyan-500/20',
      iconColor: 'text-cyan-400',
    },
    {
      name: 'Active Users',
      value: formatNumber(overview.activeUsers || 0),
      icon: UserCheck,
      change: `${Math.round(((overview.activeUsers || 0) / (overview.totalUsers || 1)) * 100)}% active`,
      changeType: 'neutral',
      color: 'from-emerald-500 to-teal-500',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
    },
    {
      name: 'Total Conversations',
      value: formatNumber(overview.totalConversations || 0),
      icon: MessageSquare,
      change: `${formatNumber(overview.totalRequests || 0)} requests`,
      changeType: 'neutral',
      color: 'from-violet-500 to-purple-500',
      iconBg: 'bg-violet-500/20',
      iconColor: 'text-violet-400',
    },
    {
      name: 'Pending Reports',
      value: formatNumber(overview.pendingReports || 0),
      icon: AlertCircle,
      change: 'Requires attention',
      changeType: overview.pendingReports > 0 ? 'negative' : 'positive',
      color: 'from-rose-500 to-pink-500',
      iconBg: 'bg-rose-500/20',
      iconColor: 'text-rose-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* App Status Banner */}
      <div
        className={`card-dark p-4 ${
          appStatus.maintenanceMode
            ? 'border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent'
            : 'border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-transparent'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${appStatus.maintenanceMode ? 'bg-amber-500/20' : 'bg-emerald-500/20'}`}>
              {appStatus.maintenanceMode ? (
                <AlertCircle className="h-6 w-6 text-amber-400" />
              ) : (
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              )}
            </div>
            <div>
              <p className={`font-semibold ${appStatus.maintenanceMode ? 'text-amber-400' : 'text-emerald-400'}`}>
                {appStatus.maintenanceMode ? 'Maintenance Mode Active' : 'System Operational'}
              </p>
              <p className="text-sm text-zinc-400">
                App Version {appStatus.appVersion || '1.0.0'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`flex h-3 w-3 relative ${appStatus.maintenanceMode ? '' : ''}`}>
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${appStatus.maintenanceMode ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${appStatus.maintenanceMode ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
            </span>
            <span className="text-sm text-zinc-400">Live</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={stat.name} 
            className="stat-card card-hover"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  stat.changeType === 'positive' ? 'text-emerald-400' :
                  stat.changeType === 'negative' ? 'text-rose-400' :
                  'text-zinc-400'
                }`}>
                  {stat.changeType === 'positive' && <ArrowUpRight className="h-4 w-4" />}
                  {stat.changeType === 'negative' && <ArrowDownRight className="h-4 w-4" />}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400">{stat.name}</p>
                <p className="text-3xl font-bold text-zinc-100 mt-1">{stat.value}</p>
                <p className="text-xs text-zinc-500 mt-2">{stat.change}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Users Card */}
        <div className="card-dark p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-zinc-100">User Growth</h3>
            <span className="badge badge-info">Last 7 Days</span>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-bold text-zinc-100">
              {formatNumber(overview.newUsersLast7Days || 0)}
            </span>
            <span className="text-sm text-emerald-400 flex items-center gap-1">
              <ArrowUpRight className="h-4 w-4" />
              New Users
            </span>
          </div>
          <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary-500 to-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, ((overview.newUsersLast7Days || 0) / (overview.totalUsers || 1)) * 100 * 10)}%` }}
            />
          </div>
          <p className="text-sm text-zinc-500 mt-3">
            {((overview.newUsersLast7Days || 0) / 7).toFixed(1)} average daily signups
          </p>
        </div>

        {/* Moderation Card */}
        <div className="card-dark p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-zinc-100">Moderation Queue</h3>
            <Link
              href="/reports"
              className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center gap-1"
            >
              View All
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-dark-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-500/20">
                  <Flag className="h-5 w-5 text-rose-400" />
                </div>
                <span className="text-zinc-300">Pending Reports</span>
              </div>
              <span className={`text-xl font-bold ${overview.pendingReports > 0 ? 'text-rose-400' : 'text-zinc-400'}`}>
                {formatNumber(overview.pendingReports || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-dark-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Shield className="h-5 w-5 text-amber-400" />
                </div>
                <span className="text-zinc-300">Active Blocks</span>
              </div>
              <span className="text-xl font-bold text-zinc-400">-</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card-dark p-6">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/users"
            className="p-4 rounded-xl bg-dark-800/50 border border-dark-700/50 hover:border-primary-500/30 hover:bg-primary-500/5 transition-all duration-200 group"
          >
            <Users className="h-6 w-6 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-medium text-zinc-200">User Management</p>
            <p className="text-sm text-zinc-500 mt-1">View all users</p>
          </Link>
          <Link
            href="/reports"
            className="p-4 rounded-xl bg-dark-800/50 border border-dark-700/50 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all duration-200 group"
          >
            <AlertTriangle className="h-6 w-6 text-rose-400 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-medium text-zinc-200">Reports</p>
            <p className="text-sm text-zinc-500 mt-1">Handle reports</p>
          </Link>
          <Link
            href="/analytics"
            className="p-4 rounded-xl bg-dark-800/50 border border-dark-700/50 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-200 group"
          >
            <TrendingUp className="h-6 w-6 text-violet-400 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-medium text-zinc-200">Analytics</p>
            <p className="text-sm text-zinc-500 mt-1">View statistics</p>
          </Link>
          <Link
            href="/settings"
            className="p-4 rounded-xl bg-dark-800/50 border border-dark-700/50 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all duration-200 group"
          >
            <Activity className="h-6 w-6 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-medium text-zinc-200">Settings</p>
            <p className="text-sm text-zinc-500 mt-1">Configure app</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
