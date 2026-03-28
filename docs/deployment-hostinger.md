# Deployment Hostinger VPS

## Objectif

Deployer `Sunu Cagnotte` sur un VPS Hostinger en partant d'un clone GitHub du monorepo.

Le socle de production prepare dans ce repo repose sur :

- `docker-compose.prod.yml`
- `backend/Dockerfile.prod`
- `infra/nginx/Dockerfile.prod`
- `infra/nginx/prod-http.conf.template`
- `infra/nginx/prod-https.conf.template`

## Branches recommandees

- `main` : branche de production, toujours deployable
- `develop` : integration avant production
- `feature/*` : nouvelles fonctionnalites
- `hotfix/*` : corrections urgentes depuis `main`

## Flux Git recommande

### Depuis le poste local

```bash
git checkout -b develop
git checkout -b feature/nom-de-la-feature
git add .
git commit -m "feat: description"
git push -u origin feature/nom-de-la-feature
```

Ouvrir ensuite une Pull Request vers `develop`, puis une PR `develop -> main` pour la mise en production.

### Sur le VPS

Le VPS doit seulement suivre `main`.

```bash
cd /var/www/sunu-cagnotte
git fetch origin
git checkout main
git pull --ff-only origin main
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec php php bin/console doctrine:migrations:migrate --no-interaction
docker compose -f docker-compose.prod.yml exec php php bin/console lexik:jwt:generate-keypair --skip-if-exists
docker compose -f docker-compose.prod.yml exec php php bin/console cache:clear
```

## Preparation du VPS Hostinger

### 1. Installer les outils

```bash
apt update && apt upgrade -y
apt install -y git curl ca-certificates
```

Installer ensuite Docker Engine et le plugin Docker Compose.

### 2. Cloner le projet

```bash
mkdir -p /var/www
cd /var/www
git clone <repo-github> sunu-cagnotte
cd sunu-cagnotte
```

### 3. Preparer le fichier `.env`

Ne jamais versionner ce fichier. Partir de `.env.production.example` :

```bash
cp .env.production.example .env
```

Variables minimales a renseigner :

- `APP_ENV=prod`
- `APP_SECRET`
- `APP_BASE_URL=https://sunu-cagnotte.org`
- `FRONTEND_BASE_URL=https://sunu-cagnotte.org`
- `NGINX_SERVER_NAME="sunu-cagnotte.org www.sunu-cagnotte.org"`
- `NGINX_CANONICAL_HOST=sunu-cagnotte.org`
- `DATABASE_NAME`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `MAILER_DSN`
- `MAIL_FROM_ADDRESS=no-reply@sunu-cagnotte.org`
- `MAIL_FROM_NAME="Sunu Cagnotte"`
- `CONTACT_RECIPIENT=ndiageze@gmail.com`
- `JWT_PASSPHRASE`
- `PAYDUNYA_MODE=live`
- `PAYDUNYA_MASTER_KEY`
- `PAYDUNYA_PRIVATE_KEY`
- `PAYDUNYA_PUBLIC_KEY`
- `PAYDUNYA_TOKEN`
- `PAYDUNYA_STORE_NAME="Sunu Cagnotte"`
- `PAYDUNYA_STORE_TAGLINE`
- `VITE_API_BASE_URL=/api`
- `VITE_APP_NAME="Sunu Cagnotte"`

