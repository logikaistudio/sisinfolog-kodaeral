import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import PetaFaslan from './pages/PetaFaslan'
import Faslan from './pages/Faslan'
import DisBek from './pages/DisBek'
import DisAng from './pages/DisAng'
import Fasharpan from './pages/Fasharpan'
import MasterData from './pages/MasterData'
import PengaturanUsers from './pages/PengaturanUsers'
import PengaturanRoles from './pages/PengaturanRoles'
import './index.css'

function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // App state
  const [currentPage, setCurrentPage] = useState('faslan-peta')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Check data from storage on load (optional simulation)
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn')
    if (loggedIn === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (username) => {
    setIsAuthenticated(true)
    localStorage.setItem('isLoggedIn', 'true')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('isLoggedIn')
  }

  // If not authenticated, show Login page
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'faslan-peta':
        return <PetaFaslan />
      case 'faslan-tanah':
        return <Faslan type="tanah" />
      case 'faslan-bangunan':
        return <Faslan type="bangunan" />
      case 'disbek':
        return <DisBek />
      case 'disang':
        return <DisAng />
      case 'fasharpan':
        return <Fasharpan />
      case 'masterdata':
        return <MasterData />
      case 'pengaturan-users':
        return <PengaturanUsers />
      case 'pengaturan-roles':
        return <PengaturanRoles />
      default:
        return <PetaFaslan />
    }
  }

  return (
    <div className="app-container">
      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        aria-label="Toggle menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      {/* Mobile Overlay */}
      <div
        className={`mobile-overlay ${mobileSidebarOpen ? 'active' : ''}`}
        onClick={() => setMobileSidebarOpen(false)}
      />

      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="content-wrapper fade-in">
          {renderPage()}
        </div>
      </main>
    </div>
  )
}

export default App
