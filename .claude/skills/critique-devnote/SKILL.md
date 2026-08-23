---
name: critique-devnote
description: Use when reviewing or improving an existing note in the devnotes-garden-content repository. Covers form conventions, structure, technical accuracy, completeness, examples, cross-links, and the agent capsule.
---

# critique-devnote

Critique structurée d'une note du devnotes-garden. **Trois passes obligatoires, dans l'ordre** : forme, fond, capsule agent. Sortie en rapport structuré avec sévérité.

**REQUIRED SUB-SKILL:** lire `write-devnote` avant de critiquer — c'est la référence des conventions attendues, et la seule.

**Avant de commencer :** lancer `node .claude/scripts/audit-garden.mjs`. Il traite mécaniquement la moitié de la passe 1 (liens, slugs, tags, champs manquants). Ne pas refaire à la main ce qu'il a déjà vérifié ; se concentrer sur ce qu'une machine ne voit pas.

## Passe 1 — Forme (conventions du projet)

| Critère | À vérifier |
|---------|------------|
| **Frontmatter requis** | `title`, `slug`, `tags`, `created`, `updated`, `summary`, `draft` tous présents |
| **`draft` explicite** | Le champ existe. Un `draft` absent = note **publiée** par le build |
| **Frontmatter v2** | `pillar` présent et cohérent avec le dossier. `level` présent et défendable |
| **`verified`** | Présent si et seulement si la note est de forme *recette* |
| **`related`** | Liste tous les slugs liés depuis le corps, footer compris — pas seulement ceux du footer |
| **Slug** | Kebab-case strict, identique au nom de fichier, **unique dans tout le garden** |
| **Tags** | 5 maximum · 1er tag = nom du dossier · 2 domaines maximum et seulement pour une note-pont · `architecture` absent · vocabulaire réservé respecté · `dotnet` seulement si .NET est le sujet |
| **Dates** | Format `YYYY-MM-DD` sans guillemets |
| **H1** | Première ligne du corps, identique au `title` |
| **Forme** | La note suit un des 3 squelettes (concept / arbitrage / recette), sans les mélanger |
| **Longueur** | ≤ 250 lignes. Au-delà : proposer un découpage précis, pas une coupe à la hache |
| **Footer** | *Note liée* présent, italique, chemin **sans `.md`**, singulier si 1 lien. `./slug` et `../cat/slug` sont tous deux valides, mais le chemin doit résoudre vers un fichier réel |
| **Diagrammes** | Un `mermaid` manque-t-il là où il éclairerait l'architecture ? Un `event-storming` est-il utilisable ? |
| **Langue** | Français, tutoiement, ton pédagogique |

## Passe 2 — Fond (qualité du contenu)

Évaluer dans cet ordre :

1. **Complétude** — quels concepts-clés du sujet sont absents ? Les lister explicitement.
2. **Exactitude** — affirmations incorrectes, incomplètes ou trompeuses ? Citer la phrase exacte + la correction.
3. **Exemples** — chaque concept abstrait est-il illustré par du concret (code réel, scénario) ? Sinon, proposer l'exemple.
4. **Équilibre** — limites, contre-indications et coûts sont-ils mentionnés ? Une note qui ne vend que les avantages est incomplète.
5. **Verdict** *(forme arbitrage uniquement)* — la note tranche-t-elle vraiment ? Un « ça dépend » sans conditions explicites est un échec de la note.
6. **Liens internes** — quelles notes existantes du garden auraient dû être citées ? Lire la liste des notes avant de conclure.
7. **Pont craft ↔ IA** — une note IA peut-elle s'appuyer sur une note craft existante (idempotence, frontières de contexte, fiabilité) ? C'est la valeur différenciante du garden : la signaler quand elle est manquée.
8. **Profondeur** — stub (définitions sans substance) ou vraie compréhension opérationnelle ? Quelqu'un qui ne connaît pas le sujet s'en sort-il après lecture ?

