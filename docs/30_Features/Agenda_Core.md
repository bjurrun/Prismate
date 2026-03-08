---
title: Agenda Core
type: feature
status: active
tags: [schedule-x, calendar, fullcalendar, drag-and-drop, optimistic-ui]
---

# Agenda Core (Kalender Implementatie)

De kalender in Prismate bedient het fundament van de GRIP-methode: taken dwingen in te plannen in echte tijd.

## Architectuur en Keuzes

We gebruiken een hybride kalendersysteem. Eerdere integraties maken gebruik van de robuuste Schedule-X componenten, waarbij specifieke focus ligt op:

- **Schedule-X Patronen (Drag-and-Drop)**: Gebeurtenissen (zoals afspraken of geplande 'Taken') kunnen middels drag-and-drop direct in de agenda gesleept worden. Sleepacties triggeren server actions om via Prisma de nieuwe timestamps veilig op te slaan.
- **Dual-View Synchronisation**: Zorg dragen dat wijzigingen op de backend naadloos hun weerslag vinden in de kalenderweergave.
- **Optimistic UI met Rollback**: Omdat vlotte gebruikerservaring essentieel is, worden plan-acties en datum-verschuivingen onmiddellijk (optimistisch) getoond, lang voordat de backend antwoordt. Als de server-action faalt, wordt dit gerollbacked.
- **Vlotte Plannings-Shortcuts**: De UI beschikt over snelle knoppen of commando's (zoals `+1 dag`, `Volgende week`) die datum-manipulatie snel maken. Dat gebeurt via 'Smart event forms'.

## Afwijkingen in Library Gebruik

Let op: Historische concepten verwezen soms naar SaaS UI of Chakra UI op dit vlak, maar **Mantine UI is de ononderhandelbare regel voor form elementen en presentatie** rondom de Schedule-X component in Prismate.
