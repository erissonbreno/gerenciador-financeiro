import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { FinancialPage } from '../../src/pages/FinancialPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <FinancialPage />
    </MemoryRouter>,
  )
}

describe('FinancialPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('renders both sub-tab labels', () => {
    renderPage()

    expect(screen.getByText('Contas a Pagar')).toBeInTheDocument()
    expect(screen.getByText('Contas a Receber')).toBeInTheDocument()
  })

  it('adds a payable account and updates pending total', () => {
    renderPage()

    fireEvent.click(screen.getByText('Nova Conta'))

    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Aluguel' } })
    fireEvent.change(screen.getByLabelText('Valor (R$)'), { target: { value: '1500' } })
    fireEvent.change(screen.getByLabelText('Data de vencimento'), { target: { value: '2030-12-01' } })

    fireEvent.click(screen.getByText('Criar conta'))

    expect(screen.getByTestId('total-pending').textContent).toContain('1.500')
  })

  it('adds a receivable account and updates pending total on receivable tab', () => {
    renderPage()

    fireEvent.click(screen.getByText('Contas a Receber'))
    fireEvent.click(screen.getByText('Nova Conta'))

    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Consulta' } })
    fireEvent.change(screen.getByLabelText('Valor (R$)'), { target: { value: '200' } })
    fireEvent.change(screen.getByLabelText('Data de vencimento'), { target: { value: '2030-12-01' } })

    fireEvent.click(screen.getByText('Criar conta'))

    expect(screen.getByTestId('total-pending').textContent).toContain('200')
  })

  it('updates totals when changing status from pending to paid', () => {
    const account = {
      id: 'acc-1',
      description: 'Exame',
      value: 500,
      dueDate: '2030-12-01',
      status: 'pending',
      category: '',
      patientId: '',
      createdAt: '2024-01-01T00:00:00.000Z',
    }
    localStorage.setItem('accounts_payable', JSON.stringify([account]))
    renderPage()

    expect(screen.getByTestId('total-pending').textContent).toContain('500')

    fireEvent.click(screen.getByText('Editar'))

    const statusSelect = screen.getByLabelText('Status')
    fireEvent.change(statusSelect, { target: { value: 'paid' } })
    fireEvent.click(screen.getByText('Salvar'))

    expect(screen.getByTestId('total-paid').textContent).toContain('500')
  })
})
