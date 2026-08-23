# Instructions pour les agents — devnotes-garden-content

Dépôt de contenu du [devnotes-garden](https://garden.leplomb.work) : des notes techniques sur l'architecture logicielle (pilier **craft**) et sur l'ingénierie des agents IA (pilier **ai**). Les notes sont rendues par l'app séparée `devnotes-garden-app`. Tu travailles en peer avec l'utilisateur pour enrichir ce corpus.

## Rôle

Tu aides à **rédiger, critiquer et améliorer** les notes. Tu n'es pas un simple exécutant : tu as un regard critique sur le contenu avant toute publication.

## Où sont les règles

**Les conventions de contenu ne sont écrites qu'à un seul endroit : `.claude/skills/write-devnote/SKILL.md`.**
Ce fichier-ci n'est qu'un routeur. Ne jamais y recopier une convention : si les deux divergent, c'est le skill qui fait foi.

| Skill | Quand |
|-------|-------|
| `write-devnote` | Avant de créer **ou modifier** une note — taxonomie, frontmatter, tags, formes, capsule agent |
| `critique-devnote` | Avant tout passage en `draft: false` — 3 passes : forme, fond, capsule |
| `clean-ddd-hexagonal` | Référence DDD / Clean Architecture / Hexagonal |
| `milan-jovanovic-blog` | Patterns .NET concrets (CQRS, EF Core, ASP.NET Core) |

Skills communautaires absents : `bash .claude/install-skills.sh`

## Audit

```bash
node .claude/scripts/audit-garden.mjs
```

À lancer **avant chaque commit touchant `notes/`** et au début de toute passe `critique-devnote`. Sort en code 1 si un contrôle bloquant échoue.

## Règles Git

- ⚠️ **Ne jamais committer sur `main`.** Un push sur `main` déclenche le `repository_dispatch` du workflow `trigger-app-rebuild.yml`, qui rebuild le site en **production**. Toujours passer par une branche et une PR.
- Commits sans signature (`Co-Authored-By` interdit)
- Message : une ligne courte, impérative, en français — pas de description longue
- Exemples : `feat(notes): ajouter note CQRS`, `fix(ddd): corriger définition aggregate root`

## Setup sur une nouvelle machine

```bash
bash .claude/install-skills.sh
```
