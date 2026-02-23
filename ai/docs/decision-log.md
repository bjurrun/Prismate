# Decision Log Prismate

## [2026-02-22] Takenlijst Refactoring: Groepering & Inklapbare Secties
- **Keuze**: Introductie van inklapbare secties voor actieve en voltooide taken, en specifieke tijdsgroepering (Eerder, Vandaag, Morgen, Komende 7 dagen) voor de "Gepland" view.
- **Rationale**: Verbeterde overzichtelijkheid in lange lijsten en directere focus op geplande taken conform Microsoft To Do logica.

## [2026-02-22] Substappen Voortgangsindicator
- **Keuze**: Toevoeging van een substappen-teller (X/Y format) in de TaskRow.
- **Rationale**: Directe visuele feedback over de voltooiing van checklists binnen de feed voor betere voortgangsvisualisatie.

## [2026-02-22] Responsiviteitscorrectie
- **Keuze**: Vertical stacking en text-wrapping voor Quick Add bar en taakregels.
- **Rationale**: Elimineren van horizontale scroll en herstellen van de responsiviteit op mobiel, conform Microsoft To Do methodiek.

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
- **Rationale**: Prisma 7.4.x vereist expliciete adapters for directe databaseverbindingen met de "client" engine. Dit voorkomen initialisatie-fouten in serverless/edge omgevingen.
- **Actie**: `pg` en `@prisma/adapter-pg` geïnstalleerd en geconfigureerd in `src/lib/prisma.ts`.

## [2026-02-21] Database Schema Reset (Microsoft Mirror)
- **Besluit**: Database schema gereset naar Microsoft-mirror structuur. Oude test-data verwijderd wegens incompatibiliteit met verplichte Microsoft velden.
- **Rationale**: Synchronisatie met Microsoft To-Do en Outlook (Microsoft Graph) vereist een specifieke datastructuur om naadloze integratie mogelijk te maken.
- **Actie**: `schema.prisma` bijgewerkt met `User`, `Project`, `Task`, `ChecklistItem` en `Contact` modellen. Database gereset via `db push --force-reset`.

## [2026-02-21] Authenticatie via Clerk
- **Besluit**: Authenticatie live via Clerk. Microsoft OAuth scopes geconfigureerd voor Graph API toegang.
- **Rationale**: Clerk biedt een robuuste en schaalbare oplossing for User Management en OAuth flows, essentieel voor de integratie met Microsoft Graph.
- **Actie**: `ClerkProvider` toegevoegd aan `layout.tsx`, `clerkMiddleware` geconfigureerd in `middleware.ts`, en user sync logica geïmplementeerd in `page.tsx`.

## [2026-02-21] Microsoft Graph Handshake
- **Besluit**: Token retrieval mechanisme via Clerk geïmplementeerd. Voorbereid op de eerste bidirectionele To-Do sync.
- **Rationale**: Directe toegang tot Microsoft Graph tokens via Clerk minimaliseert overhead en zorgt voor veilige, kortstondige toegang tot user data.
- **Actie**: `src/lib/microsoft.ts` aangemaakt for token management en Graph API calls. `syncMicrosoftLists` action toegevoegd for initiële validatie.

## [2026-02-21] Authentificatie UI (Zinc Theme)
- **Besluit**: Authenticatie flow visueel en technisch voltooid. Redirect-strategie geactiveerd for naadloze dashboard-landingen.
- **Rationale**: De Clerk components zijn gestileerd middels de `appearance` API om aan te sluiten bij het Zinc-thema van shadcn/ui.
- **Actie**: `src/app/sign-in/[[...sign-in]]/page.tsx` en `src/app/sign-up/[[...sign-up]]/page.tsx` aangemaakt met Zinc-styling.

## [2026-02-21] Header UI Professionalisering (UserNav)
- **Besluit**: Header UI geprofessionaliseerd. Placeholder vervangen door UserNav met Microsoft-profieldata en logout-functionaliteit.
- **Rationale**: Directe visuele herkenning door Microsoft-profieldata verhoogt het eigenaarschap van de gebruiker. Een expliciete logout via Clerk zorgt for beter sessiebeheer.
- **Actie**: `UserNav` component geïmplementeerd met Shadcn `Avatar` en `DropdownMenu`. Dashboard header layout bijgewerkt in `page.tsx`.

## [2026-02-21] Layout Refactor naar SaaS-model
- **Besluit**: Dashboard layout herstructureerd naar SaaS-model. Sticky header met navigatie en UserNav geïmplementeerd for persistente identiteit.
- **Rationale**: Een sticky header verbetert de UX door navigatie en gebruikersidentiteit altijd toegankelijk te houden. De gecentreerde content grid verhoogt de focus op de kernactiviteit.
- **Actie**: `src/app/page.tsx` heringericht met een sticky `<header>` en een gecentreerde `<main>` content area.

