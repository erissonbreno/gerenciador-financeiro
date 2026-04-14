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

// Payment types
export type PaymentType = 'particular' | 'convenio'
export type PaymentMethod = 'especie' | 'debito' | 'credito'
export type CreditMode = 'avista' | 'parcelado'
export type PaymentStatus = 'pendente' | 'pago'

export interface Payment {
  id: string
  patientId: string
  description: string
  value: number
  serviceDate: string
  paymentType: PaymentType
  status: PaymentStatus
  category: string
  createdAt: string
  // Particular
  paymentMethod?: PaymentMethod
  creditMode?: CreditMode
  installments?: number
  installmentNumber?: number
  parentPaymentId?: string
  // Convenio
  convenioType?: string
  receivedDate?: string
  receivedValue?: number
}

export interface PaymentWithDerived extends Payment {
  daysPending?: number
}

export interface PaymentFormData {
  patientId: string
  description: string
  value: string | number
  serviceDate: string
  paymentType: PaymentType
  status: PaymentStatus
  category: string
  paymentMethod?: PaymentMethod
  creditMode?: CreditMode
  installments?: number
  convenioType?: string
}

export interface ConvenioReceiveData {
  receivedDate: string
  receivedValue: string | number
}

export interface PaymentSummaryData {
  totalPending: number
  totalPaid: number
  totalReceived: number
}

export interface PaymentQueryParams {
  paymentType?: PaymentType
  status?: PaymentStatus
  convenioType?: string
  patientId?: string
  startDate?: string
  endDate?: string
}
