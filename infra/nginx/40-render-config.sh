#!/bin/sh
set -eu

template_dir="/etc/nginx/templates"
output_file="/etc/nginx/conf.d/default.conf"

export NGINX_SERVER_NAME="${NGINX_SERVER_NAME:-_}"
export NGINX_CANONICAL_HOST="${NGINX_CANONICAL_HOST:-sunu-cagnotte.org}"
export SSL_CERT_PATH="${SSL_CERT_PATH:-/etc/nginx/certs/fullchain.pem}"
export SSL_CERT_KEY_PATH="${SSL_CERT_KEY_PATH:-/etc/nginx/certs/privkey.pem}"

if [ "${ENABLE_TLS:-0}" = "1" ]; then
    if [ ! -f "${SSL_CERT_PATH}" ]; then
        echo "TLS active mais certificat introuvable: ${SSL_CERT_PATH}" >&2
        exit 1
    fi

    if [ ! -f "${SSL_CERT_KEY_PATH}" ]; then
        echo "TLS actif mais cle privee introuvable: ${SSL_CERT_KEY_PATH}" >&2
        exit 1
    fi

    envsubst '${NGINX_SERVER_NAME} ${NGINX_CANONICAL_HOST} ${SSL_CERT_PATH} ${SSL_CERT_KEY_PATH}' \
        < "${template_dir}/prod-https.conf.template" \
        > "${output_file}"

    exit 0
fi

envsubst '${NGINX_SERVER_NAME} ${NGINX_CANONICAL_HOST}' \
    < "${template_dir}/prod-http.conf.template" \
    > "${output_file}"
