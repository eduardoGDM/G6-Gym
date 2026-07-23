# Documentação da API — G6 Gym Management System

> Documentação gerada a partir das rotas e controllers existentes
> (`routes/api.php`, `routes/auth.php`). **Somente o que existe no código.**

## Convenções gerais

- **Base URL:** `/api`
- **Autenticação:** Laravel **Sanctum SPA (cookie de sessão)**. Não se usa Bearer Token.
- **Fluxo de autenticação (SPA):**
  1. `GET /sanctum/csrf-cookie` (obtém o cookie `XSRF-TOKEN`).
  2. `POST /api/auth/login` com credenciais.
  3. Requisições autenticadas enviam os cookies de sessão + header `X-XSRF-TOKEN`.
- **Headers obrigatórios (rotas autenticadas / mutações):**
  - `Accept: application/json`
  - `Content-Type: application/json`
  - `X-XSRF-TOKEN: <valor do cookie XSRF-TOKEN>`
  - Cookies de sessão (enviados automaticamente com `withCredentials: true`).
- **Domínios stateful:** `localhost:5173`, `127.0.0.1:5173`, `localhost`, `127.0.0.1` (config `SANCTUM_STATEFUL_DOMAINS`).
- **Papéis (`role`):** `trainer`, `student`, `admin`.
- **Middleware de papel:** rotas protegidas por `role:<papel>` retornam `403 {message:"Acesso não autorizado"}` quando o papel não corresponde.

### Códigos de status comuns

| Código | Significado no projeto |
|-------:|------------------------|
| 200 | Sucesso |
| 201 | Recurso criado |
| 401 | Não autenticado / credenciais inválidas |
| 403 | Sem permissão (papel incorreto) ou conta desativada |
| 404 | Recurso não encontrado / fora do escopo do usuário |
| 422 | Erro de validação (`{message, errors}`) |
| 429 | Rate limit de login excedido |

---

# Auth

Prefixo: `/api/auth`

## POST /api/auth/login

Descrição: Autentica o usuário (SPA, cookie de sessão).
Permissão: pública (não autenticada).
Headers: `Accept: application/json`, `X-XSRF-TOKEN` (após `csrf-cookie`).

Request:
```json
{
  "email": "persona@teste.com",
  "password": "123456"
}
```

Resposta (200):
```json
{
  "user": {
    "id": 1,
    "name": "Personal Teste",
    "email": "persona@teste.com",
    "role": "trainer",
    "is_active": true,
    "email_verified_at": null,
    "created_at": "...",
    "updated_at": "..."
  },
  "message": "Login realizado com sucesso"
}
```

Possíveis erros:
- `401` — `{"message": "Credenciais inválidas"}`
- `403` — `{"message": "Sua conta encontra-se desativada. Entre em contato com o administrador da plataforma."}`
- `422` — validação (`email`/`password` ausentes ou e-mail inválido)
- `429` — `{"message": "Muitas tentativas de login. Tente novamente em N segundos."}` (após 5 tentativas / 60s)

## GET /api/auth/user

Descrição: Retorna o usuário autenticado (equivale a "me").
Permissão: autenticado (`auth:sanctum`).
Body: nenhum.

Resposta (200): objeto `User` (sem `password`/`remember_token`).
```json
{ "id": 1, "name": "...", "email": "...", "role": "trainer", "is_active": true }
```
Possíveis erros: `401` (não autenticado).

> Nota: o método do controller chama-se `me()`, mas a rota é `/api/auth/user`.

## POST /api/auth/logout

Descrição: Encerra a sessão (invalida sessão + regenera CSRF).
Permissão: autenticado.
Body: nenhum.

Resposta (200): `{"message": "Logout realizado com sucesso"}`
Possíveis erros: `401`.

> **Fluxo legado (não-SPA):** `routes/auth.php` também expõe `/login`, `/logout`,
> `/forgot-password`, `/reset-password`, `/email/verification-notification`,
> `/verify-email/{id}/{hash}` (Breeze/Fortify). Não são os endpoints usados pela
> SPA; ver **API-013** no relatório de melhorias.

