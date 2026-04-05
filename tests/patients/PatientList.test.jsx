import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PatientsPage } from '../../src/pages/PatientsPage'

const samplePatient = {
  id: 'test-1',
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
  createdAt: '2024-01-01T00:00:00.000Z',
}

function renderPage() {
  return render(
    <MemoryRouter>
      <PatientsPage />
    </MemoryRouter>,
  )
}

describe('PatientList', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('displays a pre-seeded patient in the table', () => {
    localStorage.setItem('patients', JSON.stringify([samplePatient]))
    renderPage()

    expect(screen.getByText('Maria Silva')).toBeInTheDocument()
  })

  it('removes a patient from the table on delete', () => {
    localStorage.setItem('patients', JSON.stringify([samplePatient]))
    renderPage()

    expect(screen.getByText('Maria Silva')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Excluir'))
    fireEvent.click(screen.getByText('Confirmar'))

    expect(screen.queryByText('Maria Silva')).not.toBeInTheDocument()
  })
})
