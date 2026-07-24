# Regras de Negócio (RN) — G6 Gym Management System

> Documento gerado a partir da análise do backend existente (Laravel 11).
> **Nenhuma regra nova foi criada.** Todas as regras abaixo foram extraídas de
> Models, Controllers, Form Requests, Middlewares, Routes, Migrations,
> relacionamentos Eloquent e Seeders.
>
> Convenção de rastreabilidade: cada RN indica **onde** a regra é aplicada no
> código (arquivo/trecho), para permitir auditoria.

---

## Papéis do sistema

O sistema possui **três papéis** (coluna `users.role`):

- `trainer` (personal)
- `student` (aluno)
- `admin` (administrador da plataforma)

> Observação: o `CLAUDE.md` menciona apenas `trainer` e `student`. O papel
> `admin` foi adicionado posteriormente (migration
> `2026_07_21_000001_add_admin_role_and_is_active_to_users_table.php` e
> `UsersSeeder`). Este documento reflete o que existe no código.

Origem:
- `app/Models/User.php` → `isTrainer()`, `isStudent()`, `isAdmin()`
- `database/migrations/0001_01_01_000000_create_users_table.php` (enum inicial `['student','trainer']`)
- `database/migrations/2026_07_21_000001_...` (troca do enum por string + `is_active`)

---

## Autenticação

**RN-AUTH-001**
Descrição:
O usuário deve informar `email` (formato de e-mail válido) e `password` para acessar o sistema. Ambos os campos são obrigatórios.
Validação: `AuthController::login` → `email => required|email`, `password => required`.
Onde é aplicada: `app/Http/Controllers/Api/AuthController.php`.

**RN-AUTH-002**
Descrição:
A autenticação usa **Laravel Sanctum SPA (cookie/sessão)**, nunca Bearer Token. O guard utilizado é o `web`.
Onde é aplicada: `config/sanctum.php` (`'guard' => ['web']`), `bootstrap/app.php` (`$middleware->statefulApi()`), rotas protegidas com `auth:sanctum`.

**RN-AUTH-003**
Descrição:
Credenciais inválidas retornam **HTTP 401** com a mensagem `Credenciais inválidas`. O sistema não informa se o problema foi o e-mail ou a senha.
Onde é aplicada: `AuthController::login` (`Auth::attempt`).

**RN-AUTH-004**
Descrição:
Login possui **rate limiting**: no máximo **5 tentativas** por chave `email + IP` a cada **60 segundos**. Excedido o limite, retorna **HTTP 429** informando os segundos restantes.
Onde é aplicada: `AuthController::login` (`RateLimiter`, constantes `MAX_LOGIN_ATTEMPTS = 5`, `LOGIN_DECAY_SECONDS = 60`). O contador é limpo após login bem-sucedido.

**RN-AUTH-005**
Descrição:
Após autenticação bem-sucedida, se `users.is_active = false`, o login é **rejeitado com HTTP 403** (`Sua conta encontra-se desativada...`) e a sessão é invalidada.
Onde é aplicada: `AuthController::login`.

**RN-AUTH-006**
Descrição:
No login bem-sucedido a sessão é **regenerada** (proteção contra session fixation) e é retornado o objeto `user` (sem `password` e `remember_token`, que são `$hidden`).
Onde é aplicada: `AuthController::login`, `app/Models/User.php` (`$hidden`).

**RN-AUTH-007**
Descrição:
O logout invalida a sessão e regenera o token CSRF.
Onde é aplicada: `AuthController::logout`.

**RN-AUTH-008**
Descrição:
Cada usuário só acessa as funcionalidades do seu papel. As rotas são segmentadas por prefixo e protegidas pelo middleware `role:` (`trainer`, `student`, `admin`, ou combinações). Acesso indevido retorna **HTTP 403** (`Acesso não autorizado`).
Onde é aplicada: `routes/api.php` (`->middleware('role:...')`), `app/Http/Middleware/CheckRole.php`, alias `role` em `bootstrap/app.php`.

**RN-AUTH-009**
Descrição:
Não existe **auto-cadastro público** de contas. Alunos são provisionados pelo trainer; trainers/admins pelo admin.
Onde é aplicada: comentário e ausência de rota em `routes/auth.php`; criação de aluno em `StudentProfileController::store`.

