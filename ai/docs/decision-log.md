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

## [2026-02-21] Kalender Header Hoogte Standaardisatie

- **Keuze**: Gedeelde en vaste hoogte (`--calendar-header-height: 56px`) geïmplementeerd voor naadloze uitlijning tussen de sidebar Tabs en de Agenda toolbar.
- **Actie**: Kalender toolbar verfijnd: witte achtergrond, buttons absoluut consistent (fw 400, dynamische breedte, gelijke padding).

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

## [2026-02-27] Unificatie & Standaardisering Taakregels

- **Besluit**: Unificatie en Mantine-standaardisering van taakregels over dashboard en agenda-sidebar via `TaskRowItem` component met indigo accentkleuren.
- **Rationale**: Verminderen van code-duplicatie en borgen van een consistente, premium Mantine UI ervaring.

## [2026-02-27] Exhaustieve Mantine-ificatie Kalender

- **Keuze**: Volledige herbouw van de kalender-shell (toolbar, headers, grid, events) middels Mantine UI componenten en theme tokens.
- **Rationale**: Realiseren van een naadloze, premium integratie van de kalender in de Prismate architectuur, conform de GRIP-methode en Mantine standaarden.
- **Resultaat**: Alle ad-hoc styling en build errors verwijderd; consistente typografie en layout-flexibiliteit over alle views (inclusief fix voor month-view height via explicit page container height).

## [2026-02-28] Icon Verfijning Sidebar

- **Keuze**: Specifieke iconen verfijnd in de sidebar: Vandaag (Bolt), Week (ViewColumns), Klanten (Identification).
- **Rationale**: Directe visuele associatie verbeteren conform gebruikersvoorkeur en GRIP-focus.

## [2026-03-01] Checkbox & Optimistic UI Verfijning

- **Keuze**: Unificatie van checkbox-styling met indigo vulling en thema-bewuste vinkje-kleuren (wit in light mode, donkergrijs in dark mode).
- **Keuze**: Implementatie van Optimistic UI via `useOptimistic` en `useTransition` voor taakstatus-wijzigingen en het openen van de taak-drawer.
- **Keuze**: Toevoeging van micro-animaties via Framer Motion (`AnimatePresence`) waarbij taken bij afvinken omlaag bewegen en bij terugzetten omhoog bewegen.
- **Rationale**: Realiseren van een "instant" en gepolijste gebruikerservaring waarbij de interface direct reageert op acties zonder visuele vertraging door server-communicatie.

## [2026-02-28] Audit Fase 1: Typography Refactoren

- **Keuze**: Verwijderen van Tailwind typography klassen en standaardiseren op Mantine <Title> en <Text>.
- **Rationale**: Borgen van merkidentiteit en consistentie door uitsluitend gebruik te maken van Mantine's typografische systeem.

## [2026-02-28] Audit Fase 3: Spacing & Background Correctie

- **Keuze**: AppShell.Main achtergrond ingesteld op gray.0.
- **Rationale**: Verbeteren van de visuele hiërarchie door contrast te creëren tussen navigatie (sidebar) en content area, conform Microsoft-esthetiek.

## [2026-02-28] Agenda Height Regression Fix

- **Keuze**: Teruggedraaid naar expliciete viewport-hoogte (h-[calc(100vh-60px)]) voor de Agenda-page.
- **Rationale**: Herstellen van de row-stretch in de maandweergave van de kalender, die verloren ging door impliciete hoogte-overerving.

## [2026-02-28] Final Style Purge

- **Keuze**: Volledige verwijdering van hardcoded Tailwind kleuren (gray-50/100/400) en typografie in Sidebar, Shell en Projecten pagina.
- **Rationale**: Realiseren van 100% Mantine-compliance en consistente visuals over de gehele applicatie.

## [2026-02-28] Tasks Interface Refactor (JTBD)

- **Keuze**: Implementatie van bulk-selectie, een project-zijpaneel en 'Opschonen' view in de takenlijst.
- **Rationale**: Directe ondersteuning van de Jobs-to-be-Done (structureren en backlog management) conform Mantine design principles.
  Vervanging van de standaard sidebar door de Mantine "Navbar Minimal" (80px breed) met iconen en tooltips.
  Dikte van de navbar iconen verlaagd naar 1.5.
  Dikte van de navbar iconen verlaagd naar 1.

## [2026-02-28] Migratie Middleware naar Proxy

- **Keuze**: Hernoemen van `src/middleware.ts` naar `src/proxy.ts` ter oplossing van de Next.js 16.1 deprecation warning.

## [2026-02-28] Agenda Layout en Header/Sidebar Opschoning

- **Keuze**: Optimalisatie van Agenda layout met onafhankelijke vertical scroll en opschoning van ongebruikte Navbar en Topbar elementen. Ter voorkoming van onvoorspelbare padding/margin accumulaties bij edge-to-edge stretching, is we `Grid` component op de Agenda pagina vervangen door een determenistische `Flex` lay-out.
- **Keuze**: Volledige kloon van de flex-geoptimaliseerde Agenda layout naar de Vandaag pagina (`/vandaag` -> `VandaagView.tsx`). Hierbij is overgestapt naar een 3-koloms weergave (1/3 breedte per stuk) waarbij de Sidebar standaard de 'Mijn dag' smartlijst laadt en de react-big-calendar component standaard de 'Dag'-weergave opent, plus een lege placeholder-kaart voor toekomstige features.

