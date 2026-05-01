import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import * as patientService from '../services/patientService'
import { Button } from '../components/common/Button'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { PatientFormModal } from '../components/patients/PatientFormModal'
import { formatCPF } from '../utils/cpf'
import { formatDate } from '../utils/date'
import { isDuplicateCpf } from '../utils/apiErrors'
import type { PatientFormValues } from '../types/models'
import { formatPhone } from '../utils/phone'

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-1 text-sm text-gray-800">{value || '\u2014'}</dd>
    </div>
  )
}

export function PatientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showDelete, setShowDelete] = useState(false)
  const [formOpen, setFormOpen] = useState(false)

  const { data: patient, isLoading, error } = useQuery({
    queryKey: ['patients', id],
    queryFn: () => patientService.getPatientById(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Carregando...</div>
  }

  if (error || !patient) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Paciente não encontrado.</p>
        <Button className="mt-4" onClick={() => navigate('/patients')}>Voltar</Button>
      </div>
    )
  }

  const handleDelete = async () => {
    await patientService.deletePatient(id!)
    queryClient.invalidateQueries({ queryKey: ['patients'] })
    queryClient.invalidateQueries({ queryKey: ['accounts'] })
    navigate('/patients')
  }

  const handleSave = async (data: PatientFormValues): Promise<string | undefined> => {
    try {
      await patientService.updatePatient(id!, data)
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      return undefined
    } catch (err) {
      if (isDuplicateCpf(err)) {
        return 'CPF já cadastrado'
      }
      throw err
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{patient.name}</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setFormOpen(true)}>Editar</Button>
          <Button variant="danger" onClick={() => setShowDelete(true)}>Excluir</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Field label="Nome completo" value={patient.name} />
          <Field label="Data de nascimento" value={formatDate(patient.birthdate)} />
          <Field label="CPF" value={formatCPF(patient.cpf)} />
          <Field label="RG" value={patient.rg} />
          <Field label="Gênero" value={patient.gender} />
          <Field label="Estado civil" value={patient.maritalStatus} />
          <Field label="Telefone" value={formatPhone(patient.phone)} />
          <Field label="E-mail" value={patient.email} />
        </div>

        <h3 className="text-sm font-semibold text-gray-600 mt-6 mb-4">Endereço</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Field label="Logradouro" value={patient.street} />
          <Field label="Número" value={patient.number} />
          <Field label="Complemento" value={patient.complement} />
          <Field label="Bairro" value={patient.neighborhood} />
          <Field label="Cidade" value={patient.city} />
          <Field label="Estado" value={patient.state} />
          <Field label="CEP" value={patient.zip} />
        </div>

        <h3 className="text-sm font-semibold text-gray-600 mt-6 mb-4">Informações adicionais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Plano de Saúde" value={patient.healthPlan} />
        </div>
      </div>

      <div className="mt-4">
        <Button variant="secondary" onClick={() => navigate('/patients')}>Voltar à lista</Button>
      </div>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Excluir paciente"
        message={`Tem certeza que deseja excluir "${patient.name}"?`}
      />

      <PatientFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        patient={patient}
      />
    </div>
  )
}
