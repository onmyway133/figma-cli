import type { ArgsDef, CommandDef } from "citty"
import { loadFigFile, getPageByName, getText } from "../parser.ts"
import { output } from "../output.ts"

export const textCommand: CommandDef = {
  meta: { name: "text", description: "Extract all text content from a .fig file" },
  args: {
    file: { type: "positional", description: "Path to .fig file", required: true },
    page: { type: "string", description: "Scope to a specific page", alias: "p" },
    pretty: { type: "boolean", description: "Pretty-print JSON output", default: false },
  } satisfies ArgsDef,
  async run({ args }) {
    const api = await loadFigFile(args.file as string)
    const pageNode = args.page ? getPageByName(api, args.page as string) : undefined
    const nodes = getText(api, pageNode)
    output(nodes, args.pretty as boolean)
  },
}
