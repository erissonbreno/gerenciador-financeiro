# Plano: Integração com Backend Real (Patients)

## Contexto

O frontend usa MSW (Mock Service Worker) + localStorage para simular a API. O backend real (Fastify + Prisma + PostgreSQL) já existe com endpoints de pacientes em `/api/v1/patients`. Esta migração substitui os mocks de pacientes por chamadas reais, mantendo MSW apenas para contas (accounts), que o backend ainda não suporta.

Diferenças chave entre frontend e backend:
- `name` ↔ `fullName`, `neighborhood` ↔ `address.district`, `zip` ↔ `address.zipCode`
- Backend usa endereço aninhado (`address: { street, number, ... }`)
- Backend retorna paginação (`{ data, total, page, totalPages }`)
- Backend retorna 409 para CPF duplicado

---

## Fase 1: Fundação (tipos + API client)

### 1.1 Criar `.env.example` e `.env`
- Conteúdo: `VITE_API_BASE_URL=http://localhost:3000`

### 1.2 Atualizar `src/services/api.ts`
- Manter `api` existente (`baseURL: '/api'`) para accounts (MSW)
- Adicionar `apiV1` com `baseURL: ${VITE_API_BASE_URL}/api/v1` para patients (backend real)

### 1.3 Adicionar tipos em `src/types/models.ts`
- `BackendPatient` — modelo da API (fullName, address aninhado, age, etc.)
- `PaginatedResponse<T>` — `{ data: T[], total, page, totalPages }`
- `PatientQueryParams` — `{ page?, limit?, search? }`

---

## Fase 2: Camada de mapeamento

### 2.1 Criar `src/services/patientMapper.ts`
- `fromBackend(bp: BackendPatient): Patient` — converte resposta da API para modelo frontend
- `toBackend(fv: PatientFormValues): object` — converte form values para payload da API

Mapeamentos:
| Frontend | Backend |
|----------|---------|
| `name` | `fullName` |
| `street`, `number`, `complement`, `neighborhood`, `city`, `state`, `zip` | `address.{ street, number, complement, district, city, state, zipCode }` |

---

## Fase 3: Reescrever Patient Service

### 3.1 Atualizar `src/services/patientService.ts`
- Usar `apiV1` em vez de `api`
- `getPatients(params)` → `GET /patients?page=&limit=&search=` → retorna `PaginatedResponse<Patient>` (mapeia cada item com `fromBackend`)
- `getPatientById(id)` → `GET /patients/:id` → mapeia com `fromBackend`
- `createPatient(data)` → `POST /patients` com `toBackend(data)` → mapeia resposta
- `updatePatient(id, data)` → `PUT /patients/:id` com `toBackend(data)` → mapeia resposta
- `deletePatient(id)` → `DELETE /patients/:id`
- Remover `checkCpf` — validação de CPF duplicado via tratamento do erro 409

---

## Fase 4: Hook + Páginas + Erro handling

### 4.1 Criar `src/hooks/useDebounce.ts`
- Hook simples: recebe valor e delay, retorna valor debounced

### 4.2 Reescrever `src/hooks/usePatients.ts`
- Aceitar `params: PatientQueryParams` como argumento
- Query key: `['patients', params]` (react-query refaz fetch quando params mudam)
- Usar `keepPreviousData` para transição suave entre páginas
- Retornar: `patients, total, page, totalPages, isLoading, error, addPatient, updatePatient, deletePatient`
- Remover `getPatientById` (lookup local) e `isCpfTaken` do hook

### 4.3 Atualizar `src/pages/PatientsPage.tsx`
- Remover `useMemo` de filtragem client-side
- Remover `usePagination` (manter hook — usado por FinancialPage)
- Adicionar state `page` e `debouncedSearch` (via `useDebounce`)
- Passar `{ page, limit: 10, search: debouncedSearch }` para `usePatients`
- Reset page para 1 quando search muda
- `onEdit`: buscar paciente de `patients.find(p => p.id === id)` (está na página atual)
- Wiring do `Pagination` com `page`/`totalPages` do server
- Tratar erro 409 no `handleSave` com try/catch (setar erro no form)

### 4.4 Atualizar `src/components/patients/PatientFormModal.tsx`
- Remover prop `isCpfTaken` de `PatientFormModalProps` e `PatientFormModalFormProps`
- Remover chamada de `isCpfTaken` da função `validate`
- No `handleSubmit`, capturar erro 409 do `onSave` e setar `errors.cpf = 'CPF já cadastrado'`

### 4.5 Criar `src/utils/apiErrors.ts`
- `isDuplicateCpf(error)` — verifica se AxiosError com status 409
- `getErrorMessage(error)` — extrai mensagem de erro da resposta

---

## Fase 5: Split dos MSW Handlers

### 5.1 Criar `src/mocks/handlers/accountHandlers.ts`
- Mover os handlers de accounts do `handlers.ts` atual (linhas 48-82)