**RN-AUTH-010**
Descrição:
Existe um segundo fluxo de autenticação herdado do scaffold Laravel Breeze/Fortify (`/login`, `/logout`, `/forgot-password`, `/reset-password`, verificação de e-mail), definido em `routes/auth.php` e incluído por `routes/web.php`. O fluxo **oficial da SPA** é o de `routes/api.php` (`/api/auth/*`).
Onde é aplicada: `routes/auth.php`, `routes/web.php`, `app/Http/Controllers/Auth/*`.
> Ver **API-013** no relatório de melhorias (duplicidade de login).

---

## Alunos (Students)

Entidade: `User` (role `student`) **+** `StudentProfile` (1:1). Cada aluno é
sempre um par `users` + `student_profiles`.

Origem:
- `app/Http/Controllers/Api/Trainer/StudentProfileController.php`
- `app/Models/StudentProfile.php`
- `database/migrations/2026_07_01_000001_create_student_profiles_table.php`
- `database/migrations/2026_07_21_050000_add_trainer_id_to_student_profiles_table.php`
- `database/migrations/2026_07_21_060000_add_soft_deletes_to_student_profiles_table.php`

**RN-STUDENT-001**
Regra: Apenas usuários com papel `trainer` podem criar, listar, visualizar, editar e excluir alunos.
Validação/Onde: rota `apiResource('student-profiles')` sob `role:trainer` em `routes/api.php`.

**RN-STUDENT-002**
Regra: Ao criar um aluno, o sistema cria simultaneamente um registro em `users` (com `role = student`, senha `bcrypt`) e um `student_profiles` vinculado (`user_id`) ao trainer autenticado (`trainer_id`).
Validação/Onde: `StudentProfileController::store`.

**RN-STUDENT-003**
Regra: Campos **obrigatórios** na criação do aluno:
- `name` (string, máx. 255)
- `email` (e-mail, único em `users.email`)
- `password` (string, mín. 6)
- `cpf` (string, tamanho exato 14, único em `student_profiles.cpf`)
Validação/Onde: `StudentProfileController::store` (regras `required`).

**RN-STUDENT-004**
Regra: Campos **opcionais** do aluno e suas restrições:
- `phone` (máx. 20)
- `birth_date` (data, deve ser anterior a hoje — `before:today`)
- `gender` (apenas `Masculino`, `Feminino` ou `Outro`)
- `height` (numérico, 0–3; `decimal(4,2)`)
- `photo` (string/caminho, máx. 255)
- `observations` (texto livre)
Validação/Onde: `StudentProfileController::store`/`update`, migration `create_student_profiles_table`.

**RN-STUDENT-005**
Regra: O `cpf` é **único** em toda a base, tem tamanho fixo de 14 caracteres
(formato com máscara, ex.: `000.000.000-00`) e é validado pelo **dígito
verificador** — sequências repetidas (`111.111.111-11`) são rejeitadas. A
validação existe porque o CPF é a chave da vaga do plano (**RN-PLAN-004**, em
`docs/regras-planos.md`): um
CPF inventado seria uma vaga fantasma ocupando capacidade.
Validação/Onde: `StudentProfileController::isValidCpf` (store e update), migration
(`string('cpf', 14)->unique()`), espelhado no front em
`Students/utils/validators.js::isValidCpf`.

> ⚠️ A unicidade do CPF é a nível de coluna e **não ignora soft delete**: um aluno
> removido continua segurando o CPF, então o mesmo CPF não pode ser recadastrado
> depois. Reforça o anti-fraude, mas impede o retorno legítimo de um ex-aluno.

**RN-STUDENT-006**
Regra: O `email` do aluno é único em `users`. Na edição, a unicidade ignora o próprio registro do usuário.
Validação/Onde: `StudentProfileController::update` (`unique:users,email,{user_id}`).

**RN-STUDENT-007**
Regra: Um trainer só enxerga e manipula alunos cujos `student_profiles.trainer_id` é igual ao seu próprio `id`. Tentar acessar aluno de outro trainer retorna **HTTP 404** (`Aluno não encontrado`).
Validação/Onde: `StudentProfileController::index/show/update/destroy` (`->where('trainer_id', $request->user()->id)`).

