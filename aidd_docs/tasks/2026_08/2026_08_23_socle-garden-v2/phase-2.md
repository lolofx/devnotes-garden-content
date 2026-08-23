---
status: implemented
---

# Instruction: Squelette de taxonomie du pilier IA

## Architecture projection

> Tree of the final files. ✅ create · ✏️ modify · ❌ delete

```txt
.
└── notes/
    ├── agents/
    │   └── .gitkeep            ✅ ouvre le dossier des fondamentaux agents sans note
    ├── orchestration/
    │   └── .gitkeep            ✅ ouvre le dossier des equipes d'agents sans note
    └── aidd/
        └── .gitkeep            ✅ ouvre le dossier de la methode AIDD sans note
```

## User Journey

```mermaid
flowchart TD
  A[Les 3 dossiers IA existent et sont vides] --> B[Le build de l'app scanne notes/]
  B --> C{Fichier .md trouve ?}
  C -->|non| D[Dossier ignore silencieusement]
  C -->|oui| E[Note indexee avec theme = nom du dossier]
  D --> F[content-index.json inchange: 12 notes]
  E --> F
```

## Test Scope

```mermaid
---
title: Test scope
---
journey
  section Setup
    Copier notes/ du repo content vers content-source/notes/ du repo app => arbre de contenu pret a builder: 5: cli
  section Happy path
    Lancer node scripts/build-content-index.mjs => la sortie annonce 12 notes indexees: 5: cli
    Lire public/assets/content-index.json => aucun theme agents, orchestration ni aidd n'apparait: 5: cli
    Lancer npm run test:scripts => la suite build-content-index reste verte: 5: cli
  section Edge case - dossier vide
    Un dossier de notes ne contient qu'un .gitkeep => lancer le build => aucun warning n'est emis et le fichier .gitkeep est ignore: 1: cli
  section Teardown
    Restaurer content-source/notes/ a son etat initial => repo app inchange: 5: cli
```

## Tasks to do

### `1)` Créer les trois dossiers du pilier IA

> Rendre la taxonomie réelle avant d'y écrire quoi que ce soit.

1. Créer `notes/agents/.gitkeep`, `notes/orchestration/.gitkeep`, `notes/aidd/.gitkeep`.
2. Ne créer **aucun** des dossiers craft prévus (`dotnet/`, `testing/`, `infrastructure/`) : ils restent documentés dans `write-devnote` jusqu'à leur 1re note.

### `2)` Vérifier la neutralité pour le build de l'app

> S'assurer que des dossiers vides ne cassent ni ne polluent la production.

1. Copier l'arbre `notes/` courant dans `content-source/notes/` du repo `devnotes-garden-app`.
2. Exécuter `node scripts/build-content-index.mjs` et relever le nombre de notes indexées et les warnings.
3. Confirmer que `collectMarkdownFiles` ignore `.gitkeep` (filtre `.endsWith('.md')`) et qu'aucun thème vide n'entre dans l'index.
4. Restaurer `content-source/notes/` à son état initial : cette phase ne modifie pas le repo app.

## Test acceptance criteria

| Task | Acceptance criteria                                                                                                     |
| ---- | ------------------------------------------------------------------------------------------------------------------------- |
| 1    | `notes/` contient 9 dossiers, dont `agents/`, `orchestration/` et `aidd/` suivis par git via leur `.gitkeep`               |
| 2    | Le build annonce 12 notes indexées, n'émet aucun warning, et `content-index.json` ne contient aucun thème sans note        |
