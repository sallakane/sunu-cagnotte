FROM php:8.3-fpm-alpine

RUN apk add --no-cache \
    bash \
    git \
    icu-dev \
    libzip-dev \
    oniguruma-dev \
    postgresql-dev \
    unzip \
    $PHPIZE_DEPS \
    && docker-php-ext-install intl opcache pdo_pgsql zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY docker/php/conf.d/app.ini /usr/local/etc/php/conf.d/zz-app.ini

CMD ["php-fpm"]

