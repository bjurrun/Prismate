# UI/UX Audit Report - Prismate

Dit rapport toetst de huidige implementatie van Prismate aan de vastgestelde [Design Principes](file:///Users/bjorndevries/dev/Prismate/docs/designprinciples.md) en de [Jobs to be Done](file:///Users/bjorndevries/.gemini/antigravity/brain/0eecb097-cc8c-41c0-ae46-bd7e05148695/jtbd_analysis.md).

## Executive Summary

De applicatie maakt goed gebruik van Mantine, maar vertoont "lekkage" van Tailwind typography klassen en HTML-elementen die de consistentie ondermijnen. Inconsistentie in icon-keuze (Lucide vs Tabler) verzwakt het premium gevoel.

---

## 1. Pagina: Vandaag

**Primary Job**: Grip houden op de huidige dag.

| Principe        | Bevindingen                                            | Status | Actie                                                                 |
| :-------------- | :----------------------------------------------------- | :----- | :-------------------------------------------------------------------- |
| **Hierarchy**   | Gebruikt `<Title order={1}>` (OK).                     | ⚠️     | Verwijder Tailwind typography classes (`text-2xl`, `tracking-tight`). |
| **Consistency** | `radius="xl"` op Paper wijkt af van de `md` standaard. | ⚠️     | Wijzig naar `radius="md"`.                                            |
| **Contrast**    | `border-dashed` op de main container oogt onrustig.    | ℹ️     | Voorstel: Gebruik solid border of `variant="subtle"` Paper.           |
| **Typography**  | Gebruikt Tailwind voor font-size en tracking.          | ❌     | Vervang door Mantine `size` prop.                                     |

---

## 2. Pagina: Agenda

**Primary Job**: De realiteit van tijd beheersen.

| Principe      | Bevindingen                                      | Status | Actie                                                                 |
| :------------ | :----------------------------------------------- | :----- | :-------------------------------------------------------------------- |
| **Contrast**  | Gebruikt `bg-white` voor de hele main container. | ⚠️     | Wijzig shell/container naar `gray.0` voor diepte.                     |
| **Alignment** | Hardcoded height `h-[calc(100vh-60px)]`.         | ℹ️     | Gebruik Flexbox/Stack in Main shell om hoogte-overerving te forceren. |

---

## 3. Pagina: Taken

**Primary Job**: Projecten en acties structureren.

| Principe        | Bevindingen                                                 | Status | Actie                                               |
| :-------------- | :---------------------------------------------------------- | :----- | :-------------------------------------------------- |
| **Typography**  | Tailwind classes (`text-2xl`) op `<Title>`.                 | ❌     | Verwijder Tailwind classes; gebruik Mantine `size`. |
| **Consistency** | Mix van `lucide-react` en Tabler Icons.                     | ⚠️     | Standaardiseer op Tabler (bijv. `IconBriefcase`).   |
| **Alignment**   | Header gebruikt `Stack gap={4}` in plaats van theme tokens. | ⚠️     | Gebruik `gap="3xs"` of `gap="2xs"`.                 |

---

## 4. Pagina: Week Planning

**Primary Job**: Koers bepalen voor de komende week.

| Principe        | Bevindingen                                               | Status | Actie                                                       |
| :-------------- | :-------------------------------------------------------- | :----- | :---------------------------------------------------------- |
| **Hierarchy**   | Gebruikt `<h1>` en `<p>` i.p.v. Mantine.                  | ❌     | **Kritiek**: Volledige refactor naar `<Title>` en `<Text>`. |
| **Consistency** | Tailwind `border-gray-200` in plaats van Mantine borders. | ❌     | Gebruik `<Paper withBorder>`.                               |

---

## 5. Algemene Componenten (Shell & Sidebar)

### **AppSidebar**

- **Consistency**: Gebruikt `lucide-react`. Standaardiseer op Tabler.
- **Styling**: Hardcoded Tailwind kleuren (`bg-white`, `text-gray-600`).
- **Fix**: Gebruik Mantine `vars` of theme tokens.

### **AppShell**

- **Contrast**: Alles is `bg-white`. Het gebrek aan contrast tussen sidebar en main content maakt de interface "vlak".
- **Fix**: Stel `Main` achtergrond in op `var(--mantine-color-gray-0)`.

---

## Roadmap voor Verbetering

1. **Fase 1**: Refactor Typography (Verwijderen Tailwind text- klassen).
2. **Fase 2**: Icon-unificatie (Conversie naar Tabler Icons).
3. **Fase 3**: Spacing & Background correctie (Introductie van `gray.0` shell).
4. **Fase 4**: Specifieke pagina-herbouw (o.a. Week Planning).
