import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import Layout from '../components/Layout'

interface Workflow {
  id: string
  name: string
  description: string
  category: string
  has_download: boolean
}

const CATEGORY_ICONS: Record<string, string> = {
  'Person Research': '👤',
  'Company Research': '🏢',
  'Presentation Generation': '📊',
}

export default function Dashboard() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    client
      .get('/workflows')
      .then((res) => setWorkflows(res.data))
      .catch(() => setError('Failed to load workflows.'))
      .finally(() => setLoading(false))
  }, [])

  const grouped = workflows.reduce<Record<string, Workflow[]>>((acc, wf) => {
    if (!acc[wf.category]) acc[wf.category] = []
    acc[wf.category].push(wf)
    return acc
  }, {})

  const categoryOrder = ['Person Research', 'Company Research', 'Presentation Generation']
  const orderedCategories = [
    ...categoryOrder.filter((c) => grouped[c]),
    ...Object.keys(grouped).filter((c) => !categoryOrder.includes(c)),
  ]

  return (
    <Layout>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Workflows</h1>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {!loading && !error && workflows.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
          <p className="text-gray-500 text-sm">
            No workflows available. Contact your administrator to request access.
          </p>
        </div>
      )}

      {!loading && workflows.length > 0 && (
        <div className="space-y-8">
          {orderedCategories.map((category) => (
            <section key={category}>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                <span>{CATEGORY_ICONS[category] ?? '⚙️'}</span>
                {category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {grouped[category].map((wf) => (
                  <Link
                    key={wf.id}
                    to={`/workflow/${wf.id}`}
                    className="group bg-white border border-gray-200 rounded-lg p-5 hover:border-blue-400 hover:shadow-sm transition-all"
                  >
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 text-sm leading-snug">
                        {wf.name}
                      </h3>
                      {wf.has_download && (
                        <span className="flex-shrink-0 text-xs bg-purple-50 text-purple-600 border border-purple-100 px-2 py-0.5 rounded-full">
                          + Download
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                      {wf.description}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </Layout>
  )
}
