import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as patientService from '../services/patientService'
import type { PatientFormValues, PatientQueryParams } from '../types/models'

export function usePatients(params: PatientQueryParams = {}) {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['patients', params],
    queryFn: () => patientService.getPatients(params),
    placeholderData: (prev) => prev,
  })

  const addMutation = useMutation({
    mutationFn: (formData: PatientFormValues) => patientService.createPatient(formData),
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
    patients: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    isLoading,
    error,
    addPatient: (formData: PatientFormValues) => addMutation.mutateAsync(formData),
    updatePatient: (id: string, formData: Partial<PatientFormValues>) =>
      updateMutation.mutateAsync({ id, data: formData }),
    deletePatient: (id: string) => deleteMutation.mutateAsync(id),
  }
}
