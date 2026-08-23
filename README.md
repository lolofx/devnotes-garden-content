# devnotes-garden-content

Dépôt de contenu du **[devnotes·garden](https://garden.leplomb.work)** — un digital garden technique rendu par [devnotes-garden-app](https://github.com/lolofx/devnotes-garden-app), hébergé sur Azure Static Web Apps.

Tout push sur `main` déclenche le rebuild de l'app via un `repository_dispatch`. **Ne jamais committer directement sur `main`** : passer par une branche et une PR.

---

## Les deux piliers

| Pilier | Sujet | Dossiers |
|--------|-------|----------|
| **craft** | Architecture, backend, modélisation | `ddd/` `cqrs/` `hexagonal/` `bff/` `event-storming/` `messaging/` |
| **ai** | Agents, orchestration, méthode AIDD | `agents/` `orchestration/` `aidd/` |

Prévus, pas encore ouverts : `dotnet/`, `testing/`, `infrastructure/`. Règle : **aucun nouveau dossier tant que 3 notes ne le remplissent pas.**

Le garden n'est pas deux gardens. Sa valeur est le pont entre les deux : une équipe d'agents est un système distribué, avec les mêmes problèmes que ceux déjà documentés côté craft — idempotence, livraison at-least-once, frontières de contexte, observabilité.

---

## Setup (après un clone)

Les skills de `.claude/skills/` sont disponibles automatiquement via le repo. Les skills communautaires s'installent globalement :

```bash
bash .claude/install-skills.sh
```

| Skill | Type | Rôle |
|-------|------|------|
| `write-devnote` | Repo | **Source de vérité des conventions** du garden |
| `critique-devnote` | Repo | Critique en 3 passes : forme, fond, capsule agent |
| `clean-ddd-hexagonal` | Global | Référence DDD / Clean Architecture / Hexagonal |
| `milan-jovanovic-blog` | Global | Patterns .NET concrets |

---

## Audit

```bash
node .claude/scripts/audit-garden.mjs
```

Node, zéro dépendance. Sort en code 1 si un contrôle bloquant échoue.

| Contrôle | Sévérité |
|----------|----------|
| Champ de frontmatter requis manquant *(le build ignorerait la note)* | 🔴 |
| Nom de fichier ≠ `slug` | 🔴 |
| Collision de slug *(la note la plus ancienne disparaîtrait du site)* | 🔴 |
| Lien interne vers une note inexistante | 🔴 |
| Lien portant l'extension `.md` | 🟡 |
| Dérive de tags : plafond, 1er tag ≠ dossier, tag banni, hors vocabulaire | 🟡 |
| Champ `draft` absent *(la note serait publiée)* | 🟡 |
| `related` désynchronisé du footer *Note liée* | 🟡 |
| Note orpheline *(aucune autre note n'y mène)* | 🟡 |
| Fraîcheur : `verified` > 6 mois, `updated` > 18 mois | 🟡 |

---

## Structure

```
notes/<categorie>/<slug>.md
```

La catégorie est le **premier niveau** sous `notes/` — l'app en dérive le `theme`, et un sous-dossier serait invisible. Le nom de fichier doit être identique au champ `slug`.

⚠️ La route de l'app est **plate** (`/notes/:slug`) : les slugs sont uniques dans **tout** le garden, tous dossiers confondus.

---

## Frontmatter

### Champs requis

```yaml
---
title: "Titre lisible de la note"
slug: titre-en-kebab-case
tags: [domaine, transverse1, transverse2]
created: YYYY-MM-DD
updated: YYYY-MM-DD
summary: "Une phrase — affichée dans les cards de l'app."
draft: true
---
```

| Champ | Description |
|-------|-------------|
| `title` | Titre affiché dans l'app |
| `slug` | Identifiant URL, kebab-case, identique au nom de fichier, unique dans tout le garden |
| `tags` | 5 maximum, le 1er est le domaine et vaut le dossier |
| `created` / `updated` | `YYYY-MM-DD`, sans guillemets |
| `summary` | Résumé court affiché dans les cards |
| `draft` | `true` = non publié. **Un champ `draft` absent vaut publié** |

### Champs optionnels (v2)

| Champ | Valeurs | Description |
|-------|---------|-------------|
| `pillar` | `craft` \| `ai` | Facette de plus haut niveau |
| `level` | `fondation` \| `intermediaire` \| `avance` | Parcours de lecture |
| `related` | liste de slugs | Version machine du footer *Note liée* — les deux doivent concorder |
| `verified` | `YYYY-MM-DD` | Dernier contrôle de l'outillage décrit. **Forme recette uniquement** |

Ces champs traversent le build tel quel jusqu'à `content-index.json` : ils sont exploitables par un agent même si l'app ne les affiche pas.

---

## Corps de la note

- H1 en première ligne, identique au `title`
- Français, ton pédagogique et concret, tutoiement accepté
- Une des **3 formes** : concept, arbitrage ou recette *(voir `write-devnote`)*
- 250 lignes maximum — au-delà, découper en notes liées
- Diagrammes via ` ```mermaid ` · Event Storming via ` ```event-storming `
- Une section **`## Pour un agent`** en fin de corps : 3 à 8 règles impératives et vérifiables
- Footer *Note liée* en italique, chemin sans extension : `[Titre](../categorie/slug)` ou `[Titre](./slug)`

---

## Consommer le garden par programme

Le site est lu par des humains **et** donné en lecture à des agents. Quatre points d'entrée stables :

| URL | Contenu |
|-----|---------|
| `/llms.txt` | Index lisible par un agent : les notes publiées par thème, avec titre, URL et résumé |
| `/assets/content-index.json` | Toutes les métadonnées, frontmatter v2 compris, triées par `updated` décroissant |
| `/assets/content/<theme>/<slug>.md` | Le markdown brut d'une note |
| `/rss.xml` | Flux RSS des notes publiées |

Les notes en `draft: true` n'apparaissent dans aucun des quatre.

---

## Notes issues d'EventStormer

L'app [EventStormer](https://github.com/lolofx/event-stormer-app) exporte un atelier en Markdown + Mermaid. Ces exports **ne sont pas publiés bruts** : on les intègre dans une note standard, encadrée d'une introduction et d'une lecture commentée, avec une section *Limites*. Voir `notes/event-storming/livraison-pizza-event-storming.md` comme modèle. Le diagramme Mermaid et les listes de l'export ne se réécrivent pas à la main.

---

## Conventions

Toutes les conventions de rédaction sont dans **`.claude/skills/write-devnote/SKILL.md`**, seule source de vérité. Ce README en est un résumé : en cas de divergence, c'est le skill qui fait foi.
