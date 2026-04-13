import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { PatientFormModal } from '../../src/components/patients/PatientFormModal'

const noop = async () => undefined

function renderModal() {
  return render(
    <PatientFormModal
      open={true}
      onClose={noop}
      onSave={noop}
      patient={null}
    />,
  )
}

describe('PatientFormModal', () => {
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

  it('shows required error messages on empty submit', async () => {
    renderModal()

    const user = userEvent.setup()
    await user.click(screen.getByText('Cadastrar paciente'))

    await waitFor(() => {
      expect(screen.getAllByText('Campo obrigatório').length).toBe(3)
    })
  })

  it('shows CPF error for invalid CPF', async () => {
    renderModal()

    const user = userEvent.setup()
    await user.clear(screen.getByLabelText('CPF'))
    await user.type(screen.getByLabelText('CPF'), '11111111111')
    await user.click(screen.getByText('Cadastrar paciente'))

    await waitFor(() => {
      expect(screen.getByText('CPF inválido')).toBeInTheDocument()
    })
  })

  it('shows CPF duplicate error from 409 response', async () => {
    const onSave = async () => 'CPF já cadastrado'

    render(
      <PatientFormModal
        open={true}
        onClose={() => {}}
        onSave={onSave}
        patient={null}
      />,
    )

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Nome completo'), 'Test Patient')
    await user.type(screen.getByLabelText('Data de nascimento'), '1990-01-01')
    await user.clear(screen.getByLabelText('CPF'))
    await user.type(screen.getByLabelText('CPF'), '52998224725')
    await user.click(screen.getByText('Cadastrar paciente'))

    await waitFor(() => {
      expect(screen.getByText('CPF já cadastrado')).toBeInTheDocument()
    })
  })
})
