'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Toggle } from '@/components/ui/Toggle';
import { useState } from 'react';

function PremiumContent() {
  const queryClient = useQueryClient();
  const [editingFeature, setEditingFeature] = useState<string | null>(null);

  const { data: statusData } = useQuery({
    queryKey: ['premium-status'],
    queryFn: () => adminApi.getPremiumStatus(),
  });

  const { data: featuresData } = useQuery({
    queryKey: ['premium-features'],
    queryFn: () => adminApi.getPremiumFeatures(),
  });

  const { data: plansData } = useQuery({
    queryKey: ['premium-plans'],
    queryFn: () => adminApi.getPremiumPlans(),
  });

  const togglePremiumMode = useMutation({
    mutationFn: (enabled: boolean) => adminApi.togglePremiumMode(enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['premium-status'] });
      toast.success('Premium mode updated');
    },
  });

  const toggleFeature = useMutation({
    mutationFn: (featureId: string) => adminApi.togglePremiumFeature(featureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['premium-features'] });
      toast.success('Feature toggled');
    },
  });

  const updateFeature = useMutation({
    mutationFn: ({ featureId, data }: { featureId: string; data: any }) =>
      adminApi.updatePremiumFeature(featureId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['premium-features'] });
      setEditingFeature(null);
      toast.success('Feature updated');
    },
  });

  const updatePlan = useMutation({
    mutationFn: ({ planId, data }: { planId: string; data: any }) =>
      adminApi.updatePremiumPlan(planId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['premium-plans'] });
      toast.success('Plan updated');
    },
  });

  const status = statusData?.data || {};
  const features = featuresData?.data?.features || [];
  const plans = plansData?.data?.plans || [];

  return (
    <div className="space-y-6">
      {/* Premium Master Switch */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Premium Mode</h2>
            <p className="text-sm text-gray-600 mt-1">
              Master switch to enable/disable all premium features
            </p>
          </div>
          <Toggle
            enabled={status.isPremiumEnabled || false}
            onChange={(enabled) => togglePremiumMode.mutate(enabled)}
            label={status.isPremiumEnabled ? 'Enabled' : 'Disabled'}
          />
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Status:</strong> {status.isPremiumEnabled ? 'Premium features are ENABLED' : 'App is FREE (Premium disabled)'}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Premium Users: {status.premiumUsersCount || 0} • Active Plans: {status.activePlans || 0}
          </p>
        </div>
      </div>

      {/* Premium Features */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Premium Features</h2>
        <div className="space-y-4">
          {features.map((feature: any) => (
            <div
              key={feature.featureId}
              className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-gray-900">{feature.name}</h3>
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      {feature.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                    <span>Free Limit: {feature.freeLimit === -1 ? 'Unlimited' : feature.freeLimit}</span>
                    <span>Premium Limit: {feature.premiumLimit === -1 ? 'Unlimited' : feature.premiumLimit}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Toggle
                    enabled={feature.isEnabled || false}
                    onChange={() => toggleFeature.mutate(feature.featureId)}
                    label={feature.isEnabled ? 'On' : 'Off'}
                  />
                  <button
                    onClick={() => setEditingFeature(editingFeature === feature.featureId ? null : feature.featureId)}
                    className="px-3 py-1 text-sm text-primary-600 hover:text-primary-700 border border-primary-300 rounded hover:bg-primary-50"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {editingFeature === feature.featureId && (
                <FeatureEditForm
                  feature={feature}
                  onSave={(data: any) => updateFeature.mutate({ featureId: feature.featureId, data })}
                  onCancel={() => setEditingFeature(null)}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Premium Plans */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Premium Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan: any) => (
            <PlanCard
              key={plan.planId}
              plan={plan}
              onUpdate={(data: any) => updatePlan.mutate({ planId: plan.planId, data })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FeatureEditForm({ feature, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    name: feature.name,
    description: feature.description,
    freeLimit: feature.freeLimit,
    premiumLimit: feature.premiumLimit,
    isEnabled: feature.isEnabled,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Free Limit</label>
          <input
            type="number"
            value={formData.freeLimit}
            onChange={(e) => setFormData({ ...formData, freeLimit: parseInt(e.target.value) || -1 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Premium Limit</label>
          <input
            type="number"
            value={formData.premiumLimit}
            onChange={(e) => setFormData({ ...formData, premiumLimit: parseInt(e.target.value) || -1 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function PlanCard({ plan, onUpdate }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: plan.name,
    priceInPaisa: plan.priceInPaisa,
    priceDisplay: plan.priceDisplay,
    durationDays: plan.durationDays,
    isActive: plan.isActive,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      {!isEditing ? (
        <>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">{plan.name}</h3>
            <span
              className={`px-2 py-1 text-xs rounded ${
                plan.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {plan.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{plan.priceDisplay}</p>
          <p className="text-sm text-gray-600">
            Duration: {plan.durationDays ? `${plan.durationDays} days` : 'Lifetime'}
          </p>
          {plan.savings && (
            <p className="text-sm text-green-600 mt-1 font-medium">{plan.savings}</p>
          )}
          <button
            onClick={() => setIsEditing(true)}
            className="mt-3 w-full px-3 py-2 text-sm text-primary-600 border border-primary-300 rounded hover:bg-primary-50"
          >
            Edit Plan
          </button>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
            <input
              type="number"
              step="0.01"
              value={formData.priceInPaisa / 100}
              onChange={(e) => {
                const price = parseFloat(e.target.value) * 100;
                setFormData({
                  ...formData,
                  priceInPaisa: price,
                  priceDisplay: `₹${e.target.value}`,
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
            <input
              type="number"
              value={formData.durationDays || ''}
              onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) || null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Leave empty for lifetime"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded"
            />
            <label className="text-sm text-gray-700">Active</label>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function PremiumPage() {
  return (
    <ProtectedRoute>
      <PremiumContent />
    </ProtectedRoute>
  );
}

