# Arquitetura

## Visão Geral

O projeto G6 é composto por dois sistemas independentes:

- backend/ (Laravel 11)
- frontend/ (React + Vite)

A comunicação ocorre exclusivamente através da API REST.

```
React
     ↓
Services
     ↓
sanctumRequest
     ↓
Laravel API
     ↓
MySQL/SQLite
```

---

## Papéis

Existem apenas dois papéis:

- trainer
- student

Todo recurso deve respeitar essa separação.

---

## Backend

Estrutura baseada em Controllers.

```
Api
├── AuthController
├── Trainer
│   ├── StudentsController
│   ├── ExercisesController
│   └── WorkoutsController
└── Student
    └── WorkoutController
```

---

## Frontend

Fluxo padrão:

```
Page
 ↓
Service
 ↓
sanctumRequest
 ↓
Laravel API
```

Nunca chamar axios diretamente da página.

---

## CRUD

Cada recurso deve possuir:

```
Resource/

Index.jsx

NewEdit.jsx

Show.jsx

utils/
```

---

## Objetivo

Manter a arquitetura consistente.

Evitar criar padrões diferentes para recursos semelhantes.
