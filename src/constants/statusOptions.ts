import type { DerivedStatus, StatusConfig } from '../types/models'

export const statusOptions: Record<DerivedStatus, StatusConfig> = {
  pending: {
    label: 'Pendente',
    colorClass: 'bg-yellow-100 text-yellow-800',
  },
  paid: {
    label: 'Pago',
    colorClass: 'bg-accent-100 text-accent-800',
  },
  overdue: {
    label: 'Vencido',
    colorClass: 'bg-red-100 text-red-800',
  },
}
