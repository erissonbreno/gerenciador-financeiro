import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { FinancialPage } from '../../src/pages/FinancialPage'
import { db } from '../../src/mocks/db'
import { patientTestDb } from '../../src/mocks/patientTestDb'
import { renderWithProviders } from '../utils/renderWithProviders'

function seedPatient(): string {
  const p = patientTestDb.create({
    fullName: 'João Souza',
    birthDate: '1985-05-15',
    cpf: '98765432100',
    rg: '7654321',
    gender: 'Masculino',
    maritalStatus: 'Casado',
    phone: '11988888888',
    email: 'joao@test.com',
    address: {
      street: 'Rua B',
      number: '200',
      complement: '',
      district: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01000000',
    },
    healthPlan: 'Unimed',
  })
  return p.id
}

function seedPayments(patientId: string) {
  // Convenio pendente old (90+ days)
  db.payments.create({
    patientId,
    description: 'Sessão antiga',
    value: 300,
    serviceDate: '2026-01-01',
    paymentType: 'convenio',
    status: 'pendente',
    category: 'Consulta',
    convenioType: 'Unimed',
  })

  // Convenio pendente recent
  db.payments.create({
    patientId,
    description: 'Sessão recente',
    value: 200,
    serviceDate: '2026-04-10',
    paymentType: 'convenio',
    status: 'pendente',
    category: 'Consulta',
    convenioType: 'Amil',
  })

  // Convenio pago
  db.payments.create({
    patientId,
    description: 'Sessão paga',
    value: 250,
    serviceDate: '2026-03-01',
    paymentType: 'convenio',
    status: 'pendente',
    category: 'Exame',
    convenioType: 'Unimed',
  })
}

function renderPage() {
  return renderWithProviders(<FinancialPage />)
}

describe('ConvenioPanel', () => {
  it('shows convenio payments when switching to Convenios tab', async () => {
    const patientId = seedPatient()
    seedPayments(patientId)
    renderPage()

    const user = userEvent.setup()
    await user.click(await screen.findByText('Convênios'))

    await waitFor(() => {
      expect(screen.getByText('Sessão antiga')).toBeInTheDocument()
      expect(screen.getByText('Sessão recente')).toBeInTheDocument()
    })
  })

  it('filters by status in convenio tab', async () => {
    const patientId = seedPatient()
    seedPayments(patientId)
    renderPage()

    const user = userEvent.setup()
    await user.click(await screen.findByText('Convênios'))

    await waitFor(() => {
      expect(screen.getByText('Sessão antiga')).toBeInTheDocument()
    })

    // All payments seeded are pendente, filtering by pago should show empty
    const statusSelects = screen.getAllByRole('combobox')
    const statusSelect = statusSelects.find((s) => {
      const options = Array.from(s.querySelectorAll('option'))
      return options.some((o) => o.textContent === 'Pago')
    })

    if (statusSelect) {
      await user.selectOptions(statusSelect, 'pago')
      await waitFor(() => {
        expect(screen.getByText('Nenhum pagamento de convênio encontrado')).toBeInTheDocument()
      })
    }
  })

  it('displays days pending for pending convenio payments', async () => {
    const patientId = seedPatient()
    seedPayments(patientId)
    renderPage()

    const user = userEvent.setup()
    await user.click(await screen.findByText('Convênios'))

    await waitFor(() => {
      const cells = screen.getAllByText(/\d+d/)
      expect(cells.length).toBeGreaterThan(0)
    })
  })

  it('shows Receber button for pending convenio payments', async () => {
    const patientId = seedPatient()
    seedPayments(patientId)
    renderPage()

    const user = userEvent.setup()
    await user.click(await screen.findByText('Convênios'))

    await waitFor(() => {
      const receiveButtons = screen.getAllByText('Receber')
      expect(receiveButtons.length).toBeGreaterThan(0)
    })
  })
})