**RN-STUDENT-008**
Regra: Na edição, todos os campos são opcionais (`sometimes`/`nullable`). A senha só é alterada quando `password` é preenchido; `name`/`email` só mudam quando enviados.
Validação/Onde: `StudentProfileController::update`.

**RN-STUDENT-009 (Soft Delete)**
Regra: A exclusão de aluno é **lógica (soft delete)**: preenche `student_profiles.deleted_at` sem apagar o registro nem os dados relacionados (workouts, check-ins, anamnese etc.). O registro `users` correspondente **não é excluído** — a FK `student_profiles.user_id` usa `cascadeOnDelete`, então apagar o `User` removeria o profile em cascata.
Validação/Onde: `StudentProfile` (`use SoftDeletes`), migration `add_soft_deletes_to_student_profiles_table`, `StudentProfileController::destroy` (com comentário explicativo).

**RN-STUDENT-010 (Relacionamentos)**
Regra: `StudentProfile` possui:
- `user()` — 1:1 com `User`
- `trainer()` — pertence a `User` (via `trainer_id`)
- `workouts()` / `latestWorkout()` — treinos do aluno
- `physicalAssessments()` — avaliações físicas
- `workoutCheckins()` — check-ins de treino
- `dailyCheckins()` — check-ins diários
- `anamnesis()` — anamnese (1:1)
Onde: `app/Models/StudentProfile.php`.

**RN-STUDENT-011**
Regra: O papel `student` acessa o próprio perfil resolvendo `user->studentProfile`. Endpoints de aluno que dependem do perfil retornam **HTTP 404** (`Perfil de student não encontrado`) quando o usuário não possui `student_profiles`.
Onde: `resolveProfile()` em controllers de `Api/Student/*`.

**RN-STUDENT-012 (Peso do aluno)**
Regra: O peso **não** é um campo do cadastro do aluno. Ele é registrado em cada
avaliação física (`physical_assessments.weight`), e o "peso atual" é sempre o da
avaliação mais recente — uma única fonte da verdade, preservando o histórico e a
variação entre avaliações. A `height` permanece no cadastro (referência que muda
raramente) e a avaliação pode sobrescrevê-la pontualmente.
Onde: migration `drop_current_weight_from_student_profiles_table` (converte cada
peso já cadastrado em uma avaliação inicial antes do drop),
`StudentPhysicalAssessmentController`.

**RN-STUDENT-013 (Avaliação física)**
Regra: A avaliação física é uma **série temporal** (N registros datados por
aluno), não um instantâneo. Apenas `assessment_date` é obrigatório, mas uma
avaliação **sem nenhuma medida** é rejeitada. Os valores derivados (IMC, relação
cintura/quadril, massa gorda e massa magra) são calculados **na leitura** e nunca
gravados; `muscle_mass` é um dado digitado da balança e não se confunde com a
massa magra derivada. Cada medida é devolvida com a variação (`delta`) em
relação à avaliação imediatamente anterior.
Onde: `StudentPhysicalAssessmentController`, `PhysicalAssessmentResource`,
`app/Models/PhysicalAssessment.php`.

**RN-STUDENT-014 (Perfil do aluno)**
Regra: O aluno consulta o próprio cadastro e o histórico das suas avaliações
físicas em **somente leitura**. Nenhum dado do cadastro é editável pelo aluno —
quem responde pelos dados é o personal.
Onde: `Api/Student/ProfileController` (`show`/`physicalAssessments`),
`pages/student/Profile.jsx`.

**RN-STUDENT-015 (Upload de mídia por ambiente)**
Regra: O envio de **fotos e vídeos da anamnese** fica habilitado em
desenvolvimento e nos testes, e **desabilitado em produção** enquanto não houver
storage persistente. Motivo: o disco de produção é efêmero — o arquivo seria
aceito, apareceria na tela e sumiria no deploy seguinte, e o personal só
descobriria a perda depois.

Comportamento quando desabilitado:
- Os endpoints de upload respondem **HTTP 503** com mensagem em português; o
  bloqueio é no servidor, não apenas na interface.
- `GET .../anamnesis` devolve `uploads_enabled: false` e a mensagem, para a tela
  avisar **antes** de o personal escolher um arquivo.
- **Mídias já enviadas continuam visíveis e removíveis** — desabilitar o envio
  nunca esconde nem apaga o que existe.

