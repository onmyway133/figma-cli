import { readFile } from "fs/promises"
import { parseFigFile } from "@open-pencil/core/io/formats/fig"
import { FigmaAPI } from "@open-pencil/core/figma-api"
import type {
  PageInfo,
  DesignTokens,
  DesignTokenCollection,
  DesignTokenVariable,
  ComponentInfo,
  StyleInfo,
  TreeNode,
  TextNode,
  ColorEntry,
  FontEntry,
  InstanceInfo,
  LayoutFrame,
  ImageFill,
} from "./types.ts"

export async function loadFigFile(filePath: string): Promise<FigmaAPI> {
  const buffer = await readFile(filePath)
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ) as ArrayBuffer
  const graph = await parseFigFile(arrayBuffer)
  return new FigmaAPI(graph)
}

export function getPages(api: FigmaAPI): PageInfo[] {
  return api.root.children.map((page) => ({
    id: page.id,
    name: page.name,
    childCount: page.children.length,
  }))
}

export function getPageByName(api: FigmaAPI, name: string) {
  const page = api.root.children.find((p) => p.name === name)
  if (!page) {
    const available = api.root.children.map((p) => `"${p.name}"`).join(", ")
    throw new Error(`Page "${name}" not found. Available pages: ${available}`)
  }
  return page
}

export function getTokens(api: FigmaAPI): DesignTokens {
  const collections = api.getLocalVariableCollections()
  const result: DesignTokenCollection[] = collections.map((col) => {
    const modeMap: Record<string, string> = {}
    for (const mode of col.modes) {
      modeMap[mode.modeId] = mode.name
    }

    const variables: DesignTokenVariable[] = col.variableIds
      .map((varId) => api.getVariableById(varId))
      .filter(Boolean)
      .map((v) => {
        const values: Record<string, unknown> = {}
        for (const [modeId, value] of Object.entries(v!.valuesByMode)) {
          const modeName = modeMap[modeId] ?? modeId
          values[modeName] = value
        }
        return {
          id: v!.id,
          name: v!.name,
          type: v!.type,
          description: v!.description || undefined,
          values,
        }
      })

    const defaultModeName = modeMap[col.defaultModeId] ?? col.defaultModeId

    return {
      id: col.id,
      name: col.name,
      modes: col.modes.map((m) => m.name),
      defaultMode: defaultModeName,
      variables,
    }
  })

  return { collections: result }
}

export function getComponents(api: FigmaAPI, pageNode?: any): ComponentInfo[] {
  const root = pageNode ?? api.root

  function collect(node: any): ComponentInfo[] {
    const results: ComponentInfo[] = []
    if (node.type === "COMPONENT" || node.type === "COMPONENT_SET") {
      results.push({
        id: node.id,
        name: node.name,
        type: node.type,
        description: node.description || undefined,
        width: Math.round(node.width),
        height: Math.round(node.height),
      })
      // Don't recurse into COMPONENT_SET children — they are variants
      if (node.type === "COMPONENT_SET") return results
    }
    if (node.children) {
      for (const child of node.children) {
        results.push(...collect(child))
      }
    }
    return results
  }

  return collect(root)
}

export function getStyles(api: FigmaAPI): StyleInfo[] {
  const styles: StyleInfo[] = []
  const styleTypes = new Set(["PAINT_STYLE", "TEXT_STYLE", "EFFECT_STYLE", "GRID_STYLE"])

  for (const node of api.graph.getAllNodes()) {
    if (styleTypes.has(node.type as string)) {
      styles.push({ id: node.id, name: (node as any).name ?? node.id, type: node.type as string })
    }
  }

  return styles
}

// ─── node-tree ───────────────────────────────────────────────────────────────

export function getTree(api: FigmaAPI, pageNode?: any, maxDepth = Infinity): TreeNode[] {
  const root = pageNode ?? api.root

  function toTree(node: any, depth: number): TreeNode {
    const entry: TreeNode = {
      id: node.id,
      name: node.name,
      type: node.type,
      x: Math.round(node.x ?? 0),
      y: Math.round(node.y ?? 0),
      width: Math.round(node.width ?? 0),
      height: Math.round(node.height ?? 0),
      visible: node.visible !== false,
      locked: node.locked === true,
    }
    if (depth < maxDepth && node.children?.length) {
      entry.children = node.children.map((c: any) => toTree(c, depth + 1))
    }
    return entry
  }

  return root.children?.map((c: any) => toTree(c, 0)) ?? [toTree(root, 0)]
}

// ─── text ────────────────────────────────────────────────────────────────────

export function getText(api: FigmaAPI, pageNode?: any): TextNode[] {
  const results: TextNode[] = []
  const pages = pageNode ? [pageNode] : api.root.children

  for (const page of pages) {
    function walk(node: any) {
      if (node.type === "TEXT") {
        results.push({
          id: node.id,
          name: node.name,
          page: page.name,
          text: node.characters ?? node.text ?? "",
          fontSize: node.fontSize ?? 0,
          fontFamily: node.fontFamily ?? "",
          fontWeight: node.fontWeight ?? 400,
          italic: node.italic === true,
          fills: node.fills ?? [],
          x: Math.round(node.x ?? 0),
          y: Math.round(node.y ?? 0),
        })
      }
      for (const child of node.children ?? []) walk(child)
    }
    for (const child of page.children ?? []) walk(child)
  }

  return results
}

// ─── colors ──────────────────────────────────────────────────────────────────

function toHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.round(Math.max(0, Math.min(1, v)) * 255)
  return `#${clamp(r).toString(16).padStart(2, "0")}${clamp(g).toString(16).padStart(2, "0")}${clamp(b).toString(16).padStart(2, "0")}`
}

