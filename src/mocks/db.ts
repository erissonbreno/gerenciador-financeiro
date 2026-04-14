import { readStorage, writeStorage } from '../utils/storage'
import { isOverdue, daysSince } from '../utils/date'
import type {
  Account,
  AccountWithDerived,
  AccountType,
  AccountSummaryData,
  AccountFormData,
  Payment,
  PaymentWithDerived,
  PaymentFormData,
  PaymentSummaryData,
  PaymentQueryParams,
  ConvenioReceiveData,
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

let payments: Payment[] = readStorage<Payment[]>('payments', [])

function persistPayments() {
  writeStorage('payments', payments)
}

function withDaysPending(list: Payment[]): PaymentWithDerived[] {
  return list.map((p) => ({
    ...p,
    daysPending: p.status === 'pendente' ? daysSince(p.serviceDate) : undefined,
  }))
}

function filterPayments(params?: PaymentQueryParams): Payment[] {
  let result = payments
  if (!params) return result
  if (params.paymentType) result = result.filter((p) => p.paymentType === params.paymentType)
  if (params.status) result = result.filter((p) => p.status === params.status)
  if (params.convenioType) result = result.filter((p) => p.convenioType === params.convenioType)
  if (params.patientId) result = result.filter((p) => p.patientId === params.patientId)
  if (params.startDate) result = result.filter((p) => p.serviceDate >= params.startDate!)
  if (params.endDate) result = result.filter((p) => p.serviceDate <= params.endDate!)
  return result
}

export const db = {
  payments: {
    findAll(params?: PaymentQueryParams): PaymentWithDerived[] {
      return withDaysPending(filterPayments(params))
    },

    summary(params?: PaymentQueryParams): PaymentSummaryData {
      const filtered = filterPayments(params)
      let totalPending = 0
      let totalPaid = 0
      let totalReceived = 0
      for (const p of filtered) {
        const val = Number(p.value) || 0
        if (p.status === 'pendente') {
          totalPending += val
        } else if (p.status === 'pago') {
          totalPaid += val
          totalReceived += Number(p.receivedValue) || val
        }
      }
      return { totalPending, totalPaid, totalReceived }
    },

    create(data: PaymentFormData): Payment[] {
      const value = Number(data.value)
      const base: Omit<Payment, 'id' | 'createdAt' | 'value' | 'installmentNumber' | 'parentPaymentId'> = {
        patientId: data.patientId,
        description: data.description,
        serviceDate: data.serviceDate,
        paymentType: data.paymentType,
        status: data.paymentType === 'convenio' ? 'pendente' : data.status,
        category: data.category,
        paymentMethod: data.paymentMethod,
        creditMode: data.creditMode,
        installments: data.installments,
        convenioType: data.convenioType,
      }

      // Particular + credito + parcelado: generate installments
      if (
        data.paymentType === 'particular' &&
        data.paymentMethod === 'credito' &&
        data.creditMode === 'parcelado' &&
        data.installments &&
        data.installments > 1
      ) {
        const parentId = crypto.randomUUID()
        const installmentValue = Math.round((value / data.installments) * 100) / 100
        const created: Payment[] = []
        for (let i = 1; i <= data.installments; i++) {
          const payment: Payment = {
            ...base,
            id: i === 1 ? parentId : crypto.randomUUID(),
            value: installmentValue,
            installmentNumber: i,
            parentPaymentId: i === 1 ? undefined : parentId,
            description: `${data.description} (${i}/${data.installments})`,
            createdAt: new Date().toISOString(),
          }
          created.push(payment)
        }
        payments = [...payments, ...created]
        persistPayments()
        return created
      }

      const payment: Payment = {
        ...base,
        id: crypto.randomUUID(),
        value,
        createdAt: new Date().toISOString(),
      }
      payments = [...payments, payment]
      persistPayments()
      return [payment]
    },

    update(id: string, data: Partial<PaymentFormData>): Payment | undefined {
      let updated: Payment | undefined
      payments = payments.map((p) => {
        if (p.id === id) {
          updated = {
            ...p,
            ...data,
            value: data.value !== undefined ? Number(data.value) : p.value,
          }
          return updated
        }
        return p
      })
      if (updated) persistPayments()
      return updated
    },

    receive(id: string, data: ConvenioReceiveData): Payment | undefined {
      let updated: Payment | undefined
      payments = payments.map((p) => {
        if (p.id === id) {
          updated = {
            ...p,
            status: 'pago',
            receivedDate: data.receivedDate,
            receivedValue: Number(data.receivedValue),
          }
          return updated
        }
        return p
      })
      if (updated) persistPayments()
      return updated
    },

    delete(id: string): boolean {
      const target = payments.find((p) => p.id === id)
      if (!target) return false
      // If parent of installments, delete children too
      payments = payments.filter((p) => p.id !== id && p.parentPaymentId !== id)
      persistPayments()
      return true
    },
  },

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
    payments = []
    localStorage.clear()
  },
}