Para liberar em produção assim que houver S3/R2: `ANAMNESIS_UPLOADS_ENABLED=true`
no ambiente, sem alterar código.
Onde: `config/uploads.php`, `StudentAnamnesisAttachment::uploadsEnabled()`,
`StudentAnamnesisPhotoController`/`VideoController::store`,
`components/AnamnesisSection.jsx`.

> ⚠️ Inconsistência de escopo conhecida: parte dos controllers de trainer usa o
> FK `trainer_id`, enquanto outros (check-ins, dashboard, ficha, anamnese)
> escopam o aluno via `workouts.trainer_id`. Ver **API-001** no relatório.

---

## Treinos (Workouts)

Entidade: `Workout` + `WorkoutExercise` + `WorkoutExerciseSeries` + pivot
`workout_muscle_groups`.

Origem:
- `app/Http/Controllers/Api/Trainer/WorkoutController.php`
- `app/Http/Controllers/Api/Trainer/WorkoutExerciseController.php`
- `app/Http/Controllers/Api/Student/WorkoutController.php`
- `app/Models/Workout.php`, `WorkoutExercise.php`, `WorkoutExerciseSeries.php`
- migrations `create_workouts_table`, `create_workout_exercises_table`,
  `create_workout_exercise_series_table`, `create_workout_muscle_groups_table`,
  `restructure_workout_exercises_for_series`.

**RN-WORKOUT-001**
Regra: Apenas `trainer` cria/edita/exclui treinos. `student` apenas visualiza os próprios treinos ativos.
Onde: `routes/api.php` (`workouts` sob `role:trainer`; `/student/my-workouts` e `/student/workout/{id}` sob `role:student`).

**RN-WORKOUT-002**
Regra: Ao criar treino, `student_profile_id` é obrigatório e **deve pertencer a um aluno do próprio trainer** (`Rule::exists('student_profiles','id')->where('trainer_id', ...)`). O `trainer_id` do treino é sempre o do usuário autenticado (não vem do request).
Onde: `WorkoutController::store`.

**RN-WORKOUT-003**
Regra: Campos do treino:
- `name` — obrigatório (máx. 255)
- `description` — opcional
- `start_date` — obrigatória (data)
- `end_date` — opcional, deve ser **maior ou igual** a `start_date`
- `active` — opcional (boolean), **default `true`**
Onde: `WorkoutController::store/update`, migration `create_workouts_table`.

**RN-WORKOUT-004 (Grupos musculares do treino)**
Regra: Um treino pode ser associado a vários grupos musculares (relação N:N via `workout_muscle_groups`). Cada `muscle_group_id` deve existir. O par (`workout_id`, `muscle_group_id`) é único. A associação é feita via `sync` (substitui o conjunto anterior).
Onde: `WorkoutController::store/update` (`muscleGroups()->sync(...)`), migration `create_workout_muscle_groups_table`.

**RN-WORKOUT-005 (Exercícios do treino)**
Regra: Um treino contém vários `WorkoutExercise`, cada um com:
- `exercise_id` — obrigatório, deve existir em `exercises`
- `order` — obrigatório, inteiro ≥ 1
- `notes` — opcional
Onde: `WorkoutController::EXERCISES_VALIDATION_RULES`, `syncExercises()`.

**RN-WORKOUT-006 (Séries do exercício)**
Regra: Cada `WorkoutExercise` possui várias séries (`WorkoutExerciseSeries`), cada uma com:
- `order` — obrigatório, ≥ 1
- `repetitions` — inteiro ≥ 0 (opcional)
- `weight` — numérico ≥ 0 (`decimal(6,2)`, opcional)
- `rest_time` — inteiro ≥ 0, em segundos (opcional)
- `rir` — inteiro 0–10 (opcional)
- `tempo` — string ≤ 20 (opcional)
- `cadence` — string ≤ 20 (opcional)
- `duration` — inteiro ≥ 0 (opcional)
- `notes` — opcional
Onde: `WorkoutController`/`WorkoutExerciseController` (`SERIES_VALIDATION_RULES`), model/migration `workout_exercise_series`.

**RN-WORKOUT-007 (Criação atômica)**
Regra: A criação/atualização de treino com exercícios e séries ocorre dentro de uma **transação** (`DB::transaction`). Na atualização, se `exercises` for enviado, todos os `workoutExercises` existentes são **apagados e recriados** (substituição total); se `muscle_groups` for enviado, os grupos são re-sincronizados.
Onde: `WorkoutController::store/update`.

