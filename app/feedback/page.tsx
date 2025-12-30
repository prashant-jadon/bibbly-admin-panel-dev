'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { useState } from 'react';
import { 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  Shield, 
  HelpCircle,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

const FEEDBACK_TYPES = [
  { value: 'general', label: 'General', icon: MessageSquare, color: 'text-zinc-400' },
  { value: 'bug', label: 'Bug Report', icon: Bug, color: 'text-rose-400' },
  { value: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'text-amber-400' },
  { value: 'safety', label: 'Safety Concern', icon: Shield, color: 'text-orange-400' },
  { value: 'other', label: 'Other', icon: HelpCircle, color: 'text-violet-400' },
];

function FeedbackContent() {
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    page: 1,
    limit: 20
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['feedback', filters],
    queryFn: () => adminApi.getFeedback(filters),
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
        <p className="text-rose-400">Failed to load feedback: {(error as Error).message}</p>
      </div>
    );
  }

  const feedback = data?.data?.data || [];
  const pagination = data?.data?.pagination || {};

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: 'badge-info',
      read: 'badge-neutral',
      in_progress: 'badge-warning',
      resolved: 'badge-success',
      closed: 'badge-neutral'
    };
    return styles[status] || 'badge-neutral';
  };

  const getTypeInfo = (type: string) => {
    return FEEDBACK_TYPES.find(t => t.value === type) || FEEDBACK_TYPES[0];
  };

  // Calculate stats
  const newCount = feedback.filter((f: any) => f.status === 'new').length;
  const inProgressCount = feedback.filter((f: any) => f.status === 'in_progress').length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Total Feedback</p>
              <p className="text-2xl font-bold text-zinc-100 mt-1">{pagination.total || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/20">
              <MessageSquare className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">New</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{newCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/20">
              <Clock className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">In Progress</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{inProgressCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/20">
              <Lightbulb className="h-6 w-6 text-amber-400" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">This Page</p>
              <p className="text-2xl font-bold text-zinc-100 mt-1">{feedback.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-violet-500/20">
              <CheckCircle2 className="h-6 w-6 text-violet-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-dark p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="select-dark"
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
            className="select-dark"
          >
            <option value="">All Types</option>
            {FEEDBACK_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <div></div>
          <button
            onClick={() => setFilters({ status: '', type: '', page: 1, limit: 20 })}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Feedback Table */}
      <div className="card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-dark">
            <thead>
              <tr>
                <th>User</th>
                <th>Type</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {feedback.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-zinc-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No feedback found</p>
                  </td>
                </tr>
              ) : (
                feedback.map((item: any) => {
                  const typeInfo = getTypeInfo(item.type);
                  const TypeIcon = typeInfo.icon;
                  return (
                    <tr key={item._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {item.user?.username?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-200">{item.user?.username || 'N/A'}</p>
                            <p className="text-xs text-zinc-500">{item.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <TypeIcon className={`h-4 w-4 ${typeInfo.color}`} />
                          <span className="text-zinc-300">{typeInfo.label}</span>
                        </div>
                      </td>
                      <td>
                        <p className="text-sm text-zinc-200 font-medium">{item.subject}</p>
                        <p className="text-xs text-zinc-500 truncate max-w-[200px]">{item.message}</p>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(item.status)}`}>
                          {item.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="text-sm text-zinc-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="text-right">
                        <Link
                          href={`/feedback/${item._id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded-lg transition-colors text-sm font-medium"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-dark-700/50">
            <div className="text-sm text-zinc-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} feedback
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

export default function FeedbackPage() {
  return (
    <ProtectedRoute>
      <FeedbackContent />
    </ProtectedRoute>
  );
}
