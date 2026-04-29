import { logActivity } from '../services/activityLogService'

export async function logActivityHelper(activityType, userId, description, metadata = {}) {
    try {
        const enrichedMetadata = {
            timestamp: new Date().toISOString(),
            ...metadata
        }

        await logActivity({
            activityType,
            userId,
            description,
            metadata: enrichedMetadata
        })
    } catch (_) { }
}
