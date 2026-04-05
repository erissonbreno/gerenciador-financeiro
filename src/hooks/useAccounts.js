import { useMemo, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { isOverdue } from '../utils/date'

export function useAccounts(type) {
  const key = type === 'payable' ? 'accounts_payable' : 'accounts_receivable'
  const [accounts, setAccounts] = useLocalStorage(key, [])

  const accountsWithOverdue = useMemo(
    () =>
      accounts.map((acc) => ({
        ...acc,
        derivedStatus:
          acc.status === 'pending' && isOverdue(acc.dueDate) ? 'overdue' : acc.status,
      })),
    [accounts],
  )

  const summary = useMemo(() => {
    let totalPending = 0
    let totalPaid = 0
    for (const acc of accountsWithOverdue) {
      const val = Number(acc.value) || 0
      if (acc.derivedStatus === 'pending' || acc.derivedStatus === 'overdue') {
        totalPending += val
      } else if (acc.derivedStatus === 'paid') {
        totalPaid += val
      }
    }
    return { totalPending, totalPaid }
  }, [accountsWithOverdue])

  const addAccount = useCallback(
    (data) => {
      const account = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
      setAccounts((prev) => [...prev, account])
      return account
    },
    [setAccounts],
  )

  const updateAccount = useCallback(
    (id, data) => {
      setAccounts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...data } : a)),
      )
    },
    [setAccounts],
  )

  const deleteAccount = useCallback(
    (id) => {
      setAccounts((prev) => prev.filter((a) => a.id !== id))
    },
    [setAccounts],
  )

  return { accounts: accountsWithOverdue, summary, addAccount, updateAccount, deleteAccount }
}
