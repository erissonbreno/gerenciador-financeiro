import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PatientFormModal } from '../../src/components/patients/PatientFormModal'

const noop = () => {}

function renderModal() {
  return render(
    <PatientFormModal
      open={true}
      onClose={noop}
      onSave={noop}
      patient={null}
      isCpfTaken={() => false}
    />,
  )
}

describe('PatientFormModal', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('renders all field labels', () => {
    renderModal()

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
    renderModal()

    fireEvent.click(screen.getByText('Cadastrar paciente'))

    expect(screen.getAllByText('Campo obrigatório').length).toBeGreaterThanOrEqual(10)
  })

  it('shows CPF error for invalid CPF', () => {
    renderModal()

    fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '11111111111' } })
    fireEvent.click(screen.getByText('Cadastrar paciente'))

    expect(screen.getByText('CPF inválido')).toBeInTheDocument()
  })
})
