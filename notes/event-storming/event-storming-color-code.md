---
title: "Event Storming — Le code couleur expliqué"
slug: event-storming-color-code
tags: [event-storming, ddd, workshop, modeling]
created: 2026-04-17
updated: 2026-04-17
summary: "Comprendre les post-it de l'Event Storming : à quoi sert chaque couleur, quand l'utiliser, et comment lire un tableau de bout en bout."
draft: true
---

# Event Storming — Le code couleur expliqué

L'Event Storming, inventé par **Alberto Brandolini**, est un atelier collaboratif pour explorer un domaine métier complexe. Sa force vient de sa simplicité : des post-it de couleurs différentes collés sur un mur, représentant chacun un concept précis du domaine.

Ce code couleur n'est pas décoratif. Chaque teinte porte une sémantique forte. La maîtriser, c'est pouvoir **lire un Event Storming comme on lit un diagramme de séquence**, sans explication.

## Les 8 couleurs essentielles

### 🟠 Orange — Domain Event

Un événement métier qui **s'est produit** dans le passé. Toujours formulé au participe passé : `CommandePassée`, `PaiementAccepté`, `FactureÉmise`.

C'est le point de départ de tout Event Storming. On commence par les coller en masse sur le mur, sans ordre, pour capturer l'intégralité des faits du domaine.

### 🔵 Bleu ciel — Command

L'intention d'un acteur, la demande qui déclenche un changement. Formulée à l'impératif : `PasserCommande`, `PayerFacture`, `AnnulerCommande`.

Une Command précède toujours un ou plusieurs Domain Events. C'est le « avant », l'événement c'est le « après ».

### 🟡 Jaune — Actor

L'humain qui déclenche une Command. Un rôle, pas une personne : `Client`, `Vendeur`, `Comptable`.

Placé à gauche de la Command qu'il déclenche.

### 🟣 Violet — Policy

Une règle automatique du domaine, du type **« quand X se produit, alors déclencher Y »**. Les policies sont ce qui lie les événements entre eux sans intervention humaine.

Exemple : `Quand PaiementAccepté → déclencher ExpéditionCommande`.

### 🟢 Vert clair — Read Model

Une vue, une projection, une donnée affichée à l'utilisateur pour l'aider à prendre une décision. Ce n'est pas l'état du système, c'est ce qu'on en montre.

Exemples : `MesCommandes`, `DétailFacture`, `HistoriquePaiements`.

### 🟨 Jaune foncé — Aggregate

Le cluster d'invariants métier qui garantit la cohérence. C'est lui qui reçoit les Commands et émet les Domain Events.

Exemples : `Commande`, `Facture`, `Panier`.

Un Aggregate protège ses règles : une `Commande` ne peut pas être `Expédiée` si elle n'a pas été `Payée`.

### 🌸 Rose — External System

Un système tiers qui ne fait pas partie de ton domaine : `PSP` (prestataire de paiement), `TransporteurDHL`, `ServiceEmail`.

On les isole visuellement pour marquer la frontière de responsabilité.

### 🔴 Rouge — Hotspot

Une zone de friction, une question ouverte, un désaccord dans l'équipe. Le rouge signifie **« ici, on ne sait pas encore »**.

Exemples : « Qui peut annuler une commande déjà expédiée ? », « Combien de temps garde-t-on les paniers abandonnés ? ».

Les hotspots ne doivent jamais disparaître sous le tapis. Ils se résolvent en ateliers de suivi.

## Lire un Event Storming de gauche à droite

Le mur se lit **dans le sens du temps**. Un scénario type :

```event-storming
actor Client
command "Passer commande"
aggregate Commande
event "CommandePassée"
policy "Quand CommandePassée → demander paiement"
externalSystem PSP
event "PaiementAccepté"
policy "Quand PaiementAccepté → déclencher facturation"
aggregate Facture
event "FactureÉmise"
readModel "Mes commandes"
```

Quand tu tombes sur un diagramme Event Storming, pose-toi toujours ces questions dans l'ordre :

1. **Quels sont les Domain Events ?** (oranges) — c'est l'ossature du scénario.
2. **Qui les déclenche ?** — cherche la Command (bleue) et l'Actor (jaune) juste avant.
3. **Qu'est-ce qui s'enchaîne automatiquement ?** — les Policies (violettes) te donnent la logique cachée.
4. **Où sont les frontières ?** — les External Systems (roses) et les Aggregates (jaunes foncés) te montrent les zones de responsabilité.
5. **Quelles questions restent ouvertes ?** — les Hotspots (rouges) sont les risques du projet.

## Les 3 niveaux d'Event Storming

Brandolini distingue trois niveaux de profondeur, à choisir selon l'objectif :

- **Big Picture** — on capture les Domain Events d'un domaine entier, sans détail. Objectif : aligner les équipes sur le périmètre.
- **Process Modeling** — on ajoute les Commands, Actors, Policies, External Systems. Objectif : comprendre les processus métier.
- **Software Design** — on ajoute les Aggregates et Read Models. Objectif : préparer l'implémentation.

On commence **toujours** par Big Picture. Sauter à Software Design sans avoir compris le périmètre est le piège classique.

## Pourquoi ce code couleur plutôt qu'un autre

La palette Brandolini n'est pas arbitraire. Elle a été affinée sur des centaines d'ateliers. Le jaune pour les acteurs et aggregates : visible, central, humain. L'orange pour les events : chaud, attire l'œil, c'est ce qu'on veut voir en premier. Le rouge pour les problèmes : universellement compris comme « attention ». Le violet pour les policies : suffisamment distinct pour ne pas être confondu avec les autres post-it actifs.

Respecter cette convention, c'est pouvoir partager un Event Storming avec n'importe quel praticien du DDD dans le monde. C'est devenu un **langage commun**.

## Pour aller plus loin

- *Introducing EventStorming* — Alberto Brandolini (le livre de référence, toujours en cours de finalisation mais disponible sur Leanpub)
- Les vidéos YouTube de Brandolini sur les ateliers en conditions réelles
- Le hashtag `#eventstorming` sur les réseaux pour voir des exemples de murs de post-it

---

*Note liée : [BFF & Clean Architecture](./bff-clean-archi) — comment cet Event Storming se traduit en code côté backend et frontend.*
