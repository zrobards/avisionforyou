'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Plus,
  Trash2,
  Check,
  X,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Shield,
} from 'lucide-react';
import Link from 'next/link';

interface PaymentMethod {
  id: string;
  type: string;
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  } | null;
  isDefault: boolean;
  created: number;
}

export default function PaymentMethodsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchPaymentMethods();
    }
  }, [status, router]);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/client/payment-methods');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch payment methods');
      }

      setPaymentMethods(data.paymentMethods || []);
    } catch (err: any) {
      console.error('Error fetching payment methods:', err);
      setError(err.message || 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    try {
      setIsAdding(true);
      setError(null);

      // Create setup intent
      const response = await fetch('/api/client/payment-methods', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create setup intent');
      }

      // Open Stripe's customer portal for adding payment methods
      // This is a simple approach - in production you might want to use Stripe Elements
      const portalResponse = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/client/payment-methods`,
        }),
      });

      const portalData = await portalResponse.json();

      if (!portalResponse.ok) {
        throw new Error(portalData.error || 'Failed to open payment portal');
      }

      if (portalData.url) {
        window.location.href = portalData.url;
      } else {
        throw new Error('No portal URL received');
      }
    } catch (err: any) {
      console.error('Error adding payment method:', err);
      setError(err.message || 'Failed to add payment method');
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      setDeletingId(id);
      setError(null);

      const response = await fetch(`/api/client/payment-methods/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete payment method');
      }

      // Refresh payment methods
      await fetchPaymentMethods();
    } catch (err: any) {
      console.error('Error deleting payment method:', err);
      setError(err.message || 'Failed to delete payment method');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      setSettingDefaultId(id);
      setError(null);

      const response = await fetch(`/api/client/payment-methods/${id}`, {
        method: 'PATCH',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set default payment method');
      }

      // Refresh payment methods
      await fetchPaymentMethods();
    } catch (err: any) {
      console.error('Error setting default payment method:', err);
      setError(err.message || 'Failed to set default payment method');
    } finally {
      setSettingDefaultId(null);
    }
  };

  const getCardBrandIcon = (brand: string) => {
    const brandLower = brand.toLowerCase();
    if (brandLower.includes('visa')) return '💳';
    if (brandLower.includes('mastercard')) return '💳';
    if (brandLower.includes('amex') || brandLower.includes('american')) return '💳';
    if (brandLower.includes('discover')) return '💳';
    return '💳';
  };

  const formatExpiry = (month: number, year: number) => {
    return `${String(month).padStart(2, '0')}/${String(year).slice(-2)}`;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading payment methods...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/client/settings?tab=billing"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Billing Settings</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30">
              <CreditCard className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Payment Methods</h1>
              <p className="text-gray-400">Manage your saved payment methods</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-400 font-medium">Error</p>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Add Payment Method Button */}
        <div className="mb-6">
          <button
            onClick={handleAddPaymentMethod}
            disabled={isAdding}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add Payment Method</span>
              </>
            )}
          </button>
        </div>

        {/* Payment Methods List */}
        {paymentMethods.length === 0 ? (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
            <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No payment methods</h3>
            <p className="text-gray-400 mb-6">
              Add a payment method to enable automatic billing and faster checkout.
            </p>
            <button
              onClick={handleAddPaymentMethod}
              disabled={isAdding}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Payment Method</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((pm) => (
              <motion.div
                key={pm.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-lg">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="text-white font-medium">
                          {pm.card
                            ? `${getCardBrandIcon(pm.card.brand)} •••• •••• •••• ${pm.card.last4}`
                            : 'Card'}
                        </p>
                        {pm.isDefault && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">
                            Default
                          </span>
                        )}
                      </div>
                      {pm.card && (
                        <p className="text-sm text-gray-400 mt-1">
                          Expires {formatExpiry(pm.card.expMonth, pm.card.expYear)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!pm.isDefault && (
                      <button
                        onClick={() => handleSetDefault(pm.id)}
                        disabled={settingDefaultId === pm.id}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {settingDefaultId === pm.id ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Setting...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Set as Default</span>
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(pm.id)}
                      disabled={deletingId === pm.id || pm.isDefault}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={pm.isDefault ? 'Cannot delete default payment method' : 'Delete'}
                    >
                      {deletingId === pm.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-blue-400 font-medium mb-2">Secure Payment Processing</h4>
              <p className="text-sm text-gray-300">
                Your payment information is securely stored and processed by Stripe. We never store
                your full card details on our servers. All transactions are encrypted and PCI
                compliant.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

