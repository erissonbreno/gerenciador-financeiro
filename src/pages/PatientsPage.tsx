import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePatients } from '../hooks/usePatients'
import { usePagination } from '../hooks/usePagination'
import { PatientTable } from '../components/patients/PatientTable'
import { PatientFormModal } from '../components/patients/PatientFormModal'
import { SearchBar } from '../components/common/SearchBar'
import { Pagination } from '../components/common/Pagination'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { Button } from '../components/common/Button'
import type { Patient, PatientFormValues } from '../types/models'

export function PatientsPage() {
  const navigate = useNavigate()
  const { patients, deletePatient, addPatient, updatePatient, isCpfTaken, getPatientById } = usePatients()
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Patient | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return patients
    const q = search.toLowerCase()
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.cpf.includes(q) ||
        p.phone.includes(q),
    )
  }, [patients, search])

  const { pagedItems, currentPage, totalPages, next, prev } = usePagination(filtered)

  const handleDelete = () => {
    if (deleteTarget) {
      deletePatient(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  const openNewForm = () => {
    setEditTarget(null)
    setFormOpen(true)
  }

  const handleSave = (data: PatientFormValues) => {
    if (editTarget) {
      updatePatient(editTarget.id, data)
    } else {
      addPatient(data)
    }
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
          patients={pagedItems}
          onView={(id) => navigate(`/patients/${id}`)}
          onEdit={(id) => { setEditTarget(getPatientById(id)!); setFormOpen(true) }}
          onDelete={(patient) => setDeleteTarget(patient)}
          onNew={openNewForm}
        />
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPrev={prev} onNext={next} />

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
        isCpfTaken={isCpfTaken}
      />
    </div>
  )
}
