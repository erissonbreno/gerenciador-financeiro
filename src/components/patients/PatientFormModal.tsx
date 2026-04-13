import React, { useState } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { PatientFormFields } from './PatientFormFields'
import { isValidCPF } from '../../utils/cpf'
import type { Patient, PatientFormValues } from '../../types/models'

const emptyValues: Record<string, string> = {
  name: '', birthdate: '', cpf: '', rg: '', gender: '', maritalStatus: '',
  phone: '', email: '', street: '', number: '', complement: '', neighborhood: '',
  city: '', state: '', zip: '', healthPlan: '',
}

const requiredFields = ['name', 'birthdate', 'cpf']

function validate(values: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const field of requiredFields) {
    if (!values[field]?.trim()) {
      errors[field] = 'Campo obrigatório'
    }
  }

  if (values.cpf?.trim() && !errors.cpf) {
    if (!isValidCPF(values.cpf)) {
      errors.cpf = 'CPF inválido'
    }
  }

  if (values.email?.trim()) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = 'E-mail inválido'
    }
  }

  if (values.zip?.trim() && !errors.zip) {
    if (!/^\d{8}$/.test(values.zip.replace(/\D/g, ''))) {
      errors.zip = 'CEP inválido (8 dígitos)'
    }
  }

  return errors
}

interface PatientFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: PatientFormValues) => Promise<string | undefined>
  patient: Patient | null
}

interface PatientFormModalFormProps {
  patient: Patient | null
  onSave: (data: PatientFormValues) => Promise<string | undefined>
  onClose: () => void
}

function PatientFormModalForm({ patient, onSave, onClose }: PatientFormModalFormProps) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    patient ? { ...emptyValues, ...patient } : emptyValues,
  )
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const errs = validate(values)
      setErrors(errs)
      if (Object.keys(errs).length > 0) return

      const cpfError = await onSave(values as PatientFormValues)
      if (cpfError) {
        setErrors((prev) => ({ ...prev, cpf: cpfError }))
        return
      }
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PatientFormFields values={values} errors={errors} onChange={handleChange} />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Salvando...' : (patient ? 'Salvar alterações' : 'Cadastrar paciente')}
        </Button>
      </div>
    </form>
  )
}

export function PatientFormModal({ open, onClose, onSave, patient }: PatientFormModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={patient ? 'Editar Paciente' : 'Novo Paciente'}>
      {open ? (
        <PatientFormModalForm
          key={patient?.id ?? 'new'}
          patient={patient}
          onSave={onSave}
          onClose={onClose}
        />
      ) : null}
    </Modal>
  )
}
