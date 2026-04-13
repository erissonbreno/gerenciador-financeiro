import { http, HttpResponse } from 'msw'
import { patientTestDb } from '../patientTestDb'

export const patientHandlers = [
  http.get('*/api/v1/patients', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const limit = Number(url.searchParams.get('limit')) || 10
    const search = url.searchParams.get('search') || undefined
    const result = patientTestDb.findAll({ page, limit, search })
    return HttpResponse.json(result)
  }),

  http.get('*/api/v1/patients/:id', ({ params }) => {
    const patient = patientTestDb.findById(params.id as string)
    if (!patient) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(patient)
  }),

  http.post('*/api/v1/patients', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const cpf = body.cpf as string
    if (patientTestDb.hasCpf(cpf)) {
      return HttpResponse.json({ message: 'CPF já cadastrado' }, { status: 409 })
    }
    const patient = patientTestDb.create(body as Parameters<typeof patientTestDb.create>[0])
    return HttpResponse.json(patient, { status: 201 })
  }),

  http.put('*/api/v1/patients/:id', async ({ request, params }) => {
    const id = params.id as string
    const body = (await request.json()) as Record<string, unknown>
    const cpf = body.cpf as string | undefined
    if (cpf && patientTestDb.hasCpf(cpf, id)) {
      return HttpResponse.json({ message: 'CPF já cadastrado' }, { status: 409 })
    }
    const patient = patientTestDb.update(id, body as Partial<Parameters<typeof patientTestDb.create>[0]>)
    if (!patient) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(patient)
  }),

  http.delete('*/api/v1/patients/:id', ({ params }) => {
    patientTestDb.delete(params.id as string)
    return new HttpResponse(null, { status: 204 })
  }),
]