- Refactored CalendarView and VandaagView to share data fetching hook and SharedCalendarWidget component for cleaner architecture.

- Verwijderen van Globe icon en GMT+2 tijdzone indicator in de calendar topbar.

- Verwijderen van accentkleur (lichtblauwe achtergrond) voor de huidige dag in de kalender weergaves.
  Layout van /tasks pagina gewijzigd naar een 3-kolommen grid (20/40/40) conform de /vandaag en /agenda views.
  Fix viewport clipping op /tasks door wrapper element toe te voegen, ongebruikte componenten opgeschoond.

## [2026-03-01] Verwijdering 'Opschonen' Functie Takenlijst

- **Keuze**: Volledige verwijdering van de 'opschonen' functionaliteit (grooming view) en bijbehorende UI-componenten zoals de TaskViewSwitcher.

## [2026-03-01] Verwijdering Bulk-selectie Taakregel

- **Keuze**: Verwijderen van de checkbox voor bulk-selectie aan de linkerkant (Progressive Disclosure) in de taakregel-UI (`TaskRowItem`).
- **Rationale**: Opschonen van de elementen op de interface nadat bulk-acties (via grooming view) zijn verwijderd.

## [2026-03-01] Sidebar Navigatie Update: Taken & Projecten

- **Keuze**: Sidebar link "Projecten" (die naar taken verwees) hernoemd naar "Taken" en icoon gewijzigd naar `CheckCircleIcon`. Tevens een nieuwe link "Projecten" toegevoegd daaronder, gekoppeld aan `/projects` met `BriefcaseIcon`.
- **Rationale**: Verduidelijken van de entiteiten in de sidebar en realiseren van de juiste terminologie per link conform de GRIP methodiek.

## [2026-03-01] Sidebar Styling: Solid Indigo

- **Keuze**: Achtergrondkleur van de Sidebar aangepast naar solid indigo (`var(--mantine-color-indigo-filled)`), overige iconen allemaal wit, met een iets lichtere hover en active focus (`indigo.5`).
- **Rationale**: Verhogen van de visuele identiteit van de applicatie. Door de hoofdkleur door te trekken in de navigatie krijgt de app een meer zelfverzekerde, Premium SaaS uitstraling.

## [2026-03-01] Sidebar Icon Dikte Update

- **Keuze**: Dikte (strokeWidth) van de navigatie iconen in de sidebar verhoogd van 1.0 naar 1.2.
- **Rationale**: Verbeteren van de leesbaarheid en visuele gewicht van de iconen tegen de donkere achtergrond.

## [2026-03-01] Theme Toggle Switch

- **Keuze**: Toevoeging van een ThemeToggle knop in de Navbar (boven de UserAvatar) met `SunIcon` en `MoonIcon` van Heroicons.
- **Rationale**: Directe controle over light/dark mode via Mantine's `useMantineColorScheme` en `useComputedColorScheme` om hydration mismatches te voorkomen.

## [2026-03-01] Dark Mode Style Purge

- **Keuze**: Structureel verwijderen van hardcoded Tailwind kleuren (`bg-white`, `bg-gray-*`, `text-black`) in AppShell, VandaagView, CalendarView en TaskList componenten en deze vervangen door dynamische Mantine CSS-variabelen zoals `var(--mantine-color-body)`, `var(--mantine-color-default-border)`, en `var(--mantine-color-text)`.

## [2026-03-01] Unified Task Feeds

- **Keuze**: De `TaskList` component is nu de universele feed-component. Aanpassingen omvatten: `mode='page' | 'sidebar'`, conditionele DnD-ondersteuning afhankelijk van de mode (voor react-big-calendar calendar events vs dnd-kit verticale lijstsortering), en het verbergen van de bulk-action Affix in de zijbalk. De `TaskSidebar` map() is verwijderd en vervangen door deze gecentraliseerde feed.
- **Rationale**: Minimaliseert duplicate rendering logica, voorkomt state issues.
- Verfijning van de takenfeed UI door verwijdering van de drag-handle iconen en implementatie van een compacte, wit-omlijnde checkbox-stijl voor een premium look in dark mode.
- Synchroniseert UX met de Agenda en Vandaag componenten inéén herbruikbaar geheel (vergelijkbaar met hoe de Calendar is aangepast). Leesbaarheid in dark mode voor Task items is verder verbeterd (`var(--mantine-color-text)` en default hover states in `TaskRowItem`).

## [2026-03-01] Prisma Update Fix in Kalender

- **Besluit**: Gebruik van het werkelijke Task ID in plaats van een tijdelijk ID voor de optimistische state update in `handleDropFromOutside`.
- **Rationale**: Voorkomen van PrismaClientKnownRequestError bij het direct resizen van een zojuist gesleepte taak in de kalender.

## [2026-03-01] Theme Toggle Switch naar Mantine Switch

