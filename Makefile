.PHONY: up down restart build ps logs logs-php logs-front logs-proxy logs-db \
	php-shell front-shell db-shell composer sf cache-clear migrate diff \
	jwt admin front-build front-install alerts prod-up prod-down prod-build \
	prod-logs prod-migrate prod-jwt prod-deploy

DC = docker compose
PROD_DC = docker compose -f docker-compose.prod.yml
PHP = $(DC) exec php
FRONT = $(DC) exec frontend
DB = $(DC) exec db

up:
	$(DC) up --build -d

down:
	$(DC) down

restart:
	$(DC) down
	$(DC) up --build -d

build:
	$(DC) up --build

ps:
	$(DC) ps

logs:
	$(DC) logs -f

logs-php:
	$(DC) logs -f php

logs-front:
	$(DC) logs -f frontend

logs-proxy:
	$(DC) logs -f proxy

logs-db:
	$(DC) logs -f db

php-shell:
	$(PHP) sh

front-shell:
	$(FRONT) sh

db-shell:
	$(DB) psql -U cagnotte -d cagnotte

composer:
	$(PHP) composer $(ARGS)

sf:
	$(PHP) php bin/console $(ARGS)

cache-clear:
	$(PHP) php bin/console cache:clear

migrate:
	$(PHP) php bin/console doctrine:migrations:migrate --no-interaction

diff:
	$(PHP) php bin/console doctrine:migrations:diff

jwt:
	$(PHP) php bin/console lexik:jwt:generate-keypair --skip-if-exists

admin:
	$(PHP) php bin/console app:create-admin admin@cagnotte.sn Admin123! Admin Local +221700000000

alerts:
	$(PHP) php bin/console app:fundraisers:send-ending-soon-alerts

prod-up:
	$(PROD_DC) up -d --build

prod-down:
	$(PROD_DC) down

prod-build:
	$(PROD_DC) build

prod-logs:
	$(PROD_DC) logs -f

prod-migrate:
	$(PROD_DC) exec php php bin/console doctrine:migrations:migrate --no-interaction

prod-jwt:
	$(PROD_DC) exec php php bin/console lexik:jwt:generate-keypair --skip-if-exists

prod-deploy:
	$(PROD_DC) up -d --build
	$(PROD_DC) exec php php bin/console doctrine:migrations:migrate --no-interaction

front-install:
	$(FRONT) npm install

front-build:
	$(FRONT) npm run build
