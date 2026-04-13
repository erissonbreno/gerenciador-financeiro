import type { BackendPatient } from '../types/models'

let patients: BackendPatient[] = []

function matchesSearch(patient: BackendPatient, search: string): boolean {
  const q = search.toLowerCase()
  return (
    patient.fullName.toLowerCase().includes(q) ||
    patient.cpf.includes(q)
  )
}

export const patientTestDb = {
  findAll(params: { page?: number; limit?: number; search?: string } = {}): {
    data: BackendPatient[]
    total: number
    page: number
    totalPages: number
  } {
    let filtered = patients
    if (params.search) {
      filtered = filtered.filter((p) => matchesSearch(p, params.search!))
    }

    const page = params.page ?? 1
    const limit = params.limit ?? 10
    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit
    const data = filtered.slice(start, start + limit)

    return { data, total, page, totalPages }
  },

  findById(id: string): BackendPatient | undefined {
    return patients.find((p) => p.id === id)
  },

  create(data: Partial<BackendPatient> & { fullName: string; cpf: string }): BackendPatient {
    const patient: BackendPatient = {
      id: data.id ?? crypto.randomUUID(),
      fullName: data.fullName,
      birthDate: data.birthDate ?? '',
      cpf: data.cpf,
      rg: data.rg ?? '',
      gender: data.gender ?? '',
      maritalStatus: data.maritalStatus ?? '',
      phone: data.phone ?? '',
      email: data.email ?? '',
      address: data.address ?? {
        street: '',
        number: '',
        complement: '',
        district: '',
        city: '',
        state: '',
        zipCode: '',
      },
      healthPlan: data.healthPlan ?? '',
      age: data.age ?? 0,
      createdAt: data.createdAt ?? new Date().toISOString(),
      updatedAt: data.updatedAt ?? new Date().toISOString(),
    }
    patients = [...patients, patient]
    return patient
  },

  update(id: string, data: Partial<BackendPatient>): BackendPatient | undefined {
    let updated: BackendPatient | undefined
    patients = patients.map((p) => {
      if (p.id === id) {
        updated = { ...p, ...data, updatedAt: new Date().toISOString() }
        return updated
      }
      return p
    })
    return updated
  },

  delete(id: string): boolean {
    const len = patients.length
    patients = patients.filter((p) => p.id !== id)
    return patients.length < len
  },

  hasCpf(cpf: string, excludeId?: string): boolean {
    const normalized = cpf.replace(/\D/g, '')
    return patients.some(
      (p) => p.cpf.replace(/\D/g, '') === normalized && p.id !== excludeId,
    )
  },

  reset() {
    patients = []
  },
}
