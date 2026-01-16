/**
 * Audit logging utility for tracking admin and board actions
 */

import { db } from './db';

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VIEW'
  | 'EXPORT'
  | 'LOGIN'
  | 'LOGOUT'
  | 'UPLOAD'
  | 'DOWNLOAD'
  | 'SEND_EMAIL'
  | 'APPROVE'
  | 'REJECT';

export interface AuditLogData {
  action: AuditAction;
  entity: string;
  entityId: string;
  userId: string;
  details?: Record<string, any>;
  ipAddress?: string;
}

/**
 * Log an admin or board action to the audit trail
 */
export async function logAuditAction(data: AuditLogData): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        userId: data.userId,
        details: data.details || {},
      },
    });
  } catch (error) {
    // Log error but don't throw - audit logging should not break the application
    console.error('Failed to log audit action:', error);
  }
}

/**
 * Log a board document action
 */
export async function logBoardDocumentAction(
  action: AuditAction,
  documentId: string,
  userId: string,
  details?: Record<string, any>
): Promise<void> {
  await logAuditAction({
    action,
    entity: 'BoardDocument',
    entityId: documentId,
    userId,
    details,
  });
}

/**
 * Log a board meeting action
 */
export async function logBoardMeetingAction(
  action: AuditAction,
  meetingId: string,
  userId: string,
  details?: Record<string, any>
): Promise<void> {
  await logAuditAction({
    action,
    entity: 'BoardMeeting',
    entityId: meetingId,
    userId,
    details,
  });
}

/**
 * Log a user management action
 */
export async function logUserAction(
  action: AuditAction,
  targetUserId: string,
  performedByUserId: string,
  details?: Record<string, any>
): Promise<void> {
  await logAuditAction({
    action,
    entity: 'User',
    entityId: targetUserId,
    userId: performedByUserId,
    details,
  });
}

/**
 * Log a data export action
 */
export async function logDataExport(
  entityType: string,
  userId: string,
  details?: Record<string, any>
): Promise<void> {
  await logAuditAction({
    action: 'EXPORT',
    entity: entityType,
    entityId: 'bulk',
    userId,
    details,
  });
}

/**
 * Get audit logs for a specific entity
 */
export async function getAuditLogs(
  entity: string,
  entityId?: string,
  limit: number = 50
) {
  const where: any = { entity };
  if (entityId) {
    where.entityId = entityId;
  }

  return db.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Get recent audit logs for all actions
 */
export async function getRecentAuditLogs(limit: number = 100) {
  return db.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
