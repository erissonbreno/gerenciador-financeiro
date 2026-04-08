import { http, HttpResponse } from 'msw'
import { db } from './db'
import type { AccountType, PatientFormValues, AccountFormData } from '../types/models'

export const handlers = [
  // — Patients —

  // check-cpf MUST be before :id to avoid matching "check-cpf" as an id
  http.get('/api/patients/check-cpf', ({ request }) => {
    const url = new URL(request.url)
    const cpf = url.searchParams.get('cpf') ?? ''
    const excludeId = url.searchParams.get('excludeId') ?? undefined
    const taken = db.patients.checkCpf(cpf, excludeId)
    return HttpResponse.json({ taken })
  }),

  http.get('/api/patients', () => {
    return HttpResponse.json(db.patients.findAll())
  }),

  http.get('/api/patients/:id', ({ params }) => {
    const patient = db.patients.findById(params.id as string)
    if (!patient) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(patient)
  }),

  http.post('/api/patients', async ({ request }) => {
    const data = (await request.json()) as PatientFormValues
    const patient = db.patients.create(data)
    return HttpResponse.json(patient, { status: 201 })
  }),

  http.put('/api/patients/:id', async ({ request, params }) => {
    const data = (await request.json()) as Partial<PatientFormValues>
    const patient = db.patients.update(params.id as string, data)
    if (!patient) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(patient)
  }),

  http.delete('/api/patients/:id', ({ params }) => {
    db.patients.delete(params.id as string)
    return new HttpResponse(null, { status: 204 })
  }),

  // — Accounts —

  // summary MUST be before generic accounts routes
  http.get('/api/accounts/summary', ({ request }) => {
    const url = new URL(request.url)
    const type = url.searchParams.get('type') as AccountType
    return HttpResponse.json(db.accounts.summary(type))
  }),

  http.get('/api/accounts', ({ request }) => {
    const url = new URL(request.url)
    const type = url.searchParams.get('type') as AccountType
    return HttpResponse.json(db.accounts.findAll(type))
  }),

  http.post('/api/accounts', async ({ request }) => {
    const url = new URL(request.url)
    const type = url.searchParams.get('type') as AccountType
    const data = (await request.json()) as AccountFormData
    const account = db.accounts.create(type, data)
    return HttpResponse.json(account, { status: 201 })
  }),

  http.put('/api/accounts/:id', async ({ request, params }) => {
    const url = new URL(request.url)
    const type = url.searchParams.get('type') as AccountType
    const data = (await request.json()) as Partial<AccountFormData>
    const account = db.accounts.update(type, params.id as string, data)
    if (!account) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(account)
  }),

  http.delete('/api/accounts/:id', ({ request, params }) => {
    const url = new URL(request.url)
    const type = url.searchParams.get('type') as AccountType
    db.accounts.delete(type, params.id as string)
    return new HttpResponse(null, { status: 204 })
  }),
]
