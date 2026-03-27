import { ref } from 'vue'
import { supabase } from '@/services/supabase'
import { useShiftStore } from '@/stores/shiftStore'
import { useAuthStore } from '@/stores/authStore'
import { logActivity, ACTIVITY_TYPES } from '@/services/activityLogService'

export function useShift() {
  const shiftStore = useShiftStore()
  const authStore = useAuthStore()
  const loading = ref(false)
  const error = ref(null)

  async function checkActiveShift(userId) {
    const { data, error: dbError } = await supabase
      .from('shifts')
      .select('id, user_id, opening_cash, status, opened_at')
      .eq('user_id', userId)
      .eq('status', 'OPEN')
      .maybeSingle()

    if (dbError)return null
    if (data) shiftStore.setShift(data)

    return data
  }

  async function openShift(openingCash) {
    loading.value = true
    error.value = null

    try {
      const { data, error: dbError } = await supabase
        .from('shifts')
        .insert({
          user_id: authStore.user.id,
          opening_cash: openingCash,
          status: 'OPEN',
        })
        .select('id, user_id, opening_cash, status, opened_at')
        .single()

      if (dbError) {
        error.value = 'Gagal memulai shift. Coba lagi.'
        return { success: false }
      }

      shiftStore.setShift(data)
      
      await logActivity({
        activityType: ACTIVITY_TYPES.SHIFT_OPEN,
        userId: authStore.user.id,
        description: `Shift opened - Opening cash: Rp${openingCash.toLocaleString('id-ID')}`,
        metadata: {
          shiftId: data.id,
          userId: authStore.user.id,
          userName: authStore.user.name,
          openingCash,
          openedAt: data.opened_at,
          timestamp: new Date().toISOString()
        }
      })
      
      return { success: true, shift: data }
    } catch (err) {
      error.value = 'Terjadi kesalahan tidak terduga.'
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  async function closeShift(shiftId, closingCash, expectedCash, notes = '') {
    loading.value = true
    error.value = null

    try {
      const { error: dbError } = await supabase
        .from('shifts')
        .update({
          closing_cash: closingCash,
          expected_cash: expectedCash,
          notes,
          status: 'CLOSED',
          closed_at: new Date().toISOString(),
        })
        .eq('id', shiftId)

      if (dbError) {
        error.value = 'Gagal menutup shift. Coba lagi.'
        return { success: false }
      }

      shiftStore.clearShift()
      
      await logActivity({
        activityType: ACTIVITY_TYPES.SHIFT_CLOSE,
        userId: authStore.user.id,
        description: `Shift closed - Closing cash: Rp${closingCash.toLocaleString('id-ID')}, Expected: Rp${expectedCash.toLocaleString('id-ID')}, Difference: Rp${(closingCash - expectedCash).toLocaleString('id-ID')}`,
        metadata: {
          shiftId: shiftId,
          userId: authStore.user.id,
          userName: authStore.user.name,
          closingCash,
          expectedCash,
          difference: closingCash - expectedCash,
          notes: notes || 'No notes',
          closedAt: new Date().toISOString(),
          timestamp: new Date().toISOString()
        }
      })
      
      return { success: true }
    } catch (err) {
      error.value = 'Terjadi kesalahan tidak terduga.'
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  return { checkActiveShift, openShift, closeShift, loading, error }
}
