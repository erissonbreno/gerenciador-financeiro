import React, { useState } from 'react'
import { Modal } from '../common/Modal'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import { CurrencyInput } from '../common/CurrencyInput'
import { formatBRL } from '../../utils/currency'
import type { PaymentWithDerived, ConvenioReceiveData } from '../../types/models'

interface ConvenioReceiveModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (data: ConvenioReceiveData) => void
  payment: PaymentWithDerived | null
}

function ReceiveForm({
  payment,
  onConfirm,
  onClose,
}: {
  payment: PaymentWithDerived
  onConfirm: (data: ConvenioReceiveData) => void
  onClose: () => void
}) {
  const [receivedDate, setReceivedDate] = useState('')
  const [receivedValue, setReceivedValue] = useState<string | number>(payment.value)
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})

  const hasGlosa = Number(receivedValue) !== payment.value && Number(receivedValue) > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!receivedDate) errs.receivedDate = 'Campo obrigatório'
    if (!receivedValue || Number(receivedValue) <= 0) errs.receivedValue = 'Valor deve ser maior que zero'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    onConfirm({ receivedDate, receivedValue: Number(receivedValue) })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-1">Valor Original</p>
        <p className="text-lg font-semibold text-gray-800">{formatBRL(payment.value)}</p>
      </div>

      <Input
        label="Data de Recebimento"
        type="date"
        id="receivedDate"
        value={receivedDate}
        onChange={(e) => {
          setReceivedDate(e.target.value)
          if (errors.receivedDate) setErrors((prev) => ({ ...prev, receivedDate: undefined }))
        }}
        error={errors.receivedDate}
      />

      <CurrencyInput
        label="Valor Recebido (R$)"
        id="receivedValue"
        value={receivedValue}
        onValueChange={(values) => {
          setReceivedValue(String(values.floatValue ?? ''))
          if (errors.receivedValue) setErrors((prev) => ({ ...prev, receivedValue: undefined }))
        }}
        error={errors.receivedValue}
      />

      {hasGlosa && (
        <p className="text-xs text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
          O valor recebido difere do valor original. Diferença (glosa):{' '}
          {formatBRL(payment.value - Number(receivedValue))}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" variant="accent">Confirmar Recebimento</Button>
      </div>
    </form>
  )
}

export function ConvenioReceiveModal({ open, onClose, onConfirm, payment }: ConvenioReceiveModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Registrar Recebimento">
      {open && payment ? (
        <ReceiveForm key={payment.id} payment={payment} onConfirm={onConfirm} onClose={onClose} />
      ) : null}
    </Modal>
  )
}
