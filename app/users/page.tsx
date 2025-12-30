'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { formatDate, formatNumber } from '@/lib/utils';
import { useState } from 'react';
import { 
  Search, 
  Eye, 
  Users, 
  UserCheck, 
  UserX, 
  Crown,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

function UsersContent() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [premiumFilter, setPremiumFilter] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search, statusFilter, premiumFilter],
    queryFn: () =>
      adminApi.getUsers({
        page,
        limit: 20,
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        isPremium: premiumFilter !== 'all' ? premiumFilter === 'premium' : undefined,
      }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) =>
      adminApi.updateUserStatus(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User status updated');
    },
  });

  const users = data?.data?.data || data?.data || [];
  const pagination = data?.data?.pagination || data?.pagination || {};

  const handleStatusChange = (userId: string, status: string) => {
    updateStatus.mutate({
      userId,
      data: { status, reason: `Status changed to ${status} by admin` },
    });
  };

  const getStatusStyle = (status: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      active: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
      suspended: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
      deleted: { bg: 'bg-rose-500/20', text: 'text-rose-400' }
    };
    return styles[status] || styles.active;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Total Users</p>
              <p className="text-2xl font-bold text-zinc-100 mt-1">{formatNumber(pagination.total || 0)}</p>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/20">
              <Users className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Active</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {formatNumber(users.filter((u: any) => u.accountStatus === 'active').length)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/20">
              <UserCheck className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Suspended</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {formatNumber(users.filter((u: any) => u.accountStatus === 'suspended').length)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/20">
              <UserX className="h-6 w-6 text-amber-400" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Premium</p>
              <p className="text-2xl font-bold text-violet-400 mt-1">
                {formatNumber(users.filter((u: any) => u.isPremium).length)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-violet-500/20">
              <Crown className="h-6 w-6 text-violet-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-dark p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by username or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 input-dark"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-dark"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="deleted">Deleted</option>
          </select>
          <select
            value={premiumFilter}
            onChange={(e) => setPremiumFilter(e.target.value)}
            className="select-dark"
          >
            <option value="all">All Users</option>
            <option value="premium">Premium</option>
            <option value="free">Free</option>
          </select>
          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('all');
              setPremiumFilter('all');
              setPage(1);
            }}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="card-dark overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-dark-700"></div>
              <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table-dark">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Status</th>
                    <th>Type</th>
                    <th>Joined</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-zinc-500">
                        <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No users found</p>
                      </td>
                    </tr>
                  ) : (
                    users.map((user: any) => {
                      const statusStyle = getStatusStyle(user.accountStatus || 'active');
                      return (
                        <tr key={user._id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center relative">
                                <span className="text-white text-sm font-medium">
                                  {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                                </span>
                                {user.isPremium && (
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                                    <Crown className="h-2.5 w-2.5 text-white" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-zinc-200">@{user.username || 'N/A'}</p>
                                <p className="text-xs text-zinc-500">{user.email}</p>
                                {user.profile?.name && (
                                  <p className="text-xs text-zinc-400">{user.profile.name}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <select
                              value={user.accountStatus || 'active'}
                              onChange={(e) => handleStatusChange(user._id, e.target.value)}
                              className={`text-sm px-3 py-1.5 rounded-lg border-0 ${statusStyle.bg} ${statusStyle.text} cursor-pointer focus:ring-2 focus:ring-primary-500/50 focus:outline-none`}
                            >
                              <option value="active">Active</option>
                              <option value="suspended">Suspended</option>
                              <option value="deleted">Deleted</option>
                            </select>
                          </td>
                          <td>
                            {user.isPremium ? (
                              <span className="badge badge-warning flex items-center gap-1 w-fit">
                                <Crown className="h-3 w-3" />
                                Premium
                              </span>
                            ) : (
                              <span className="badge badge-neutral">Free</span>
                            )}
                          </td>
                          <td className="text-sm text-zinc-400">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="text-right">
                            <Link
                              href={`/users/${user._id}`}
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
                  Page {pagination.currentPage || page} of {pagination.totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={!pagination.hasPrevPage && page === 1}
                    className="p-2 rounded-lg border border-dark-600 text-zinc-400 hover:text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-zinc-400 px-2">
                    {page}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                    disabled={!pagination.hasNextPage && page >= pagination.totalPages}
                    className="p-2 rounded-lg border border-dark-600 text-zinc-400 hover:text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <ProtectedRoute>
      <UsersContent />
    </ProtectedRoute>
  );
}
