'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useDialogContext } from '@/lib/dialog';
import { 
  Settings, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  AlertTriangle,
  Clock,
  RefreshCw,
  Lock,
} from 'lucide-react';

interface MaintenancePlan {
  id: string;
  tier: string;
  monthlyPrice: number | string;
  status: string;
  supportHoursIncluded: number;
  supportHoursUsed: number;
  changeRequestsIncluded: number;
  changeRequestsUsed: number;
  createdAt: string;
  project: {
    id: string;
    name: string;
    organization: {
      id: string;
      name: string;
    };
  };
}

interface MaintenancePlanManagerProps {
  onPlanSelect?: (planId: string) => void;
  selectedPlanId?: string;
}

export function MaintenancePlanManager({ 
  onPlanSelect, 
  selectedPlanId 
}: MaintenancePlanManagerProps) {
  const { data: session } = useSession();
  const dialog = useDialogContext();
  const [plans, setPlans] = useState<MaintenancePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    supportHoursIncluded: number;
    changeRequestsIncluded: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // SECURITY: Only allow admins to edit hours
  const isAdmin = ['ADMIN', 'CEO', 'CFO'].includes(session?.user?.role || '');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/client/maintenance-plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      } else {
        setError('Failed to load maintenance plans');
      }
    } catch (err) {
      console.error('Failed to fetch plans:', err);
      setError('Failed to load maintenance plans');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: MaintenancePlan) => {
    setEditingId(plan.id);
    setEditValues({
      supportHoursIncluded: plan.supportHoursIncluded,
      changeRequestsIncluded: plan.changeRequestsIncluded,
    });
  };

  const handleSave = async (planId: string) => {
    if (!editValues) return;

    // SECURITY: Double-check on client side (server will also enforce)
    if (!isAdmin) {
      setError('Only administrators can modify maintenance plans. Hours are managed automatically through your subscription.');
      return;
    }

    try {
      const response = await fetch(`/api/client/maintenance-plans/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editValues),
      });

      if (response.ok) {
        await fetchPlans();
        setEditingId(null);
        setEditValues(null);
        setError(null);
      } else {
        const data = await response.json();
        setError(data.error || data.message || 'Failed to update plan');
      }
    } catch (err) {
      console.error('Failed to update plan:', err);
      setError('Failed to update plan');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues(null);
    setError(null);
  };

  const handleDelete = async (planId: string) => {
    const confirmed = await dialog.confirm('Are you sure you want to cancel this maintenance plan? This action cannot be undone.', {
      title: 'Cancel Maintenance Plan',
      variant: 'danger',
    });
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/client/maintenance-plans/${planId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchPlans();
        setError(null);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to cancel plan');
      }
    } catch (err) {
      console.error('Failed to cancel plan:', err);
      setError('Failed to cancel plan');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900/50 border border-white/10 rounded-xl p-6">
        <div className="text-center text-gray-400">Loading maintenance plans...</div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-white/10 rounded-xl p-6">
        <div className="text-center text-gray-400">No maintenance plans found</div>
      </div>
    );
  }

  const activePlans = plans.filter(p => p.status === 'ACTIVE');

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {!isAdmin && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
          <Lock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-400 mb-1">Hours Management</p>
            <p className="text-xs text-blue-300/80">
              Your support hours are managed automatically through your subscription and purchases. 
              Hours cannot be manually modified. Contact support if you need assistance.
            </p>
          </div>
        </div>
      )}

      <div className="bg-gray-900/50 border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Maintenance Plans</h3>
          <span className="text-sm text-gray-400">
            {activePlans.length} active plan{activePlans.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="space-y-4">
          {plans.map((plan) => {
            const isEditing = editingId === plan.id;
            const isSelected = selectedPlanId === plan.id;
            const isActive = plan.status === 'ACTIVE';

            return (
              <div
                key={plan.id}
                className={`p-4 rounded-lg border ${
                  isSelected
                    ? 'border-cyan-500/50 bg-cyan-500/10'
                    : isActive
                    ? 'border-white/10 bg-white/5'
                    : 'border-gray-700/50 bg-gray-800/30'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-white">{plan.project.name}</h4>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          isActive
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}
                      >
                        {plan.status}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {plan.tier}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      ${(Number(plan.monthlyPrice) / 100).toFixed(0)}/mo
                    </p>
                  </div>

                  {isActive && (
                    <div className="flex items-center gap-2">
                      {onPlanSelect && (
                        <button
                          onClick={() => onPlanSelect(plan.id)}
                          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                            isSelected
                              ? 'bg-cyan-500 text-white'
                              : 'bg-white/10 text-gray-300 hover:bg-white/20'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </button>
                      )}
                      {!isEditing && isAdmin && (
                        <>
                          <button
                            onClick={() => handleEdit(plan)}
                            className="p-2 rounded bg-white/10 text-gray-300 hover:bg-white/20 transition-colors"
                            title="Edit plan (Admin only)"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(plan.id)}
                            className="p-2 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                            title="Cancel plan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {!isAdmin && (
                        <div className="p-2 rounded bg-gray-700/50 text-gray-500" title="Only administrators can modify plans">
                          <Lock className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3 pt-3 border-t border-white/10">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Support Hours Included
                      </label>
                      <input
                        type="number"
                        min="-1"
                        value={editValues?.supportHoursIncluded ?? ''}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues!,
                            supportHoursIncluded: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded text-white"
                        placeholder="-1 for unlimited"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Change Requests Included
                      </label>
                      <input
                        type="number"
                        min="-1"
                        value={editValues?.changeRequestsIncluded ?? ''}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues!,
                            changeRequestsIncluded: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded text-white"
                        placeholder="-1 for unlimited"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSave(plan.id)}
                        className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center gap-1 text-gray-400 mb-1">
                        <Clock className="w-4 h-4" />
                        Support Hours
                      </div>
                      <p className="text-white">
                        {plan.supportHoursUsed} / {plan.supportHoursIncluded === -1 ? '∞' : plan.supportHoursIncluded} used
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

