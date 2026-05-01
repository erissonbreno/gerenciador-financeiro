# Spec for Patient Payment Management

branch: feature/patient-payment-management

## Summary
- Refatorar o modulo de accounts para criar um sistema de gestao de pagamentos vinculados a pacientes
- Permitir cadastro de pagamentos do tipo "particular" ou "convenio", com fluxos distintos para cada tipo
- Para pagamentos particulares: selecao de forma de pagamento (especie, debito, credito) com opcao de parcelamento no credito
- Para pagamentos por convenio: selecao do tipo de convenio e gestao de status de recebimento (pendente/pago)
- Painel de controle de pagamentos de convenio por paciente, com visibilidade de valores pendentes e pagos, para auxiliar no acompanhamento de pagamentos que podem demorar ate 90 dias

## Functional Requirements
- O formulario de pagamento deve estar vinculado a um paciente (selecao obrigatoria)
- O usuario deve selecionar o tipo de pagamento: "Particular" ou "Convenio"
- **Fluxo Particular:**
  - Exibir dropdown de forma de pagamento: Especie, Debito, Credito
  - Se "Credito" for selecionado, exibir dropdown adicional: "A vista" ou "Parcelado"
  - Se "Parcelado" for selecionado, exibir campo para informar o numero de parcelas
- **Fluxo Convenio:**
  - Exibir dropdown para selecionar o tipo/nome do convenio (ex: Unimed, Bradesco Saude, SulAmerica, etc.)
  - O pagamento deve ser registrado com status inicial "Pendente"
  - Permitir que o usuario altere o status para "Pago" quando o convenio efetuar o pagamento, registrando a data de recebimento
- **Campos comuns a ambos os tipos:**
  - Descricao (texto livre)
  - Valor (numerico, em reais)
  - Data (data do atendimento/servico)
- **Painel de gestao de convenios:**
  - Listagem de todos os pagamentos de convenio agrupados por paciente
  - Filtros por status (Pendente / Pago), por convenio, e por periodo
  - Exibicao clara de quanto tempo cada pagamento esta pendente (dias desde o registro)
  - Totalizadores: valor total pendente, valor total recebido
  - Destaque visual para pagamentos pendentes ha mais de 30, 60 e 90 dias

## Possible Edge Cases
- Paciente sem pagamentos cadastrados (estado vazio)
- Troca do tipo de pagamento (Particular <-> Convenio) no formulario apos ja ter preenchido campos especificos — deve limpar os campos condicionais
- Valor zero ou negativo no campo de valor
- Numero de parcelas invalido (zero, negativo, ou muito alto)
- Edicao de um pagamento ja marcado como "Pago" — definir se permite reverter para "Pendente"
- Pagamentos de convenio muito antigos que nunca foram marcados como pagos (glosas)
- Multiplos pagamentos do mesmo paciente no mesmo dia

## Acceptance Criteria
- O usuario consegue cadastrar um pagamento vinculado a um paciente, selecionando "Particular" ou "Convenio"
- Ao selecionar "Particular", os dropdowns de forma de pagamento (especie/debito/credito) e parcelamento (quando credito) funcionam corretamente
- Ao selecionar "Convenio", o dropdown de tipo de convenio e exibido e funcional
- Campos de descricao, valor e data sao exibidos e obrigatorios para ambos os tipos
- Pagamentos de convenio sao criados com status "Pendente" e podem ser atualizados para "Pago"
- O painel de gestao de convenios exibe corretamente os pagamentos filtrados por status, convenio e periodo
- Os totalizadores de valores pendentes e recebidos estao corretos
- Pagamentos pendentes ha mais de 30/60/90 dias possuem destaque visual
- O modulo existente de accounts (payable/receivable) continua funcionando ou e migrado de forma compativel

## Open Questions
- Deve-se manter o modulo atual de contas a pagar/receber (payable/receivable) separado ou integra-lo ao novo fluxo de pagamentos? Integre ao novo fluxo
- A lista de convenios deve ser fixa (hardcoded) ou cadastravel pelo usuario? Pode ser uma lista hard coded
- Existe um limite maximo de parcelas para pagamento em credito? 6x
- Ao marcar um pagamento de convenio como "Pago", deve-se registrar o valor efetivamente recebido (que pode ser diferente do valor cobrado, em caso de glosa)? Sim
- Os pagamentos devem ter vinculo com sessoes/atendimentos especificos do paciente? Sim

## Testing Guidelines
Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:
- Renderizacao condicional dos campos do formulario ao alternar entre "Particular" e "Convenio"
- Exibicao do dropdown de parcelamento apenas quando "Credito" e selecionado
- Submissao do formulario com dados validos para ambos os tipos de pagamento
- Validacao de campos obrigatorios (descricao, valor, data, paciente)
- Filtragem de pagamentos por status no painel de gestao de convenios
- Calculo correto dos totalizadores (pendente/pago)
- Destaque visual de pagamentos pendentes baseado no tempo decorrido (30/60/90 dias)
