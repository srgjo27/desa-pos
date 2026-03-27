import { supabase } from './supabase'
import { logError } from './errorHandler'

export const ACTIVITY_TYPES = {
  AUTH_LOGIN: 'AUTH_LOGIN',
  AUTH_LOGOUT: 'AUTH_LOGOUT',
  AUTH_PIN_CHANGE: 'AUTH_PIN_CHANGE',
  POS_CHECKOUT: 'POS_CHECKOUT',
  POS_REFUND: 'POS_REFUND',
  INVENTORY_ADD: 'INVENTORY_ADD',
  INVENTORY_EDIT: 'INVENTORY_EDIT',
  INVENTORY_DELETE: 'INVENTORY_DELETE',
  INVENTORY_TRANSFER: 'INVENTORY_TRANSFER',
  SHIFT_OPEN: 'SHIFT_OPEN',
  SHIFT_CLOSE: 'SHIFT_CLOSE',
  SHIFT_ADJUST: 'SHIFT_ADJUST',
  REPORT_GENERATED: 'REPORT_GENERATED',
  REPORT_EXPORTED: 'REPORT_EXPORTED',
  USER_CREATE: 'USER_CREATE',
  USER_EDIT: 'USER_EDIT',
  USER_DELETE: 'USER_DELETE',
  SETTING_CHANGE: 'SETTING_CHANGE',
  ERROR_OCCURRED: 'ERROR_OCCURRED',
  SECURITY_ALERT: 'SECURITY_ALERT'
}

export async function logActivity({
  activityType,
  userId,
  description,
  metadata = {},
  ipAddress = null,
  userAgent = null
} = {}) {
  try {
    if (!activityType || !userId) return { success: false, error: 'Missing required fields' }

    if (!ipAddress) {
      ipAddress = await getClientIpAddress()
    }

    if (!userAgent) {
      userAgent = navigator.userAgent
    }

    const activityLog = {
      activity_type: activityType,
      user_id: userId,
      description,
      metadata: JSON.stringify(metadata),
      ip_address: ipAddress,
      user_agent: userAgent,
      created_at: new Date().toISOString(),
      timestamp: new Date().getTime()
    }

    const { data, error } = await supabase
      .from('activity_logs')
      .insert([activityLog])
      .select('id')

    if (error) console.error(error)

    return { success: true, logId: data?.[0]?.id }
  } catch (err) {
    logError(err, { context: 'activityLogService.logActivity', activityType })
    return { success: false, error: err.message }
  }
}

async function getClientIpAddress() {
  try {
    const response = await fetch('https://api.ipify.org?format=json', {
      timeout: 5000
    })
    const data = await response.json()
    return data.ip || 'UNKNOWN'
  } catch (err) {
    return 'UNKNOWN'
  }
}

export async function getActivityLogs({
  userId = null,
  activityType = null,
  startDate = null,
  endDate = null,
  limit = 100
} = {}) {
  try {
    let query = supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (activityType) {
      query = query.eq('activity_type', activityType)
    }

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString())
    }

    if (endDate) {
      query = query.lte('created_at', endDate.toISOString())
    }

    const { data, error } = await query

    if (error) console.error(error)

    return data || []
  } catch (err) {
    logError(err, { context: 'activityLogService.getActivityLogs' })
    return err
  }
}

export async function getActivitySummary(startDate, endDate) {
  try {
    const { data, error } = await supabase.rpc(
      'get_activity_summary',
      {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      }
    )

    if (error) console.error(error)

    return data || {}
  } catch (err) {
    logError(err, { context: 'activityLogService.getActivitySummary' })
    return err
  }
}

export function useActivityLog() {
  return {
    logActivity,
    ACTIVITY_TYPES,
    getActivityLogs,
    getActivitySummary
  }
}

export default {
  logActivity,
  getActivityLogs,
  getActivitySummary,
  useActivityLog,
  ACTIVITY_TYPES
}