- **Besluit**: De ThemeToggle button is vervangen door een Mantine `Switch` component met `thumbIcon`, volledig gestileerd in indigo tinten en verfijnde iconen (1.2pt stroke).
- **Rationale**: Verbetering van de visuele feedback en interactie in de sidebar, waarbij de actieve modus (Sun/Moon) direct in de switch thumb zichtbaar is conform de Mantine documentatie.
  UI Redesign: /tasks pagina omgebouwd naar floating cards layout voor takenlijsten met quick-add verplaatst naar boven.
  UI Redesign V2: /tasks styling geupdate naar zuivere Mantine cards op basis van RCA. Check via browser subagent geslaagd.
  Styling tweaks verwerkt: padding 20px eraf gehaald om kaders door te laten lopen, extra borders erbij. Achtergrond kolom 2 gebruikt Tailwind variabele en dark variant in plaats van vaste Mantine props.
  Rechterkolom omgezet naar smalle 20% grid-kolom en detailvenster daarin vastgezet voor inline editing (niet-floating in page.tsx mode)
  Smart list 'Ooit' (tasks without date and project) added met bookmark icon. Link gedeeld in zowel desktop Sidebar als mobile Sidebar.
  De icoonkleuren op de smart lists in System Views (sidebar, taken dashboard, planner menu) zijn geconsolideerd. Geel/oranje (amber-500) voor Mijn Dag & rood (red-500) voor belangerijk/ster
  Ooit toegevoegd als volwaardige database flag (isSomeday) ipv. null-filter. Toegevoegd aan TaskDetailSheet en als inline quick-add toggle (MyDay, Belangrijk, Ooit) in actiebalk.
  Ooit categorie badge + specifieke indigo icoon nu zichtbaar op taakregels in overzichtelijsten, analoog aan Mijn Dag in TaskRowItem.
  De marges/paddings links, rechts en strak boven de taakregelkolom in /tasks zijn verdubbeld voor een rustiger blikveld.
  TaskDetailSheet (Detail panel rechts) gerestyled als witte kaarten (cards) conform MS To-Do opzet. Lange titels hebben extra ruimte, pick-a-category weggelaten, active toggles lichten op met standaard tekstkleur en icon-accentkleur.
  Detail panel (TaskDetailSheet) ontdaan van container achtergrondkleur en card-structuren om horizontale marges weg te nemen. Alles is nu uitgelijnd van rand tot rand en de iconen en paddings van Agenda, Projecten, Reminder en Recurrence match nu 1:1 de MS To Do layout.
  Alle knoppen in de taakdetails (herinner mij, herhalen, vervaldatum, projecten) links uitgelijnd via de Mantine justify-prop en de linkermarges genormaliseerd.
  Styling van knoppen in de taakdetailskolom (gap, padding, fontkleur, fontgewicht) aangepast (gap-3, px-3, fontWeight 400 en zwarte tekstkleur via '--mantine-color-text') zodat deze identiek zijn aan de items in de navigatie-sidebar (takenlijsten).
  Verschillen tussen linkermenu en rechter detailpanel waargenomen en exact 1:1 gladgestreken: gap-4, px-4, fw=400, en c='var(--mantine-color-text)' geïmplementeerd in detailpanel.
  Alle dividers uit het taakdetail panel (TaskDetailSheet) zijn verwijderd en er is 'space-y-1' layout aan toegevoegd, analoog aan de linkermenu's.
  Afstand tussen iconen en tekstlabels in het detailpaneel met 8px vergroot (gap-6 geïmplementeerd) voor een ruimere uitstraling en meer ademruimte.
  Mantine Button-layout geforceerd door de 'children' nu expliciet te wrappen in 'flex items-center gap-5'. Dit verhelpt het probleem met de genegeerde Tailwind 'gap' property, waardoor de tekst nu visueel perfect wegschuift van het icoon (8px winst) en uitlijnt met de Sidebar lijsten.
  Datum-parsing toegevoegd aan actions.ts om 'Invalid value for argument dueDateTime' op te lossen. Daarnaast 'width="target"' verwijderd bij de ReminderPicker zodat de button niet langer ten onrechte oprekt.

## [2026-03-01] Vandaag Layout Refactor (50/50)

- **Keuze**: Layout van de `/vandaag` pagina (`VandaagView.tsx`) aangepast naar een 50/50 split tussen Taken/Notities en de Agenda, met consistente kleuren vanuit `/tasks` (`gray-0`/`dark-8` voor de linkerkolom, `white`/`dark-7` voor de rechterkolom) en verwijdering van inline Card-styling.
- **Rationale**: Minimaliseren van overbodige kolommen, standaardiseren op de modulaire Mantine-layout en achtergrondkleuren 1:1 alignen met het taakoverzicht voor een consistente rustige interface in zowel light als dark mode.
  Icoon groottes in het detail paneel verkleind van 'h-5 w-5' naar 'h-4 w-4' voor visuele harmonie en verfijning.
  Taak detail paneel lay-out geoptimaliseerd voor smalle kolommen: 'min-w-0' toegevoegd voor geforceerde text-truncatie en rechter padding ('pr-0') verwijderd om overlopen te voorkomen. De project picker en datumbereiken blijven nu strak binnen de 20% breedte kolommen.

## [2026-03-01] User Avatar naar Top Bar

