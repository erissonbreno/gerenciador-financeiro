import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PatientFormPage } from '../../src/pages/PatientFormPage'

function renderForm() {
  return render(
    <MemoryRouter initialEntries={['/patients/new']}>
      <PatientFormPage />
    </MemoryRouter>,
  )
}

describe('PatientForm', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('renders all 17 field labels', () => {
    renderForm()

    const labels = [
      'Nome completo', 'Data de nascimento', 'CPF', 'RG', 'Gênero',
      'Estado civil', 'Telefone', 'E-mail', 'Logradouro', 'Número',
      'Complemento', 'Bairro', 'Cidade', 'Estado', 'CEP', 'Plano de Saúde',
    ]

    for (const label of labels) {
      expect(screen.getByLabelText(label)).toBeInTheDocument()
    }
  })

  it('shows required error messages on empty submit', () => {
    renderForm()

    fireEvent.click(screen.getByText('Cadastrar paciente'))

    expect(screen.getAllByText('Campo obrigatório').length).toBeGreaterThanOrEqual(10)
  })

  it('shows CPF error for invalid CPF', () => {
    renderForm()

    fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '11111111111' } })
    fireEvent.click(screen.getByText('Cadastrar paciente'))

    expect(screen.getByText('CPF inválido')).toBeInTheDocument()
  })
})
