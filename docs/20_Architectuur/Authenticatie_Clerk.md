---
title: Authenticatie & App Shell
type: architecture
status: active
tags: [clerk, auth, mantine, layout, cls]
---

# Authenticatie (Clerk) & App Shell Render Logica

## Beveiliging & User Management

Prismate maakt exclusief gebruik van **Clerk** voor authenticatie en route-beveiliging.

- **Middleware**: Clerk middleware beveiligt API routes en pagina-overgangen.
- **Client hooks**: Voor user profile en authenticatiestatus in de applicatie.

## De Mantine AppShell en Rendering Stabiliteit

Een van de belangrijkste technische uitdagingen was het stabiliseren van de layout (Cumulative Layout Shift) tijdens de Clerk handshake.

**Het probleem:**
De asynchrone aard van Clerk's authenticatieflow conflicteerde met Server-Side Rendering (SSR), wat zorgde voor hydration mismatches en zichtbare UI-flikkeringen (flickering).

**De Oplossing (Huidige Architectuur):**

1. **Uitgestelde Rendering**: De root `AppShell` component vertraagt zijn weergave totdat de Clerk `isLoaded` status `true` is. Dit voorkomt conflicten tussen server-rendered HTML en client-side state.
2. **Fixed Layout Metrics**: De `AppShell` is geconfigureerd met vaste dimensies (CSS/Mantine theme) voor de Header en de Navbar. Dit reserveert de benodigde ruimte nog vóórdat data geladen is, wat CLS (content jumping) volledig elimineert.
3. **Mantine Skeletons**: Terwijl Clerk of data aan het laden is, worden uitsluitend Mantine Skeleton components getoond in plaats van lege tekst of unstyled componenten.

_Deze configuratie mag niet zomaar worden overschreven; de samenwerking tussen Clerk en de Mantine AppShell luistert zeer nauw ten behoeve van een smooth, premium UX._
