'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { useState } from 'react';

function ActivityLogsContent() {
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    page: 1,
    limit: 50
  });

  const { data, isLoading } = useQuery({
    queryKey: ['activity-logs', filters],
    queryFn: () => adminApi.getActivityLogs(filters),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const logs = data?.data?.data || [];
  const pagination = data?.data?.pagination || {};

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      user_created: 'bg-green-100 text-green-800',
      user_suspended: 'bg-yellow-100 text-yellow-800',
      user_deleted: 'bg-red-100 text-red-800',
      report_resolved: 'bg-blue-100 text-blue-800',
      config_updated: 'bg-purple-100 text-purple-800',
      system_error: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[action] || 'bg-gray-100 text-gray-800'}`}>
        {action.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Actions</option>
              <option value="user_created">User Created</option>
              <option value="user_suspended">User Suspended</option>
              <option value="user_deleted">User Deleted</option>
              <option value="report_resolved">Report Resolved</option>
              <option value="config_updated">Config Updated</option>
              <option value="feedback_updated">Feedback Updated</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
            <select
              value={filters.entityType}
              onChange={(e) => setFilters({ ...filters, entityType: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Types</option>
              <option value="user">User</option>
              <option value="report">Report</option>
              <option value="config">Config</option>
              <option value="feedback">Feedback</option>
              <option value="system">System</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ action: '', entityType: '', page: 1, limit: 50 })}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No activity logs found
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{log.actor?.username || 'System'}</div>
                      <div className="text-xs text-gray-500">{log.actorType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{log.entityType || 'N/A'}</div>
                      {log.entityId && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">{log.entityId}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {JSON.stringify(log.details || {}).substring(0, 50)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${
                        log.result === 'success' ? 'bg-green-100 text-green-800' :
                        log.result === 'failure' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {log.result}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} logs
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={pagination.page === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={pagination.page >= pagination.totalPages}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ActivityLogsPage() {
  return (
    <ProtectedRoute>
      <ActivityLogsContent />
    </ProtectedRoute>
  );
}