### 5.2 Criar `src/mocks/handlers/patientHandlers.ts`
- Novos handlers para testes que mockam a API v1 (`/api/v1/patients`)
- Retornam `BackendPatient` shape com resposta paginada
- Handlers: GET (paginado), GET /:id, POST (201, 409 para CPF duplicado), PUT, DELETE

### 5.3 Criar `src/mocks/patientTestDb.ts`
- DB in-memory para testes, armazenando dados em formato `BackendPatient`
- Funções: `findAll(params)` com paginação, `findById`, `create`, `update`, `delete`, `reset`
- Suporte a busca por `fullName` e `cpf`

### 5.4 Atualizar `src/mocks/handlers.ts`
- Re-exportar: `export { accountHandlers } from './handlers/accountHandlers'`
- Re-exportar: `export { patientHandlers } from './handlers/patientHandlers'`

### 5.5 Atualizar `src/mocks/browser.ts`
- Usar apenas `accountHandlers` (MSW no browser só para accounts)

### 5.6 Atualizar `src/mocks/server.ts`
- Usar `accountHandlers` + `patientHandlers` (testes mockam tudo)

### 5.7 Atualizar `src/mocks/db.ts`
- Remover todo o código de patients (namespace `db.patients`, variável `patients`)
- Manter `db.accounts` e `db.reset()` (apenas accounts)
- Manter `readStorage`/`writeStorage` para accounts

### 5.8 Atualizar `src/setupTests.ts`
- Importar `patientTestDb` e chamar `.reset()` no `afterEach` junto com `db.reset()`

---

## Fase 6: Testes

### 6.1 Atualizar `tests/patients/PatientList.test.tsx`
- Seed dados via `patientTestDb.create(...)` em formato `BackendPatient`
- Verificar que a listagem renderiza com paginação server-side
- Testar busca server-side

### 6.2 Atualizar `tests/patients/PatientForm.test.tsx`
- Remover prop `isCpfTaken` dos renders
- Testar tratamento de erro 409 no submit

### 6.3 Criar `tests/patients/patientMapper.test.ts`
- Testar `fromBackend` e `toBackend` com campos nulos/opcionais
- Testar mapeamento de todos os campos renomeados

### 6.4 Criar `tests/patients/patientService.test.ts`
- Testar que cada operação CRUD faz a chamada HTTP correta
- Testar mapeamento de dados na ida e volta
- Testar tratamento de paginação

---

## Arquivos

### Criar
| Arquivo | Propósito |
|---------|-----------|
| `.env.example` | Documentar VITE_API_BASE_URL |
| `src/services/patientMapper.ts` | Mapeamento frontend ↔ backend |
| `src/hooks/useDebounce.ts` | Debounce para busca |
| `src/utils/apiErrors.ts` | Helpers de erro da API |
| `src/mocks/handlers/accountHandlers.ts` | Handlers MSW de accounts (extraídos) |
| `src/mocks/handlers/patientHandlers.ts` | Handlers MSW de patients v1 (testes) |
| `src/mocks/patientTestDb.ts` | DB de testes para patients (formato backend) |
| `tests/patients/patientMapper.test.ts` | Testes do mapper |
| `tests/patients/patientService.test.ts` | Testes do service |

### Modificar
| Arquivo | Mudança |
|---------|---------|
| `src/services/api.ts` | Adicionar `apiV1` |
| `src/types/models.ts` | Adicionar `BackendPatient`, `PaginatedResponse`, `PatientQueryParams` |
| `src/services/patientService.ts` | Reescrever para API v1 real |
| `src/hooks/usePatients.ts` | Paginação server-side, remover isCpfTaken/getPatientById |
| `src/pages/PatientsPage.tsx` | Server-side search + pagination, tratar 409 |
| `src/components/patients/PatientFormModal.tsx` | Remover isCpfTaken, tratar 409 |
| `src/mocks/browser.ts` | Apenas account handlers |
| `src/mocks/server.ts` | Account + patient v1 handlers |
| `src/mocks/handlers.ts` | Re-export dos handlers split |
| `src/mocks/db.ts` | Remover código de patients |
| `src/setupTests.ts` | Reset patientTestDb |
| `tests/patients/PatientList.test.tsx` | Adaptar para API v1 |
| `tests/patients/PatientForm.test.tsx` | Remover isCpfTaken |

---

## Verificação

1. `npx vitest run` — todos os testes passam
2. Subir backend local (`http://localhost:3000`) + frontend (`npm run dev`)
3. Testar CRUD completo de pacientes (criar, listar, editar, deletar)
4. Testar busca por nome/CPF na listagem
5. Testar paginação (criar >10 pacientes, navegar páginas)
6. Testar CPF duplicado (deve mostrar erro no form)
7. Testar com backend offline (deve mostrar mensagem de erro)
8. Verificar que contas (accounts) continuam funcionando normalmente com MSW
