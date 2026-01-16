/**
 * Board utility functions for role checking and access control
 */

import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

/**
 * Board role types from TeamRole enum
 */
export const BOARD_ROLES = [
  'BOARD_PRESIDENT',
  'BOARD_VP',
  'BOARD_TREASURER',
  'BOARD_SECRETARY',
  'BOARD_MEMBER',
] as const;

export type BoardRole = typeof BOARD_ROLES[number];

/**
 * Check if a user role is a board role
 */
export function isBoardRole(role: string): role is BoardRole {
  return BOARD_ROLES.includes(role as BoardRole);
}

/**
 * Check if a user is a board member (has any BOARD_* role)
 */
export function isBoardMember(role: string): boolean {
  return isBoardRole(role) || role === 'ADMIN';
}

/**
 * Get the current user's session and check if they are a board member
 */
export async function requireBoardAccess() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error('Unauthorized: Not logged in');
  }

  const userRole = (session.user as any).role || 'USER';
  
  if (!isBoardMember(userRole)) {
    throw new Error('Forbidden: Board member access required');
  }

  return {
    user: session.user,
    role: userRole,
  };
}

/**
 * Get board member display info
 */
export function getBoardRoleDisplay(role: string): string {
  const roleMap: Record<string, string> = {
    BOARD_PRESIDENT: 'Board President',
    BOARD_VP: 'Board Vice President',
    BOARD_TREASURER: 'Board Treasurer',
    BOARD_SECRETARY: 'Board Secretary',
    BOARD_MEMBER: 'Board Member',
    ADMIN: 'Administrator',
  };

  return roleMap[role] || role;
}

/**
 * Check if a role has executive board privileges (President, VP, Treasurer, Secretary)
 */
export function isExecutiveBoardMember(role: string): boolean {
  return ['BOARD_PRESIDENT', 'BOARD_VP', 'BOARD_TREASURER', 'BOARD_SECRETARY', 'ADMIN'].includes(role);
}