---

# Trainer

Prefixo: `/api/trainer` — middleware `role:trainer` (exceto o bloco de Anamnese, que aceita `role:trainer,admin`).

## Plano do personal

### GET /api/trainer/plan
Objetivo: Plano vigente do personal autenticado — **somente leitura**, não há
contratação nem troca pela aplicação (quem atribui é o admin, manualmente).
Resposta (200): `{ plan, subscription, usage }`, com `plan: null` quando não há
plano atribuído. `subscription.days_left` é `null` quando não há vencimento.
`usage.students` conta as vagas ocupadas (CPF distinto, ver **RN-PLAN-004**).

### GET /api/trainer/plans
Objetivo: Catálogo completo da escada para o personal comparar os degraus,
com `is_current` marcando o plano dele.
Resposta (200): array de `{ code, name, price_cents, student_limit, features, is_current }`.

> ⚠️ Nenhum limite é aplicado no código. `student_limit` é **informativo**:
> serve para medir consumo real e calibrar a escada antes de existir enforcement.

## Alunos — `student-profiles` (apiResource)

### GET /api/trainer/student-profiles
Objetivo: Lista os alunos do trainer autenticado (com `user`).
Resposta (200): array de `StudentProfile` (com `user`), filtrado por `trainer_id`.

### POST /api/trainer/student-profiles
Objetivo: Cria um aluno (`User` role student + `StudentProfile`).
Body:
```json
{
  "name": "João Silva",
  "email": "joao@aluno.com",
  "password": "123456",
  "cpf": "000.000.000-00",
  "phone": "11999999999",
  "birth_date": "1995-05-20",
  "gender": "Masculino",
  "height": 1.80,
  "photo": null,
  "observations": null
}
```
Validação: `name` req (≤255); `email` req/único; `password` req (≥6); `cpf` req/size 14/único; `phone` ≤20; `birth_date` data `before:today`; `gender` in(Masculino,Feminino,Outro); `height` 0–3; `photo` ≤255; `observations` texto. O peso não faz parte do cadastro: ele é registrado na avaliação física.
Resposta (201):
```json
{ "message": "Aluno criado com sucesso", "user": {…}, "profile": {…} }
```
Erros: `422` (validação), `403` (papel).

### GET /api/trainer/student-profiles/{id}
Objetivo: Detalha um aluno do trainer (com `user`).
Resposta (200): `StudentProfile`. Erros: `404` (`Aluno não encontrado`, também quando pertence a outro trainer).

### PUT/PATCH /api/trainer/student-profiles/{id}
Objetivo: Atualiza dados do aluno. Todos os campos são opcionais (`sometimes`/`nullable`); senha só muda se enviada.
Resposta (200): `{ "message": "Aluno atualizado com sucesso", "profile": {…} }`
Erros: `404`, `422`.

### DELETE /api/trainer/student-profiles/{id}
Objetivo: **Soft delete** do aluno (`deleted_at`). Não remove `User` nem dados relacionados.
Resposta (200): `{ "message": "Aluno removido com sucesso" }`
Erros: `404`.

## Treinos — `workouts` (apiResource)

### GET /api/trainer/workouts
Objetivo: Lista paginada de treinos do trainer.
Parâmetros (query): `student_search` (string), `status` (`all|active|inactive`), `per_page` (1–100, default 10).
Resposta (200): coleção paginada `WorkoutResource` (inclui `exercises_count`, `muscle_groups`, `student_profile.user`).

### POST /api/trainer/workouts
Objetivo: Cria um treino com grupos musculares, exercícios e séries (transação).
Body:
```json
{
  "student_profile_id": 1,
  "name": "Treino A - Peito/Tríceps",
  "description": "Foco em hipertrofia",
  "start_date": "2026-07-01",
  "end_date": "2026-09-01",
  "active": true,
  "muscle_groups": [1, 4],
  "exercises": [
    {
      "exercise_id": 10,
      "order": 1,
      "notes": "Aquecer antes",
      "series": [
        { "order": 1, "repetitions": 12, "weight": 40, "rest_time": 60, "rir": 2, "tempo": "2-0-2", "cadence": null, "duration": null, "notes": null }
      ]
    }
  ]
}
```
Validação principal: `student_profile_id` req e **do próprio trainer**; `name` req; `start_date` req; `end_date` ≥ `start_date`; `active` boolean (default true); `muscle_groups.*` existente; `exercises.*.exercise_id` req/existente; `exercises.*.order` req ≥1; séries conforme RN-WORKOUT-006.
Resposta (201): `{ "message": "Treino criado com sucesso", "workout": {…relations…} }`
Erros: `422`, `403`.

