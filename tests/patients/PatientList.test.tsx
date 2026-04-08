import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { PatientsPage } from '../../src/pages/PatientsPage'
import { db } from '../../src/mocks/db'
import { renderWithProviders } from '../utils/renderWithProviders'
import type { PatientFormValues } from '../../src/types/models'

const samplePatientData: PatientFormValues = {
  name: 'Maria Silva',
  cpf: '52998224725',
  phone: '(11) 99999-0000',
  birthdate: '1990-01-15',
  rg: '123456',
  gender: 'feminino',
  maritalStatus: 'solteiro',
  email: 'maria@test.com',
  street: 'Rua A',
  number: '100',
  complement: '',
  neighborhood: 'Centro',
  city: 'São Paulo',
  state: 'SP',
  zip: '01000000',
  healthPlan: '',
}

function renderPage() {
  return renderWithProviders(<PatientsPage />)
}

describe('PatientList', () => {
  it('displays a pre-seeded patient in the table', async () => {
    db.patients.create(samplePatientData, { id: 'test-1', createdAt: '2024-01-01T00:00:00.000Z' })
    renderPage()

    expect(await screen.findByText('Maria Silva')).toBeInTheDocument()
  })

  it('removes a patient from the table on delete', async () => {
    db.patients.create(samplePatientData, { id: 'test-1', createdAt: '2024-01-01T00:00:00.000Z' })
    renderPage()

    expect(await screen.findByText('Maria Silva')).toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(screen.getByText('Excluir'))
    await user.click(screen.getByText('Confirmar'))

    await waitFor(() => {
      expect(screen.queryByText('Maria Silva')).not.toBeInTheDocument()
    })
  })
})
