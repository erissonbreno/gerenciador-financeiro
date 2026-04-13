import { apiV1 } from './api'
import { fromBackend, toBackend } from './patientMapper'
import type { Patient, PatientFormValues, BackendPatient, PaginatedResponse, PatientQueryParams } from '../types/models'

export async function getPatients(params: PatientQueryParams = {}): Promise<PaginatedResponse<Patient>> {
  const { data } = await apiV1.get<PaginatedResponse<BackendPatient>>('/patients', { params })
  return {
    ...data,
    data: data.data.map(fromBackend),
  }
}

export async function getPatientById(id: string): Promise<Patient> {
  const { data } = await apiV1.get<BackendPatient>(`/patients/${id}`)
  return fromBackend(data)
}

export async function createPatient(formValues: PatientFormValues): Promise<Patient> {
  const { data } = await apiV1.post<BackendPatient>('/patients', toBackend(formValues))
  return fromBackend(data)
}

export async function updatePatient(id: string, formValues: Partial<PatientFormValues>): Promise<Patient> {
  const { data } = await apiV1.put<BackendPatient>(`/patients/${id}`, toBackend(formValues as PatientFormValues))
  return fromBackend(data)
}

export async function deletePatient(id: string): Promise<void> {
  await apiV1.delete(`/patients/${id}`)
}
