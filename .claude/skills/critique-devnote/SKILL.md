---
name: critique-devnote
description: Use when reviewing or improving an existing note in the devnotes-garden-content repository. Covers form conventions, structure, technical accuracy, completeness, examples, and cross-links.
---

# critique-devnote

Critique structurée d'une note du devnotes-garden. Deux passes obligatoires : **forme** (conventions du projet) puis **fond** (qualité du contenu). Sortie en rapport structuré avec sévérité.

**REQUIRED SUB-SKILL:** Lire `write-devnote` avant de critiquer — c'est la référence des conventions attendues.

## Les deux passes

### Passe 1 — Forme (conventions du projet)

Vérifie point par point, signale tout écart :

| Critère | À vérifier |
|---------|------------|
| **Frontmatter** | Tous les champs présents : `title`, `slug`, `tags`, `created`, `updated`, `summary`, `draft` |
| **Slug** | Kebab-case strict, identique au nom de fichier sans `.md` |
| **Dates** | Format `YYYY-MM-DD` sans guillemets |
| **draft** | `true` = brouillon, `false` = publié — est-ce intentionnel ? |
| **H1** | Première ligne du corps, identique au `title` |
| **Footer** | Présence d'un *Note liée :* ou *Notes liées :* pointant vers des notes connexes. Singulier si 1 lien, pluriel si 2+. Italique. |
| **Structure** | Suit le template : intro → problème résolu → développement → limites → "Pour aller plus loin" → footer |
| **Diagrammes** | Un bloc `mermaid` est-il manquant là où il éclairerait l'architecture ? Un bloc `event-storming` est-il utilisable pour les concepts d'Event Storming ? |
| **Langue** | Français, tu, ton pédagogique |

### Passe 2 — Fond (qualité du contenu)

Évalue dans cet ordre :

1. **Complétude** — quels concepts-clés du sujet sont absents ? Lister explicitement.
2. **Exactitude** — y a-t-il des affirmations incorrectes, incomplètes ou trompeuses ? Citer la phrase exacte + correction.
3. **Exemples** — chaque concept abstrait est-il illustré par un exemple concret (code, scénario réel) ? Sinon, proposer.
4. **Équilibre** — la note mentionne-t-elle les limites, contre-indications, ou coûts du pattern ? Une note qui ne vend que les avantages est incomplète.
5. **Liens internes** — y a-t-il des notes existantes dans le garden qui devraient être référencées ? Lister celles qui manquent.
6. **Profondeur** — la note est-elle un stub (définitions sans substance) ou apporte-t-elle une vraie compréhension opérationnelle ? Quelqu'un qui ne connaît pas le sujet peut-il s'en sortir après lecture ?

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
[Une phrase : la note est-elle publiable telle quelle, publiable après corrections mineures, ou à réécrire ?]
```

## Niveaux de sévérité

| Niveau | Exemples |
|--------|---------|
| 🔴 **Bloquant** | Définition incorrecte, concept-clé manquant pour la compréhension, `draft: false` sur une note incomplète, slug incohérent |
| 🟡 **À améliorer** | Manque d'exemple concret, section "limites" absente, footer manquant, H1 ≠ title |
| 🟢 **Optionnel** | Diagramme qui enrichirait, lien interne supplémentaire, section "Pour aller plus loin" étoffée |

## Erreurs fréquentes du critique

| Erreur | Correction |
|--------|-----------|
| Critiquer uniquement le fond, ignorer la forme | Toujours faire les deux passes dans l'ordre |
| Tout mettre au même niveau | Classer par sévérité — bloquant ≠ optionnel |
| Rester vague ("manque d'exemples") | Être précis : "Le Value Object n'illustre pas l'immutabilité — ajouter `var m = new Money(10, "EUR"); m = m.Add(5);`" |
| Oublier les points forts | La section ✅ est obligatoire — une critique sans points forts n'est pas équilibrée |
| Ne pas vérifier les liens internes | Lire la liste des notes du garden avant de conclure |
