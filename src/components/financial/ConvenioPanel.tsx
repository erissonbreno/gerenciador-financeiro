import { useState } from 'react'
import { Select } from '../common/Select'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import { EmptyState } from '../common/EmptyState'
import { formatBRL } from '../../utils/currency'
import { formatDate, getOverdueLevel } from '../../utils/date'
import { PAYMENT_STATUS_OPTIONS, CONVENIO_TYPES } from '../../constants/paymentConstants'
import type { PaymentWithDerived, Patient, PaymentSummaryData } from '../../types/models'

interface ConvenioPanelProps {
  payments: PaymentWithDerived[]
  patients: Patient[]
  summary: PaymentSummaryData
  onReceive: (payment: PaymentWithDerived) => void
}

const overdueRowColors: Record<string, string> = {
  warning: 'bg-yellow-50',
  danger: 'bg-orange-50',
  critical: 'bg-red-50',
}

export function ConvenioPanel({ payments, patients, summary, onReceive }: ConvenioPanelProps) {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [convenioFilter, setConvenioFilter] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const convenioPayments = payments.filter((p) => p.paymentType === 'convenio')

  let filtered = convenioPayments
  if (statusFilter) filtered = filtered.filter((p) => p.status === statusFilter)
  if (convenioFilter) filtered = filtered.filter((p) => p.convenioType === convenioFilter)
  if (startDate) filtered = filtered.filter((p) => p.serviceDate >= startDate)
  if (endDate) filtered = filtered.filter((p) => p.serviceDate <= endDate)

  const getPatientName = (patientId: string): string => {
    if (!patientId) return '—'
    const pt = patients.find((p) => p.id === patientId)
    return pt ? pt.name : '—'
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-xs font-medium text-yellow-700 uppercase tracking-wide">Total Pendente Convênios</p>
          <p className="text-2xl font-bold text-yellow-800 mt-1">{formatBRL(summary.totalPending)}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Total Recebido Convênios</p>
          <p className="text-2xl font-bold text-blue-800 mt-1">{formatBRL(summary.totalReceived)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Select
          options={PAYMENT_STATUS_OPTIONS}
          placeholder="Todos os status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-40"
        />
        <Select
          options={CONVENIO_TYPES}
          placeholder="Todos convênios"
          value={convenioFilter}
          onChange={(e) => setConvenioFilter(e.target.value)}
          className="w-48"
        />
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-40"
        />
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-40"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="Nenhum pagamento de convênio encontrado" />
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-3 px-4 font-medium">Paciente</th>
                <th className="py-3 px-4 font-medium">Descrição</th>
                <th className="py-3 px-4 font-medium">Valor</th>
                <th className="py-3 px-4 font-medium">Data</th>
                <th className="py-3 px-4 font-medium">Convênio</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Dias Pendente</th>
                <th className="py-3 px-4 font-medium">Valor Recebido</th>
                <th className="py-3 px-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const level = p.status === 'pendente' && p.daysPending
                  ? getOverdueLevel(p.daysPending)
                  : 'none'
                const rowClass = overdueRowColors[level] ?? ''
                const canReceive = p.status === 'pendente'

                return (
                  <tr key={p.id} className={`border-b border-gray-100 hover:bg-gray-50 ${rowClass}`}>
                    <td className="py-3 px-4 text-gray-800">{getPatientName(p.patientId)}</td>
                    <td className="py-3 px-4 font-medium text-gray-800">{p.description}</td>
                    <td className="py-3 px-4 text-gray-600">{formatBRL(p.value)}</td>
                    <td className="py-3 px-4 text-gray-600">{formatDate(p.serviceDate)}</td>
                    <td className="py-3 px-4 text-gray-600">{p.convenioType ?? '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.status === 'pago' ? 'bg-accent-100 text-accent-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {p.status === 'pago' ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {p.status === 'pendente' && p.daysPending != null ? `${p.daysPending}d` : '—'}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {p.receivedValue != null ? formatBRL(p.receivedValue) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {canReceive && (
                        <Button variant="accent" onClick={() => onReceive(p)}>Receber</Button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
