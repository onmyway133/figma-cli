import { describe, test, expect, beforeAll } from "bun:test"
import { join } from "path"
import type { FigmaAPI } from "@open-pencil/core/figma-api"
import {
  loadFigFile,
  getPages,
  getPageByName,
  getTokens,
  getComponents,
  getStyles,
  getTree,
  getText,
  getColors,
  getFonts,
  getInstances,
  getLayout,
  getImages,
} from "../src/parser.ts"

const FIXTURE = join(import.meta.dir, "../test-fixtures/sample.fig")

let api: FigmaAPI

beforeAll(async () => {
  api = await loadFigFile(FIXTURE)
})

// ─── pages ───────────────────────────────────────────────────────────────────

describe("getPages", () => {
  test("returns at least 2 pages", () => {
    const pages = getPages(api)
    expect(pages.length).toBeGreaterThanOrEqual(2)
  })

  test("pages have id, name, childCount", () => {
    const pages = getPages(api)
    for (const p of pages) {
      expect(typeof p.id).toBe("string")
      expect(typeof p.name).toBe("string")
      expect(typeof p.childCount).toBe("number")
    }
  })

  test("includes Components and Tokens pages", () => {
    const names = getPages(api).map((p) => p.name)
    expect(names).toContain("Components")
    expect(names).toContain("Tokens")
  })
})

describe("getPageByName", () => {
  test("finds existing page", () => {
    const page = getPageByName(api, "Components")
    expect(page.name).toBe("Components")
  })

  test("throws on missing page with helpful message", () => {
    expect(() => getPageByName(api, "DoesNotExist")).toThrow(/not found/)
  })
})

// ─── tokens ──────────────────────────────────────────────────────────────────

describe("getTokens", () => {
  test("returns collections array", () => {
    const { collections } = getTokens(api)
    expect(Array.isArray(collections)).toBe(true)
    expect(collections.length).toBeGreaterThan(0)
  })

  test("Colors collection has Light and Dark modes", () => {
    const { collections } = getTokens(api)
    const colors = collections.find((c) => c.name === "Colors")
    expect(colors).toBeDefined()
    expect(colors!.modes).toContain("Light")
    expect(colors!.modes).toContain("Dark")
  })

  test("Spacing collection has Default mode", () => {
    const { collections } = getTokens(api)
    const spacing = collections.find((c) => c.name === "Spacing")
    expect(spacing).toBeDefined()
    expect(spacing!.modes).toContain("Default")
  })

  test("variables have name, type, values", () => {
    const { collections } = getTokens(api)
    for (const col of collections) {
      for (const v of col.variables) {
        expect(typeof v.id).toBe("string")
        expect(typeof v.name).toBe("string")
        expect(["COLOR", "FLOAT", "STRING", "BOOLEAN"]).toContain(v.type)
        expect(typeof v.values).toBe("object")
      }
    }
  })

  test("color variable has values for each mode", () => {
    const { collections } = getTokens(api)
    const colors = collections.find((c) => c.name === "Colors")!
    const primary = colors.variables.find((v) => v.name === "color/primary")
    expect(primary).toBeDefined()
    expect(primary!.values["Light"]).toBeDefined()
    expect(primary!.values["Dark"]).toBeDefined()
  })

  test("spacing variables are FLOAT type", () => {
    const { collections } = getTokens(api)
    const spacing = collections.find((c) => c.name === "Spacing")!
    for (const v of spacing.variables) {
      expect(v.type).toBe("FLOAT")
    }
  })
})

// ─── components ──────────────────────────────────────────────────────────────

describe("getComponents", () => {
  test("finds Button, Card, Input on Components page", () => {
    const page = getPageByName(api, "Components")
    const comps = getComponents(api, page)
    const names = comps.map((c) => c.name)
    expect(names).toContain("Button")
    expect(names).toContain("Card")
    expect(names).toContain("Input")
  })

  test("components have id, name, type, width, height", () => {
    const comps = getComponents(api)
    for (const c of comps) {
      expect(typeof c.id).toBe("string")
      expect(typeof c.name).toBe("string")
      expect(["COMPONENT", "COMPONENT_SET"]).toContain(c.type)
      expect(c.width).toBeGreaterThan(0)
      expect(c.height).toBeGreaterThan(0)
    }
  })

  test("Button has correct dimensions", () => {
    const page = getPageByName(api, "Components")
    const comps = getComponents(api, page)
    const button = comps.find((c) => c.name === "Button")!
    expect(button.width).toBe(120)
    expect(button.height).toBe(40)
  })
})

