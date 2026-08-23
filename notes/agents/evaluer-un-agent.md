---
title: "Évaluer un agent"
slug: evaluer-un-agent
tags: [agents, evaluation]
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

Voici l'erreur la plus répandue : traiter la modification d'un prompt, l'ajout d'un outil ou le changement de modèle sous-jacent comme une opération anodine, sans repasser par une vérification. Les trois ne sont pourtant pas de même nature, et il vaut mieux le dire que de les mettre dans le même sac. Modifier le **schéma d'un outil**, c'est changer un contrat au sens strict — le [port](../hexagonal/ports-et-adapters) que le modèle voit change, et tout ce qui en dépend doit être revérifié. Changer de **modèle** ou reformuler un **prompt** ne touche aucun contrat : ça change la logique de décision elle-même, sans que rien dans la signature ne bouge. C'est précisément ce qui rend ces deux-là plus dangereux — un changement de contrat se voit dans un diff d'interface, une dérive de comportement ne se voit que dans une mesure.

Une suite d'évaluation d'agent joue exactement le rôle d'une suite de tests de non-régression côté code : elle tourne à chaque changement de prompt, de modèle ou d'outil, et elle compare le taux de réussite avant/après sur le même jeu de cas. Une baisse mesurée déclenche l'investigation avant le déploiement, pas après.

## Limites : ce qui ne s'évalue pas automatiquement

- **Le coût d'une suite d'évaluation n'est pas nul** — chaque cas de test exécute l'agent réellement (tours de boucle, appels de modèle, appels d'outils), avec le coût et la latence que ça implique. Une suite trop large devient trop lente pour tourner à chaque changement, et se désactive en pratique.
- **Un jeu de cas figé vieillit** — il capture les cas connus au moment où il a été écrit, pas les nouveaux modes d'échec qui apparaissent avec l'usage réel. Il a besoin d'être enrichi, pas seulement rejoué.
- **Certains critères de qualité résistent à toute formalisation** — le ton d'une réponse, sa pertinence dans un contexte relationnel avec l'utilisateur, ne se réduisent ni à une assertion ni fiablement à un juge LLM. Ces dimensions restent à la charge d'une revue humaine, périodique plutôt que systématique.

## Un cas se rejoue, il ne se joue pas

C'est le point qui manque le plus souvent, et il annule tout le reste s'il est oublié. Un agent est non déterministe : **une exécution ne prouve rien.** Un cas qui passe une fois peut échouer la suivante sans qu'une seule ligne n'ait changé, et un cas qui échoue une fois n'est pas nécessairement une régression.

Un cas de test d'agent se rejoue donc N fois, et ce qu'on lit n'est pas un `pass` / `fail` mais un **taux de réussite** — 18 succès sur 20, par exemple. Une régression, c'est une baisse de ce taux entre deux versions, pas un échec isolé. Le N dépend de l'enjeu : 3 à 5 pour un signal grossier en développement, 20 et plus pour une décision de déploiement.

Deux conséquences pratiques :

- **Un seuil se fixe à l'avance.** « On déploie si le taux ne baisse pas de plus de 2 points » est une gate ; « le résultat a l'air stable » n'en est pas une.
- **Le coût explose vite.** 50 cas × 20 exécutions, c'est 1000 appels par passage de suite. C'est ce qui force à garder le jeu de cas petit et discriminant plutôt que large et redondant.

Corollaire moins connu : à force d'ajuster un prompt jusqu'à ce que la suite passe, on finit par optimiser pour la suite plutôt que pour la tâche. Un jeu de cas figé trop longtemps cesse de mesurer la qualité et se met à mesurer sa propre satisfaction.

## Pour aller plus loin

- La métrique `pass@k` issue de l'évaluation de génération de code : la formalisation du « rejouer N fois » utilisée ici
- La littérature sur les biais du juge LLM (position, verbosité, style) et sur sa calibration contre un jugement humain
- La loi de Goodhart appliquée aux suites d'évaluation : quand la mesure devient la cible, elle cesse d'être une bonne mesure

## Pour un agent

> **Règle** — Un cas de test d'agent a une condition de succès vérifiable par une machine, jamais seulement "la réponse semble correcte".
> **Règle** — Un changement de prompt, de modèle ou d'outil est un changement de contrat : il se revérifie avec la suite d'évaluation avant tout déploiement.
> **Règle** — Préférer une assertion mécanique à un juge LLM chaque fois que le critère peut se formaliser.
> **Signal d'alerte** — Un juge LLM utilisé sans avoir été calibré au préalable contre un jugement humain.
> **Signal d'alerte** — Une suite d'évaluation qui n'a pas tourné depuis le dernier changement de prompt.
> **Signal d'alerte** — Une conclusion de régression tirée d'une seule exécution d'un cas.

---

*Notes liées : [Anatomie d'un agent](./anatomie-d-un-agent) — le non-déterminisme qui rend l'évaluation nécessaire. [Gates et vérification](../aidd/gates-et-verification) — ce que devient une évaluation quand elle autorise ou refuse la suite. [TDD à trois agents](../aidd/tdd-a-trois-agents) — l'évaluation portée par un rôle qui n'implémente pas. [Architecture Hexagonale — Ports & Adapters](../hexagonal/ports-et-adapters) — le contrat qui, une fois changé, oblige à tout revérifier.*
