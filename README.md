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
draft: false
---
```

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
draft: false
---

# Introduction au CQRS

Le **Command Query Responsibility Segregation** (CQRS) consiste à séparer...

## Pourquoi CQRS ?

...

---

*Note liée : [Introduction au DDD](../ddd/introduction-ddd)*
```

---

## Notes auto-générées (EventStormer)

Les exports de l'app EventStormer produisent des fichiers sans frontmatter YAML. Leur format est fixe :

```markdown
# Workshop : <nom> — Export Event Storming

> Niveau : <niveau> | Exporté le <date> | <n> stickies

## Vue d'ensemble
```mermaid
...
```

## Chronologie des domain events
...
```

Ces fichiers ne doivent pas être modifiés manuellement.

---

## Thèmes existants

| Dossier | Sujets couverts |
|---------|-----------------|
| `ddd/` | DDD, agrégats, value objects, bounded contexts |
| `event-storming/` | Ateliers, code couleur, niveaux Big Picture / Process / Design |
| `bff/` | Backend For Frontend, Clean Architecture |

---

## Conventions

- Une note = un concept. Préférer plusieurs notes courtes et liées plutôt qu'une seule note longue.
- Les `tags` sont en minuscules, sans accents.
- Le `slug` ne contient que des lettres minuscules, chiffres et tirets.
- Mettre `draft: true` pour travailler une note sans la publier.
- Terminer les notes avec une ligne *Note liée :* pointant vers une note connexe quand c'est pertinent. Le chemin doit être **sans extension `.md`** : `(../categorie/slug)` — l'app utilise le slug pour la navigation.
