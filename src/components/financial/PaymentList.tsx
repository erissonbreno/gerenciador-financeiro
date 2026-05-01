import { Button } from '../common/Button'
import { EmptyState } from '../common/EmptyState'
import { formatBRL } from '../../utils/currency'
import { formatDate, getOverdueLevel } from '../../utils/date'
import type { PaymentWithDerived, Patient } from '../../types/models'

interface PaymentListProps {
  payments: PaymentWithDerived[]
  patients: Patient[]
  onEdit: (payment: PaymentWithDerived) => void
  onDelete: (payment: PaymentWithDerived) => void
  onReceive: (payment: PaymentWithDerived) => void
  onNew: () => void
}

const overdueRowColors: Record<string, string> = {
  warning: 'bg-yellow-50',
  danger: 'bg-orange-50',
  critical: 'bg-red-50',
}

const statusBadge: Record<string, { label: string; colorClass: string }> = {
  pendente: { label: 'Pendente', colorClass: 'bg-yellow-100 text-yellow-800' },
  pago: { label: 'Pago', colorClass: 'bg-accent-100 text-accent-800' },
}

const typeBadge: Record<string, { label: string; colorClass: string }> = {
  particular: { label: 'Particular', colorClass: 'bg-blue-100 text-blue-800' },
  convenio: { label: 'Convênio', colorClass: 'bg-purple-100 text-purple-800' },
}

export function PaymentList({ payments, patients, onEdit, onDelete, onReceive, onNew }: PaymentListProps) {
  if (!Array.isArray(payments) || payments.length === 0) {
    return (
      <EmptyState
        message="Nenhum pagamento registrado"
        actionLabel="Novo Pagamento"
        onAction={onNew}
      />
    )
  }

  const getPatientName = (patientId: string): string => {
    if (!patientId) return '—'
    const p = patients.find((pt) => pt.id === patientId)
    return p ? p.name : '—'
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            <th className="py-3 px-4 font-medium">Paciente</th>
            <th className="py-3 px-4 font-medium">Descrição</th>
            <th className="py-3 px-4 font-medium">Valor</th>
            <th className="py-3 px-4 font-medium">Data</th>
            <th className="py-3 px-4 font-medium">Tipo</th>
            <th className="py-3 px-4 font-medium">Status</th>
            <th className="py-3 px-4 font-medium text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => {
            const level = p.paymentType === 'convenio' && p.status === 'pendente' && p.daysPending
              ? getOverdueLevel(p.daysPending)
              : 'none'
            const rowClass = overdueRowColors[level] ?? ''
            const sBadge = statusBadge[p.status] ?? statusBadge.pendente
            const tBadge = typeBadge[p.paymentType] ?? typeBadge.particular
            const canReceive = p.paymentType === 'convenio' && p.status === 'pendente'

            return (
              <tr key={p.id} className={`border-b border-gray-100 hover:bg-gray-50 ${rowClass}`}>
                <td className="py-3 px-4 text-gray-800">{getPatientName(p.patientId)}</td>
                <td className="py-3 px-4 font-medium text-gray-800">{p.description}</td>
                <td className="py-3 px-4 text-gray-600">{formatBRL(p.value)}</td>
                <td className="py-3 px-4 text-gray-600">{formatDate(p.serviceDate)}</td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${tBadge.colorClass}`}>
                    {tBadge.label}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${sBadge.colorClass}`}>
                    {sBadge.label}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    {canReceive && (
                      <Button variant="accent" onClick={() => onReceive(p)}>Receber</Button>
                    )}
                    <Button variant="secondary" onClick={() => onEdit(p)}>Editar</Button>
                    <Button variant="danger" onClick={() => onDelete(p)}>Excluir</Button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
