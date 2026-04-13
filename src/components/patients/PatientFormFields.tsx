import React from 'react'
import { Input } from '../common/Input'
import { Select } from '../common/Select'
import { CpfInput, NumericInput, PhoneInput, CepInput } from '../common/MaskedInput'
import { brazilStates } from '../../constants/brazilStates'

const genderOptions = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
  { value: 'outro', label: 'Outro' },
]

const maritalOptions = [
  { value: 'solteiro', label: 'Solteiro(a)' },
  { value: 'casado', label: 'Casado(a)' },
  { value: 'divorciado', label: 'Divorciado(a)' },
  { value: 'viuvo', label: 'Viúvo(a)' },
  { value: 'uniao_estavel', label: 'União Estável' },
]

interface PatientFormFieldsProps {
  values: Record<string, string>
  errors: Record<string, string | undefined>
  onChange: (field: string, value: string) => void
  onBlur?: (field: string) => void
}

export function PatientFormFields({ values, errors, onChange, onBlur }: PatientFormFieldsProps) {
  const handle = (field: string) => ({
    id: field,
    name: field,
    value: values[field] || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange(field, e.target.value),
    onBlur: onBlur ? () => onBlur(field) : undefined,
  })

  const handleMasked = (field: string) => ({
    id: field,
    name: field,
    value: values[field] || '',
    onAccept: (val: string) => onChange(field, val),
    error: errors[field],
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input label="Nome completo" error={errors.name} {...handle('name')} className="md:col-span-2" />
      <Input label="Data de nascimento" type="date" error={errors.birthdate} {...handle('birthdate')} />
      <CpfInput label="CPF" {...handleMasked('cpf')} />
      <NumericInput label="RG" {...handleMasked('rg')} />
      <Select label="Gênero" options={genderOptions} placeholder="Selecione" error={errors.gender} {...handle('gender')} />
      <Select label="Estado civil" options={maritalOptions} placeholder="Selecione" error={errors.maritalStatus} {...handle('maritalStatus')} />
      <PhoneInput label="Telefone" {...handleMasked('phone')} />
      <Input label="E-mail" type="email" error={errors.email} {...handle('email')} />

      <div className="md:col-span-2 mt-2">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">Endereço</h3>
      </div>
      <Input label="Logradouro" error={errors.street} {...handle('street')} className="md:col-span-2" />
      <Input label="Número" error={errors.number} {...handle('number')} />
      <Input label="Complemento" error={errors.complement} {...handle('complement')} />
      <Input label="Bairro" error={errors.neighborhood} {...handle('neighborhood')} />
      <Input label="Cidade" error={errors.city} {...handle('city')} />
      <Select label="Estado" options={[...brazilStates]} placeholder="Selecione" error={errors.state} {...handle('state')} />
      <CepInput label="CEP" {...handleMasked('zip')} />

      <Input label="Plano de Saúde" error={errors.healthPlan} {...handle('healthPlan')} className="md:col-span-2" />
    </div>
  )
}
