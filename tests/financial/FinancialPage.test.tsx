import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { FinancialPage } from '../../src/pages/FinancialPage'
import { db } from '../../src/mocks/db'
import { renderWithProviders } from '../utils/renderWithProviders'
import type { AccountFormData } from '../../src/types/models'

function renderPage() {
  return renderWithProviders(<FinancialPage />)
}

describe('FinancialPage', () => {
  it('renders financial sub-tab label', async () => {
    renderPage()

    expect(await screen.findByText('Contas a Receber')).toBeInTheDocument()
  })

  it('adds a payable account and updates pending total', async () => {
    renderPage()

    const user = userEvent.setup()
    await user.click(await screen.findByText('Nova Conta'))

    await user.clear(screen.getByLabelText('Descrição'))
    await user.type(screen.getByLabelText('Descrição'), 'Aluguel')
    await user.clear(screen.getByLabelText('Valor (R$)'))
    await user.type(screen.getByLabelText('Valor (R$)'), '1500')
    await user.clear(screen.getByLabelText('Data de vencimento'))
    await user.type(screen.getByLabelText('Data de vencimento'), '2030-12-01')

    await user.click(screen.getByText('Criar conta'))

    await waitFor(() => {
      expect(screen.getByTestId('total-pending').textContent).toContain('1.500')
    })
  })

  it('adds a receivable account and updates pending total on receivable tab', async () => {
    renderPage()

    const user = userEvent.setup()
    await user.click(await screen.findByText('Contas a Receber'))
    await user.click(screen.getByText('Nova Conta'))

    await user.clear(screen.getByLabelText('Descrição'))
    await user.type(screen.getByLabelText('Descrição'), 'Consulta')
    await user.clear(screen.getByLabelText('Valor (R$)'))
    await user.type(screen.getByLabelText('Valor (R$)'), '200')
    await user.clear(screen.getByLabelText('Data de vencimento'))
    await user.type(screen.getByLabelText('Data de vencimento'), '2030-12-01')

    await user.click(screen.getByText('Criar conta'))

    await waitFor(() => {
      expect(screen.getByTestId('total-pending').textContent).toContain('200')
    })
  })

  it('updates totals when changing status from pending to paid', async () => {
    const accountData: AccountFormData = {
      description: 'Exame',
      value: 500,
      dueDate: '2030-12-01',
      status: 'pending',
      category: '',
      patientId: '',
    }
    db.accounts.create('payable', accountData, { id: 'acc-1', createdAt: '2024-01-01T00:00:00.000Z' })
    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('total-pending').textContent).toContain('500')
    })

    const user = userEvent.setup()
    await user.click(screen.getByText('Editar'))

    const statusSelect = screen.getByLabelText('Status')
    await user.selectOptions(statusSelect, 'paid')
    await user.click(screen.getByText('Salvar'))

    await waitFor(() => {
      expect(screen.getByTestId('total-receivable').textContent).toContain('500')
    })
  })
})
