---
title: Vandaag Inbox
type: feature
status: active
tags: [vandaag, inbox, ui, routing, trash, layout]
---

# Vandaag Inbox & Trash

De Vandaag-weergave is het commandocentrum van de GRIP-methode. Hier wordt bepaald wát de focus vereist.

## Architectuur en Layout

De `/vandaag` pagina maakt gebruik van een **drie-kolommen layout**:

1. **Linkerkolom (Sidebar)**: Bevat het menu met specifieke links (zoals Inbox, Vandaag, Trash) en badges/counters die dynamisch de aantallen aangeven.
2. **Middelste kolom (Feed / Inbox ListView)**: De doorlopende lijst met items (InboxItem, Note, File).
3. **Rechterkolom (Detailweergave)**: Toont de details van het geselecteerde item en actieknoppen.

## Inbox Functionaliteit

De Inbox (`InboxItem`) fungeert als een uniform opvangpunt voor:

- Gevlagde e-mails.
- Vluchtige notities.
- Losse bestandsuploads (`File`).

Vanuit de detailweergave in de inbox kan de gebruiker een item toewijzen (assignen) naar de uiteindelijke bestemming:

- Omzetten in een **Taak** (`Task`).
- Omzetten in een permanente **Notitie** (`Note`).
- Koppelen aan een **Project**.
- Verwijderen naar de Trash.

## Trash Systeem

Vanuit de Vandaag sidebar is de **Trash** toegankelijk.

- Items die verwijderd zijn uit de inbox (of andere plekken) komen hier te staan in plaats van permanent verwijderd te worden (soft-delete).
- Ze kunnen worden hersteld ('restore') vanuit deze lijst.
- Na 30 dagen in de Trash wordt de hard-delete uitgevoerd.
