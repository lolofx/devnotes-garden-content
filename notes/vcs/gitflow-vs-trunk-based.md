---
title: "GitFlow ou trunk-based : que choisir"
slug: gitflow-vs-trunk-based
tags: [vcs, gitflow, trunk-based, qa]
created: 2026-08-23
updated: 2026-08-23
summary: "Le critère qui tranche n'est ni la taille de l'équipe ni sa maturité, mais le nombre de versions que tu dois supporter en même temps."
draft: false
pillar: craft
level: avance
related: [gitflow-branches-et-flux, gitflow-ou-corriger-un-bug, gates-et-verification]
---

# GitFlow ou trunk-based : que choisir

[GitFlow](./gitflow-branches-et-flux) a été publié en 2010, et son propre auteur a ajouté dix ans plus tard un avertissement en tête de son article : si vous livrez en continu un logiciel web dont une seule version existe, ce modèle n'est probablement pas pour vous. Cet avertissement est rarement lu, et la question continue d'être mal posée dans la plupart des équipes.

On y débat de la taille de l'équipe, du niveau des développeurs, parfois de la modernité de l'un ou l'autre modèle. Aucun de ces critères ne tranche. Celui qui tranche est ailleurs, et il est parfaitement objectif.

## Les options en présence

**GitFlow** repose sur deux branches permanentes, des branches de release, et une recette menée sur un périmètre figé. Le modèle suppose qu'une version est un **objet** : elle a une date, un contenu, un numéro, et parfois une durée de support pendant laquelle il faudra encore la corriger.

**Trunk-based** repose sur une seule branche partagée, des branches de très courte durée — moins d'une journée — et du code non terminé fusionné derrière des interrupteurs de fonctionnalité (*feature flags*) désactivés. Une seule version existe : celle qui tourne. Livrer du code et activer une fonctionnalité deviennent deux gestes séparés.

Ce ne sont pas deux étapes d'une même échelle de maturité. Ce sont deux réponses à deux contraintes de livraison différentes, et une équipe très mûre peut avoir d'excellentes raisons de rester sur le premier.

## Critères de choix

| Critère | GitFlow | Trunk-based |
|---|---|---|
| Versions supportées en parallèle | Plusieurs — c'est sa raison d'être | Une seule, obligatoirement |
| Rythme de livraison | Par cycle : semaine, mois | Continu, plusieurs fois par jour |
| Qui décide qu'une version est bonne | Une recette humaine sur périmètre figé | Des contrôles automatiques, à chaque commit |
| Coût d'un retour arrière | Redéployer le tag précédent | Désactiver un interrupteur |
| Le testeur travaille… | Sur une version figée, en fin de cycle | En continu, en production, derrière un interrupteur |
| Ce qui casse quand ça tourne mal | Back-merges oubliés, branches longues, fusions douloureuses | Code inachevé visible en production, interrupteurs jamais retirés |
| Prérequis non négociable | Un calendrier et quelqu'un pour recetter | Une suite de tests en laquelle on a réellement confiance |

La dernière ligne est celle qui décide de la faisabilité ; l'avant-dernière, de ce qu'on acceptera de payer. La première décide du reste.

## Verdict

**Le critère décisif est le nombre de versions que tu dois supporter simultanément.** Pas la taille de l'équipe, pas son niveau, pas l'année.

