---
title: "Outils et garde-fous"
slug: outils-et-garde-fous
tags: [agents, idempotence]
pillar: ai
level: intermediaire
created: 2026-08-23
updated: 2026-08-23
summary: "La description d'un outil fait partie du code qu'un agent exécute : nommage, granularité, garde-fous entre actions réversibles et irréversibles, et pourquoi un outil rappelé deux fois ne doit jamais produire deux effets."
draft: true
related: [anatomie-d-un-agent, ports-et-adapters, introduction-ddd, inbox-pattern]
---

# Outils et garde-fous

Un outil donné à un agent n'est pas une fonction qu'on documente après coup pour les humains. Sa description **est** ce que le modèle lit pour décider s'il l'appelle, avec quels arguments, et à quel moment. Une description ambiguë produit des appels ambigus — la description d'un outil fait partie du code, au même titre que son implémentation.

## Un outil est un contrat

Trois dimensions déterminent si un outil est bien conçu :

- **Le nommage** — `update_user` est ambigu (met à jour quoi exactement ?), `update_user_email` ne l'est pas. Le modèle choisit entre les outils disponibles sur la base de leur nom et de leur description ; un nom vague augmente la probabilité qu'il choisisse le mauvais outil, ou le bon outil avec les mauvais arguments.
- **La granularité** — un outil `run_migration` qui fait dix choses en une fois est difficile à utiliser prudemment : le modèle ne peut ni observer un résultat intermédiaire, ni s'arrêter à mi-chemin. À l'inverse, dix outils d'un paramètre chacun pour une seule opération logique noient le modèle dans des choix inutiles. Le bon découpage suit les frontières où une observation intermédiaire a de la valeur.
- **Les erreurs qui apprennent quelque chose** — `Error: 400` n'aide pas le modèle à corriger son prochain appel. `Error: le champ email doit contenir un @` lui donne l'information nécessaire pour réessayer correctement. Une erreur d'outil est un message adressé au modèle, pas un simple code de statut à propager.

## Les garde-fous : là où l'outil se protège lui-même

Un agent explore, essaie, et se trompe — c'est le prix du non-déterminisme documenté dans [Anatomie d'un agent](./anatomie-d-un-agent). Les garde-fous existent pour que l'erreur d'un tour de boucle reste réparable :

- **Réversible vs irréversible** — supprimer un brouillon est réversible ; envoyer un e-mail à un client ne l'est pas. Les actions irréversibles méritent une friction que les actions réversibles n'ont pas besoin de porter.
- **Confirmation** — pour une action irréversible ou à fort impact, exiger une étape explicite avant exécution, au niveau du programme hôte, pas d'une simple instruction dans le prompt que le modèle peut ignorer ou considérer comme déjà validée.
- **Dry-run** — un mode qui décrit ce que l'outil ferait sans l'exécuter, pour que l'agent (ou l'humain qui le supervise) puisse valider l'intention avant l'effet.
- **Permissions et périmètre** — un outil ne doit exposer que ce dont la tâche a besoin. Un agent chargé de lire des logs n'a aucune raison de disposer d'un outil capable d'écrire en base de production, même "juste au cas où".

## Le garde-fou est un invariant, pas une politesse du prompt

C'est le point le plus souvent raté : un garde-fou écrit uniquement dans le prompt ("ne supprime jamais un fichier sans demander confirmation d'abord") n'est **pas** un garde-fou, c'est une suggestion. Le modèle peut l'ignorer par erreur, l'oublier après une compaction de contexte, ou se faire convaincre de le contourner par un contenu externe malveillant.

C'est exactement le même problème que le [DDD](../ddd/introduction-ddd) résout avec la notion d'**invariant** : une règle protégée dans un service applicatif peut être contournée par un autre chemin de code qui oublie de l'appeler. Une règle protégée dans l'aggregate root ne le peut pas, parce que toute modification passe obligatoirement par lui.

```csharp
// Le garde-fou vit dans l'outil, pas dans le prompt qui l'appelle
public async Task<ToolResult> DeleteFileAsync(string path, bool confirmed, CancellationToken ct)
{
    if (!confirmed)
        return ToolResult.Refused("Suppression irréversible : relancer avec confirmed=true après validation.");

    if (IsProtectedPath(path)) // le garde-fou s'applique quel que soit ce que dit le prompt
        return ToolResult.Refused($"{path} est un chemin protégé, suppression impossible par cet outil.");

    File.Delete(path);
    return ToolResult.Success();
}
```

Le prompt peut orienter le comportement du modèle ; il ne doit jamais être la seule ligne de défense. Le garde-fou se vérifie à l'entrée de l'outil, exactement comme l'invariant se vérifie à l'entrée de l'aggregate root — jamais en confiance dans l'appelant.

