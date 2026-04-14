import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { FinancialPage } from '../../src/pages/FinancialPage'
import { db } from '../../src/mocks/db'
import { patientTestDb } from '../../src/mocks/patientTestDb'
import { renderWithProviders } from '../utils/renderWithProviders'

function seedPatient(): string {
  const p = patientTestDb.create({
    fullName: 'Ana Costa',
    birthDate: '1992-03-20',
    cpf: '11122233344',
    rg: '1112223',
    gender: 'Feminino',
    maritalStatus: 'Solteira',
    phone: '11977777777',
    email: 'ana@test.com',
    address: {
      street: 'Rua C',
      number: '300',
      complement: '',
      district: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01000000',
    },
    healthPlan: '',
  })
  return p.id
}

function renderPage() {
  return renderWithProviders(<FinancialPage />)
}

describe('FinancialPage', () => {
  it('renders the Pagamentos and Convênios tabs', async () => {
    renderPage()

    expect(await screen.findByText('Pagamentos')).toBeInTheDocument()
    expect(screen.getByText('Convênios')).toBeInTheDocument()
  })

  it('shows summary cards with zero totals initially', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('total-pending')).toBeInTheDocument()
      expect(screen.getByTestId('total-paid')).toBeInTheDocument()
      expect(screen.getByTestId('total-received')).toBeInTheDocument()
    })
  })

  it('adds a payment and updates summary', async () => {
    const patientId = seedPatient()
    renderPage()

    const user = userEvent.setup()
    const buttons = await screen.findAllByText('Novo Pagamento')
    await user.click(buttons[0])

    // Select patient
    const patientSelect = screen.getByLabelText('Paciente')
    await user.selectOptions(patientSelect, patientId)

    await user.type(screen.getByLabelText('Descrição'), 'Consulta')
    await user.type(screen.getByLabelText('Valor (R$)'), '300')
    await user.type(screen.getByLabelText('Data do Atendimento'), '2030-12-01')
    await user.selectOptions(screen.getByLabelText('Forma de Pagamento'), 'especie')

    await user.click(screen.getByText('Criar Pagamento'))

    await waitFor(() => {
      expect(screen.getByTestId('total-pending').textContent).toContain('300')
    })
  })

  it('switches between Pagamentos and Convênios tabs', async () => {
    const patientId = seedPatient()
    db.payments.create({
      patientId,
      description: 'Sessão convênio',
      value: 200,
      serviceDate: '2026-04-01',
      paymentType: 'convenio',
      status: 'pendente',
      category: 'Consulta',
      convenioType: 'Unimed',
    })

    renderPage()

    const user = userEvent.setup()
    await user.click(await screen.findByText('Convênios'))

    await waitFor(() => {
      expect(screen.getByText('Sessão convênio')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Pagamentos'))

    await waitFor(() => {
      expect(screen.getByTestId('total-pending')).toBeInTheDocument()
    })
  })
})
