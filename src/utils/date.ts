export function formatDate(dateISO: string): string {
  if (!dateISO) return ''
  const [datePart] = dateISO.split('T')
  const [year, month, day] = datePart.split('-')
  return `${day}/${month}/${year}`
}

export function isOverdue(dateISO: string): boolean {
  if (!dateISO) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dateISO + 'T00:00:00')
  return due < today
}

export function daysSince(dateISO: string): number {
  if (!dateISO) return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [datePart] = dateISO.split('T')
  const target = new Date(datePart + 'T00:00:00')
  const diff = today.getTime() - target.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function getOverdueLevel(days: number): 'none' | 'warning' | 'danger' | 'critical' {
  if (days >= 90) return 'critical'
  if (days >= 60) return 'danger'
  if (days >= 30) return 'warning'
  return 'none'
}
