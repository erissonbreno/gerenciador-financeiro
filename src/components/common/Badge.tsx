import { statusOptions } from '../../constants/statusOptions'
import type { DerivedStatus } from '../../types/models'

interface BadgeProps {
  status: DerivedStatus
}

export function Badge({ status }: BadgeProps) {
  const config = statusOptions[status] || statusOptions.pending
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${config.colorClass}`}>
      {config.label}
    </span>
  )
}
