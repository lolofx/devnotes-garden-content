---
title: "Les artefacts de contexte"
slug: artefacts-de-contexte
tags: [aidd, contexte]
created: 2026-08-23
updated: 2026-08-23
summary: "Un agent vaut ce que vaut le contexte qu'on lui donne — et ce contexte se construit avec des artefacts durables, à condition qu'une même convention n'existe jamais à deux endroits."
draft: false
pillar: ai
level: intermediaire
related: [sdlc-pilote-par-ia, contexte-et-memoire, anatomie-d-un-agent, roles-specialises, integration-events-vs-domain-events]
---

# Les artefacts de contexte

Un agent commence chaque session sans mémoire de la précédente. Ce qu'il sait de ton projet — ses conventions, ses décisions, ses interdits — vient uniquement de ce qui est chargé dans son contexte au moment où il travaille. Réexpliquer ces règles à chaque session ne passe pas à l'échelle et dérive inévitablement : deux explications orales du même sujet, à deux moments différents, ne se ressemblent jamais tout à fait. La solution est de construire des **artefacts de contexte** — des fichiers durables, versionnés avec le code, qui portent cette connaissance une fois pour toutes.

## Le problème que résout un artefact durable

Sans artefact, la connaissance du projet vit dans la tête de l'humain, qui la retransmet à chaque session avec des variations. Un agent qui reçoit « n'oublie pas qu'on committe sans signature » un jour et « pas de co-auteur dans les commits » le lendemain applique deux règles légèrement différentes, ni l'une ni l'autre fixée nulle part. Un artefact fige la règle une fois, dans un fichier que l'agent charge — pas que l'humain retape. C'est aussi ce qui rend un agent capable de traverser plusieurs sessions sans régresser : voir [Contexte et mémoire d'un agent](../agents/contexte-et-memoire) pour ce que la fenêtre de contexte volatile change à cette équation.

## Les familles d'artefacts, par rôle

Le nom du fichier ou l'outil qui le porte importe moins que **son rôle** : quand il se charge, et ce qu'il fige.

| Besoin | Famille | Se charge |
|---|---|---|
| Une contrainte toujours vraie (« jamais de secret en clair ») | **Règle** | En permanence, à chaque session |
| Un savoir-faire (« comment on structure une note ici ») | **Procédure / skill** | Quand la tâche le déclenche |
| Un rôle avec son propre périmètre (« relire un diff sans l'avoir écrit ») | **Agent spécialisé** | Sur invocation explicite — voir [Anatomie d'un agent](../agents/anatomie-d-un-agent) |
| Une action automatique à un moment du cycle (« lancer les gates avant de livrer ») | **Déclencheur / hook** | Au point du cycle où elle s'applique |
| Une décision déjà prise (« on a choisi PostgreSQL, pas Mongo ») | **Mémoire** | En permanence, jusqu'à révision explicite |

La distinction entre Règle et Mémoire est subtile mais réelle : une règle contraint un comportement futur (« ne fais jamais X ») ; une mémoire enregistre un choix passé (« on a décidé Y, pour telle raison ») que l'agent doit respecter sans le rejouer à chaque fois.

## Le piège central : la duplication

Le risque qui domine tous les autres n'est pas l'artefact manquant, c'est l'artefact **dupliqué**. Une même convention écrite dans deux fichiers finit toujours, tôt ou tard, par y dire deux choses légèrement différentes — l'un est mis à jour, l'autre oublié. L'agent qui charge les deux ne sait pas lequel prime ; en pratique, il applique souvent le dernier qu'il a lu, pas le bon.

## Exemple concret

Une règle de format de commit dupliquée entre une règle globale et un skill de release :

```yaml
# rules/commit-format.md — la règle globale
format: "type(scope): résumé court à l'impératif, en français"
```

```text
# procedures/release.md — extrait, tel qu'il ne devrait pas être écrit
Avant de committer, utilise ce format :
"type: résumé, en anglais, avec ticket JIRA en suffixe"
```

Les deux fichiers existent pour des raisons légitimes — l'un pour tout usage, l'autre pour un skill précis — et pourtant ils se contredisent. Le correctif n'est pas de choisir laquelle des deux versions est la bonne : c'est de retirer la définition de la procédure et d'y renvoyer vers la règle unique.

```text
# procedures/release.md — après correction
Avant de committer, applique le format défini dans rules/commit-format.md.
Ne redéfinis pas ce format ici.
```

Une convention n'existe qu'à un seul endroit ; tous les autres artefacts qui en ont besoin y renvoient, ils ne la recopient jamais.

## Pont DDD — la même exigence qu'une source unique de vérité

Cette règle n'est pas propre aux agents : c'est la même exigence qu'une [source unique de vérité entre bounded contexts](../ddd/integration-events-vs-domain-events). Un Integration Event porte un contrat unique, publié par le contexte propriétaire de la donnée — les autres contextes le consomment, ils ne redéfinissent jamais leur propre version divergente de la même information. Un artefact de contexte suit la même discipline : une convention a un propriétaire unique, et tout le reste du corpus y renvoie plutôt que de la recopier.

## Limites

L'excès inverse existe aussi : empiler des dizaines de règles chargées en permanence noie le contexte utile sous du bruit que l'agent ne peut plus vraiment prioriser. Une règle qui ne s'applique qu'à un cas rare n'a pas sa place dans le contexte permanent — elle appartient à un skill chargé seulement quand ce cas se présente. Le bon réflexe est le même que pour les gates : garder le socle permanent minimal, et déplacer tout ce qui est conditionnel vers un artefact qui ne se charge que lorsqu'il sert.

Il existe une limite plus insidieuse, et elle attaque la thèse même de cette note. « Ne jamais dupliquer, toujours renvoyer vers la référence » suppose que l'artefact référencé sera **effectivement chargé** au moment où il compte. Or la [fenêtre de contexte est étroite et volatile](../agents/contexte-et-memoire), et un [rôle spécialisé](../orchestration/roles-specialises) reçoit par construction un contexte réduit. Une procédure qui dit « applique le format défini dans la règle globale » ne garantit pas que l'agent qui l'exécute aura cette règle sous les yeux : le renvoi peut être silencieusement cassé, et l'agent inventera alors sa propre version — soit exactement la divergence qu'on prétendait éviter. Le renvoi ne suffit pas : il faut aussi s'assurer que l'artefact référencé est chargeable, et vérifiable, depuis le contexte de celui qui doit l'appliquer.

## Pour aller plus loin

- Le principe DRY (*Don't Repeat Yourself*) appliqué au contexte d'un agent plutôt qu'au code.
- La notion de *single source of truth*, issue de la gestion de configuration, transposée aux instructions données à un agent.

## Pour un agent

> **Règle** — Une convention n'est écrite qu'à un seul endroit ; tout autre artefact qui la mentionne y renvoie par référence.
> **Règle** — Une contrainte permanente va dans une règle chargée en continu ; une contrainte conditionnelle va dans un skill chargé à la demande.
> **Règle** — Avant d'ajouter une règle, vérifier qu'elle n'existe pas déjà ailleurs sous une autre forme.
> **Signal d'alerte** — Deux fichiers de contexte qui décrivent la même convention avec des mots différents.
> **Signal d'alerte** — Un agent qui applique une règle visiblement obsolète alors qu'une version à jour existe ailleurs.

---

*Notes liées : [Un cycle de développement piloté par des agents](./sdlc-pilote-par-ia) — comment les artefacts alimentent chaque étape du cycle. [Contexte et mémoire d'un agent](../agents/contexte-et-memoire) — ce que la fenêtre de contexte volatile impose à ces artefacts. [Anatomie d'un agent](../agents/anatomie-d-un-agent) — l'agent spécialisé comme famille d'artefact à part entière. [Events de domaine vs Events d'intégration](../ddd/integration-events-vs-domain-events) — la même exigence de source unique de vérité, appliquée aux bounded contexts.*
