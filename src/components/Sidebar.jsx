import PropTypes from 'prop-types'
import { useState } from 'react'

function Sidebar({ currentPage, setCurrentPage, collapsed, setCollapsed, mobileOpen, setMobileOpen, onLogout, user }) {
    // State untuk menyimpan ID menu yang sedang expanded (bisa multiple levels)
    const [expandedMenus, setExpandedMenus] = useState(['faslan', 'fastanah-parent', 'faslan-rumneg-parent', 'satharkan'])

    const menuItems = [
        {
            id: 'dashboard-pimpinan',
            label: 'Dashboard Pimpinan',
            icon: '📊',
            description: 'Ringkasan Eksekutif'
        },
        {
            id: 'faslan',
            label: 'Fasilitas Pangkalan',
            icon: '🏛️',
            description: 'Fasilitas Pangkalan',
            children: [
                { id: 'faslan-peta', label: 'Peta Faslan', icon: '🗺️' },
                {
                    id: 'fastanah-parent',
                    label: 'Fastanah',
                    icon: '📍',
                    children: [
                        { id: 'faslan-tanah', label: 'Aset Tanah', icon: '⛰️' },
                        { id: 'faslan-kapling', label: 'Aset Kapling', icon: '🏕️' },
                        {
                            id: 'faslan-rumneg-parent',
                            label: 'Aset Rumah Negara',
                            icon: '🏠',
                            children: [
                                { id: 'faslan-rumneg-lagoa', label: 'Rumneg Lagoa', icon: '🏘️' }
                            ]
                        },
                        { id: 'faslan-kerjasama', label: 'Pemanfaatan Aset', icon: '🤝' }
                    ]
                },
                { id: 'faslan-faslabuh', label: 'Faslabuh', icon: '⚓' }
            ]
        },
        {
            id: 'fasharpan',
            label: 'Fasilitas Pemeliharaan & Perbaikan',
            icon: '🛠️',
            description: 'Fasharpan',
            children: [
                { id: 'fasharpan-injasmar', label: 'Industri Jasa Maritim', icon: '🚢' }
            ]
        },
        {
            id: 'satharkan',
            label: 'Satharkan',
            icon: '🏗️',
            description: 'Satuan Pemeliharaan Pangkalan',
            children: [
                { id: 'data-harkan', label: 'Data Harkan', icon: '📝' }
            ]
        },
        {
            id: 'diskes',
            label: 'Fasilitas Kesehatan',
            icon: '🏥',
            description: 'DisKes'
        },
        {
            id: 'disbek',
            label: 'Fasilitas Pembekalan',
            icon: '📦',
            description: 'DisBek'
        },
        {
            id: 'disang',
            label: 'Fasilitas Jasa Angkutan',
            icon: '🚛',
            description: 'DisAng'
        },
        {
            id: 'masterdata',
            label: 'Master Data',
            icon: '⚙️',
            description: 'Data Master',
            children: [
                { id: 'master-asset', label: 'Asset', icon: '📦' },
                { id: 'master-rumneg', label: 'Aset Rumneg', icon: '🏠' }
            ]
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

    const handleMenuClick = (item, hasChildren) => {
        if (hasChildren) {
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

    // Fungsi rekursif untuk render menu
    const renderMenuItem = (item, level = 0, index = 0) => {
        const hasChildren = item.children && item.children.length > 0
        const isExpanded = expandedMenus.includes(item.id)
        const isActive = currentPage === item.id

        // Calculate padding based on depth level
        // Level 1: 3.5rem, Level 2: 5.5rem (Extra indent for hierarchy)
        const paddingLeft = level === 0 ? undefined : `${(level * 2) + 1.5}rem`

        // Font size adjustment for deeper levels
        const fontSize = level === 0 ? '0.9rem' : level === 1 ? '0.85rem' : '0.8rem'

        return (
            <div key={item.id} className="menu-item-container">
                <div
                    className={`nav-item ${isActive || (hasChildren && isExpanded) ? 'active' : ''} ${level === 0 ? 'slide-in' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation()
                        handleMenuClick(item, hasChildren)
                    }}
                    style={{
                        paddingLeft: paddingLeft,
                        fontSize: fontSize,
                        animationDelay: level === 0 ? `${index * 50}ms` : '0ms',
                        height: 'auto',         // Allow auto height for wrapping
                        minHeight: '35px',      // Minimum height reduced
                        paddingTop: '6px',      // Reduced padding
                        paddingBottom: '6px'    // Reduced padding
                    }}
                    title={collapsed && level === 0 ? item.label : ''}
                >
                    <div className="nav-icon" style={{
                        fontSize: level > 0 ? '1em' : '1.2em',
                        minWidth: '24px',
                        textAlign: 'center',
                        alignSelf: 'flex-start', // Align icon to top if text wraps
                        marginTop: '2px'
                    }}>
                        {item.icon}
                    </div>
                    {(!collapsed || level > 0) && (
                        <div className="nav-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
                            <span style={{
                                whiteSpace: 'normal',   // Allow text wrap
                                lineHeight: '1.3',      // Better line spacing
                                display: 'block',       // Ensure block behavior
                                paddingRight: '10px'    // Spacing from collapse arrow
                            }}>
                                {item.label}
                            </span>
                            {hasChildren && (
                                <svg
                                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                    style={{
                                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.2s',
                                        opacity: 0.7,
                                        flexShrink: 0 // Prevent arrow from shrinking
                                    }}
                                >
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            )}
                        </div>
                    )}
                </div>

                {/* Render Children (Recursive) */}
                {hasChildren && isExpanded && !collapsed && (
                    <div className="submenu fade-in" style={{
                        background: level === 0 ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)',
                        borderLeft: level > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                    }}>
                        {item.children.map((child, idx) => renderMenuItem(child, level + 1, idx))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
            {/* Header */}
            <div className="sidebar-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '50px', padding: '1.5rem 1rem' }}>
                <div className="sidebar-logo" style={{ paddingTop: '40px' }}>
                    <img src="/logo.png" alt="Logo" style={{ width: '96px', height: '96px', objectFit: 'contain' }} />
                </div>
                {!collapsed && (
                    <div className="sidebar-title" style={{ textAlign: 'center', width: '100%' }}>
                        <h1 style={{ lineHeight: '1.3', margin: 0, fontSize: '1.5rem', fontWeight: '700', letterSpacing: '0.5px' }}>Sisinfolog</h1>
                        <p style={{ fontSize: 'var(--font-size-sm)', marginTop: '2px', fontWeight: '500', opacity: 0.9, margin: '2px 0 0 0' }}>Kodaeral 3 Jakarta</p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {menuItems.map((item, index) => renderMenuItem(item, 0, index))}
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
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)', flexShrink: 0
                    }}>
                        <img src={user?.avatar || 'https://ui-avatars.com/api/?name=User&background=random'} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    {!collapsed && (
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'User'}</div>
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{user?.role || 'Guest'}</div>
                        </div>
                    )}

                    {!collapsed && (
                        <button onClick={onLogout} title="Keluar Aplikasi" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fca5a5', flexShrink: 0 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
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
