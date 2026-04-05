# Plano: Cadastro de Pacientes em Modal

## Context
Atualmente o cadastro/edição de pacientes usa páginas separadas (`PatientFormPage`) com rotas `/patients/new` e `/patients/:id/edit`. O objetivo é migrar para um modal seguindo o mesmo padrão do `AccountFormModal`, tornando a experiência consistente entre contas e pacientes.

## Arquivos Críticos

| Arquivo | Ação |
|---------|------|
| `src/components/patients/PatientFormModal.tsx` | **Criar** - novo modal seguindo padrão AccountFormModal |
| `src/pages/PatientsPage.tsx` | **Modificar** - adicionar estado e handlers do modal |
| `src/pages/PatientDetailPage.tsx` | **Modificar** - trocar navegação de edição por modal |
| `src/routes/index.tsx` | **Modificar** - remover rotas do formulário |
| `src/pages/PatientFormPage.tsx` | **Deletar** - lógica migrada para o modal |

## Passos de Implementação

### 1. Criar `src/components/patients/PatientFormModal.tsx`

Estrutura de dois componentes (wrapper + inner form), idêntica ao `AccountFormModal.tsx`:

**Wrapper `PatientFormModal`:**
- Props: `open`, `onClose`, `onSave`, `patient: Patient | null`, `isCpfTaken`
- Título dinâmico: "Novo Paciente" / "Editar Paciente"
- Renderização condicional do form interno com `key={patient?.id ?? 'new'}`

**Inner `PatientFormModalForm`:**
- Portar de `PatientFormPage.tsx`: `emptyValues`, `requiredFields`, `validate()`
- Estado local: `values` (inicializado do `patient` prop), `errors`
- Reutilizar `PatientFormFields` existente para renderizar os campos
- `handleChange`: atualiza valor e limpa erro do campo
- `handleSubmit`: valida, chama `onSave(values)` e `onClose()`
- Botões: "Cancelar" e "Cadastrar paciente" / "Salvar alterações"

### 2. Modificar `src/pages/PatientsPage.tsx`

- Adicionar imports: `PatientFormModal`, `useState`
- Adicionar destructuring do hook: `addPatient`, `updatePatient`, `isCpfTaken`, `getPatientById`
- Adicionar estado: `formOpen` (boolean), `editTarget` (Patient | null)
- Adicionar `handleSave`: verifica `editTarget` para decidir `addPatient` vs `updatePatient`
- Trocar `navigate('/patients/new')` por `setEditTarget(null); setFormOpen(true)` (botão e `onNew`)
- Trocar `onEdit` por `setEditTarget(getPatientById(id)!); setFormOpen(true)`
- Adicionar `<PatientFormModal>` no JSX após `<ConfirmDialog>`
- Manter `navigate` apenas para `onView`

### 3. Modificar `src/pages/PatientDetailPage.tsx`

- Adicionar imports: `PatientFormModal`, `PatientFormValues`
- Adicionar destructuring: `updatePatient`, `isCpfTaken`
- Adicionar estado: `formOpen` (boolean)
- Trocar botão "Editar" de `navigate(...)` para `setFormOpen(true)`
- Adicionar `handleSave` que chama `updatePatient(id!, data)`
- Adicionar `<PatientFormModal>` no JSX (sempre em modo edição, `patient` nunca é null aqui)

### 4. Atualizar `src/routes/index.tsx`

- Remover linhas 16 e 18 (rotas `patients/new` e `patients/:id/edit`)
- Remover import de `PatientFormPage`

### 5. Deletar `src/pages/PatientFormPage.tsx`

Toda a lógica foi migrada para `PatientFormModal.tsx`.

## Nota sobre layout do Modal

O `Modal` usa `max-w-lg` (512px). O `PatientFormFields` usa `md:grid-cols-2` que é viewport-based (768px), então em desktop os campos aparecerão em 2 colunas dentro do modal, o que pode ficar apertado. Como o usuário confirmou que scroll vertical é suficiente, não alteraremos o Modal. Se ficar visualmente ruim, podemos ajustar depois.

## Verificação

1. `npm run dev` - testar manualmente:
   - Abrir modal "Novo Paciente" na listagem, preencher e salvar
   - Editar paciente pela listagem via modal
   - Editar paciente pela página de detalhe via modal
   - Validações: campos obrigatórios, CPF inválido, CPF duplicado, email inválido, CEP inválido
   - Fechar modal sem salvar e verificar que nada mudou
   - Reabrir modal e verificar que estado foi resetado
2. Verificar que rotas `/patients/new` e `/patients/:id/edit` retornam 404
3. Executar testes existentes
4. Criar testes conforme spec (abertura, validação, CPF duplicado, reset)
