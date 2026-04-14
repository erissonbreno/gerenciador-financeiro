import { apiV1 } from './api'
import type { Account, AccountWithDerived, AccountType, AccountSummaryData, AccountFormData } from '../types/models'

export async function getAccounts(type: AccountType): Promise<AccountWithDerived[]> {
  const { data } = await apiV1.get<AccountWithDerived[]>('/accounts', { params: { type } })
  return data
}

export async function getAccountSummary(type: AccountType): Promise<AccountSummaryData> {
  const { data } = await apiV1.get<AccountSummaryData>('/accounts/summary', { params: { type } })
  return data
}

export async function createAccount(type: AccountType, data: AccountFormData): Promise<Account> {
  const { data: account } = await apiV1.post<Account>('/accounts', data, { params: { type } })
  return account
}

export async function updateAccount(type: AccountType, id: string, data: Partial<AccountFormData>): Promise<Account> {
  const { data: account } = await apiV1.put<Account>(`/accounts/${id}`, data, { params: { type } })
  return account
}

export async function deleteAccount(type: AccountType, id: string): Promise<void> {
  await apiV1.delete(`/accounts/${id}`, { params: { type } })
}
