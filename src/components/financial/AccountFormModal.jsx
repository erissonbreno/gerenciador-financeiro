import { useState, useEffect } from 'react'
import { Modal } from '../common/Modal'
import { Input } from '../common/Input'
import { Select } from '../common/Select'
import { Button } from '../common/Button'
import { accountCategories } from '../../constants/accountCategories'
import { isOverdue } from '../../utils/date'

const statusOpts = [
  { value: 'pending', label: 'Pendente' },
  { value: 'paid', label: 'Pago' },
]

const emptyForm = {
  description: '',
  value: '',
  dueDate: '',
  status: 'pending',
  category: '',
  patientId: '',
}

export function AccountFormModal({ open, onClose, onSave, account, patients }) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [warning, setWarning] = useState('')

  useEffect(() => {
    if (open) {
      setForm(account ? { ...emptyForm, ...account } : emptyForm)
      setErrors({})
      setWarning('')
    }
  }, [open, account])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))

    if (field === 'dueDate' && value && isOverdue(value)) {
      setWarning('A data de vencimento está no passado.')
    } else if (field === 'dueDate') {
      setWarning('')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.description.trim()) errs.description = 'Campo obrigatório'
    if (!form.value || Number(form.value) <= 0) errs.value = 'Valor deve ser maior que zero'
    if (!form.dueDate) errs.dueDate = 'Campo obrigatório'

    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    onSave({ ...form, value: Number(form.value) })
    onClose()
  }

  const handle = (field) => ({
    id: field,
    name: field,
    value: form[field] || '',
    onChange: (e) => handleChange(field, e.target.value),
  })

  return (
    <Modal open={open} onClose={onClose} title={account ? 'Editar Conta' : 'Nova Conta'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Descrição" error={errors.description} {...handle('description')} />
        <Input label="Valor (R$)" type="number" step="0.01" min="0" error={errors.value} {...handle('value')} />
        <Input label="Data de vencimento" type="date" error={errors.dueDate} {...handle('dueDate')} />
        {warning && <p className="text-xs text-yellow-600">{warning}</p>}
        <Select label="Status" options={statusOpts} error={errors.status} {...handle('status')} />
        <Select label="Categoria" options={accountCategories} placeholder="Selecione (opcional)" {...handle('category')} />
        <Select
          label="Paciente vinculado"
          options={patients.map((p) => ({ value: p.id, label: p.name }))}
          placeholder="Selecione (opcional)"
          {...handle('patientId')}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{account ? 'Salvar' : 'Criar conta'}</Button>
        </div>
      </form>
    </Modal>
  )
}
