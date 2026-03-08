---
title: Tags en Index
type: meta
status: active
tags: [obsidian, structure, guide]
---

# Structuur en Tags in deze Vault

Om Prismate documentatie optimaal te gebruiken voor zowel mensen (Björn/Sjon) als Artificial Intelligence (AI Agents), gebruiken we een gestructureerde aanpak.

## Mappenstructuur

- **`00_Meta/`**: Obsidian-specifieke zaken, templates, AI prompts (`GEMINI.md`).
- **`10_Product/`**: Visie, epics, persona's en GRIP concepten.
- **`20_Architectuur/`**: Harde tech-afspraken, Sjon's domein. (Design principes, datamodel, regels).
- **`30_Features/`**: Gedetailleerde technische documentatie van losse features.
- **`40_AI_Logs/`**: Het onmisbare `decision-log.md` en audit rapporten.
- **`50_Archief/`**: Afgeronde discussies of afgeschoten ideeën.

## YAML Frontmatter

Begin elk nieuw `.md` document in deze vault met ten minste de volgende metadata-structuur bovenaan de pagina (tussen de `---`):

```yaml
---
title: Naam van Document
type: feature | architecture | product | log | meta
status: draft | in-development | active | deprecated | definitive
tags: [tag1, tag2]
---
```

Dit helpt bots en search plugins enorm met vinden van de juiste context!