## Premiere mise en ligne

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec php php bin/console doctrine:migrations:migrate --no-interaction
docker compose -f docker-compose.prod.yml exec php php bin/console lexik:jwt:generate-keypair --skip-if-exists
docker compose -f docker-compose.prod.yml exec php php bin/console app:create-admin ndiageze@gmail.com Admin123! Admin Local +221700000000
```

## HTTPS

La stack de production peut maintenant tourner dans deux modes :

- `ENABLE_TLS=0` : HTTP simple sur le port `80`
- `ENABLE_TLS=1` : redirection `HTTP -> HTTPS` et ecoute TLS sur `443`

### Option recommandee : certificats Let's Encrypt sur le VPS

1. Installer Certbot sur le VPS :

```bash
apt update
apt install -y certbot
```

2. Ouvrir les ports `80` et `443` dans le firewall du VPS.

3. Arreter temporairement le proxy qui occupe deja le port `80` :

```bash
docker compose -f docker-compose.prod.yml stop proxy
```

4. Generer le certificat :

```bash
certbot certonly --standalone -d sunu-cagnotte.org -d www.sunu-cagnotte.org
```

5. Mettre a jour `.env` :

```bash
ENABLE_TLS=1
NGINX_SERVER_NAME="sunu-cagnotte.org www.sunu-cagnotte.org"
NGINX_CANONICAL_HOST=sunu-cagnotte.org
SSL_CERTS_HOST_PATH=/etc/letsencrypt
SSL_CERT_PATH=/etc/nginx/certs/live/sunu-cagnotte.org/fullchain.pem
SSL_CERT_KEY_PATH=/etc/nginx/certs/live/sunu-cagnotte.org/privkey.pem
APP_BASE_URL=https://sunu-cagnotte.org
FRONTEND_BASE_URL=https://sunu-cagnotte.org
VITE_SITE_URL=https://sunu-cagnotte.org
```

Avec cette configuration, les 4 variantes suivantes redirigent vers `https://sunu-cagnotte.org` :

- `http://sunu-cagnotte.org`
- `http://www.sunu-cagnotte.org`
- `https://www.sunu-cagnotte.org`
- `https://sunu-cagnotte.org`

6. Redemarrer puis rebuild le proxy :

```bash
docker compose -f docker-compose.prod.yml up -d --build proxy
```

7. Verifier :

```bash
docker compose -f docker-compose.prod.yml logs --tail=100 proxy
curl -I http://sunu-cagnotte.org
curl -I https://sunu-cagnotte.org
```

Pour les renouvellements Let's Encrypt, il faudra recharger le proxy apres le renouvellement pour que Nginx relise les nouveaux fichiers de certificat :

```bash
docker compose -f docker-compose.prod.yml exec proxy nginx -s reload
```

### Option simple : certificats copies dans le repo sur le VPS

Si tu ne veux pas monter `/etc/letsencrypt` dans Docker, tu peux aussi deposer les fichiers sur le VPS :

```bash
mkdir -p infra/nginx/certs
cp /etc/letsencrypt/live/sunu-cagnotte.org/fullchain.pem infra/nginx/certs/fullchain.pem
cp /etc/letsencrypt/live/sunu-cagnotte.org/privkey.pem infra/nginx/certs/privkey.pem
chmod 600 infra/nginx/certs/privkey.pem
```

Puis garder :

```bash
ENABLE_TLS=1
NGINX_CANONICAL_HOST=sunu-cagnotte.org
SSL_CERTS_HOST_PATH=./infra/nginx/certs
SSL_CERT_PATH=/etc/nginx/certs/fullchain.pem
SSL_CERT_KEY_PATH=/etc/nginx/certs/privkey.pem
```

Attention : avec cette option, le renouvellement Let's Encrypt ne sera pas automatiquement pris en compte tant que les fichiers copies ne sont pas resynchronises puis que le proxy n est pas relance.

## Protection temporaire par mot de passe HTTP

La stack de production supporte une protection `Basic Auth` au niveau Nginx.

Le front envoie le JWT dans l'en-tete standard `Authorization: Bearer ...` et conserve aussi `X-Auth-Token` pour compatibilite.

Creer le fichier de mot de passe sur le VPS :

```bash
cd /var/www/sunu-cagnotte
printf "admin:$(openssl passwd -apr1 'CHANGE_ME_MAINTENANT')\n" > infra/nginx/.htpasswd
chmod 600 infra/nginx/.htpasswd
```

Puis rebuild le proxy :

```bash
docker compose -f docker-compose.prod.yml up -d --build proxy
```

Pour retirer plus tard la protection, supprimer le volume `.htpasswd` dans `docker-compose.prod.yml`, retirer `auth_basic` des templates `infra/nginx/prod-http.conf.template` et `infra/nginx/prod-https.conf.template`, puis rebuild le proxy.

## Points sensibles avant push GitHub

- ne pas commit `backend/config/jwt/private.pem`
- ne pas commit `.env`
- ne pas commit `backend/var/`
- ne pas commit `frontend/dist/`
- ne pas commit les uploads reels

## Commandes utiles

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml logs -f php
docker compose -f docker-compose.prod.yml logs -f proxy
docker compose -f docker-compose.prod.yml logs -f db
```
