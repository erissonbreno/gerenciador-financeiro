# Plano: Máscaras de Input e Validação

## Context

O formulário de pacientes não possui máscaras nos campos CPF, Telefone e CEP — apenas placeholders. Além disso, 12 campos são obrigatórios quando apenas 3 deveriam ser (Nome, Data de Nascimento, CPF). No módulo financeiro, o campo Valor usa `type="number"` sem formatação de moeda, e a aba padrão está incorreta (`payable` ao invés de `receivable`).

---

## Passo 1: Instalar dependências

```bash
npm install react-imask react-number-format
```

---

## Passo 2: Criar componente `MaskedInput`

**Novo arquivo:** `src/components/common/MaskedInput.tsx`

Criar um componente wrapper que integra `IMaskInput` com o mesmo visual do `Input.tsx` (label, error, mesmas classes Tailwind). Exportar variantes específicas:

- **`CpfInput`** — máscara `000.000.000-00`
- **`PhoneInput`** — máscara dinâmica via `dispatch`: `(00) 0000-0000` (10 dígitos) ou `(00) 00000-0000` (11 dígitos)
- **`CepInput`** — máscara `00000-000`
- **`NumericInput`** — máscara regex `/^\d*$/` (apenas dígitos, sem formatação) para o campo RG

Cada componente recebe `value` (valor raw/sem máscara), `onAccept(unmaskedValue)` para atualizar o estado, e `label`/`error` para UI.

---

## Passo 3: Criar componente `CurrencyInput`

**Novo arquivo:** `src/components/common/CurrencyInput.tsx`

Wrapper do `NumericFormat` (react-number-format) com:
- `prefix="R$ "`, `thousandSeparator="."`, `decimalSeparator=","`
- `decimalScale={2}`, `fixedDecimalScale`, `allowNegative={false}`
- Mesma estrutura visual (label, error, classes Tailwind)
- `onValueChange` expõe o `floatValue` para o estado do form

---

## Passo 4: Atualizar `PatientFormFields.tsx`

**Arquivo:** `src/components/patients/PatientFormFields.tsx`

Substituir os `<Input>` por componentes com máscara:

| Campo | Atual | Novo |
|-------|-------|------|
| CPF (linha 40) | `<Input>` | `<CpfInput>` |
| RG (linha 41) | `<Input>` | `<NumericInput>` |
| Telefone (linha 44) | `<Input>` | `<PhoneInput>` |
| CEP (linha 56) | `<Input>` | `<CepInput>` |

Adicionar helper `handleMasked(field)` que retorna `{ id, name, value, onAccept, error }` (diferente do `handle()` que usa `onChange` com event).

---

## Passo 5: Reduzir campos obrigatórios

**Arquivo:** `src/components/patients/PatientFormModal.tsx` (linha 14-17)

```typescript
// DE:
const requiredFields = [
  'name', 'birthdate', 'cpf', 'gender', 'maritalStatus', 'phone',
  'street', 'number', 'neighborhood', 'city', 'state', 'zip',
]

// PARA:
const requiredFields = ['name', 'birthdate', 'cpf']
```

A validação de CEP (linhas 46-50) continua funcionando — só valida se o campo tiver valor.

---

## Passo 6: Alterar aba padrão no Financeiro

**Arquivo:** `src/pages/FinancialPage.tsx` (linha 15)

```typescript
// DE:
const [activeTab, setActiveTab] = useState<AccountType>('payable')
// PARA:
const [activeTab, setActiveTab] = useState<AccountType>('receivable')
```

---

## Passo 7: Máscara de moeda no campo Valor

**Arquivo:** `src/components/financial/AccountFormModal.tsx` (linha 81)

Substituir:
```tsx
<Input label="Valor (R$)" type="number" step="0.01" min="0" error={errors.value} {...handle('value')} />
```

Por:
```tsx
<CurrencyInput
  label="Valor (R$)"
  error={errors.value}
  value={form.value}
  onValueChange={(values) => handleChange('value', String(values.floatValue ?? ''))}
/>
```

A validação `Number(form.value) <= 0` no submit (linha 61) continua funcionando.

---

## Passo 8: Atualizar testes existentes

**`tests/patients/PatientForm.test.tsx`** (linha 42):
- Alterar asserção de `>= 10` erros obrigatórios para exatamente `3`

**`tests/financial/FinancialPage.test.tsx`**:
- Teste "adds a payable account" (linha 20): a aba padrão agora é `receivable`, o account será criado na tab receivable. Ajustar nome/descrição do teste.
- Os testes de valor que usam `user.type('1500')` num campo `type="number"` precisarão ser ajustados para o `CurrencyInput` — verificar comportamento e ajustar se necessário.

---

## Passo 9: Novos testes

**Novo arquivo:** `tests/masks/InputMasks.test.tsx`

Testes planejados:
1. CPF mask formata `12345678900` → exibe `123.456.789-00`
2. CPF rejeita caracteres não numéricos
3. Phone mask alterna entre formato 10 e 11 dígitos
4. CEP mask formata `01001000` → exibe `01001-000`
5. Currency input formata valor monetário com `R$` prefix
6. Formulário de pacientes requer apenas 3 campos (Nome, Data de Nascimento, CPF)
7. Formulário submete com campos opcionais vazios

---

## Arquivos modificados

| Arquivo | Ação |
|---------|------|
| `src/components/common/MaskedInput.tsx` | **Criar** |
| `src/components/common/CurrencyInput.tsx` | **Criar** |
| `src/components/patients/PatientFormFields.tsx` | Editar (4 campos) |
| `src/components/patients/PatientFormModal.tsx` | Editar (requiredFields) |
| `src/components/financial/AccountFormModal.tsx` | Editar (campo Valor) |
| `src/pages/FinancialPage.tsx` | Editar (aba padrão) |
| `tests/patients/PatientForm.test.tsx` | Editar (asserção) |
| `tests/financial/FinancialPage.test.tsx` | Editar (ajustes) |
| `tests/masks/InputMasks.test.tsx` | **Criar** |

## Verificação

1. `npm run build` — sem erros de compilação
2. `npm run test` — todos os testes passam
3. Verificar manualmente: abrir formulário de paciente, digitar no CPF e ver máscara aplicada
4. Verificar manualmente: abrir formulário financeiro, digitar valor e ver formatação R$
5. Verificar: editar paciente existente carrega valores com máscara
