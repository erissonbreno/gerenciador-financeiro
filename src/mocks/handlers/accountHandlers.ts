import { http, HttpResponse } from 'msw'
import { db } from '../db'
import type { AccountType, AccountFormData } from '../../types/models'

export const accountHandlers = [
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