### GET /api/trainer/workouts/{id}
Objetivo: Detalha um treino do trainer (com aluno, grupos, exercícios e séries).
Resposta (200): `Workout` com relações. Erros: `404` (`Treino não encontrado`).

### PUT/PATCH /api/trainer/workouts/{id}
Objetivo: Atualiza o treino. Se `exercises` for enviado, **substitui** todos os exercícios/séries; se `muscle_groups` enviado, re-sincroniza.
Resposta (200): `{ "message": "Treino atualizado com sucesso", "workout": {…} }`
Erros: `404`, `422`.

### DELETE /api/trainer/workouts/{id}
Objetivo: Exclui o treino (físico, cascade em exercícios/séries/check-ins).
Resposta (200): `{ "message": "Treino removido com sucesso" }`
Erros: `404`.

## Exercícios (do treino) — `workout-exercises` (apiResource)

CRUD dedicado para um exercício dentro de um treino. Todo acesso valida que o treino pertence ao trainer.

- **GET /api/trainer/workout-exercises** — (`index($workoutId)`) lista os exercícios de um treino, ordenados por `order`, escopados ao trainer. *(ver observação API-012 sobre o binding do parâmetro)*
- **POST /api/trainer/workout-exercises** — adiciona exercício ao treino. Body: `workout_id` (req, do trainer), `exercise_id` (req/existe), `order` (opcional, default 1), `notes`, `series[]`. Resposta 201 `{ "message": "Exercício adicionado ao treino com sucesso", "workout_exercise": {…} }`.
- **GET /api/trainer/workout-exercises/{id}** — detalhe (com `exercise`, `workout`, `series`). `404` (`Registro não encontrado`).
- **PUT/PATCH /api/trainer/workout-exercises/{id}** — atualiza `order`/`notes`; se `series` enviado, substitui todas. `200` `{ "message": "Exercício do treino atualizado com sucesso", … }`.
- **DELETE /api/trainer/workout-exercises/{id}** — remove o exercício do treino. `200` `{ "message": "Exercício removido do treino com sucesso" }`.

## Catálogo de Exercícios — `exercises` (apiResource)

Catálogo **global** (sem escopo por trainer).

### GET /api/trainer/exercises
Objetivo: Lista paginada do catálogo.
Parâmetros: `search` (nome do exercício ou do grupo), `muscle_groups[]` (ids existentes), `per_page` (default 10). Ordena por `name`.
Resposta (200): coleção paginada `ExerciseResource` (com `muscle_group`).

### POST /api/trainer/exercises
Objetivo: Cadastra exercício.
Body: `muscle_group_id` (req/existe), `name` (req ≤255), `description`, `equipment` (≤255), `video_url` (url).
Resposta (201): `{ "message": "Exercício criado com sucesso", "exercise": {…} }`.

### GET /api/trainer/exercises/{id}
Resposta (200): `Exercise` (com `muscleGroup`). Erro `404` (`Exercício não encontrado`).

### PUT/PATCH /api/trainer/exercises/{id}
Body: todos opcionais (`sometimes`/`nullable`). Resposta (200): `{ "message": "Exercício atualizado com sucesso", "exercise": {…} }`.

### DELETE /api/trainer/exercises/{id}
Objetivo: Exclui exercício (físico). **Atenção:** cascade apaga `workout_exercises` e `workout_checkin_exercises` (histórico). Ver **API-002**.
Resposta (200): `{ "message": "Exercício removido com sucesso" }`.

