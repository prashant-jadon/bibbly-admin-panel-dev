'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import { useState } from 'react';
import { Users, MessageSquare, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';

function AnalyticsContent() {
  const [days, setDays] = useState(30);

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', days],
    queryFn: () => adminApi.getAnalytics({ days }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const analytics = data?.data || {};
  const overview = analytics.overview || {};
  const engagement = analytics.engagement || {};
  const moderation = analytics.moderation || {};
  const growth = analytics.growth || [];

  const stats = [
    {
      name: 'Total Users',
      value: formatNumber(overview.totalUsers || 0),
      icon: Users,
      change: `+${formatNumber(overview.newUsers || 0)} new`,
      changeType: 'positive',
    },
    {
      name: 'Active Users',
      value: formatNumber(overview.activeUsers || 0),
      icon: TrendingUp,
      change: `${Math.round(((overview.activeUsers || 0) / (overview.totalUsers || 1)) * 100)}% active`,
      changeType: 'neutral',
    },
    {
      name: 'Total Conversations',
      value: formatNumber(engagement.totalConversations || 0),
      icon: MessageSquare,
      change: `${formatNumber(engagement.totalMessages || 0)} messages`,
      changeType: 'neutral',
    },
    {
      name: 'Premium Users',
      value: formatNumber(overview.premiumUsers || 0),
      icon: DollarSign,
      change: `${Math.round(((overview.premiumUsers || 0) / (overview.totalUsers || 1)) * 100)}% premium`,
      changeType: 'neutral',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Insights</h1>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last year</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
              </div>
              <stat.icon className="h-12 w-12 text-primary-600 opacity-20" />
            </div>
          </div>
        ))}
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Engagement Metrics</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Conversations</span>
              <span className="text-sm font-medium text-gray-900">
                {formatNumber(engagement.totalConversations || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Messages</span>
              <span className="text-sm font-medium text-gray-900">
                {formatNumber(engagement.totalMessages || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Requests</span>
              <span className="text-sm font-medium text-gray-900">
                {formatNumber(engagement.totalRequests || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">New Requests ({days} days)</span>
              <span className="text-sm font-medium text-gray-900">
                {formatNumber(engagement.newRequests || 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Moderation Stats</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Reports</span>
              <span className="text-sm font-medium text-gray-900">
                {formatNumber(moderation.totalReports || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Pending Reports</span>
              <span className="text-sm font-medium text-red-600">
                {formatNumber(moderation.pendingReports || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Resolved Reports</span>
              <span className="text-sm font-medium text-green-600">
                {formatNumber(moderation.resolvedReports || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Feedback</span>
              <span className="text-sm font-medium text-gray-900">
                {formatNumber(moderation.totalFeedback || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">New Feedback</span>
              <span className="text-sm font-medium text-blue-600">
                {formatNumber(moderation.newFeedback || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User Growth Chart */}
      {growth.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h2>
          <div className="space-y-2">
            {growth.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item._id}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${(item.count / Math.max(...growth.map((g: any) => g.count))) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <AnalyticsContent />
    </ProtectedRoute>
  );
}

