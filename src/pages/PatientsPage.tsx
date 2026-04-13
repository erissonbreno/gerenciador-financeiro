import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePatients } from '../hooks/usePatients'
import { useDebounce } from '../hooks/useDebounce'
import { PatientTable } from '../components/patients/PatientTable'
import { PatientFormModal } from '../components/patients/PatientFormModal'
import { SearchBar } from '../components/common/SearchBar'
import { Pagination } from '../components/common/Pagination'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { Button } from '../components/common/Button'
import { isDuplicateCpf } from '../utils/apiErrors'
import type { Patient, PatientFormValues } from '../types/models'

export function PatientsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, 300)

  const { patients, totalPages, deletePatient, addPatient, updatePatient, isLoading, error } =
    usePatients({ page, limit: 10, search: debouncedSearch || undefined })

  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Patient | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const handleDelete = async () => {
    if (deleteTarget) {
      await deletePatient(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  const openNewForm = () => {
    setEditTarget(null)
    setFormError(null)
    setFormOpen(true)
  }

  const handleSave = async (data: PatientFormValues): Promise<string | undefined> => {
    try {
      if (editTarget) {
        await updatePatient(editTarget.id, data)
      } else {
        await addPatient(data)
      }
      return undefined
    } catch (err) {
      if (isDuplicateCpf(err)) {
        return 'CPF já cadastrado'
      }
      throw err
    }
  }

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Carregando...</div>
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">Erro ao carregar pacientes.</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pacientes</h1>
        <Button onClick={openNewForm}>Novo Paciente</Button>
      </div>

      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nome, CPF ou telefone..." />
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <PatientTable
          patients={patients}
          onView={(id) => navigate(`/patients/${id}`)}
          onEdit={(id) => { setEditTarget(patients.find(p => p.id === id)!); setFormError(null); setFormOpen(true) }}
          onDelete={(patient) => setDeleteTarget(patient)}
          onNew={openNewForm}
        />
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPrev={() => setPage((p) => Math.max(p - 1, 1))}
        onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir paciente"
        message={`Tem certeza que deseja excluir o paciente "${deleteTarget?.name}"?`}
      />

      <PatientFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        patient={editTarget}
      />
    </div>
  )
}
