const WORK_MINUTES_PER_DAY = 480
const WORK_MINUTES_PER_WEEK = 40 * 60

export { WORK_MINUTES_PER_DAY, WORK_MINUTES_PER_WEEK }

export function getDiffMinutes(start, end) {
  const endTime = end ? new Date(end) : new Date()
  return Math.floor((endTime - new Date(start)) / 60000)
}

export function formatDuration(totalMinutes) {
  return `${Math.floor(totalMinutes / 60)}j ${totalMinutes % 60}m`
}

export function getMonday(date = new Date(), weekOffset = 0) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff + weekOffset * 7)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getSunday(mondayDate) {
  const d = new Date(mondayDate)
  d.setDate(d.getDate() + 6)
  d.setHours(23, 59, 59, 999)
  return d
}

export function getDurationInfo(start, end) {
  const totalMinutes = getDiffMinutes(start, end)
  const text = formatDuration(totalMinutes)

  if (!end) {
    return {
      text,
      label: totalMinutes > WORK_MINUTES_PER_DAY ? 'Lembur / Belum Tutup' : 'Sedang Bertugas',
      isOver: totalMinutes > WORK_MINUTES_PER_DAY
    }
  }

  if (totalMinutes > WORK_MINUTES_PER_DAY) {
    const over = totalMinutes - WORK_MINUTES_PER_DAY
    return { text, label: `Kelebihan ${formatDuration(over)}`, isOver: true }
  }

  if (totalMinutes < WORK_MINUTES_PER_DAY) {
    const under = WORK_MINUTES_PER_DAY - totalMinutes
    return { text, label: `Kurang ${formatDuration(under)}`, isOver: false }
  }

  return { text, label: 'Tepat 8 Jam', isOver: false }
}
