'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { useState } from 'react';

function LimitsContent() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<any>({});
  const [chatPaymentData, setChatPaymentData] = useState<any>({});

  const { data, isLoading } = useQuery({
    queryKey: ['limits'],
    queryFn: () => adminApi.getLimits(),
  });

  const { data: chatPaymentSettings, isLoading: isChatPaymentLoading } = useQuery({
    queryKey: ['unrevealed-chat-payment'],
    queryFn: () => adminApi.getUnrevealedChatPaymentSettings(),
  });

  const updateLimits = useMutation({
    mutationFn: (data: any) => adminApi.updateLimits(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['limits'] });
      toast.success('Limits updated successfully');
    },
  });

  const updateChatPayment = useMutation({
    mutationFn: (data: any) => adminApi.updateUnrevealedChatPaymentSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unrevealed-chat-payment'] });
      toast.success('Chat payment settings updated successfully');
    },
  });

  if (isLoading || isChatPaymentLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const limits = data?.data?.limits || {};
  const moderation = data?.data?.moderation || {};
  const unrevealedChatPayment = chatPaymentSettings?.data?.unrevealedChatPayment || {
    isEnabled: true,
    freeMessageLimit: 100,
    pricePerMessageInPaisa: 200,
    priceDisplay: '₹2'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateLimits.mutate({
      limits: formData.limits || limits,
      moderation: formData.moderation || moderation,
    });
  };

  const handleChatPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceInPaisa = chatPaymentData.pricePerMessageInPaisa || unrevealedChatPayment.pricePerMessageInPaisa;
    const priceDisplay = `₹${(priceInPaisa / 100).toFixed(0)}`;
    
    updateChatPayment.mutate({
      isEnabled: chatPaymentData.isEnabled !== undefined ? chatPaymentData.isEnabled : unrevealedChatPayment.isEnabled,
      freeMessageLimit: chatPaymentData.freeMessageLimit || unrevealedChatPayment.freeMessageLimit,
      pricePerMessageInPaisa: priceInPaisa,
      priceDisplay
    });
  };

  return (
    <div className="space-y-6">
      {/* Unrevealed Chat Message Payment */}
      <form onSubmit={handleChatPaymentSubmit}>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Unrevealed Chat Message Payment</h2>
              <p className="text-sm text-gray-500 mt-1">
                Charge the initiator (person who sent the request) after they send X messages without revealing their identity
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={unrevealedChatPayment.isEnabled}
                onChange={(e) =>
                  setChatPaymentData({
                    ...chatPaymentData,
                    isEnabled: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900">
                {(chatPaymentData.isEnabled !== undefined ? chatPaymentData.isEnabled : unrevealedChatPayment.isEnabled) ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">How it works</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    When enabled, the person who <strong>initiated the chat request</strong> (and hasn&apos;t revealed their identity) 
                    will need to pay after sending the specified number of free messages. After payment, the counter resets and they 
                    get another batch of free messages.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Free Messages Before Payment
              </label>
              <input
                type="number"
                defaultValue={unrevealedChatPayment.freeMessageLimit}
                onChange={(e) =>
                  setChatPaymentData({
                    ...chatPaymentData,
                    freeMessageLimit: parseInt(e.target.value) || 100,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                min="1"
                max="1000"
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of messages the initiator can send before payment is required
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Message Cycle (in Paisa)
              </label>
              <input
                type="number"
                defaultValue={unrevealedChatPayment.pricePerMessageInPaisa}
                onChange={(e) =>
                  setChatPaymentData({
                    ...chatPaymentData,
                    pricePerMessageInPaisa: parseInt(e.target.value) || 200,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                min="100"
                max="100000"
                step="100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Amount in paisa (100 paisa = ₹1). Current: ₹{((chatPaymentData.pricePerMessageInPaisa || unrevealedChatPayment.pricePerMessageInPaisa) / 100).toFixed(2)}
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Summary</h4>
            <p className="text-sm text-gray-600">
              Users who send chat requests (and don&apos;t reveal their identity) will get{' '}
              <strong>{chatPaymentData.freeMessageLimit || unrevealedChatPayment.freeMessageLimit}</strong> free messages.
              After that, they need to pay{' '}
              <strong>₹{((chatPaymentData.pricePerMessageInPaisa || unrevealedChatPayment.pricePerMessageInPaisa) / 100).toFixed(2)}</strong>{' '}
              to send another {chatPaymentData.freeMessageLimit || unrevealedChatPayment.freeMessageLimit} messages.
              This cycle repeats until they reveal their identity.
            </p>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              disabled={updateChatPayment.isPending}
            >
              {updateChatPayment.isPending ? 'Saving...' : 'Save Chat Payment Settings'}
            </button>
          </div>
        </div>
      </form>

      <form onSubmit={handleSubmit}>
        {/* App Limits */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">App Limits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Photos per Profile
              </label>
              <input
                type="number"
                defaultValue={limits.maxPhotos || 4}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    limits: { ...formData.limits, maxPhotos: parseInt(e.target.value) || 4 },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="1"
                max="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Bio Length
              </label>
              <input
                type="number"
                defaultValue={limits.maxBioLength || 500}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    limits: { ...formData.limits, maxBioLength: parseInt(e.target.value) || 500 },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="50"
                max="2000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Message Length
              </label>
              <input
                type="number"
                defaultValue={limits.maxMessageLength || 2000}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    limits: { ...formData.limits, maxMessageLength: parseInt(e.target.value) || 2000 },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="100"
                max="5000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Expiry (Days)
              </label>
              <input
                type="number"
                defaultValue={limits.requestExpiryDays || 7}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    limits: { ...formData.limits, requestExpiryDays: parseInt(e.target.value) || 7 },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="1"
                max="30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Interests
              </label>
              <input
                type="number"
                defaultValue={limits.maxInterests || 10}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    limits: { ...formData.limits, maxInterests: parseInt(e.target.value) || 10 },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="3"
                max="20"
              />
            </div>
          </div>
        </div>

        {/* Moderation Settings */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Moderation Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto Suspend Report Count
              </label>
              <input
                type="number"
                defaultValue={moderation.autoSuspendReportCount || 5}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    moderation: {
                      ...formData.moderation,
                      autoSuspendReportCount: parseInt(e.target.value) || 5,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="1"
                max="20"
              />
              <p className="text-xs text-gray-500 mt-1">
                User will be auto-suspended after this many reports
              </p>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                defaultChecked={moderation.enableAIModeration || false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    moderation: {
                      ...formData.moderation,
                      enableAIModeration: e.target.checked,
                    },
                  })
                }
                className="rounded"
              />
              <label className="text-sm font-medium text-gray-700">Enable AI Moderation</label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

export default function LimitsPage() {
  return (
    <ProtectedRoute>
      <LimitsContent />
    </ProtectedRoute>
  );
}