### Le dernier garde-fou est l'isolation

Confirmation, dry-run et permissions filtrent *ce que l'agent a le droit de demander*. Ils ne disent rien de ce que fait le code une fois exécuté. Pour tout ce qui exécute du contenu généré — un script, une requête, une commande — le seul garde-fou qui tient est l'**isolation d'exécution** : un conteneur jetable, un système de fichiers restreint, un réseau coupé par défaut. Le raisonnement est le même que pour l'invariant : on ne compte pas sur le fait que le code produit soit inoffensif, on rend le périmètre incapable de causer un dégât hors de lui.

## L'idempotence des outils

Un agent réessaie. Un appel d'outil peut timeout côté réseau sans que l'agent sache si l'effet a eu lieu ; le comportement naturel du modèle est alors de réessayer. Si l'outil n'est pas idempotent, ce réessai produit un doublon — deux emails envoyés, deux commandes créées, une facture payée deux fois.

C'est le même problème que l'[Inbox Pattern](../messaging/inbox-pattern) résout côté messaging : un broker en at-least-once peut livrer deux fois le même message, et c'est au consommateur de garantir qu'un traitement dupliqué reste sans effet. Un outil d'agent est dans une situation voisine, avec une nuance à ne pas gommer : un broker *garantit* l'at-least-once au niveau du protocole, alors qu'un modèle qui retente est un comportement **probable**, pas une garantie système — il peut aussi bien abandonner, ou supposer à tort que l'appel a réussi. La conclusion pratique est la même dans les deux cas : un outil à effet de bord ne doit jamais supposer qu'il ne sera appelé qu'une fois.

```yaml
# Description d'outil pour le modèle — l'idempotence fait partie du contrat exposé
name: create_invoice
description: >
  Crée une facture pour une commande. Idempotent : appeler plusieurs fois avec le
  même idempotency_key ne crée qu'une seule facture, la clé sert de déduplication.
parameters:
  order_id: { type: string, required: true }
  idempotency_key: { type: string, required: true,
    description: "Clé stable pour cette tentative de création, réutiliser la même en cas de retry" }
```

Implémenter ça côté outil suit exactement le mécanisme de l'Inbox : une contrainte d'unicité sur la clé d'idempotence, vérifiée avant l'effet de bord.

## Limites : trop de garde-fous rend l'agent inutile

Un garde-fou a un coût : chaque confirmation demandée est un aller-retour qui casse l'autonomie que l'agent était censé apporter. Un agent qui demande confirmation pour lire un fichier n'apporte plus rien par rapport à un humain qui aurait fait la même chose directement.

Réserve la friction (confirmation, dry-run) aux actions réellement irréversibles ou à fort impact. Pour tout le reste — lecture, calcul, action réversible — le garde-fou doit rester invisible en usage normal et ne se déclencher que sur un cas hors périmètre. Un agent entièrement sous confirmation n'est plus un agent, c'est un formulaire avec des étapes en plus.

## Pour aller plus loin

- La conception d'API idempotentes (clé d'idempotence, rejeu sûr) : la littérature des API de paiement s'applique presque telle quelle aux outils d'agent
- Les principes du moindre privilège et de l'isolation d'exécution, transposés depuis la sécurité applicative classique

## Pour un agent

> **Règle** — La description d'un outil est lue par le modèle pour décider : elle fait partie du code, pas de la documentation annexe.
> **Règle** — Un garde-fou se vérifie dans le code de l'outil, jamais seulement dans une instruction du prompt.
> **Règle** — Toute action irréversible ou à fort impact passe par une confirmation explicite au niveau du programme hôte.
> **Règle** — Un outil qui produit un effet de bord doit être idempotent via une clé stable, pas supposé appelé une seule fois.
> **Signal d'alerte** — Un garde-fou formulé uniquement comme une phrase dans le prompt système ("ne fais jamais X").
> **Signal d'alerte** — Une confirmation exigée pour une action réversible sans conséquence réelle.
> **Signal d'alerte** — Du contenu généré par le modèle exécuté directement dans l'environnement hôte, sans isolation.

---

*Notes liées : [Anatomie d'un agent](./anatomie-d-un-agent) — pourquoi le modèle ne connaît l'outil que comme un contrat. [Architecture Hexagonale — Ports & Adapters](../hexagonal/ports-et-adapters) — le port comme contrat, l'outil comme cas particulier. [Introduction au DDD](../ddd/introduction-ddd) — l'invariant protégé à l'entrée, le même principe que le garde-fou. [Inbox Pattern](../messaging/inbox-pattern) — le mécanisme d'idempotence qu'un outil rejoue au niveau d'un seul appel.*
