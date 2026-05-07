---
title: test extract event-stormer
slug: livraison-de-pizza-demo-20260507
tags: [ddd, event-storming]
created: "2026-05-08"
updated: "2026-05-08"
summary: Test.
draft: false
---

# Workshop : Livraison de pizza — démo — Export Event Storming

> Niveau : Design Level | Exporté le 2026-05-07 | 16 stickies

## Vue d'ensemble

```mermaid
flowchart LR
    classDef event fill:#FF9900,stroke:#B36B00,color:#000
    classDef command fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef actor fill:#FFEB3B,stroke:#B8A82A,color:#000
    classDef policy fill:#9C27B0,stroke:#6A1B9A,color:#fff
    classDef external fill:#EC407A,stroke:#AD1457,color:#fff
    classDef aggregate fill:#FFF59D,stroke:#BFA726,color:#000
    classDef readmodel fill:#66BB6A,stroke:#2E7D32,color:#fff
    classDef boundedcontext fill:none,stroke:#424242,stroke-dasharray:5 5

    subgraph bc0["Prise de commande"]
        bc0_event2["Commande passée"]:::event
        bc0_actor0["Client"]:::actor
        bc0_command1["Passer commande"]:::command
        bc0_policy3["Si commande → préparer pizza"]:::policy
    end

    subgraph bc1["Préparation"]
        bc1_event2["Pizza prête"]:::event
        bc1_aggregate0["Pizza"]:::aggregate
        bc1_command1["Préparer pizza"]:::command
        bc1_actor3["Cuisinier"]:::actor
    end

    subgraph bc2["Livraison"]
        bc2_event2["Commande livrée"]:::event
        bc2_external0["GPS Livreur"]:::external
        bc2_command1["Livrer commande"]:::command
        bc2_actor3["Livreur"]:::actor
        bc2_readmodel4["Suivi livraisons"]:::readmodel
    end
```

## Chronologie des domain events
1. **Commande passée** — position (430, 140)
2. **Pizza prête** — position (1070, 140)
3. **Commande livrée** — position (1710, 140)

## Commands
- **Livrer commande**
- **Passer commande**
- **Préparer pizza**

## Actors
- **Client**
- **Cuisinier**
- **Livreur**

## Policies
- **Si commande → préparer pizza**

## External Systems
- **GPS Livreur**

## Aggregates
- **Pizza**

## Read Models
- **Suivi livraisons**

## Bounded Contexts
- **Livraison**
- **Préparation**
- **Prise de commande**

## Métadonnées
- Nom : Livraison de pizza — démo
- Niveau actif : Design Level
- Niveaux débloqués : Big Picture, Process Level, Design Level
- Nombre de stickies : 16
- Export généré par EventStormer v0.0.0