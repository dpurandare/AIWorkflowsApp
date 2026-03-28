import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  result: unknown
  hasDownload: boolean
}

/** Recursively walk an object to find download/view URLs */
function extractPresentationLinks(obj: unknown): {
  downloadUrl?: string
  viewUrl?: string
  name?: string
} {
  if (typeof obj !== 'object' || obj === null) return {}

  const flat: Record<string, string> = {}
  function walk(o: unknown) {
    if (typeof o !== 'object' || o === null) return
    for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
      if (typeof v === 'string') {
        flat[k.toLowerCase().replace(/[\s_-]/g, '')] = v
      } else {
        walk(v)
      }
    }
  }
  walk(obj)

  return {
    downloadUrl:
      flat['downloadurl'] ||
      flat['download'] ||
      flat['downloadlink'] ||
      flat['fileurl'],
    viewUrl:
      flat['viewurl'] ||
      flat['view'] ||
      flat['viewlink'] ||
      flat['previewurl'],
    name:
      flat['presentationname'] ||
      flat['name'] ||
      flat['title'] ||
      flat['filename'],
  }
}

/** Render a value — strings with markdown markers get react-markdown, objects recurse */
function RenderValue({ value, depth = 0 }: { value: unknown; depth?: number }) {
  if (value === null || value === undefined) {
    return <span className="text-gray-400 italic text-sm">—</span>
  }

  if (typeof value === 'string') {
    const looksLikeMarkdown =
      /(?:^|\n)#{1,6}\s|(?:^|\n)[*-]\s|\*\*|__|\[.+\]\(.+\)|(?:^|\n)>/.test(value)

    if (looksLikeMarkdown || value.length > 300) {
      return (
        <div className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
        </div>
      )
    }
    return <span className="text-gray-800 text-sm break-words">{value}</span>
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return <span className="font-mono text-blue-700 text-sm">{String(value)}</span>
  }

  if (Array.isArray(value)) {
    return (
      <ul className="space-y-2 mt-1">
        {value.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-gray-400 text-sm mt-0.5">•</span>
            <RenderValue value={item} depth={depth + 1} />
          </li>
        ))}
      </ul>
    )
  }

  if (typeof value === 'object') {
    return (
      <dl className={depth > 0 ? 'pl-4 border-l-2 border-gray-100 mt-1 space-y-3' : 'space-y-4'}>
        {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              {k.replace(/_/g, ' ')}
            </dt>
            <dd>
              <RenderValue value={v} depth={depth + 1} />
            </dd>
          </div>
        ))}
      </dl>
    )
  }

  return null
}

export default function MarkdownResult({ result, hasDownload }: Props) {
  if (result === null || result === undefined) return null

  const links = hasDownload ? extractPresentationLinks(result) : {}

  return (
    <div className="space-y-4">
      {/* Presentation download bar */}
      {hasDownload && (links.downloadUrl || links.viewUrl) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-wrap items-center gap-3">
          <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-green-800 font-medium text-sm">
            {links.name ? `Presentation ready: ${links.name}` : 'Presentation ready'}
          </span>
          <div className="flex gap-2 ml-auto">
            {links.downloadUrl && (
              <a
                href={links.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-1.5 rounded-md transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </a>
            )}
            {links.viewUrl && (
              <a
                href={links.viewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-md transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View
              </a>
            )}
          </div>
        </div>
      )}

      {/* Result body */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <RenderValue value={result} />
      </div>
    </div>
  )
}
