# Plan: Migração do Projeto para TypeScript

## Context
O projeto gerenciador-financeiro foi construído em JavaScript/JSX com React 19, Vite 8, Tailwind CSS 4 e Vitest 4. A migração para TypeScript visa adicionar tipagem estrita sem alterar nenhuma lógica de negócio. São 42 arquivos fonte + 3 de teste a migrar.

Spec: `_specs/typescript-migration.md`

---

## Phase 0 — Scaffolding TypeScript

### 0.1 Instalar TypeScript
- `npm install --save-dev typescript`

### 0.2 Criar `tsconfig.json` na raiz
- `strict: true`, `jsx: react-jsx`, `moduleResolution: bundler`, `noEmit: true`
- `types: ["vitest/globals"]` (testes usam globals)
- `include: ["src", "tests"]`

### 0.3 Criar `src/vite-env.d.ts`
- `/// <reference types="vite/client" />`

### 0.4 Renomear `vite.config.js` → `vite.config.ts`
- Adicionar `/// <reference types="vitest/config" />` no topo
- Atualizar `setupFiles` para `./src/setupTests.ts`

### 0.5 Renomear `src/setupTests.js` → `src/setupTests.ts`

---

## Phase 1 — Tipos compartilhados

### Criar `src/types/models.ts`
Interfaces e types usados em todo o projeto:
- `Patient` (17 campos + id + createdAt)
- `PatientFormValues` = `Omit<Patient, 'id' | 'createdAt'>`
- `AccountStatus` = `'pending' | 'paid'`
- `DerivedStatus` = `'pending' | 'paid' | 'overdue'`
- `AccountType` = `'payable' | 'receivable'`
- `Account` (8 campos)
- `AccountWithDerived` extends Account + `derivedStatus`
- `AccountFormData` (value como `string | number` para compatibilidade com input)
- `AccountSummaryData` (`totalPending`, `totalPaid`)
- `SelectOption` (`value`, `label`)
- `StatusConfig` (`label`, `colorClass`)

---

## Phase 2 — Constants (3 arquivos `.js` → `.ts`)

- `src/constants/brazilStates.ts` — adicionar `as const`
- `src/constants/accountCategories.ts` — adicionar `as const`
- `src/constants/statusOptions.ts` — tipar como `Record<DerivedStatus, StatusConfig>`

---

## Phase 3 — Utils (4 arquivos `.js` → `.ts`)

- `src/utils/storage.ts` — adicionar generic `<T>` em `readStorage`/`writeStorage`
- `src/utils/cpf.ts` — anotar parâmetros e retornos `(value: string): boolean/string`
- `src/utils/date.ts` — anotar `(dateISO: string): string/boolean`
- `src/utils/currency.ts` — anotar `(value: number): string`

---

## Phase 4 — Hooks (4 arquivos `.js` → `.ts`)

- `src/hooks/useLocalStorage.ts` — generic `<T>`, criar type `SetValue<T> = T | ((prev: T) => T)`, cast necessário no `typeof newValue === 'function'`
- `src/hooks/usePatients.ts` — importar `Patient`, `PatientFormValues`, `Account`; tipar CRUD e `readStorage<Account[]>` no `deletePatient`
- `src/hooks/useAccounts.ts` — importar `Account`, `AccountWithDerived`, `AccountType`, `AccountSummaryData`; parâmetro `type: AccountType`
- `src/hooks/usePagination.ts` — generic `<T>(items: T[])`

---

## Phase 5 — Components (17 arquivos `.jsx` → `.tsx`)

