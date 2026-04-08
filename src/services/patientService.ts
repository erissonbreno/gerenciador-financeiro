import { api } from './api'
import type { Patient, PatientFormValues } from '../types/models'

export async function getPatients(): Promise<Patient[]> {
  const { data } = await api.get<Patient[]>('/patients')
  return data
}

export async function getPatientById(id: string): Promise<Patient> {
  const { data } = await api.get<Patient>(`/patients/${id}`)
  return data
}

export async function createPatient(data: PatientFormValues): Promise<Patient> {
  const { data: patient } = await api.post<Patient>('/patients', data)
  return patient
}

export async function updatePatient(id: string, data: Partial<PatientFormValues>): Promise<Patient> {
  const { data: patient } = await api.put<Patient>(`/patients/${id}`, data)
  return patient
}

export async function deletePatient(id: string): Promise<void> {
  await api.delete(`/patients/${id}`)
}

export async function checkCpf(cpf: string, excludeId?: string): Promise<boolean> {
  const params: Record<string, string> = { cpf }
  if (excludeId) params.excludeId = excludeId
  const { data } = await api.get<{ taken: boolean }>('/patients/check-cpf', { params })
  return data.taken
}
