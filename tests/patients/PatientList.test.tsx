import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { PatientsPage } from '../../src/pages/PatientsPage'
import { patientTestDb } from '../../src/mocks/patientTestDb'
import { renderWithProviders } from '../utils/renderWithProviders'

function seedPatient(overrides: Partial<Parameters<typeof patientTestDb.create>[0]> = {}) {
  return patientTestDb.create({
    fullName: 'Maria Silva',
    cpf: '52998224725',
    phone: '(11) 99999-0000',
    birthdate: '1990-01-15',
    rg: '123456',
    gender: 'feminino',
    maritalStatus: 'solteiro',
    email: 'maria@test.com',
    address: {
      street: 'Rua A',
      number: '100',
      complement: '',
      district: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01000000',
    },
    healthPlan: '',
    ...overrides,
  })
}

function renderPage() {
  return renderWithProviders(<PatientsPage />)
}

describe('PatientList', () => {
  it('displays a pre-seeded patient in the table', async () => {
    seedPatient({ id: 'test-1' })
    renderPage()

    expect(await screen.findByText('Maria Silva')).toBeInTheDocument()
  })

  it('removes a patient from the table on delete', async () => {
    seedPatient({ id: 'test-1' })
    renderPage()

    expect(await screen.findByText('Maria Silva')).toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(screen.getByText('Excluir'))
    await user.click(screen.getByText('Confirmar'))

    await waitFor(() => {
      expect(screen.queryByText('Maria Silva')).not.toBeInTheDocument()
    })
  })

  it('filters patients via server-side search', async () => {
    seedPatient({ id: 'test-1', fullName: 'Maria Silva', cpf: '52998224725' })
    seedPatient({ id: 'test-2', fullName: 'João Santos', cpf: '11144477735' })
    renderPage()

    expect(await screen.findByText('Maria Silva')).toBeInTheDocument()
    expect(screen.getByText('João Santos')).toBeInTheDocument()

    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('Buscar por nome, CPF ou telefone...'), 'João')

    await waitFor(() => {
      expect(screen.getByText('João Santos')).toBeInTheDocument()
      expect(screen.queryByText('Maria Silva')).not.toBeInTheDocument()
    })
  })
})