### 5A — Common (9 arquivos)
- `Button.tsx` — `ButtonProps extends React.ButtonHTMLAttributes` + `variant?` union
- `Input.tsx` — `InputProps extends React.InputHTMLAttributes` + `label?`, `error?`
- `Select.tsx` — `SelectProps extends React.SelectHTMLAttributes` + `options`, `placeholder?`. **Fix:** renomear variável interna `label` → `optLabel` para evitar shadowing
- `Badge.tsx` — `BadgeProps { status: DerivedStatus }`
- `EmptyState.tsx` — `EmptyStateProps { message, actionLabel?, onAction? }`
- `Modal.tsx` — `ModalProps { open, onClose, title, children: React.ReactNode }`
- `ConfirmDialog.tsx` — `ConfirmDialogProps { open, onClose, onConfirm, title?, message }`
- `SearchBar.tsx` — `SearchBarProps { value, onChange(string), placeholder? }`
- `Pagination.tsx` — `PaginationProps { currentPage, totalPages, onPrev, onNext }`

### 5B — Navigation (2 arquivos)
- `Sidebar.tsx` — tipar `NavItem { to, label, icon: React.FC }`
- `TopBar.tsx` — tipar links array

### 5C — Patients (2 arquivos)
- `PatientFormFields.tsx` — `PatientFormFieldsProps { values: Record<string,string>, errors: Record<string,string|undefined>, onChange, onBlur? }`
- `PatientTable.tsx` — `PatientTableProps { patients: Patient[], onView, onEdit, onDelete, onNew }`

### 5D — Financial (4 arquivos)
- `FinancialSubTabs.tsx` — `{ activeTab: AccountType, onChange }`
- `AccountSummary.tsx` — `{ summary: AccountSummaryData }`
- `AccountList.tsx` — `{ accounts: AccountWithDerived[], patients: Patient[], onEdit, onDelete, onNew }`
- `AccountFormModal.tsx` — `{ open, onClose, onSave, account: Account|null, patients }`. State interno: `form: AccountFormData`, `errors: Record<string,string|undefined>`

---

## Phase 6 — Pages (5 arquivos `.jsx` → `.tsx`)

- `PatientFormPage.tsx` — tipar `emptyValues`, `errors: Record<string,string>`, `validate()` return type
- `PatientsPage.tsx` — tipar `deleteTarget: Patient | null`
- `PatientDetailPage.tsx` — tipar `Field` props, `useParams`
- `FinancialPage.tsx` — tipar `activeTab: AccountType`, `editTarget: AccountWithDerived | null`, `deleteTarget: AccountWithDerived | null`
- `NotFoundPage.tsx` — apenas renomear

---

## Phase 7 — Entry & Routing (4 arquivos `.jsx` → `.tsx`)

- `src/routes/index.tsx` — tipar `routes: RouteObject[]`
- `src/layouts/MainLayout.tsx` — apenas renomear
- `src/App.tsx` — apenas renomear
- `src/main.tsx` — adicionar non-null assertion em `getElementById('root')!`
- Atualizar `index.html`: `src="/src/main.tsx"`

---

## Phase 8 — Tests (3 arquivos `.test.jsx` → `.test.tsx`)

- `tests/patients/PatientForm.test.tsx` — apenas renomear
- `tests/patients/PatientList.test.tsx` — tipar `samplePatient` como `Patient`
- `tests/financial/FinancialPage.test.tsx` — tipar `account` como `Account`

---

## Pitfalls conhecidos

1. **`Select` shadowing** — variável `label` interna conflita com prop `label`. Renomear para `optLabel`
2. **`useLocalStorage` generic narrowing** — `typeof newValue === 'function'` não narrow o union. Cast necessário
3. **`main.tsx` null root** — `getElementById` retorna `HTMLElement | null`. Usar `!`
4. **`AccountFormModal` value type** — input retorna string, submit converte para number. `AccountFormData.value` deve ser `string | number`
5. **`vite.config.ts`** — campo `test` vem do Vitest. Adicionar `/// <reference types="vitest/config" />`

---

## Verification

1. `npx tsc --noEmit` — sem erros de tipo
2. `npx vite build` — build de produção bem-sucedido
3. `npx vitest run` — todos os 9 testes passando
4. `find src tests -name "*.js" -o -name "*.jsx"` — nenhum arquivo JS/JSX restante
