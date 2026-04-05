# Spec for typescript-migration

branch: claude/feature/typescript-migration

## Summary
- Migrar todo o projeto de JavaScript/JSX para TypeScript/TSX.
- Adicionar tipagem estrita a todos os componentes, hooks, utilitários, constantes e páginas.
- Garantir que o build, os testes e o linting continuem funcionando após a migração.

## Functional Requirements

### Configuração
- Adicionar `tsconfig.json` com configuração estrita (`strict: true`).
- Atualizar `vite.config` para extensão `.ts`.
- Atualizar `setupTests` para extensão `.ts`.
- Instalar dependências de tipos necessárias (`@types/react`, `@types/react-dom`, etc.).

### Utilitários (`src/utils/`)
- Renomear todos os arquivos `.js` para `.ts`: `storage.ts`, `cpf.ts`, `date.ts`, `currency.ts`.
- Tipar todos os parâmetros e retornos de funções.

### Constantes (`src/constants/`)
- Renomear todos os arquivos `.js` para `.ts`: `brazilStates.ts`, `accountCategories.ts`, `statusOptions.ts`.
- Usar `as const` ou tipos explícitos onde aplicável.

### Hooks (`src/hooks/`)
- Renomear todos os arquivos `.js` para `.ts`: `useLocalStorage.ts`, `usePatients.ts`, `useAccounts.ts`, `usePagination.ts`.
- Definir interfaces/types para as entidades `Patient` e `Account`.
- Tipar os retornos dos hooks e seus parâmetros.

### Componentes (`src/components/`)
- Renomear todos os arquivos `.jsx` para `.tsx` (38 arquivos de componentes).
- Definir interfaces de `Props` para cada componente.
- Tipar eventos (`onChange`, `onClick`, `onSubmit`, etc.).

### Páginas (`src/pages/`)
- Renomear todos os arquivos `.jsx` para `.tsx` (5 páginas).
- Tipar state local e parâmetros de rota.

### Rotas e Layout
- Renomear `src/routes/index.jsx` para `.tsx`.
- Renomear `src/layouts/MainLayout.jsx` para `.tsx`.
- Renomear `src/App.jsx` para `.tsx` e `src/main.jsx` para `.tsx`.

### Testes (`tests/`)
- Renomear todos os arquivos `.test.jsx` para `.test.tsx` (3 arquivos de teste).
- Garantir que os testes continuem passando sem alteração de lógica.

## Possible Edge Cases
- Conflitos de tipo com bibliotecas que não possuem tipagem própria.
- Inferência de tipos genéricos no `useLocalStorage` pode precisar de ajustes para manter a flexibilidade.
- `crypto.randomUUID()` pode precisar de declaração de tipo ou lib adequada no `tsconfig`.
- Funções de validação que recebem valores dinâmicos de formulários podem precisar de type guards.
- Compatibilidade do Vitest com arquivos `.tsx` nos testes.

## Acceptance Criteria
- Nenhum arquivo `.js` ou `.jsx` deve permanecer em `src/` ou `tests/` (exceto `vite.config.ts` na raiz se aplicável).
- `npx tsc --noEmit` deve passar sem erros.
- `npx vite build` deve completar com sucesso.
- `npx vitest run` deve executar todos os 9 testes existentes sem falhas.
- Nenhuma lógica de negócio ou comportamento visual deve ser alterado — a migração é puramente de tipagem.

## Open Questions
- Deve-se criar um arquivo centralizado de types/interfaces (e.g. `src/types/`) ou manter os types co-localizados junto aos módulos? Co-localizados, com um arquivo `src/types/models.ts` apenas para as entidades compartilhadas (Patient, Account).

## Testing Guidelines
Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:
- Nenhum teste novo é necessário — os 9 testes existentes devem ser migrados de `.jsx` para `.tsx` e continuar passando.
- Verificar que `npx tsc --noEmit` passa sem erros como validação adicional de que a tipagem está correta.
