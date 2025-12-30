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
  MessageSquare,
  Bug,
  Lightbulb,
  Shield,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

const FEEDBACK_TYPES = [
  { value: 'general', label: 'General', icon: MessageSquare, color: 'text-zinc-400', bg: 'bg-zinc-500/20' },
  { value: 'bug', label: 'Bug Report', icon: Bug, color: 'text-rose-400', bg: 'bg-rose-500/20' },
  { value: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'text-amber-400', bg: 'bg-amber-500/20' },
  { value: 'safety', label: 'Safety Concern', icon: Shield, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  { value: 'other', label: 'Other', icon: HelpCircle, color: 'text-violet-400', bg: 'bg-violet-500/20' },
];

function FeedbackDetailContent() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [resolution, setResolution] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['feedback', params.id],
    queryFn: () => adminApi.getFeedbackDetails(params.id as string),
  });

  const updateFeedback = useMutation({
    mutationFn: () => adminApi.updateFeedback(params.id as string, {
      status: status || undefined,
      priority: priority || undefined,
      adminNote: adminNote || undefined,
      resolution: resolution || undefined
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback', params.id] });
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast.success('Feedback updated successfully');
      setAdminNote('');
    },
    onError: () => {
      toast.error('Failed to update feedback');
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

  const feedback = data?.data?.feedback;

  if (!feedback) {
    return (
      <div className="card-dark p-12 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-zinc-500" />
        <p className="text-zinc-400">Feedback not found</p>
        <Link href="/feedback" className="btn-primary mt-4 inline-flex">
          Back to Feedback
        </Link>
      </div>
    );
  }

  const typeInfo = FEEDBACK_TYPES.find(t => t.value === feedback.type) || FEEDBACK_TYPES[0];
  const TypeIcon = typeInfo.icon;

  const getStatusStyle = (st: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      new: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
      read: { bg: 'bg-zinc-500/20', text: 'text-zinc-400' },
      in_progress: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
      resolved: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
      closed: { bg: 'bg-zinc-500/20', text: 'text-zinc-400' }
    };
    return styles[st] || styles.new;
  };

  const getPriorityStyle = (pr: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      low: { bg: 'bg-zinc-500/20', text: 'text-zinc-400' },
      medium: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
      high: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
      urgent: { bg: 'bg-rose-500/20', text: 'text-rose-400' }
    };
    return styles[pr] || styles.medium;
  };

  const statusStyle = getStatusStyle(feedback.status);
  const priorityStyle = getPriorityStyle(feedback.priority);

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
            <h1 className="text-2xl font-bold text-zinc-100">Feedback Details</h1>
            <p className="text-sm text-zinc-500">ID: {feedback._id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${typeInfo.bg}`}>
            <TypeIcon className={`h-4 w-4 ${typeInfo.color}`} />
            <span className={`text-sm font-medium ${typeInfo.color}`}>{typeInfo.label}</span>
          </div>
          <div className={`px-3 py-1.5 rounded-lg ${statusStyle.bg}`}>
            <span className={`text-sm font-medium ${statusStyle.text}`}>{feedback.status?.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Feedback Content */}
          <div className="card-dark p-6">
            <h2 className="text-lg font-semibold text-zinc-100 mb-4">Feedback Content</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-400">Subject</label>
                <p className="mt-1 text-lg text-zinc-100 font-medium">{feedback.subject}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-400">Message</label>
                <p className="mt-1 text-zinc-200 bg-dark-800/50 rounded-lg p-4 whitespace-pre-wrap">
                  {feedback.message}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Calendar className="h-4 w-4" />
                Submitted on {new Date(feedback.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Update Form */}
          <div className="card-dark p-6">
            <h2 className="text-lg font-semibold text-zinc-100 mb-4">Update Feedback</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Status</label>
                  <select
                    value={status || feedback.status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full select-dark"
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Priority</label>
                  <select
                    value={priority || feedback.priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full select-dark"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Add Admin Note</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  className="w-full input-dark resize-none"
                  placeholder="Add a note..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Resolution</label>
                <textarea
                  value={resolution || feedback.resolution || ''}
                  onChange={(e) => setResolution(e.target.value)}
                  rows={3}
                  className="w-full input-dark resize-none"
                  placeholder="Resolution notes..."
                />
              </div>

              <button
                onClick={() => updateFeedback.mutate()}
                disabled={updateFeedback.isPending}
                className="w-full btn-primary py-3"
              >
                {updateFeedback.isPending ? 'Updating...' : 'Update Feedback'}
              </button>
            </div>
          </div>

          {/* Admin Notes History */}
          {feedback.adminNotes && feedback.adminNotes.length > 0 && (
            <div className="card-dark p-6">
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">Admin Notes</h2>
              <div className="space-y-3">
                {feedback.adminNotes.map((note: any, index: number) => (
                  <div key={index} className="border-l-2 border-primary-500 pl-4 py-2 bg-dark-800/30 rounded-r-lg">
                    <p className="text-zinc-200">{note.note}</p>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mt-2">
                      <User className="h-3 w-3" />
                      <span>{note.addedBy?.username || 'Admin'}</span>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      <span>{new Date(note.addedAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Info */}
          <div className="card-dark p-6">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Submitted By</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-zinc-200">{feedback.user?.username || 'N/A'}</p>
                <p className="text-sm text-zinc-500">{feedback.user?.email}</p>
              </div>
            </div>
            <Link
              href={`/users/${feedback.user?._id}`}
              className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
            >
              View User Profile
            </Link>
          </div>

          {/* Status Summary */}
          <div className="card-dark p-6">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50">
                <span className="text-zinc-400">Status</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                  {feedback.status?.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50">
                <span className="text-zinc-400">Priority</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${priorityStyle.bg} ${priorityStyle.text}`}>
                  {feedback.priority}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50">
                <span className="text-zinc-400">Type</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${typeInfo.bg} ${typeInfo.color}`}>
                  {typeInfo.label}
                </span>
              </div>
            </div>
          </div>

          {/* Resolution Info */}
          {feedback.resolvedAt && (
            <div className="card-dark p-6 border-emerald-500/30">
              <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Resolved
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Resolved By</span>
                  <span className="text-zinc-200">{feedback.resolvedBy?.username || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Resolved At</span>
                  <span className="text-zinc-200">{new Date(feedback.resolvedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FeedbackDetailPage() {
  return (
    <ProtectedRoute>
      <FeedbackDetailContent />
    </ProtectedRoute>
  );
}
