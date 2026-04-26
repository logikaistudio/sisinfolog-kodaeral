import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import DashboardPimpinan from './pages/DashboardPimpinan'
import PetaFaslan from './pages/PetaFaslan'
import Faslan from './pages/Faslan'
import DisBek from './pages/DisBek'
import DisKes from './pages/DisKes'
import DisAng from './pages/DisAng'
import Fasharpan from './pages/Fasharpan'
import Faslabuh from './pages/Faslabuh'
import Kerjasama from './pages/Kerjasama'
import IndustriJasaMaritim from './pages/IndustriJasaMaritim'
import Satharkan from './pages/Satharkan'
import DataHarkan from './pages/DataHarkan'
import MasterData from './pages/MasterData'
import MasterAsset from './pages/MasterAsset'
import MasterAssetList from './pages/MasterAssetList'
import MasterAssetUtama from './pages/MasterAssetUtama'
import FastanahAssetUtama from './pages/FastanahAssetUtama'
import MasterRumneg from './pages/MasterRumneg'
import RumnegArea from './pages/RumnegArea'
import AssetDetail from './pages/AssetDetail'
import PengaturanUsers from './pages/PengaturanUsers'
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

  // Check for existing session on load
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        if (userData && typeof userData === 'object' && !Array.isArray(userData) && userData.name) {
          setIsAuthenticated(true)
          setUser(userData)
        } else {
          localStorage.removeItem('currentUser')
        }
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('currentUser')
      }
    }
  }, [])

  const handleLogin = (userData) => {
    if (!userData || typeof userData !== 'object') {
      console.error('Invalid user data received on login');
      return;
    }
    // Spread to ensure a NEW object reference, forcing React to re-render Sidebar
    const freshUser = { ...userData }
    localStorage.setItem('currentUser', JSON.stringify(freshUser))
    setUser(freshUser)
    setIsAuthenticated(true)
    // Reset to default page on login
    setCurrentPage('dashboard-pimpinan')
  }

  const handleLogout = () => {
    // Clear ALL localStorage to prevent any stale session data
    localStorage.clear()
    
    // Force a full page reload to completely reset application state 
    // and prevent browser autofill from immediately reapplying credentials
    window.location.href = '/';
  }

  // If not authenticated, show Login page
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard-pimpinan':
        return <DashboardPimpinan setCurrentPage={setCurrentPage} />
      case 'faslan-peta':
        return <PetaFaslan />
      case 'faslan-tanah-utama':
        return <FastanahAssetUtama />
      case 'faslan-kapling':
        return <Faslan type="kapling" />
      case 'faslan-faslabuh':
        return <Faslabuh />
      case 'faslan-kerjasama':
        return <Kerjasama />
      case 'diskes':
        return <DisKes />
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
      case 'data-harkan':
        return <DataHarkan />
      case 'masterdata':
        return <MasterData />
      case 'master-asset':
        return <MasterAsset onViewDetail={(kodeAsset) => {
          setSelectedAssetCode(kodeAsset)
          setCurrentPage('asset-detail')
        }} />
      case 'master-asset-utama':
        return <MasterAssetUtama />
      case 'master-rumneg':
        return <MasterRumneg />
      case 'asset-detail':
        return <AssetDetail
          kodeAsset={selectedAssetCode}
          onBack={() => setCurrentPage('master-asset')}
        />
      case 'pengaturan-users':
        return <PengaturanUsers defaultTab="users" />
      case 'pengaturan-roles':
        return <PengaturanUsers defaultTab="roles" />
      default:
        if (currentPage.startsWith('faslan-rumneg:dynamic:')) {
          const areaName = currentPage.replace('faslan-rumneg:dynamic:', '');
          return <RumnegArea area={areaName} />
        }
        return <PetaFaslan />
    }
  }

  return (
    <div className="app-container">
      {/* Mobile Menu Button AND Desktop Unhide Button */}
      <button
        className={`mobile-menu-btn ${sidebarCollapsed ? 'show-on-desktop' : ''}`}
        onClick={() => {
            if (window.innerWidth <= 1024) {
                setMobileSidebarOpen(!mobileSidebarOpen)
            } else {
                setSidebarCollapsed(false)
            }
        }}
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
