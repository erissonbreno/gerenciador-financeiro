# Spec for financial-manager-patient-registration

branch: claude/feature/financial-manager-patient-registration

## Summary
- Aplicação web de gerenciamento financeiro construída com React, Vite e Tailwind CSS.
- Permite o cadastro e listagem de pacientes com dados pessoais completos.
- Possui uma aba financeira com controle de contas a pagar e contas a receber.

## Functional Requirements

### Geral
- A aplicação deve ter uma navegação lateral ou superior com pelo menos duas seções: **Pacientes** e **Financeiro**.
- Toda a interface deve ser responsiva e utilizar Tailwind CSS para estilização.
- O projeto deve ser inicializado com Vite e React.

### Módulo de Pacientes
- O usuário deve poder cadastrar um novo paciente com os seguintes dados pessoais:
  - Nome completo
  - Data de nascimento
  - CPF
  - RG
  - Gênero
  - Estado civil
  - Telefone
  - E-mail
  - Endereço completo (logradouro, número, complemento, bairro, cidade, estado, CEP)
  - Plano de Saude (Opcional)
- O usuário deve poder visualizar a lista de todos os pacientes cadastrados em formato de tabela ou cards.
- O usuário deve poder acessar os detalhes de um paciente específico.
- O usuário deve poder editar os dados de um paciente existente.
- O usuário deve poder remover um paciente da lista.

### Módulo Financeiro
- O módulo financeiro deve possuir duas sub-abas: **Contas a Pagar** e **Contas a Receber**.
- Para cada conta (a pagar ou a receber), o usuário deve poder registrar:
  - Descrição
  - Valor
  - Data de vencimento
  - Status (pendente, pago/recebido, vencido)
  - Categoria (opcional)
  - Paciente vinculado (opcional, selecionado a partir da lista de pacientes)
- O usuário deve poder listar, criar, editar e remover contas a pagar e contas a receber.
- A listagem deve exibir um resumo com o total pendente e o total pago/recebido.

## Possible Edge Cases
- Tentativa de cadastrar paciente com CPF já existente na base.
- Tentativa de salvar um formulário com campos obrigatórios em branco.
- CPF ou CEP com formato inválido.
- Valor monetário negativo ou zero ao cadastrar uma conta.
- Data de vencimento no passado ao criar uma nova conta.
- Exclusão de um paciente que possui contas financeiras vinculadas a ele.
- Lista de pacientes ou contas vazia (estado de lista vazia deve ser tratado com mensagem informativa).

## Acceptance Criteria
- O formulário de cadastro de paciente valida todos os campos obrigatórios antes de salvar.
- CPF deve ser validado quanto ao formato e unicidade.
- A listagem de pacientes exibe pelo menos nome, CPF e telefone de cada registro.
- O módulo financeiro apresenta claramente as duas sub-abas: Contas a Pagar e Contas a Receber.
- Cada conta exibe descrição, valor, vencimento e status na listagem.
- O resumo financeiro (total pendente vs. total pago) é exibido no topo de cada sub-aba.
- As operações de criar, editar e remover funcionam corretamente para pacientes e contas.
- A interface é responsiva e utilizável em telas de desktop e tablet.

## Open Questions
- Os dados devem ser persistidos em um backend/API ou apenas em estado local (localStorage)? No localStorage por enquanto
- Deve existir autenticação/login na aplicação? Nao
- Existe alguma identidade visual ou paleta de cores definida? Tons de azul claro / verde claro
- O campo de paciente vinculado em contas financeiras é obrigatório ou opcional? Opcional
- Deve haver paginação ou busca/filtro na listagem de pacientes e contas? Sim 

## Testing Guidelines
Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:
- Renderização do formulário de cadastro de paciente com todos os campos esperados.
- Validação de campos obrigatórios no formulário de paciente (submissão com campos vazios).
- Validação de formato de CPF inválido.
- Adição de um novo paciente e verificação na listagem.
- Remoção de um paciente da listagem.
- Renderização da aba financeira com as sub-abas Contas a Pagar e Contas a Receber.
- Adição de uma conta a pagar e verificação no resumo de total pendente.
- Adição de uma conta a receber e verificação no resumo de total pendente.
- Alteração de status de uma conta de "pendente" para "pago".
