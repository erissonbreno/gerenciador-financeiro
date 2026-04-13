export interface Patient {
  id: string
  name: string
  birthdate: string
  cpf: string
  rg: string
  gender: string
  maritalStatus: string
  phone: string
  email: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  zip: string
  healthPlan: string
  createdAt: string
}

export type PatientFormValues = Omit<Patient, 'id' | 'createdAt'>

export interface BackendPatient {
  id: string
  fullName: string
  birthDate: string
  cpf: string
  rg: string
  gender: string
  maritalStatus: string
  phone: string
  email: string
  address: {
    street: string
    number: string
    complement: string
    district: string
    city: string
    state: string
    zipCode: string
  }
  healthPlan: string
  age: number
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
}

export interface PatientQueryParams {
  page?: number
  limit?: number
  search?: string
}

export type AccountStatus = 'pending' | 'paid'
export type DerivedStatus = 'pending' | 'paid' | 'overdue'
export type AccountType = 'payable' | 'receivable'

export interface Account {
  id: string
  description: string
  value: number
  dueDate: string
  status: AccountStatus
  category: string
  patientId: string
  createdAt: string
}

export interface AccountWithDerived extends Account {
  derivedStatus: DerivedStatus
}

export interface AccountFormData {
  description: string
  value: string | number
  dueDate: string
  status: AccountStatus
  category: string
  patientId: string
}

export interface AccountSummaryData {
  totalPending: number
  totalPaid: number
}

export interface SelectOption {
  value: string
  label: string
}

export interface StatusConfig {
  label: string
  colorClass: string
}
