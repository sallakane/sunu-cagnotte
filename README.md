# Sunu Cagnotte

Plateforme de cagnottes solidaires pour le Senegal, concue comme un monorepo `Symfony + React + PostgreSQL`, avec paiement `PayDunya`, emails transactionnels, espace createur, moderation admin et parcours public.

## Etat actuel du projet

Le socle en place couvre deja :

- inscription et connexion JWT des porteurs de cagnotte ;
- mot de passe oublie avec email de reinitialisation ;
- creation, edition, sauvegarde brouillon et soumission a validation ;
- upload d image de couverture pour les cagnottes ;
- moderation admin avec approbation ou refus ;
- liste publique et page detail des cagnottes publiees ;
- contribution invitee sans compte avec parcours de paiement PayDunya ;
- pages institutionnelles, FAQ, mentions legales, CGU et politique de confidentialite ;
- emails transactionnels habilles a l image du site ;
- SEO de base sur les pages publiques ;
- stack Docker locale complete ;
- socle de production prepare pour un VPS Hostinger.

## Architecture mise en place

### Monorepo

- `backend/` : API REST Symfony 7
- `frontend/` : SPA React 18 + Vite + TypeScript
- `infra/` : Nginx, Docker et fichiers de deploiement
- `docs/` : architecture, Git flow et deploiement Hostinger

### Backend Symfony

Le backend expose une API REST structuree autour des domaines suivants :

- `Auth`
- `Fundraiser`
- `Contribution`
- `Payment`
- `Contact`
- `Admin`

Les composants actuellement en place :

- `Controller/` pour les points d entree HTTP ;
- `Entity/` et `Repository/` pour Doctrine ;
- `Service/` pour la logique metier, les vues, le paiement et les emails ;
- `Enum/` pour les statuts et roles ;
- JWT stateless via `LexikJWTAuthenticationBundle` ;
- migrations Doctrine pour le schema ;
- emails transactionnels Twig.

### Frontend React

Le frontend est structure autour de :

- `app/` pour le router et l authentification ;
- `layouts/` pour la separation public / espace connecte / admin ;
- `pages/` pour les ecrans ;
- `components/` pour les blocs reutilisables ;
- `lib/` pour l API client, le SEO, les formatages et helpers ;
- `styles/global.css` pour le theme global.

### Infra locale

La stack locale repose sur [docker-compose.yml](/home/salla/Projects/cagnotte/docker-compose.yml) :

- `proxy` : Nginx d entree ;
- `php` : Symfony en `php-fpm` ;
- `frontend` : Vite en mode dev ;
- `db` : PostgreSQL 16 ;
- `mailpit` : capture des emails.

### Infra preparee pour la production

Une base de stack prod est prete avec :

- [docker-compose.prod.yml](/home/salla/Projects/cagnotte/docker-compose.prod.yml)
- [backend/Dockerfile.prod](/home/salla/Projects/cagnotte/backend/Dockerfile.prod)
- [infra/nginx/Dockerfile.prod](/home/salla/Projects/cagnotte/infra/nginx/Dockerfile.prod)
- [infra/nginx/prod-http.conf.template](/home/salla/Projects/cagnotte/infra/nginx/prod-http.conf.template)
- [infra/nginx/prod-https.conf.template](/home/salla/Projects/cagnotte/infra/nginx/prod-https.conf.template)

Cette stack remplace le front Vite par des assets statiques buildes a l image, conserve Symfony + PostgreSQL, et prepare le terrain pour le deploy sur le VPS Hostinger.

## Demarrage local

1. Copier les variables d environnement :

```bash
cp .env.example .env
cp backend/.env.dist backend/.env
cp frontend/.env.example frontend/.env
```

2. Demarrer l environnement :

```bash
docker compose up --build
```

3. Initialiser la base et les cles JWT :

```bash
docker compose exec php php bin/console doctrine:migrations:migrate
docker compose exec php php bin/console lexik:jwt:generate-keypair --skip-if-exists
docker compose exec php php bin/console app:create-admin ndiageze@gmail.com Admin123! Admin Local +221700000000
```

4. Ouvrir les services :

- application : `http://localhost`
- API healthcheck : `http://localhost/health`
- Mailpit : `http://localhost:8025`

## Variables importantes

### Infrastructure

- `APP_ENV`
- `APP_SECRET`
- `APP_BASE_URL`
- `FRONTEND_BASE_URL`
- `DATABASE_NAME`
- `DATABASE_USER`
- `DATABASE_PASSWORD`

### Backend

- `MAILER_DSN`
- `MAIL_FROM_ADDRESS`
- `MAIL_FROM_NAME`
- `CONTACT_RECIPIENT`
- `JWT_PASSPHRASE`
- `PAYMENT_PROVIDER`
- `PAYDUNYA_MODE`
- `PAYDUNYA_MASTER_KEY`
- `PAYDUNYA_PRIVATE_KEY`
- `PAYDUNYA_PUBLIC_KEY`
- `PAYDUNYA_TOKEN`

### Frontend

- `VITE_API_BASE_URL`
- `VITE_APP_NAME`
- `VITE_SITE_URL`

## Git et GitHub

Le flux recommande est documente dans [git-flow.md](/home/salla/Projects/cagnotte/docs/git-flow.md).

En synthese :

- `main` : branche de production
- `develop` : branche d integration
- `feature/*` : branches de fonctionnalites
- `hotfix/*` : corrections urgentes

Le repo est aussi prepare pour GitHub Actions avec [ci.yml](/home/salla/Projects/cagnotte/.github/workflows/ci.yml), qui :

- prepare les fichiers `.env` de CI ;
- build la stack locale ;
- verifie les fichiers PHP critiques ;
- lint les templates Twig ;
- build le frontend.

## Deploiement sur VPS Hostinger

Le guide detaille est dans [deployment-hostinger.md](/home/salla/Projects/cagnotte/docs/deployment-hostinger.md).

Le flux cible est simple :

1. pousser le code sur GitHub ;
2. cloner le repo sur le VPS ;
3. preparer le `.env` de prod a partir de `.env.production.example` ;
4. lancer `docker compose -f docker-compose.prod.yml up -d --build` ;
5. executer les migrations ;
6. generer les cles JWT sur le VPS ;
7. activer `ENABLE_TLS=1` et monter les certificats si le site doit etre public en HTTPS.

## Points de vigilance avant push

- ne pas commit `.env`
- ne pas commit `backend/config/jwt/private.pem`
- ne pas commit `backend/var/`
- ne pas commit `frontend/dist/`
- ne pas commit les vrais uploads

## Documentation associee

- [architecture.md](/home/salla/Projects/cagnotte/docs/architecture.md)
- [git-flow.md](/home/salla/Projects/cagnotte/docs/git-flow.md)
- [deployment-hostinger.md](/home/salla/Projects/cagnotte/docs/deployment-hostinger.md)
