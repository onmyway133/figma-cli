#!/usr/bin/env bun
import { defineCommand, runMain } from "citty"
import { pagesCommand } from "./commands/pages.ts"
import { tokensCommand } from "./commands/tokens.ts"
import { componentsCommand } from "./commands/components.ts"
import { inspectCommand } from "./commands/inspect.ts"
import { nodeTreeCommand } from "./commands/node-tree.ts"
import { textCommand } from "./commands/text.ts"
import { colorsCommand } from "./commands/colors.ts"
import { fontsCommand } from "./commands/fonts.ts"
import { instancesCommand } from "./commands/instances.ts"
import { layoutCommand } from "./commands/layout.ts"
import { imagesCommand } from "./commands/images.ts"
import { errorExit } from "./output.ts"

const main = defineCommand({
  meta: {
    name: "figma-cli",
    version: "0.1.0",
    description: "Read Figma .fig files — extract design tokens, components, and styles for agent use",
  },
  subCommands: {
    pages: pagesCommand,
    tokens: tokensCommand,
    components: componentsCommand,
    inspect: inspectCommand,
    "node-tree": nodeTreeCommand,
    text: textCommand,
    colors: colorsCommand,
    fonts: fontsCommand,
    instances: instancesCommand,
    layout: layoutCommand,
    images: imagesCommand,
  },
})

runMain(main).catch((err: Error) => {
  errorExit(err.message)
})
