import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import * as accountService from '../services/accountService'
import type { AccountType, AccountFormData } from '../types/models'

export function useAccounts(type: AccountType) {
  const queryClient = useQueryClient()

  const { data: accounts = [], isLoading, error } = useQuery({
    queryKey: ['accounts', type],
    queryFn: () => accountService.getAccounts(type),
    placeholderData: keepPreviousData,
  })

  const { data: summary = { totalPending: 0, totalPaid: 0 } } = useQuery({
    queryKey: ['accounts', type, 'summary'],
    queryFn: () => accountService.getAccountSummary(type),
    placeholderData: keepPreviousData,
  })

  const addMutation = useMutation({
    mutationFn: (data: AccountFormData) => accountService.createAccount(type, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts', type] }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AccountFormData> }) =>
      accountService.updateAccount(type, id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts', type] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => accountService.deleteAccount(type, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts', type] }),
  })

  return {
    accounts,
    summary,
    isLoading,
    error,
    addAccount: (data: AccountFormData) => addMutation.mutateAsync(data),
    updateAccount: (id: string, data: Partial<AccountFormData>) =>
      updateMutation.mutateAsync({ id, data }),
    deleteAccount: (id: string) => deleteMutation.mutateAsync(id),
  }
}
