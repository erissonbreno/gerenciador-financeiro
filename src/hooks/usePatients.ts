import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as patientService from '../services/patientService'
import type { Patient, PatientFormValues } from '../types/models'

export function usePatients() {
  const queryClient = useQueryClient()

  const { data: patients = [], isLoading, error } = useQuery({
    queryKey: ['patients'],
    queryFn: patientService.getPatients,
  })

  const getPatientById = (id: string): Patient | null =>
    patients.find((p) => p.id === id) ?? null

  const isCpfTaken = async (
    cpf: string,
    currentId: string | null = null,
  ): Promise<boolean> => {
    return patientService.checkCpf(cpf, currentId ?? undefined)
  }

  const addMutation = useMutation({
    mutationFn: (data: PatientFormValues) => patientService.createPatient(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patients'] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PatientFormValues> }) =>
      patientService.updatePatient(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patients'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => patientService.deletePatient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })

  return {
    patients,
    isLoading,
    error,
    getPatientById,
    isCpfTaken,
    addPatient: (data: PatientFormValues) => addMutation.mutateAsync(data),
    updatePatient: (id: string, data: Partial<PatientFormValues>) =>
      updateMutation.mutateAsync({ id, data }),
    deletePatient: (id: string) => deleteMutation.mutateAsync(id),
  }
}
