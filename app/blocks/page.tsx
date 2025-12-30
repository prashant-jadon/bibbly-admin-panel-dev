'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { 
  Search, 
  Ban, 
  AlertTriangle, 
  Trash2, 
  Eye, 
  User,
  MessageSquare,
  MapPin,
  Calendar,
  Filter,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

function BlocksContent() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    reason: '',
    source: '',
    search: '',
    page: 1,
    limit: 20
  });
  const [selectedBlock, setSelectedBlock] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['blocks', filters],
    queryFn: () => adminApi.getBlocks(filters),
  });

  const { data: statsData } = useQuery({
    queryKey: ['blockStats'],
    queryFn: () => adminApi.getBlockStats(),
  });

  const removeBlockMutation = useMutation({
    mutationFn: ({ blockId, reason }: { blockId: string; reason: string }) =>
      adminApi.removeBlock(blockId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocks'] });
      queryClient.invalidateQueries({ queryKey: ['blockStats'] });
      toast.success('Block removed successfully');
      setShowDeleteModal(false);
      setSelectedBlock(null);
      setDeleteReason('');
    },
    onError: () => {
      toast.error('Failed to remove block');
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

  const blocks = data?.data?.data || [];
  const pagination = data?.data?.pagination || {};
  const stats = statsData?.data?.stats || {};

  const getReasonBadge = (reason: string) => {
    const styles: Record<string, string> = {
      harassment: 'badge-error',
      spam: 'badge-warning',
      inappropriate: 'badge-error',
      fake_profile: 'badge-warning',
      other: 'badge-neutral',
      not_specified: 'badge-neutral'
    };
    return styles[reason] || 'badge-neutral';
  };

  const getSourceBadge = (source: string) => {
    const styles: Record<string, string> = {
      chat: 'badge-info',
      profile: 'badge-success',
      request: 'badge-warning',
      search: 'badge-neutral',
      feed: 'badge-neutral'
    };
    return styles[source] || 'badge-neutral';
  };

  const handleRemoveBlock = () => {
    if (selectedBlock && deleteReason.trim()) {
      removeBlockMutation.mutate({
        blockId: selectedBlock._id,
        reason: deleteReason
      });
    } else {
      toast.error('Please provide a reason for removing this block');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Total Blocks</p>
              <p className="text-2xl font-bold text-zinc-100 mt-1">{stats.totalBlocks || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-orange-500/20">
              <Ban className="h-6 w-6 text-orange-400" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Today</p>
              <p className="text-2xl font-bold text-zinc-100 mt-1">{stats.blocksToday || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/20">
              <Calendar className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Last 7 Days</p>
              <p className="text-2xl font-bold text-zinc-100 mt-1">{stats.blocksLast7Days || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-violet-500/20">
              <AlertTriangle className="h-6 w-6 text-violet-400" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">From Chat</p>
              <p className="text-2xl font-bold text-zinc-100 mt-1">{stats.bySource?.chat || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/20">
              <MessageSquare className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-dark p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search users..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full pl-10 pr-4 input-dark"
            />
          </div>
          <select
            value={filters.reason}
            onChange={(e) => setFilters({ ...filters, reason: e.target.value, page: 1 })}
            className="select-dark"
          >
            <option value="">All Reasons</option>
            <option value="harassment">Harassment</option>
            <option value="spam">Spam</option>
            <option value="inappropriate">Inappropriate</option>
            <option value="fake_profile">Fake Profile</option>
            <option value="other">Other</option>
            <option value="not_specified">Not Specified</option>
          </select>
          <select
            value={filters.source}
            onChange={(e) => setFilters({ ...filters, source: e.target.value, page: 1 })}
            className="select-dark"
          >
            <option value="">All Sources</option>
            <option value="chat">Chat</option>
            <option value="profile">Profile</option>
            <option value="request">Request</option>
            <option value="search">Search</option>
            <option value="feed">Feed</option>
          </select>
          <button
            onClick={() => setFilters({ reason: '', source: '', search: '', page: 1, limit: 20 })}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Blocks Table */}
      <div className="card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-dark">
            <thead>
              <tr>
                <th>Blocker</th>
                <th>Blocked User</th>
                <th>Reason</th>
                <th>Source</th>
                <th>Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blocks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-zinc-500">
                    <Ban className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No blocks found</p>
                  </td>
                </tr>
              ) : (
                blocks.map((block: any) => (
                  <tr key={block._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {block.blocker?.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-200">{block.blocker?.username || 'N/A'}</p>
                          <p className="text-xs text-zinc-500">{block.blocker?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {block.blocked?.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-200">{block.blocked?.username || 'N/A'}</p>
                          <p className="text-xs text-zinc-500">{block.blocked?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getReasonBadge(block.reason)}`}>
                        {block.reason?.replace('_', ' ') || 'Not specified'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getSourceBadge(block.source)}`}>
                        {block.source || 'Profile'}
                      </span>
                    </td>
                    <td className="text-sm text-zinc-400">
                      {new Date(block.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/users/${block.blocker?._id}`}
                          className="p-2 text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                          title="View Blocker"
                        >
                          <User className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedBlock(block);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Remove Block"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} blocks
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBlock && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-dark w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-zinc-100">Remove Block</h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedBlock(null);
                  setDeleteReason('');
                }}
                className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-dark-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-zinc-400 mb-4">
                Are you sure you want to remove this block? This will allow{' '}
                <span className="text-zinc-200 font-medium">{selectedBlock.blocked?.username}</span>{' '}
                to interact with{' '}
                <span className="text-zinc-200 font-medium">{selectedBlock.blocker?.username}</span>{' '}
                again.
              </p>
              
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Reason for removal *
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Explain why this block is being removed..."
                rows={3}
                className="w-full input-dark resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedBlock(null);
                  setDeleteReason('');
                }}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveBlock}
                disabled={removeBlockMutation.isPending || !deleteReason.trim()}
                className="flex-1 btn-danger disabled:opacity-50"
              >
                {removeBlockMutation.isPending ? 'Removing...' : 'Remove Block'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BlocksPage() {
  return (
    <ProtectedRoute>
      <BlocksContent />
    </ProtectedRoute>
  );
}

