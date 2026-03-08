---
title: Datamodel (Prisma)
type: architecture
status: active
tags: [prisma, database, schema, supabase]
---

# Het Datamodel (Supabase & Prisma)

We gebruiken Prisma 7.4 (of nieuwer) met een Supabase database. Alles wordt strict getypeerd. Relaties tussen entiteiten zijn essentieel voor de werking van de GRIP-methode.

## Belangrijkste Entiteiten

1. **InboxItem**: De kern van de 'Vandaag Inbox'. Items die nog geen finale plek in het systeem hebben.
2. **Task (Taak)**: Onderdeel van de actielijst. Kan gekoppeld zijn aan een `Project` of direct worden ingepland in de `Agenda`. Bevat ondersteuning voor timers en prioriteitsmarkers ('important').
3. **Project**: Een verzameling van gegroepeerde taken.
4. **Note (Notitie)**: Losse tekstuele context. Bevat de mogelijkheid om 'gefavoriet' / 'gepind' te worden en een referentie naar de metadata header.
5. **File (Bestand)**: Geüploade mediabestanden die verwerkt moeten worden in de inbox of direct gekoppeld zijn.
6. **Agenda Event**: Blokken in de kalender die de eigenlijke uren reserveren. Kan voortkomen uit een _Task_.

## Prisma Regels

- Query's dienen geoptimaliseerd te zijn middels de juiste Prisma `include` en `select` objecten, om datamuur-overbelasting te voorkomen.
- Verwijderde items (met name in Inbox/Trash) worden vaak zacht-verwijderd (`deletedAt`) totdat ze na 30 dagen definitief opgeruimd worden.
- `any` typering is niet toegestaan bij database mutaties. Zorg dat de gegenereerde Prisma-types gerespecteerd worden in alle TSX-bestanden.
