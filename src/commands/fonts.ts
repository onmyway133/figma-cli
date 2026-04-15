import type { ArgsDef, CommandDef } from "citty"
import { loadFigFile, getPageByName, getFonts } from "../parser.ts"
import { output } from "../output.ts"

export const fontsCommand: CommandDef = {
  meta: { name: "fonts", description: "All fonts used in a .fig file" },
  args: {
    file: { type: "positional", description: "Path to .fig file", required: true },
    page: { type: "string", description: "Scope to a specific page", alias: "p" },
    pretty: { type: "boolean", description: "Pretty-print JSON output", default: false },
  } satisfies ArgsDef,
  async run({ args }) {
    const api = await loadFigFile(args.file as string)
    const pageNode = args.page ? getPageByName(api, args.page as string) : undefined
    const fonts = getFonts(api, pageNode)
    output(fonts, args.pretty as boolean)
  },
}