// ─── node-tree ────────────────────────────────────────────────────────────────

describe("getTree", () => {
  test("returns array of tree nodes", () => {
    const page = getPageByName(api, "Components")
    const tree = getTree(api, page)
    expect(Array.isArray(tree)).toBe(true)
    expect(tree.length).toBeGreaterThan(0)
  })

  test("nodes have required fields", () => {
    const page = getPageByName(api, "Components")
    const tree = getTree(api, page)
    for (const node of tree) {
      expect(typeof node.id).toBe("string")
      expect(typeof node.name).toBe("string")
      expect(typeof node.type).toBe("string")
      expect(typeof node.visible).toBe("boolean")
    }
  })

  test("depth=1 limits children", () => {
    const page = getPageByName(api, "Tokens")
    const shallow = getTree(api, page, 1)
    const deep = getTree(api, page)
    // shallow nodes should have no children arrays (or empty)
    for (const n of shallow) {
      if (n.children) expect(n.children.every((c) => !c.children)).toBe(true)
    }
  })
})

// ─── text ────────────────────────────────────────────────────────────────────

describe("getText", () => {
  test("returns text nodes from Tokens page", () => {
    const page = getPageByName(api, "Tokens")
    const nodes = getText(api, page)
    expect(Array.isArray(nodes)).toBe(true)
    expect(nodes.length).toBeGreaterThan(0)
  })

  test("text nodes have required fields", () => {
    const nodes = getText(api)
    for (const n of nodes) {
      expect(typeof n.id).toBe("string")
      expect(typeof n.name).toBe("string")
      expect(typeof n.page).toBe("string")
      expect(typeof n.text).toBe("string")
      expect(typeof n.fontSize).toBe("number")
    }
  })

  test("finds Heading node", () => {
    const nodes = getText(api)
    const heading = nodes.find((n) => n.name === "Heading")
    expect(heading).toBeDefined()
    expect(heading!.page).toBe("Tokens")
  })
})

// ─── colors ──────────────────────────────────────────────────────────────────

describe("getColors", () => {
  test("returns color entries", () => {
    const colors = getColors(api)
    expect(Array.isArray(colors)).toBe(true)
    expect(colors.length).toBeGreaterThan(0)
  })

  test("color entries have hex, rgba, count, nodes", () => {
    const colors = getColors(api)
    for (const c of colors) {
      expect(c.hex).toMatch(/^#[0-9a-f]{6}$/)
      expect(typeof c.rgba.r).toBe("number")
      expect(c.count).toBeGreaterThan(0)
      expect(Array.isArray(c.nodes)).toBe(true)
    }
  })

  test("sorted by count descending", () => {
    const colors = getColors(api)
    for (let i = 1; i < colors.length; i++) {
      expect(colors[i - 1].count).toBeGreaterThanOrEqual(colors[i].count)
    }
  })

  test("includes Button primary color #3378ff", () => {
    const colors = getColors(api)
    const hex = colors.map((c) => c.hex)
    expect(hex).toContain("#3378ff")
  })
})

// ─── fonts ───────────────────────────────────────────────────────────────────

describe("getFonts", () => {
  test("returns font entries", () => {
    const fonts = getFonts(api)
    expect(Array.isArray(fonts)).toBe(true)
  })

  test("font entries have family, weight, italic, sizes, count", () => {
    const fonts = getFonts(api)
    for (const f of fonts) {
      expect(typeof f.family).toBe("string")
      expect(typeof f.weight).toBe("number")
      expect(typeof f.italic).toBe("boolean")
      expect(Array.isArray(f.sizes)).toBe(true)
      expect(f.count).toBeGreaterThan(0)
    }
  })
})

// ─── images ──────────────────────────────────────────────────────────────────

describe("getImages", () => {
  test("returns array", () => {
    const images = getImages(api)
    expect(Array.isArray(images)).toBe(true)
  })
})

// ─── layout ──────────────────────────────────────────────────────────────────

describe("getLayout", () => {
  test("returns array", () => {
    const frames = getLayout(api)
    expect(Array.isArray(frames)).toBe(true)
  })
})

// ─── instances ───────────────────────────────────────────────────────────────

describe("getInstances", () => {
  test("returns array", () => {
    const instances = getInstances(api)
    expect(Array.isArray(instances)).toBe(true)
  })
})
