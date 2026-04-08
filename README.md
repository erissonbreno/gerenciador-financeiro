# Gerenciador Financeiro

Aplicação web para gestão de **pacientes** e **contas financeiras** (a pagar e a receber), com cadastro completo de dados pessoais e endereço, listagem com busca e paginação, e resumo financeiro por paciente.

## Stack

| Área | Tecnologia |
|------|------------|
| UI | React 19, TypeScript |
| Build | Vite 8 |
| Estilo | Tailwind CSS 4 (`@tailwindcss/vite`) |
| Dados remotos | TanStack Query (React Query), Axios (`/api`) |
| Roteamento | React Router 7 |
| Testes | Vitest, Testing Library, jsdom |
| Mock em desenvolvimento | MSW (Mock Service Worker) |

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão compatível com o projeto; recomendado LTS atual)

## Como rodar

```bash
npm install
npm run dev
```

O app sobe no endereço indicado no terminal (por padrão `http://localhost:5173`).

### Build e preview de produção

```bash
npm run build
npm run preview
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento com Vite |
| `npm run build` | Build de produção (`dist/`) |
| `npm run preview` | Servidor estático para testar o build |
| `npm run lint` | ESLint no projeto |

Testes com Vitest (não há script dedicado no `package.json`):

```bash
npx vitest
```

Interface opcional: `npx vitest --ui`.

## API e mocks

- O cliente HTTP usa `baseURL: '/api'` (veja `src/services/api.ts`).
- Em **modo desenvolvimento** (`import.meta.env.DEV`), o [MSW](https://mswjs.io/) é iniciado em `src/main.tsx` e intercepta as requisições; o worker fica em `public/`.

## Rotas principais

| Caminho | Conteúdo |
|---------|----------|
| `/` | Redireciona para `/patients` |
| `/patients` | Lista de pacientes |
| `/patients/:id` | Detalhe do paciente |
| `/financial` | Gestão financeira (contas) |

## Estrutura do código (resumo)

- `src/pages/` — páginas
- `src/components/` — componentes por domínio (`patients`, `financial`, `navigation`, `common`)
- `src/hooks/` — hooks (ex.: pacientes, contas, paginação)
- `src/services/` — chamadas à API
- `src/mocks/` — handlers e banco em memória para MSW
- `src/types/` — tipos TypeScript (`models.ts`)
- `tests/` — testes ao lado do domínio (ex.: `tests/patients/`)

## Repositório

Nome do pacote npm: `gerenciador-financeiro`. A pasta do repositório pode aparecer como `fono-app-mfe` no ambiente local.
