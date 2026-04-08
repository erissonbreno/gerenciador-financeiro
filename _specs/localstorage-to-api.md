# Spec for Substituir localStorage por Chamadas à API

branch: feature/localstorage-to-api

## Summary
- Substituir o uso direto de `localStorage` nos hooks (`usePatients`, `useAccounts`, `useLocalStorage`) por chamadas HTTP a uma API REST
- Como a API real ainda não existe, utilizar **Mock Service Worker (MSW)** para interceptar as requisições no nível de rede e retornar respostas simuladas usando dados em memória
- Quando a API estiver pronta, basta remover o MSW e apontar para a URL real — sem alterar nenhum componente ou hook de negócio

## Functional Requirements
- Criar uma camada de serviço (`src/services/`) com funções assíncronas que fazem `fetch` para cada operação CRUD de Pacientes e Contas
- Refatorar `usePatients` e `useAccounts` para consumir os serviços em vez de ler/escrever diretamente no `localStorage`
- Instalar e configurar o MSW para interceptar todas as rotas da API em ambiente de desenvolvimento
- Os handlers do MSW devem manter os dados em memória (simulando um banco de dados) e responder com JSON seguindo o contrato esperado
- Manter o comportamento de cascade delete: ao deletar um paciente, as contas vinculadas devem ter o `patientId` limpo
- Todas as operações devem ser assíncronas (retornando `Promise`) para refletir o comportamento real de uma API
- Tratar estados de loading e erro nos hooks para feedback adequado na UI

## Possible Edge Cases
- Requisição falha (simular erros 400/404/500 no MSW para validar tratamento de erros)
- Dados em memória do MSW são perdidos ao recarregar a página — decidir se persiste no `localStorage` como fallback do mock ou se aceita perda de dados no dev
- Condições de corrida: duas operações simultâneas no mesmo recurso
- CPF duplicado retornando erro 409 da API (mover validação de `isCpfTaken` para o servidor/mock)
- Operações de cascade delete devem ser atômicas no mock

## Acceptance Criteria
- Nenhum componente ou página importa ou acessa `localStorage` diretamente
- Os hooks de negócio (`usePatients`, `useAccounts`) chamam funções de `src/services/` que fazem `fetch`
- Em modo de desenvolvimento, o MSW intercepta todas as chamadas e retorna dados mockados
- Todas as funcionalidades existentes continuam funcionando: CRUD de pacientes, CRUD de contas, validação de CPF, cascade delete
- Para migrar para a API real, basta: (1) remover o setup do MSW, (2) atualizar a `baseURL` nos serviços
- Os testes existentes continuam passando (adaptados para o novo fluxo assíncrono)

## Open Questions
- Usar `fetch` nativo ou instalar `axios`? Use o axios
- Adotar `TanStack Query` (React Query) para gerenciar cache, loading e error states, ou manter gerenciamento manual com `useState`/`useEffect`? Use o TanStack Query
- Persistir os dados do MSW no `localStorage` para não perder estado entre reloads durante desenvolvimento? Sim
- Qual será o contrato/formato da API real (paginação, filtros, formato de erro)? Ainda nao existe

## Testing Guidelines
Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:
- Serviço de pacientes: `fetchPatients` retorna lista, `createPatient` retorna paciente criado, `deletePatient` remove e limpa contas vinculadas
- Serviço de contas: `fetchAccounts` retorna lista filtrada por tipo, `createAccount` retorna conta criada
- Tratamento de erro: serviço retorna erro quando API responde com status >= 400
- Integração hook + MSW: `usePatients` carrega dados ao montar e atualiza após mutação
