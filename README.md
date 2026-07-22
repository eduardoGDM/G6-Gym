# G6 — Gym Management System

Sistema de gerenciamento de academia.

- **Backend:** Laravel 13 + Sanctum (SPA Cookie Authentication) + MySQL
- **Frontend:** React + Vite + Tailwind CSS

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

## Deploy em produção (checklist)

### Backend

1. **Variáveis de ambiente** (`.env`) — ver bloco de produção no topo de
   `backend/.env.example`. No mínimo:
   - `APP_ENV=production` e `APP_DEBUG=false`
   - `APP_URL`, `FRONTEND_URL` (ou `CORS_ALLOWED_ORIGINS`) com os domínios reais
   - `SESSION_DOMAIN`, `SESSION_SECURE_COOKIE=true` (HTTPS) e
     `SANCTUM_STATEFUL_DOMAINS` com o(s) domínio(s) do frontend
   - `DB_*` com as credenciais reais
2. **Dependências e chave:**
   ```bash
   composer install --no-dev --optimize-autoloader
   php artisan key:generate   # apenas se ainda não houver APP_KEY
   php artisan migrate --force
   ```
3. **Storage dos uploads** (fotos/vídeos de anamnese):
   ```bash
   php artisan storage:link
   ```
4. **Caches de produção** (rodar a cada deploy, após alterar `.env`/rotas):
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```
   > Para reverter um cache travado: `php artisan optimize:clear`.
5. **Fila** — `QUEUE_CONNECTION=database` exige um worker ativo
   (`php artisan queue:work`) via supervisor/cron. Hoje só o envio de e-mails
   usaria a fila; se `MAIL_MAILER=log`, o worker é opcional no MVP.
6. **Document root** do servidor web deve apontar para `backend/public`.
7. **Swagger** (`/api/documentation`) responde **404** automaticamente quando
   `APP_ENV=production`.

### Frontend

```bash
cd frontend
# .env.production com VITE_API_URL apontando para a API pública
npm ci
npm run build          # gera dist/
```

Sirva o conteúdo de `frontend/dist/` como site estático (ou via CDN). Garanta
que a origem do frontend esteja listada em `CORS_ALLOWED_ORIGINS` /
`SANCTUM_STATEFUL_DOMAINS` do backend.

---

## Documentação

- `docs/architecture.md`
- `docs/backend.md`
- `docs/frontend.md`