**RN-WORKOUT-008 (Escopo de propriedade)**
Regra: Um trainer só acessa treinos com `trainer_id` igual ao seu. Caso contrário, **HTTP 404** (`Treino não encontrado`).
Onde: `WorkoutController::show/update/destroy` (`->where('trainer_id', ...)`).

**RN-WORKOUT-009 (Listagem e filtros)**
Regra: A listagem de treinos do trainer é paginada e aceita filtros:
- `student_search` — nome do aluno (like)
- `status` — `all` | `active` | `inactive` (default `all`)
- `per_page` — 1–100 (default 10)
Ordenação: `created_at desc`. Inclui contagem de exercícios (`exercises_count`).
Onde: `WorkoutController::index`.

**RN-WORKOUT-010 (Exclusão)**
Regra: A exclusão de treino é **física** (não há SoftDeletes em `Workout`). Por cascade no banco, apaga `workout_exercises`, `workout_exercise_series` e o pivot de grupos musculares. Retorna mensagem de sucesso.
Onde: `WorkoutController::destroy`, migrations com `cascadeOnDelete`.
> Nota: `workout_checkins.workout_id` também é `cascadeOnDelete` — excluir um treino apaga os check-ins de treino associados. Ver **API-004**.

**RN-WORKOUT-011 (Status ativo/inativo)**
Regra: O campo `active` controla a visibilidade para o aluno. O aluno **só vê treinos com `active = true`** e só pode registrar check-in em treino ativo.
Onde: `Student/WorkoutController::index` (`->where('active', true)`), `Student/WorkoutCheckinController::store`.

**RN-WORKOUT-012 (Visão do aluno)**
Regra: O aluno lista/visualiza apenas treinos do seu próprio `student_profile_id`. Treino de outro aluno ou inativo → **HTTP 404**.
Onde: `Student/WorkoutController::index/show`.

**RN-WORKOUT-013 (Gestão avulsa de exercícios do treino)**
Regra: Além da edição em bloco pelo `WorkoutController`, há CRUD dedicado `workout-exercises` (adicionar/editar/remover um exercício de um treino, com suas séries). Toda operação valida que o `workout_id` pertence ao trainer autenticado (`Rule::exists('workouts','id')->where('trainer_id', ...)`); acesso a registro de outro trainer → **HTTP 404**. `order` default = 1. Atualizar `series` substitui todas as séries do exercício.
Onde: `WorkoutExerciseController` (todos os métodos).

**RN-WORKOUT-014 (Ficha em PDF)**
Regra: O trainer pode gerar a ficha de treino de um aluno em PDF. O acesso é liberado **somente se o trainer possuir ao menos um treino daquele aluno** (`workouts.trainer_id`); caso contrário **HTTP 403**. A ficha inclui apenas treinos **ativos**.
Onde: `StudentWorkoutSheetController::show` (usa `barryvdh/dompdf`, view `pdf.workout-sheet`).

---

## Exercícios (Exercises)

Entidade: `Exercise` (catálogo global) + `MuscleGroup`.

Origem:
- `app/Http/Controllers/Api/Trainer/ExerciseController.php`
- `app/Http/Controllers/Api/Trainer/MuscleGroupController.php`
- `app/Models/Exercise.php`, `MuscleGroup.php`
- migrations `create_exercises_table`, `create_muscle_groups_table`
- seeders `MuscleGroupSeeder`, `ExerciseSeeder`

**RN-EXERCISE-001**
Regra: O cadastro de exercícios é acessível apenas ao papel `trainer`. O catálogo é **global** — não há coluna de proprietário; qualquer trainer vê, edita e exclui qualquer exercício.
Onde: rota `exercises` sob `role:trainer`; `ExerciseController` (sem escopo por trainer).
> Ver **API-002** e **API-003** no relatório de melhorias.

**RN-EXERCISE-002**
Regra: Campos do exercício:
- `muscle_group_id` — obrigatório, deve existir em `muscle_groups`
- `name` — obrigatório (máx. 255)
- `description` — opcional
- `equipment` — opcional (máx. 255)
- `video_url` — opcional, deve ser **URL válida**
Onde: `ExerciseController::store/update`, migration `create_exercises_table`.

