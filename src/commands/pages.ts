import type { ArgsDef, CommandDef } from "citty"
import { loadFigFile, getPages } from "../parser.ts"
import { output } from "../output.ts"

export const pagesCommand: CommandDef = {
  meta: {
    name: "pages",
    description: "List all pages in a .fig file",
  },
  args: {
    file: {
      type: "positional",
      description: "Path to .fig file",
      required: true,
    },
    pretty: {
      type: "boolean",
      description: "Pretty-print JSON output",
      default: false,
    },
  } satisfies ArgsDef,
  async run({ args }) {
    const api = await loadFigFile(args.file as string)
    const pages = getPages(api)
    output(pages, args.pretty as boolean)
  },
}
