import { ProspectStatus } from '@prisma/client';

/**
 * Get status badge styling classes
 */
export function getStatusBadgeClasses(status: ProspectStatus): string {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  
  switch (status) {
    case 'PROSPECT':
      return `${baseClasses} bg-gray-100 text-gray-800`;
    case 'REVIEWING':
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case 'QUALIFIED':
      return `${baseClasses} bg-blue-100 text-blue-800`;
    case 'DRAFT_READY':
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case 'CONTACTED':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'RESPONDED':
      return `${baseClasses} bg-purple-100 text-purple-800`;
    case 'MEETING':
      return `${baseClasses} bg-indigo-100 text-indigo-800`;
    case 'PROPOSAL':
      return `${baseClasses} bg-pink-100 text-pink-800`;
    case 'NEGOTIATING':
      return `${baseClasses} bg-orange-100 text-orange-800`;
    case 'CONVERTED':
      return `${baseClasses} bg-emerald-100 text-emerald-800`;
    case 'LOST':
      return `${baseClasses} bg-red-100 text-red-800`;
    case 'ARCHIVED':
      return `${baseClasses} bg-gray-100 text-gray-500`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
}

/**
 * Get human-readable status label
 */
export function getStatusLabel(status: ProspectStatus): string {
  switch (status) {
    case 'PROSPECT':
      return 'Prospect';
    case 'REVIEWING':
      return 'Reviewing';
    case 'QUALIFIED':
      return 'Qualified';
    case 'DRAFT_READY':
      return 'Draft Ready';
    case 'CONTACTED':
      return 'Contacted';
    case 'RESPONDED':
      return 'Responded';
    case 'MEETING':
      return 'Meeting Scheduled';
    case 'PROPOSAL':
      return 'Proposal Sent';
    case 'NEGOTIATING':
      return 'Negotiating';
    case 'CONVERTED':
      return 'Converted';
    case 'LOST':
      return 'Lost';
    case 'ARCHIVED':
      return 'Archived';
    default:
      return status;
  }
}

/**
 * Validate status transition
 * Returns true if transition is valid, false otherwise
 */
export function isValidStatusTransition(
  from: ProspectStatus,
  to: ProspectStatus
): boolean {
  // Allowed transitions (generally forward progression, but allow backward for corrections)
  const allowedTransitions: Record<ProspectStatus, ProspectStatus[]> = {
    PROSPECT: ['REVIEWING', 'QUALIFIED', 'ARCHIVED', 'LOST'],
    REVIEWING: ['PROSPECT', 'QUALIFIED', 'ARCHIVED', 'LOST'],
    QUALIFIED: ['DRAFT_READY', 'CONTACTED', 'REVIEWING', 'ARCHIVED', 'LOST'],
    DRAFT_READY: ['QUALIFIED', 'CONTACTED', 'ARCHIVED'],
    CONTACTED: ['RESPONDED', 'MEETING', 'QUALIFIED', 'ARCHIVED', 'LOST'],
    RESPONDED: ['MEETING', 'PROPOSAL', 'CONTACTED', 'ARCHIVED', 'LOST'],
    MEETING: ['PROPOSAL', 'NEGOTIATING', 'RESPONDED', 'ARCHIVED', 'LOST'],
    PROPOSAL: ['NEGOTIATING', 'CONVERTED', 'MEETING', 'ARCHIVED', 'LOST'],
    NEGOTIATING: ['CONVERTED', 'PROPOSAL', 'ARCHIVED', 'LOST'],
    CONVERTED: ['ARCHIVED'], // Once converted, can only archive
    LOST: ['ARCHIVED'], // Once lost, can only archive
    ARCHIVED: ['PROSPECT'], // Can unarchive back to prospect
  };

  return allowedTransitions[from]?.includes(to) ?? false;
}

/**
 * Get status order for sorting
 */
export function getStatusOrder(status: ProspectStatus): number {
  const order: Record<ProspectStatus, number> = {
    PROSPECT: 0,
    REVIEWING: 1,
    QUALIFIED: 2,
    DRAFT_READY: 3,
    CONTACTED: 4,
    RESPONDED: 5,
    MEETING: 6,
    PROPOSAL: 7,
    NEGOTIATING: 8,
    CONVERTED: 9,
    LOST: 10,
    ARCHIVED: 11,
  };

  return order[status] ?? 99;
}

/**
 * Get next suggested status
 */
export function getNextSuggestedStatus(currentStatus: ProspectStatus): ProspectStatus | null {
  const nextStatus: Record<ProspectStatus, ProspectStatus | null> = {
    PROSPECT: 'REVIEWING',
    REVIEWING: 'QUALIFIED',
    QUALIFIED: 'DRAFT_READY',
    DRAFT_READY: 'CONTACTED',
    CONTACTED: 'RESPONDED',
    RESPONDED: 'MEETING',
    MEETING: 'PROPOSAL',
    PROPOSAL: 'NEGOTIATING',
    NEGOTIATING: 'CONVERTED',
    CONVERTED: null,
    LOST: null,
    ARCHIVED: null,
  };

  return nextStatus[currentStatus] ?? null;
}

