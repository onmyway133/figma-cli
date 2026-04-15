import type { ArgsDef, CommandDef } from "citty"
import { loadFigFile, getPages, getPageByName, getTokens, getComponents, getStyles } from "../parser.ts"
import { output } from "../output.ts"
import { basename } from "path"
import type { InspectResult } from "../types.ts"

export const inspectCommand: CommandDef = {
  meta: {
    name: "inspect",
    description: "Full dump of design tokens, components, and styles from a .fig file",
  },
  args: {
    file: {
      type: "positional",
      description: "Path to .fig file",
      required: true,
    },
    page: {
      type: "string",
      description: "Scope components to a specific page",
      alias: "p",
    },
    pretty: {
      type: "boolean",
      description: "Pretty-print JSON output",
      default: false,
    },
  } satisfies ArgsDef,
  async run({ args }) {
    const filePath = args.file as string
    const api = await loadFigFile(filePath)
    const pageNode = args.page ? getPageByName(api, args.page as string) : undefined

    const result: InspectResult = {
      file: basename(filePath),
      pages: getPages(api),
      tokens: getTokens(api),
      components: getComponents(api, pageNode),
      styles: getStyles(api),
    }

    output(result, args.pretty as boolean)
  },
}
