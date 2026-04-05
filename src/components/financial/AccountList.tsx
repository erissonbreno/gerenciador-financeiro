import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { EmptyState } from '../common/EmptyState'
import { formatBRL } from '../../utils/currency'
import { formatDate } from '../../utils/date'
import type { AccountWithDerived, Patient } from '../../types/models'

interface AccountListProps {
  accounts: AccountWithDerived[]
  patients: Patient[]
  onEdit: (account: AccountWithDerived) => void
  onDelete: (account: AccountWithDerived) => void
  onNew: () => void
}

export function AccountList({ accounts, patients, onEdit, onDelete, onNew }: AccountListProps) {
  if (accounts.length === 0) {
    return (
      <EmptyState
        message="Nenhuma conta registrada"
        actionLabel="Nova conta"
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
            <th className="py-3 px-4 font-medium">Descrição</th>
            <th className="py-3 px-4 font-medium">Valor</th>
            <th className="py-3 px-4 font-medium">Vencimento</th>
            <th className="py-3 px-4 font-medium">Status</th>
            <th className="py-3 px-4 font-medium">Paciente</th>
            <th className="py-3 px-4 font-medium text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((acc) => (
            <tr key={acc.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 font-medium text-gray-800">{acc.description}</td>
              <td className="py-3 px-4 text-gray-600">{formatBRL(acc.value)}</td>
              <td className="py-3 px-4 text-gray-600">{formatDate(acc.dueDate)}</td>
              <td className="py-3 px-4"><Badge status={acc.derivedStatus} /></td>
              <td className="py-3 px-4 text-gray-600">{getPatientName(acc.patientId)}</td>
              <td className="py-3 px-4 text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => onEdit(acc)}>Editar</Button>
                  <Button variant="danger" onClick={() => onDelete(acc)}>Excluir</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
