import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { readStorage, writeStorage } from '../utils/storage'

export function usePatients() {
  const [patients, setPatients] = useLocalStorage('patients', [])

  const getPatientById = useCallback(
    (id) => patients.find((p) => p.id === id) || null,
    [patients],
  )

  const isCpfTaken = useCallback(
    (cpf, currentId = null) => {
      const normalized = cpf.replace(/\D/g, '')
      return patients.some(
        (p) => p.cpf.replace(/\D/g, '') === normalized && p.id !== currentId,
      )
    },
    [patients],
  )

  const addPatient = useCallback(
    (data) => {
      const patient = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
      setPatients((prev) => [...prev, patient])
      return patient
    },
    [setPatients],
  )

  const updatePatient = useCallback(
    (id, data) => {
      setPatients((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...data } : p)),
      )
    },
    [setPatients],
  )

  const deletePatient = useCallback(
    (id) => {
      setPatients((prev) => prev.filter((p) => p.id !== id))
      for (const key of ['accounts_payable', 'accounts_receivable']) {
        const accounts = readStorage(key, [])
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
