import { createLowlight } from 'lowlight'
import typescript from 'highlight.js/lib/languages/typescript'
import javascript from 'highlight.js/lib/languages/javascript'

const lowlight = createLowlight({ typescript, javascript })

type HastNode = {
  type: string
  tagName?: string
  value?: string
  properties?: { className?: string[] }
  children?: HastNode[]
}

function textContent(node: HastNode): string {
  if (node.type === 'text') return node.value ?? ''
  return (node.children ?? []).map(textContent).join('')
}

function walk(node: HastNode, parent: HastNode | null): void {
  if (node.type === 'element' && node.tagName === 'code' && parent?.tagName === 'pre') {
    const classes = node.properties?.className ?? []
    const langClass = classes.find((c) => c.startsWith('language-'))
    if (langClass) {
      const lang = langClass.slice('language-'.length)
      const text = textContent(node)
      try {
        const result = lowlight.highlight(lang, text, { prefix: 'hljs-' })
        if (result.children.length > 0) {
          node.properties ??= {}
          if (!classes.includes('hljs')) {
            node.properties.className = ['hljs', ...classes]
          }
          node.children = result.children as HastNode[]
        }
      } catch {
        // unregistered language — leave as plain text
      }
    }
  }
  for (const child of node.children ?? []) {
    walk(child, node)
  }
}

export function rehypeHighlightTs() {
  return (tree: HastNode) => walk(tree, null)
}
