# devnotes-garden-content

Dépôt de contenu pour [devnotes-garden-app](https://github.com/lolofx/devnotes-garden-app) — un digital garden hébergé sur Azure Static Web Apps qui affiche des notes sur l'architecture logicielle avancée (DDD, Event Storming, Clean Architecture, CQRS, BFF…).

Tout push sur `main` déclenche automatiquement le rebuild de l'app via un `repository_dispatch`.

---

## Setup (après un clone)

Les skills embarqués dans `.claude/skills/` sont disponibles automatiquement via le repo.
Les skills communautaires (.NET, DDD, Clean Architecture) nécessitent une installation globale :

```bash
bash .claude/install-skills.sh
```

Ré-exécuter la même commande pour les mettre à jour.

| Skill | Type | Description |
|-------|------|-------------|
| `write-devnote` | Repo | Conventions de rédaction des notes |
| `critique-devnote` | Repo | Critique structurée d'une note (forme + fond) |
| `clean-ddd-hexagonal` | Global | Référence DDD / Clean Architecture / Hexagonal |
| `milan-jovanovic-blog` | Global | Patterns .NET concrets (CQRS, EF Core, ASP.NET Core) |

---

## Structure

```
notes/
  <categorie>/
    <slug>.md
```

La catégorie correspond au thème de la note (`ddd`, `bff`, `event-storming`, `cqrs`, etc.). Le nom de fichier doit être identique au champ `slug` du frontmatter.

---

## Format d'une note

### Frontmatter obligatoire

```yaml
---
title: "Titre lisible de la note"
slug: titre-en-kebab-case
tags: [tag1, tag2, tag3]
created: YYYY-MM-DD
updated: YYYY-MM-DD
summary: "Une phrase qui décrit la note — affichée dans les cards de l'app."
draft: true
---
```

> Toute note démarre en `draft: true`. Elle ne passe en `draft: false` qu'après une passe `critique-devnote` et quand elle permet un apprentissage autonome.

| Champ | Type | Description |
|-------|------|-------------|
| `title` | string | Titre affiché dans l'app |
| `slug` | string | Identifiant URL, kebab-case, identique au nom de fichier |
| `tags` | string[] | Tags pour la navigation et la recherche |
| `created` | date | Date de création (YYYY-MM-DD) |
| `updated` | date | Date de dernière modification (YYYY-MM-DD) |
| `summary` | string | Résumé court affiché dans les cards |
| `draft` | boolean | `true` = non publié, `false` = publié |

### Corps de la note

- H1 en première ligne, identique au `title`
- Rédaction en **français**, ton pédagogique et concret
- Exemples de code dans le langage pertinent (C#, TypeScript, etc.)
- Diagrammes via blocs ` ```mermaid ` (Mermaid.js)
- Diagrammes Event Storming via blocs ` ```event-storming `
- Liens entre notes avec chemin relatif : `[Titre](../categorie/slug)`

### Exemple minimal

```markdown
---
title: "Introduction au CQRS"
slug: introduction-cqrs
tags: [cqrs, architecture, ddd]
created: 2026-05-29
updated: 2026-05-29
summary: "Séparer les chemins de lecture et d'écriture pour simplifier les modèles complexes."
draft: true
---

# Introduction au CQRS

Le **Command Query Responsibility Segregation** (CQRS) consiste à séparer...

## Pourquoi CQRS ?

...

---

*Note liée : [Introduction au DDD](../ddd/introduction-ddd)*
```

---

## Notes issues d'EventStormer

L'app [EventStormer](https://github.com/lolofx/event-stormer-app) exporte un atelier en Markdown + Mermaid (diagramme coloré + listes de stickies par type). Ces exports **ne sont pas publiés bruts** : on les intègre dans une note standard du garden, comme n'importe quelle autre note.

Convention pour intégrer un export :

1. Ajouter le **frontmatter** complet (`title`, `slug`, `tags`, dates, `summary`, `draft: true`).
2. H1 descriptif identique au `title` ; conserver le bloc `> Niveau … | Exporté le … | N stickies` juste sous l'intro.
3. Encadrer l'export d'une **introduction** (ce qu'on regarde) et d'une **lecture commentée** (comment décoder le mur), plus une section *Limites*.
4. Terminer par un footer *Note liée :* vers la note théorique correspondante.

Voir `notes/event-storming/livraison-pizza-event-storming.md` comme modèle. Le diagramme Mermaid et les listes de l'export, eux, ne se réécrivent pas à la main.

---

## Thèmes existants

| Dossier | Sujets couverts |
|---------|-----------------|
| `ddd/` | DDD, agrégats, value objects, bounded contexts |
| `event-storming/` | Ateliers, code couleur, niveaux Big Picture / Process / Design |
| `bff/` | Backend For Frontend, Clean Architecture, SignalR |
| `cqrs/` | Command Query Responsibility Segregation, read/write models |

---

## Conventions

- Une note = un concept. Préférer plusieurs notes courtes et liées plutôt qu'une seule note longue.
- Ne pas passer une note en `draft: false` sans une passe `critique-devnote` (forme + fond).
- Les `tags` sont en minuscules, sans accents.
- Le `slug` ne contient que des lettres minuscules, chiffres et tirets.
- Mettre `draft: true` pour travailler une note sans la publier.
- Terminer les notes avec une ligne *Note liée :* pointant vers une note connexe quand c'est pertinent. Le chemin doit être **sans extension `.md`** : `(../categorie/slug)` — l'app utilise le slug pour la navigation.
