# Architecture Sunu Cagnotte

## 1. Vue d'ensemble

Le projet est organise en monorepo avec une separation nette entre :

- `backend` : API REST Symfony, logique metier, persistence, emails, paiements.
- `frontend` : application React servant l'experience publique et l'espace connecte.
- `infra` : Docker, Nginx, outillage local et base de stack de production.

L'objectif est de garder un MVP simple a operer tout en evitant de bloquer les evolutions futures comme :

- ajout d'un autre provider de paiement ;
- ajout d'un back-office plus riche ;
- externalisation du stockage media ;
- regles financieres plus fines ;
- files d'attente pour emails et traitements asynchrones.

## 2. Architecture backend

### Style retenu

Architecture modulaire par domaine dans un monolithe Symfony :

- `Auth`
- `User`
- `Fundraiser`
- `Contribution`
- `Payment`
- `Contact`
- `Admin`
- `Shared`

Ce choix est plus pragmatique qu'une architecture hexagonale stricte au premier jour, mais laisse une frontiere claire entre :

- le domaine et ses regles ;
- les adaptateurs techniques ;
- les points d'entree HTTP.

### Couches

- `Controller` : exposition HTTP, validation d'entree, serialisation des reponses.
- `Entity` : modeles Doctrine du MVP.
- `Enum` : statuts et roles.
- `Service` : orchestration metier, adaptateurs de paiement, emails.
- `Repository` : lecture/ecriture de donnees.

### Securite

- JWT pour les espaces createur/admin.
- reinitialisation de mot de passe par email.
- Roles `ROLE_USER` et `ROLE_ADMIN`.
- Rate limiting cible sur `auth`, `contact`, `payments`.
- Validation stricte des payloads.
- CORS restreint au front React.

## 3. Architecture frontend

### Principes

- React + TypeScript + Vite.
- Routing explicite entre front public et espace connecte.
- Design mobile-first.
- Composants UI reutilisables et themables.
- Couche `lib/` pour helpers techniques et formatage.

### Organisation

- `layouts/` : structures de pages public/prive.
- `pages/` : ecrans metier.
- `components/` : blocs reutilisables.
- `mocks/` : donnees de demonstration temporaires.
- `styles/` : theme, tokens visuels et base CSS.
- `lib/usePageSeo.ts` : titres, descriptions, canonical et Open Graph.

## 4. Paiement

### Decision cle

Le paiement est encapsule derriere une interface fournisseur :

- `PaymentProviderInterface`
- `PaymentProviderRegistry`
- `PayDunyaProvider`

Ce choix permet :

- un mode test clair ;
- une integration progressive ;
- l'ajout futur d'un autre provider sans casser le coeur metier.

### Flux cible MVP

1. Le visiteur soumet une contribution.
2. Le backend cree une `Contribution` avec statut `initiated`.
3. Le backend demande au provider un lien ou token de paiement.
4. Le front redirige vers PayDunya.
5. Au retour utilisateur et surtout a l'IPN serveur, le backend verifie la transaction.
6. La contribution passe a `paid`, `failed`, `cancelled` ou `pending`.
7. Le montant collecte de la cagnotte n'est mis a jour qu'apres confirmation serveur fiable.

### Garde-fous

- index/contraintes sur `payment_reference` ;
- journalisation brute dans `PaymentLog` ;
- verification idempotente des callbacks ;
- calcul de `collected_amount` derive des contributions confirmees.

## 5. Modele de donnees

Entites MVP :

- `User`
- `Fundraiser`
- `Contribution`
- `ContactMessage`
- `PaymentLog`

Choix de modelisation :

- UUID natifs PostgreSQL ;
- montants stockes en `NUMERIC(12,2)` ;
- statuts stockes en enum PHP et colonnes texte cote DB ;
- devise par defaut `XOF`.

## 6. Hypotheses fonctionnelles

- Une cagnotte publiee est visible sur l'accueil tant qu'elle n'est ni terminee ni archivee.
- L'atteinte de l'objectif n'empeche pas les contributions avant la date de fin.
- L'anonymat est uniquement public.
- Les contributions invitees ne creent pas de compte utilisateur.
- Les frais provider peuvent etre traces sans etre affiches dans le tunnel MVP.
- Les emails partent en synchrone au debut, avec passage a une file asynchrone plus tard si necessaire.
- Les images de couverture sont actuellement stockees sur le serveur local via `public/uploads`.

## 7. Risques et points a cadrer

- Details contractuels de PayDunya a confirmer avant implementation finale.
- Politique de modération des cagnottes a preciser.
- Gestion RGPD locale / Senegal a faire valider.
- Strategie anti-spam pour contact et contribution a renforcer avant production.
- Strategie de media, redimensionnement et CDN a decider avant mise en ligne reelle.

## 8. Arborescence cible

```text
backend/
  config/
  migrations/
  public/
  src/
    Controller/
    Entity/
    Enum/
    Repository/
    Service/
  tests/
frontend/
  src/
    app/
    components/
    layouts/
    lib/
    mocks/
    pages/
    styles/
infra/
  nginx/
```
