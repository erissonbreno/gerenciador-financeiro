import { formatBRL } from '../../utils/currency'

export function AccountSummary({ summary }) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <p className="text-xs font-medium text-yellow-700 uppercase tracking-wide">Total Pendente</p>
        <p className="text-2xl font-bold text-yellow-800 mt-1" data-testid="total-pending">
          {formatBRL(summary.totalPending)}
        </p>
      </div>
      <div className="bg-accent-50 border border-accent-200 rounded-xl p-4">
        <p className="text-xs font-medium text-accent-700 uppercase tracking-wide">Total Pago</p>
        <p className="text-2xl font-bold text-accent-800 mt-1" data-testid="total-paid">
          {formatBRL(summary.totalPaid)}
        </p>
      </div>
    </div>
  )
}
