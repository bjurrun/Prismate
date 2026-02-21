# Decision Log Prismate

## [2026-02-20] Keuze voor Stack & Methodiek
- **Keuze**: Wasp / Open SaaS.
- **Rationale**: Snelheid van ontwikkeling en robuustheid van de geïntegreerde stack.
- **Focus**: Toepassing van de GRIP-methode middels vertical slices om direct waarde te leveren.

## [2026-02-20] Initialisatie Shadcn/ui & Dashboard
- **Keuze**: Shadcn/ui met Zinc theme.
- **Rationale**: Premium, rustige uitstraling die past bij de GRIP-methodiek.
- **Resultaat**: Dashboard interface opgezet volgens de 'Vangen'-fase van GRIP, inclusief functionele takenlijst en invoerveld.

## [2026-02-20] Herstel Wasp Compilatie & Versie Update
- **Besluit**: Upgraden naar Wasp 0.21.1 syntax.
- **Aanpassing**: `fromField` toegevoegd aan e-mail auth configuratie en `userSignupFields` geïnitialiseerd.
- **Rationale**: Voldoen aan de verplichte structuur van Wasp 0.21.1 om compilatie-fouten te voorkomen.

## [2026-02-20] Pivot naar Next.js / Supabase
- **Besluit**: Project stack gewijzigd van Wasp naar Next.js/Supabase.
- **Rationale**: Instabiliteit van de lokale dev-omgeving op de host-machine maakte voortgang met Wasp onmogelijk.
- **Actie**: UI-componenten gemigreerd naar Next.js App Router.

## [2026-02-20] Pivot Styling naar Standaard Zinc
- **Besluit**: Styling gepivoteerd naar 100% standaard shadcn/ui Zinc.
- **Rationale**: Visuele ruis elimineren en volledig aansluiten bij de standaard shadcn/ui esthetiek.
- **Actie**: Custom CSS variabelen en handmatige Tailwind-kleurklassen verwijderd.

## [2026-02-20] Database Configuratie
- **Besluit**: Database verbinding geconfigureerd met Supabase Direct Connection String.
- **Rationale**: Prisma 7.x vereist expliciete `dotenv` configuratie voor CLI runtime herkenning van `.env.local`.
- **Actie**: `prisma.config.ts` aangemaakt en `dotenv.config()` geïmplementeerd.

## [2026-02-20] Implementatie 'Vangen' Vertical Slice
- **Besluit**: Functionaliteit 'Vangen' end-to-end geïmplementeerd met Next.js Server Actions en Prisma persistentie.
- **Rationale**: Directe waarde leveren door de eerste stap van de GRIP-methode technisch volledig operationeel te maken met cloud-persistentie.
- **Actie**: `src/lib/prisma.ts` en `src/app/actions.ts` aangemaakt en geïntegreerd in het dashboard.

## [2026-02-20] PrismaClient Initialisatie Fix
- **Besluit**: PrismaClient initialisatie hersteld door expliciete `datasourceUrl` injectie vanuit de centrale config.
- **Rationale**: Voorkomen van `PrismaClientInitializationError` in Prisma 7.x binnen de Next.js runtime.
- **Actie**: `src/lib/prisma.ts` bijgewerkt met `datasourceUrl` uit `prisma.config.ts`.

## [2026-02-20] Prisma 7 Adapter Pattern
- **Besluit**: Volledige overstap naar het Prisma 7 Driver Adapter patroon (`pg`).
- **Rationale**: Prisma 7.4.x vereist expliciete adapters voor directe databaseverbindingen met de "client" engine. Dit voorkomt initialisatie-fouten in serverless/edge omgevingen.
- **Actie**: `pg` en `@prisma/adapter-pg` geïnstalleerd en geconfigureerd in `src/lib/prisma.ts`.

## [2026-02-21] Database Schema Reset (Microsoft Mirror)
- **Besluit**: Database schema gereset naar Microsoft-mirror structuur. Oude test-data verwijderd wegens incompatibiliteit met verplichte Microsoft velden.
- **Rationale**: Synchronisatie met Microsoft To-Do en Outlook (Microsoft Graph) vereist een specifieke datastructuur om naadloze integratie mogelijk te maken.
- **Actie**: `schema.prisma` bijgewerkt met `User`, `Project`, `Task`, `ChecklistItem` en `Contact` modellen. Database gereset via `db push --force-reset`.

