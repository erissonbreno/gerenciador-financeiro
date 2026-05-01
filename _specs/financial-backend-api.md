# Spec for Financial Backend API

branch: feature/financial-backend-api

## Summary
- Especificação dos endpoints REST necessários no projeto de backend para suportar o módulo financeiro do frontend (pagamentos de pacientes).
- O frontend já está implementado com MSW mocks e consome estes endpoints via `GET/POST/PUT/PATCH/DELETE` em `/api/v1/payments`.
- O backend precisa implementar 6 endpoints que gerenciam pagamentos vinculados a pacientes, com dois fluxos: Particular (espécie, débito, crédito à vista/parcelado) e Convênio (com controle de recebimento e glosa).

## Functional Requirements

### Base URL
- Todos os endpoints sob `/api/v1/payments`

### Entidade Payment (schema do banco)
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| id | UUID | sim (auto) | Identificador único |
| patientId | UUID (FK) | sim | Referência ao paciente |
| description | string | sim | Descrição do pagamento |
| value | decimal | sim | Valor do pagamento (> 0) |
| serviceDate | date (ISO) | sim | Data do atendimento |
| paymentType | enum | sim | `particular` ou `convenio` |
| status | enum | sim | `pendente` ou `pago` |
| category | string | não | Categoria (Consulta, Exame, Procedimento, etc.) |
| paymentMethod | enum | não | `especie`, `debito`, `credito` — somente quando `paymentType = particular` |
| creditMode | enum | não | `avista`, `parcelado` — somente quando `paymentMethod = credito` |
| installments | int | não | Número de parcelas (1-6) — somente quando `creditMode = parcelado` |
| installmentNumber | int | não | Qual parcela é esta (1-N) — preenchido automaticamente |
| parentPaymentId | UUID (FK self) | não | Vincula parcelas ao pagamento original |
| convenioType | string | não | Tipo do convênio — somente quando `paymentType = convenio` |
| receivedDate | date (ISO) | não | Data em que o convênio foi recebido |
| receivedValue | decimal | não | Valor efetivamente recebido (pode diferir por glosa) |
| createdAt | timestamp | sim (auto) | Data de criação |

### Endpoint 1 — Listar pagamentos
- **GET** `/api/v1/payments`
- **Query params** (todos opcionais, servem como filtro):
  - `paymentType`: `particular` | `convenio`
  - `status`: `pendente` | `pago`
  - `convenioType`: string (ex: `Unimed`)
  - `patientId`: UUID
  - `startDate`: date ISO (filtra `serviceDate >=`)
  - `endDate`: date ISO (filtra `serviceDate <=`)
- **Response 200**: array de Payment com campo derivado adicional:
  - `daysPending` (int | null): número de dias desde `serviceDate` até hoje, calculado apenas quando `status = pendente`; `null` quando `status = pago`
- **Ordenação padrão**: `serviceDate` descendente

### Endpoint 2 — Resumo de pagamentos
- **GET** `/api/v1/payments/summary`
- **Query params**: mesmos filtros do endpoint de listagem
- **Response 200**:
  - `totalPending` (decimal): soma dos `value` onde `status = pendente`
  - `totalPaid` (decimal): soma dos `value` onde `status = pago`
  - `totalReceived` (decimal): soma dos `receivedValue` onde `status = pago` (se `receivedValue` for null, usar `value`)

### Endpoint 3 — Criar pagamento
- **POST** `/api/v1/payments`
- **Request body**:
  - `patientId` (obrigatório)
  - `description` (obrigatório)
  - `value` (obrigatório, > 0)
  - `serviceDate` (obrigatório)
  - `paymentType` (obrigatório)
  - `status` (obrigatório para particular; ignorado para convênio)
  - `category` (opcional)
  - `paymentMethod` (obrigatório se particular)
  - `creditMode` (obrigatório se `paymentMethod = credito`)
  - `installments` (obrigatório se `creditMode = parcelado`, entre 1 e 6)
  - `convenioType` (obrigatório se convênio)
- **Regras de negócio**:
  - Se `paymentType = convenio`: forçar `status = pendente` independente do que for enviado
  - Se `paymentType = particular` + `paymentMethod = credito` + `creditMode = parcelado` + `installments > 1`:
    - Criar N registros (um por parcela)
    - Cada parcela tem `value = valorOriginal / installments` (arredondamento para 2 casas)
    - Cada parcela tem `installmentNumber` (1 a N)
    - A primeira parcela é o registro "pai" (`parentPaymentId = null`)
    - As demais parcelas referenciam a primeira via `parentPaymentId`
    - A `description` de cada parcela deve ser sufixada com ` (N/total)` (ex: `Consulta (2/3)`)
