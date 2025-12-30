'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { useState } from 'react';

function SettingsContent() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<any>({});

  const { data, isLoading } = useQuery({
    queryKey: ['app-config'],
    queryFn: () => adminApi.getConfig(),
  });

  const updateConfig = useMutation({
    mutationFn: (data: any) => adminApi.updateConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-config'] });
      toast.success('Configuration updated');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig.mutate({
      appName: formData.appName || config.appName,
      appVersion: formData.appVersion || config.appVersion,
      maintenanceMode: formData.maintenanceMode !== undefined ? formData.maintenanceMode : config.maintenanceMode,
      maintenanceMessage: formData.maintenanceMessage || config.maintenanceMessage,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">App Configuration</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">App Name</label>
              <input
                type="text"
                defaultValue={config.appName || 'bibbly'}
                onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">App Version</label>
              <input
                type="text"
                defaultValue={config.appVersion || '1.0.0'}
                onChange={(e) => setFormData({ ...formData, appVersion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t">
            <input
              type="checkbox"
              defaultChecked={config.maintenanceMode || false}
              onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
              className="rounded"
            />
            <label className="text-sm font-medium text-gray-700">Maintenance Mode</label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maintenance Message
            </label>
            <textarea
              defaultValue={config.maintenanceMessage || ''}
              onChange={(e) => setFormData({ ...formData, maintenanceMessage: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
              placeholder="App is under maintenance. Please try again later."
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Current Config Info */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Configuration</h3>
        <div className="space-y-2 text-sm">
          <p>
            <strong>App Name:</strong> {config.appName || 'bibbly'}
          </p>
          <p>
            <strong>Version:</strong> {config.appVersion || '1.0.0'}
          </p>
          <p>
            <strong>Maintenance Mode:</strong> {config.maintenanceMode ? 'Enabled' : 'Disabled'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}

