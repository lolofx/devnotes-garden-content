---
title: "Évaluer un agent"
slug: evaluer-un-agent
tags: [agents, evaluation, tdd]
pillar: ai
level: intermediaire
created: 2026-08-23
updated: 2026-08-23
summary: "Pourquoi une sortie qui a l'air bonne ne prouve rien quand elle est non déterministe, et comment construire une suite d'évaluation qui détecte une régression de prompt, de modèle ou d'outil."
draft: true
related: [anatomie-d-un-agent, gates-et-verification, tdd-a-trois-agents, ports-et-adapters]
---

# Évaluer un agent

« Ça a l'air de marcher » n'est pas une conclusion valable quand la sortie est non déterministe. Un agent qui réussit une tâche trois fois de suite en démo peut échouer la quatrième sans qu'aucune ligne de code n'ait changé — c'est la propriété centrale décrite dans [Anatomie d'un agent](./anatomie-d-un-agent). Évaluer un agent, c'est remplacer l'impression par une mesure reproductible.

## Le problème : l'intuition ne détecte pas une régression

Sur du code classique, une régression se voit : le test qui passait échoue. Sur un agent, il n'existe pas d'exécution de référence unique — deux exécutions de la même tâche peuvent emprunter des chemins d'outils différents et produire des sorties différentes, toutes deux acceptables. Sans mesure explicite, une dégradation du taux de réussite après un changement de prompt passe complètement inaperçue : l'agent "a l'air" de marcher toujours aussi bien, parce qu'on n'a testé qu'un seul cas, une seule fois.

## Un cas de test d'agent

Un cas de test d'agent a trois parties, et les trois sont nécessaires :

- **Entrée** — la tâche donnée à l'agent, aussi représentative que possible d'un cas réel.
- **Condition de succès vérifiable par une machine** — pas "la réponse semble correcte", mais un critère qu'un programme peut trancher sans ambiguïté : un fichier existe et contient telle valeur, un appel d'outil précis a eu lieu, un test unitaire généré passe.
- **Tolérance** — jusqu'où le chemin peut varier sans que ce soit un échec. Un agent qui résout la tâche en 3 tours ou en 7 tours peut être également valide ; un agent qui appelle un outil destructeur non prévu ne l'est jamais, quel que soit le résultat final.

```yaml
# Un cas de test d'agent — la condition de succès est vérifiable sans juge humain
name: corrige-le-bug-de-parsing-date
input: "Le parsing de date échoue sur les dates ISO avec fuseau horaire, corrige-le."
success_criteria:
  - type: file_changed
    path: src/parsing/date.ts
  - type: test_passes
    command: npm test -- date.test.ts
  - type: no_forbidden_tool_calls
    forbidden: [delete_file, run_migration]
tolerance:
  max_turns: 10
  allowed_paths_changed: [src/parsing/**, tests/parsing/**]
```

## Évaluation par assertion vs évaluation par juge LLM

Deux familles de conditions de succès, avec des garanties différentes :

- **Par assertion** — un critère mécanique et déterministe (test qui passe, fichier qui contient une valeur, code de sortie zéro). Reproductible à 100%, mais ne couvre que ce qu'on sait formuler comme une assertion — difficile pour juger la qualité d'une explication en langage naturel, par exemple.
- **Par juge LLM** — un second modèle évalue la sortie selon des critères qualitatifs (la réponse répond-elle vraiment à la question, est-elle bien sourcée). Couvre ce que l'assertion ne peut pas capturer, au prix de biais connus : préférence pour les réponses longues, tendance à mieux noter un style proche du sien, sensibilité à l'ordre de présentation quand on compare deux réponses.

Un juge LLM n'est pas une vérité de référence, c'est une mesure elle-même approximative — il se calibre contre un échantillon jugé par un humain, jamais adopté aveuglément dès la première version.

Le choix par défaut : assertion partout où c'est possible, juge LLM seulement pour ce qui résiste vraiment à la formalisation.

## Détecter les régressions — un prompt est un changement de code

Voici l'erreur la plus répandue : traiter la modification d'un prompt, l'ajout d'un outil ou le changement de modèle sous-jacent comme une opération anodine, sans repasser par une vérification. C'est exactement le raisonnement qui protège un contrat entre [ports et adapters](../hexagonal/ports-et-adapters) : quand le contrat d'un port change, tous les adapters qui l'implémentent doivent être revérifiés, parce qu'un appelant qui faisait confiance à l'ancien comportement peut désormais recevoir autre chose. Un prompt, un outil ou un modèle sont le contrat sur lequel repose tout le comportement de l'agent — les modifier sans repasser la suite d'évaluation revient à changer une interface sans revérifier ses implémentations.

Une suite d'évaluation d'agent joue exactement le rôle d'une suite de tests de non-régression côté code : elle tourne à chaque changement de prompt, de modèle ou d'outil, et elle compare le taux de réussite avant/après sur le même jeu de cas. Une baisse mesurée déclenche l'investigation avant le déploiement, pas après.

## Limites : ce qui ne s'évalue pas automatiquement

- **Le coût d'une suite d'évaluation n'est pas nul** — chaque cas de test exécute l'agent réellement (tours de boucle, appels de modèle, appels d'outils), avec le coût et la latence que ça implique. Une suite trop large devient trop lente pour tourner à chaque changement, et se désactive en pratique.
- **Un jeu de cas figé vieillit** — il capture les cas connus au moment où il a été écrit, pas les nouveaux modes d'échec qui apparaissent avec l'usage réel. Il a besoin d'être enrichi, pas seulement rejoué.
- **Certains critères de qualité résistent à toute formalisation** — le ton d'une réponse, sa pertinence dans un contexte relationnel avec l'utilisateur, ne se réduisent ni à une assertion ni fiablement à un juge LLM. Ces dimensions restent à la charge d'une revue humaine, périodique plutôt que systématique.

## Pour un agent

> **Règle** — Un cas de test d'agent a une condition de succès vérifiable par une machine, jamais seulement "la réponse semble correcte".
> **Règle** — Un changement de prompt, de modèle ou d'outil est un changement de contrat : il se revérifie avec la suite d'évaluation avant tout déploiement.
> **Règle** — Préférer une assertion mécanique à un juge LLM chaque fois que le critère peut se formaliser.
> **Signal d'alerte** — Un juge LLM utilisé sans avoir été calibré au préalable contre un jugement humain.
> **Signal d'alerte** — Une suite d'évaluation qui n'a pas tourné depuis le dernier changement de prompt.

---

*Notes liées : [Anatomie d'un agent](./anatomie-d-un-agent) — le non-déterminisme qui rend l'évaluation nécessaire. [Gates et vérification](../aidd/gates-et-verification) — ce que devient une évaluation quand elle autorise ou refuse la suite. [TDD à trois agents](../aidd/tdd-a-trois-agents) — l'évaluation portée par un rôle qui n'implémente pas. [Architecture Hexagonale — Ports & Adapters](../hexagonal/ports-et-adapters) — le contrat qui, une fois changé, oblige à tout revérifier.*
