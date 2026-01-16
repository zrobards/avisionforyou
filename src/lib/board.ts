/**
 * Board utility functions for role checking and access control
 */

import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

/**
 * Check if a user is a board member (STAFF role = board members)
 */
export function isBoardMember(role: string): boolean {
  return role === 'STAFF' || role === 'ADMIN';
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
 * Get role display name
 */
export function getRoleDisplay(role: string): string {
  const roleMap: Record<string, string> = {
    STAFF: 'Board Member',
    ADMIN: 'Administrator',
    USER: 'User',
  };

  return roleMap[role] || role;
}