export function getColors(api: FigmaAPI, pageNode?: any): ColorEntry[] {
  const map = new Map<string, ColorEntry>()
  const pages = pageNode ? [pageNode] : api.root.children

  for (const page of pages) {
    function walk(node: any) {
      for (const fill of node.fills ?? []) {
        if (fill.type === "SOLID" && fill.color) {
          const { r, g, b, a } = fill.color
          const hex = toHex(r, g, b)
          const existing = map.get(hex)
          if (existing) {
            existing.count++
            if (!existing.nodes.includes(node.id)) existing.nodes.push(node.id)
          } else {
            map.set(hex, {
              hex,
              rgba: { r: +r.toFixed(3), g: +g.toFixed(3), b: +b.toFixed(3), a: +(a ?? 1).toFixed(3) },
              count: 1,
              nodes: [node.id],
            })
          }
        }
      }
      for (const child of node.children ?? []) walk(child)
    }
    for (const child of page.children ?? []) walk(child)
  }

  return Array.from(map.values()).sort((a, b) => b.count - a.count)
}

// ─── fonts ───────────────────────────────────────────────────────────────────

export function getFonts(api: FigmaAPI, pageNode?: any): FontEntry[] {
  const map = new Map<string, FontEntry>()
  const pages = pageNode ? [pageNode] : api.root.children

  for (const page of pages) {
    function walk(node: any) {
      if (node.type === "TEXT") {
        const family = node.fontFamily ?? ""
        const weight = node.fontWeight ?? 400
        const italic = node.italic === true
        const size = node.fontSize ?? 0
        const key = `${family}::${weight}::${italic}`
        const existing = map.get(key)
        if (existing) {
          existing.count++
          if (!existing.sizes.includes(size)) existing.sizes.push(size)
        } else {
          map.set(key, { family, weight, italic, sizes: [size], count: 1 })
        }
      }
      for (const child of node.children ?? []) walk(child)
    }
    for (const child of page.children ?? []) walk(child)
  }

  return Array.from(map.values())
    .sort((a, b) => b.count - a.count)
    .map((e) => ({ ...e, sizes: e.sizes.sort((a, b) => a - b) }))
}

// ─── instances ───────────────────────────────────────────────────────────────

export function getInstances(api: FigmaAPI, pageNode?: any): InstanceInfo[] {
  const results: InstanceInfo[] = []
  const pages = pageNode ? [pageNode] : api.root.children

  // Build component id→name index
  const componentNames = new Map<string, string>()
  for (const node of api.graph.getAllNodes()) {
    if (node.type === "COMPONENT" || node.type === "COMPONENT_SET") {
      componentNames.set(node.id, node.name)
    }
  }

  for (const page of pages) {
    function walk(node: any) {
      if (node.type === "INSTANCE") {
        const rawNode = api.graph.getNode(node.id)
        const componentId = (rawNode as any)?.componentId ?? ""
        results.push({
          id: node.id,
          name: node.name,
          page: page.name,
          componentId,
          componentName: componentNames.get(componentId) ?? componentId,
          x: Math.round(node.x ?? 0),
          y: Math.round(node.y ?? 0),
          width: Math.round(node.width ?? 0),
          height: Math.round(node.height ?? 0),
          overrideCount: Object.keys((rawNode as any)?.overrides ?? {}).length,
        })
      }
      for (const child of node.children ?? []) walk(child)
    }
    for (const child of page.children ?? []) walk(child)
  }

  return results
}

// ─── layout ──────────────────────────────────────────────────────────────────

export function getLayout(api: FigmaAPI, pageNode?: any): LayoutFrame[] {
  const results: LayoutFrame[] = []
  const pages = pageNode ? [pageNode] : api.root.children

  for (const page of pages) {
    function walk(node: any) {
      const raw = api.graph.getNode(node.id) as any
      if (raw?.layoutMode && raw.layoutMode !== "NONE") {
        results.push({
          id: node.id,
          name: node.name,
          page: page.name,
          layoutMode: raw.layoutMode,
          direction: raw.layoutDirection ?? "LTR",
          wrap: raw.layoutWrap ?? "NO_WRAP",
          itemSpacing: raw.itemSpacing ?? 0,
          counterAxisSpacing: raw.counterAxisSpacing ?? 0,
          paddingTop: raw.paddingTop ?? 0,
          paddingRight: raw.paddingRight ?? 0,
          paddingBottom: raw.paddingBottom ?? 0,
          paddingLeft: raw.paddingLeft ?? 0,
          primaryAxisAlign: raw.primaryAxisAlign ?? "MIN",
          counterAxisAlign: raw.counterAxisAlign ?? "MIN",
          primaryAxisSizing: raw.primaryAxisSizing ?? "FIXED",
          counterAxisSizing: raw.counterAxisSizing ?? "FIXED",
          width: Math.round(node.width ?? 0),
          height: Math.round(node.height ?? 0),
        })
      }
      for (const child of node.children ?? []) walk(child)
    }
    for (const child of page.children ?? []) walk(child)
  }

  return results
}

// ─── images ──────────────────────────────────────────────────────────────────

export function getImages(api: FigmaAPI, pageNode?: any): ImageFill[] {
  const results: ImageFill[] = []
  const pages = pageNode ? [pageNode] : api.root.children

  for (const page of pages) {
    function walk(node: any) {
      for (const fill of node.fills ?? []) {
        if (fill.type === "IMAGE" && fill.imageHash) {
          results.push({
            nodeId: node.id,
            nodeName: node.name,
            page: page.name,
            hash: fill.imageHash,
            scaleMode: fill.imageScaleMode ?? "FILL",
          })
        }
      }
      for (const child of node.children ?? []) walk(child)
    }
    for (const child of page.children ?? []) walk(child)
  }

  return results
}
