'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Shield,
  Flag
} from 'lucide-react';
import Link from 'next/link';

// All report reasons from backend Report model
const REPORT_REASONS = [
  { value: 'harassment', label: 'Harassment' },
  { value: 'hate_speech', label: 'Hate Speech' },
  { value: 'inappropriate_content', label: 'Inappropriate Content' },
  { value: 'spam', label: 'Spam' },
  { value: 'fake_profile', label: 'Fake Profile' },
  { value: 'underage', label: 'Underage' },
  { value: 'scam', label: 'Scam' },
  { value: 'violence', label: 'Violence' },
  { value: 'self_harm', label: 'Self Harm' },
  { value: 'impersonation', label: 'Impersonation' },
  { value: 'other', label: 'Other' },
];

function ReportsContent() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    reason: '',
    page: 1,
    limit: 20
  });

  const { data, isLoading } = useQuery({
    queryKey: ['reports', filters],
    queryFn: () => adminApi.getReports(filters),
  });

  const resolveReport = useMutation({
    mutationFn: ({ reportId, action, notes }: any) => 
      adminApi.resolveReport(reportId, { action, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Report resolved successfully');
    },
    onError: () => {
      toast.error('Failed to resolve report');
    },
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

  const reports = data?.data?.data || [];
  const pagination = data?.data?.pagination || {};

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { class: string; icon: any }> = {
      pending: { class: 'badge-warning', icon: Clock },
      reviewing: { class: 'badge-info', icon: Eye },
      resolved: { class: 'badge-success', icon: CheckCircle2 },
      dismissed: { class: 'badge-neutral', icon: XCircle },
      escalated: { class: 'badge-error', icon: AlertTriangle }
    };
    const style = styles[status] || styles.pending;
    const Icon = style.icon;
    return (
      <span className={`badge ${style.class} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      low: 'badge-neutral',
      medium: 'badge-info',
      high: 'badge-warning',
      critical: 'badge-error'
    };
    return (
      <span className={`badge ${styles[priority] || styles.medium}`}>
        {priority}
      </span>
    );
  };

  const getReasonBadge = (reason: string) => {
    const criticalReasons = ['underage', 'violence', 'self_harm'];
    const highReasons = ['harassment', 'hate_speech', 'scam'];
    
    let badgeClass = 'badge-neutral';
    if (criticalReasons.includes(reason)) {
      badgeClass = 'badge-error';
    } else if (highReasons.includes(reason)) {
      badgeClass = 'badge-warning';
    }
    
    return (
      <span className={`badge ${badgeClass}`}>
        {reason?.replace(/_/g, ' ')}
      </span>
    );
  };

  // Calculate stats from current data
  const pendingCount = reports.filter((r: any) => r.status === 'pending').length;
  const criticalCount = reports.filter((r: any) => r.priority === 'critical').length;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Total Reports</p>
              <p className="text-2xl font-bold text-zinc-100 mt-1">{pagination.total || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/20">
              <Flag className="h-6 w-6 text-rose-400" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Pending</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{pendingCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/20">
              <Clock className="h-6 w-6 text-amber-400" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Critical</p>
              <p className="text-2xl font-bold text-rose-400 mt-1">{criticalCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/20">
              <AlertCircle className="h-6 w-6 text-rose-400" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">This Page</p>
              <p className="text-2xl font-bold text-zinc-100 mt-1">{reports.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-violet-500/20">
              <Shield className="h-6 w-6 text-violet-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-dark p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="select-dark"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
            <option value="escalated">Escalated</option>
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
            className="select-dark"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <select
            value={filters.reason}
            onChange={(e) => setFilters({ ...filters, reason: e.target.value, page: 1 })}
            className="select-dark"
          >
            <option value="">All Reasons</option>
            {REPORT_REASONS.map((reason) => (
              <option key={reason.value} value={reason.value}>
                {reason.label}
              </option>
            ))}
          </select>
          <div></div>
          <button
            onClick={() => setFilters({ status: '', priority: '', reason: '', page: 1, limit: 20 })}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-dark">
            <thead>
              <tr>
                <th>Reporter</th>
                <th>Reported User</th>
                <th>Reason</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-zinc-500">
                    <Flag className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No reports found</p>
                  </td>
                </tr>
              ) : (
                reports.map((report: any) => (
                  <tr key={report._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {report.reporter?.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-200">{report.reporter?.username || 'N/A'}</p>
                          <p className="text-xs text-zinc-500">{report.reporter?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {report.reportedUser?.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-200">{report.reportedUser?.username || 'N/A'}</p>
                          <p className="text-xs text-zinc-500">{report.reportedUser?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      {getReasonBadge(report.reason)}
                      {report.description && (
                        <p className="text-xs text-zinc-500 mt-1 truncate max-w-[150px]" title={report.description}>
                          {report.description}
                        </p>
                      )}
                    </td>
                    <td>
                      {getPriorityBadge(report.priority)}
                    </td>
                    <td>
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="text-sm text-zinc-400">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/reports/${report._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-dark-700/50">
            <div className="text-sm text-zinc-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} reports
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg border border-dark-600 text-zinc-400 hover:text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-zinc-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-lg border border-dark-600 text-zinc-400 hover:text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <ReportsContent />
    </ProtectedRoute>
  );
}