## Passe 3 — Capsule agent et fraîcheur

La section `## Pour un agent` est ce qui rend le garden exécutable par une machine. Elle se critique séparément, avec ses propres critères.

| Critère | À vérifier |
|---------|------------|
| **Présence** | Section `## Pour un agent` en fin de corps, avant le footer. Obligatoire sur toute note en `draft: false` |
| **Volume** | 3 à 8 lignes. Moins = capsule creuse. Plus = chapitre déguisé |
| **Impératif** | Chaque ligne énonce une règle, pas une observation. « Il est préférable de » est à réécrire |
| **Vérifiable** | Un relecteur peut répondre oui/non en regardant du code. Sinon, la règle est décorative |
| **Autoportante** | Aucune ligne ne renvoie au corps (« comme vu plus haut »). Un agent lira souvent la capsule seule |
| **Non redondante** | Aucune ligne ne reformule le `summary` |
| **Signaux d'alerte** | Au moins un `**Signal d'alerte**` quand le sujet a des symptômes de mauvaise application |

**Contrôle de fraîcheur :**

- Note de forme *recette* dont `verified` dépasse **6 mois** → 🟡, proposer une revérification de l'outillage.
- Toute note dont `updated` dépasse **18 mois** → 🟡, signaler sans dramatiser : un concept vieillit bien, un outil non.
- Version d'outil, flag CLI ou chemin de fichier dans une note de forme *concept* → 🟡, déplacer vers une recette. C'est le principal vecteur de pourrissement du garden.

## Format de sortie obligatoire

```
## Critique — [titre de la note]

### 🔴 Bloquant (publiable uniquement après correction)
- [problème] → [correction précise]

### 🟡 À améliorer (important mais pas bloquant)
- [problème] → [suggestion précise]

### 🟢 Optionnel (enrichissement)
- [idée d'amélioration]

### ✅ Points forts
- [ce qui fonctionne bien — ne pas laisser vide]

### Verdict
[Une phrase : publiable telle quelle, publiable après corrections mineures, ou à réécrire ?]
```

## Niveaux de sévérité

| Niveau | Exemples |
|--------|---------|
| 🔴 **Bloquant** | Définition incorrecte · concept-clé manquant · `draft: false` sur une note incomplète · slug incohérent avec le nom de fichier · **slug en collision avec une autre note** · **lien interne vers une note inexistante** · champ requis manquant · arbitrage sans verdict |
| 🟡 **À améliorer** | Exemple concret absent · section « Limites » absente · footer manquant · H1 ≠ title · **tag `architecture`** · plus de 5 tags · 1er tag ≠ dossier · extension `.md` dans un lien · `related` incomplet par rapport aux liens du corps · **capsule absente sur une note publiée** · **capsule non vérifiable** · `verified` périmé · outillage daté dans une note concept |
| 🟢 **Optionnel** | Diagramme qui enrichirait · lien interne supplémentaire · « Pour aller plus loin » étoffé · pont craft ↔ IA à exploiter |

## Erreurs fréquentes du critique

| Erreur | Correction |
|--------|-----------|
| Critiquer uniquement le fond | Les trois passes, dans l'ordre, toujours |
| Refaire à la main le travail de l'audit | Lancer `audit-garden.mjs` d'abord, puis critiquer ce qu'il ne voit pas |
| Tout mettre au même niveau | Classer par sévérité — bloquant ≠ optionnel |
| Rester vague (« manque d'exemples ») | Être précis : « Le Value Object n'illustre pas l'immutabilité — ajouter `var m = new Money(10, "EUR"); m = m.Add(5);` » |
| Valider une capsule parce qu'elle existe | Une capsule qui reformule le résumé ne vaut pas mieux qu'une capsule absente |
| Oublier les points forts | La section ✅ est obligatoire — une critique sans points forts n'est pas équilibrée |
| Ne pas vérifier les liens internes | Lire la liste des notes du garden avant de conclure |
