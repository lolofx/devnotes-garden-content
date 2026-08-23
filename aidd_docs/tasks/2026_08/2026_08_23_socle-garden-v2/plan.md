---
objective: "Le garden dispose d'un socle de conventions v2 (taxonomie 2 piliers, frontmatter enrichi, politique de tags, 3 formes de note, capsule agent), d'une source de vérité unique, d'un audit automatisé, et expose un /llms.txt consommable par un agent."
status: in-progress
---

# Plan: Socle v2 du digital garden

## Overview

| Field      | Value                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| **Goal**   | Poser la structure qui permettra d'écrire le pilier IA sans dette, sans rédiger aucune note de contenu          |
| **Source** | Demande utilisateur (texte), branche `feat/socle-garden-v2`, audit du corpus du 2026-08-23                      |

## Phases

| #   | Phase                                     | File                         |
| --- | ----------------------------------------- | ---------------------------- |
| 1   | Conventions v2 dans les skills du repo    | [`phase-1.md`](./phase-1.md) |
| 2   | Squelette de taxonomie du pilier IA       | [`phase-2.md`](./phase-2.md) |
| 3   | Script d'audit du garden                  | [`phase-3.md`](./phase-3.md) |
| 4   | Migration des 12 notes existantes         | [`phase-4.md`](./phase-4.md) |
| 5   | Consolidation de la source de vérité      | [`phase-5.md`](./phase-5.md) |
| 6   | Génération de /llms.txt côté app          | [`phase-6.md`](./phase-6.md) |

## Resources

| Source                                            | Verified                                                                                                   |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `https://garden.leplomb.work/rss.xml`             | Répond `200 text/xml` : Azure SWA sert les fichiers statiques existants avant le `navigationFallback`, donc `/llms.txt` sera servi sans toucher `staticwebapp.config.json` |
| `https://garden.leplomb.work/assets/content-index.json` | Répond `200 application/json` : l'index est déjà une API publique exploitable par un agent, il suffit de l'annoncer |
| `https://llmstxt.org`                             | Convention retenue pour le format `/llms.txt` : un H1, un blockquote de résumé, des sections H2 par thème, des items `- [titre](url) : résumé` |

## Decisions

| Decision                                                                                     | Why                                                                                                                                          |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Un seul garden, deux piliers portés par un champ `pillar`, pas deux repos                     | Le pont craft ↔ IA est la valeur différenciante du garden ; le séparer le détruirait                                                          |
| Les skills du repo sont l'unique source de vérité des conventions ; `CLAUDE.md` et `README.md` n'en sont que des routeurs | Trois copies des mêmes règles divergent toujours ; la duplication actuelle entre le repo et `~/.claude/skills/` en est déjà la preuve         |
| Frontmatter v2 strictement additif, aucun champ existant modifié ni renommé                   | `validateFrontMatter` n'exige que 6 champs et le build repasse tout champ inconnu tel quel dans `content-index.json` : coût nul, risque nul   |
| Taxonomie plate à un seul niveau sous `notes/`                                                | `deriveTheme` ne lit que `parts[notesIndex + 1]` : un sous-dossier serait invisible pour l'app                                                |
| Script d'audit en Node sans dépendance                                                        | Le garden est déjà consommé par une chaîne Node (build de l'app, `npx` dans `install-skills.sh`) : un seul runtime pour tout l'outillage du contenu |
| Aucun nouveau dossier tant qu'il n'a pas 3 notes                                              | 29 tags pour 12 notes montrent que la taxonomie dérive déjà ; le plafond doit être posé avant de doubler le corpus                            |