## Grupos Musculares

### GET /api/trainer/muscle-groups
Objetivo: Lista todos os grupos musculares (somente leitura).
Resposta (200): array de `MuscleGroup`.

## Ficha de treino (PDF)

### GET /api/trainer/students/{student}/workout-sheet
Objetivo: Gera/baixa a ficha de treino (PDF) do aluno (apenas treinos **ativos**).
Permissão: trainer que possua ao menos um treino do aluno; senão `403 {message:"Acesso não autorizado"}`. Aluno inexistente → `404`.
Resposta (200): arquivo PDF (`Content-Type: application/pdf`), nome `ficha-treino-<slug>.pdf`.

## Evolução do aluno (histórico de check-ins)

- **GET /api/trainer/students/{student}/checkins/muscle-groups** — grupos musculares com histórico executado (carga registrada) do aluno. `404` se o aluno não é do trainer (`trainer_id`).
- **GET /api/trainer/students/{student}/checkins/exercises** — exercícios com histórico executado. Query: `muscle_group_id` (req/existe).
- **GET /api/trainer/students/{student}/exercises/{exercise}/evolution** — série temporal de carga/reps do exercício. Query opcional: `muscle_group_id`, `start_date`, `end_date` (`end_date` ≥ `start_date`). `422` se o exercício não pertence ao grupo informado. Resposta: `{ exercise, points[], summary{ max_weight, max_repetitions, first_performed_at, last_performed_at, total_checkins, weight_evolution_percentage } }`.

## Check-ins de treino (visão do trainer)

- **GET /api/trainer/checkins** — lista paginada dos check-ins de treinos criados pelo trainer. Query: `student_profile_id` (existe), `date`, `per_page` (1–100).
- **GET /api/trainer/checkins/{id}** — detalhe do check-in (com aluno, treino, exercícios, séries). `404`.
- **GET /api/trainer/checkins/students** — lista alunos que possuem ao menos um treino do trainer (para filtro).

## Check-ins diários (visão do trainer)

- **GET /api/trainer/daily-checkins** — lista paginada. Query: `student` (nome, like), `date_from`, `date_to`, `per_page` (1–100).
- **GET /api/trainer/daily-checkins/{id}** — detalhe. `404`.

## Dashboard do trainer

- **GET /api/trainer/dashboard/summary** — `{ active_students, active_workouts, workout_checkins_today, daily_checkins_today }`.
- **GET /api/trainer/dashboard/recent-workout-checkins** — últimos 5 check-ins de treino.
- **GET /api/trainer/dashboard/recent-daily-checkins** — últimos 5 check-ins diários.
- **GET /api/trainer/dashboard/pending-daily-checkins** — até 5 alunos sem check-in diário de ontem.

## Anamnese (papel `role:trainer,admin`)

Bloco de rotas de anamnese/mídias. Documentado aqui por existir nas rotas; controllers em `Api/Trainer/StudentAnamnesis*`.

- **GET /api/trainer/students/{student}/anamnesis** — retorna a anamnese do aluno.
- **PUT /api/trainer/students/{student}/anamnesis** — atualiza a anamnese (validado por `UpdateStudentAnamnesisRequest`).
- **POST /api/trainer/students/{student}/anamnesis/photos** — envia foto (`StoreStudentAnamnesisPhotoRequest`).
- **DELETE /api/trainer/students/{student}/anamnesis/photos/{photo}** — remove foto.
- **POST /api/trainer/students/{student}/anamnesis/videos** — envia vídeo (`StoreStudentAnamnesisVideoRequest`).
- **DELETE /api/trainer/students/{student}/anamnesis/videos/{video}** — remove vídeo.

> Observação: diferentemente do restante do módulo trainer, este bloco aceita
> `role:trainer,admin`. Os detalhes de validação estão nos respectivos
> Form Requests em `app/Http/Requests/Trainer/`.

## Avaliação física (papel `role:trainer,admin`)

Diferente da anamnese (registro único por aluno), a avaliação física é uma
**série temporal**: N registros datados por aluno. Controller em
`Api/Trainer/StudentPhysicalAssessmentController`.

