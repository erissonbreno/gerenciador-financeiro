import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import * as paymentService from '../services/paymentService'
import type { PaymentFormData, PaymentQueryParams, ConvenioReceiveData } from '../types/models'

export function usePayments(filters?: PaymentQueryParams) {
  const queryClient = useQueryClient()

  const { data: payments = [], isLoading, error } = useQuery({
    queryKey: ['payments', filters],
    queryFn: () => paymentService.getPayments(filters),
    placeholderData: keepPreviousData,
  })

  const { data: summary = { totalPending: 0, totalPaid: 0, totalReceived: 0 } } = useQuery({
    queryKey: ['payments', 'summary', filters],
    queryFn: () => paymentService.getPaymentSummary(filters),
    placeholderData: keepPreviousData,
  })

  const addMutation = useMutation({
    mutationFn: (data: PaymentFormData) => paymentService.createPayment(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PaymentFormData> }) =>
      paymentService.updatePayment(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  })

  const receiveMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ConvenioReceiveData }) =>
      paymentService.receiveConvenio(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => paymentService.deletePayment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  })

  return {
    payments,
    summary,
    isLoading,
    error,
    addPayment: (data: PaymentFormData) => addMutation.mutateAsync(data),
    updatePayment: (id: string, data: Partial<PaymentFormData>) =>
      updateMutation.mutateAsync({ id, data }),
    receiveConvenio: (id: string, data: ConvenioReceiveData) =>
      receiveMutation.mutateAsync({ id, data }),
    deletePayment: (id: string) => deleteMutation.mutateAsync(id),
  }
}
