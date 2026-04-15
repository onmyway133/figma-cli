import type { ArgsDef, CommandDef } from "citty"
import { loadFigFile, getPageByName, getInstances } from "../parser.ts"
import { output } from "../output.ts"

export const instancesCommand: CommandDef = {
  meta: { name: "instances", description: "All component instances in a .fig file" },
  args: {
    file: { type: "positional", description: "Path to .fig file", required: true },
    page: { type: "string", description: "Scope to a specific page", alias: "p" },
    pretty: { type: "boolean", description: "Pretty-print JSON output", default: false },
  } satisfies ArgsDef,
  async run({ args }) {
    const api = await loadFigFile(args.file as string)
    const pageNode = args.page ? getPageByName(api, args.page as string) : undefined
    const instances = getInstances(api, pageNode)
    output(instances, args.pretty as boolean)
  },
}
