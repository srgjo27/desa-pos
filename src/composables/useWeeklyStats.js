import { ref, computed } from 'vue'
import { WORK_MINUTES_PER_WEEK, getDiffMinutes, formatDuration, getMonday, getSunday } from '@/utils/shiftHelpers'
import { formatDate } from '@/utils/format'

export function useWeeklyStats(shiftsRef) {
    const selectedWeekOffset = ref(0)

    const isCurrentWeek = computed(() => selectedWeekOffset.value === 0)

    const selectedMonday = computed(() => getMonday(new Date(), selectedWeekOffset.value))

    const selectedSunday = computed(() => getSunday(selectedMonday.value))

    const weekLabel = computed(() => {
        return `${formatDate(selectedMonday.value)} — ${formatDate(selectedSunday.value)}`
    })

    const filteredShifts = computed(() => {
        if (!shiftsRef.value?.length) return []

        return shiftsRef.value.filter(s => {
            const d = new Date(s.opened_at)
            return d >= selectedMonday.value && d <= selectedSunday.value
        })
    })

    const weeklyStats = computed(() => {
        const defaultStats = {
            totalMinutes: 0,
            text: '0j 0m',
            diffText: 'Kurang 40j 0m',
            isMet: false,
            targetMinutes: WORK_MINUTES_PER_WEEK
        }

        if (!filteredShifts.value.length) return defaultStats

        let totalMinutes = 0
        filteredShifts.value.forEach(s => {
            totalMinutes += getDiffMinutes(s.opened_at, s.closed_at)
        })

        const isMet = totalMinutes >= WORK_MINUTES_PER_WEEK
        let diffText = ''

        if (isMet) {
            const extra = totalMinutes - WORK_MINUTES_PER_WEEK
            diffText = extra > 0
                ? `Memenuhi Target (Lembur +${formatDuration(extra)})`
                : 'Memenuhi Target Pas (40 Jam)'
        } else {
            const lack = WORK_MINUTES_PER_WEEK - totalMinutes
            diffText = `Kurang ${formatDuration(lack)} dari Target Mingguan`
        }

        return {
            totalMinutes,
            text: formatDuration(totalMinutes),
            diffText,
            isMet,
            targetMinutes: WORK_MINUTES_PER_WEEK
        }
    })

    const prevWeek = () => {
        selectedWeekOffset.value--
    }

    const nextWeek = () => {
        if (selectedWeekOffset.value < 0) {
            selectedWeekOffset.value++
        }
    }

    const resetWeek = () => {
        selectedWeekOffset.value = 0
    }

    const getProgressPercentage = () => {
        return Math.min(100, (weeklyStats.value.totalMinutes / weeklyStats.value.targetMinutes) * 100)
    }

    return {
        selectedWeekOffset,
        isCurrentWeek,
        selectedMonday,
        selectedSunday,
        weekLabel,
        filteredShifts,
        weeklyStats,
        prevWeek,
        nextWeek,
        resetWeek,
        getProgressPercentage
    }
}
