import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

const DashboardPimpinan = ({ setCurrentPage }) => {
    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        faslan: {
            totalTanah: 0,
            totalKapling: 0,
            totalPemanfaatan: 0,
            totalKompensasi: 0
        },
        faslabuh: {
            totalDermaga: 0,
            kondisiBaik: 0,
            perluPerbaikan: 0
        },
        fasharpan: {
            totalPemeliharaan: 0,
            selesai: 0,
            berlangsung: 0
        }
    })

    // Fetch data from APIs
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true)

                // Fetch Faslan Data
                const [tanah, kapling, pemanfaatan, faslabuh] = await Promise.all([
                    fetch('http://localhost:3001/api/assets/tanah').then(r => r.json()),
                    fetch('http://localhost:3001/api/assets/kapling').then(r => r.json()),
                    fetch('http://localhost:3001/api/assets/pemanfaatan').then(r => r.json()),
                    fetch('http://localhost:3001/api/faslabuh').then(r => r.json()).catch(() => [])
                ])

                // Calculate totals
                const totalKompensasi = pemanfaatan.reduce((sum, item) => {
                    const kompensasi = parseFloat(String(item.nilai_kompensasi).replace(/,/g, '')) || 0
                    return sum + kompensasi
                }, 0)

                // Calculate Faslabuh kondisi
                const kondisiBaik = faslabuh.filter(d => d.kondisi?.toLowerCase().includes('baik')).length
                const perluPerbaikan = faslabuh.filter(d =>
                    d.kondisi?.toLowerCase().includes('rusak') ||
                    d.kondisi?.toLowerCase().includes('perbaikan')
                ).length

                setDashboardData({
                    faslan: {
                        totalTanah: tanah.length,
                        totalKapling: kapling.length,
                        totalPemanfaatan: pemanfaatan.length,
                        totalKompensasi
                    },
                    faslabuh: {
                        totalDermaga: faslabuh.length,
                        kondisiBaik,
                        perluPerbaikan
                    },
                    fasharpan: {
                        totalPemeliharaan: 0,
                        selesai: 0,
                        berlangsung: 0
                    }
                })
            } catch (error) {
                console.error('Error fetching dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    // Format number with thousand separator
    const formatNumber = (num) => {
        return new Intl.NumberFormat('id-ID').format(num)
    }

    // Format currency
    const formatCurrency = (num) => {
        return `Rp ${new Intl.NumberFormat('id-ID').format(num)}`
    }

    // Calculate percentages
    const kondisiBaikPercentage = dashboardData.faslabuh.totalDermaga > 0
        ? Math.round((dashboardData.faslabuh.kondisiBaik / dashboardData.faslabuh.totalDermaga) * 100)
        : 0

    // Main stats for top cards
    const mainStats = [
        {
            label: 'Total Aset Tanah',
            value: formatNumber(dashboardData.faslan.totalTanah),
            unit: 'Lokasi',
            icon: '📍',
            color: '#0ea5e9',
            onClick: () => setCurrentPage('faslan-tanah')
        },

        {
            label: 'Pemanfaatan Aset',
            value: formatNumber(dashboardData.faslan.totalPemanfaatan),
            unit: 'Kerjasama Aktif',
            icon: '🤝',
            color: '#10b981',
            onClick: () => setCurrentPage('faslan-kerjasama')
        },
        {
            label: 'Kondisi Dermaga Baik',
            value: `${kondisiBaikPercentage}%`,
            unit: `${dashboardData.faslabuh.kondisiBaik} dari ${dashboardData.faslabuh.totalDermaga} Dermaga`,
            icon: '⚓',
            color: '#f59e0b',
            onClick: () => setCurrentPage('faslan-faslabuh')
        }
    ]

    // Detailed breakdown cards
    const detailCards = [
        {
            title: 'Fasilitas Pangkalan',
            icon: '🏛️',
            color: '#003366',
            items: [
                { label: 'Aset Tanah', value: dashboardData.faslan.totalTanah, page: 'faslan-tanah' },
                { label: 'Aset Kapling', value: dashboardData.faslan.totalKapling, page: 'faslan-kapling' },
                { label: 'Pemanfaatan Aset', value: dashboardData.faslan.totalPemanfaatan, page: 'faslan-kerjasama' }
            ]
        },
        {
            title: 'Faslabuh',
            icon: '⚓',
            color: '#0066cc',
            items: [
                { label: 'Total Dermaga', value: dashboardData.faslabuh.totalDermaga, page: 'faslan-faslabuh' },
                { label: 'Kondisi Baik', value: dashboardData.faslabuh.kondisiBaik, page: 'faslan-faslabuh' },
                { label: 'Perlu Perbaikan', value: dashboardData.faslabuh.perluPerbaikan, page: 'faslan-faslabuh', alert: dashboardData.faslabuh.perluPerbaikan > 0 }
            ]
        },
        {
            title: 'Nilai Kompensasi',
            icon: '💰',
            color: '#10b981',
            highlight: true,
            items: [
                { label: 'Total Kompensasi', value: formatCurrency(dashboardData.faslan.totalKompensasi), page: 'faslan-kerjasama', large: true }
            ]
        }
    ]

    if (loading) {
        return (
            <div className="fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                    <div style={{ color: '#64748b', fontFamily: 'var(--font-family)' }}>Memuat data dashboard...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Dashboard Pimpinan</h1>
                <p className="page-subtitle">Ringkasan Eksekutif Data Logistik & Fasilitas Kodaeral 3 Jakarta</p>
            </div>

            {/* Main Stats Grid */}
            <div className="stats-grid">
                {mainStats.map((stat, idx) => (
                    <div
                        key={idx}
                        className="stat-card"
                        onClick={stat.onClick}
                        style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)'
                            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div className="stat-label">{stat.label}</div>
                                <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'var(--font-family)' }}>{stat.unit}</div>
                            </div>
                            <div style={{
                                fontSize: '1.5rem',
                                background: `${stat.color}20`,
                                padding: '10px',
                                borderRadius: '12px',
                                color: stat.color
                            }}>
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detailed Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '24px' }}>
                {detailCards.map((card, idx) => (
                    <div key={idx} className="card" style={{
                        background: card.highlight ? `linear-gradient(135deg, ${card.color}15 0%, ${card.color}05 100%)` : 'white',
                        border: card.highlight ? `2px solid ${card.color}30` : '1px solid #e5e7eb'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '16px',
                            paddingBottom: '12px',
                            borderBottom: `2px solid ${card.color}20`
                        }}>
                            <div style={{
                                fontSize: '1.5rem',
                                background: `${card.color}20`,
                                padding: '8px',
                                borderRadius: '8px',
                                color: card.color
                            }}>
                                {card.icon}
                            </div>
                            <h3 style={{
                                fontSize: '1.1rem',
                                margin: 0,
                                color: card.color,
                                fontWeight: '700',
                                fontFamily: 'var(--font-family)'
                            }}>
                                {card.title}
                            </h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {card.items.map((item, itemIdx) => (
                                <div
                                    key={itemIdx}
                                    onClick={() => item.route && navigate(item.route)}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '10px 12px',
                                        background: item.alert ? '#fef2f2' : '#f9fafb',
                                        borderRadius: '6px',
                                        cursor: item.page ? 'pointer' : 'default',
                                        transition: 'all 0.2s',
                                        border: item.alert ? '1px solid #fecaca' : '1px solid transparent',
                                        fontFamily: 'var(--font-family)'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (item.page) {
                                            e.currentTarget.style.background = item.alert ? '#fee2e2' : '#f1f5f9'
                                            e.currentTarget.style.transform = 'translateX(4px)'
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (item.page) {
                                            e.currentTarget.style.background = item.alert ? '#fef2f2' : '#f9fafb'
                                            e.currentTarget.style.transform = 'translateX(0)'
                                        }
                                    }}
                                >
                                    <span style={{
                                        fontSize: item.large ? '0.95rem' : '0.9rem',
                                        color: item.alert ? '#dc2626' : '#374151',
                                        fontWeight: item.large ? '600' : '500'
                                    }}>
                                        {item.alert && '⚠️ '}
                                        {item.label}
                                    </span>
                                    <span style={{
                                        fontSize: item.large ? '1.1rem' : '1rem',
                                        fontWeight: '700',
                                        color: item.alert ? '#dc2626' : card.color
                                    }}>
                                        {typeof item.value === 'number' ? formatNumber(item.value) : item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="card" style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#003366', fontFamily: 'var(--font-family)' }}>
                    🚀 Akses Cepat
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    {[
                        { label: 'Peta Faslan', icon: '🗺️', page: 'faslan-peta', color: '#0ea5e9' },
                        { label: 'Aset Tanah', icon: '⛰️', page: 'faslan-tanah', color: '#10b981' },
                        { label: 'Pemanfaatan Aset', icon: '🤝', page: 'faslan-kerjasama', color: '#f59e0b' },
                        { label: 'Faslabuh', icon: '⚓', page: 'faslan-faslabuh', color: '#0066cc' },
                        { label: 'Master Data', icon: '⚙️', page: 'master-asset', color: '#64748b' }
                    ].map((action, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentPage(action.page)}
                            style={{
                                padding: '12px 16px',
                                background: `${action.color}10`,
                                border: `1px solid ${action.color}30`,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: action.color,
                                fontFamily: 'var(--font-family)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = `${action.color}20`
                                e.currentTarget.style.transform = 'scale(1.02)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = `${action.color}10`
                                e.currentTarget.style.transform = 'scale(1)'
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>{action.icon}</span>
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

DashboardPimpinan.propTypes = {
    setCurrentPage: PropTypes.func.isRequired
}

export default DashboardPimpinan
