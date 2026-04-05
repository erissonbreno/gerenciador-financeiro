import type { AccountType } from '../../types/models'

const tabs: { key: AccountType; label: string }[] = [
  { key: 'payable', label: 'Contas a Pagar' },
  { key: 'receivable', label: 'Contas a Receber' },
]

interface FinancialSubTabsProps {
  activeTab: AccountType
  onChange: (tab: AccountType) => void
}

export function FinancialSubTabs({ activeTab, onChange }: FinancialSubTabsProps) {
  return (
    <div className="flex border-b border-gray-200 mb-6">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`px-6 py-3 text-sm font-medium transition-colors cursor-pointer ${
            activeTab === key
              ? 'text-primary-700 border-b-2 border-primary-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
