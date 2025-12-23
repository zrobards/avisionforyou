'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, DollarSign, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

import { NONPROFIT_TIERS, getTier } from '@/lib/config/tiers';

interface Invoice {
  id: string;
  number: string;
  title: string;
  amount: number;
  status: string;
  dueDate: string | Date;
  paidAt: string | Date | null;
  createdAt: string | Date;
}

interface MaintenancePlan {
  id: string;
  tier: string;
  status: string;
  monthlyPrice: number;
  currentPeriodEnd: string | Date | null;
  changeRequestsIncluded: number;
  changeRequestsUsed: number;
}

interface Project {
  id: string;
  name: string;
  maintenancePlan: MaintenancePlan;
  invoices: Invoice[];
}

interface BillingDashboardProps {
  projects: Project[];
}

export function BillingDashboard({ projects }: BillingDashboardProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const getStatusBadge = (status: string) => {
    const styles = {
      PAID: 'bg-green-500/20 text-green-400 border-green-500/30',
      SENT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      DRAFT: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      OVERDUE: 'bg-red-500/20 text-red-400 border-red-500/30',
      CANCELLED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || 'bg-slate-800 text-white/60 border-white/10'}`}>
        {status}
      </span>
    );
  };

  const getSubscriptionStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'CANCELLED':
      case 'CANCELED':
      case 'PAUSED':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'PAST_DUE':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return <Clock className="w-5 h-5 text-white/40" />;
    }
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount));
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="w-16 h-16 text-white/20 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Projects Yet</h3>
        <p className="text-white/60">You don't have any projects with billing information.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Selector */}
      {projects.length > 1 && (
        <div>
          <label htmlFor="project-select" className="block text-white font-medium mb-2">
            Select Project
          </label>
          <select
            id="project-select"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full md:w-auto px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedProject && (
        <>
          {/* Subscription Status */}
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-blue-400" />
              Maintenance Subscription
            </h3>

            {selectedProject.maintenancePlan ? (
              <div className="space-y-4">
                {(() => {
                  const plan = selectedProject.maintenancePlan;
                  const tierKey = (plan.tier || 'ESSENTIALS').toUpperCase() as keyof typeof NONPROFIT_TIERS;
                  const tierConfig = getTier(tierKey) || NONPROFIT_TIERS.ESSENTIALS;
                  const monthlyPrice = Number(plan.monthlyPrice) / 100; // Convert cents to dollars
                  
                  return (
                    <div className="bg-slate-800 border border-white/10 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getSubscriptionStatusIcon(plan.status)}
                          <div>
                            <div className="text-white font-medium">
                              {tierConfig.name}
                            </div>
                            <div className="text-sm text-white/60">
                              {plan.status === 'ACTIVE' ? 'Active' : plan.status}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">
                            {formatCurrency(monthlyPrice)}/mo
                          </div>
                        </div>
                      </div>

                      {plan.currentPeriodEnd && (
                        <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
                          <Calendar className="w-4 h-4" />
                          <span>Next billing date: {formatDate(plan.currentPeriodEnd)}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Plan Features */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3">Your Plan Includes:</h4>
                  <ul className="space-y-2 text-sm text-white/80">
                    <li>✓ Managed hosting & SSL certificate</li>
                    <li>✓ Security & plugin updates</li>
                    <li>✓ Daily automated backups</li>
                    <li>✓ Email support</li>
                    <li>✓ Performance monitoring</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
                <p className="text-yellow-400 mb-2">No active maintenance subscription</p>
                <p className="text-sm text-white/60">
                  Contact us to set up your maintenance plan
                </p>
              </div>
            )}
          </div>

          {/* Invoices */}
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-400" />
              Invoices
            </h3>

            {selectedProject.invoices.length > 0 ? (
              <div className="space-y-3">
                {selectedProject.invoices.map((invoice) => (
                  <motion.div
                    key={invoice.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800 border border-white/10 rounded-lg p-4 hover:border-blue-500/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className="w-4 h-4 text-white/60" />
                          <span className="text-white font-medium">{invoice.title}</span>
                          {getStatusBadge(invoice.status)}
                        </div>
                        <div className="text-sm text-white/60">
                          Invoice #{invoice.number} • {formatDate(invoice.createdAt)}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-white">
                          {formatCurrency(invoice.amount)}
                        </div>
                        {invoice.status === 'PAID' && invoice.paidAt && (
                          <div className="text-xs text-green-400">
                            Paid {formatDate(invoice.paidAt)}
                          </div>
                        )}
                        {invoice.status === 'OVERDUE' && (
                          <div className="text-xs text-red-400">
                            Due {formatDate(invoice.dueDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                <FileText className="w-12 h-12 mx-auto mb-2 text-white/20" />
                <p>No invoices yet</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

