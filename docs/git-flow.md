# Git Flow recommande

## Branches

- `main` : production
- `develop` : integration continue
- `feature/*` : developpement d'une fonctionnalite
- `hotfix/*` : correction urgente depuis `main`

## Cycle de travail

### Nouvelle fonctionnalite

```bash
git checkout develop
git pull origin develop
git checkout -b feature/nom-court
```

Coder, commit, pousser :

```bash
git add .
git commit -m "feat: description"
git push -u origin feature/nom-court
```

Ouvrir une PR vers `develop`.

### Preparation prod

Quand `develop` est stable :

```bash
git checkout main
git pull origin main
git merge --ff-only develop
git push origin main
```

### Hotfix

```bash
git checkout main
git pull origin main
git checkout -b hotfix/nom-court
```

Puis merger vers `main` et `develop`.
