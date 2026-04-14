import { apiV1 } from './api'
import type {
  PaymentWithDerived,
  PaymentSummaryData,
  Payment,
  PaymentFormData,
  ConvenioReceiveData,
  PaymentQueryParams,
} from '../types/models'

export async function getPayments(params?: PaymentQueryParams): Promise<PaymentWithDerived[]> {
  const { data } = await apiV1.get<PaymentWithDerived[]>('/payments', { params })
  return data
}

export async function getPaymentSummary(params?: PaymentQueryParams): Promise<PaymentSummaryData> {
  const { data } = await apiV1.get<PaymentSummaryData>('/payments/summary', { params })
  return data
}

export async function createPayment(data: PaymentFormData): Promise<Payment> {
  const { data: payment } = await apiV1.post<Payment>('/payments', data)
  return payment
}

export async function updatePayment(id: string, data: Partial<PaymentFormData>): Promise<Payment> {
  const { data: payment } = await apiV1.put<Payment>(`/payments/${id}`, data)
  return payment
}

export async function receiveConvenio(id: string, data: ConvenioReceiveData): Promise<Payment> {
  const { data: payment } = await apiV1.patch<Payment>(`/payments/${id}/receive`, data)
  return payment
}

export async function deletePayment(id: string): Promise<void> {
  await apiV1.delete(`/payments/${id}`)
}
