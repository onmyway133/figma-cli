import type { ArgsDef, CommandDef } from "citty"
import { loadFigFile, getPageByName, getColors } from "../parser.ts"
import { output } from "../output.ts"

export const colorsCommand: CommandDef = {
  meta: { name: "colors", description: "All solid fill colors used in a .fig file, sorted by frequency" },
  args: {
    file: { type: "positional", description: "Path to .fig file", required: true },
    page: { type: "string", description: "Scope to a specific page", alias: "p" },
    pretty: { type: "boolean", description: "Pretty-print JSON output", default: false },
  } satisfies ArgsDef,
  async run({ args }) {
    const api = await loadFigFile(args.file as string)
    const pageNode = args.page ? getPageByName(api, args.page as string) : undefined
    const colors = getColors(api, pageNode)
    output(colors, args.pretty as boolean)
  },
}
