import { useState } from 'react'
import { useAccounts } from '../hooks/useAccounts'
import { usePatients } from '../hooks/usePatients'
import { usePagination } from '../hooks/usePagination'
import { FinancialSubTabs } from '../components/financial/FinancialSubTabs'
import { AccountSummary } from '../components/financial/AccountSummary'
import { AccountList } from '../components/financial/AccountList'
import { AccountFormModal } from '../components/financial/AccountFormModal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { Pagination } from '../components/common/Pagination'
import { Button } from '../components/common/Button'

export function FinancialPage() {
  const [activeTab, setActiveTab] = useState('payable')
  const { accounts, summary, addAccount, updateAccount, deleteAccount } = useAccounts(activeTab)
  const { patients } = usePatients()
  const { pagedItems, currentPage, totalPages, next, prev } = usePagination(accounts)

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const handleSave = (data) => {
    if (editTarget) {
      updateAccount(editTarget.id, data)
    } else {
      addAccount(data)
    }
    setEditTarget(null)
  }

  const handleEdit = (account) => {
    setEditTarget(account)
    setFormOpen(true)
  }

  const handleDelete = () => {
    if (deleteTarget) {
      deleteAccount(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Financeiro</h1>
        <Button onClick={() => { setEditTarget(null); setFormOpen(true) }}>Nova Conta</Button>
      </div>

      <FinancialSubTabs activeTab={activeTab} onChange={setActiveTab} />
      <AccountSummary summary={summary} />

      <div className="bg-white rounded-xl shadow-sm">
        <AccountList
          accounts={pagedItems}
          patients={patients}
          onEdit={handleEdit}
          onDelete={(acc) => setDeleteTarget(acc)}
          onNew={() => { setEditTarget(null); setFormOpen(true) }}
        />
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPrev={prev} onNext={next} />

      <AccountFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTarget(null) }}
        onSave={handleSave}
        account={editTarget}
        patients={patients}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir conta"
        message={`Tem certeza que deseja excluir "${deleteTarget?.description}"?`}
      />
    </div>
  )
}
