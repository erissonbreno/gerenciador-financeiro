import { api } from './api'
import type { Account, AccountWithDerived, AccountType, AccountSummaryData, AccountFormData } from '../types/models'

export async function getAccounts(type: AccountType): Promise<AccountWithDerived[]> {
  const { data } = await api.get<AccountWithDerived[]>('/accounts', { params: { type } })
  return data
}

export async function getAccountSummary(type: AccountType): Promise<AccountSummaryData> {
  const { data } = await api.get<AccountSummaryData>('/accounts/summary', { params: { type } })
  return data
}

export async function createAccount(type: AccountType, data: AccountFormData): Promise<Account> {
  const { data: account } = await api.post<Account>('/accounts', data, { params: { type } })
  return account
}

export async function updateAccount(type: AccountType, id: string, data: Partial<AccountFormData>): Promise<Account> {
  const { data: account } = await api.put<Account>(`/accounts/${id}`, data, { params: { type } })
  return account
}

export async function deleteAccount(type: AccountType, id: string): Promise<void> {
  await api.delete(`/accounts/${id}`, { params: { type } })
}
