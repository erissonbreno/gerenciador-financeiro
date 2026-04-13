import { NumericFormat, type NumberFormatValues } from 'react-number-format'

interface CurrencyInputProps {
  label?: string
  error?: string
  id?: string
  name?: string
  value: string | number
  onValueChange: (values: NumberFormatValues) => void
  className?: string
}

export function CurrencyInput({ label, error, id, name, value, onValueChange, className = '' }: CurrencyInputProps) {
  return (
    <div className={className}>
      <label className="block">
        {label && (
          <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
        )}
        <NumericFormat
          id={id}
          name={name}
          value={value}
          onValueChange={onValueChange}
          prefix="R$ "
          thousandSeparator="."
          decimalSeparator=","
          decimalScale={2}
          fixedDecimalScale
          allowNegative={false}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 ${
            error ? 'border-red-400' : 'border-gray-300'
          }`}
        />
      </label>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
