# Backend

## Framework

Laravel 11

---

## Autenticação

Sanctum SPA Authentication.

Não utilizar Bearer Token.

Fluxo:

```
GET /sanctum/csrf-cookie

↓

POST /login

↓

Sessão autenticada

↓

Requisições autenticadas
```

---

## Estrutura

```
app/

Http/
Controllers/
Requests/

Models/

Middleware/

routes/

api.php
```

---

## Controllers

Controllers devem:

- validar dados
- chamar Eloquent
- retornar JSON

Seguir o padrão existente.

Não criar Service Layer sem solicitação.

---

## Models

Models permanecem em inglês.

Exemplo:

User

StudentProfile

Exercise

Workout

WorkoutExercise

MuscleGroup

TrainingMethod

PhysicalAssessment

---

## Rotas

Todas as rotas autenticadas utilizam:

```
auth:sanctum
```

Depois são separadas por:

```
role:trainer

role:student
```

---

## Respostas

Sempre retornar JSON.

Mensagens em português.

Seguir o padrão existente.

---

## Seeder

Seeder principal:

```
SuperSeeder
```

Usuários padrão:

```
trainer@teste.com

student@teste.com
```

Senha:

```
123456
```

---

## Testes

Executar antes de concluir alterações:

```
php artisan test
```

---

## Regras

Nunca:

- quebrar autenticação
- alterar middleware
- modificar rotas existentes sem necessidade

Sempre:

- reutilizar código
- seguir padrão existente
- manter nomenclatura consistente
