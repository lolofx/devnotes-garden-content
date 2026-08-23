---
title: "Contexte et mémoire d'un agent"
slug: contexte-et-memoire
tags: [agents, contexte, memoire]
pillar: ai
level: fondation
created: 2026-08-23
updated: 2026-08-23
summary: "La fenêtre de contexte est une ressource rare et volatile : pourquoi la mémoire persistante d'un agent doit être écrite comme une projection pour la question qu'on posera plus tard, pas comme un journal brut."
draft: true
related: [anatomie-d-un-agent, handoff-et-contexte-partage, introduction-cqrs]
---

# Contexte et mémoire d'un agent

La fenêtre de contexte d'un agent est finie, chère, et elle disparaît à la fin de la session. C'est une ressource rare exactement comme la mémoire vive d'un programme : tout ce qu'elle contient s'oublie si rien n'est écrit ailleurs avant que la session se termine, se compacte ou change de sujet.

Confondre les deux formes de mémoire disponibles — celle de la session en cours et celle qui survit — est l'erreur la plus coûteuse en conception d'agent. Elle mène tout droit au piège du "tout mettre dans le contexte".

## Mémoire de travail vs mémoire persistante

| | Mémoire de travail | Mémoire persistante |
|---|---|---|
| Support | La fenêtre de contexte de la session | Fichiers, base de données, notes écrites |
| Durée de vie | La session en cours, et encore — elle se compacte | Traverse les sessions, les redémarrages, les agents |
| Coût d'accès | Gratuit une fois chargée, mais chaque token compte dans le budget | Il faut un appel d'outil pour la lire ou l'écrire |
| Fiabilité | Se dégrade avec la longueur (dilution, compaction, troncature) | Fiable tant que le format reste lisible |

La mémoire de travail n'est pas un espace de stockage : c'est l'état courant du raisonnement. Elle est censée être volatile. La confusion arrive quand on lui fait porter un rôle qui appartient à la mémoire persistante — se souvenir d'une décision prise il y a trois sessions, par exemple.

## Le piège du "tout mettre dans le contexte"

Face à une fenêtre de contexte large, le réflexe naturel est d'y charger un maximum d'information "au cas où" : la documentation complète, l'historique entier d'une conversation, tous les fichiers d'un dossier. Le résultat n'est pas une meilleure décision, c'est le contraire :

- **Le signal se dilue** — un modèle qui reçoit un contexte volumineux n'accorde pas la même attention à chaque partie ; l'information pertinente se noie dans le reste.
- **Le budget se consomme** — chaque token chargé "au cas où" est un token qui ne sera pas disponible pour observer le résultat du prochain outil.
- **La compaction devient nécessaire, et elle est destructrice** — une fois la fenêtre pleine, il faut résumer ou tronquer, et un résumé automatique perd systématiquement des détails qu'on découvre manquants seulement quand ils comptent.

La bonne question n'est jamais "qu'est-ce que je pourrais mettre dans le contexte", c'est "qu'est-ce que le prochain tour de la boucle a réellement besoin d'observer".

## Stratégies de gestion du contexte

Trois familles de réponses, combinables :

- **Compaction / résumé** — quand la fenêtre approche de sa limite, remplacer l'historique détaillé par un résumé condensé. Fonctionne pour préserver la direction générale d'une tâche longue ; perd systématiquement le détail fin (un chemin de fichier exact, une valeur numérique précise).
- **Récupération à la demande** — ne rien charger par défaut, et donner à l'agent un outil de recherche (grep, recherche sémantique, requête base) pour aller chercher l'information précise au moment où il en a besoin. Coûte un aller-retour d'outil, mais garde le contexte propre.
- **Mémoire écrite explicitement** — l'agent écrit lui-même, à des points de contrôle, ce qui doit survivre : un fichier de progression, une décision actée, un résumé structuré. C'est la seule stratégie qui traverse une compaction ou un redémarrage sans perte, parce qu'elle ne dépend plus de la fenêtre de contexte du tout.

## La mémoire persistante est une projection

C'est là que la mémoire d'agent rejoint directement le [CQRS](../cqrs/introduction-cqrs) : une mémoire persistante bien conçue n'est pas un journal brut de tout ce qui s'est passé — c'est un **Read Model**. Elle est écrite dans l'intention de répondre efficacement à une question qu'on posera plus tard, pas pour reconstituer fidèlement le déroulé complet d'une session.

Un journal brut (l'équivalent d'un Write Model exhaustif — chaque tour, chaque appel d'outil, chaque token) est complet mais inutilisable tel quel : le prochain agent qui le lit doit reparcourir tout l'historique pour en extraire ce qui compte, exactement comme une Query qui devrait rejouer tous les Domain Events pour répondre à "quel est le statut actuel de la commande ?". Une mémoire persistante utile fait le travail de projection à l'écriture, pas à la lecture :

```markdown
# progress.md — état du refactoring auth (projection, pas journal)

## Décisions actées
- Migration vers JWT validée par l'équipe le 2026-08-20 (voir issue #142)
- On garde l'ancien endpoint /login en parallèle jusqu'au 2026-09-01

## État actuel
- [x] Middleware JWT écrit et testé
- [ ] Migration des sessions existantes — bloqué sur la question de rétrocompatibilité
- [ ] Suppression de l'ancien endpoint

## Prochaine étape
Trancher la rétrocompatibilité avec l'équipe backend avant de continuer.
```

Ce fichier ne raconte pas ce qui s'est passé tour par tour — il répond directement à la question qu'un agent (ou un humain) se posera en reprenant la tâche : "où en est-on, et que faire ensuite ?". C'est exactement le critère de conception d'un Read Model CQRS : optimisé pour la question posée, pas pour l'exhaustivité.

## Limites : ce qu'une mémoire ne rattrape pas

- **Une mémoire périmée est pire qu'absente** — un fichier `progress.md` qui affirme qu'une étape est bloquée alors qu'elle a été résolue ailleurs conduit l'agent à perdre du temps, ou pire, à contredire un travail déjà fait. Une projection doit être mise à jour au même rythme que l'état qu'elle décrit, sinon elle ment avec assurance.
- **Une mémoire ne compense pas une tâche mal cadrée** — si le problème lui-même est mal défini, se souvenir fidèlement des tentatives précédentes ne rend pas la prochaine tentative meilleure.
- **Une mémoire n'est pas un substitut à l'observation directe** — pour une donnée qui change vite (l'état réel d'un système, le contenu actuel d'un fichier), relire la source est plus fiable que de faire confiance à ce qu'une note en dit.

## Pour un agent

> **Règle** — Ne charge dans le contexte que ce dont le prochain tour a réellement besoin, jamais "au cas où".
> **Règle** — Une mémoire persistante s'écrit comme une projection : pour la question qu'on posera plus tard, pas comme un journal exhaustif.
> **Règle** — Une mémoire persistante se met à jour au même rythme que l'état qu'elle décrit, sinon elle devient une source de désinformation.
> **Signal d'alerte** — Un fichier de mémoire qui grossit sans jamais être réécrit ou élagué : il dérive vers le journal brut qu'il était censé éviter.
> **Signal d'alerte** — Une décision critique qui n'existe que dans l'historique de conversation, jamais écrite ailleurs.

---

*Notes liées : [Anatomie d'un agent](./anatomie-d-un-agent) — la boucle qui observe ce contexte à chaque tour. [Le handoff entre agents](../orchestration/handoff-et-contexte-partage) — ce qu'il faut écrire quand le contexte ne se transmet pas. [Introduction au CQRS](../cqrs/introduction-cqrs) — le principe de projection appliqué ici à la mémoire d'agent.*