- **GET /api/trainer/students/{student}/physical-assessments** — lista da mais recente para a mais antiga.
- **POST /api/trainer/students/{student}/physical-assessments** — cria uma avaliação.
- **PUT /api/trainer/students/{student}/physical-assessments/{assessment}** — atualiza.
- **DELETE /api/trainer/students/{student}/physical-assessments/{assessment}** — remove.

Validação: `assessment_date` req/data/`before_or_equal:today`; `notes` texto;
`weight` 0–500; `height` 0–3; `fat_percentage` 0–100; `muscle_mass` 0–500;
circunferências (`neck`, `shoulder`, `chest`, `waist`, `abdomen`, `hip`,
`left_arm`/`right_arm` relaxado, `left_arm_contracted`/`right_arm_contracted`,
`left_forearm`/`right_forearm`, `left_thigh`/`right_thigh`,
`left_calf`/`right_calf`) 0–300. Nenhuma medida é obrigatória isoladamente, mas
uma avaliação **sem nenhuma medida** é rejeitada com `422`.

Resposta (`PhysicalAssessmentResource`): cada medida vem como
`{ "value": 88.0, "delta": -2.0 }`, onde `delta` é a variação em relação à
avaliação anterior. Além de `measures`, o bloco `derived` traz `imc`,
`waist_hip_ratio`, `fat_mass` e `lean_mass` — **calculados na leitura**, nunca
gravados. O IMC usa `height` da avaliação e, na ausência dela, a altura do
cadastro do aluno.

> `muscle_mass` é um valor **digitado** (balança de bioimpedância) e não se
> confunde com `lean_mass` (massa magra = peso − massa gorda).

Erros: `404` (`Aluno não encontrado` / `Avaliação física não encontrada`), `422`.

---

# Student

Prefixo: `/api/student` — middleware `role:student`. Todos os endpoints resolvem o perfil via `user->studentProfile`; sem perfil → `404 {message:"Perfil de student não encontrado"}`.

## Meus treinos

### GET /api/student/my-workouts
Objetivo: Lista os treinos **ativos** do aluno (com exercícios, grupo muscular e séries).
Resposta (200): array de `Workout` com relações.

### GET /api/student/workout/{id}
Objetivo: Detalha um treino do aluno.
Resposta (200): `Workout` com relações. Erro `404` (`Treino não encontrado`).

## Check-ins de treino

### GET /api/student/checkins
Objetivo: Lista paginada dos check-ins do aluno.
Parâmetros: `search` (data em `DD/MM/YYYY` ou `YYYY-MM-DD`; formato inválido retorna vazio), `per_page` (default 10).
Resposta (200): coleção paginada `WorkoutCheckinResource` (com `exercises_count`).

### GET /api/student/checkins/by-date
Objetivo: Retorna o check-in de uma data específica.
Parâmetros: `date` (req, date). Resposta (200): `WorkoutCheckinResource`. Erro `404` (`Nenhum check-in encontrado para esta data`).

### GET /api/student/checkins/{id}
Resposta (200): `WorkoutCheckinResource` (com treino, exercícios, séries). Erro `404`.

### POST /api/student/checkins
Objetivo: Registra a execução de um treino.
Body:
```json
{
  "workout_id": 5,
  "performed_at": "2026-07-20",
  "notes": "Bom treino",
  "exercises": [
    {
      "exercise_id": 10,
      "notes": null,
      "sets": [
        { "set_number": 1, "performed_repetitions": 12, "performed_weight": 42.5, "performed_rest_time": 60, "notes": null }
      ]
    }
  ]
}
```
Validação: `workout_id` req/existe (revalidado: do aluno e **ativo**); `performed_at` req/date/`before_or_equal:today`; estrutura de `exercises`/`sets` conforme regras.
Resposta (201): `WorkoutCheckinResource` + `{"message": "Check-in registrado com sucesso"}`.
Erros: `404` (`Treino não encontrado ou não está ativo`), `422`.

