# Spec for Input Masks and Validation

branch: feature/input-masks-and-validation

## Summary

Adicionar máscaras de entrada e validações nos módulos de Pacientes e Finanças. No módulo de Pacientes, aplicar máscaras para CPF, Telefone e CEP, restringir campos numéricos (CPF, RG, Telefone, CEP) para aceitar apenas números, e tornar obrigatórios somente os campos Nome Completo, Data de Nascimento e CPF. No módulo de Finanças, garantir que a aba "Contas a Receber" esteja sempre focada por padrão e aplicar máscara de moeda no campo Valor.

Utilizar as bibliotecas **react-imask** (para máscaras de CPF, Telefone e CEP) e **react-number-format** (para máscara de moeda no campo Valor). Ambas são amplamente utilizadas, bem mantidas e compatíveis com React 19.

## Functional Requirements

### Módulo de Pacientes

- **Máscara de CPF**: Ao digitar números no campo CPF, os pontos e traço devem ser populados automaticamente no formato `###.###.###-##`
- **Limite de caracteres no CPF**: O campo deve aceitar no máximo 11 dígitos numéricos (14 caracteres com a máscara aplicada)
- **Campos somente numéricos**: Os campos CPF, RG, Telefone e CEP devem aceitar apenas dígitos numéricos como entrada
- **Campos obrigatórios**: Somente Nome Completo, Data de Nascimento e CPF devem ser obrigatórios; todos os demais campos devem ser opcionais
- **Máscara de Telefone**: Aplicar máscara `(##) ####-####` para 8 dígitos ou `(##) #####-####` para 9 dígitos, adicionando parênteses nos dois primeiros dígitos automaticamente
- **Limite de caracteres no Telefone**: O campo deve aceitar entre 10 e 11 dígitos numéricos (8 ou 9 dígitos do número + 2 dígitos do DDD)
- **Máscara de CEP**: Aplicar máscara no formato `#####-###`
- **Limite de caracteres no CEP**: O campo deve aceitar exatamente 8 dígitos numéricos

### Módulo de Finanças

- **Aba padrão**: A aba "Contas a Receber" deve estar sempre focada/selecionada por padrão, já que é a única aba existente
- **Máscara de Valor**: Aplicar máscara de moeda brasileira no campo Valor, no formato `R$ #.###,##` com separador de milhar (ponto) e separador decimal (vírgula)

### Bibliotecas Recomendadas

- **react-imask**: Para máscaras de CPF, Telefone e CEP (suporte a máscaras dinâmicas, como alternância entre 8/9 dígitos no telefone)
- **react-number-format**: Para máscara de moeda no campo Valor (suporte nativo a prefixo, separador de milhar e decimal)

## Possible Edge Cases

- Usuário cola um texto com letras nos campos numéricos — os caracteres não numéricos devem ser ignorados/removidos
- Usuário cola um CPF já formatado (com pontos e traço) — a máscara deve tratar corretamente e não duplicar a formatação
- Telefone com 8 dígitos transitando para 9 dígitos (ou vice-versa) — a máscara deve se ajustar dinamicamente
- Campo Valor com valores muito altos — a máscara deve continuar formatando corretamente
- Campo Valor com centavos — garantir que os centavos sejam tratados corretamente (ex: R$ 0,50)
- Dados já salvos sem máscara sendo carregados para edição — os valores devem ser exibidos com a máscara aplicada corretamente
- Campos que eram obrigatórios e agora são opcionais — garantir que a validação existente seja atualizada sem quebrar o fluxo de salvamento

## Acceptance Criteria

- [ ] Campo CPF exibe máscara `###.###.###-##` conforme o usuário digita
- [ ] Campo CPF não aceita mais que 11 dígitos numéricos
- [ ] Campos CPF, RG, Telefone e CEP rejeitam caracteres não numéricos
- [ ] Apenas Nome Completo, Data de Nascimento e CPF são obrigatórios no formulário de pacientes
- [ ] Campo Telefone exibe máscara `(##) ####-####` ou `(##) #####-####` dinamicamente
- [ ] Campo Telefone aceita entre 10 e 11 dígitos (DDD + número)
- [ ] Campo CEP exibe máscara `#####-###`
- [ ] Campo CEP aceita exatamente 8 dígitos numéricos
- [ ] Aba "Contas a Receber" está sempre selecionada por padrão no módulo financeiro
- [ ] Campo Valor no módulo financeiro exibe máscara de moeda `R$ #.###,##`
- [ ] Bibliotecas react-imask e react-number-format estão instaladas e configuradas
- [ ] Edição de registros existentes carrega valores com máscara aplicada corretamente

## Open Questions

- O campo RG precisa de uma máscara específica ou apenas a restrição numérica é suficiente? (O formato do RG varia por estado) Somente restricao numerica
- O campo Valor deve permitir valores negativos? Nao
- Deve haver validação de CPF válido (algoritmo de dígitos verificadores) além da máscara, ou a validação existente em `src/utils/cpf.ts` já é suficiente? A validacao existente e suficiente

## Testing Guidelines
Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:
- Máscara de CPF formata corretamente a entrada numérica
- Campo CPF rejeita caracteres não numéricos
- Máscara de Telefone alterna corretamente entre formatos de 8 e 9 dígitos
- Máscara de CEP formata corretamente
- Campo Valor formata corretamente valores monetários em Real
- Validação do formulário de pacientes requer apenas Nome Completo, Data de Nascimento e CPF
- Campos opcionais permitem submissão do formulário quando vazios
