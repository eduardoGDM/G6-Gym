# CLAUDE.md

# G6 - Gym Management System

## Projeto

Sistema de gerenciamento de academia composto por:

- Backend: Laravel 11
- Frontend: React + Vite

Existem dois papéis:

- trainer
- student

Toda implementação deve respeitar essa separação.

---

# Stack

Backend

- Laravel 11
- Sanctum (SPA Cookie Authentication)
- SQLite (desenvolvimento)
- PHPUnit

Frontend

- React
- Vite
- Material UI
- Tailwind CSS v4
- React Hook Form
- Yup
- Zustand
- Axios

---

# Regras importantes

## Autenticação

Este projeto usa **Laravel Sanctum SPA Authentication**.

NUNCA utilizar Bearer Token.

Sempre utilizar:

- sanctumRequest()
- withCredentials: true
- CSRF Cookie

Não chamar apiClient diretamente para endpoints autenticados.

---

## Arquitetura Backend

Seguir a arquitetura existente.

Controllers ficam separados por papel:

- Api/Trainer
- Api/Student

Novos endpoints devem seguir exatamente o padrão existente.

Não criar Services, Repositories ou FormRequests novos sem solicitação explícita.

Modelos permanecem em inglês.

Mensagens da API ficam em português.

---

## Arquitetura Frontend

Sempre seguir o padrão existente.

Fluxo recomendado:

Page
→ Service
→ sanctumRequest
→ API

Nunca acessar axios diretamente dentro de componentes.

Para novos CRUDs utilizar a estrutura:

```
Resource/
    Index.jsx
    NewEdit.jsx
    Show.jsx
    utils/
```

Formulários utilizam:

- React Hook Form
- Yup

---

## Antes de alterar código

Sempre:

1. Ler arquivos semelhantes.
2. Reutilizar componentes existentes.
3. Manter o padrão do projeto.
4. Evitar duplicação.

Se existir mais de uma forma de implementar, explicar as opções antes de modificar.

---

## Antes de responder

Sempre informar:

- arquivos alterados
- motivo das alterações
- possíveis impactos

Não remover funcionalidades existentes sem explicar.

---

## Fluxo de trabalho

Quando receber uma tarefa:

1. Entender o problema.
2. Procurar implementação semelhante.
3. Explicar o plano.
4. Esperar aprovação antes de alterar muitos arquivos.

---

## Comandos úteis

Backend

```bash
php artisan serve
php artisan test
```

Frontend

```bash
npm run dev
npm run build
npm run lint
```

---

## Documentação

Consultar quando necessário:

docs/architecture.md

docs/backend.md

docs/frontend.md

docs/design-cards.md — linguagem visual dos cards e painéis. Consultar sempre
que criar ou refatorar tela.
