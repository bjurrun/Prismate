---
title: Notities en Bestanden
type: feature
status: active
tags: [notes, files, favorites, metadata]
---

# Notities & Bestanden (Files)

Conceptueel zijn notities contextuele tekstblokken die aan taken/projecten gerelateerd kunnen zijn of als vrijstaande informatie dienen.

## Favorieten (Favorite / Pin) Functionaliteit

Aan actieve notities kan de "favorite" status worden toegekend (soortgelijk aan een "important" vlag bij Taken).

**Technische werking**:

- Een visueel hart-icoon (Tabler Icon) is geïmplementeerd op de notitie-kaarten in de feed.
- Het icoon verschijnt ook naast de titel in de Notitie Editor pagina.
- Klikken op het icoon triggert een Prisma database statusupdate die de pagina / lijst visueel reflecteert middels revalidatie/optimistic UI.

## Metadata

Notities maken gebruik van een gecentraliseerde Metadata Header (`NoteMetadataHeader.tsx`), wat zorgt voor uniformiteit (volledig opgebouwd volgens Sjon's Mantine UI regels).

## Bestanden (Files)

Bestanden kunnen ongeorganiseerd binnenkomen in de Vandaag Inbox. Vanaf dat punt moeten ze gelinkt worden aan hun eindbestemming, wat voorkomt uit het GRIP principe om "weesbestanden" te voorkomen.
