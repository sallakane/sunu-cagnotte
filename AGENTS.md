# AGENTS.md

Operational notes for future Codex sessions on this repository.

## Production safety rules

### ⛔ JAMAIS cache:clear en root — règle absolue

**NE JAMAIS exécuter `cache:clear` ou `cache:warmup` sans `-u www-data`.**
Exécuter ces commandes en root casse les permissions de `/app/var/cache/prod/doctrine/orm/Proxies`
et met toute l'API en 500, y compris les routes GET publiques.

Toujours utiliser :

```bash
docker compose -f docker-compose.prod.yml exec -u www-data php php bin/console cache:clear
docker compose -f docker-compose.prod.yml exec -u www-data php php bin/console cache:warmup
```

Ne jamais faire :
```bash
# ❌ INTERDIT — casse les permissions
docker compose -f docker-compose.prod.yml exec php php bin/console cache:clear
```

```bash
docker compose -f docker-compose.prod.yml exec -u www-data php php bin/console cache:clear --env=prod
```

- The production `php` container has writable runtime state under `/app/var` and uploads under `/app/public/uploads`.
- If a production request fails with `Your proxy directory "/app/var/cache/prod/doctrine/orm/Proxies" must be writable`, repair permissions with:

```bash
docker compose -f docker-compose.prod.yml exec php sh -lc 'rm -rf /app/var/cache/prod && mkdir -p /app/var/cache/prod/doctrine/orm/Proxies && chown -R www-data:www-data /app/var && chmod -R u+rwX,g+rwX /app/var'
docker compose -f docker-compose.prod.yml exec -u www-data php php bin/console cache:clear --env=prod
docker compose -f docker-compose.prod.yml restart php
```

- After any manual permission repair, verify that `/app/var/cache/prod/doctrine/orm/Proxies` is owned by `www-data:www-data`.
- The `php` image bakes in the backend code. After backend code changes in production, `restart php` alone is not enough. Rebuild with:

```bash
docker compose -f docker-compose.prod.yml up -d --build php
```

## Mail configuration rules

- Keep `MAIL_FROM_ADDRESS=no-reply@sunu-cagnotte.org`.
- Keep `MAIL_FROM_NAME="Sunu Cagnotte"`.
- Keep `CONTACT_RECIPIENT=ndiageze@gmail.com` for the public contact form.
- Do not reintroduce `admin@sunu-cagnotte.org` or `contact@sunu-cagnotte.org` in config, examples, docs, or default commands.
- Do not commit real mail passwords or other secrets to the repository.

## Coding standards

- Respect SOLID, but apply it pragmatically. Prefer small cohesive classes over premature abstraction.
- A controller should stay thin: validate input, call services, return HTTP responses. Business rules belong in services or domain objects.
- One class should have one clear responsibility. If a class is handling validation, persistence, formatting, and side effects, split it.
- Depend on abstractions when there are multiple implementations or when external systems are involved. Do not introduce interfaces with only one trivial implementation unless there is a clear boundary.
- Keep dependencies explicit through constructor injection. Avoid service locators, static helpers for business logic, and hidden framework lookups.
- Prefer extending behavior by composing new services instead of modifying unrelated classes.
- Keep entities focused on domain state and invariant-preserving methods. Do not move infrastructure or transport formatting logic into entities.
- Avoid duplicated business rules between controllers, services, and frontend. Centralize the rule in one backend location when possible.
- Favor descriptive names over comments. Add comments only when the intent is not obvious from the code.
- Methods should be short and do one thing. If a method needs multiple logical sections, extract private methods or dedicated services.
- Validate external input early and return explicit errors. Do not let invalid request state leak deep into the application.
- Catch exceptions only when the code can recover, convert them to a user-safe response, or log useful operational context.
- For side effects such as mail, payments, and uploads, log failures with enough context to debug production issues.
- Keep configuration-driven values in env vars or Symfony config, not hardcoded in controllers or templates.
- In frontend code, keep components presentational when possible and push API orchestration into small focused handlers or shared helpers.
- Do not make unrelated refactors in the same change. Fix the problem, improve the touched area, and stop.
- When changing production behavior, prefer the smallest safe diff and verify with logs, permissions, and a concrete user flow.

## Known production issues already encountered

- Running production cache commands as `root` caused repeated 500s on `GET /api/fundraisers` because Doctrine could not write proxies.
- Uploads and cache paths may appear writable at one moment and still regress after root-owned cache rebuilds; always re-check ownership after maintenance commands.
- A `MAILER_DSN` pointing to placeholder SMTP values such as `smtp.example.com` breaks transactional mail.

## Preferred production verification steps

- After backend deployment:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml exec php sh -lc 'stat -c "%A %U:%G %n" /app/var /app/var/cache /app/var/cache/prod /app/var/cache/prod/doctrine/orm/Proxies 2>/dev/null'
docker compose -f docker-compose.prod.yml exec php sh -lc 'tail -n 80 /app/var/log/prod.log'
```

- If a user reports a production 500, prefer reading `/app/var/log/prod.log` immediately after reproducing the issue before suggesting risky maintenance commands.
