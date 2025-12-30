'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { useState } from 'react';

function ContentContent() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'support' | 'legal'>('support');

  const { data, isLoading } = useQuery({
    queryKey: ['app-config'],
    queryFn: () => adminApi.getConfig(),
  });

  const updateConfig = useMutation({
    mutationFn: (data: any) => adminApi.updateConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-config'] });
      toast.success('Content updated successfully');
    },
    onError: () => {
      toast.error('Failed to update content');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const config = data?.data?.config || {};
  const supportContent = config.supportContent || {};
  const legalContent = config.legalContent || {};

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig.mutate({
      supportContent: {
        helpFAQ: formData.helpFAQ || supportContent.helpFAQ,
        safetyGuidelines: formData.safetyGuidelines || supportContent.safetyGuidelines,
      },
    });
  };

  const handleLegalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig.mutate({
      legalContent: {
        termsOfService: formData.termsOfService || legalContent.termsOfService,
        privacyPolicy: formData.privacyPolicy || legalContent.privacyPolicy,
        communityGuidelines: formData.communityGuidelines || legalContent.communityGuidelines,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('support')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'support'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Support Content
            </button>
            <button
              onClick={() => setActiveTab('legal')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'legal'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Legal Content
            </button>
          </nav>
        </div>
      </div>

      {/* Support Content */}
      {activeTab === 'support' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Support Content</h2>
          <form onSubmit={handleSupportSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Help & FAQ
              </label>
              <textarea
                defaultValue={supportContent.helpFAQ || ''}
                onChange={(e) => setFormData({ ...formData, helpFAQ: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={15}
                placeholder="Enter Help & FAQ content here..."
              />
              <p className="mt-1 text-sm text-gray-500">
                This content will be displayed in the app's Help & FAQ section.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Safety & Guidelines
              </label>
              <textarea
                defaultValue={supportContent.safetyGuidelines || ''}
                onChange={(e) => setFormData({ ...formData, safetyGuidelines: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={15}
                placeholder="Enter Safety & Guidelines content here..."
              />
              <p className="mt-1 text-sm text-gray-500">
                This content will be displayed in the app's Safety & Guidelines section.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Save Support Content
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Legal Content */}
      {activeTab === 'legal' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Legal Content</h2>
          <form onSubmit={handleLegalSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Terms of Service
              </label>
              <textarea
                defaultValue={legalContent.termsOfService || ''}
                onChange={(e) => setFormData({ ...formData, termsOfService: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={15}
                placeholder="Enter Terms of Service content here..."
              />
              <p className="mt-1 text-sm text-gray-500">
                This content will be displayed in the app's Terms of Service section.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Privacy Policy
              </label>
              <textarea
                defaultValue={legalContent.privacyPolicy || ''}
                onChange={(e) => setFormData({ ...formData, privacyPolicy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={15}
                placeholder="Enter Privacy Policy content here..."
              />
              <p className="mt-1 text-sm text-gray-500">
                This content will be displayed in the app's Privacy Policy section.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Community Guidelines
              </label>
              <textarea
                defaultValue={legalContent.communityGuidelines || ''}
                onChange={(e) => setFormData({ ...formData, communityGuidelines: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={15}
                placeholder="Enter Community Guidelines content here..."
              />
              <p className="mt-1 text-sm text-gray-500">
                This content will be displayed in the app's Community Guidelines section.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Save Legal Content
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function ContentPage() {
  return (
    <ProtectedRoute>
      <ContentContent />
    </ProtectedRoute>
  );
}