**RN-EXERCISE-003 (Grupo muscular)**
Regra: Todo exercício pertence a exatamente **um** grupo muscular (`Exercise::muscleGroup`). Os grupos musculares são apenas listados (somente leitura via `GET muscle-groups`); não há CRUD de grupo muscular exposto na API — são populados por seeder.
Onde: `MuscleGroupController::index`, `MuscleGroupSeeder`, model `MuscleGroup`.

**RN-EXERCISE-004 (Listagem e filtros)**
Regra: Listagem paginada de exercícios com filtros:
- `search` — busca por nome do exercício **ou** nome do grupo muscular (like)
- `muscle_groups[]` — filtra por um ou mais `muscle_group_id` (cada um deve existir)
- `per_page` — default 10
Ordenação alfabética por `name`.
Onde: `ExerciseController::index`.

**RN-EXERCISE-005 (Uso dentro dos treinos)**
Regra: Um exercício é referenciado por `WorkoutExercise` (dentro de treinos) e por `WorkoutCheckinExercise` (histórico executado). Ambos guardam `exercise_id` com FK `cascadeOnDelete`.
Onde: models `WorkoutExercise`, `WorkoutCheckinExercise`; migrations correspondentes.

**RN-EXERCISE-006 (Exclusão)**
Regra: A exclusão de exercício é **física** (não há SoftDeletes em `Exercise`) e **não verifica uso prévio**. Por cascade no banco, excluir um exercício apaga também os `workout_exercises` e os `workout_checkin_exercises` que o referenciam — ou seja, **apaga histórico de check-ins**.
Onde: `ExerciseController::destroy`; migrations `create_workout_exercises_table` e `create_workout_checkin_exercises_table` (`cascadeOnDelete`).
> ⚠️ Risco de perda de histórico. Ver **API-002** (crítico) no relatório.

---

## Check-in de Treino (Workout Check-ins)

Entidade: `WorkoutCheckin` + `WorkoutCheckinExercise` + `WorkoutCheckinExerciseSet`.
Representa a **execução real** de um treino registrada pelo aluno.

Origem: `Api/Student/WorkoutCheckinController.php`, `Api/Trainer/WorkoutCheckinController.php`, migrations `create_workout_checkins_table`, `create_workout_checkin_exercises_table`, `create_workout_checkin_exercise_sets_table` e ajustes posteriores.

**RN-CHECKIN-001**
Regra: Somente `student` cria/edita check-in de treino, sempre para o próprio perfil. O `trainer` apenas consulta (index/show) os check-ins de treinos que criou.
Onde: rotas `/student/checkins` (role student) e `/trainer/checkins` (role trainer).

**RN-CHECKIN-002**
Regra: Ao registrar check-in, são obrigatórios `workout_id` (existente) e `performed_at` (data **≤ hoje**). O treino referenciado deve pertencer ao aluno e estar **ativo**, senão **HTTP 404** (`Treino não encontrado ou não está ativo`).
Onde: `Student/WorkoutCheckinController::store`.

**RN-CHECKIN-003 (Snapshot das séries)**
Regra: No momento do check-in, o sistema **espelha (snapshot)** as séries prescritas do treino (`WorkoutExerciseSeries`) em `WorkoutCheckinExerciseSet`, gravando os valores planejados (`planned_repetitions`, `planned_weight`, `planned_rest_time`) e preenchendo os executados (`performed_*`) informados pelo aluno por número de série (`set_number`). Apenas exercícios que pertencem ao treino são gravados (os demais são ignorados).
Onde: `Student/WorkoutCheckinController::createCheckinExercise`.

**RN-CHECKIN-004 (Atualização preserva o snapshot)**
Regra: Na atualização do check-in, apenas os valores **executados** (`performed_*`, `notes`) são alterados. O snapshot original (`planned_*` e a quantidade de séries) **nunca é recalculado** a partir do treino atual.
Onde: `Student/WorkoutCheckinController::updateCheckinExercise`.

**RN-CHECKIN-005 (Múltiplos check-ins por dia)**
Regra: A restrição de unicidade `(student_profile_id, performed_at)` **foi removida** — atualmente é permitido mais de um check-in de treino na mesma data. Ainda assim, `byDate` retorna apenas o **primeiro** encontrado.
Onde: migration `drop_unique_student_date_from_workout_checkins_table`, `Student/WorkoutCheckinController::byDate`.
> Ver **API-007** no relatório.