### PUT /api/student/checkins/{id}
Objetivo: Atualiza valores executados do check-in (o snapshot planejado é preservado).
Body: `performed_at` (opcional), `notes`, `exercises[].sets[]` (por `id` ou `set_number`).
Resposta (200): `WorkoutCheckinResource` + `{"message": "Check-in atualizado com sucesso"}`.
Erros: `404`, `422`.

## Check-ins diários

### GET /api/student/daily-checkins
Objetivo: Lista paginada. Parâmetros: `date` (filtro), `per_page` (default 10).
Resposta (200): coleção paginada `DailyCheckinResource`.

### GET /api/student/daily-checkins/reminder
Objetivo: Indica se falta o check-in diário de ontem.
Resposta (200): `{ "pending": true, "expected_date": "2026-07-20" }`.

### POST /api/student/daily-checkins
Objetivo: Cria o check-in diário.
Body: `date` (req ≤ hoje), `sleep_rating` (req 0–10), `sleep_notes`, `diet_rating` (req 0–10), `diet_notes`.
Resposta (201): `DailyCheckinResource` + `{"message": "Check-in Diário registrado com sucesso"}`.
Erros: `422` — inclui data duplicada (`Já existe um Check-in Diário cadastrado para essa data.`).

### PUT /api/student/daily-checkins/{id}
Objetivo: Atualiza o check-in diário (mantém unicidade por data, ignorando o próprio registro).
Resposta (200): `DailyCheckinResource` + `{"message": "Check-in Diário atualizado com sucesso"}`.
Erros: `404` (`Check-in Diário não encontrado`), `422`.

## Dashboard do aluno

- **GET /api/student/dashboard/summary** — `{ active_workouts, last_workout_checkin, avg_sleep_rating, avg_diet_rating }` (médias dos últimos 30 dias).
- **GET /api/student/dashboard/recent-workouts** — últimos 5 check-ins (`id, workout_name, date, exercises_count`).
- **GET /api/student/dashboard/evolution** — `{ top_exercise, max_weight, total_checkins, total_exercises_performed }`.

## Perfil do aluno

Somente leitura: quem mantém o cadastro é o personal. Controller em
`Api/Student/ProfileController`.

- **GET /api/student/profile** — `{ id, name, email, cpf, phone, birth_date, gender, height, latest_weight, latest_weight_date, trainer }`.
  `latest_weight` vem da avaliação física mais recente **que registrou peso** (uma
  avaliação pode conter só circunferências); `null` quando não há nenhuma.
- **GET /api/student/physical-assessments** — histórico do próprio aluno, mesmo
  `PhysicalAssessmentResource` da tela do personal (com `measures`/`derived` e os deltas).

Erros: `404` (`Perfil de student não encontrado`), `403` (papel).

---

# Admin

Prefixo: `/api/admin` — middleware `role:admin`.

## GET /api/admin/dashboard/summary
Objetivo: Resumo administrativo da plataforma. (Ver `Api/Admin/DashboardController`.)

## GET /api/admin/trainers
Objetivo: Lista paginada de trainers (com `students_count`).
Parâmetros: `name`, `email`, `per_page` (1–100).
Resposta (200): coleção paginada `TrainerResource`.

## PATCH /api/admin/trainers/{id}/status
Objetivo: Ativa/desativa um trainer.
Body: `{ "is_active": true }` (req boolean).
Resposta (200): `{ "message": "Personal ativado/desativado com sucesso", "user": {…} }`.
Erro: `404` (`Personal não encontrado`).

## GET /api/admin/students
Objetivo: Lista paginada de alunos (com trainer derivado do último treino).
Parâmetros: `name`, `email`, `trainer`, `per_page`.
Resposta (200): coleção paginada `StudentResource`.

## GET /api/admin/plans
Objetivo: Catálogo de planos (escada por capacidade de alunos), ordenado por `sort_order`.
Resposta (200): `PlanResource` — `{ code, name, price_cents, student_limit, features, sort_order }`.
`student_limit: null` = ilimitado. Os planos são **seeded pela migration**, não há CRUD.

