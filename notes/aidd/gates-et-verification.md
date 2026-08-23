---
title: "Gates et vérification"
slug: gates-et-verification
tags: [aidd, evaluation, reliability]
created: 2026-08-23
updated: 2026-08-23
summary: "Une gate est un point de passage qu'une machine peut trancher seule — pas une opinion d'agent sur la qualité de son propre travail."
draft: true
pillar: ai
level: avance
related: [sdlc-pilote-par-ia, evaluer-un-agent, boucle-et-auto-correction, introduction-ddd]
---

# Gates et vérification

Une **gate** est un point de passage qui autorise ou refuse la suite du cycle. Sa définition tient en une phrase, et elle est plus stricte qu'elle n'y paraît : **une gate est une condition vérifiable par une machine.** « L'agent estime que son implémentation est correcte » n'est pas une gate, c'est une opinion — et les agents, comme les développeurs pressés, sont structurellement optimistes sur leur propre travail. Une gate ne demande pas un avis, elle exécute un contrôle et lit un résultat binaire.

## Le problème que résout une gate vérifiable

Laissé à son propre jugement, un agent a un biais mesurable : il tend à conclure que son travail répond à la demande, parce que produire cette conclusion fait partie du même geste que produire le travail. Ce n'est pas de la malhonnêteté, c'est un manque de recul structurel — la même raison pour laquelle un développeur ne relit jamais aussi bien son propre code qu'un collègue. Une gate retire ce jugement de la main de celui qui a produit le travail et le confie à un contrôle qui ne peut pas être influencé par l'envie que ça passe. C'est la question que pose aussi [Évaluer un agent](../agents/evaluer-un-agent) à l'échelle d'une sortie isolée : une réponse qui a l'air bonne ne prouve rien tant qu'elle n'a pas été mise à l'épreuve d'un critère externe.

## Les gates le long du cycle

Le long de la [chaîne cadrer-planifier-implémenter-valider-reviewer-livrer](./sdlc-pilote-par-ia), plusieurs gates s'enchaînent :

| Gate | Type | Qui tranche |
|---|---|---|
| Le plan est accepté | Bloquante | Humain, ou agent de revue de plan distinct du planificateur |
| Les tests automatisés passent | Bloquante | Machine — code de sortie |
| Le lint et le build passent | Bloquante | Machine — code de sortie |
| La revue indépendante conclut positivement | Bloquante | Agent reviewer distinct de l'implémenteur |
| La couverture ou la performance restent dans une plage acceptable | Signal | Machine — informe sans arrêter le flux |
| L'humain accepte le résultat final | Bloquante | Humain |

Une **gate bloquante** arrête le flux tant qu'elle n'est pas satisfaite : rien en aval ne démarre. Un **signal** informe sans bloquer — une couverture de test en légère baisse mérite d'être vue, pas forcément d'arrêter la livraison. Confondre les deux produit soit un pipeline paralysé par des détails, soit un pipeline qui ignore de vrais problèmes faute d'avoir jamais bloqué sur rien.

## Pourquoi la même main ne peut pas tenir sa propre gate

Une gate tenue par l'agent qui a produit ce qu'elle contrôle ne vaut rien, quelle que soit la rigueur apparente du contrôle : l'agent qui écrit le code et déclare ensuite « mes tests passent, c'est bon » contrôle une affirmation qu'il a lui-même les moyens de rendre vraie, en écrivant des tests faibles s'il le faut. Une gate technique (tests, lint, build) échappe en partie à ce piège parce qu'elle est mécanique — mais une gate de revue ne l'évite que si le reviewer est un agent ou un humain distinct de celui qui a produit le travail examiné. Et une gate qui fait tourner un agent en boucle jusqu'à satisfaction n'a de sens que si le critère d'arrêt est lui-même vérifiable mécaniquement, sinon la [boucle d'auto-correction](../orchestration/boucle-et-auto-correction) tourne indéfiniment sur son propre avis.

## Exemple concret d'une gate exécutable

Prends la gate « les tests automatisés passent », appliquée au module modifié par l'Implémenteur :

```text
Commande : exécuter la suite de tests du module modifié
Critère  : code de sortie 0, et zéro test signalé en échec dans le résumé
Échec    : le diff retourne à l'agent implémenteur avec la sortie complète des
           tests en échec — jamais un simple "les tests ont échoué" sans le détail
```

Rien dans cette gate ne demande un avis. Le code de sortie et le nombre de tests en échec sont des faits, pas des impressions — c'est précisément ce qui la rend digne de bloquer le flux. Une gate de revue suit la même forme, avec un critère moins mécanique mais tout aussi tranché : le reviewer répond « accepté » ou « renvoyé, avec la raison précise », jamais « ça a l'air bien ».

## Pont DDD — une gate est un invariant

Une gate n'est pas une bonne pratique optionnelle, c'est un [invariant](../ddd/introduction-ddd) du processus : une condition qui doit être vraie à chaque passage, protégée à la frontière plutôt que confiée à la bonne volonté de qui produit le travail. De la même façon qu'un aggregate root refuse une opération qui violerait une règle métier plutôt que de faire confiance à l'appelant pour ne pas la violer, une gate refuse de laisser passer un changement qui ne satisfait pas sa condition — elle ne suggère pas, elle bloque.

## Limites

Empiler les gates a un coût qui grandit plus vite que le bénéfice : chaque gate ajoute de la latence, et une gate qui bloque souvent pour un risque marginal apprend à l'équipe à la contourner plutôt qu'à la satisfaire — elle devient un rituel qu'on désactive dans les cas urgents, ce qui la rend inutile précisément quand elle serait la plus utile. Le nombre de gates bloquantes doit rester proportionné à ce qui casserait vraiment quelque chose si ça passait : mieux vaut trois gates respectées systématiquement que dix gates dont deux sont silencieusement ignorées.

## Pour aller plus loin

- Le concept de *quality gate* en intégration continue, dont cette note reprend le principe en le rendant explicite pour un flux piloté par agents.
- La distinction entre contrôle et confiance dans les systèmes de revue de code humains, directement transposable à la revue par agent.

## Pour un agent

> **Règle** — Une gate n'existe que si son critère de succès est vérifiable mécaniquement, sans jugement.
> **Règle** — L'agent qui produit un travail ne tient jamais la gate bloquante qui le contrôle.
> **Règle** — Un échec de gate renvoie le détail complet du contrôle, jamais un simple statut.
> **Signal d'alerte** — Une gate dont le critère de succès est « l'agent confirme que c'est bon ».
> **Signal d'alerte** — Une gate bloquante contournée régulièrement en cas d'urgence, sans jamais être révisée.

---

*Notes liées : [Un cycle de développement piloté par des agents](./sdlc-pilote-par-ia) — où les gates s'insèrent dans le cycle. [Évaluer un agent](../agents/evaluer-un-agent) — la même exigence de critère externe appliquée à une sortie isolée. [Boucles et auto-correction](../orchestration/boucle-et-auto-correction) — pourquoi une boucle sans gate vérifiable diverge. [Introduction au DDD](../ddd/introduction-ddd) — l'invariant protégé à la frontière de l'agrégat, même logique qu'une gate protégée à la frontière du processus.*
