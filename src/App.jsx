import { useState } from 'react'
import Sidebar from './components/Sidebar'
import PetaFaslan from './pages/PetaFaslan'
import Faslan from './pages/Faslan'
import Bekang from './pages/Bekang'
import Harpan from './pages/Harpan'
import MasterData from './pages/MasterData'
import './index.css'

function App() {
  const [currentPage, setCurrentPage] = useState('faslan-peta')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const renderPage = () => {
    switch (currentPage) {
      case 'faslan-peta':
        return <PetaFaslan />
      case 'faslan-tanah':
        return <Faslan type="tanah" />
      case 'faslan-bangunan':
        return <Faslan type="bangunan" />
      case 'bekang':
        return <Bekang />
      case 'harpan':
        return <Harpan />
      case 'masterdata':
        return <MasterData />
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