**RN-CHECKIN-006 (Escopo do trainer)**
Regra: O trainer só vê check-ins cujo **treino foi criado por ele** (`whereHas('workout', trainer_id)`), pois — nessas rotas — o vínculo aluno↔trainer é derivado dos treinos, não do FK `trainer_id`.
Onde: `Trainer/WorkoutCheckinController::scopeToTrainer`.

**RN-CHECKIN-007 (Evolução por exercício)**
Regra: A evolução de carga de um aluno é calculada **exclusivamente a partir do histórico executado** (`WorkoutCheckin`), nunca da configuração atual do treino. Para cada dia, o ponto do gráfico usa a série de **maior carga** (`performed_weight`); as repetições exibidas são as dessa mesma série. Só entram grupos/exercícios que possuam ao menos uma série com `performed_weight` registrado. `weight_evolution_percentage` compara o primeiro e o último ponto.
Onde: `StudentExerciseEvolutionController` (métodos `muscleGroups`, `exercises`, `show`).

---

## Check-in Diário (Daily Check-ins)

Entidade: `DailyCheckin` (avaliação diária de sono e dieta).

Origem: `Api/Student/DailyCheckinController.php`, `Api/Trainer/DailyCheckinController.php`, migration `create_daily_checkins_table`.

**RN-DAILY-001**
Regra: Somente `student` cria/edita check-in diário do próprio perfil; o `trainer` apenas consulta os de seus alunos.
Onde: rotas `/student/daily-checkins`, `/trainer/daily-checkins`.

**RN-DAILY-002**
Regra: Campos obrigatórios: `date` (≤ hoje), `sleep_rating` (0–10), `diet_rating` (0–10). Opcionais: `sleep_notes`, `diet_notes`. As notas de rating são inteiras (0–10).
Onde: `Student/DailyCheckinController::VALIDATION_RULES`, migration (`unsignedTinyInteger`).

**RN-DAILY-003 (Unicidade por dia)**
Regra: Só pode existir **um** check-in diário por aluno por data. Na criação/edição, data duplicada gera erro de validação (`Já existe um Check-in Diário cadastrado para essa data.`). Há também restrição única no banco (`unique(student_profile_id, date)`).
Onde: `Student/DailyCheckinController::store/update`, migration `create_daily_checkins_table`.

**RN-DAILY-004 (Lembrete)**
Regra: O endpoint de lembrete indica se falta o check-in diário **do dia anterior** (`expected_date = ontem`), retornando `pending = true/false`.
Onde: `Student/DailyCheckinController::reminder`.

**RN-DAILY-005 (Escopo do trainer)**
Regra: O trainer só vê check-ins diários de alunos que possuem **ao menos um treino criado por ele** (`whereHas('studentProfile.workouts', trainer_id)`).
Onde: `Trainer/DailyCheckinController::scopeToTrainer`, `Trainer/DashboardController`.

---

## Comentários do personal nos check-ins (Comments)

Entidade: `Comment` — resposta do personal ancorada em um check-in específico.
Abre o caminho de volta na consultoria: o aluno registra o check-in e o personal
comenta em cima dele; o aluno lê a conversa.

Origem: `Api/Trainer/CheckinCommentController.php`, `app/Models/Comment.php`,
`app/Http/Resources/CommentResource.php`, migration `create_comments_table`.

**RN-COMMENT-001 (Alvo polimórfico)**
Regra: Um comentário aponta para um alvo polimórfico (`commentable_type` +
`commentable_id`). Hoje os alvos são `DailyCheckin` e `WorkoutCheckin`
(`morphMany` em cada), mas o mesmo mecanismo atende novos pontos de contato
(vídeos/fotos, linha do tempo) sem novas colunas nem tabelas por tipo.
Onde: migration `create_comments_table` (`morphs('commentable')`), `Comment::commentable`,
`DailyCheckin::comments`, `WorkoutCheckin::comments`.

