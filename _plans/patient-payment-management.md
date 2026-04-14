# Plano: Sistema de Gestao de Pagamentos de Pacientes

## Contexto

O modulo financeiro atual (`/financial`) gerencia contas a pagar/receber de forma generica. A necessidade e refatora-lo para um sistema de pagamentos vinculados a pacientes, com dois fluxos distintos (Particular e Convenio) e um painel de gestao de convenios com controle de pendencias.

---

## Fase 1: Fundacao (tipos, constantes, utilitarios)

### 1.1 Novos tipos — MODIFICAR `src/types/models.ts`

Adicionar (sem remover tipos existentes):

```typescript
type PaymentType = 'particular' | 'convenio'
type PaymentMethod = 'especie' | 'debito' | 'credito'
type CreditMode = 'avista' | 'parcelado'
type PaymentStatus = 'pendente' | 'pago'

interface Payment {
  id: string
  patientId: string              // obrigatorio
  description: string
  value: number
  serviceDate: string
  paymentType: PaymentType
  status: PaymentStatus
  category: string
  createdAt: string
  // Particular
  paymentMethod?: PaymentMethod
  creditMode?: CreditMode
  installments?: number          // 1-6
  installmentNumber?: number     // qual parcela
  parentPaymentId?: string       // vincula parcelas ao pagamento original
  // Convenio
  convenioType?: string
  receivedDate?: string
  receivedValue?: number         // valor efetivamente recebido (pode diferir por glosa)
}

interface PaymentWithDerived extends Payment {
  daysPending?: number           // dias desde serviceDate se pendente
}

interface PaymentFormData {
  patientId: string
  description: string
  value: string | number
  serviceDate: string
  paymentType: PaymentType
  status: PaymentStatus
  category: string
  paymentMethod?: PaymentMethod
  creditMode?: CreditMode
  installments?: number
  convenioType?: string
}

interface ConvenioReceiveData {
  receivedDate: string
  receivedValue: string | number
}

interface PaymentSummaryData {
  totalPending: number
  totalPaid: number
  totalReceived: number
}

interface PaymentQueryParams {
  paymentType?: PaymentType
  status?: PaymentStatus
  convenioType?: string
  patientId?: string
  startDate?: string
  endDate?: string
}
```

### 1.2 Constantes — CRIAR `src/constants/paymentConstants.ts`

- `PAYMENT_TYPES`: [{value: 'particular', label: 'Particular'}, {value: 'convenio', label: 'Convenio'}]
- `PAYMENT_METHODS`: Especie, Debito, Credito
- `CREDIT_MODES`: A vista, Parcelado
- `CONVENIO_TYPES`: Unimed, Bradesco Saude, SulAmerica, Amil, Hapvida, NotreDame Intermedica, CASSI, GEAP, Outros
- `MAX_INSTALLMENTS`: 6
- `INSTALLMENT_OPTIONS`: [{value: '1', label: '1x'}, ... ate 6x]
- `PAYMENT_STATUS_OPTIONS`: Pendente, Pago
- `OVERDUE_THRESHOLDS`: { warning: 30, danger: 60, critical: 90 }

### 1.3 Utilitario de data — MODIFICAR `src/utils/date.ts`

Adicionar:
- `daysSince(dateISO: string): number` — calcula dias desde uma data
- `getOverdueLevel(days: number): 'none' | 'warning' | 'danger' | 'critical'` — retorna nivel baseado nos thresholds

---

## Fase 2: Camada de Dados (service, mock DB, handlers)

### 2.1 Service — CRIAR `src/services/paymentService.ts`

Endpoints usando `apiV1`:
- `GET /payments` (com query params de filtro) → `PaymentWithDerived[]`
- `GET /payments/summary` (com query params) → `PaymentSummaryData`
- `POST /payments` (body: PaymentFormData) → `Payment`
- `PUT /payments/:id` (body: Partial<PaymentFormData>) → `Payment`
- `PATCH /payments/:id/receive` (body: ConvenioReceiveData) → `Payment`
- `DELETE /payments/:id`

### 2.2 Mock DB — MODIFICAR `src/mocks/db.ts`

Adicionar array `payments: Payment[]` persistido em localStorage key `'payments'`.

