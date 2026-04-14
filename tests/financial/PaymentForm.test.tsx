import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { FinancialPage } from '../../src/pages/FinancialPage'
import { renderWithProviders } from '../utils/renderWithProviders'
import { patientTestDb } from '../../src/mocks/patientTestDb'

function seedPatient() {
  patientTestDb.create({
    fullName: 'Maria Silva',
    birthDate: '1990-01-01',
    cpf: '12345678900',
    rg: '1234567',
    gender: 'Feminino',
    maritalStatus: 'Solteira',
    phone: '11999999999',
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
    healthPlan: 'Unimed',
  })
}

function renderPage() {
  return renderWithProviders(<FinancialPage />)
}

describe('PaymentForm — conditional rendering', () => {
  it('shows Particular fields by default and hides Convenio fields', async () => {
    seedPatient()
    renderPage()

    const user = userEvent.setup()
    const buttons = await screen.findAllByText('Novo Pagamento')
    await user.click(buttons[0])

    expect(screen.getByLabelText('Forma de Pagamento')).toBeInTheDocument()
    expect(screen.getByLabelText('Status')).toBeInTheDocument()
    expect(screen.queryByLabelText('Tipo de Convênio')).not.toBeInTheDocument()
  })

  it('switches to Convenio fields when payment type changes', async () => {
    seedPatient()
    renderPage()

    const user = userEvent.setup()
    const buttons = await screen.findAllByText('Novo Pagamento')
    await user.click(buttons[0])

    await user.selectOptions(screen.getByLabelText('Tipo de Pagamento'), 'convenio')

    expect(screen.getByLabelText('Tipo de Convênio')).toBeInTheDocument()
    expect(screen.queryByLabelText('Forma de Pagamento')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Status')).not.toBeInTheDocument()
  })

  it('shows installment dropdown only when Credito + Parcelado is selected', async () => {
    seedPatient()
    renderPage()

    const user = userEvent.setup()
    const buttons = await screen.findAllByText('Novo Pagamento')
    await user.click(buttons[0])

    expect(screen.queryByLabelText('Modalidade')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Número de Parcelas')).not.toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Forma de Pagamento'), 'credito')
    expect(screen.getByLabelText('Modalidade')).toBeInTheDocument()
    expect(screen.queryByLabelText('Número de Parcelas')).not.toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Modalidade'), 'parcelado')
    expect(screen.getByLabelText('Número de Parcelas')).toBeInTheDocument()
  })

  it('validates required fields on submit', async () => {
    seedPatient()
    renderPage()

    const user = userEvent.setup()
    const buttons = await screen.findAllByText('Novo Pagamento')
    await user.click(buttons[0])
    await user.click(screen.getByText('Criar Pagamento'))

    await waitFor(() => {
      expect(screen.getAllByText('Campo obrigatório').length).toBeGreaterThanOrEqual(2)
    })
  })

  it('submits a valid Particular payment', async () => {
    seedPatient()
    renderPage()

    const user = userEvent.setup()
    const buttons = await screen.findAllByText('Novo Pagamento')
    await user.click(buttons[0])

    // Select patient
    const patientSelect = screen.getByLabelText('Paciente')
    const patientOption = patientSelect.querySelector('option:not([value=""])')
    if (patientOption) {
      await user.selectOptions(patientSelect, (patientOption as HTMLOptionElement).value)
    }

    await user.type(screen.getByLabelText('Descrição'), 'Consulta fonoaudiologia')
    await user.type(screen.getByLabelText('Valor (R$)'), '150')
    await user.type(screen.getByLabelText('Data do Atendimento'), '2026-04-10')
    await user.selectOptions(screen.getByLabelText('Forma de Pagamento'), 'especie')

    await user.click(screen.getByText('Criar Pagamento'))

    await waitFor(() => {
      expect(screen.getByTestId('total-pending')).toBeInTheDocument()
    })
  })

  it('submits a valid Convenio payment', async () => {
    seedPatient()
    renderPage()

    const user = userEvent.setup()
    const buttons = await screen.findAllByText('Novo Pagamento')
    await user.click(buttons[0])

    const patientSelect = screen.getByLabelText('Paciente')
    const patientOption = patientSelect.querySelector('option:not([value=""])')
    if (patientOption) {
      await user.selectOptions(patientSelect, (patientOption as HTMLOptionElement).value)
    }

    await user.type(screen.getByLabelText('Descrição'), 'Sessão fonoterapia')
    await user.type(screen.getByLabelText('Valor (R$)'), '200')
    await user.type(screen.getByLabelText('Data do Atendimento'), '2026-04-10')
    await user.selectOptions(screen.getByLabelText('Tipo de Pagamento'), 'convenio')
    await user.selectOptions(screen.getByLabelText('Tipo de Convênio'), 'Unimed')

    await user.click(screen.getByText('Criar Pagamento'))

    await waitFor(() => {
      expect(screen.getByTestId('total-pending')).toBeInTheDocument()
    })
  })
})
