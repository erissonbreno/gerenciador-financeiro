# Plan: Gerenciador Financeiro — Financial Manager App with Patient Registration

## Context
Projeto React + Vite + Tailwind CSS criado do zero. Não existe nenhum código de aplicação ainda — apenas `.claude/` e `_specs/`. O objetivo é construir um gerenciador financeiro com módulo de pacientes (CRUD completo) e módulo financeiro (contas a pagar e a receber), usando `localStorage` como storage, sem autenticação, com paleta em azul claro / verde claro e suporte a desktop + tablet.

Spec: `_specs/financial-manager-patient-registration.md`

---

## Phase 1 — Foundation

### 1.1 Scaffold & Config
- Run `npm create vite@latest . -- --template react` (TypeScript, not JavaScript)
- Install deps: `react-router-dom`
- Install dev deps: `tailwindcss postcss autoprefixer vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event`
- Run `npx tailwindcss init -p`

### 1.2 Config files to create/modify
- `tailwind.config.js` — set `content` paths, extend `colors` with `primary` (sky-* family) and `accent` (emerald-* family)
- `vite.config.js` — add `test: { environment: "jsdom", globals: true, setupFiles: ["./src/setupTests.js"] }`
- `src/setupTests.js` — import `@testing-library/jest-dom`
- `src/index.css` — Tailwind directives

### 1.3 Utils & Constants
- `src/utils/storage.js` — `readStorage(key, default)`, `writeStorage(key, data)`, `clearStorage(key)`
- `src/utils/cpf.js` — `isValidCPF(value)` (mod-11 algorithm), `formatCPF(value)` (mask)
- `src/utils/date.js` — parse, display format, `isOverdue(dateISO)` check
- `src/utils/currency.js` — BRL formatter
- `src/constants/brazilStates.js` — UF array
- `src/constants/accountCategories.js` — category options
- `src/constants/statusOptions.js` — `{ pending, paid, overdue }` with label + Tailwind color class

---

## Phase 2 — Hooks

- `src/hooks/useLocalStorage.js` — generic `[value, setValue]` backed by localStorage
- `src/hooks/usePatients.js` — CRUD + CPF uniqueness check. Exposes: `patients`, `getPatientById(id)`, `addPatient(data)`, `updatePatient(id, data)`, `deletePatient(id)`, `isCpfTaken(cpf, currentId)`
- `src/hooks/useAccounts.js` — CRUD + summary. Takes `type: "payable" | "receivable"`. Exposes: `accounts`, `summary: { totalPending, totalPaid }`, `addAccount`, `updateAccount`, `deleteAccount`. Overdue is a **derived read-only status** (not written back to storage).
- `src/hooks/usePagination.js` — `{ pagedItems, currentPage, totalPages, goTo, next, prev }`

---

## Phase 3 — Common Components

- `src/components/common/Button.jsx`
- `src/components/common/Input.jsx` — renders label + input + optional error message
- `src/components/common/Select.jsx` — renders label + select + optional error message
- `src/components/common/Badge.jsx` — status pill (pending/paid/overdue) using `statusOptions` color map
- `src/components/common/EmptyState.jsx` — message + optional CTA
- `src/components/common/Modal.jsx` — generic overlay shell
- `src/components/common/ConfirmDialog.jsx` — extends Modal with Confirm/Cancel
- `src/components/common/SearchBar.jsx`
- `src/components/common/Pagination.jsx`

---

## Phase 4 — Navigation Shell

- `src/components/navigation/Sidebar.jsx` — links to `/patients` and `/financial`, collapses to icon rail on tablet (`md:` classes), highlights active route via `useLocation`
- `src/components/navigation/TopBar.jsx` — mobile/narrow fallback
- `src/layouts/MainLayout.jsx` — composes sidebar + `<Outlet>`
- `src/routes/index.jsx`:
  ```
  /               → redirect to /patients
  /patients       → PatientsPage
  /patients/new   → PatientFormPage (create)
  /patients/:id   → PatientDetailPage
  /patients/:id/edit → PatientFormPage (edit)
  /financial      → FinancialPage
  *               → NotFoundPage
  ```
- `src/App.jsx` — wraps routes in `<BrowserRouter>`

---

## Phase 5 — Patient Module

### Components
- `src/components/patients/PatientFormFields.jsx` — all 17 fields (name, birthdate, CPF, RG, gender, marital status, phone, email, address x7, health plan), purely presentational, receives `values`, `errors`, `onChange`, `onBlur`
- `src/components/patients/PatientTable.jsx` — columns: name, CPF (masked), phone; action buttons: view, edit, delete; renders `EmptyState` when empty

### Pages
- `src/pages/PatientFormPage.jsx` — reads `:id` param; owns `values`/`errors` local state; `validate(values)` pure fn (required fields + CPF format + CPF uniqueness); calls `addPatient` or `updatePatient` on valid submit; navigates to `/patients`
- `src/pages/PatientsPage.jsx` — composes `SearchBar`, `PatientTable`, `Pagination`, delete via `ConfirmDialog`; "New Patient" navigates to `/patients/new`
- `src/pages/PatientDetailPage.jsx` — read-only display of all fields; Edit + Delete actions

### Validation rules
- Required: name, birthdate, CPF, gender, marital status, phone, street, number, neighborhood, city, state, zip
- CPF: `isValidCPF` + `isCpfTaken`
- Email: regex when non-empty
- ZIP: 8 digits numeric

---

## Phase 6 — Financial Module

### Components
- `src/components/financial/FinancialSubTabs.jsx` — tab switcher for payable / receivable
- `src/components/financial/AccountSummary.jsx` — two stat cards: total pending + total paid; purely presentational
- `src/components/financial/AccountList.jsx` — table with description, value, due date, status `Badge`, linked patient; triggers `AccountFormModal`
- `src/components/financial/AccountFormModal.jsx` — modal with local form state; fields: description (required), value (required, > 0), due date (required), status select, category select (optional), patient select (optional, populated from `usePatients`); non-blocking warning when creating with past due date

### Page
- `src/pages/FinancialPage.jsx` — owns `activeTab` state; renders `FinancialSubTabs` + `AccountSummary` + `AccountList` for the active tab; calls `useAccounts(activeTab)`

---

## Phase 7 — Tests

File locations and cases:

**`tests/patients/PatientForm.test.jsx`**
- All 17 field labels/inputs render
- Empty submit shows required error messages
- Invalid CPF string shows CPF error

**`tests/patients/PatientList.test.jsx`**
- Pre-seed localStorage with one patient → name appears in table
- Delete patient → row removed from DOM
- Fill form + submit → new name appears in list

**`tests/financial/FinancialPage.test.jsx`**
- Both sub-tab labels render
- Add payable account (status=pending) → pending total increases
- Add receivable account (status=pending) → pending total increases on receivable tab
- Change account status pending → paid → pending total decreases, paid total increases

Test setup: wrap pages in `MemoryRouter`; mock `window.localStorage` with in-memory implementation in `beforeEach`; clear in `afterEach`.

---

## Phase 8 — Polish & Edge Cases

- Overdue auto-detection in `useAccounts` (derived, not persisted)
- `EmptyState` in patient list and both account lists
- `deletePatient` nullifies `patientId` on linked accounts
- Responsive audit: sidebar collapse on tablet
- Color consistency: all interactive elements use `primary`/`accent` palette

---

## Verification

1. `npm run dev` — app opens, navigation works, both modules render
2. Patient CRUD: create → list → view → edit → delete, CPF duplicate blocked
3. Financial: both sub-tabs, CRUD, summary updates, overdue detection
4. `npx vitest run` — all tests pass
