'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { formatDate, formatNumber } from '@/lib/utils';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Shield } from 'lucide-react';

function UserDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = params.id as string;
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusData, setStatusData] = useState({ status: '', reason: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['user-details', userId],
    queryFn: () => adminApi.getUserDetails(userId),
  });

  const updateStatus = useMutation({
    mutationFn: (data: any) => adminApi.updateUserStatus(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-details', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowStatusModal(false);
      toast.success('User status updated');
    },
  });


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const user = data?.data?.user || {};
  const stats = data?.data?.stats || {};
  const purchases = data?.data?.recentPurchases || [];

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </button>

      {/* User Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user.email}</h2>
            <p className="text-gray-600">@{user.username}</p>
            {user.profile && (
              <p className="text-gray-700 mt-1">{user.profile.name}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setStatusData({ status: user.accountStatus || 'active', reason: '' });
                setShowStatusModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Shield className="h-4 w-4" />
              Update Status
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Account Status</p>
            <p
              className={`font-semibold ${
                user.accountStatus === 'active'
                  ? 'text-green-600'
                  : user.accountStatus === 'suspended'
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {user.accountStatus || 'active'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Joined</p>
            <p className="font-semibold">{formatDate(user.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Requests Sent</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(stats.requestsSent || 0)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Requests Received</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatNumber(stats.requestsReceived || 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Conversations</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatNumber(stats.conversations || 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Reports Against</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatNumber(stats.reportsAgainst || 0)}
          </p>
        </div>
      </div>

      {/* Recent Purchases */}
      {purchases.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Purchases</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Pack
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {purchases.map((purchase: any) => (
                  <tr key={purchase._id}>
                    <td className="px-4 py-3 text-sm">{purchase.packName}</td>
                    <td className="px-4 py-3 text-sm">₹{(purchase.pricePaid / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          purchase.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {purchase.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(purchase.purchasedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showStatusModal && (
        <StatusModal
          data={statusData}
          onChange={setStatusData}
          onSave={() => updateStatus.mutate(statusData)}
          onClose={() => setShowStatusModal(false)}
        />
      )}

    </div>
  );
}

function StatusModal({ data, onChange, onSave, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Update User Status</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={data.status}
              onChange={(e) => onChange({ ...data, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
            <textarea
              value={data.reason}
              onChange={(e) => onChange({ ...data, reason: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
              placeholder="Optional reason for status change"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button
            onClick={onSave}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}


export default function UserDetailsPage() {
  return (
    <ProtectedRoute>
      <UserDetailsContent />
    </ProtectedRoute>
  );
}

