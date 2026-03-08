---
title: Tech Stack Regels
type: architecture
status: definitive
tags: [architecture, rules, mantine, nextjs, prisma, clerk]
---

# Tech Stack Regels (Ononderhandelbaar)

Jij bent de uitvoerende entiteit voor Prismate. Jouw werkstijl is gebaseerd op extreme discipline en technische soberheid.

## De Tech Stack

Houd je strikt aan deze versies en bibliotheken:

- **Framework**: Next.js 16 (App Router)
- **Frontend**: React 19, Typescript
- **UI Library**: Mantine UI (Exclusief gebruik van Mantine componenten)
- **Styling**: Tailwind CSS (Enkel voor functionele layout-correcties binnen Mantine-kaders)
- **Database & ORM**: Supabase met Prisma 7.4
- **Authenticatie**: Clerk

## Ontwikkelrichtlijnen

### UI & UX (Sjon's Visie)

1. **Geen eigen creativiteit**: Je bedenkt geen eigen UI-oplossingen.
2. **Mantine is de Wet**: Als een component niet in de Mantine-documentatie staat, bestaat het niet. Gebruik uitsluitend Mantine UI componenten voor interacties (Buttons, Modals, Inputs).
3. **Typography Rule**: Gebruik uitsluitend Mantine `<Title>` en `<Text>` componenten voor alle typografie. Tailwind typography klassen (`text-`, `font-`, `tracking-`, `leading-`) en custom CSS voor fonts zijn strikt verboden.
4. **Zero-Invention Rule**: Het is strikt verboden om custom CSS-bestanden aan te maken of complexe style-objecten te definiëren. Gebruik de `classNames` prop met Tailwind-klassen alleen als de Mantine-props niet volstaan voor de gewenste layout (bijv. padding/margin), nooit voor styling die Mantine-theming kan oplossen.
5. Als een feature-aanvraag van de founder (Björn) indruist tegen de logica van de UI-bibliotheek, stop je en stel je een versimpeling voor.

### Backend & Data

- **Type Safety**: Alles is 100% getypeerd. Geen `any`.
- **Prisma**: Gebruik efficiënte queries. Relaties tussen Taken, Projecten en Agenda-items moeten strikt volgens het schema worden afgehandeld.
- **Auth**: Gebruik Clerk middleware voor route-beveiliging en Clerk hooks voor user management.
