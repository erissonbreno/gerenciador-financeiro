# Plano: Substituir localStorage por API + MSW

## Context
O app usa localStorage diretamente via hooks (`usePatients`, `useAccounts` → `useLocalStorage` → `storage.ts`). O objetivo é migrar para chamadas HTTP com **axios**, cache com **TanStack Query**, e mock com **MSW** — de modo que quando a API real existir, baste trocar a `baseURL` e remover o MSW.

Decisões do usuário: axios, TanStack Query, dados do MSW persistidos no localStorage.

## Contrato da API REST

**Base URL:** `/api`

### Pacientes
| Método | Rota | Body | Resposta |
|--------|------|------|----------|
| GET | `/api/patients` | — | `Patient[]` |
| GET | `/api/patients/check-cpf?cpf=X&excludeId=Y` | — | `{ taken: boolean }` |
| GET | `/api/patients/:id` | — | `Patient` |
| POST | `/api/patients` | `PatientFormValues` | `Patient` (com id/createdAt) |
| PUT | `/api/patients/:id` | `Partial<PatientFormValues>` | `Patient` |
| DELETE | `/api/patients/:id` | — | `204` (cascade limpa patientId nas contas) |

### Contas
| Método | Rota | Body | Resposta |
|--------|------|------|----------|
| GET | `/api/accounts?type=payable\|receivable` | — | `AccountWithDerived[]` |
| GET | `/api/accounts/summary?type=payable\|receivable` | — | `AccountSummaryData` |
| POST | `/api/accounts?type=payable\|receivable` | `AccountFormData` | `Account` |
| PUT | `/api/accounts/:id?type=payable\|receivable` | `Partial<AccountFormData>` | `Account` |
| DELETE | `/api/accounts/:id?type=payable\|receivable` | — | `204` |

## Passos de Implementação

### Passo 0 — Instalar dependências
```
npm install axios @tanstack/react-query msw
npx msw init public/ --save
```

### Passo 1 — Criar instância axios
**Criar:** `src/services/api.ts`
- Exportar instância axios com `baseURL: '/api'`

### Passo 2 — Criar camada de serviços
**Criar:** `src/services/patientService.ts`
- `getPatients()`, `getPatientById(id)`, `createPatient(data)`, `updatePatient(id, data)`, `deletePatient(id)`, `checkCpf(cpf, excludeId?)`
- Todas retornam `Promise`, usam a instância de `api.ts`

**Criar:** `src/services/accountService.ts`
- `getAccounts(type)`, `getAccountSummary(type)`, `createAccount(type, data)`, `updateAccount(type, id, data)`, `deleteAccount(type, id)`

### Passo 3 — Criar MSW (mock database + handlers)
**Criar:** `src/mocks/db.ts`
- Banco em memória com persistência no localStorage (lê na init, grava após cada mutação)
- Funções CRUD para patients e accounts
- Cascade delete: `patients.delete(id)` limpa `patientId` nas contas (mesma lógica atual de `usePatients.ts:42-54`)
- Derivação de overdue: usa `isOverdue()` de `src/utils/date.ts:7`
- Cálculo de summary: `totalPending` e `totalPaid`

**Criar:** `src/mocks/handlers.ts`
- Handlers HTTP que mapeiam cada rota do contrato acima para funções do `db.ts`
- IMPORTANTE: rota `/api/patients/check-cpf` declarada **antes** de `/api/patients/:id`

**Criar:** `src/mocks/browser.ts` — `setupWorker(...handlers)` para dev
**Criar:** `src/mocks/server.ts` — `setupServer(...handlers)` para testes

### Passo 4 — Inicializar MSW no bootstrap
**Modificar:** `src/main.tsx`
- Tornar async: se `import.meta.env.DEV`, importar dynamicamente `./mocks/browser` e chamar `worker.start()` antes do `createRoot().render()`

### Passo 5 — Adicionar QueryClientProvider
**Modificar:** `src/App.tsx`
- Envolver `RouterProvider` com `QueryClientProvider`
- `staleTime: 60_000`, `retry: 1`

### Passo 6 — Reescrever `usePatients`
**Modificar:** `src/hooks/usePatients.ts`
- Substituir `useLocalStorage` por `useQuery({ queryKey: ['patients'], queryFn: patientService.getPatients })`
- `addPatient`, `updatePatient`, `deletePatient` → `useMutation` + `invalidateQueries`
- `deletePatient.onSuccess` invalida também `['accounts']` (cascade)
- `getPatientById` continua sync (filtra da lista em cache)
- `isCpfTaken` vira **async** → chama `patientService.checkCpf()`
- Exportar `isLoading` e `error`

