import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import DashboardPimpinan from './pages/DashboardPimpinan'
import PetaFaslan from './pages/PetaFaslan'
import Faslan from './pages/Faslan'
import DisBek from './pages/DisBek'
import DisAng from './pages/DisAng'
import Fasharpan from './pages/Fasharpan'
import Faslabuh from './pages/Faslabuh'
import Kerjasama from './pages/Kerjasama'
import IndustriJasaMaritim from './pages/IndustriJasaMaritim'
import Satharkan from './pages/Satharkan'
import MasterData from './pages/MasterData'
import MasterAsset from './pages/MasterAsset'
import MasterAssetList from './pages/MasterAssetList'
import AssetDetail from './pages/AssetDetail'
import PengaturanUsers from './pages/PengaturanUsers'
import PengaturanRoles from './pages/PengaturanRoles'
import './index.css'


function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  // App state
  const [currentPage, setCurrentPage] = useState('dashboard-pimpinan')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [selectedAssetCode, setSelectedAssetCode] = useState(null)

  // Check data from storage on load (optional simulation)
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn')
    if (loggedIn === 'true') {
      setIsAuthenticated(true)
      // Restore mock user
      setUser({
        name: 'Admin Kodaeral',
        role: 'Super Admin',
        avatar: 'https://ui-avatars.com/api/?name=Admin+Kodaeral&background=0ea5e9&color=fff'
      })
    }
  }, [])

  const handleLogin = (username) => {
    setIsAuthenticated(true)
    localStorage.setItem('isLoggedIn', 'true')
    // Set mock user data
    setUser({
      name: 'Admin Kodaeral',
      role: 'Super Admin',
      avatar: 'https://ui-avatars.com/api/?name=Admin+Kodaeral&background=0ea5e9&color=fff'
    })
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem('isLoggedIn')
  }

  // If not authenticated, show Login page
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard-pimpinan':
        return <DashboardPimpinan />
      case 'faslan-peta':
        return <PetaFaslan />
      case 'faslan-tanah':
        return <Faslan type="tanah" />
      case 'faslan-kapling':
        return <Faslan type="kapling" />
      case 'faslan-bangunan':
        return <Faslan type="bangunan" />
      case 'faslan-faslabuh':
        return <Faslabuh />
      case 'faslan-kerjasama':
        return <Kerjasama />
      case 'disbek':
        return <DisBek />
      case 'disang':
        return <DisAng />
      case 'fasharpan':
        return <Fasharpan />
      case 'fasharpan-injasmar':
        return <IndustriJasaMaritim />
      case 'satharkan':
        return <Satharkan />
      case 'masterdata':
        return <MasterData />
      case 'master-asset':
        return <MasterAsset onViewDetail={(kodeAsset) => {
          setSelectedAssetCode(kodeAsset)
          setCurrentPage('asset-detail')
        }} />
      case 'asset-detail':
        return <AssetDetail
          kodeAsset={selectedAssetCode}
          onBack={() => setCurrentPage('master-asset')}
        />
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
        user={user}
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
