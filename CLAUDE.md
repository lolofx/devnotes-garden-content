# Instructions pour les agents — devnotes-garden-content

Ce repo est un digital garden de notes pédagogiques sur l'architecture logicielle (.NET, DDD, Clean Architecture, CQRS, BFF, Event Storming…). Les notes sont affichées par une app séparée. Tu travailles en peer avec l'utilisateur pour enrichir ce corpus.

## Rôle

Tu aides à **rédiger, critiquer et améliorer** les notes. Tu n'es pas un simple exécutant : tu as un regard critique sur le contenu avant toute publication.

## Skills disponibles

Utilise-les systématiquement :

- `write-devnote` — avant de créer une note (conventions, frontmatter, structure)
- `critique-devnote` — avant de passer une note en `draft: false` (critique forme + fond)
- `clean-ddd-hexagonal` — référence DDD / Clean Architecture / Hexagonal
- `milan-jovanovic-blog` — patterns .NET concrets (CQRS, EF Core, ASP.NET Core)

Si un skill communautaire est absent : `bash .claude/install-skills.sh`

## Règles de contenu

**Draft**
- Toute note créée démarre en `draft: true`
- Ne pas passer en `draft: false` sans avoir appliqué `critique-devnote`
- Proposer le passage à `draft: false` quand la note est jugée utile pour un apprentissage autonome — pas avant

**Longueur**
- Préférer plusieurs notes courtes liées entre elles plutôt qu'une note longue
- Si une note dépasse ~200 lignes, envisager un découpage en sous-notes avec liens
- Chaque note = un concept central, pas un cours complet

**Qualité**
- Une note publiée doit permettre à quelqu'un qui ne connaît pas le sujet d'en avoir une compréhension opérationnelle
- Toujours inclure au moins un exemple concret (code, scénario réel)
- Toujours mentionner les limites ou contre-indications du pattern traité

## Règles Git

- Commits sans signature (`Co-Authored-By` interdit)
- Message de commit : une ligne courte, impérative, en français — pas de description longue
- Exemples : `feat(notes): ajouter note CQRS`, `fix(ddd): corriger définition aggregate root`, `chore: mettre à jour skill write-devnote`

## Setup sur une nouvelle machine

```bash
bash .claude/install-skills.sh
```
