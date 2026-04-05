import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PatientFormFields } from '../components/patients/PatientFormFields'
import { Button } from '../components/common/Button'
import { usePatients } from '../hooks/usePatients'
import { isValidCPF } from '../utils/cpf'
import type { PatientFormValues } from '../types/models'

const emptyValues: Record<string, string> = {
  name: '', birthdate: '', cpf: '', rg: '', gender: '', maritalStatus: '',
  phone: '', email: '', street: '', number: '', complement: '', neighborhood: '',
  city: '', state: '', zip: '', healthPlan: '',
}

const requiredFields = [
  'name', 'birthdate', 'cpf', 'gender', 'maritalStatus', 'phone',
  'street', 'number', 'neighborhood', 'city', 'state', 'zip',
]

function validate(
  values: Record<string, string>,
  isCpfTaken: (cpf: string, currentId: string | null) => boolean,
  currentId: string | undefined,
): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const field of requiredFields) {
    if (!values[field]?.trim()) {
      errors[field] = 'Campo obrigatório'
    }
  }

  if (values.cpf?.trim() && !errors.cpf) {
    if (!isValidCPF(values.cpf)) {
      errors.cpf = 'CPF inválido'
    } else if (isCpfTaken(values.cpf, currentId || null)) {
      errors.cpf = 'CPF já cadastrado'
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

export function PatientFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getPatientById, addPatient, updatePatient, isCpfTaken } = usePatients()

  const [values, setValues] = useState<Record<string, string>>(emptyValues)
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const isEdit = Boolean(id)

  useEffect(() => {
    if (id) {
      const patient = getPatientById(id)
      if (patient) {
        setValues({ ...emptyValues, ...patient })
      } else {
        navigate('/patients')
      }
    }
  }, [id, getPatientById, navigate])

  const handleChange = (field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(values, isCpfTaken, id)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    if (isEdit && id) {
      updatePatient(id, values)
    } else {
      addPatient(values as PatientFormValues)
    }
    navigate('/patients')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdit ? 'Editar Paciente' : 'Novo Paciente'}
      </h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
        <PatientFormFields values={values} errors={errors} onChange={handleChange} />
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={() => navigate('/patients')}>
            Cancelar
          </Button>
          <Button type="submit">
            {isEdit ? 'Salvar alterações' : 'Cadastrar paciente'}
          </Button>
        </div>
      </form>
    </div>
  )
}
