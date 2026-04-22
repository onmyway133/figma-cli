# figma-cli

Read Figma `.fig` files — extract design tokens, components, and styles as JSON for agent use.

No auth, no network, no Figma running required. Parse directly from a local `.fig` file.

## Install

```bash
bunx @onmyway133/figma-cli --help
```

Or install globally:

```bash
bun install -g @onmyway133/figma-cli
figma-cli --help
```

Requires [Bun](https://bun.sh).

## Getting a `.fig` file

In Figma desktop: **File → Save local copy...** → saves a `.fig` file to disk.

## Usage

```bash
# List all pages
figma-cli pages design.fig

# Extract design tokens (variables: colors, spacing, typography)
figma-cli tokens design.fig
figma-cli tokens design.fig --page "Tokens"

# List components
figma-cli components design.fig
figma-cli components design.fig --page "Components"

# Full inspection dump (tokens + components + styles)
figma-cli inspect design.fig --pretty
figma-cli inspect design.fig --page "All"

# Pipe to agent
figma-cli inspect design.fig | your-agent-skill
```

## Output

All commands output JSON to stdout. Errors go to stderr.

### `tokens` output
```json
{
  "collections": [
    {
      "id": "...",
      "name": "Colors",
      "modes": ["Light", "Dark"],
      "defaultMode": "Light",
      "variables": [
        {
          "id": "...",
          "name": "color/primary/500",
          "type": "COLOR",
          "values": {
            "Light": { "r": 0.2, "g": 0.5, "b": 1, "a": 1 },
            "Dark": { "r": 0.3, "g": 0.6, "b": 1, "a": 1 }
          }
        }
      ]
    }
  ]
}
```

### `components` output
```json
[
  { "id": "1:23", "name": "Button", "type": "COMPONENT_SET", "width": 120, "height": 40 },
  { "id": "1:24", "name": "Card", "type": "COMPONENT", "width": 320, "height": 200 }
]
```

## How it works

Parses Figma's `.fig` binary format using [@open-pencil/core](https://github.com/open-pencil/open-pencil) (MIT):

```
.fig file = ZIP archive
  └── canvas.fig → "fig-kiwi" header → Kiwi binary (NodeChange[]) → SceneGraph
```

No Figma API key, no network, no running app needed.

## Reference

- https://github.com/silships/figma-cli
- https://github.com/dannote/figma-use