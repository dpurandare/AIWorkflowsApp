import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

export default function NotFound() {
  return (
    <Layout>
      <div className="max-w-md mx-auto text-center py-20">
        <p className="text-6xl font-bold text-gray-200 mb-4">404</p>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-500 text-sm mb-6">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/" className="text-blue-600 hover:underline text-sm">
          ← Back to Dashboard
        </Link>
      </div>
    </Layout>
  )
}
