---
id: epic-2
title: open-pencil .fig Parser
type: epic
status: done
priority: medium
created: "2026-04-15"
updated: "2026-04-15"
---
# open-pencil .fig Parser

**Requirements**
- Integrate open-pencil's Kiwi binary decoder to parse .fig files
- .fig = ZIP → canvas.fig → fig-kiwi header → Kiwi schema + Zstd NodeChange[]
- Source: github.com/open-pencil/open-pencil packages/core/src/kiwi/ and io/formats/fig/read.ts

**TODO**
- [ ] Check if @open-pencil/core is on npm
- [ ] Install or inline the kiwi decoder
- [ ] Implement parseFigFile(path) returning FigDocument
- [ ] Implement getPage(doc, name), getVariables(doc), getComponents(page), getStyles(doc)

## Notes


## Work Log

