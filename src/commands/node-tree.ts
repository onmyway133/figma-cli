import type { ArgsDef, CommandDef } from "citty"
import { loadFigFile, getPageByName, getTree } from "../parser.ts"
import { output } from "../output.ts"

export const nodeTreeCommand: CommandDef = {
  meta: { name: "node-tree", description: "Full layer tree from a .fig file" },
  args: {
    file: { type: "positional", description: "Path to .fig file", required: true },
    page: { type: "string", description: "Scope to a specific page", alias: "p" },
    depth: { type: "string", description: "Max depth to traverse (default: unlimited)", alias: "d" },
    pretty: { type: "boolean", description: "Pretty-print JSON output", default: false },
  } satisfies ArgsDef,
  async run({ args }) {
    const api = await loadFigFile(args.file as string)
    const pageNode = args.page ? getPageByName(api, args.page as string) : undefined
    const maxDepth = args.depth ? parseInt(args.depth as string) : Infinity
    const tree = getTree(api, pageNode, maxDepth)
    output(tree, args.pretty as boolean)
  },
}