Funcoes:
- `db.payments.findAll(params?)` — filtra por paymentType, status, convenioType, patientId, periodo. Calcula `daysPending` para cada payment.
- `db.payments.summary(params?)` — totalPending, totalPaid, totalReceived
- `db.payments.create(data)` — se particular+credito+parcelado, gera N registros com `parentPaymentId`, `installmentNumber`, valor dividido. Se convenio, forca `status: 'pendente'`.
- `db.payments.update(id, data)`
- `db.payments.receive(id, data)` — marca como pago, registra receivedDate e receivedValue
- `db.payments.delete(id)` — se pai de parcelas, deleta parcelas filhas tambem

Incluir `payments` no `db.reset()`.

### 2.3 Mock Handlers — CRIAR `src/mocks/handlers/paymentHandlers.ts`

MSW handlers para todos os endpoints acima, usando base `/api/v1/payments`.

### 2.4 Registrar handlers — MODIFICAR `src/mocks/handlers.ts` e `src/mocks/server.ts`

Exportar e registrar `paymentHandlers`.

### 2.5 Hook — CRIAR `src/hooks/usePayments.ts`

React Query hook com:
- Query keys: `['payments', filters]` e `['payments', 'summary', filters]`
- Mutations: addPayment, updatePayment, receiveConvenio, deletePayment
- Invalida caches apos mutacoes
- Retorna: payments, summary, isLoading, error + mutation functions

---

## Fase 3: Componentes UI

### 3.1 Formulario de Pagamento — CRIAR `src/components/financial/PaymentFormModal.tsx`

Props: `{ open, onClose, onSave, payment?, patients }`

Campos (renderizacao condicional):
1. **Paciente** (Select, OBRIGATORIO)
2. **Descricao** (Input)
3. **Valor** (CurrencyInput)
4. **Data do Atendimento** (Input date)
5. **Categoria** (Select, reutilizar accountCategories)
6. **Tipo de Pagamento** (Select: Particular/Convenio)
7. Se **Particular**:
   - Forma de Pagamento (Select: Especie/Debito/Credito)
   - Se Credito → Modalidade (Select: A vista/Parcelado)
   - Se Parcelado → Numero de Parcelas (Select: 1x a 6x)
   - Status (Select: Pendente/Pago)
8. Se **Convenio**:
   - Tipo de Convenio (Select: lista hardcoded)
   - Status fica oculto/desabilitado (sempre cria como Pendente)

Validacao: patientId, description, value > 0, serviceDate obrigatorios. Campos condicionais obrigatorios quando visiveis. Ao trocar paymentType, limpar campos condicionais.

### 3.2 Modal de Recebimento — CRIAR `src/components/financial/ConvenioReceiveModal.tsx`

Props: `{ open, onClose, onConfirm, payment }`

Campos:
- Valor original (read-only)
- Data de Recebimento (Input date, obrigatorio)
- Valor Recebido (CurrencyInput, pre-preenchido com valor original)
- Se valor recebido != valor original, exibir nota de glosa

### 3.3 Lista de Pagamentos — CRIAR `src/components/financial/PaymentList.tsx`

Props: `{ payments, patients, onEdit, onDelete, onReceive, onNew }`

Colunas: Paciente, Descricao, Valor (R$), Data, Tipo, Status, Acoes
- Badge de status reutiliza componente existente
- Botao "Receber" aparece apenas para convenio pendente
- Highlight de cor para convenios pendentes baseado em daysPending (30/60/90)

### 3.4 Resumo de Pagamentos — CRIAR `src/components/financial/PaymentSummary.tsx`

Cards: Total Pendente (amarelo), Total Pago (verde/accent), Total Recebido (azul)
Reutilizar estilo do AccountSummary existente.

### 3.5 Filtros — CRIAR `src/components/financial/PaymentFilters.tsx`

Props: `{ filters, onChange, showConvenioFilter? }`

Linha de filtros: Tipo de Pagamento, Status, Tipo de Convenio (condicional), Periodo (inicio/fim)

### 3.6 Painel de Convenios — CRIAR `src/components/financial/ConvenioPanel.tsx`

Props: `{ payments, patients, summary, onReceive }`

Exibe apenas pagamentos de convenio com:
- Filtros proprios (status, tipo convenio, periodo)
- Tabela com: Paciente, Descricao, Valor, Data, Convenio, Status, Dias Pendente, Valor Recebido
- Highlight visual: 30+ dias (amarelo), 60+ (laranja), 90+ (vermelho)
- Totalizadores: total pendente, total recebido

