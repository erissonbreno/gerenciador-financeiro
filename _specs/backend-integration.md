# Spec for Backend Integration

branch: feature/backend-integration

## Summary
- Remover o MSW (Mock Service Worker) e a persistência em localStorage, substituindo por chamadas reais ao backend FonoIO (Fastify + Prisma + PostgreSQL)
- Ajustar o cliente HTTP (Axios) para apontar para a URL real do backend (ex: `http://localhost:3000/api/v1`)
- Alinhar os modelos do frontend com os contratos de resposta da API real
- Garantir que todas as operações de CRUD de pacientes funcionem de ponta a ponta com o banco de dados
- Lidar com o fato de que o backend ainda não possui endpoints de contas (accounts) — manter mocks apenas para contas ou criar uma camada de fallback

## Functional Requirements
- Configurar variável de ambiente (`VITE_API_BASE_URL`) para a URL base da API, removendo o hardcoded `/api`
- Atualizar `src/services/api.ts` para usar a variável de ambiente como base URL do Axios
- Atualizar `src/services/patientService.ts` para consumir os endpoints reais:
  - `GET /api/v1/patients` (com suporte a `page`, `limit` e `search`)
  - `GET /api/v1/patients/:id`
  - `POST /api/v1/patients`
  - `PUT /api/v1/patients/:id`
  - `DELETE /api/v1/patients/:id`
- Adaptar o mapeamento de dados entre o modelo do frontend e o contrato da API:
  - Frontend usa `name` → Backend espera/retorna `fullName`
  - Frontend usa `contact.phone` e `contact.email` → Backend usa campos planos `phone` e `email`
  - Frontend usa `address.neighborhood` → Backend usa `address.district`
  - Frontend usa `address.zip` → Backend usa `address.zipCode`
  - Backend retorna `age` calculado e paginação (`data`, `total`, `page`, `totalPages`)
- Atualizar o hook `usePatients` para lidar com a resposta paginada da API (`data`, `total`, `page`, `totalPages`) em vez de receber um array simples
- Implementar paginação server-side para pacientes, substituindo a paginação client-side atual
- Adaptar a validação de CPF único para usar o endpoint da API (ou a resposta 409 do POST/PUT)
- Remover arquivos de mock: `src/mocks/db.ts`, `src/mocks/handlers.ts`, `src/mocks/browser.ts`, `src/mocks/server.ts` e `public/mockServiceWorker.js`
- Remover a inicialização condicional do MSW em `src/main.tsx`
- Remover o utilitário `src/utils/storage.ts` se não for mais utilizado em nenhum outro lugar
- Manter os endpoints de contas (accounts) com MSW temporariamente, já que o backend ainda não possui esses endpoints — isolar os mocks de contas do restante
- Configurar CORS no backend se necessário para aceitar requisições do frontend em desenvolvimento

## Possible Edge Cases
- Backend indisponível: exibir mensagem de erro amigável ao usuário quando a API não responder
- Diferenças de formato de data: backend retorna ISO 8601 (`2024-01-15T00:00:00.000Z`), frontend pode esperar outro formato — garantir parsing correto
- CPF duplicado: backend retorna 409 — mapear para mensagem de erro clara no formulário
- Campos opcionais nulos: backend pode retornar `null` para campos como `rg`, `email`, `address` — frontend deve tratar graciosamente
- Paginação: ao deletar o último item de uma página, garantir navegação para a página anterior
- Campos que existem no frontend mas não no backend: `maritalStatus`, `healthPlan` — decidir se serão removidos do frontend ou adicionados ao backend
- Latência de rede: garantir que loading states estejam corretos durante chamadas reais (mais lentas que mocks)
- Validação de dados na criação: erros de validação do Zod no backend (400) devem ser exibidos de forma compreensível no frontend

## Acceptance Criteria
- Todas as operações CRUD de pacientes (listar, visualizar, criar, editar, deletar) funcionam com dados reais vindos do PostgreSQL via API
- Nenhum mock de pacientes resta no código (MSW removido para patients)
- A listagem de pacientes usa paginação server-side com suporte a busca
- Erros de rede e de validação da API são exibidos corretamente ao usuário
- Os dados persistem entre sessões (vêm do banco, não do localStorage)
- A variável de ambiente `VITE_API_BASE_URL` controla a URL da API
- Os mocks de contas (accounts) continuam funcionando isoladamente até o backend suportar esses endpoints
- Não há regressões visuais ou funcionais nas telas existentes

## Open Questions
- Os campos `maritalStatus` e `healthPlan` que existem no frontend devem ser removidos ou o backend deve ser estendido para suportá-los? O back end deve suporta-los
- Deve-se implementar busca server-side na listagem de pacientes agora ou manter a busca client-side como intermediário? Implementar server side
- Qual a estratégia para migrar os endpoints de contas (accounts) para o backend no futuro — será uma spec separada? Sim
- Deve-se adicionar tratamento de autenticação/autorização nesta fase ou isso será uma feature separada? Feature separada

## Testing Guidelines
Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:
- Testar que o `patientService` faz as chamadas HTTP corretas para cada operação CRUD (usando MSW no ambiente de teste para simular a API real com os contratos corretos)
- Testar o mapeamento de dados entre o formato do frontend e o formato da API (transformações de campos)
- Testar que o hook `usePatients` lida corretamente com respostas paginadas
- Testar tratamento de erros: resposta 409 (CPF duplicado), 400 (validação), 500 (erro interno)
- Testar que os componentes de listagem e formulário de pacientes renderizam corretamente com dados no formato da API real
