#!/bin/sh
set -eu

mkdir -p \
    /app/var/cache/prod/doctrine/orm/Proxies \
    /app/var/log \
    /app/public/uploads/fundraisers

# Rebuild route/container cache on each start so volume-mounted var/ stays in sync
php /app/bin/console cache:warmup --env=prod --no-debug 2>/dev/null || true

chown -R www-data:www-data /app/var /app/public/uploads
chmod -R u+rwX,g+rwX /app/var /app/public/uploads

exec "$@"