- **Plusieurs versions coexistent chez tes utilisateurs** — logiciel installé chez le client, application mobile en attente de validation d'un store, API versionnée avec engagement de support : **GitFlow**. Le modèle existe précisément pour ça, et aucune quantité de discipline trunk-based ne remplace une branche de maintenance quand il faut patcher une version que plus personne ne développe.
- **Une seule version tourne, et tu as une suite de tests en laquelle tu as vraiment confiance** : **trunk-based**. GitFlow n'ajoute alors qu'une cérémonie qui ne protège de rien, puisque le périmètre qu'il fige n'a plus d'existence pour personne.
- **Une seule version tourne, mais cette suite de tests n'existe pas** : **GitFlow, en transition**. C'est le seul cas où un modèle se choisit pour ce qu'il compense plutôt que pour ce qu'il apporte. La recette humaine sur branche figée est un filet ; retirer le filet avant d'avoir installé le harnais automatique ne rend pas l'équipe plus rapide, ça rend la production instable. La cible reste trunk-based, et le chemin pour y aller consiste à construire les [contrôles automatiques](../aidd/gates-et-verification), pas à supprimer les branches en espérant que la vitesse vienne d'elle-même.

Le cas hybride le plus courant est aussi le plus sain : trunk-based au quotidien, et une branche de maintenance ouverte **à la demande**, le jour où il faut réellement corriger une version ancienne. On ne paie la complexité de GitFlow que les semaines où elle sert.

## Quand se tromper coûte cher

**Trunk-based sans tests automatisés fiables** est l'erreur la plus chère des deux. Le point de contrôle a été retiré sans être remplacé : chaque fusion devient un pari sur la production. Le symptôme est reconnaissable, parce qu'il se présente comme une qualité — l'équipe est fière de « réparer en dix minutes » et compte ses retours arrière comme une preuve d'agilité, alors qu'ils mesurent l'absence de garde-fou. Un retour arrière rapide est une bonne chose ; en avoir besoin toutes les semaines n'en est pas une.

**GitFlow sur un produit à version unique livré en continu** est moins spectaculaire et bien plus insidieux. Il ne provoque aucun incident : il produit des branches de release qui vivent des semaines, des back-merges oubliés, des fonctionnalités terminées qui attendent un train. L'équipe ralentit sans que rien ne se casse, et met parfois des années à relier sa lenteur au modèle plutôt qu'à elle-même.

**Changer de modèle pour la mauvaise raison** est la troisième erreur, et la plus fréquente des trois. Basculer vers trunk-based parce que c'est ce que font les équipes qu'on admire, ou rester sur GitFlow parce que la procédure est écrite, revient dans les deux cas à choisir sans critère. Le seul motif valable de bascule est un changement réel de contrainte de livraison — le jour où la dernière version ancienne cesse d'être supportée, ou celui où un client exige une version installée chez lui.

## Pour aller plus loin

- L'avertissement ajouté par Vincent Driessen en tête de *A successful Git branching model* : l'auteur du modèle expliquant lui-même quand ne pas l'utiliser.
- *Accelerate* (Forsgren, Humble, Kim) — la corrélation, mesurée, entre durée de vie des branches et performance de livraison.
- Le *branch by abstraction*, la technique qui permet de mener un gros changement structurel sans jamais ouvrir de branche longue.

## Pour un agent

> **Règle** — Choisir le modèle de branches d'après le nombre de versions supportées en parallèle, jamais d'après la taille de l'équipe.
> **Règle** — Ne pas adopter trunk-based tant que des contrôles automatiques ne peuvent pas bloquer une livraison sans avis humain.
> **Règle** — En trunk-based, un travail inachevé n'est fusionné que derrière un interrupteur désactivé par défaut.
> **Règle** — En trunk-based, une branche qui vit plus d'une journée est traitée comme un défaut de découpe, pas comme une situation normale.
> **Signal d'alerte** — Un interrupteur de fonctionnalité encore présent dans le code après son activation définitive.
> **Signal d'alerte** — Une branche `release/*` qui vit plus longtemps que le cycle de développement qu'elle clôt.

---

*Notes liées : [GitFlow : les branches et le flux d'équipe](./gitflow-branches-et-flux) — le modèle que cet arbitrage met en balance. [Où corriger un bug avec GitFlow](./gitflow-ou-corriger-un-bug) — le coût de fonctionnement qui disparaît en trunk-based. [Gates et vérification](../aidd/gates-et-verification) — le prérequis à construire avant toute bascule.*
