import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { CpfInput, PhoneInput, CepInput } from '../../src/components/common/MaskedInput'
import { CurrencyInput } from '../../src/components/common/CurrencyInput'
import { PatientFormModal } from '../../src/components/patients/PatientFormModal'

const noop = () => {}

describe('CpfInput', () => {
  it('formats digits as CPF', async () => {
    let value = ''
    render(<CpfInput label="CPF" value={value} onAccept={(v) => { value = v }} />)
    const input = screen.getByLabelText('CPF') as HTMLInputElement

    const user = userEvent.setup()
    await user.type(input, '12345678900')

    await waitFor(() => {
      expect(input.value).toBe('123.456.789-00')
    })
  })

  it('rejects non-numeric characters', async () => {
    let value = ''
    render(<CpfInput label="CPF" value={value} onAccept={(v) => { value = v }} />)
    const input = screen.getByLabelText('CPF') as HTMLInputElement

    const user = userEvent.setup()
    await user.type(input, 'abc123')

    await waitFor(() => {
      expect(input.value).toBe('123')
    })
  })
})

describe('PhoneInput', () => {
  it('formats 11-digit phone', async () => {
    let value = ''
    render(<PhoneInput label="Telefone" value={value} onAccept={(v) => { value = v }} />)
    const input = screen.getByLabelText('Telefone') as HTMLInputElement

    const user = userEvent.setup()
    await user.type(input, '11999887766')

    await waitFor(() => {
      expect(input.value).toBe('(11) 99988-7766')
    })
  })

  it('formats 10-digit phone', async () => {
    let value = ''
    render(<PhoneInput label="Telefone" value={value} onAccept={(v) => { value = v }} />)
    const input = screen.getByLabelText('Telefone') as HTMLInputElement

    const user = userEvent.setup()
    await user.type(input, '1133445566')

    await waitFor(() => {
      expect(input.value).toBe('(11) 3344-5566')
    })
  })
})

describe('CepInput', () => {
  it('formats digits as CEP', async () => {
    let value = ''
    render(<CepInput label="CEP" value={value} onAccept={(v) => { value = v }} />)
    const input = screen.getByLabelText('CEP') as HTMLInputElement

    const user = userEvent.setup()
    await user.type(input, '01001000')

    await waitFor(() => {
      expect(input.value).toBe('01001-000')
    })
  })
})

describe('CurrencyInput', () => {
  it('formats value with R$ prefix and decimal', async () => {
    render(<CurrencyInput label="Valor" value="" onValueChange={noop} />)
    const input = screen.getByLabelText('Valor') as HTMLInputElement

    const user = userEvent.setup()
    await user.type(input, '1500')

    await waitFor(() => {
      expect(input.value).toContain('R$')
    })
  })
})

describe('PatientFormModal required fields', () => {
  it('requires only 3 fields (name, birthdate, cpf)', async () => {
    render(
      <PatientFormModal
        open={true}
        onClose={noop}
        onSave={noop}
        patient={null}
        isCpfTaken={async () => false}
      />,
    )

    const user = userEvent.setup()
    await user.click(screen.getByText('Cadastrar paciente'))

    await waitFor(() => {
      expect(screen.getAllByText('Campo obrigatório').length).toBe(3)
    })
  })

  it('submits with only required fields filled', async () => {
    let saved = false
    render(
      <PatientFormModal
        open={true}
        onClose={noop}
        onSave={() => { saved = true }}
        patient={null}
        isCpfTaken={async () => false}
      />,
    )

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Nome completo'), 'Maria Silva')
    await user.type(screen.getByLabelText('Data de nascimento'), '1990-05-15')
    await user.type(screen.getByLabelText('CPF'), '52998224725')
    await user.click(screen.getByText('Cadastrar paciente'))

    await waitFor(() => {
      expect(saved).toBe(true)
    })
  })
})
