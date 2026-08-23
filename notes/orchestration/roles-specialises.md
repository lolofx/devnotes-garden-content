---
title: "Pourquoi spécialiser ses agents"
slug: roles-specialises
tags: [orchestration, agents, prompt]
pillar: ai
level: fondation
created: 2026-08-23
updated: 2026-08-23
summary: "Un agent qui cadre, code et vérifie dans la même conversation est juge et partie sur son propre travail : la spécialisation par rôle sépare des points de vue, pas seulement des tâches."
draft: true
related: [patterns-multi-agents, tdd-a-trois-agents, introduction-ddd]
---

# Pourquoi spécialiser ses agents

Demander à un seul agent de cadrer le besoin, écrire le code, puis vérifier que ce code est bon revient à demander à quelqu'un de corriger sa propre copie. Ce n'est pas un problème de compétence : l'agent sait faire chacune de ces trois choses prises isolément. C'est un problème de posture — il ne change pas de point de vue au sein d'une même conversation, parce que le contexte qui l'a mené à sa solution est aussi celui avec lequel il l'évalue.

Spécialiser ses agents, c'est confier chaque rôle — cadrer, planifier, implémenter, tester, reviewer, rédiger — à une instance différente, avec son propre contexte. Le gain n'est pas cosmétique. Il tient à deux mécanismes précis.

## Les rôles types

- **Cadrer** — transformer une demande floue en objectif vérifiable
- **Planifier** — découper l'objectif en étapes ordonnées
- **Implémenter** — produire le changement
- **Tester** — écrire et exécuter la vérification, indépendamment de l'implémentation
- **Reviewer** — juger le résultat sans avoir produit le résultat
- **Rédiger** — documenter ou communiquer le résultat à un tiers

Toutes les tâches ne justifient pas les six rôles. Ce qui justifie la séparation, c'est la présence d'un des deux mécanismes ci-dessous.

## Le conflit d'intérêt : un agent ne juge pas bien ce qu'il vient de produire

C'est l'argument central. Quand tu demandes au même agent « corrige ce bug puis dis-moi si c'est bon », son contexte au moment de juger contient déjà tout le raisonnement qui l'a mené à sa solution : les contraintes qu'il a satisfaites, les alternatives qu'il a écartées, les cas qu'il a — ou n'a pas — envisagés. Ce contexte est précisément ce qui biaise le jugement : l'agent évalue son travail à l'aune de son propre cadre, pas à l'aune de l'exigence réelle. Un agent qui juge son propre travail le valide presque toujours, non par complaisance, mais parce qu'il n'a plus accès à un point de vue extérieur au sien.

Séparer les rôles, ce n'est pas ajouter un contrôle qualité en plus. C'est fabriquer un second point de vue qui n'a **pas** hérité du raisonnement du premier — il ne voit que le résultat, comme le verrait quelqu'un qui découvre le code.

## Deuxième argument : un contexte étroit est un agent plus fiable

Un agent dont le contexte entier tient en « voici un diff, voici les critères d'acceptation, dis si ça les remplit » ne peut pas être influencé par les six tours de négociation qui ont précédé l'implémentation — il ne les a jamais vus. Moins d'instructions concurrentes, moins de bruit accumulé sur des dizaines de tours, moins de dérive entre l'objectif initial et l'état courant de la conversation. Le rétrécissement du contexte n'est pas qu'une économie de jetons : c'est ce qui rend l'agent prévisible sur son unique tâche.

## Un rôle d'agent est un bounded context

Le pont avec le DDD est direct. Un [bounded context](../ddd/introduction-ddd) est une frontière explicite à l'intérieur de laquelle un vocabulaire et un objectif ont un sens unique — le mot « Client » ne signifie pas la même chose en Facturation et en Support, et vouloir un modèle « Client » universel produit une usine à gaz. Un rôle d'agent est exactement ça : à l'intérieur du rôle « reviewer », le mot « bon » veut dire « remplit les critères d'acceptation » ; à l'intérieur du rôle « implémenter », il veut dire « compile et passe les tests que j'ai écrits en cours de route ». Confondre les deux dans un seul agent, c'est vouloir un agent universel — et ça produit la même dérive qu'un modèle métier universel : un objet qui doit tout signifier finit par ne rien signifier de précis.

## Exemple concret

Un agent unique qui implémente puis se relit :

```text
[agent] J'ai corrigé la race condition en ajoutant un verrou autour de
        l'écriture du solde. Les tests unitaires passent.
[agent] Relecture : le correctif est cohérent avec l'approche choisie,
        le verrou est posé au bon endroit compte tenu des contraintes
        identifiées plus haut. Validé.
```

Le reviewer n'a rien vérifié d'indépendant : il a confirmé que le code correspond à son propre plan. Il n'a par exemple pas remarqué que le verrou ne protège pas le chemin de lecture concurrent — parce que ce chemin n'était pas dans son cadre au moment d'écrire le correctif.

Deux agents séparés, contexte non partagé au-delà du handoff :

```text
[implémenteur] Correctif livré : verrou sur l'écriture du solde.
               Tests unitaires ajoutés : test_ecriture_concurrente.
[reviewer]     Lecture du diff seul, sans l'historique de conception.
               Le verrou protège l'écriture mais pas la lecture du
               solde dans CalculerDécouvert() — race condition
               résiduelle. Refusé.
```

Le reviewer, n'ayant pas le raisonnement initial, lit le code pour ce qu'il est plutôt que pour ce qu'il était censé être.

## Limites : le coût de la spécialisation

La spécialisation n'est pas gratuite. Chaque rôle supplémentaire ajoute un passage de contexte (voir le handoff entre agents), donc de la latence, du coût, et un point où l'information peut se perdre ou se déformer. Un pipeline à six rôles pour corriger une faute de frappe est une perte de temps pure.

Un seul agent suffit quand la tâche n'a pas de véritable enjeu de jugement — formatage, renommage mécanique, application d'un patch déjà validé ailleurs — ou quand l'itération est si bon marché qu'une erreur non détectée coûte moins cher que la coordination pour l'éviter. La règle pratique : spécialise dès qu'un agent devrait à la fois produire une décision et la contrôler ; ne spécialise pas quand il n'y a rien à contrôler.

## Pour aller plus loin

- Le biais de confirmation en évaluation humaine — la même dynamique existe côté revue de code humaine, d'où la convention qu'un auteur ne s'auto-approuve pas
- La séparation des pouvoirs comme design pattern organisationnel — même logique que le conflit d'intérêt, appliquée à des rôles plutôt qu'à des personnes

## Pour un agent

> **Règle** — Un agent qui a produit un résultat ne doit pas être le seul à décider s'il est acceptable.
> **Règle** — Un rôle a un seul objectif et un seul vocabulaire ; s'il en a deux, découpe-le en deux rôles.
> **Règle** — Le contexte transmis à un reviewer ne contient pas le raisonnement de l'implémenteur, seulement le résultat à juger.
> **Signal d'alerte** — Un agent qui écrit « validé » sans référence à un critère extérieur à son propre plan.
> **Signal d'alerte** — Un seul prompt système qui liste plus de deux rôles distincts (« tu codes ET tu review ET tu déploies »).

---

*Notes liées : [Patterns d'orchestration multi-agents](./patterns-multi-agents) — une fois les rôles définis, comment les enchaîner ou les paralléliser. [TDD à trois agents](../aidd/tdd-a-trois-agents) — la spécialisation appliquée jusqu'à rendre la triche impossible. [Introduction au DDD](../ddd/introduction-ddd) — le bounded context, l'argument qui justifie la frontière entre rôles.*