### Passo 7 — Reescrever `useAccounts`
**Modificar:** `src/hooks/useAccounts.ts`
- `useQuery({ queryKey: ['accounts', type] })` para lista (já vem com `derivedStatus`)
- `useQuery({ queryKey: ['accounts', type, 'summary'] })` para totais
- Mutações com `useMutation` + invalidação
- Usar `placeholderData: keepPreviousData` para evitar flash ao trocar tabs
- Remover `useMemo` de `accountsWithOverdue` e `summary` (agora vem do servidor)

### Passo 8 — Atualizar páginas para async + loading/error
**Modificar:** `src/pages/PatientsPage.tsx`
- Destructurar `isLoading`, `error` de `usePatients()`
- Mostrar estado de loading/erro
- `handleSave` e `handleDelete` viram `async`

**Modificar:** `src/pages/PatientDetailPage.tsx`
- Mesma abordagem; `handleDelete` await antes de `navigate`

**Modificar:** `src/pages/FinancialPage.tsx`
- Destructurar `isLoading`, `error` de `useAccounts()`
- `handleSave` e `handleDelete` viram `async`

### Passo 9 — Atualizar PatientFormModal para async
**Modificar:** `src/components/patients/PatientFormModal.tsx`
- Tipo de `isCpfTaken` muda para `(...) => Promise<boolean>`
- Função `validate` vira `async`
- `handleSubmit` vira `async`, com estado `submitting` para desabilitar botão
- Tipo de `onSave` muda para `(...) => void | Promise<void>`

### Passo 10 — Limpar código morto
**Deletar:** `src/hooks/useLocalStorage.ts` (sem consumidores)
**Manter:** `src/utils/storage.ts` — `db.ts` do MSW pode usá-lo, ou substituir por `localStorage` direto dentro do mock

### Passo 11 — Migrar testes
**Modificar:** `vitest.config.ts` ou `src/setupTests.ts`
- Setup global do MSW server: `beforeAll(server.listen)`, `afterEach(server.resetHandlers)`, `afterAll(server.close)`

**Modificar:** `tests/patients/PatientForm.test.tsx`
- `isCpfTaken` vira `async () => false`
- Submit assertions com `waitFor`

**Modificar:** `tests/patients/PatientList.test.tsx`
- Substituir `localStorage.setItem` por seed via `db` do mock
- Envolver render com `QueryClientProvider`
- Usar `findByText` / `waitFor` em vez de `getByText`

**Modificar:** `tests/financial/FinancialPage.test.tsx`
- Mesma migração: seed via db, QueryClientProvider, assertions async

## Arquivos Críticos

| Arquivo | Ação |
|---------|------|
| `src/services/api.ts` | Criar |
| `src/services/patientService.ts` | Criar |
| `src/services/accountService.ts` | Criar |
| `src/mocks/db.ts` | Criar |
| `src/mocks/handlers.ts` | Criar |
| `src/mocks/browser.ts` | Criar |
| `src/mocks/server.ts` | Criar |
| `src/main.tsx` | Modificar (bootstrap async) |
| `src/App.tsx` | Modificar (QueryClientProvider) |
| `src/hooks/usePatients.ts` | Reescrever |
| `src/hooks/useAccounts.ts` | Reescrever |
| `src/pages/PatientsPage.tsx` | Modificar (async + loading) |
| `src/pages/PatientDetailPage.tsx` | Modificar (async + loading) |
| `src/pages/FinancialPage.tsx` | Modificar (async + loading) |
| `src/components/patients/PatientFormModal.tsx` | Modificar (async validation) |
| `src/hooks/useLocalStorage.ts` | Deletar |
| `tests/**` | Migrar para MSW + QueryClientProvider |

## Funções Existentes a Reutilizar
- `isOverdue()` de `src/utils/date.ts:7` — usada no `db.ts` para derivar status
- `isValidCPF()` de `src/utils/cpf.ts` — usada no handler de `check-cpf` do MSW
- Tipos de `src/types/models.ts` — sem alterações necessárias

## Verificação

1. `npx tsc --noEmit` — sem erros de tipo
2. `npx vitest run` — todos os testes passam
3. `npm run dev` — testar manualmente:
   - CRUD completo de pacientes (criar, editar, deletar)
   - CRUD completo de contas (pagar, receber)
   - Validação de CPF duplicado
   - Cascade delete (deletar paciente limpa patientId das contas)
   - Recarregar página: dados persistem (MSW lê do localStorage)
   - Tab Network do DevTools: requisições indo para `/api/*` e sendo interceptadas pelo MSW
