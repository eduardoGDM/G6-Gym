# Plano — Avaliação Física (Etapa 1)

> Documento de handoff. Contém as decisões já tomadas e o escopo fechado da Etapa 1.
> Etapa 2 (tela do aluno) está descrita no final apenas como contexto — **não implementar agora**.

---

## Contexto

A tabela `physical_assessments` **já existe** no banco desde
`2026_07_01_*_create_physical_assessments_table.php`, mas está **morta**: nenhum controller,
rota, Resource ou tela a referencia (só o Model e uma menção em `StudentProfile`).
A tabela está vazia — alterá-la é seguro.

Esta etapa dá vida a ela.

---

## Decisões já tomadas (não relitigar)

1. **Somente "Modo Simples"** — peso, circunferências e `% de gordura digitado`
   (vem de balança de bioimpedância). **Sem dobras cutâneas, sem protocolos
   (Pollock/Faulkner), sem cálculo de densidade corporal.**
2. **Nenhum campo obrigatório, exceto `assessment_date`.** Sem data não há como
   ordenar nem calcular variação. Adicionar guarda de "pelo menos um campo preenchido"
   para não gravar avaliações vazias.
3. **Quanto mais campos opcionais, melhor.** Colunas nullable vazias custam 1 bit no
   bitmap de NULL do InnoDB — não há custo de escala relevante.
4. **A seção só aparece na EDIÇÃO do aluno**, nunca na criação (precisa de
   `student_profile_id`). Mesmo padrão da anamnese.
5. **Avaliação é série temporal** — N linhas por aluno, com data. Não achatar em
   `student_profiles` (isso destruiria histórico, delta e evolução).
6. **`student_profiles.current_weight` será removido.** "Peso atual" passa a ser
   derivado da avaliação mais recente. Uma fonte da verdade por dado.
7. **`student_profiles.height` permanece** (referência, muda raro). Na avaliação
   `height` vira override opcional.

---

## Backend

### 1. Migration A — alterar `physical_assessments`

Adicionar (todos nullable):

| Coluna | Tipo | Nota |
|---|---|---|
| `trainer_id` | FK users, nullable | Quem realizou a avaliação |
| `notes` | text | A tabela hoje não tem campo de observação |
| `neck` | decimal(5,2) | Pescoço |
| `shoulder` | decimal(5,2) | Ombro |
| `left_forearm` / `right_forearm` | decimal(5,2) | Antebraço |
| `left_arm_contracted` / `right_arm_contracted` | decimal(5,2) | Braço contraído |

Alterar:
- `height` → **nullable** (hoje é NOT NULL; obrigar a redigitar altura em toda
  reavaliação é atrito desnecessário)

Semântica: as colunas existentes `left_arm` / `right_arm` passam a significar
**braço relaxado**.

### 2. Migration B — remover `student_profiles.current_weight`

**Com backfill, antes do drop:** para cada `student_profile` com `current_weight`
preenchido, criar um `physical_assessment` inicial (`assessment_date` = `created_at`
do perfil, `weight` = `current_weight`). Nenhum dado pode ser perdido.

### 3. Models

- `PhysicalAssessment` — `$fillable` + `$casts` (decimais `decimal:2`,
  `assessment_date` → `date`); relação `studentProfile()`, `trainer()`
- `StudentProfile` — remover `current_weight` de `$fillable` e `$casts`;
  adicionar `physicalAssessments(): HasMany` (ordenada por `assessment_date desc`)

### 4. `PhysicalAssessmentResource`

Campos brutos + **derivados calculados na leitura** (nunca gravados):

| Derivado | Fórmula |
|---|---|
| `imc` | `weight / height²` — usar `assessment.height ?? studentProfile.height` |
| `waist_hip_ratio` | `waist / hip` |
| `fat_mass` | `weight × fat_percentage / 100` |
| `lean_mass` | `weight − fat_mass` |

⚠️ `muscle_mass` é **input** (vem da balança), NÃO é a massa magra derivada.
São grandezas diferentes — não sobrescrever uma com a outra.

Incluir também a **variação vs. a avaliação anterior** de cada medida
(ex.: `waist: { value: 88.0, delta: -2.0 }`). Esse delta é o principal valor
da feature — é o que o personal manda para o aluno.

### 5. Controller — `Api/Trainer/StudentPhysicalAssessmentController`

CRUD completo (avaliação é coleção no tempo, diferente da anamnese que é singleton):

```
GET    trainer/students/{student}/physical-assessments
POST   trainer/students/{student}/physical-assessments
PUT    trainer/students/{student}/physical-assessments/{assessment}
DELETE trainer/students/{student}/physical-assessments/{assessment}
```

