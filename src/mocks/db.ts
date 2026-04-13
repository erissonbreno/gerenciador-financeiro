import { readStorage, writeStorage } from '../utils/storage'
import { isOverdue } from '../utils/date'
import type {
  Account,
  AccountWithDerived,
  AccountType,
  AccountSummaryData,
  AccountFormData,
} from '../types/models'

let accountsPayable: Account[] = readStorage<Account[]>('accounts_payable', [])
let accountsReceivable: Account[] = readStorage<Account[]>('accounts_receivable', [])

function persist() {
  writeStorage('accounts_payable', accountsPayable)
  writeStorage('accounts_receivable', accountsReceivable)
}

function getAccounts(type: AccountType): Account[] {
  return type === 'payable' ? accountsPayable : accountsReceivable
}

function setAccounts(type: AccountType, list: Account[]) {
  if (type === 'payable') {
    accountsPayable = list
  } else {
    accountsReceivable = list
  }
}

function withDerived(accounts: Account[]): AccountWithDerived[] {
  return accounts.map((acc) => ({
    ...acc,
    derivedStatus:
      acc.status === 'pending' && isOverdue(acc.dueDate)
        ? ('overdue' as const)
        : acc.status,
  }))
}

function computeSummary(accounts: AccountWithDerived[]): AccountSummaryData {
  let totalPending = 0
  let totalPaid = 0
  for (const acc of accounts) {
    const val = Number(acc.value) || 0
    if (acc.derivedStatus === 'pending' || acc.derivedStatus === 'overdue') {
      totalPending += val
    } else if (acc.derivedStatus === 'paid') {
      totalPaid += val
    }
  }
  return { totalPending, totalPaid }
}

export const db = {
  accounts: {
    findAll(type: AccountType): AccountWithDerived[] {
      return withDerived(getAccounts(type))
    },

    summary(type: AccountType): AccountSummaryData {
      return computeSummary(withDerived(getAccounts(type)))
    },

    create(type: AccountType, data: AccountFormData, overrides?: { id?: string; createdAt?: string }): Account {
      const account: Account = {
        ...data,
        value: Number(data.value),
        id: overrides?.id ?? crypto.randomUUID(),
        createdAt: overrides?.createdAt ?? new Date().toISOString(),
      }
      setAccounts(type, [...getAccounts(type), account])
      persist()
      return account
    },

    update(type: AccountType, id: string, data: Partial<AccountFormData>): Account | undefined {
      const list = getAccounts(type)
      let updated: Account | undefined
      const newList = list.map((a) => {
        if (a.id === id) {
          updated = { ...a, ...data, value: data.value !== undefined ? Number(data.value) : a.value }
          return updated
        }
        return a
      })
      if (updated) {
        setAccounts(type, newList)
        persist()
      }
      return updated
    },

    delete(type: AccountType, id: string): boolean {
      const list = getAccounts(type)
      const filtered = list.filter((a) => a.id !== id)
      if (filtered.length === list.length) return false
      setAccounts(type, filtered)
      persist()
      return true
    },
  },

  reset() {
    accountsPayable = []
    accountsReceivable = []
    localStorage.clear()
  },
}
