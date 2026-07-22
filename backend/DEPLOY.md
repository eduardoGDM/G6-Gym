# Deploy do Backend (Laravel) no Render com Docker

Este guia cobre o deploy do backend **G6Fit** (Laravel + Sanctum) no
[Render](https://render.com) usando **Docker**, com **MySQL externo**.

> Nenhuma regra de negócio foi alterada. Os arquivos abaixo são apenas
> infraestrutura de deploy:
>
> | Arquivo | Função |
> |---|---|
> | `backend/Dockerfile` | Imagem PHP 8.3 + Apache (multi-stage, otimizada) |
> | `backend/.dockerignore` | Exclui vendor/node_modules/.env da imagem |
> | `backend/docker/entrypoint.sh` | `optimize`, `storage:link`, migrations, PORT |
> | `backend/docker/vhost.conf` | Apache servindo `public/` |
> | `backend/docker/opcache.ini` | OPcache de produção |
> | `render.yaml` | Blueprint do Render (na raiz do repositório) |
>
> Ajuste de infra aplicado em `bootstrap/app.php`: `trustProxies(at: '*')`,
> necessário para o Sanctum emitir cookies seguros por trás do proxy TLS do Render.

---

## 1. Pré-requisitos

- Repositório no GitHub/GitLab.
- Um **MySQL externo** acessível pela internet (PlanetScale, Railway,
  Aiven, AWS RDS, etc). O Render **não** oferece MySQL gerenciado.
- Domínio(s) do frontend para configurar CORS/Sanctum.

---

## 2. Como fazer o deploy no Render

### Opção A — Blueprint (recomendado, usa `render.yaml`)

1. Faça `push` do repositório.
2. No Render: **New → Blueprint** e selecione o repositório.
3. O Render lê o `render.yaml` e cria o serviço web `g6-backend`.
4. Preencha as variáveis marcadas como *secret* (ver seção 3).
5. **Create** → o Render builda o `Dockerfile` e publica.

### Opção B — Web Service manual

1. **New → Web Service** → conecte o repositório.
2. **Runtime:** Docker.
3. **Dockerfile Path:** `./backend/Dockerfile`
4. **Docker Context / Root Directory:** `backend`
5. **Health Check Path:** `/up`
6. Adicione as variáveis de ambiente (seção 3) → **Create Web Service**.

> A porta é automática: o Render injeta `PORT`, e o `entrypoint.sh` configura
> o Apache para escutar nessa porta.

---

## 3. Como configurar as variáveis de ambiente

Defina no painel do Render (**Environment**) ou via `render.yaml`.

### Obrigatórias

| Variável | Exemplo | Observação |
|---|---|---|
| `APP_KEY` | `base64:...` | Gere localmente: `php artisan key:generate --show` |
| `APP_ENV` | `production` | |
| `APP_DEBUG` | `false` | **Nunca** `true` em produção |
| `APP_URL` | `https://g6-backend.onrender.com` | URL pública da API |
| `DB_CONNECTION` | `mysql` | Força MySQL (o default do Laravel é sqlite) |
| `DB_HOST` | `mysql.exemplo.com` | Host do MySQL externo |
| `DB_PORT` | `3306` | |
| `DB_DATABASE` | `gym` | |
| `DB_USERNAME` | `usuario` | |
| `DB_PASSWORD` | `••••••` | |

### Sanctum SPA / Sessão (frontend em HTTPS)

| Variável | Exemplo |
|---|---|
| `SESSION_DRIVER` | `cookie` |
| `SESSION_SECURE_COOKIE` | `true` |
| `SESSION_DOMAIN` | `.seu-dominio.com` (vazio se usar só subdomínio onrender) |
| `SANCTUM_STATEFUL_DOMAINS` | `app.seu-dominio.com` (frontend, **sem** protocolo) |
| `FRONTEND_URL` | `https://app.seu-dominio.com` |
| `CORS_ALLOWED_ORIGINS` | `https://app.seu-dominio.com` (opcional; não use `*`) |

### Cache / Fila / Deploy

| Variável | Valor |
|---|---|
| `CACHE_STORE` | `database` |
| `QUEUE_CONNECTION` | `database` |
| `RUN_MIGRATIONS` | `false` (ver seção 4) |

> **APP_KEY:** se não for definida, o container gera uma chave temporária a
> cada boot (as sessões não persistem entre deploys). Sempre defina uma fixa.

---

## 4. Como executar as migrations

Como as migrations alteram o banco, elas **não** rodam automaticamente por padrão.

### Opção A — Automática no deploy

Defina no Render:

```
RUN_MIGRATIONS=true
```

O `entrypoint.sh` executará `php artisan migrate --force` a cada boot.

### Opção B — Manual (recomendada para a primeira carga)

No Render, abra **Shell** do serviço e rode:

```bash
php artisan migrate --force
# Se houver seeders de dados essenciais:
php artisan db:seed --force
```

> Use `--force` porque o ambiente é `production`.

---

## 5. Como configurar queues (futuramente)

A fila já usa o driver `database` (`QUEUE_CONNECTION=database`), então as tabelas
`jobs`/`failed_jobs` são criadas pelas migrations. Para processá-las:

1. No Render: **New → Background Worker**, mesmo repositório/Docker.
2. **Dockerfile Path:** `./backend/Dockerfile`, **Context:** `backend`.
3. Sobrescreva o comando de start (**Docker Command**) para:

   ```bash
   php artisan queue:work --tries=3 --timeout=90
   ```

4. Use **as mesmas variáveis de ambiente** do serviço web (mesmo banco).

> Alternativa com Redis: defina `QUEUE_CONNECTION=redis` + variáveis `REDIS_*`
> apontando para um Redis externo (o Render oferece Key Value/Redis gerenciado).

---

## 6. Como configurar cron jobs (futuramente)

O Laravel Scheduler (`routes/console.php`) precisa de um gatilho a cada minuto.

### Opção A — Cron Job do Render

1. **New → Cron Job**, mesmo repositório/Docker.
2. **Schedule:** `* * * * *` (a cada minuto).
3. **Command:**

   ```bash
   php artisan schedule:run
   ```

4. Use as mesmas variáveis de ambiente do serviço web.

### Opção B — Worker com `schedule:work`

Alternativamente, rode um Background Worker com:

```bash
php artisan schedule:work
```

---

## 7. Verificação pós-deploy

- Health check: `GET https://<sua-api>/up` deve responder `200`.
- Raiz: `GET /` retorna a versão do Laravel.
- Logs do Apache/Laravel aparecem no painel **Logs** do Render.

---

## 8. Notas técnicas

- **PHP 8.3 + Apache** (`php:8.3-apache`), `mod_rewrite` habilitado,
  DocumentRoot em `public/`.
- **Extensões PHP:** `pdo_mysql`, `mbstring`, `bcmath`, `exif`, `pcntl`,
  `gd` (dompdf), `zip`, `intl`, `opcache`.
- **`php artisan optimize`** roda no boot. Como a rota `/` em `routes/web.php`
  usa Closure (não serializável), o `route:cache` é tolerante a falha e, nesse
  caso, as rotas ficam sem cache — sem impacto funcional.
- **`storage:link`** roda no boot para servir arquivos do disco público
  (`anamnesis-photos` / `anamnesis-videos`).
- **SQLite não é usado** — `DB_CONNECTION=mysql` é forçado via env.
- Arquivos enviados (`storage/app/public`) ficam no **disco efêmero** do
  container e são perdidos em cada deploy. Para persistência, use um **Persistent
  Disk** do Render montado em `/var/www/html/storage/app/public` ou o driver S3
  (`FILESYSTEM_DISK=s3` + variáveis `AWS_*`).