## [2026-02-21] Oplossen UI Duplicatie & Globale Layout
- **Besluit**: UI duplicatie opgelost. Navigatie en User Management zijn nu onderdeel van de globale applicatie-layout (`layout.tsx`).
- **Rationale**: Door de header globaal te maken, garanderen we een consistente navigatie-ervaring over alle pagina's en voorkomen we dubbele elementen.
- **Actie**: `header` en `UserNav` verplaatst van `page.tsx` naar `layout.tsx`.

## [2026-02-21] Data Monitor Pagina & Tasks Integration
- **Besluit**: Data Monitor pagina uitgebreid met real-time inspectie van Microsoft Tasks via een nested-fetch mechanisme.
- **Rationale**: Directe verificatie van individuele taken en hun status over verschillende lijsten heen is essentieel for het kalibreren van de bidirectionele synchronisatie.
- **Actie**: `/debug` route geoptimaliseerd met `Promise.all` for parallelle fetches van taken per lijst. UI uitgebreid met een overzichtstabel.

## [2026-02-21] Iteration 2: Microsoft Sync Motor
- **Besluit**: Implementatie van de Double-Write strategie for taken.
- **Rationale**: Door de taak eerst in Prisma (lokaal) op te slaan en daarna pas naar Microsoft Graph te pushen, garanderen we dat de gebruiker nooit hoeft te wachten op de cloud-integratie.
- **Actie**: `mutateGraph` helper toegevoegd aan `microsoft.ts`. `addTask` action in `actions.ts` gerefactored naar "Safety Net" patroon.

## [2026-02-21] Performance-optimalisatie (Eindfase)
- **Besluit**: Performance-targets behaald: switch-tijd gereduceerd van >10s naar <100ms (prod-equivalent) door ontkoppeling van sync-logica.
- **Rationale**: Door de pageload te bevrijden van blokkerende API-calls naar Microsoft, voelt de applicatie nu 'instant' aan.
- **Actie**: `userId` hernoemd naar `clerkUserId`, DB-indexen toegevoegd, sync-on-load verwijderd uit pages, en handmatige sync-knop geïmplementeerd.

## [2026-02-21] Prismate Task List (Todo10 Style)
- **Besluit**: Implementatie van Todo10-layout met Shadcn Table en Sheet-integratie for taakbeheer.
- **Rationale**: De visuele taal van Shadcn Todo10 biedt een premium, functionele interface for de "Grip" methode.
- **Actie**: `TaskRow`, `TaskDetailSidebar` en `TaskList` componenten geïmplementeerd.

## [2026-02-21] Schema Sync met Microsoft Graph
- **Besluit**: Schema gesynchroniseerd met Microsoft Graph todoTask spec; recurrence (Json) en categories toegevoegd.
- **Rationale**: Microsoft's patternedRecurrence structuur is te complex for platte kolommen. Door gebruik van Json borgen we de data-integriteit.
- **Actie**: `Task` model in `schema.prisma` uitgebreid met `recurrence` (Json), `categories` (String[]), `isMyDay`, `myDayDate` en `bodyLastModifiedDateTime`.

## [2026-02-21] Quick Add & TaskDetailSheet Verfijning
- **Besluit**: Toevoeging van een persistente `AddTaskInput` boven de takenlijst en URL-gebaseerde navigatie for de `TaskDetailSheet`.
- **Rationale**: Een directe invoerregel verlaagt de drempel for taakcreatie (Quick Add). URL-gebaseerde navigatie maakt het mogelijk om specifieke taken te bookmarken.
- **Actie**: `AddTaskInput` component gemaakt, `TaskList` en `TaskRow` aangepast for URL-sync, en `TaskDetailSheet` secties geoptimaliseerd for GRIP methodiek.

## [2026-02-21] QuickAddTask Uitbreiding
- **Besluit**: `QuickAddTask` component uitgebreid met contextuele metadata-pickers en expanded state.
- **Rationale**: Verbetering van de 'Capture' workflow door direct metadata (datum, herinnering, herhaling, project) te kunnen toevoegen zonder de detail-sheet te openen.
- **Actie**: `QuickAddTask` component gerefctored naar expandable metadata-bar; modulaire pickers geïntegreerd via Shadcn; `addTask` server action uitgebreid met volledige metadata-ondersteuning.

## [2026-02-21] UI-cleanup & Iconografie Update
- **Besluit**: UI-cleanup uitgevoerd: QuickAddTask compacter gemaakt door labels te verwijderen en project-icoon overal gewijzigd naar Briefcase.
- **Rationale**: Minimalistische UI vermindert cognitieve belasting. De Briefcase icoon is meer passend voor projecten/lijsten in een zakelijke context.
- **Actie**: `QuickAddTask` labels verwijderd, project-icoon gewijzigd naar `Briefcase` in `QuickAddTask`, `ProjectSelector`, `TaskDetailSheet` en `TaskRow`.

