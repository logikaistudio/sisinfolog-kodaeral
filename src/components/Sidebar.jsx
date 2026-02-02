import PropTypes from 'prop-types'
import { useState } from 'react'

function Sidebar({ currentPage, setCurrentPage, collapsed, setCollapsed, mobileOpen, setMobileOpen, onLogout, user }) {
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
            id: 'fasharpan',
            label: 'Fasharpan',
            icon: '🛠️',
            description: 'Fasilitas Pemeliharaan & Perbaikan'
        },
        {
            id: 'disbek',
            label: 'DisBek',
            icon: '📦',
            description: 'Dinas Perbekalan'
        },
        {
            id: 'disang',
            label: 'DisAng',
            icon: '🚛',
            description: 'Dinas Angkutan'
        },
        {
            id: 'masterdata',
            label: 'Master Data',
            icon: '⚙️',
            description: 'Data Master'
        },
        {
            id: 'pengaturan',
            label: 'Pengaturan',
            icon: '🔧',
            description: 'Pengaturan Sistem',
            children: [
                { id: 'pengaturan-users', label: 'Akses Masuk', icon: '👥' },
                { id: 'pengaturan-roles', label: 'Role Management', icon: '🛡️' }
            ]
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

            {/* Footer - User Profile */}
            <div className="sidebar-footer fade-in" style={{
                padding: collapsed ? '12px' : '16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(0,0,0,0.1)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    justifyContent: collapsed ? 'center' : 'flex-start'
                }}>
                    {/* User Avatar */}
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '2px solid rgba(255,255,255,0.2)',
                        flexShrink: 0
                    }}>
                        <img
                            src={user?.avatar || 'https://ui-avatars.com/api/?name=User&background=random'}
                            alt="User"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>

                    {/* User Info & Logout (Hidden if collapsed) */}
                    {!collapsed && (
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: 'white',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {user?.name || 'User'}
                            </div>
                            <div style={{
                                fontSize: '11px',
                                color: 'rgba(255,255,255,0.6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <span>{user?.role || 'Guest'}</span>
                            </div>
                        </div>
                    )}

                    {/* Logout Button */}
                    {!collapsed && (
                        <button
                            onClick={onLogout}
                            title="Keluar Aplikasi"
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#fca5a5',
                                flexShrink: 0,
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
                            onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                        </button>
                    )}
                </div>
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
    setMobileOpen: PropTypes.func.isRequired,
    onLogout: PropTypes.func,
    user: PropTypes.object
}

export default Sidebar
