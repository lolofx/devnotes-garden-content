---
title: Introduction au DDD
slug: introduction-ddd
tags: [ddd, architecture]
created: "2026-04-28"
updated: "2026-04-28"
summary: Les concepts fondamentaux du Domain-Driven Design — agrégats, entités, value objects et bounded contexts.
draft: false
---

# Introduction au DDD

Le **Domain-Driven Design** (DDD) est une approche de conception logicielle centrée sur le domaine métier.

## Concepts clés

### Entité
Un objet avec une identité persistante à travers le temps.

### Value Object
Un objet défini uniquement par ses attributs, sans identité propre.

### Agrégat
Un cluster d'entités et de value objects traité comme une unité cohérente.

### Bounded Context
Une frontière explicite dans laquelle un modèle de domaine est défini et applicable.

## Pourquoi DDD ?

> Le code devient le modèle, le modèle devient le code.

- **Langage ubiquitaire** — vocabulaire partagé entre tech et métier
- **Découpage explicite** — les bounded contexts évitent les couplages implicites
- **Testabilité** — les agrégats sont des racines d'invariants, faciles à tester

