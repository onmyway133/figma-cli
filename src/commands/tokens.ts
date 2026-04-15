import type { ArgsDef, CommandDef } from "citty"
import { loadFigFile, getPageByName, getTokens } from "../parser.ts"
import { output } from "../output.ts"

export const tokensCommand: CommandDef = {
  meta: {
    name: "tokens",
    description: "Extract design tokens (variables) from a .fig file",
  },
  args: {
    file: {
      type: "positional",
      description: "Path to .fig file",
      required: true,
    },
    page: {
      type: "string",
      description: "Filter to a specific page (optional)",
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
    // Variables are global to the file, not per-page
    // But we accept --page for consistency; it's noted in output
    const tokens = getTokens(api)
    const result = args.page
      ? { page: args.page, note: "Variables are file-scoped; --page is informational only", ...tokens }
      : tokens
    output(result, args.pretty as boolean)
  },
}
