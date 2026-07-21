# Frontend

## Tecnologias

- React
- Vite
- Material UI
- Tailwind CSS v4
- React Hook Form
- Yup
- Zustand
- Axios

---

## Estrutura

O frontend é uma SPA (Single Page Application) que consome exclusivamente a API Laravel.

Toda comunicação deve ocorrer através dos Services.

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

Nunca chamar axios diretamente dentro de páginas ou componentes.

---

## Autenticação

O projeto utiliza Laravel Sanctum SPA Authentication.

Para qualquer endpoint autenticado utilizar:

- sanctumRequest()
- withCredentials: true
- CSRF Cookie

Nunca utilizar Bearer Token.

O estado do usuário autenticado é controlado pelo Zustand através do `useAuthStore`.

---

## Estrutura de Pastas

Seguir o padrão existente.

```
src/

components/
common/
ui/

layouts/

pages/

services/

store/

routes/

utils/
```

---

## Organização de CRUDs

Novos recursos devem seguir a estrutura:

```
Resource/

Index.jsx

NewEdit.jsx

Show.jsx

utils/
    schema.js
    validators.js
    formatters.js
```

Evitar páginas muito grandes.

Separar validações e utilidades na pasta `utils`.

---

## Services

Toda chamada para API deve passar pelos Services.

Exemplo:

```
StudentsService

ExercisesService

WorkoutsService

AuthService
```

Componentes nunca devem realizar chamadas HTTP diretamente.

---

## Formulários

Todos os formulários devem utilizar:

- React Hook Form
- Yup

Validação deve ficar separada do componente.

---

## Estado Global

Utilizar Zustand apenas para estado realmente global.

Exemplos:

- usuário autenticado
- autenticação
- preferências globais

Não utilizar Zustand para estados locais de componentes.

---

## Componentes

Antes de criar um novo componente:

1. Procurar um semelhante.
2. Reutilizar componentes existentes.
3. Evitar duplicação.

Criar componentes pequenos e reutilizáveis.

---

## Interface

Utilizar Material UI como biblioteca principal.

Manter identidade visual consistente.

Evitar estilos inline.

Priorizar componentes reutilizáveis.

---

## Rotas

Toda nova rota deve seguir a estrutura existente.

Trainer:

```
/trainer/*
```

Student:

```
/student/*
```

Nunca misturar permissões entre papéis.

---

## Convenções

Sempre:

- reutilizar componentes
- reutilizar Services
- manter nomenclatura consistente
- seguir padrões existentes

Nunca:

- chamar axios diretamente
- duplicar código
- alterar estrutura sem necessidade
- criar lógica de negócio dentro de componentes

---

## Antes de concluir

Verificar:

- npm run lint
- erros de console
- componentes reutilizados quando possível
- organização da pasta do recurso
- consistência com o restante do projeto

Ao finalizar informar:

- arquivos alterados
- motivo das alterações
- possíveis impactos
