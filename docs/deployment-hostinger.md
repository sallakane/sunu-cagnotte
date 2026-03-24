# Deployment Hostinger VPS

## Objectif

Deployer `Sunu Cagnotte` sur un VPS Hostinger en partant d'un clone GitHub du monorepo.

Le socle de production prepare dans ce repo repose sur :

- `docker-compose.prod.yml`
- `backend/Dockerfile.prod`
- `infra/nginx/Dockerfile.prod`
- `infra/nginx/prod.conf`

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
- `DATABASE_NAME`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `MAILER_DSN`
- `MAIL_FROM_ADDRESS=no-reply@sunu-cagnotte.org`
- `MAIL_FROM_NAME="Sunu Cagnotte"`
- `CONTACT_RECIPIENT=contact@sunu-cagnotte.org`
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
docker compose -f docker-compose.prod.yml exec php php bin/console app:create-admin admin@sunu-cagnotte.org Admin123! Admin Local +221700000000
```

## HTTPS

Le fichier Nginx de production prepare ici sert la stack en HTTP sur le port `80`.

Pour passer en production publique, il faut ajouter une terminaison TLS :

- soit avec un Nginx/Certbot sur le VPS
- soit avec un reverse proxy TLS en amont
- soit avec un proxy gere par le fournisseur

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
