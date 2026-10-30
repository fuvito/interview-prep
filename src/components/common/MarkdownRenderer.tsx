import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { rehypeHighlightTs } from '@/lib/rehypeHighlightTs'

interface Props {
  children: string
  className?: string
  inline?: boolean
}

export function MarkdownRenderer({ children, className, inline }: Props) {
  if (inline) {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{ p: ({ children: c }) => <span>{c}</span> }}
      >
        {children}
      </ReactMarkdown>
    )
  }

  return (
    <div className={`text-gray-200 leading-relaxed space-y-2 ${className ?? ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlightTs]}
        components={{
          h1: ({ children: c }) => <h1 className="text-lg font-bold text-white">{c}</h1>,
          h2: ({ children: c }) => <h2 className="text-base font-semibold text-white">{c}</h2>,
          h3: ({ children: c }) => <h3 className="text-sm font-semibold text-gray-100">{c}</h3>,
          p: ({ children: c }) => <p className="leading-relaxed">{c}</p>,
          strong: ({ children: c }) => <strong className="font-semibold text-white">{c}</strong>,
          em: ({ children: c }) => <em className="italic text-gray-100">{c}</em>,
          code: ({ className: cls, children: c }) => {
            const isBlock = cls?.startsWith('language-')
            return isBlock
              ? <code className={cls}>{c}</code>
              : <code className="bg-gray-800 text-blue-200 px-1.5 py-0.5 rounded text-[0.85em] font-mono">{c}</code>
          },
          pre: ({ children: c }) => (
            <pre className="bg-gray-900 border border-gray-700 rounded-lg p-4 overflow-x-auto text-sm">
              {c}
            </pre>
          ),
          ul: ({ children: c }) => <ul className="list-disc list-outside ml-5 space-y-1">{c}</ul>,
          ol: ({ children: c }) => <ol className="list-decimal list-outside ml-5 space-y-1">{c}</ol>,
          li: ({ children: c }) => <li className="text-gray-200">{c}</li>,
          table: ({ children: c }) => (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">{c}</table>
            </div>
          ),
          thead: ({ children: c }) => <thead className="bg-gray-800">{c}</thead>,
          th: ({ children: c }) => <th className="border border-gray-700 px-3 py-1.5 text-left font-semibold text-gray-100">{c}</th>,
          td: ({ children: c }) => <td className="border border-gray-700 px-3 py-1.5 text-gray-200">{c}</td>,
          blockquote: ({ children: c }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 text-gray-300">{c}</blockquote>
          ),
          hr: () => <hr className="border-gray-700" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
