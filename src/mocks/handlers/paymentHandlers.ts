import { http, HttpResponse } from 'msw'
import { db } from '../db'
import type { PaymentFormData, PaymentQueryParams, ConvenioReceiveData } from '../../types/models'

function extractParams(request: Request): PaymentQueryParams {
  const url = new URL(request.url)
  const params: PaymentQueryParams = {}
  const paymentType = url.searchParams.get('paymentType')
  const status = url.searchParams.get('status')
  const convenioType = url.searchParams.get('convenioType')
  const patientId = url.searchParams.get('patientId')
  const startDate = url.searchParams.get('startDate')
  const endDate = url.searchParams.get('endDate')
  if (paymentType) params.paymentType = paymentType as PaymentQueryParams['paymentType']
  if (status) params.status = status as PaymentQueryParams['status']
  if (convenioType) params.convenioType = convenioType
  if (patientId) params.patientId = patientId
  if (startDate) params.startDate = startDate
  if (endDate) params.endDate = endDate
  return params
}

export const paymentHandlers = [
  http.get('*/api/v1/payments/summary', ({ request }) => {
    const params = extractParams(request)
    return HttpResponse.json(db.payments.summary(params))
  }),

  http.get('*/api/v1/payments', ({ request }) => {
    const params = extractParams(request)
    return HttpResponse.json(db.payments.findAll(params))
  }),

  http.post('*/api/v1/payments', async ({ request }) => {
    const data = (await request.json()) as PaymentFormData
    const created = db.payments.create(data)
    return HttpResponse.json(created, { status: 201 })
  }),

  http.put('*/api/v1/payments/:id', async ({ request, params }) => {
    const data = (await request.json()) as Partial<PaymentFormData>
    const payment = db.payments.update(params.id as string, data)
    if (!payment) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(payment)
  }),

  http.patch('*/api/v1/payments/:id/receive', async ({ request, params }) => {
    const data = (await request.json()) as ConvenioReceiveData
    const payment = db.payments.receive(params.id as string, data)
    if (!payment) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(payment)
  }),

  http.delete('*/api/v1/payments/:id', ({ params }) => {
    db.payments.delete(params.id as string)
    return new HttpResponse(null, { status: 204 })
  }),
]
