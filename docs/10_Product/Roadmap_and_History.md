---
title: Roadmap & Ontwikkelhistorie
type: meta
status: active
tags: [roadmap, history, progress]
---

# Recap van Recente Ontwikkelingen

Om AI context te bieden m.b.t. de gemaakte keuzes (en te voorkomen dat code herschreven wordt naar oude patronen), volgt hier een beknopte historie van de meest recente technische epics:

1. **Note Favorites**: Implementatie van hart-icoontjes op kaarten en in de editor om status op te slaan (`March 2026`).
2. **Spotlight Component Verfijning**: Tweaks in Mantine dark-mode kleuren t.b.v. leesbaarheid en achtergrond blur verminderd in het globale zoekvenster (`March 2026`).
3. **Tabler Navigation Icons**: UI is versoberd en verduidelijkt met strict _strokeWidth 1.2_ Tabler Icons, en vervanging van custom iconen met generieke (zoals de Flag).
4. **Vandaag Inbox Ontwerp & Opschoon**: Creatie van de `InboxItem` Prisma structuur om mails, notes en uploads in een 3-koloms interface (`/vandaag`) de juiste plek te geven. Direct gekoppeld is de introductie van een 'Trash' of soft-delete bak met auto-vernietiging na 30 dagen.
5. **App Shell Stabilisatie (Clerk CLS Fix)**: Voorkomen van het flikkeren van de Next.js header tijdens de Clerk authenticatie handshake door harde reserveringen (Skeletons) en uitgestelde rendering van de root layout `isLoaded` hook.
6. **Responsieve Layout Fixes**: Reparatie van dubbele scrollbars in `/tasks` (mobile bottom-bar die toonde op desktop).