## [2026-02-21] TaskRow Metadata Layout Update
- **Besluit**: `TaskRow` layout aangepast naar metadata-onder-titel model; applicatiebreed project-icoon gewijzigd naar Briefcase voor professionele uitstraling.
- **Rationale**: Alle relevante taakcontext is nu direct zichtbaar zonder extra schermruimte in te nemen aan de rechterkant. Dit volgt de Microsoft To Do esthetiek nauwgezet.
- **Actie**: `TaskRow` uitgebreid met conditionele weergave van Project, Mijn dag, Vervaldatum, Herhaling en Herinnering onder de titel.

## [2026-02-21] Mobile-First Architectuur voor Taken
- **Besluit**: Architectuurwijziging doorgevoerd voor mobiele navigatie: migratie naar Sheet-gebaseerde sidebar en taakdetails, en een sticky Quick Add bar.
- **Rationale**: Optimalisatie van de mobiele ervaring door full-screen overlays op kleine schermen. De sticky Quick Add bar met glassmorphism verhoogt de toegankelijkheid van de 'vangen' functionaliteit.
- **Actie**: `Sidebar` extracted, `QuickAddTask` fixed onderaan geplaatst, en `TaskDetailSheet` geforceerd op volledige breedte voor mobiel.

## [2026-02-21] Responsieve Optimalisatie & Toegankelijkheid
- **Besluit**: Metadata stacking in TaskRow en top-aligned Quick Add bar geïmplementeerd; accessibility warnings voor Sheets opgelost via VisuallyHidden. Drag handle spacing verkleind en hover-only gemaakt.
- **Rationale**: Verbetering van de 'duim-vriendelijkheid' en flow. Stacking voorkomt horizontale scroll op smalle schermen. VisuallyHidden lost de Radix DialogTitle waarschuwingen op. Een cleanere UI door de drag handle alleen op hover te tonen.
- **Actie**: `TaskRow` metadata omgezet naar wrap/stack layout. `QuickAddTask` verplaatst naar bovenkant `tasks/page.tsx`. `VisuallyHidden` component toegevoegd en toegepast in `Sidebar.tsx`. Drag handle icon opacity naar hover-only gebracht en cel-breedtes verkleind.

## [2026-02-21] Mobile Drag & Drop Fix
- **Besluit**: `TouchSensor` toegevoegd en activatie-constraints geconfigureerd for `dnd-kit`.
- **Rationale**: Op mobiel interfereerde de drag-actie met het scrollen. Door een delay (250ms) toe te voegen, kan de browser het onderscheid maken tussen een scroll en een drag.
- **Actie**: `TaskList` sensors bijgewerkt; `TaskRow` drag handle voorzien van `touch-none`.

## [2026-02-21] Sidebar & Filtering Implementatie
- **Besluit**: Sidebar functioneel gekoppeld aan Prisma-filters; URL-gebaseerde routing voor taaklijsten en projecten geïmplementeerd.
- **Rationale**: URL-based filtering is robuust, deelbaar en behoudt de browsergeschiedenis. Het verbetert de consistentie tussen de sidebar en de weergegeven taken.
- **Actie**: `tasks/page.tsx` aangepast for server-side filtering; `Sidebar` opgesplitst in Server/Client components; `QuickAddTask` context-bewust gemaakt.
## [2026-02-21] Diagnostische fase: Missing Tasks
- **Besluit**: Diagnostische fase gestart voor ontbrekende gesynchroniseerde taken.
- **Actie**: Prisma query logging geactiveerd, diagnostic API route `/api/debug/tasks` aangemaakt en `syncTasksAction` geïmplementeerd.
- **Rationale**: Inzicht krijgen in de SQL queries en data-eigendom om de mismatch in de "Where" clausule te identificeren.

## [2026-02-21] Prismate Shell Visuele Refinement
- **Besluit**: Configuratie van de Application Shell met SidebarInset architectuur en Zinc-thematiek voor premium visuele hiërarchie.
- **Rationale**: Het 'Inset' effect creëert een visuele scheiding tussen navigatie en content, wat rust en overzicht uitstraalt conform de GRIP-methode.
- **Actie**: `SidebarInset` geïmplementeerd, Zinc-kleurenpalet gestandaardiseerd en component-proporties (16rem sidebar, p-4 padding) aangescherpt.

## [2026-02-21] Navigatie-reorganisatie & Pagina-level Filtering
- **Besluit**: Sidebar gestroomlijnd naar kern-entiteiten; operationele taak-filters verplaatst naar page-level Tabs.
- **Rationale**: Minimalisering van de Sidebar voor een "Cockpit-gevoel" en focus op één context tegelijk op de takenpagina conform de GRIP-methode.
- **Actie**: Sidebar menu items bijgewerkt naar Inbox, Taken, Notities, Projecten, Klanten. `/tasks` pagina heringericht met Tabs (Mijn Dag, Belangrijk, etc.) en een Popover Project Selector. Placeholder routes aangemaakt voor nieuwe entiteiten.
