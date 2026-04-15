/**
 * Creates a minimal .fig test fixture with design tokens and components.
 * Run: bun scripts/create-test-fig.ts
 */
import { FigmaAPI } from "@open-pencil/core/figma-api"
import { SceneGraph, generateId } from "@open-pencil/core/scene-graph"
import { exportFigFile } from "@open-pencil/core/io/formats/fig"
import { writeFile, mkdir } from "fs/promises"

const graph = new SceneGraph()
const figma = new FigmaAPI(graph)

// --- Pages ---
const page1 = figma.createPage()
page1.name = "Components"

const page2 = figma.createPage()
page2.name = "Tokens"

// --- Color collection with Light/Dark modes ---
const lightModeId = generateId()
const darkModeId = generateId()
const colorCollId = generateId()

graph.variableCollections.set(colorCollId, {
  id: colorCollId,
  name: "Colors",
  modes: [
    { modeId: lightModeId, name: "Light" },
    { modeId: darkModeId, name: "Dark" },
  ],
  defaultModeId: lightModeId,
  variableIds: [],
})

function addColorVar(name: string, light: [number, number, number], dark: [number, number, number]) {
  const id = generateId()
  graph.variableCollections.get(colorCollId)!.variableIds.push(id)
  graph.variables.set(id, {
    id, name, type: "COLOR", collectionId: colorCollId,
    description: "", hiddenFromPublishing: false,
    valuesByMode: {
      [lightModeId]: { r: light[0], g: light[1], b: light[2], a: 1 },
      [darkModeId]: { r: dark[0], g: dark[1], b: dark[2], a: 1 },
    },
  })
}

addColorVar("color/primary", [0.2, 0.47, 1], [0.4, 0.6, 1])
addColorVar("color/background", [1, 1, 1], [0.09, 0.09, 0.1])
addColorVar("color/text/primary", [0.06, 0.06, 0.07], [0.95, 0.95, 0.96])
addColorVar("color/border", [0.9, 0.9, 0.92], [0.2, 0.2, 0.22])

// --- Spacing collection ---
const spacingModeId = generateId()
const spacingCollId = generateId()

graph.variableCollections.set(spacingCollId, {
  id: spacingCollId,
  name: "Spacing",
  modes: [{ modeId: spacingModeId, name: "Default" }],
  defaultModeId: spacingModeId,
  variableIds: [],
})

for (const [name, value] of [["spacing/xs", 4], ["spacing/sm", 8], ["spacing/md", 16], ["spacing/lg", 24], ["spacing/xl", 40]] as [string, number][]) {
  const id = generateId()
  graph.variableCollections.get(spacingCollId)!.variableIds.push(id)
  graph.variables.set(id, {
    id, name, type: "FLOAT", collectionId: spacingCollId,
    description: "", hiddenFromPublishing: false,
    valuesByMode: { [spacingModeId]: value },
  })
}

// --- Components on page1 ---
figma.currentPage = page1

const button = figma.createComponent()
button.name = "Button"
button.resize(120, 40)
button.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.47, b: 1, a: 1 }, opacity: 1, visible: true, blendMode: "NORMAL" }]
page1.appendChild(button)

const card = figma.createComponent()
card.name = "Card"
card.resize(320, 200)
card.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1, a: 1 }, opacity: 1, visible: true, blendMode: "NORMAL" }]
page1.appendChild(card)

const input = figma.createComponent()
input.name = "Input"
input.resize(280, 44)
input.fills = [{ type: "SOLID", color: { r: 0.97, g: 0.97, b: 0.98, a: 1 }, opacity: 1, visible: true, blendMode: "NORMAL" }]
page1.appendChild(input)

// --- Text nodes on page2 ---
figma.currentPage = page2

const heading = figma.createText()
heading.name = "Heading"
heading.resize(400, 48)
heading.x = 40
heading.y = 40
heading.fills = [{ type: "SOLID", color: { r: 0.06, g: 0.06, b: 0.07, a: 1 }, opacity: 1, visible: true, blendMode: "NORMAL" }]
page2.appendChild(heading)

const body = figma.createText()
body.name = "Body"
body.resize(400, 80)
body.x = 40
body.y = 100
page2.appendChild(body)

const caption = figma.createText()
caption.name = "Caption"
caption.resize(400, 24)
caption.x = 40
caption.y = 200
page2.appendChild(caption)

// --- Auto-layout frame on page2 ---
const stack = figma.createFrame()
stack.name = "HStack"
stack.resize(400, 60)
stack.x = 40
stack.y = 280
page2.appendChild(stack)

// --- Component instance on page2 ---
const btnInstance = figma.createInstance ? figma.createInstance(button as any) : figma.createFrame()
if (btnInstance) {
  btnInstance.name = "Button (instance)"
  btnInstance.x = 40
  btnInstance.y = 360
  page2.appendChild(btnInstance)
}

// --- Export ---
await mkdir("test-fixtures", { recursive: true })
const bytes = await exportFigFile(graph)
await writeFile("test-fixtures/sample.fig", bytes)
console.log(`Created test-fixtures/sample.fig (${Math.round(bytes.byteLength / 1024)}KB)`)
