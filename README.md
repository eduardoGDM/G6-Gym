# G6 — Gym Management System

Sistema de gerenciamento de academia.

- **Backend:** Laravel 11 + Sanctum (SPA Cookie Authentication)
- **Frontend:** React + Vite

Papéis: `trainer`, `student` (e `admin`).

---

## Pré-requisitos

- PHP 8.2+ e Composer
- Node.js 18+ e npm
- MySQL (ou ajuste `DB_CONNECTION` no backend)

---

## Configuração do ambiente

Nenhum arquivo `.env` real é versionado. Cada desenvolvedor cria os seus a
partir dos arquivos `.env.example`.

### Backend

```bash
cd backend

# 1. Cria o .env a partir do exemplo
cp .env.example .env          # Windows (PowerShell): Copy-Item .env.example .env

# 2. Instala dependências
composer install

# 3. Gera a APP_KEY (fica vazia no .env.example)
php artisan key:generate

# 4. Ajuste as credenciais de banco no .env (DB_DATABASE, DB_USERNAME, DB_PASSWORD)
#    e rode as migrations
php artisan migrate

# 5. Sobe o servidor
php artisan serve
```

> **Sanctum SPA:** confira `SANCTUM_STATEFUL_DOMAINS` e `SESSION_DOMAIN` no `.env`.
> Em produção use `SESSION_SECURE_COOKIE=true` (HTTPS).

### Frontend

```bash
cd frontend

# 1. Cria o .env de desenvolvimento a partir do exemplo (opcional:
#    há fallback para http://localhost:8000 se o arquivo não existir)
cp .env.example .env.development   # Windows: Copy-Item .env.example .env.development

# Para produção
cp .env.example .env.production

# 2. Instala dependências e sobe o dev server
npm install
npm run dev
```

Variáveis disponíveis (prefixo obrigatório `VITE_`):

| Variável              | Descrição                                   | Exemplo                 |
| --------------------- | ------------------------------------------- | ----------------------- |
| `VITE_API_URL`        | Origem do backend (com ou sem `/api`)       | `http://localhost:8000` |
| `VITE_REQUEST_TIMEOUT`| Timeout das requisições HTTP (ms)           | `30000`                 |

---

## Versionamento de ambiente

- Somente `backend/.env.example` e `frontend/.env.example` são versionados.
- Todos os demais `.env*` são ignorados pelo Git (ver `.gitignore`).
- **Nunca** commite segredos, chaves (`APP_KEY`) ou credenciais reais.

---

## Documentação

- `docs/architecture.md`
- `docs/backend.md`
- `docs/frontend.md`
