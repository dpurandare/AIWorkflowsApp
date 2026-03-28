import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import UserManagement from './pages/admin/UserManagement'

// Individual workflow pages
import PersonResearcher from './pages/workflows/PersonResearcher'
import PersonEnrichmentApollo from './pages/workflows/PersonEnrichmentApollo'
import CompanyResearcher from './pages/workflows/CompanyResearcher'
import CompanySearchAgent from './pages/workflows/CompanySearchAgent'
import PresentationCreator from './pages/workflows/PresentationCreator'
import TailoredPresentation from './pages/workflows/TailoredPresentation'
import CustomServicesPresentation from './pages/workflows/CustomServicesPresentation'

const protect = (element: JSX.Element) => <ProtectedRoute>{element}</ProtectedRoute>

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={protect(<Dashboard />)} />

          {/* Person Research */}
          <Route path="/workflow/person-researcher"         element={protect(<PersonResearcher />)} />
          <Route path="/workflow/person-enrichment-apollo" element={protect(<PersonEnrichmentApollo />)} />

          {/* Company Research */}
          <Route path="/workflow/company-researcher"  element={protect(<CompanyResearcher />)} />
          <Route path="/workflow/company-search-agent" element={protect(<CompanySearchAgent />)} />

          {/* Presentation Generation */}
          <Route path="/workflow/presentation-creator"          element={protect(<PresentationCreator />)} />
          <Route path="/workflow/tailored-presentation"         element={protect(<TailoredPresentation />)} />
          <Route path="/workflow/custom-services-presentation"  element={protect(<CustomServicesPresentation />)} />

          {/* Admin */}
          <Route
            path="/admin"
            element={<ProtectedRoute adminOnly><UserManagement /></ProtectedRoute>}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