## [2026-02-21] Authenticatie via Clerk
- **Besluit**: Authenticatie live via Clerk. Microsoft OAuth scopes geconfigureerd voor Graph API toegang.
- **Rationale**: Clerk biedt een robuuste en schaalbare oplossing voor User Management en OAuth flows, essentieel voor de integratie met Microsoft Graph.
- **Actie**: `ClerkProvider` toegevoegd aan `layout.tsx`, `clerkMiddleware` geconfigureerd in `middleware.ts`, en user sync logica geïmplementeerd in `page.tsx`.

## [2026-02-21] Microsoft Graph Handshake
- **Besluit**: Token retrieval mechanisme via Clerk geïmplementeerd. Voorbereid op de eerste bidirectionele To-Do sync.
- **Rationale**: Directe toegang tot Microsoft Graph tokens via Clerk minimaliseert overhead en zorgt voor veilige, kortstondige toegang tot user data.
- **Actie**: `src/lib/microsoft.ts` aangemaakt voor token management en Graph API calls. `syncMicrosoftLists` action toegevoegd voor initiële validatie.
## [2026-02-21] Authentificatie UI (Zinc Theme)
- **Besluit**: Authenticatie flow visueel en technisch voltooid. Redirect-strategie geactiveerd voor naadloze dashboard-landingen.
- **Rationale**: De Clerk components zijn gestileerd middels de `appearance` API om aan te sluiten bij het Zinc-thema van shadcn/ui.
- **Actie**: `src/app/sign-in/[[...sign-in]]/page.tsx` en `src/app/sign-up/[[...sign-up]]/page.tsx` aangemaakt met Zinc-styling. `.env.local` bijgewerkt met redirect URL's.

## [2026-02-21] Header UI Professionalisering (UserNav)
- **Besluit**: Header UI geprofessionaliseerd. Placeholder vervangen door UserNav met Microsoft-profieldata en logout-functionaliteit.
- **Rationale**: Directe visuele herkenning door Microsoft-profieldata verhoogt het eigenaarschap van de gebruiker. Een expliciete logout via Clerk zorgt voor beter sessiebeheer.
- **Actie**: `UserNav` component geïmplementeerd met Shadcn `Avatar` en `DropdownMenu`. Dashboard header layout bijgewerkt in `page.tsx`.

## [2026-02-21] Layout Refactor naar SaaS-model
- **Besluit**: Dashboard layout herstructureerd naar SaaS-model. Sticky header met navigatie en UserNav geïmplementeerd voor persistente identiteit.
- **Rationale**: Een sticky header verbetert de UX door navigatie en gebruikersidentiteit altijd toegankelijk te houden. De gecentreerde content grid verhoogt de focus op de kernactiviteit: het 'vangen' van taken.
- **Actie**: `src/app/page.tsx` heringericht met een sticky `<header>` en een gecentreerde `<main>` content area.

## [2026-02-21] Oplossen UI Duplicatie & Globale Layout
- **Besluit**: UI duplicatie opgelost. Navigatie en User Management zijn nu onderdeel van de globale applicatie-layout (`layout.tsx`).
- **Rationale**: Door de header globaal te maken, garanderen we een consistente navigatie-ervaring over alle pagina's en voorkomen we dubbele elementen wanneer specifieke pagina-layouts overlappen met de root layout.
- **Actie**: `header` en `UserNav` verplaatst van `page.tsx` naar `layout.tsx`. Lokale header in `page.tsx` verwijderd.
## [2026-02-21] Data Monitor Pagina & Tasks Integration
- **Besluit**: Data Monitor pagina uitgebreid met real-time inspectie van Microsoft Tasks via een nested-fetch mechanisme.
- **Rationale**: Directe verificatie van individuele taken en hun status (completed/notStarted) over verschillende lijsten heen is essentieel voor het kalibreren van de bidirectionele synchronisatie.
- **Actie**: `/debug` route geoptimaliseerd met `Promise.all` voor parallelle fetches van taken per lijst. UI uitgebreid met een overzichtstabel voor alle Microsoft taken, inclusief status-mapping en lijst-referenties middels Badges. Sequentiële fetching en `Promise.allSettled` geïmplementeerd om Graph API throttling te voorkomen en stabiliteit te verhogen.
