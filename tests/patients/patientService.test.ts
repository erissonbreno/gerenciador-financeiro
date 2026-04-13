import { describe, it, expect, beforeEach } from 'vitest'
import { patientTestDb } from '../../src/mocks/patientTestDb'
import * as patientService from '../../src/services/patientService'

beforeEach(() => {
  patientTestDb.reset()
})

describe('patientService', () => {
  it('getPatients returns paginated and mapped data', async () => {
    patientTestDb.create({
      id: 'svc-1',
      fullName: 'Ana Costa',
      cpf: '52998224725',
      birthdate: '1985-05-10',
      address: {
        street: 'Rua B',
        number: '200',
        complement: '',
        district: 'Jardim',
        city: 'Rio de Janeiro',
        state: 'RJ',
        zipCode: '20000000',
      },
    })

    const result = await patientService.getPatients({ page: 1, limit: 10 })

    expect(result.data).toHaveLength(1)
    expect(result.data[0].name).toBe('Ana Costa')
    expect(result.data[0].neighborhood).toBe('Jardim')
    expect(result.data[0].zip).toBe('20000000')
    expect(result.total).toBe(1)
    expect(result.page).toBe(1)
  })

  it('getPatientById returns mapped patient', async () => {
    patientTestDb.create({ id: 'svc-2', fullName: 'Carlos Lima', cpf: '11144477735' })

    const patient = await patientService.getPatientById('svc-2')
    expect(patient.name).toBe('Carlos Lima')
    expect(patient.id).toBe('svc-2')
  })

  it('createPatient sends mapped data and returns mapped patient', async () => {
    const patient = await patientService.createPatient({
      name: 'Beatriz Souza',
      birthdate: '2000-03-20',
      cpf: '52998224725',
      rg: '',
      gender: 'feminino',
      maritalStatus: '',
      phone: '',
      email: '',
      street: 'Rua C',
      number: '300',
      complement: '',
      neighborhood: 'Vila Nova',
      city: 'Curitiba',
      state: 'PR',
      zip: '80000000',
      healthPlan: '',
    })

    expect(patient.name).toBe('Beatriz Souza')
    expect(patient.neighborhood).toBe('Vila Nova')
    expect(patient.id).toBeTruthy()
  })

  it('deletePatient removes the patient', async () => {
    patientTestDb.create({ id: 'svc-del', fullName: 'Delete Me', cpf: '00000000000' })

    await patientService.deletePatient('svc-del')

    const result = await patientService.getPatients()
    expect(result.data).toHaveLength(0)
  })
})
