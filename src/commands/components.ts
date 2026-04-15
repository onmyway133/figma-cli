import type { ArgsDef, CommandDef } from "citty"
import { loadFigFile, getPageByName, getComponents } from "../parser.ts"
import { output } from "../output.ts"

export const componentsCommand: CommandDef = {
  meta: {
    name: "components",
    description: "List components from a .fig file",
  },
  args: {
    file: {
      type: "positional",
      description: "Path to .fig file",
      required: true,
    },
    page: {
      type: "string",
      description: "Scope to a specific page name",
      alias: "p",
    },
    pretty: {
      type: "boolean",
      description: "Pretty-print JSON output",
      default: false,
    },
  } satisfies ArgsDef,
  async run({ args }) {
    const api = await loadFigFile(args.file as string)
    const pageNode = args.page ? getPageByName(api, args.page as string) : undefined
    const components = getComponents(api, pageNode)
    output(components, args.pretty as boolean)
  },
}
