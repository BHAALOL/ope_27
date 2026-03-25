# Présidentielle 2027 — Suivi de campagne

Plateforme de suivi de la campagne présidentielle française de 2027. Interface publique pour suivre les candidats, partis, sondages et actualités — panel d'administration avec génération de contenu par IA (Claude).

---

## Prérequis

- [Node.js](https://nodejs.org/) 20+
- [PostgreSQL](https://www.postgresql.org/) 16+ (ou Docker)
- Une clé API [Anthropic](https://console.anthropic.com/) pour la génération IA

---

## Installation locale (développement)

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd ope_27
```

### 2. Installer les dépendances

```bash
npm install --legacy-peer-deps
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Éditer `.env` :

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/presidentielle2027"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="une-chaine-aleatoire-min-32-caracteres"
ANTHROPIC_API_KEY="sk-ant-..."
NODE_ENV="development"
```

> Générer un `NEXTAUTH_SECRET` sécurisé : `openssl rand -base64 32`

### 4. Initialiser la base de données

```bash
# Créer les tables
npm run db:push

# Insérer les données de départ (candidats, partis, sondages...)
npm run db:seed
```

### 5. Lancer le serveur de développement

```bash
npm run dev
```

Application disponible sur [http://localhost:3000](http://localhost:3000)

---

## Déploiement avec Docker

### Lancement rapide (Docker Compose)

```bash
# Copier et configurer les variables
cp .env.example .env
# Éditer .env avec vos valeurs

# Démarrer tous les services (app + PostgreSQL + migrations)
docker compose up -d
```

Le service `migrate` s'exécute automatiquement au premier démarrage pour créer les tables et insérer les données initiales.

### Variables à définir pour la production

| Variable | Description | Exemple |
|---|---|---|
| `DATABASE_URL` | URL PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_URL` | URL publique du site | `https://presidentielle2027.fr` |
| `NEXTAUTH_SECRET` | Secret JWT (min. 32 chars) | `openssl rand -base64 32` |
| `ANTHROPIC_API_KEY` | Clé API Claude | `sk-ant-...` |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL | `motdepasse-securise` |

---

## Déploiement sur Coolify / Dokploy

1. Créer un nouveau service **Docker Compose** ou **Dockerfile**
2. Pointer vers ce dépôt, branche `claude/campaign-tracking-site-V9zbE`
3. Ajouter les variables d'environnement dans l'interface Coolify/Dokploy
4. Lancer le déploiement

> Le `Dockerfile` utilise un build multi-stage avec output `standalone` — optimisé pour la production.

---

## Compte administrateur par défaut

Après le seed, un compte admin est créé automatiquement :

| Champ | Valeur |
|---|---|
| Email | `admin@presidentielle2027.fr` |
| Mot de passe | `admin2027!` |

**Changer ce mot de passe immédiatement en production.**

---

## Structure du projet

```
├── app/
│   ├── page.tsx                  # Accueil
│   ├── candidats/                # Liste + fiches candidats
│   ├── partis/                   # Liste + fiches partis
│   ├── sondages/                 # Baromètre sondages
│   ├── comparateur/              # Comparateur candidats
│   ├── agenda/                   # Calendrier de campagne
│   ├── actualites/               # Fil d'actualités
│   ├── admin/                    # Panel d'administration
│   └── api/                      # Routes API REST + IA
├── components/                   # Composants React
├── lib/                          # Prisma, NextAuth, utilitaires
├── prisma/
│   ├── schema.prisma             # Schéma base de données
│   └── seed.ts                   # Données initiales
├── Dockerfile                    # Build multi-stage
└── docker-compose.yml            # Stack complète
```

---

## Commandes utiles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Démarrer en production
npm run db:push      # Synchroniser le schéma Prisma
npm run db:seed      # Insérer les données initiales
npm run db:studio    # Interface graphique Prisma Studio
npm run lint         # Vérification ESLint
```

---

## Fonctionnalités

### Partie publique
- Tableau de bord avec compte à rebours vers l'élection d'avril 2027
- Fiches candidats : biographie, programme, positions, sondages, actualités
- Fiches partis avec liste des candidats associés
- Baromètre sondages avec graphiques d'évolution
- Comparateur côte à côte (jusqu'à 3 candidats)
- Agenda des événements de campagne
- Fil d'actualités filtrable par candidat / parti / tag

### Panel admin (`/admin`)
- Authentification sécurisée (NextAuth + bcrypt)
- CRUD candidats, partis, sondages, actualités, événements
- **Générateur IA** : génère automatiquement une fiche complète (biographie, programme, positions) via Claude API

---

## Avertissement

> Ce site est un outil d'information non officiel. Il n'est affilié à aucun parti politique, candidat ou institution publique.
