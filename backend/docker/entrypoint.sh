#!/usr/bin/env bash
# =============================================================================
# Entrypoint do container Laravel para o Render.
#
# Responsabilidades (apenas infraestrutura — nada de regra de negócio):
#   1. Ajustar o Apache para escutar na porta injetada pelo Render (PORT).
#   2. Rodar "php artisan optimize" (cache de config/eventos/rotas/views).
#   3. Criar o link simbólico de storage (php artisan storage:link).
#   4. Rodar migrations sob demanda (RUN_MIGRATIONS=true).
#   5. Subir o Apache em foreground.
# =============================================================================
set -euo pipefail

# --- 1. Porta -----------------------------------------------------------------
# O Render define a variável PORT. Em local usamos 8080 como fallback.
: "${PORT:=8080}"
echo "==> Configurando Apache para escutar na porta ${PORT}"
sed -i "s/^Listen 80$/Listen ${PORT}/" /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*:80>/<VirtualHost *:${PORT}>/" /etc/apache2/sites-available/000-default.conf

cd /var/www/html

# Garante que o APP_KEY exista (evita erro de criptografia caso não seja setado).
if [ -z "${APP_KEY:-}" ]; then
    echo "==> AVISO: APP_KEY não definido no ambiente. Gerando uma chave temporária."
    echo "    Defina APP_KEY nas variáveis de ambiente do Render para persistir sessões."
    php artisan key:generate --force || true
fi

# --- 2. Cache de otimização (php artisan optimize) ----------------------------
# Limpa caches antigos gerados em outra build/porta.
php artisan optimize:clear || true

echo "==> Otimizando aplicação (config/eventos/views/rotas)"
php artisan config:cache
php artisan event:cache
php artisan view:cache

# route:cache é tolerante a falha: a rota "/" em routes/web.php usa Closure,
# que não é serializável. Nesse caso mantemos as rotas sem cache (sem impacto
# funcional), em vez de derrubar o boot do container.
if php artisan route:cache 2>/dev/null; then
    echo "==> Rotas cacheadas."
else
    echo "==> route:cache ignorado (há rota com Closure em routes/web.php)."
    php artisan route:clear || true
fi

# --- 3. storage:link ----------------------------------------------------------
# Necessário para servir arquivos do disco público (anamnesis-photos/videos).
echo "==> Criando link simbólico de storage"
php artisan storage:link || true

# --- 4. Migrations (opcional) -------------------------------------------------
# Não roda por padrão para evitar alterar o banco sem intenção.
# Defina RUN_MIGRATIONS=true nas env vars do Render para migrar no deploy.
if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    echo "==> Executando migrations (RUN_MIGRATIONS=true)"
    php artisan migrate --force
fi

echo "==> Inicialização concluída. Subindo servidor."

# --- 5. Sobe o processo principal (apache2-foreground) ------------------------
exec "$@"
