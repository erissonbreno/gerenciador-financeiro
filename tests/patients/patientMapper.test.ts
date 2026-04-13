import { describe, it, expect } from 'vitest'
import { fromBackend, toBackend } from '../../src/services/patientMapper'
import type { BackendPatient, PatientFormValues } from '../../src/types/models'

const sampleBackendPatient: BackendPatient = {
  id: '1',
  fullName: 'Maria Silva',
  birthDate: '1990-01-15',
  cpf: '52998224725',
  rg: '123456',
  gender: 'feminino',
  maritalStatus: 'solteiro',
  phone: '11999990000',
  email: 'maria@test.com',
  address: {
    street: 'Rua A',
    number: '100',
    complement: 'Apto 1',
    district: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01000000',
  },
  healthPlan: 'Unimed',
  age: 34,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

const sampleFormValues: PatientFormValues = {
  name: 'Maria Silva',
  birthDate: '1990-01-15',
  cpf: '52998224725',
  rg: '123456',
  gender: 'feminino',
  maritalStatus: 'solteiro',
  phone: '11999990000',
  email: 'maria@test.com',
  street: 'Rua A',
  number: '100',
  complement: 'Apto 1',
  neighborhood: 'Centro',
  city: 'São Paulo',
  state: 'SP',
  zip: '01000000',
  healthPlan: 'Unimed',
}

describe('patientMapper', () => {
  describe('fromBackend', () => {
    it('maps all fields correctly', () => {
      const result = fromBackend(sampleBackendPatient)

      expect(result.id).toBe('1')
      expect(result.name).toBe('Maria Silva')
      expect(result.neighborhood).toBe('Centro')
      expect(result.zip).toBe('01000000')
      expect(result.street).toBe('Rua A')
      expect(result.createdAt).toBe('2024-01-01T00:00:00.000Z')
    })

    it('handles null address gracefully', () => {
      const patientWithoutAddress = {
        ...sampleBackendPatient,
        address: undefined as unknown as BackendPatient['address'],
      }
      const result = fromBackend(patientWithoutAddress)

      expect(result.street).toBe('')
      expect(result.neighborhood).toBe('')
      expect(result.zip).toBe('')
    })
  })

  describe('toBackend', () => {
    it('maps all fields correctly', () => {
      const result = toBackend(sampleFormValues) as Record<string, unknown>

      expect(result.fullName).toBe('Maria Silva')
      expect((result.address as Record<string, string>).district).toBe('Centro')
      expect((result.address as Record<string, string>).zipCode).toBe('01000000')
      expect((result.address as Record<string, string>).street).toBe('Rua A')
    })

    it('does not include id or createdAt', () => {
      const result = toBackend(sampleFormValues) as Record<string, unknown>

      expect(result).not.toHaveProperty('id')
      expect(result).not.toHaveProperty('createdAt')
    })
  })
})