---

## Fase 4: Integracao na Pagina

### 4.1 Tabs — MODIFICAR `src/components/financial/FinancialSubTabs.tsx`

Mudar tipo de tab para `'payments' | 'convenios'`:
- "Pagamentos" (tab principal)
- "Convenios" (painel de gestao)

### 4.2 Pagina Principal — REESCREVER `src/pages/FinancialPage.tsx`

Estado:
- `activeTab: 'payments' | 'convenios'`
- `filters: PaymentQueryParams`
- `formOpen`, `editTarget`, `deleteTarget`, `receiveTarget`

Estrutura:
- Header: "Financeiro" + botao "Novo Pagamento"
- FinancialSubTabs
- PaymentFilters
- Tab "Pagamentos": PaymentSummary + PaymentList + Pagination
- Tab "Convenios": ConvenioPanel (filtros automaticamente incluem paymentType: 'convenio')
- Modais: PaymentFormModal, ConvenioReceiveModal, ConfirmDialog

---

## Fase 5: Testes

### CRIAR `tests/financial/PaymentForm.test.tsx`
- Renderizacao condicional: alternar Particular/Convenio limpa e mostra campos corretos
- Dropdown de parcelamento aparece apenas quando Credito selecionado
- Submissao com dados validos para ambos os tipos
- Validacao de campos obrigatorios (patientId, descricao, valor, data)

### CRIAR `tests/financial/ConvenioPanel.test.tsx`
- Filtragem por status (Pendente/Pago)
- Calculo correto dos totalizadores
- Highlight visual baseado em tempo pendente (30/60/90 dias)

---

## Arquivos Criticos (resumo)

| Acao | Arquivo |
|------|---------|
| MODIFICAR | `src/types/models.ts` |
| MODIFICAR | `src/utils/date.ts` |
| MODIFICAR | `src/mocks/db.ts` |
| MODIFICAR | `src/mocks/handlers.ts` |
| MODIFICAR | `src/mocks/server.ts` |
| MODIFICAR | `src/components/financial/FinancialSubTabs.tsx` |
| REESCREVER | `src/pages/FinancialPage.tsx` |
| CRIAR | `src/constants/paymentConstants.ts` |
| CRIAR | `src/services/paymentService.ts` |
| CRIAR | `src/hooks/usePayments.ts` |
| CRIAR | `src/mocks/handlers/paymentHandlers.ts` |
| CRIAR | `src/components/financial/PaymentFormModal.tsx` |
| CRIAR | `src/components/financial/ConvenioReceiveModal.tsx` |
| CRIAR | `src/components/financial/PaymentList.tsx` |
| CRIAR | `src/components/financial/PaymentSummary.tsx` |
| CRIAR | `src/components/financial/PaymentFilters.tsx` |
| CRIAR | `src/components/financial/ConvenioPanel.tsx` |
| CRIAR | `tests/financial/PaymentForm.test.tsx` |
| CRIAR | `tests/financial/ConvenioPanel.test.tsx` |

Componentes antigos (AccountFormModal, AccountList, AccountSummary) permanecem no repositorio mas nao serao mais referenciados pela FinancialPage.

## Reutilizar do codigo existente

- `src/components/common/*` — Button, Input, Select, CurrencyInput, Modal, Badge, Pagination, ConfirmDialog, EmptyState
- `src/constants/accountCategories.ts` — lista de categorias
- `src/constants/statusOptions.ts` — config de cores de status
- `src/utils/currency.ts` — `formatBRL()`
- `src/utils/date.ts` — `formatDate()`, `isOverdue()`
- `src/hooks/usePagination.ts` — paginacao client-side
- `src/hooks/usePatients.ts` — carregar pacientes para selecao

## Verificacao

1. `npm run dev` — testar fluxo completo no browser:
   - Criar pagamento particular (especie, debito, credito a vista, credito parcelado)
   - Criar pagamento convenio → verificar que cria como pendente
   - Marcar convenio como pago → verificar valor recebido e data
   - Verificar totalizadores atualizam corretamente
   - Trocar entre tabs Pagamentos/Convenios
   - Filtrar por status, tipo, periodo
   - Verificar highlights de 30/60/90 dias
2. `npx vitest` — rodar testes automatizados
3. `npm run lint` — verificar erros de lint
