import { Select } from '../common/Select'
import { Input } from '../common/Input'
import { PAYMENT_TYPES, PAYMENT_STATUS_OPTIONS, CONVENIO_TYPES } from '../../constants/paymentConstants'
import type { PaymentQueryParams } from '../../types/models'

interface PaymentFiltersProps {
  filters: PaymentQueryParams
  onChange: (filters: PaymentQueryParams) => void
  showConvenioFilter?: boolean
}

export function PaymentFilters({ filters, onChange, showConvenioFilter = true }: PaymentFiltersProps) {
  const update = (field: keyof PaymentQueryParams, value: string) => {
    onChange({ ...filters, [field]: value || undefined })
  }

  const showConvenioType = showConvenioFilter && filters.paymentType === 'convenio'

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {showConvenioFilter && (
        <Select
          options={PAYMENT_TYPES}
          placeholder="Todos os tipos"
          value={filters.paymentType ?? ''}
          onChange={(e) => {
            const val = e.target.value
            const next: PaymentQueryParams = { ...filters, paymentType: val ? val as PaymentQueryParams['paymentType'] : undefined }
            if (val !== 'convenio') next.convenioType = undefined
            onChange(next)
          }}
          className="w-40"
        />
      )}

      <Select
        options={PAYMENT_STATUS_OPTIONS}
        placeholder="Todos os status"
        value={filters.status ?? ''}
        onChange={(e) => update('status', e.target.value)}
        className="w-40"
      />

      {showConvenioType && (
        <Select
          options={CONVENIO_TYPES}
          placeholder="Todos convênios"
          value={filters.convenioType ?? ''}
          onChange={(e) => update('convenioType', e.target.value)}
          className="w-48"
        />
      )}

      <Input
        type="date"
        value={filters.startDate ?? ''}
        onChange={(e) => update('startDate', e.target.value)}
        className="w-40"
        placeholder="Data início"
      />

      <Input
        type="date"
        value={filters.endDate ?? ''}
        onChange={(e) => update('endDate', e.target.value)}
        className="w-40"
        placeholder="Data fim"
      />
    </div>
  )
}
