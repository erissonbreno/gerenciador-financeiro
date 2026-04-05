export function formatDate(dateISO: string): string {
  if (!dateISO) return ''
  const [year, month, day] = dateISO.split('-')
  return `${day}/${month}/${year}`
}

export function isOverdue(dateISO: string): boolean {
  if (!dateISO) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dateISO + 'T00:00:00')
  return due < today
}
