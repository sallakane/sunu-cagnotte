#!/bin/sh
set -eu

mkdir -p \
    /app/var/cache/prod/doctrine/orm/Proxies \
    /app/var/log \
    /app/public/uploads/fundraisers

chown -R www-data:www-data /app/var /app/public/uploads
chmod -R u+rwX,g+rwX /app/var /app/public/uploads

exec "$@"
