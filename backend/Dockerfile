# =============================================================================
# G6 - Backend (Laravel) — imagem de produção para deploy no Render (Docker)
#
# PHP 8.3 + Apache. Multi-stage:
#   1) vendor  -> instala dependências PHP com Composer (sem dev)
#   2) runtime -> imagem final servindo public/ via Apache
#
# NÃO altera nenhuma regra de negócio. Apenas infraestrutura.
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: dependências (Composer)
# -----------------------------------------------------------------------------
FROM composer:2 AS vendor

WORKDIR /app

# Copia apenas os manifests primeiro para aproveitar cache de layers.
COPY composer.json composer.lock ./

# Instala apenas dependências de produção.
# --no-scripts evita rodar "artisan" nesta etapa (sem app completo/.env ainda).
RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --no-progress \
    --no-scripts \
    --optimize-autoloader

# -----------------------------------------------------------------------------
# Stage 2: runtime (PHP 8.3 + Apache)
# -----------------------------------------------------------------------------
FROM php:8.3-apache AS runtime

# Dependências de sistema para as extensões PHP usadas pelo projeto
# (gd/dom -> dompdf, zip, intl, pdo_mysql, etc).
RUN apt-get update && apt-get install -y --no-install-recommends \
        libpng-dev \
        libjpeg-dev \
        libfreetype6-dev \
        libzip-dev \
        libicu-dev \
        libonig-dev \
        libxml2-dev \
        unzip \
        git \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
        pdo_mysql \
        mbstring \
        bcmath \
        exif \
        pcntl \
        gd \
        zip \
        intl \
        opcache \
    && apt-get purge -y --auto-remove \
    && rm -rf /var/lib/apt/lists/*

# Configuração de produção do OPcache.
COPY docker/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

# php.ini de produção (base recomendada pela imagem oficial).
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Apache: habilita rewrite/headers e aponta DocumentRoot para public/.
COPY docker/vhost.conf /etc/apache2/sites-available/000-default.conf
RUN a2enmod rewrite headers

WORKDIR /var/www/html

# Copia o código da aplicação.
COPY . /var/www/html

# Copia o vendor já instalado no stage anterior.
COPY --from=vendor /app/vendor /var/www/html/vendor

# Composer disponível no runtime (útil para dump-autoload e depuração).
COPY --from=vendor /usr/bin/composer /usr/bin/composer

# Regenera o autoloader otimizado agora com todo o código presente.
RUN composer dump-autoload --no-dev --optimize --classmap-authoritative

# Permissões: Apache roda como www-data e precisa escrever em storage/ e cache.
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R ug+rwX /var/www/html/storage /var/www/html/bootstrap/cache

# Entrypoint: prepara PORT, roda optimize/storage:link/migrations e sobe Apache.
COPY docker/entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint

# O Render injeta a porta via variável PORT (fallback 8080 em local).
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["entrypoint"]
CMD ["apache2-foreground"]
