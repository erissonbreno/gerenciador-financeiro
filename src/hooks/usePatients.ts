import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { readStorage, writeStorage } from '../utils/storage'
import type { Patient, PatientFormValues, Account } from '../types/models'

export function usePatients() {
  const [patients, setPatients] = useLocalStorage<Patient[]>('patients', [])

  const getPatientById = useCallback(
    (id: string): Patient | null => patients.find((p) => p.id === id) || null,
    [patients],
  )

  const isCpfTaken = useCallback(
    (cpf: string, currentId: string | null = null): boolean => {
      const normalized = cpf.replace(/\D/g, '')
      return patients.some(
        (p) => p.cpf.replace(/\D/g, '') === normalized && p.id !== currentId,
      )
    },
    [patients],
  )

  const addPatient = useCallback(
    (data: PatientFormValues): Patient => {
      const patient: Patient = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
      setPatients((prev) => [...prev, patient])
      return patient
    },
    [setPatients],
  )

  const updatePatient = useCallback(
    (id: string, data: Partial<Patient>): void => {
      setPatients((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...data } : p)),
      )
    },
    [setPatients],
  )

  const deletePatient = useCallback(
    (id: string): void => {
      setPatients((prev) => prev.filter((p) => p.id !== id))
      for (const key of ['accounts_payable', 'accounts_receivable'] as const) {
        const accounts = readStorage<Account[]>(key, [])
        const updated = accounts.map((a) =>
          a.patientId === id ? { ...a, patientId: '' } : a,
        )
        writeStorage(key, updated)
      }
    },
    [setPatients],
  )

  return { patients, getPatientById, addPatient, updatePatient, deletePatient, isCpfTaken }
}
