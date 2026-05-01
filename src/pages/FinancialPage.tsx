import { useState } from 'react'
import { usePayments } from '../hooks/usePayments'
import { usePatients } from '../hooks/usePatients'
import { usePagination } from '../hooks/usePagination'
import { FinancialSubTabs } from '../components/financial/FinancialSubTabs'
import { PaymentSummary } from '../components/financial/PaymentSummary'
import { PaymentList } from '../components/financial/PaymentList'
import { PaymentFilters } from '../components/financial/PaymentFilters'
import { PaymentFormModal } from '../components/financial/PaymentFormModal'
import { ConvenioReceiveModal } from '../components/financial/ConvenioReceiveModal'
import { ConvenioPanel } from '../components/financial/ConvenioPanel'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { Pagination } from '../components/common/Pagination'
import { Button } from '../components/common/Button'
import type { FinancialTab } from '../components/financial/FinancialSubTabs'
import type { PaymentWithDerived, PaymentFormData, PaymentQueryParams, ConvenioReceiveData } from '../types/models'

export function FinancialPage() {
  const [activeTab, setActiveTab] = useState<FinancialTab>('payments')
  const [filters, setFilters] = useState<PaymentQueryParams>({})

  const convenioFilters: PaymentQueryParams = { ...filters, paymentType: 'convenio' }
  const currentFilters = activeTab === 'convenios' ? convenioFilters : filters

  const { payments, summary, addPayment, updatePayment, receiveConvenio, deletePayment, isLoading, error } =
    usePayments(currentFilters)
  const { patients } = usePatients()
  const { pagedItems, currentPage, totalPages, next, prev } = usePagination(payments)

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<PaymentWithDerived | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PaymentWithDerived | null>(null)
  const [receiveTarget, setReceiveTarget] = useState<PaymentWithDerived | null>(null)

  const handleSave = async (data: PaymentFormData) => {
    if (editTarget) {
      await updatePayment(editTarget.id, { ...data, value: Number(data.value) })
    } else {
      await addPayment(data)
    }
    setEditTarget(null)
  }

  const handleEdit = (payment: PaymentWithDerived) => {
    setEditTarget(payment)
    setFormOpen(true)
  }

  const handleDelete = async () => {
    if (deleteTarget) {
      await deletePayment(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  const handleReceive = async (data: ConvenioReceiveData) => {
    if (receiveTarget) {
      await receiveConvenio(receiveTarget.id, data)
      setReceiveTarget(null)
    }
  }

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Carregando...</div>
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">Erro ao carregar pagamentos.</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Financeiro</h1>
        <Button onClick={() => { setEditTarget(null); setFormOpen(true) }}>Novo Pagamento</Button>
      </div>

      <FinancialSubTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'payments' && (
        <>
          <PaymentFilters filters={filters} onChange={setFilters} />
          <PaymentSummary summary={summary} />

          <div className="bg-white rounded-xl shadow-sm">
            <PaymentList
              payments={pagedItems}
              patients={patients}
              onEdit={handleEdit}
              onDelete={(p) => setDeleteTarget(p)}
              onReceive={(p) => setReceiveTarget(p)}
              onNew={() => { setEditTarget(null); setFormOpen(true) }}
            />
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPrev={prev} onNext={next} />
        </>
      )}

      {activeTab === 'convenios' && (
        <ConvenioPanel
          payments={payments}
          patients={patients}
          summary={summary}
          onReceive={(p) => setReceiveTarget(p)}
        />
      )}

      <PaymentFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTarget(null) }}
        onSave={handleSave}
        payment={editTarget}
        patients={patients}
      />

      <ConvenioReceiveModal
        open={!!receiveTarget}
        onClose={() => setReceiveTarget(null)}
        onConfirm={handleReceive}
        payment={receiveTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir pagamento"
        message={`Tem certeza que deseja excluir "${deleteTarget?.description}"?`}
      />
    </div>
  )
}
