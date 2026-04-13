import React, { forwardRef } from 'react'
import { IMaskInput } from 'react-imask'

interface MaskedInputProps {
  label?: string
  error?: string
  id?: string
  name?: string
  value: string
  onAccept: (value: string) => void
  placeholder?: string
  mask: unknown
  className?: string
  dispatch?: unknown
  blocks?: unknown
}

const BaseMaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ label, error, id, name, value, onAccept, mask, className = '', ...rest }, ref) => (
    <div className={className}>
      <label className="block">
        {label && (
          <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
        )}
        <IMaskInput
          id={id}
          name={name}
          value={value}
          unmask
          onAccept={(val: string) => onAccept(val)}
          mask={mask as any}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 ${
            error ? 'border-red-400' : 'border-gray-300'
          }`}
          inputRef={ref as React.Ref<HTMLInputElement>}
          {...rest}
        />
      </label>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  ),
)

BaseMaskedInput.displayName = 'BaseMaskedInput'

interface SpecificMaskedInputProps {
  label?: string
  error?: string
  id?: string
  name?: string
  value: string
  onAccept: (value: string) => void
  className?: string
}

export function CpfInput(props: SpecificMaskedInputProps) {
  return <BaseMaskedInput mask="000.000.000-00" placeholder="000.000.000-00" {...props} />
}

export function PhoneInput(props: SpecificMaskedInputProps) {
  return (
    <BaseMaskedInput
      mask={[
        { mask: '(00) 0000-0000' },
        { mask: '(00) 00000-0000' },
      ] as any}
      dispatch={((appended: string, dynamicMasked: any) => {
        const digits = (dynamicMasked.value + appended).replace(/\D/g, '')
        return dynamicMasked.compiledMasks[digits.length > 10 ? 1 : 0]
      }) as any}
      placeholder="(00) 00000-0000"
      {...props}
    />
  )
}

export function CepInput(props: SpecificMaskedInputProps) {
  return <BaseMaskedInput mask="00000-000" placeholder="00000-000" {...props} />
}

export function NumericInput(props: SpecificMaskedInputProps) {
  return <BaseMaskedInput mask={/^\d*$/} {...props} />
}