- **Besluit**: De user avatar en bijbehorende menu popover zijn verplaatst van de navigatie-sidebar naar de rechterkant van de bovenste top bar.
- **Rationale**: Verbeteren van de globale navigatie-hiërarchie waarbij profielinstellingen en sessiebeheer consistent in de header-context staan.
- **Actie**: `UserNav` verwijderd uit `AppSidebar` en geïntegreerd in de `AppShell` header Group, inclusief layout-fix voor perfecte uitlijning met actie-iconen.

## [2026-03-01] Project Titels Truncatie

- **Besluit**: Implementatie van truncatie (`truncate`) op alle projecttitels in de sidebar, project selector en taakregels.
- **Rationale**: Voorkomen dat lange projectnamen de interface breken of naar meerdere regels wrappen, conform Microsoft-esthetiek en GRIP-discipline.
- **Actie**: Gebruik van Mantine `<Text truncate="end">` in `ProjectSidebar`, `ProjectSelector` en `TaskRowItem`.

## [2026-03-01] Corner Radius & Project Typografie

- **Keuze**: Globale instelling van corner-radius op 0 voor alle cards en UI-elementen, en synchronisatie van project-typografie met slimme lijsten in de sidebar.
- **Rationale**: Realiseren van een strakke, hoekige esthetiek conform gebruikerswens en borgen van visuele consistentie in de navigatie. Aanpassing van task row titel font weight naar 400. Verkleining van checkbox, vergroting van rij-afstand en aanpassing kleur voltooide taken (nu ook geoptimaliseerd voor dark mode). Migratie van het taakdetailvenster van een vaste kolom naar een Drawer op de /tasks pagina voor een schonere layout. Aanpassing van de AppShell naar 'alt' layout voor een navbar over de volledige hoogte.

## [2026-03-01] Performance & Hydration Fixes /tasks

- **Besluit**: Hydratatie-fouten opgelost via `suppressHydrationWarning`, context-loop in Header geëlimineerd via memoizatie, en taak-detail loading versneld door projects data-prop door te geven en URL-sync loop te fixen.
- **Rationale**: De 'endless compiling' en tragere UI-respons werden veroorzaakt door onnodige Server Action calls en React re-render loops in de context-providers en URL-listeners.

## [2026-03-01] Inklapbare Navigatie Sidebar

- Implementatie van een inklapbare navigatie-sidebar op de takenpagina met hamburger-toggle en auto-collapse onder 900px.

## [2026-03-01] Optimalisatie van Component-Tree & Referentiële Stabiliteit

- Implementatie van referentiële stabiliteit in Hooks en optimalisatie van de component-tree om overmatige re-renders te voorkomen.
- **RCA & Fixes**: handlers in `useCalendarEvents` gememoiseerd via `useCallback`, `SharedCalendarWidget` en `TaskRowItem` omgezet naar `React.memo`, en `useSearchParams` uit individuele lijstitems verwijderd om cascade-renders bij URL-wijzigingen te voorkomen.

## [2026-03-01] Vaststellen van architectonische performance-hypotheses

- **Audit**: Analyse van Clerk-integratie en Mantine-hydratatie.
- **Resultaat**: Hypothese 1 (Auth-State Handshake) vastgesteld als hoofdoorzaak van de initiële 'flash' en visuele instabiliteit, versterkt door layout-shifts in Mantine's responsive componenten (Hypothese 2).

## [2026-03-01] Stabilisatie van Auth-handshake & CLS Optimalisatie

- **Fix**: Rendering van AppShell uitgesteld tot Clerk isLoaded true is om hydration mismatches en de auth-flash te voorkomen.
- **Layout**: Mantine AppShell geforceerd op vaste dimensies (Header 60px, Navbar 80px) via CSS-props om Layout Shifts te elimineren.
- **Skeletons**: "Laden..." placeholders en spinners in TaskList, VandaagView en CalendarView vervangen door structurele Skeleton componenten voor een rustigere visuele opbouw.

## [2026-03-01] Mobile Tasks Navigatie & Long-Press

- **Besluit**: Implementatie van mobile-first layout met long-press bulk acties en fullscreen navigatie voor de `/tasks` view.
- **Rationale**: Realiseren van een native-app gevoel op mobiele apparaten door de Sidebar en Takenlijst als onafhankelijke fullscreen views te presenteren. Het gebruik van long-press (met haptische feedback) activeert de bulk-selectie actiebalk conform moderne mobiele ontwerppatronen.
- **Actie**: `TaskView` geüpdatet met `isMobile` conditionele rendering voor navigatie via een terug-knop, `TaskRowItem` voorzien van 500ms long-press detectie, en `TaskList` uitgerust met bulk-selectie toggling.

## [2026-03-01] Mobile Navigatie Menu Update

- **Besluit**: De mobiele navigatie is 1:1 gesynchroniseerd met de desktop sidebar en iconen zijn over de volledige breedte gecentreerd zonder tekstlabels.
- **Rationale**: Realiseren van visuele consistentie tussen systemen en creëren van een rustigere `AppShell.Footer` die fungeert als een native tab-bar.
- **Actie**: Tekstlabels uit `MobileNavItem` verwijderd, layout geüpdatet met `justify="space-between"`, en de `/agenda` link is verborgen conform focus-methodiek.

