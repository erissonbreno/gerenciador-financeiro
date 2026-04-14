import React, { useState } from 'react'
import { Modal } from '../common/Modal'
import { Input } from '../common/Input'
import { Select } from '../common/Select'
import { Button } from '../common/Button'
import { CurrencyInput } from '../common/CurrencyInput'
import { accountCategories } from '../../constants/accountCategories'
import {
  PAYMENT_TYPES,
  PAYMENT_METHODS,
  CREDIT_MODES,
  INSTALLMENT_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  CONVENIO_TYPES,
} from '../../constants/paymentConstants'
import type {
  PaymentFormData,
  PaymentWithDerived,
  Patient,
  PaymentType,
  PaymentStatus,
} from '../../types/models'

const emptyForm: PaymentFormData = {
  patientId: '',
  description: '',
  value: '',
  serviceDate: '',
  paymentType: 'particular',
  status: 'pendente',
  category: '',
  paymentMethod: undefined,
  creditMode: undefined,
  installments: undefined,
  convenioType: undefined,
}

interface PaymentFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: PaymentFormData) => void
  payment?: PaymentWithDerived | null
  patients: Patient[]
}

interface FormInnerProps {
  payment?: PaymentWithDerived | null
  patients: Patient[]
  onSave: (data: PaymentFormData) => void
  onClose: () => void
}

function PaymentFormInner({ payment, patients, onSave, onClose }: FormInnerProps) {
  const [form, setForm] = useState<PaymentFormData>(() => {
    if (payment) {
      return {
        patientId: payment.patientId,
        description: payment.description,
        value: payment.value,
        serviceDate: payment.serviceDate,
        paymentType: payment.paymentType,
        status: payment.status,
        category: payment.category,
        paymentMethod: payment.paymentMethod,
        creditMode: payment.creditMode,
        installments: payment.installments,
        convenioType: payment.convenioType,
      }
    }
    return emptyForm
  })
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})

  const handleChange = (field: keyof PaymentFormData, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }

      if (field === 'paymentType') {
        const pt = value as PaymentType
        next.paymentMethod = undefined
        next.creditMode = undefined
        next.installments = undefined
        next.convenioType = undefined
        if (pt === 'convenio') {
          next.status = 'pendente'
        }
      }

      if (field === 'paymentMethod') {
        next.creditMode = undefined
        next.installments = undefined
      }

      if (field === 'creditMode') {
        if (value !== 'parcelado') {
          next.installments = undefined
        }
      }

      return next
    })
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.patientId) errs.patientId = 'Campo obrigatório'
    if (!form.description.trim()) errs.description = 'Campo obrigatório'
    if (!form.value || Number(form.value) <= 0) errs.value = 'Valor deve ser maior que zero'
    if (!form.serviceDate) errs.serviceDate = 'Campo obrigatório'

    if (form.paymentType === 'particular') {
      if (!form.paymentMethod) errs.paymentMethod = 'Campo obrigatório'
      if (form.paymentMethod === 'credito' && !form.creditMode) errs.creditMode = 'Campo obrigatório'
      if (form.creditMode === 'parcelado' && !form.installments) errs.installments = 'Campo obrigatório'
    }

    if (form.paymentType === 'convenio') {
      if (!form.convenioType) errs.convenioType = 'Campo obrigatório'
    }

    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    const submitData: PaymentFormData = {
      ...form,
      value: Number(form.value),
      installments: form.installments ? Number(form.installments) : undefined,
    }
    onSave(submitData)
    onClose()
  }

  const handle = (field: keyof PaymentFormData) => ({
    id: field,
    name: field,
    value: String(form[field] ?? ''),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      handleChange(field, e.target.value),
  })

  const isParticular = form.paymentType === 'particular'
  const isConvenio = form.paymentType === 'convenio'
  const isCredito = form.paymentMethod === 'credito'
  const isParcelado = form.creditMode === 'parcelado'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Paciente"
        options={patients.map((p) => ({ value: p.id, label: p.name }))}
        placeholder="Selecione o paciente"
        error={errors.patientId}
        {...handle('patientId')}
      />

      <Input label="Descrição" error={errors.description} {...handle('description')} />

      <CurrencyInput
        label="Valor (R$)"
        id="value"
        name="value"
        error={errors.value}
        value={form.value}
        onValueChange={(values) => handleChange('value', String(values.floatValue ?? ''))}
      />

      <Input
        label="Data do Atendimento"
        type="date"
        error={errors.serviceDate}
        {...handle('serviceDate')}
      />

      <Select
        label="Categoria"
        options={[...accountCategories]}
        placeholder="Selecione (opcional)"
        {...handle('category')}
      />

      <Select
        label="Tipo de Pagamento"
        options={PAYMENT_TYPES}
        error={errors.paymentType}
        {...handle('paymentType')}
      />

      {isParticular && (
        <>
          <Select
            label="Forma de Pagamento"
            options={PAYMENT_METHODS}
            placeholder="Selecione"
            error={errors.paymentMethod}
            value={form.paymentMethod ?? ''}
            onChange={(e) => handleChange('paymentMethod', e.target.value)}
            id="paymentMethod"
            name="paymentMethod"
          />

          {isCredito && (
            <Select
              label="Modalidade"
              options={CREDIT_MODES}
              placeholder="Selecione"
              error={errors.creditMode}
              value={form.creditMode ?? ''}
              onChange={(e) => handleChange('creditMode', e.target.value)}
              id="creditMode"
              name="creditMode"
            />
          )}

          {isCredito && isParcelado && (
            <Select
              label="Número de Parcelas"
              options={INSTALLMENT_OPTIONS}
              placeholder="Selecione"
              error={errors.installments}
              value={String(form.installments ?? '')}
              onChange={(e) => handleChange('installments', e.target.value)}
              id="installments"
              name="installments"
            />
          )}

          <Select
            label="Status"
            options={PAYMENT_STATUS_OPTIONS}
            error={errors.status}
            value={form.status}
            onChange={(e) => handleChange('status', e.target.value as PaymentStatus)}
            id="status"
            name="status"
          />
        </>
      )}

      {isConvenio && (
        <Select
          label="Tipo de Convênio"
          options={CONVENIO_TYPES}
          placeholder="Selecione o convênio"
          error={errors.convenioType}
          value={form.convenioType ?? ''}
          onChange={(e) => handleChange('convenioType', e.target.value)}
          id="convenioType"
          name="convenioType"
        />
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">{payment ? 'Salvar' : 'Criar Pagamento'}</Button>
      </div>
    </form>
  )
}

export function PaymentFormModal({ open, onClose, onSave, payment, patients }: PaymentFormModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={payment ? 'Editar Pagamento' : 'Novo Pagamento'}>
      {open ? (
        <PaymentFormInner
          key={payment?.id ?? 'new'}
          payment={payment}
          patients={patients}
          onSave={onSave}
          onClose={onClose}
        />
      ) : null}
    </Modal>
  )
}
