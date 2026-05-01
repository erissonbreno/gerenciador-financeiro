import type { SelectOption } from '../types/models'

export const PAYMENT_TYPES: SelectOption[] = [
  { value: 'particular', label: 'Particular' },
  { value: 'convenio', label: 'Convênio' },
]

export const PAYMENT_METHODS: SelectOption[] = [
  { value: 'especie', label: 'Espécie' },
  { value: 'debito', label: 'Débito' },
  { value: 'credito', label: 'Crédito' },
]

export const CREDIT_MODES: SelectOption[] = [
  { value: 'avista', label: 'À vista' },
  { value: 'parcelado', label: 'Parcelado' },
]

export const CONVENIO_TYPES: SelectOption[] = [
  { value: 'Unimed', label: 'Unimed' },
  { value: 'Bradesco Saúde', label: 'Bradesco Saúde' },
  { value: 'SulAmérica', label: 'SulAmérica' },
  { value: 'Amil', label: 'Amil' },
  { value: 'Hapvida', label: 'Hapvida' },
  { value: 'NotreDame Intermédica', label: 'NotreDame Intermédica' },
  { value: 'CASSI', label: 'CASSI' },
  { value: 'GEAP', label: 'GEAP' },
  { value: 'Outros', label: 'Outros' },
]

export const MAX_INSTALLMENTS = 6

export const INSTALLMENT_OPTIONS: SelectOption[] = Array.from({ length: MAX_INSTALLMENTS }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1}x`,
}))

export const PAYMENT_STATUS_OPTIONS: SelectOption[] = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'pago', label: 'Pago' },
]

export const OVERDUE_THRESHOLDS = {
  warning: 30,
  danger: 60,
  critical: 90,
} as const