## [2026-03-01] Layout-fix VandaagView

- Layout-fix VandaagView: implementatie van responsive SimpleGrid en vloeibare containers voor correcte breedte-proporties.

## [2026-03-02] CSS Layout-fix TaskRowItem

- Bugfix TaskRowItem: Stack container gewijzigd naar `flex-1` om extreme woordafbreking (smalle verticale letters) in de sidebar componenten te verhelpen.

## [2026-03-02] Vandaag Layout Refactor (Flex/Master-Detail)

- **Besluit**: De gehele VandaagView layout (`/vandaag`) is geherstructureerd van een `SimpleGrid` (3-kolommen) naar een Flexbox Master-Detail layout, vergelijkbaar met `/tasks`.
- **Implementatie**: Oude agendarender-logica verwijderd. Een nieuwe `VandaagSidebar` gecreëerd met links voor Zoeken, Inbox, Dagplan en Nieuw (Project, Klant, Factuur, Offerte). Dit is gebaseerd op een strakker navigatiemodel. Inhoud in het detail-paneel wordt placeholder tekst voor Inbox/Dagplan conform verzoek.

## [2026-03-02] Taaktellers in /tasks Navigatie

- **Besluit**: Tellers toegevoegd aan de lijst- en projectnavigatie in de sidebar van de `/tasks` view.
- **Implementatie**: Single-query fetch toegevoegd aan `page.tsx` om `isMyDay`, `isImportant`, `dueDateTime` en `projectId` flags van alle openstaande taken in één keer op te halen. Deze efficiënte in-memory telling voorkomt meerdere losse database queries. De tellingen (`counts`) worden als prop doorgegeven aan `TaskView` en `ProjectSidebar`, waar ze getoond worden via de `rightSection`-prop in een subtiele `<Text>` component.
- Verwijdering van de mobiele bottom navigation bar uit \`app-shell.tsx\` om de dubbele scrollbalk op desktop op te lossen.
- Vervanging van \`Text\` door \`Badge\` component voor de tellers in \`ProjectSidebar.tsx\` om consistentie te creëren met de \`/vandaag\` weergave.
- Verandering van Badge kleur naar `indigo` in `ProjectSidebar.tsx` voor consistentie met `/vandaag` weergave.

## [2026-03-02] Vandaag Inbox Architectuur & Prullenbak

- **Besluit**: Implementatie van een 3-koloms layout voor de Vandaag Inbox (Sidebar, Inbox Table, Detail Panel) en toevoeging van Prisma modellen `InboxItem`, `Note`, en `File`.
- **Rationale**: Creëren van een centrale 'unified' plek voor losse notities, bestanden en flagged emails. Door `deletedAt` toe te voegen creëren we direct een soft-delete (Prullenbak) structuur die vanuit de Sidebar te benaderen is.
- **Actie**: Prisma schema uitgebreid en gesynchroniseerd; `VandaagInbox` en `InboxDetailPanel` componenten gerealiseerd met Mantine UI.

## [2026-03-02] Migratie Iconografie: Heroicons n. Tabler

- **Besluit**: Volledige migratie van `@heroicons/react` naar `@tabler/icons-react` gerealiseerd voor betere visuele opties en consistentie.
- **Rationale**: Uitbreiden van functionele en visuele keuze binnen de Mantine/Prismate omgeving. Basis line-weight blijft 2px (default van Tabler).

## [2026-03-02] Verfijning Iconografie & Stroke

- **Besluit**: Klanten, Doelen en Week iconen in navigatie vervangen door resp. IconId, Trophy en CalendarMonth. IconMail in de Inbox vervangen door IconFlag3.
- **Besluit**: Alle Tabler iconen applicatie-breed op een subtielere stroke-dikte van 1.2 gezet. Voltooid lijst icoon aangepast naar check icon.
- **Rationale**: Verfijning van de interface en nauwkeurigere visuele semantiek afgestemd op de functionaliteiten van de app.

## [2026-03-04] Configuratie van Mantine Spotlight

- "Configuratie van Mantine Spotlight met gestructureerde GRIP-acties en icon-gebaseerde actie-layout."
- "Mapping van Spotlight-acties aan GRIP-specifieke routes en Tabler-iconen vastgelegd."

## [2026-03-04] Notes Sidebar & Schema Update

- Migratie uitgevoerd voor isPinned en tags velden; start bouw metadata-gedreven sidebar.
- Implementatie van Sidebar-onderdelen voor Notes: Pinned, Projecten en Tags met Mantine UI-elementen.
- Bouw van de NoteCard component en implementatie van de centrale Notes Feed met Prisma-filtering in een 3-koloms layout.
- Styling van tags toegevoegd (distinctieve Mantine kleuren per tag, fw=400) en klikbare NoteCards die routeren naar '?noteId=' voor in-place detailweergave.
- Visuele update Notes Feed: achtergrond aangepast naar standaard body-kleur, kaarten omgezet naar Mantine Card met borders en extra padding/marges.
- Integratie van de BlockNote editor in de Notes module, inclusief useDebouncedCallback voor auto-save functionaliteit en next/dynamic loader.
- Implementatie van createNote flow, metadata header met TagsInput en project-integratie, en auto-focus logica voor de editor.
- UI Verfijningen in NotesView: Editor styling uitgelijnd naar links, notitietitel is nu inline bewerkbaar met debounced saves, en metadata gelaagd (tags + project) met strakke strokes.
- Vervanging van IconStar door IconHeart (outline/filled) in de NotesSidebar voor 'Favorites', inclusief actieve URL-filtering (`?pinned=true`).
- Toevoegen van een "favoriet/pinned" toggle functionaliteit voor notities met outline (inactief) en filled (actief) hartjes, beschikbaar in zowel de notitiekaart (`NoteCard`) via een actie-icoon uitgelijnd onder de datum als na de titel in het bewerkscherm (`NotesView`).
- Refactor van `/notes` feed naar een Mantine Table-gebaseerde lijstweergave in de stijl van `/vandaag`.
- Automatische selectie van de nieuwste notitie geïmplementeerd en notitie metadata omgebouwd naar een uitklapbaar (Accordion) eigenschappen-paneel geïnspireerd op Obsidian.
- Styling tweaks voor NoteMetadataHeader: Chevron naar links verplaatst, tekstkleur zwart gemaakt, velden volledige breedte gegeven.
- Tags en Project selectors in eigenschappen sectie weer hun normale breedte gegeven
- Min-width (200px) toegevoegd aan Project Select zodat lange namen niet op een tweede regel wrappen
- Dropdown breedte van Project selector dynamisch gemaakt (max-content) via comboboxProps om text wrapping in opties te voorkomen
- Text labels in eigenschappen sectie ('Status', 'Aangemaakt', etc) rechts uitgelijnd via ta='right'
- Padding aan rechterkant van Project Select input toegevoegd om overlap met het clear/dropdown icoon te voorkomen
- Tags en Project Selects in /notes properties weer ingesteld op flex: 1 voor volledige breedte om tekstafkapping te maximaliseren
- Het input veld van Project Selects schaalt nu dynamisch mee met de lengte van de langste projectoptie in de lijst via een 'ch' (character) basis, om premature truncations en onnodige flex uitrekking te voorkomen
- Fontgrootte van 'Eigenschappen' accordion label naar 13px verkleind
- Eigenschappen accordion label font-size aangepast naar standaard var(--mantine-font-size-sm) token in plaats van hardcoded px waarde
- Het font van Eigenschappen verkleind naar var(--mantine-font-size-xs)
- Font sizes van alle labels en waarden binnen de Eigenschappen sectie verkleind van 'sm' naar 'xs' via Mantine props
- Font grootte binnen de 'Eigenschappen' (labels, tags, project selector) teruggezet van 'xs' naar de standaard 'sm' (en var(--mantine-font-size-sm))

## [2026-03-06] Crosslink (BlockNote Mentions) Styling & Filter Logica

- **Keuze**: Volledige integratie van de entiteit-filters direct binnen de BlockNote `SuggestionMenuController` en dynamische verwijdering van het `@` trigger-karakter via Tiptap's `deleteRange` command. De BlockNote `<a href>` styling is via CSS aangepast naar Mantine's `indigo` zonder bold `font-weight`. Bovendien is er een Tabler `arrow-up-right` icoon (stroke 1) toegevoegd middels een inline CSS pseudo-element (`::before`) en een SVG `mask`, wat ervoor zorgt dat de kleur altijd overeenkomst met de crosslink ("currentColor").
- **Rationale**: Minimalistische en native bewerkervaring waar links natuurlijk opgaan in de tekst maar dankzij de indigo tint toch direct herkenbaar zijn als applicatie-entiteiten. Een subtiel icoon links van de link bevestigt de functie als uitgaande verwijzing zonder de flow te onderbreken.

## [2026-03-07] Crosslink Command Palette UI & Contextual Search

- **Keuze**: Ombouwen van het zwevende suggestiemenu naar een gecentreerde Command Palette overlay gestyled als Mantine's Spotlight met server-side context injectie (projectId) voor suggesties op basis van associatie als er geen zoekterm is.
- **Rationale**: Hergebruik van vertrouwde Spotlight UX componenten helpt de gebruiker sneller filteren en het serveren van gecontextualiseerde default suggesties bijlegeerd aan het huidige project/klant minimaliseert type-handelingen.

## [2026-03-07] Fixes BlockNote Slash Menu & Toggle List Degradering

- **Keuze**: Implementeren van een éénmalige `editor.replaceBlocks` initialisatie (`initializedRef`), ten faveure van de eerdere custom `SuggestionMenuController` hack die op sommige React-versies averechts werkte of botste met de headless UI.
- **Rationale**: De oorzaak van de trigger-slash (`/`) bugs én het degraderen van Toggle Lists bleek identiek: door debounced auto-saves triggert React re-renders waarbij `editor.replaceBlocks` met omgezette Markdown-inhoud werd ingeladen _tijdens_ live typing. De `replaceBlocks` fix voorkomt overschrijvingen vanuit lossy Markdown en corrigeert direct de slash menu enter-key interrupties zonder de built-in UI aan te tasten.

## [2026-03-07] NavLink Styling voor Feed Regels

- **Keuze**: Introductie van een globale `.feed-row` CSS klasse in `globals.css` die exact het visuele gedrag van een actieve Mantine NavLink (variant light, color indigo) repliceert voor hover en focus staten op feed items in de '/vandaag', '/notes' en '/tasks' pagina's.
- **Rationale**: Realiseren van een consistente, premium Mantine UX component styling voor overzichtslijsten.
- **Keuze**: Volledige conversie van `/tasks` layout naar Mantine `<Table>` analoog aan NotesFeed, waarbij `TaskRowItem` nu `<Table.Tr>` gebruikt. Animaties van TasksFeed zijn wegens de HTML tabel-compliance verwijderd ter behoeve van styling conformiteit.
- **Keuze**: De datum-kolom ("Datum") is verwijderd en de vervaldatum van de taak is nu strak uitgelijnd boven het favorieten (ster) icoon in de meest rechtse actie-div, passend in de 100px ruimte.
- **Keuze**: De `/tasks` layout is weer EXACT ingericht als de 3-kolommen structuur van `/notes`. Kolom 2 (de taken-feed) is vast gezet op een maximale breedte van 480px mét border-right, en Kolom 3 is een onzichtbare flexibele opvulling (`flex: 1`).
- **Bugfix**: `TaskRow.tsx` gaf een `<div>` terug die `TaskRowItem` (wat resulteert in een `<Table.Tr>`) direct wipte binnen in `<Table.Tbody>`. Dit is ongeldige HTML (div binnen tbody) waardoor de browser voor elke row de tabel-layout regels afbrak en breedtes dynamisch ging berekenen afhankelijk van content. gebruikt nu `forwardRef` om direct de ref en dragger styles de ontvangen op het `<Table.Tr>` element zónder invalide div wrapper, hierdoor lijnen alle rijen weer 100% strak uit.
- **Keuze**: De layout van `/tasks` is weer teruggebracht naar een volledige breedte (`flex: 1`) voor de lijst met taken in plaats van de 480px brede kolom-aanpak, om de leesbaarheid en ruimte van de data-rij te maximaliseren.
- **Fix**: De `<Text>` component in `TaskRowItem.tsx` voor de weergave van de hoofdtitle van een taak is nu verrijkt met `lineClamp={2}`. Lange titels breken nu dus af met weglatingstekens (...), waardoor ze geen excessieve hoogte opnemen in de nieuwe Table layout.
- **Fix**: Horizontale padding op de parent container in `/tasks` verwijderd (net zoals bij `/notes`) en direct toegepast d.m.v. `horizontalSpacing` op de child `<Table>` (en op de groepsheaders). Hierdoor lopen de interactieve row componenten strak tot aan de boorden en verspringt de achtergrond op hover netjes van de fysieke schermrand naar schermrand, gelijk aan de behavior in notes.

- Zuivering Fase 1 uitgevoerd: Verwijdering van Shadcn/Radix-UI boilerplate klonen (CVA, tailwind-merge, clsx, lucide-react, framer-motion) en restrictie van cn() utility ten faveure van zuivere Mantine UI componenten en @tabler/icons.
- Zuivering Fase 2 uitgevoerd: Verwijdering van Tailwind typografieklassen in HTML tags en volledige vervanging door Mantine `Text` en `Title` componenten.
- Zuivering Fase 3 uitgevoerd: Vele Tailwind gebaseerde `div` en lay-out elementen (`flex`, `space`, `grid`) in formulieren, modale sheets en sidebars vervangen door Mantine componenten (`Stack`, `Group`, `Box`, `Flex`) incl. spacing attributen.
- Zuivering Fase 4 uitgevoerd: Alle hardcoded Tailwind kleuren (`text-gray-*`, `bg-gray-*`, `border-gray-*`, `text-slate-*`, `bg-white`, `text-muted-foreground`, `bg-muted`) vervangen door Mantine CSS variabelen (`--mantine-color-dimmed`, `--mantine-color-body`, `--mantine-color-text`, `--mantine-color-default-border`, `--mantine-color-default-hover`, etc.) in 15+ bestanden. Lucide-react import in app-sidebar.tsx vervangen door @tabler/icons-react aliassen.
- **Stock Mantine Migratie**: Volledige Shadcn/Radix CSS-laag (160 regels design tokens) verwijderd uit `globals.css`. Mantine theme gecentraliseerd met component defaults voor NavLink, ActionIcon, Button, TextInput, Badge, Drawer, Popover, Menu, Modal, Tabs, Tooltip. Alle `text-primary`/`bg-primary` Shadcn tokens in 20+ plekken vervangen door Mantine `--mantine-color-indigo-*` variabelen. Alle redundante NavLink `styles={{}}` hover overrides (17 instanties) verwijderd. Clerk auth pagina's gemigreerd naar Mantine vars. Nul Shadcn design tokens blijven over.
- **Stock Mantine Component Rewrites**: Volledige herschrijvingen van `app-sidebar.tsx` (NavLink+Stack+Box ipv nav/button/div), `user-nav.tsx` (UnstyledButton+Stack+Group+Divider ipv button/div), `VandaagSidebar.tsx` (nul classNames), `ProjectSidebar.tsx` (nul classNames, ColorSwatch voor project dot), `theme-toggle.tsx` (Switch color prop ipv styles override), `page.tsx` (Stack+Box+Container ipv divs). className-gebruik: 380 → 305. styles-overrides: 45 → 25. kale divs: 45 → 30.
- **Stock Mantine Ronde 2**: Herschrijving van `NotesSidebar.tsx`, `SidebarContent.tsx` (SmartNavItem custom component vervangen door stock NavLink), `TaskSidebar.tsx` (alle divs → Stack/Box/Group, cn() verwijderd), `TaskRowItem.tsx` (alle icon classNames → props, cn() verwijderd), `TaskDetailSheet.tsx` (icon classNames → props, cn() verwijderd, className button → Mantine props). Eindtellingen: className 305 → 217, cn() 15 → 12, divs 30 → 23, styles 25 → 25.

## [2026-03-08] Implementatie Double Navbar & Stock AppShell

- **Keuze**: Implementatie van de Double Navbar (Primary Icon Bar + Secondary Content Bar) en migratie naar de officiële Mantine AppShell-structuur.
- **Rationale**: Minimalisering van UI-ruis en standaardisering op de Mantine navigatie-patronen voor een rustigere, premium ervaring met consistente sidebar-toegang over de hele app.

## [2026-03-08] Mantine Theme & CSS Variables Update

- **Keuze**: Update van `mantineTheme` en `mantineCssVariableResolver` conform de nieuwe configuratie van de founder, inclusief herintroductie van rounded corners (`radius: md`) voor Paper en Card en primary color `"blue"`.
- **Rationale**: Realiseren van de gewenste visuele taal van de founder en verdere standaardisering van de Mantine component-configuratie.

## [2026-03-08] Stock Mantine Migratie & Style Purge

- **Keuze**: Volledige migratie naar "Stock Mantine" door verwijdering van alle custom CSS, inline styles (`style={{}}`) en hardcoded kleur-referenties (indigo/blue/hex) applicatiebreed.
- **Rationale**: Realiseren van een consistent, centraal beheerd UI-systeem waarbij alle styling uitsluitend via het Mantine theme en component props wordt aangestuurd.

## [2026-03-08] Stock Mantine Unificatie & Navigatie Stabiliteit

- **Keuze**: Volledige unificatie van de UI naar "Stock Mantine" door verwijdering van alle custom CSS, inline styles en Tailwind afwijkingen. Implementatie van `DoubleNavbar` binnen de officiële `AppShell`.
- **Rationale**: Borgen van technische soberheid en stabiliteit. De `startsWith` crashes zijn verholpen door defensieve checks en migratie naar native Next.js `Link` componenten in de navigatie.
- **Resultaat**: 100% Mantine-conformiteit en een robuuste, crash-vrije navigatie-ervaring.
- Defensieve prop-validatie toegevoegd aan NavbarLink om interne Next.js Link crashes bij undefined hrefs te voorkomen.
- Tijdelijke fallback naar standaard anker-tags in Navbar om corrupte Next.js 16 router-context te isoleren.
- RCA Finale Conclusie: De Navbar `startsWith` crash werd veroorzaakt door het doorgeven van niet-bestaande Mantine colortokens (bijv. `'blue.light'`) aan de `bg` en `c` system-props van `UnstyledButton`. Mantine's interne CSS/color parser liep stuk op de afwezige variant. Dit is permanent opgelost door het correcte `ActionIcon` component in te zetten.
- Kleurenpalet applicatie uitgebreid: Vier custom kleurpaletten toegevoegd aan het Mantine thema (`blue-spruce`, `alice-blue`, `raspberry`, `honey-bronze`), elk met 10 tinten conform Mantine's color tuple structuur. De standaard `primaryColor` blijft `blue`.

## [2026-03-08] App Shell Migratie naar Griply-stijl

- **Keuze**: Volledige herstructurering van de app-shell naar Griply-stijl: `layout="alt"` (full-height navbar), header verwijderd, single-column navbar (NavbarSearch pattern), Paper card-in-background voor main content, `DoubleNavbar.module.css` volledig verwijderd.
- **Rationale**: Realiseren van een premium, native-desktop uitstraling met een warme, afgeronde content-kaart en een compacte tekst-navigatie zonder icon-rail.
- **Update**: Verfijning van visuele hiërarchie in navbar (headers donkerder, items lichter, geen uppercase meer) en implementatie van een universele Toolbar binnen het main paneel (titel, weergave-toggle placeholders, actieknoppen). Achtergrondkleuren aangepast naar `gray-1` voor betere diepte.
- **Tasks View Optimalisatie**: Implementatie van Tabs voor slimme lijsten (Mijn dag, Belangrijk, Gepland), verwijdering van redundante tabel-headers, en edge-to-edge layout door reductie van marges en paddings.
- **Dynamic Multi-filter**: Toevoeging van een multi-select filtermenu in de Toolbar voor het gelijktijdig bekijken van meerdere projecten en takenlijsten via URL-gesynchroniseerde state.
- **UI consistentie**: Toolbar actieknoppen (Filter) visueel gelijkgetrokken met weergave-opties middels de `default` variant van Mantine.
