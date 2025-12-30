'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Toggle } from '@/components/ui/Toggle';

function FeaturesContent() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: () => adminApi.getFeatureFlags(),
  });

  const updateFlags = useMutation({
    mutationFn: (data: any) => adminApi.updateFeatureFlags(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      toast.success('Feature flags updated');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const flags = data?.data?.featureFlags || {};

  const handleToggle = (key: string, value: boolean) => {
    updateFlags.mutate({
      featureFlags: {
        ...flags,
        [key]: value,
      },
    });
  };

  const featureList = [
    {
      key: 'enableGoogleAuth',
      label: 'Google Authentication',
      description: 'Allow users to sign in with Google',
    },
    {
      key: 'enableAnonymousMessaging',
      label: 'Anonymous Messaging',
      description: 'Enable anonymous message requests',
    },
    {
      key: 'enableIdentityReveal',
      label: 'Identity Reveal',
      description: 'Allow users to reveal their identity in conversations',
    },
    {
      key: 'enableSearch',
      label: 'User Search',
      description: 'Enable search functionality',
    },
    {
      key: 'enableDiscovery',
      label: 'Discovery Feed',
      description: 'Enable discovery feed feature',
    },
    {
      key: 'enableNotifications',
      label: 'Push Notifications',
      description: 'Enable push notifications',
    },
    {
      key: 'enableProfileSharing',
      label: 'Profile Sharing',
      description: 'Allow users to share profile links',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Feature Flags</h2>
        <p className="text-sm text-gray-600 mb-6">
          Toggle app features on or off. Changes take effect immediately.
        </p>

        <div className="space-y-4">
          {featureList.map((feature) => (
            <div
              key={feature.key}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{feature.label}</h3>
                <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
              </div>
              <Toggle
                enabled={flags[feature.key] || false}
                onChange={(enabled) => handleToggle(feature.key, enabled)}
                label={flags[feature.key] ? 'Enabled' : 'Disabled'}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <ProtectedRoute>
      <FeaturesContent />
    </ProtectedRoute>
  );
}