## PUT /api/admin/trainers/{trainer}/subscription
Objetivo: **Atribuição manual** de plano a um personal (não há gateway de pagamento).
Body: `{ plan_code, ends_at?, notes? }`. Validação: `plan_code` req/`exists:plans,code`;
`ends_at` data futura (em branco = sem vencimento); `notes` texto.
Comportamento: encerra a assinatura ativa (`canceled`) e cria uma nova, **em transação** —
o histórico de troca de plano é preservado. Grava `source: manual` e `assigned_by`.
Resposta (200): `{ message, subscription }`. Erros: `404` (não é personal), `422`.

## DELETE /api/admin/trainers/{trainer}/subscription
Objetivo: Cancela a assinatura ativa do personal (fica sem plano).
Resposta (200): `{ message }`. Erro `404` (sem plano ativo / não é personal).

## GET /api/admin/trainers/{trainer}/subscriptions
Objetivo: Histórico de assinaturas do personal (mais recente primeiro).

## PATCH /api/admin/students/{id}/status
Objetivo: Ativa/desativa um aluno.
Body: `{ "is_active": true }`.
Resposta (200): `{ "message": "Aluno ativado/desativado com sucesso", "user": {…} }`.
Erro: `404` (`Aluno não encontrado`).

---

## Resumo de rotas

| Método | Rota | Papel | Controller |
|--------|------|-------|------------|
| POST | /api/auth/login | público | AuthController@login |
| GET | /api/auth/user | auth | AuthController@me |
| POST | /api/auth/logout | auth | AuthController@logout |
| GET/POST | /api/trainer/student-profiles | trainer | StudentProfileController |
| GET/PUT/DELETE | /api/trainer/student-profiles/{id} | trainer | StudentProfileController |
| GET/POST | /api/trainer/workouts | trainer | WorkoutController |
| GET/PUT/DELETE | /api/trainer/workouts/{id} | trainer | WorkoutController |
| CRUD | /api/trainer/workout-exercises | trainer | WorkoutExerciseController |
| GET/POST | /api/trainer/exercises | trainer | ExerciseController |
| GET/PUT/DELETE | /api/trainer/exercises/{id} | trainer | ExerciseController |
| GET | /api/trainer/muscle-groups | trainer | MuscleGroupController |
| GET | /api/trainer/students/{student}/workout-sheet | trainer | StudentWorkoutSheetController |
| GET | /api/trainer/students/{student}/checkins/muscle-groups | trainer | StudentExerciseEvolutionController |
| GET | /api/trainer/students/{student}/checkins/exercises | trainer | StudentExerciseEvolutionController |
| GET | /api/trainer/students/{student}/exercises/{exercise}/evolution | trainer | StudentExerciseEvolutionController |
| GET | /api/trainer/checkins[/students\|/{id}] | trainer | Trainer\WorkoutCheckinController |
| GET | /api/trainer/daily-checkins[/{id}] | trainer | Trainer\DailyCheckinController |
| GET | /api/trainer/dashboard/* | trainer | Trainer\DashboardController |
| GET/PUT | /api/trainer/students/{student}/anamnesis | trainer,admin | StudentAnamnesisController |
| POST/DELETE | /api/trainer/students/{student}/anamnesis/photos[/{photo}] | trainer,admin | StudentAnamnesisPhotoController |
| POST/DELETE | /api/trainer/students/{student}/anamnesis/videos[/{video}] | trainer,admin | StudentAnamnesisVideoController |
| GET | /api/student/my-workouts | student | Student\WorkoutController |
| GET | /api/student/workout/{id} | student | Student\WorkoutController |
| GET/POST/PUT | /api/student/checkins[...] | student | Student\WorkoutCheckinController |
| GET/POST/PUT | /api/student/daily-checkins[...] | student | Student\DailyCheckinController |
| GET | /api/student/dashboard/* | student | Student\DashboardController |
| GET | /api/admin/dashboard/summary | admin | Admin\DashboardController |
| GET/PATCH | /api/admin/trainers[/{id}/status] | admin | Admin\TrainerController |
| GET/PATCH | /api/admin/students[/{id}/status] | admin | Admin\StudentController |