**RN-COMMENT-002 (Só o personal escreve)**
Regra: Apenas o `trainer` cria/edita/exclui comentários; o `student` apenas lê.
Cada comentário guarda o autor em `trainer_id`. Um trainer só comenta em check-in
de aluno **vinculado a ele** (`whereHas('studentProfile', trainer_id)`), e só
edita/exclui os **próprios** comentários (escopo por `trainer_id`); fora disso,
**HTTP 404**. O corpo (`body`) é obrigatório, máx. 2000 caracteres.
Onde: `CheckinCommentController` (`storeOnDailyCheckin`, `storeOnWorkoutCheckin`,
`update`, `destroy`), rotas sob `role:trainer` em `routes/api.php`.

**RN-COMMENT-003 (Múltiplos comentários por check-in)**
Regra: Um check-in pode ter **vários** comentários (thread), ordenados do mais
antigo para o mais recente. Eles são devolvidos embutidos no próprio check-in
(`comments` no resource, com nome do personal e data), carregados via
`with('comments.trainer')` nos endpoints de detalhe do check-in (trainer e
student) e na listagem de check-in diário do aluno.
Onde: `DailyCheckinResource`/`WorkoutCheckinResource` (`comments`),
`Trainer/DailyCheckinController::show`, `Trainer/WorkoutCheckinController::CHECKIN_RELATIONS`,
`Student/WorkoutCheckinController::CHECKIN_RELATIONS`, `Student/DailyCheckinController::index`.

**RN-COMMENT-004 (Exclusão)**
Regra: Como o vínculo com o check-in é **polimórfico** (sem FK no banco), apagar
o check-in não cascateia sozinho: os models `WorkoutCheckin`/`DailyCheckin`
removem os comentários no evento `deleting` para não deixar órfãos (relevante
porque o aluno pode excluir o check-in de treino). Já a FK `comments.trainer_id`
usa `cascadeOnDelete` — remover o usuário do personal remove seus comentários.
Onde: `WorkoutCheckin::booted`/`DailyCheckin::booted`, migration `create_comments_table`.

---

## Administração (Admin)

Origem: `Api/Admin/TrainerController.php`, `Api/Admin/StudentController.php`, `Api/Admin/DashboardController.php`.

**RN-ADMIN-001**
Regra: Somente `admin` acessa as rotas `/api/admin/*`.
Onde: `routes/api.php` (`role:admin`).

**RN-ADMIN-002**
Regra: O admin lista trainers e alunos (com filtros por nome/e-mail, paginado) e pode **ativar/desativar** cada conta alterando `is_active` (`PATCH .../{id}/status`, `is_active` obrigatório boolean). Contas desativadas não conseguem logar (**RN-AUTH-005**).
Onde: `Admin/TrainerController::updateStatus`, `Admin/StudentController::updateStatus`.

**RN-ADMIN-003**
Regra: Na listagem admin, a contagem de alunos de um trainer é o número de
`student_profiles` vinculados a ele (`trainer_id`, ignorando soft-deletados) —
que é a base cobrada pelo plano. **Mudou em 24/07/2026**: antes era
`count(distinct workouts.student_profile_id)`, o que zerava a contagem de quem
tinha aluno cadastrado sem treino montado. O "trainer" exibido para um aluno
continua derivado do `latestWorkout.trainer`.
Onde: `Admin/TrainerController::index`, `Admin/StudentController::index`.

## Planos e assinatura

➜ **As regras de monetização vivem em [`docs/regras-planos.md`](regras-planos.md).**

Lá estão a escada de planos, o trial, a contagem de vaga (**RN-PLAN-004**, citada
na RN-STUDENT-005), a regra de bloqueio e o histórico de assinatura — junto com a
distinção entre o que já está no código e o que ainda é só decisão.

Em uma linha, para quem está lendo o código: **hoje nada é bloqueado por plano.**
O limite é informativo e há teste travando esse contrato
(`Trainer\PlanTest::test_plan_does_not_block_creating_students_beyond_the_limit`).

---

## Tratamento de erros (global)

**RN-ERROR-001**
Regra: Respostas de erro para rotas `api/*` são sempre JSON. `ModelNotFoundException` → `404 {message: "Registro não encontrado"}`; rota inexistente (`NotFoundHttpException`) → `404 {message: "Rota não encontrada"}`.
Onde: `bootstrap/app.php` (`withExceptions`).

**RN-ERROR-002**
Regra: Erros de validação retornam **HTTP 422** com o formato padrão do Laravel (`{message, errors:{campo:[...]}}`).
Onde: comportamento padrão do `$request->validate(...)`.
