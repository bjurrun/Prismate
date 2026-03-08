---
title: Taken Engine
type: feature
status: active
tags: [tasks, priority, timers, layout]
---

# De Taken Engine

De `/tasks` weergave en taken-architectuur is de functionele brug tussen de Vandaag Inbox (losse flodders) en de Agenda (geplande actie).

## Visuele Layout `/tasks`

Net als veel andere overzichten maken we gebruik van een heldere asymmetrische layout of sidebar + feed.
Eerder hebben we bugs verholpen in deze view m.b.t. desktop rendering (zoals de "double scrollbar issue" veroorzaakt door een renderfout in de mobile bottom bar die op desktop insprong).

- **Double Scrollbars of CLS**: We voorkomen we overbodige scrolls en flikkering (via de AppShell en Mantine's strakke breakpoints).

## Taak Eigenschappen

- **Prioritering (Important Markers)**: Taken kunnen worden getoggled als 'belangrijk'. Dit vertaalt direct naar de database structuur (`isImportant`).
- **Timers/Schattingen**: Volgens GRIP duurt niets "toevallig" lang. Taken moeten idealiter een tijd-indicator in zich dragen zodat de Agenda-planning logisch verloopt.
- **Project-groepering**: Een lijst weergave aan de linkerzijde laat vaak de beschikbare (of actieve) Projecten zien als filter.
