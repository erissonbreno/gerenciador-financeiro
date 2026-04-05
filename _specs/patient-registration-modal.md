# Spec for Patient Registration Modal

branch: feature/patient-registration-modal

## Summary
- Migrar o cadastro de pacientes (atualmente em uma página separada `PatientFormPage`) para um modal, seguindo o mesmo padrão já utilizado no cadastro de contas (`AccountFormModal`).
- O modal deve suportar tanto criação quanto edição de pacientes.
- A página de listagem de pacientes (`PatientsPage`) deve abrir o modal diretamente, sem navegar para outra rota.

## Functional Requirements
- Criar um componente `PatientFormModal` seguindo a mesma estrutura do `AccountFormModal` (componente wrapper + componente de formulário interno).
- O modal deve conter todos os campos do formulário atual de pacientes: nome, CPF, RG, data de nascimento, gênero, estado civil, telefone, email, campos de endereço (CEP, rua, número, complemento, bairro, cidade, estado) e plano de saúde.
- O modal deve ter título dinâmico: "Novo Paciente" para criação e "Editar Paciente" para edição.
- A validação dos campos deve permanecer a mesma: campos obrigatórios, formato de CPF, unicidade de CPF, formato de email e formato de CEP.
- O botão "Novo Paciente" na listagem deve abrir o modal em modo criação.
- O botão de editar em cada paciente na listagem deve abrir o modal em modo edição, preenchendo os campos com os dados existentes.
- Após salvar (criar ou editar), o modal deve fechar e a lista deve ser atualizada.
- A rota `/patients/new` e `/patients/:id` para o formulário devem ser removidas, já que o modal substitui a navegação.
- O componente base `Modal` já existente deve ser reutilizado.

## Possible Edge Cases
- Validação de CPF duplicado deve continuar funcionando corretamente no contexto do modal, excluindo o próprio paciente em modo edição.
- Se o usuário fechar o modal sem salvar, nenhuma alteração deve ser persistida.
- O formulário deve resetar seu estado ao reabrir o modal (mesmo padrão do `AccountFormModal` com renderização condicional).
- Campos de endereço devem manter a busca automática por CEP (se existente) funcionando dentro do modal.

## Acceptance Criteria
- O cadastro e edição de pacientes funcionam inteiramente via modal, sem navegação para páginas separadas.
- Todas as validações existentes continuam funcionando.
- O padrão de abertura/fechamento do modal segue o mesmo padrão do `AccountFormModal` (state `formOpen` + `editTarget`).
- As rotas de formulário de paciente são removidas do roteamento da aplicação.
- A experiência do usuário é consistente entre o modal de contas e o modal de pacientes.

## Open Questions
- Há alguma funcionalidade de busca de CEP automática que precisa ser preservada no modal? Nao
- O formulário de paciente deve ser organizado em seções/abas dentro do modal devido à quantidade de campos, ou um scroll vertical é suficiente? Scroll vertical serve

## Testing Guidelines
Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:
- Abertura do modal em modo criação com campos vazios.
- Abertura do modal em modo edição com campos preenchidos.
- Validação de campos obrigatórios ao tentar salvar.
- Validação de CPF duplicado em criação e edição.
- Fechamento do modal sem salvar não altera os dados.
- Reset do formulário ao reabrir o modal.
