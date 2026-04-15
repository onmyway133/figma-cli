export interface PageInfo {
  id: string
  name: string
  childCount: number
}

export interface DesignTokenVariable {
  id: string
  name: string
  type: "COLOR" | "FLOAT" | "STRING" | "BOOLEAN"
  description?: string
  values: Record<string, unknown>
}

export interface DesignTokenCollection {
  id: string
  name: string
  modes: string[]
  defaultMode: string
  variables: DesignTokenVariable[]
}

export interface DesignTokens {
  collections: DesignTokenCollection[]
}

export interface ComponentInfo {
  id: string
  name: string
  type: "COMPONENT" | "COMPONENT_SET"
  description?: string
  width: number
  height: number
}

export interface StyleInfo {
  id: string
  name: string
  type: string
}

export interface InspectResult {
  file: string
  pages: PageInfo[]
  tokens: DesignTokens
  components: ComponentInfo[]
  styles: StyleInfo[]
}

// node-tree
export interface TreeNode {
  id: string
  name: string
  type: string
  x: number
  y: number
  width: number
  height: number
  visible: boolean
  locked: boolean
  children?: TreeNode[]
}

// text
export interface TextNode {
  id: string
  name: string
  page: string
  text: string
  fontSize: number
  fontFamily: string
  fontWeight: number
  italic: boolean
  fills: unknown[]
  x: number
  y: number
}

// colors
export interface ColorEntry {
  hex: string
  rgba: { r: number; g: number; b: number; a: number }
  count: number
  nodes: string[]  // node ids that use this color
  variableId?: string
}

// fonts
export interface FontEntry {
  family: string
  weight: number
  italic: boolean
  sizes: number[]
  count: number
}

// instances
export interface InstanceInfo {
  id: string
  name: string
  page: string
  componentId: string
  componentName: string
  x: number
  y: number
  width: number
  height: number
  overrideCount: number
}

// layout
export interface LayoutFrame {
  id: string
  name: string
  page: string
  layoutMode: string
  direction: string
  wrap: string
  itemSpacing: number
  counterAxisSpacing: number
  paddingTop: number
  paddingRight: number
  paddingBottom: number
  paddingLeft: number
  primaryAxisAlign: string
  counterAxisAlign: string
  primaryAxisSizing: string
  counterAxisSizing: string
  width: number
  height: number
}

// images
export interface ImageFill {
  nodeId: string
  nodeName: string
  page: string
  hash: string
  scaleMode: string
}
