import type { ArgsDef, CommandDef } from "citty"
import { loadFigFile, getPageByName, getImages } from "../parser.ts"
import { output } from "../output.ts"

export const imagesCommand: CommandDef = {
  meta: { name: "images", description: "All image fills in a .fig file" },
  args: {
    file: { type: "positional", description: "Path to .fig file", required: true },
    page: { type: "string", description: "Scope to a specific page", alias: "p" },
    pretty: { type: "boolean", description: "Pretty-print JSON output", default: false },
  } satisfies ArgsDef,
  async run({ args }) {
    const api = await loadFigFile(args.file as string)
    const pageNode = args.page ? getPageByName(api, args.page as string) : undefined
    const images = getImages(api, pageNode)
    output(images, args.pretty as boolean)
  },
}
