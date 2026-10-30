import { useNavigationStore } from '@/store'
import { MarkdownRenderer } from '@/components/common'
import type { View } from '@/store'

import userGuide  from '../../../docs/user-guide.md?raw'
import privacy    from '../../../docs/privacy.md?raw'
import terms      from '../../../docs/terms.md?raw'
import changelog  from '../../../docs/changelog.md?raw'
import license    from '../../../LICENSE?raw'

const DOCS: Record<string, string> = {
  'user-guide': userGuide,
  privacy,
  terms,
  changelog,
  license: `# License\n\n\`\`\`\n${license}\`\`\``,
}

export function DocView() {
  const { current } = useNavigationStore()
  const view = current as Extract<View, { name: 'doc' }>
  const content = DOCS[view.docId] ?? ''

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 min-h-0">
      <MarkdownRenderer>{content}</MarkdownRenderer>
    </div>
  )
}
