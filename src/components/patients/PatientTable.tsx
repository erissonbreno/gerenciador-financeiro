import { formatCPF } from '../../utils/cpf'
import { EmptyState } from '../common/EmptyState'
import { Button } from '../common/Button'
import type { Patient } from '../../types/models'

interface PatientTableProps {
  patients: Patient[]
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (patient: Patient) => void
  onNew: () => void
}

export function PatientTable({ patients, onView, onEdit, onDelete, onNew }: PatientTableProps) {
  if (patients.length === 0) {
    return (
      <EmptyState
        message="Nenhum paciente cadastrado"
        actionLabel="Cadastrar paciente"
        onAction={onNew}
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            <th className="py-3 px-4 font-medium">Nome</th>
            <th className="py-3 px-4 font-medium">CPF</th>
            <th className="py-3 px-4 font-medium">Telefone</th>
            <th className="py-3 px-4 font-medium text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 font-medium text-gray-800">{patient.name}</td>
              <td className="py-3 px-4 text-gray-600">{formatCPF(patient.cpf)}</td>
              <td className="py-3 px-4 text-gray-600">{patient.phone}</td>
              <td className="py-3 px-4 text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => onView(patient.id)}>Ver</Button>
                  <Button variant="secondary" onClick={() => onEdit(patient.id)}>Editar</Button>
                  <Button variant="danger" onClick={() => onDelete(patient)}>Excluir</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
