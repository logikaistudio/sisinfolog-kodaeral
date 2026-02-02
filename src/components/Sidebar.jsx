import PropTypes from 'prop-types'
import { useState } from 'react'

function Sidebar({ currentPage, setCurrentPage, collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
    const [expandedMenus, setExpandedMenus] = useState(['faslan'])

    const menuItems = [
        {
            id: 'faslan',
            label: 'Fasilitas Pangkalan',
            icon: '🏛️',
            description: 'Fasilitas Pangkalan',
            children: [
                { id: 'faslan-peta', label: 'Peta Faslan', icon: '🗺️' },
                { id: 'faslan-tanah', label: 'Aset Tanah', icon: '📍' },
                { id: 'faslan-bangunan', label: 'Aset Bangunan', icon: '🏢' }
            ]
        },
        {
            id: 'bekang',
            label: 'Bekang',
            icon: '📦',
            description: 'Bekal Angkutan'
        },
        {
            id: 'harpan',
            label: 'Harpan',
            icon: '🛠️',
            description: 'Data KRI, KAL, KAMLA'
        },
        {
            id: 'masterdata',
            label: 'Master Data',
            icon: '⚙️',
            description: 'Data Master'
        }
    ]

    const handleMenuClick = (item) => {
        if (item.children) {
            setExpandedMenus(prev =>
                prev.includes(item.id)
                    ? prev.filter(id => id !== item.id)
                    : [...prev, item.id]
            )
            if (collapsed) setCollapsed(false)
        } else {
            setCurrentPage(item.id)
            setMobileOpen(false)
        }
    }

    const handleSubMenuClick = (parentId, childId) => {
        setCurrentPage(childId)
        setMobileOpen(false)
    }

    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
            {/* Header */}
            <div className="sidebar-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '50px', padding: '1.5rem 1rem' }}>
                <div className="sidebar-logo" style={{ paddingTop: '40px' }}>
                    <img src="/logo.png" alt="Logo" style={{ width: '96px', height: '96px', objectFit: 'contain' }} />
                </div>
                <div className="sidebar-title" style={{ textAlign: 'center', width: '100%' }}>
                    <h1 style={{
                        lineHeight: '1.3',
                        margin: 0,
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        letterSpacing: '0.5px'
                    }}>Sisinfolog</h1>
                    <p style={{
                        fontSize: 'var(--font-size-sm)',
                        marginTop: '2px',
                        fontWeight: '500',
                        opacity: 0.9,
                        margin: '2px 0 0 0'
                    }}>Kodaeral 3 Jakarta</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {menuItems.map((item, index) => (
                    <div key={item.id}>
                        <div
                            className={`nav-item ${currentPage === item.id || (item.children && expandedMenus.includes(item.id)) ? 'active' : ''} slide-in`}
                            onClick={() => handleMenuClick(item)}
                            style={{ animationDelay: `${index * 50}ms` }}
                            title={collapsed ? item.label : ''}
                        >
                            <div className="nav-icon">{item.icon}</div>
                            <div className="nav-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>{item.label}</span>
                                {item.children && (
                                    <svg
                                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                        style={{
                                            transform: expandedMenus.includes(item.id) ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.2s'
                                        }}
                                    >
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                )}
                            </div>
                        </div>

                        {/* Submenu */}
                        {item.children && expandedMenus.includes(item.id) && !collapsed && (
                            <div className="submenu fade-in" style={{ background: 'rgba(0,0,0,0.1)' }}>
                                {item.children.map((child) => (
                                    <div
                                        key={child.id}
                                        className={`nav-item ${currentPage === child.id ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleSubMenuClick(item.id, child.id)
                                        }}
                                        style={{ paddingLeft: '3.5rem', fontSize: '0.9em' }}
                                    >
                                        <div className="nav-icon" style={{ fontSize: '1em' }}>{child.icon}</div>
                                        <div className="nav-label">{child.label}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            {/* Footer */}
            {!collapsed && (
                <div className="sidebar-footer fade-in" style={{
                    padding: '1rem',
                    textAlign: 'center',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                    <div style={{
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: 'rgba(255, 255, 255, 0.8)',
                        marginBottom: '4px',
                        fontFamily: "'Inter', sans-serif"
                    }}>
                        LogikAi studio
                    </div>
                    <div style={{
                        fontSize: '0.75rem',
                        letterSpacing: '0.4em',
                        color: 'rgba(255, 255, 255, 0.4)',
                        marginLeft: '0.4em' /* Offset for letter-spacing to center visually */
                    }}>
                        2 0 2 6
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <div
                className="sidebar-toggle"
                onClick={() => setCollapsed(!collapsed)}
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}
                >
                    <path d="M15 18l-6-6 6-6" />
                </svg>
            </div>
        </aside>
    )
}

Sidebar.propTypes = {
    currentPage: PropTypes.string.isRequired,
    setCurrentPage: PropTypes.func.isRequired,
    collapsed: PropTypes.bool.isRequired,
    setCollapsed: PropTypes.func.isRequired,
    mobileOpen: PropTypes.bool.isRequired,
    setMobileOpen: PropTypes.func.isRequired
}

export default Sidebar
