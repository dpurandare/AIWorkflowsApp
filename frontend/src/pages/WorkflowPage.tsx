import { FormEvent, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import client from '../api/client'
import Layout from '../components/Layout'
import MarkdownResult from '../components/MarkdownResult'
import { WORKFLOW_CONFIGS } from '../workflows'

export default function WorkflowPage() {
  const { workflowId } = useParams<{ workflowId: string }>()
  const config = workflowId ? WORKFLOW_CONFIGS[workflowId] : null

  const [formData, setFormData] = useState<Record<string, string>>({})
  const [result, setResult] = useState<unknown>(null)
  const [loading, setLoading] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [error, setError] = useState('')

  // Elapsed-time counter while a workflow is running
  useEffect(() => {
    if (!loading) {
      setElapsedSeconds(0)
      return
    }
    const id = setInterval(() => setElapsedSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [loading])

  if (!config) {
    return (
      <Layout>
        <div className="text-center py-16">
          <p className="text-gray-500">Workflow not found.</p>
          <Link to="/" className="text-blue-600 hover:underline mt-2 inline-block text-sm">
            ← Back to Dashboard
          </Link>
        </div>
      </Layout>
    )
  }

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const buildPayload = (): Record<string, unknown> | null => {
    const payload: Record<string, unknown> = {}
    for (const field of config.fields) {
      const raw = formData[field.key] ?? ''
      if (raw === '' && field.required) {
        setError(`${field.label} is required.`)
        return null
      }
      if (field.type === 'number') {
        payload[field.key] = raw === '' ? '' : Number(raw)
      } else {
        payload[field.key] = raw
      }
    }
    return payload
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setResult(null)

    const payload = buildPayload()
    if (!payload) return

    setLoading(true)
    try {
      const res = await client.post(`/workflows/${workflowId}/execute`, payload)
      setResult(res.data)
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data
        ?.detail
      setError(detail || 'An error occurred while running the workflow.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({})
    setResult(null)
    setError('')
  }

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`
  }

  return (
    <Layout>
      <div className="mb-5">
        <Link to="/" className="text-blue-600 hover:underline text-sm">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wide">
            {config.category}
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{config.name}</h1>
          <p className="text-gray-500 text-sm mt-1 leading-relaxed">{config.description}</p>
        </div>

        {/* Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {config.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-0.5">*</span>}
                </label>

                {field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.key] ?? ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={field.rows ?? 4}
                    required={field.required}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-mono"
                  />
                ) : field.type === 'number' ? (
                  <input
                    type="number"
                    value={formData[field.key] ?? ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    min={1}
                    className="w-32 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <input
                    type="text"
                    value={formData[field.key] ?? ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}

                {field.hint && (
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{field.hint}</p>
                )}
              </div>
            ))}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {loading ? `Running… (${formatElapsed(elapsedSeconds)})` : 'Run Workflow'}
              </button>

              {result && !loading && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Running notice */}
        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 mb-6">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-800 text-sm font-medium">Workflow is running</p>
              <p className="text-blue-600 text-xs mt-0.5">
                AI research workflows can take several minutes. Please keep this page open.
              </p>
            </div>
          </div>
        )}

        {/* Result */}
        {result !== null && !loading && (
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-3">Result</h2>
            <MarkdownResult result={result} hasDownload={config.has_download} />
          </div>
        )}
      </div>
    </Layout>
  )
}
