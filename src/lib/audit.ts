// src/lib/audit.ts
// H5: Helper for recording admin actions into AdminAuditLog

import { db } from '@/lib/db'

export interface AdminActionParams {
  adminId:    string
  action:     string
  entityType: string
  entityId:   string
  oldValue?:  unknown
  newValue?:  unknown
}

/**
 * Writes a single row to AdminAuditLog.
 * Non-fatal — caller should `.catch()` so audit failures never break the main flow.
 */
export async function logAdminAction(params: AdminActionParams): Promise<void> {
  await db.adminAuditLog.create({
    data: {
      adminId:    params.adminId,
      action:     params.action,
      entityType: params.entityType,
      entityId:   params.entityId,
      oldValue:   params.oldValue !== undefined ? (params.oldValue as object) : undefined,
      newValue:   params.newValue !== undefined ? (params.newValue as object) : undefined,
    },
  })
}
