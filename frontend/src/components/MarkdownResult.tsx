import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  result: unknown
  hasDownload: boolean
}

// ─── Presentation link extraction ────────────────────────────────────────────

interface PresentationLinks {
  downloadUrl?: string
  viewUrl?: string
  name?: string
}

/** Recursively flatten all string values in an object/array into a normalised key map. */
function flattenStrings(o: unknown, acc: Record<string, string> = {}): Record<string, string> {
  if (typeof o !== 'object' || o === null) return acc
  for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
    if (typeof v === 'string') {
      // normalise: lowercase + strip spaces/underscores/hyphens
      acc[k.toLowerCase().replace(/[\s_\-]/g, '')] = v
    } else {
      flattenStrings(v, acc)
    }
  }
  return acc
}

function extractPresentationLinks(result: unknown): PresentationLinks {
  // n8n sometimes wraps the response in an array
  const obj = Array.isArray(result) && result.length > 0 ? result[0] : result
  const flat = flattenStrings(obj)

  return {
    downloadUrl:
      flat['downloadurl'] ||   // covers downloadURL, download_url, download-url
      flat['downloadlink'] ||
      flat['fileurl'],
    viewUrl:
      flat['viewurl'] ||       // covers viewURL, view_url
      flat['viewlink'] ||
      flat['previewurl'],
    name:
      flat['presentationname'] ||
      flat['name'] ||
      flat['title'] ||
      flat['filename'],
  }
}

// ─── Output unwrapping for research workflows ─────────────────────────────────

/**
 * Research workflows return {"output": "<markdown>"} — a single string node.
 * Unwrap it so the markdown renders directly without a key label.
 * Also handles the n8n array wrapper: [{"output": "..."}].
 */
function unwrapOutput(result: unknown): { direct: string } | { raw: unknown } {
  // Unwrap single-element array wrapper
  let obj: unknown = result
  if (Array.isArray(obj) && obj.length === 1) {
    obj = obj[0]
  }

  if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
    const record = obj as Record<string, unknown>
    // Explicit 'output' key (most research workflows)
    if (typeof record['output'] === 'string') {
      return { direct: record['output'] }
    }
    // Any single-key object whose sole value is a string
    const entries = Object.entries(record)
    if (entries.length === 1 && typeof entries[0][1] === 'string') {
      return { direct: entries[0][1] as string }
    }
  }
  return { raw: result }
}

// ─── Generic value renderer ───────────────────────────────────────────────────

function RenderValue({ value, depth = 0 }: { value: unknown; depth?: number }) {
  if (value === null || value === undefined) {
    return <span className="text-gray-400 italic text-sm">—</span>
  }

  if (typeof value === 'string') {
    const looksLikeMarkdown =
      /(?:^|\n)#{1,6}\s|(?:^|\n)[*\-]\s|\*\*|__|\[.+\]\(.+\)|(?:^|\n)>/.test(value)
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
              {k.replace(/[_-]/g, ' ')}
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

// ─── Main component ───────────────────────────────────────────────────────────

export default function MarkdownResult({ result, hasDownload }: Props) {
  if (result === null || result === undefined) return null

  // ── Presentation workflow ──
  if (hasDownload) {
    const links = extractPresentationLinks(result)
    const hasLinks = !!(links.downloadUrl || links.viewUrl)

    return (
      <div className="space-y-4">
        {hasLinks ? (
          /* Prominent download card */
          <div className="bg-white border-2 border-green-300 rounded-xl p-8 text-center shadow-sm">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Your presentation is ready!</h2>
            {links.name && (
              <p className="text-gray-600 text-sm mb-1 font-medium">{links.name}</p>
            )}
            <p className="text-gray-500 text-sm mb-6">
              Click the button below to download your presentation file.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {links.downloadUrl && (
                <a
                  href={links.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Presentation
                </a>
              )}
              {links.viewUrl && (
                <a
                  href={links.viewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Online
                </a>
              )}
            </div>
          </div>
        ) : (
          /* URL not found — warn but still show raw response */
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <div>
              <p className="text-amber-800 font-medium text-sm">Download URL not found in response</p>
              <p className="text-amber-700 text-xs mt-0.5">
                The presentation may still be generating. Check the details below for a link.
              </p>
            </div>
          </div>
        )}

        {/* Full response details (collapsible feel via smaller styling) */}
        <details className="group">
          <summary className="cursor-pointer text-xs font-medium text-gray-400 hover:text-gray-600 select-none">
            Show full response
          </summary>
          <div className="mt-2 bg-white border border-gray-200 rounded-lg p-5">
            <RenderValue value={result} />
          </div>
        </details>
      </div>
    )
  }

  // ── Research workflow — unwrap output field and render as markdown ──
  const unwrapped = unwrapOutput(result)
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {'direct' in unwrapped ? (
        <div className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{unwrapped.direct}</ReactMarkdown>
        </div>
      ) : (
        <RenderValue value={unwrapped.raw} />
      )}
    </div>
  )
}