- Grupo `role:trainer,admin` (mesmo da anamnese em `routes/api.php`)
- **Sempre** escopar por `StudentProfile::where('trainer_id', $request->user()->id)`
- Ordenar por `assessment_date desc`
- Mensagens de erro em português

### 6. Limpeza de `current_weight`

Remover de `Api/Trainer/StudentProfileController.php` — 3 pontos
(validação no store ~L33, atribuição ~L53, validação no update ~L95, lista de
campos ~L117).

### 7. Testes (`tests/Feature/Trainer/`)

- Trainer não acessa avaliação de aluno de outro trainer
- Derivados (IMC, RCQ, massa gorda/magra) calculados corretamente
- Delta vs. avaliação anterior
- Avaliação sem nenhuma medida é rejeitada
- Backfill do `current_weight` preserva o peso

Rodar: `php artisan test`

---

## Frontend

### 8. `services/PhysicalAssessmentsService.js`

Via `sanctumRequest` (nunca `apiClient` direto). Espelhar
`services/StudentAnamnesisService.js`.

### 9. `pages/trainer/Students/components/PhysicalAssessmentSection.jsx`

**Referência de padrão: `components/AnamnesisSection.jsx`** (react-query,
`crudToast`, `ConfirmDialog`, `SectionLabel`, Skeleton).

- Formulário **agrupado** (são ~20 campos numéricos — precisa de seções no mobile):
  - *Composição corporal*: peso, altura, % gordura, massa muscular
  - *Circunferências*: pescoço, ombro, tórax, cintura, abdômen, quadril,
    braço relaxado D/E, braço contraído D/E, antebraço D/E, coxa D/E, panturrilha D/E
  - *Observações*
- Usar os componentes de `components/forms/` (`Field`, `FormSection`, `SectionLabel`) —
  **não** hardcodar blocos Label+input. Erros sempre em `text-destructive`.
- **Prefill da última avaliação**: na reavaliação o form já vem preenchido com os
  valores anteriores; o trainer só altera o que mudou. Transforma 20 campos em 4 toques.
- Lista de avaliações em cards, mais recente primeiro, **com o delta destacado**.
- React Hook Form + Yup.

### 10. Encaixe em `pages/trainer/Students/StudentsNewEdit.jsx`

A anamnese já faz exatamente isso em **`StudentsNewEdit.jsx:387-394`**:

```jsx
{isEdit && !initialLoading ? (
  <AnamnesisSection studentId={id} />
) : !isEdit ? (
  <div className="mt-6 rounded-2xl border border-dashed ...">
    A seção de Anamnese ... ficará disponível após a criação do cadastro do aluno.
  </div>
) : null}
```

Renderizar `PhysicalAssessmentSection` logo abaixo, com a mesma condição.

**Fundir os dois avisos pontilhados em um só** para não poluir a tela de criação:
*"Anamnese e Avaliação Física ficarão disponíveis após a criação do cadastro."*

### 11. Limpeza de `current_weight` no frontend

- `StudentsNewEdit.jsx` — L66 (default), L74 (`register`), L106, L132, L329-333 (campo)
- `StudentsShow.jsx` — L141 (exibição) → passar a mostrar o peso da última avaliação
- `pages/trainer/Students/utils/schema.js` — L74 (regra Yup)

### 12. Validação

`npx eslint` nos arquivos tocados, `npx vite build`, e `php artisan test` no backend.

---

## Fora do escopo desta etapa

- **Etapa 2** — `TopBar.jsx` clicável (hoje mostra `"Usuario"` hardcoded em L48) +
  `pages/student/Profile.jsx` read-only com nome, telefone e histórico de avaliações.
  ➜ **Pendência aberta:** confirmar com o usuário se o aluno pode editar nome/telefone
  ou se a tela é leitura pura.
- **Gráfico de evolução** (peso/cintura no tempo) — fase 2. `recharts` já está no
  bundle e `Students/components/ExerciseEvolutionSection.jsx` tem o padrão pronto.
  Decisão: validar o delta numérico primeiro.
- Dobras cutâneas / protocolos — descartado, pode voltar no futuro como "Modo Dobras".

---

## Regras do projeto a respeitar

Ver `CLAUDE.md`. Em especial:
- Sanctum SPA (`sanctumRequest`, `withCredentials`) — **nunca** Bearer Token
- Não criar Services/Repositories/FormRequests novos sem pedido explícito
- Models em inglês, mensagens da API em português
- Ler arquivos semelhantes e reutilizar componentes antes de escrever
- O banco de desenvolvimento é **MySQL** (Laragon), apesar do CLAUDE.md citar SQLite