- **Response 201**: array de Payment criados (1 item para pagamento simples, N itens para parcelado)

### Endpoint 4 — Atualizar pagamento
- **PUT** `/api/v1/payments/:id`
- **Request body**: campos parciais (qualquer campo do Payment exceto id, createdAt)
- **Response 200**: Payment atualizado
- **Response 404**: se o id não existir

### Endpoint 5 — Registrar recebimento de convênio
- **PATCH** `/api/v1/payments/:id/receive`
- **Request body**:
  - `receivedDate` (obrigatório, date ISO)
  - `receivedValue` (obrigatório, decimal > 0)
- **Regras de negócio**:
  - Altera `status` para `pago`
  - Registra `receivedDate` e `receivedValue`
  - Deve validar que o pagamento é do tipo `convenio` e está com `status = pendente`
- **Response 200**: Payment atualizado
- **Response 404**: se o id não existir
- **Response 422**: se o pagamento não for convênio pendente

### Endpoint 6 — Excluir pagamento
- **DELETE** `/api/v1/payments/:id`
- **Regras de negócio**:
  - Se o pagamento for pai de parcelas (`parentPaymentId` aponta para ele), excluir todas as parcelas filhas também
- **Response 204**: sem corpo
- **Response 404**: se o id não existir

## Possible Edge Cases
- Criação de pagamento parcelado com `installments = 1`: tratar como pagamento simples (não gerar parcelas extras)
- Divisão de valor parcelado com centavos que não dividem exatamente (ex: R$ 100 / 3 = 33.33 + 33.33 + 33.34): definir estratégia de arredondamento (sugestão: última parcela absorve a diferença)
- Tentativa de registrar recebimento em pagamento que já foi pago: retornar 422
- Tentativa de registrar recebimento em pagamento do tipo `particular`: retornar 422
- Exclusão de uma parcela individual (não a pai): excluir apenas aquela parcela, sem afetar as demais
- Query params com datas inválidas: retornar 400
- `patientId` inexistente no banco: retornar 422 com mensagem descritiva
- Valores negativos ou zero: retornar 422

## Acceptance Criteria
- Todos os 6 endpoints implementados e acessíveis sob `/api/v1/payments`
- Pagamentos de convênio sempre criados com `status = pendente`
- Parcelamento gera N registros corretamente vinculados
- Campo `daysPending` calculado corretamente na listagem
- Resumo (`summary`) reflete corretamente os totais filtrados
- Recebimento de convênio atualiza status, data e valor recebido
- Exclusão de pagamento pai remove parcelas filhas em cascata
- Filtros de listagem e resumo funcionam individualmente e combinados
- Frontend existente (sem alterações) funciona ao apontar para o backend real removendo o MSW

## Open Questions
- Paginação: o frontend atualmente faz paginação client-side. Há necessidade de paginação server-side nos endpoints de listagem?
- Autenticação: os endpoints devem ser protegidos? Qual mecanismo (JWT, session)?
- Soft delete: pagamentos excluídos devem ser marcados como inativos ou removidos fisicamente do banco?
- Auditoria: necessário registrar histórico de alterações (quem alterou, quando)?
- Validação de `convenioType`: aceitar apenas valores de uma lista fixa ou permitir valores livres?
- A estratégia de arredondamento para parcelas deve ser "última parcela absorve diferença" ou outra?

## Testing Guidelines
Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:
- Criação de pagamento particular simples (espécie, débito, crédito à vista) retorna 201 com dados corretos
- Criação de pagamento parcelado gera o número correto de registros com valores e vínculos corretos
- Criação de pagamento convênio força status pendente
- Listagem com filtros retorna apenas os pagamentos que atendem aos critérios
- Resumo calcula totalPending, totalPaid e totalReceived corretamente
- Recebimento de convênio atualiza status e registra valor recebido
- Recebimento em pagamento não-convênio ou já pago retorna 422
- Exclusão de pagamento pai remove parcelas filhas
- Validação rejeita campos obrigatórios ausentes ou valores inválidos
