'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  AlertCircle, 
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  AlertTriangle,
  FileText
} from 'lucide-react';
import Link from 'next/link';

// Resolution actions available
const RESOLUTION_ACTIONS = [
  { value: 'no_action', label: 'No Action', description: 'Report reviewed, no action needed' },
  { value: 'warning', label: 'Warning', description: 'Send warning to reported user' },
  { value: 'content_removed', label: 'Remove Content', description: 'Remove the reported content' },
  { value: 'temporary_ban', label: 'Temporary Ban', description: 'Suspend user temporarily' },
  { value: 'permanent_ban', label: 'Permanent Ban', description: 'Permanently ban the user' },
];

function ReportDetailContent() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [action, setAction] = useState('');
  const [notes, setNotes] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['report', params.id],
    queryFn: () => adminApi.getReportDetails(params.id as string),
  });

  const resolveReport = useMutation({
    mutationFn: () => adminApi.resolveReport(params.id as string, { action, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report', params.id] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Report resolved successfully');
      router.push('/reports');
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

  const report = data?.data?.report;

  if (!report) {
    return (
      <div className="card-dark p-12 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-zinc-500" />
        <p className="text-zinc-400">Report not found</p>
        <Link href="/reports" className="btn-primary mt-4 inline-flex">
          Back to Reports
        </Link>
      </div>
    );
  }

  const getStatusStyle = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: any }> = {
      pending: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: Clock },
      reviewing: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: Shield },
      resolved: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle2 },
      dismissed: { bg: 'bg-zinc-500/20', text: 'text-zinc-400', icon: XCircle },
      escalated: { bg: 'bg-rose-500/20', text: 'text-rose-400', icon: AlertTriangle }
    };
    return styles[status] || styles.pending;
  };

  const getPriorityStyle = (priority: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      low: { bg: 'bg-zinc-500/20', text: 'text-zinc-400' },
      medium: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
      high: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
      critical: { bg: 'bg-rose-500/20', text: 'text-rose-400' }
    };
    return styles[priority] || styles.medium;
  };

  const statusStyle = getStatusStyle(report.status);
  const StatusIcon = statusStyle.icon;
  const priorityStyle = getPriorityStyle(report.priority);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Report Details</h1>
            <p className="text-sm text-zinc-500">ID: {report._id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusStyle.bg}`}>
            <StatusIcon className={`h-4 w-4 ${statusStyle.text}`} />
            <span className={`text-sm font-medium ${statusStyle.text}`}>{report.status}</span>
          </div>
          <div className={`px-3 py-1.5 rounded-lg ${priorityStyle.bg}`}>
            <span className={`text-sm font-medium ${priorityStyle.text}`}>{report.priority} priority</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Information */}
          <div className="card-dark p-6">
            <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-400" />
              Report Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-400">Reason</label>
                <p className="mt-1 text-zinc-200">{report.reason?.replace(/_/g, ' ')}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-400">Description</label>
                <p className="mt-1 text-zinc-200 bg-dark-800/50 rounded-lg p-3">
                  {report.description || 'No description provided'}
                </p>
              </div>

              {report.reportedContent && (
                <div>
                  <label className="text-sm font-medium text-zinc-400">Content Type</label>
                  <p className="mt-1 text-zinc-200">{report.reportedContent.type}</p>
                  {report.reportedContent.contentSnapshot && (
                    <div className="mt-2 bg-dark-800/50 rounded-lg p-3 border border-dark-600">
                      <p className="text-sm text-zinc-400 mb-1">Content Snapshot:</p>
                      <p className="text-zinc-300">{report.reportedContent.contentSnapshot}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Calendar className="h-4 w-4" />
                Reported on {new Date(report.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Resolution Form or Resolution Details */}
          {report.status === 'pending' || report.status === 'reviewing' ? (
            <div className="card-dark p-6">
              <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary-400" />
                Resolve Report
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-3">Select Action</label>
                  <div className="grid grid-cols-1 gap-2">
                    {RESOLUTION_ACTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                          action === opt.value
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-dark-600 hover:border-dark-500 bg-dark-800/30'
                        }`}
                      >
                        <input
                          type="radio"
                          name="action"
                          value={opt.value}
                          checked={action === opt.value}
                          onChange={(e) => setAction(e.target.value)}
                          className="mt-1"
                        />
                        <div>
                          <p className="font-medium text-zinc-200">{opt.label}</p>
                          <p className="text-sm text-zinc-500">{opt.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Resolution Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full input-dark resize-none"
                    placeholder="Add notes about this resolution..."
                  />
                </div>

                <button
                  onClick={() => resolveReport.mutate()}
                  disabled={!action || resolveReport.isPending}
                  className="w-full btn-primary py-3 disabled:opacity-50"
                >
                  {resolveReport.isPending ? 'Resolving...' : 'Resolve Report'}
                </button>
              </div>
            </div>
          ) : (
            <div className="card-dark p-6">
              <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                Resolution
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50">
                  <span className="text-zinc-400">Action Taken</span>
                  <span className="text-zinc-200 font-medium">{report.resolution?.action?.replace(/_/g, ' ') || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50">
                  <span className="text-zinc-400">Resolved At</span>
                  <span className="text-zinc-200">
                    {report.resolution?.resolvedAt ? new Date(report.resolution.resolvedAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50">
                  <span className="text-zinc-400">Resolved By</span>
                  <span className="text-zinc-200">{report.reviewedBy?.username || 'N/A'}</span>
                </div>
                {report.resolution?.notes && (
                  <div className="p-3 rounded-lg bg-dark-800/50">
                    <span className="text-zinc-400 block mb-1">Notes</span>
                    <span className="text-zinc-200">{report.resolution.notes}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Reporter */}
          <div className="card-dark p-6">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Reporter</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-zinc-200">{report.reporter?.username || 'N/A'}</p>
                <p className="text-sm text-zinc-500">{report.reporter?.email}</p>
              </div>
            </div>
            <Link
              href={`/users/${report.reporter?._id}`}
              className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
            >
              View Profile
            </Link>
          </div>

          {/* Reported User */}
          <div className="card-dark p-6">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Reported User</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-zinc-200">{report.reportedUser?.username || 'N/A'}</p>
                <p className="text-sm text-zinc-500">{report.reportedUser?.email}</p>
                <div className={`inline-flex items-center gap-1 mt-1 text-xs px-2 py-0.5 rounded ${
                  report.reportedUser?.accountStatus === 'active' 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {report.reportedUser?.accountStatus || 'Unknown'}
                </div>
              </div>
            </div>
            <Link
              href={`/users/${report.reportedUser?._id}`}
              className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
            >
              View Profile
            </Link>
          </div>

          {/* Auto Action Info */}
          {report.autoActionTaken && (
            <div className="card-dark p-6 border-amber-500/30">
              <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-2">Auto Action</h3>
              <p className="text-zinc-300 text-sm">{report.autoActionDetails || 'Automatic action was taken on this report'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReportDetailPage() {
  return (
    <ProtectedRoute>
      <ReportDetailContent />
    </ProtectedRoute>
  );
}
