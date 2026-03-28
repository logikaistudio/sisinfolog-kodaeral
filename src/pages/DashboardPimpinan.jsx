import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import PetaFaslan from './PetaFaslan'

const LiveClock = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const dayName = time.toLocaleDateString('id-ID', { weekday: 'long' });
    const dateStr = time.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return (
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', lineHeight: '1' }}>{timeStr}</div>
            <div style={{ fontSize: '1rem', color: '#64748b', fontWeight: '500', marginTop: '4px' }}>{dayName}, {dateStr}</div>
        </div>
    );
};

const DashboardPimpinan = ({ setCurrentPage }) => {
    const [loading, setLoading] = useState(true)
    const [showDisaster, setShowDisaster] = useState(true)
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

                const base = import.meta.env.PROD ? '' : 'http://localhost:3001'

                // Fetch Faslan Data
                const [tanah, kapling, pemanfaatan, faslabuh] = await Promise.all([
                    fetch(`${base}/api/assets/tanah`).then(r => r.json()).catch(() => []),
                    fetch(`${base}/api/assets/kapling`).then(r => r.json()).catch(() => []),
                    fetch(`${base}/api/assets/pemanfaatan`).then(r => r.json()).catch(() => []),
                    fetch(`${base}/api/faslabuh`).then(r => r.json()).catch(() => [])
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

    const incidents = [
        { jenis: 'Banjir', tinggi: '80', terdampak: '320', keterangan: 'Genangan parah di Bidara Cina', areaText: '12.400 m²', time: '09:42' },
        { jenis: 'Banjir', tinggi: '45', terdampak: '120', keterangan: 'Jalan Matraman putus', areaText: '5.200 m²', time: '08:15' },
        { jenis: 'Banjir', tinggi: '110', terdampak: '500', keterangan: 'Banjir Kp. Melayu, evakuasi berlangsung, perahu karet dikerahkan.', areaText: '15.000 m²', time: '10:05' },
        { jenis: 'Banjir', tinggi: '135', terdampak: '850', keterangan: 'Banjir Cawang, Posko darurat didirikan di area RS.', areaText: '21.000 m²', time: '10:30' },
        { jenis: 'Banjir', tinggi: '150', terdampak: '1200', keterangan: 'Banjir Bidara Cina, luapan Ciliwung deras, Butuh bantuan logistik.', areaText: '30.500 m²', time: '11:15' },
    ];

    const distributionData = [
      { item: 'Perahu Karet',     icon: '🚤', total: 40, deployed: 28, unit: 'unit', location: 'Bidara Cina', kondisi: 'Baik', date: '28 Mar 2026', pic: 'Regu Alpha' },
      { item: 'Pompa Air Mobile', icon: '💧', total: 60, deployed: 42, unit: 'unit', location: 'Pluit', kondisi: 'Baik', date: '28 Mar 2026', pic: 'Regu Bravo' },
      { item: 'Tenda Darurat',    icon: '⛺', total: 120, deployed: 85, unit: 'unit', location: 'Manggarai', kondisi: 'Perlu Servis', date: '27 Mar 2026', pic: 'Dinsos DKI' },
      { item: 'Karung Pasir',     icon: '🛁', total: 5000, deployed: 3200, unit: 'sak', location: 'Tanah Abang', kondisi: 'Siap Pakai', date: '27 Mar 2026', pic: 'SDA Pemprov' },
      { item: 'Logistik Pangan',  icon: '🍱', total: 2000, deployed: 1240, unit: 'pack', location: 'Kampung Melayu', kondisi: 'Aman', date: '28 Mar 2026', pic: 'BPBD Logistik' },
      { item: 'Kit Medis',        icon: '🏥', total: 80, deployed: 55, unit: 'kit', location: 'Posko Utama', kondisi: 'Lengkap', date: '28 Mar 2026', pic: 'Dinkes' },
    ];

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
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Dashboard Pimpinan</h1>
                    <p className="page-subtitle">Ringkasan Eksekutif Data Logistik & Fasilitas Kodaeral 3 Jakarta</p>
                </div>
                <LiveClock />
            </div>

            {/* 3x3 Grid Dashboard Layout */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '70% 30%',
                gap: '24px',
                alignItems: 'start'
            }}>

                {/* ROW 1: Main Stats (Span 2 Cols) */}
                <div style={{ gridColumn: '1 / 3' }}>
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
            </div>

            {/* ROW 2 & 3: Map Layout (Span 1 Col of 70%) */}
            <div style={{ gridColumn: '1 / 2', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '600px' }}>
                <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                                <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b', fontWeight: '800', lineHeight: 1.2 }}>
                                    🗺️ Peta Operasi & Kebencanaan Kodaeral 3
                                </h3>
                                <button 
                                    onClick={() => setShowDisaster(!showDisaster)}
                                    style={{
                                        padding: '8px 16px', background: showDisaster ? '#fee2e2' : '#dcfce7', color: showDisaster ? '#dc2626' : '#16a34a', border: `1px solid ${showDisaster ? '#fca5a5' : '#86efac'}`, borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', width: 'fit-content', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <span style={{ fontSize: '18px' }}>{showDisaster ? '👁️' : '👁️‍🗨️'}</span> 
                                    {showDisaster ? 'Sembunyikan Label Bencana' : 'Tampilkan Label Bencana'}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div style={{ flex: 1, position: 'relative', minHeight: '500px' }}>
                        <PetaFaslan isDashboard={true} showDisaster={showDisaster} />
                    </div>
                </div>
            </div>

            {/* ROW 2 & 3: Detail Breakdown & Quick Actions */}
            <div style={{ gridColumn: '2 / 3', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Deskripsi Kejadian (Activity Feed) */}
                <div className="card" style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#1e293b', fontWeight: '700' }}>
                        📋 Deskripsi Kejadian
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {incidents.map((inc, i) => (
                            <div key={i} style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', background: inc.jenis === 'Banjir' ? '#fee2e2' : '#fef3c7', color: inc.jenis === 'Banjir' ? '#dc2626' : '#d97706' }}>
                                        {inc.jenis}
                                    </span>
                                    <span style={{ fontSize: '12px', color: '#64748b' }}>{inc.time}</span>
                                </div>
                                {inc.areaText && <div style={{ fontSize: '13px', color: '#0ea5e9', fontWeight: '600', paddingBottom: '4px' }}>📐 {inc.areaText}</div>}
                                <div style={{ fontSize: '13px', color: '#475569', marginBottom: '6px' }}>
                                    💧 Tinggi: <strong>{inc.tinggi} cm</strong> | 👥 Terdampak: <strong>{inc.terdampak} jiwa</strong>
                                </div>
                                <div style={{ fontSize: '13px', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '8px', lineHeight: '1.4' }}>
                                    {inc.keterangan}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detailed Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
            <div className="card" style={{ marginTop: '0' }}>
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

            </div> {/* End of gridColumn 3/4 */}

            {/* ROW 4: Distribusi Material */}
            <div style={{ gridColumn: '1 / 3' }}>
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', background: '#f8fafc' }}>
                        <h3 style={{ margin: '0', fontSize: '1.2rem', color: '#1e293b', fontWeight: '700' }}>📦 Distribusi Logistik & Material</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Pemantauan alokasi aset darurat dan penanggung jawab lapangan</p>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px', whiteSpace: 'nowrap' }}>
                            <thead>
                                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                                    <th style={{ padding: '12px 24px', fontWeight: '600' }}>Material / Item</th>
                                    <th style={{ padding: '12px 24px', fontWeight: '600' }}>Ketersediaan</th>
                                    <th style={{ padding: '12px 24px', fontWeight: '600' }}>Terdistribusi</th>
                                    <th style={{ padding: '12px 24px', fontWeight: '600' }}>Lokasi Distribusi</th>
                                    <th style={{ padding: '12px 24px', fontWeight: '600' }}>Kondisi</th>
                                    <th style={{ padding: '12px 24px', fontWeight: '600' }}>PIC</th>
                                </tr>
                            </thead>
                            <tbody>
                                {distributionData.map((d, i) => {
                                    const pct = Math.round((d.deployed / d.total) * 100)
                                    const pctColor = pct > 80 ? '#dc2626' : pct > 50 ? '#d97706' : '#10b981'
                                    return (
                                        <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ fontSize: '18px' }}>{d.icon}</span> 
                                                <strong style={{ color: '#1e293b' }}>{d.item}</strong>
                                            </td>
                                            <td style={{ padding: '16px 24px', color: '#475569' }}>{d.total} <small>{d.unit}</small></td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    <span style={{ fontWeight: '600', color: '#0ea5e9', fontSize: '13px' }}>{d.deployed} {d.unit} ({pct}%)</span>
                                                    <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', width: '120px' }}>
                                                        <div style={{ height: '100%', width: `${pct}%`, background: pctColor, borderRadius: '4px' }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px', color: '#475569' }}>{d.location}</td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', color: '#475569', fontWeight: '500' }}>{d.kondisi}</span>
                                            </td>
                                            <td style={{ padding: '16px 24px', color: '#475569', fontSize: '13px' }}>{d.pic}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            </div> {/* End of 3x3 Grid Layout */}
        </div>
    )
}

DashboardPimpinan.propTypes = {
    setCurrentPage: PropTypes.func.isRequired
}

export default DashboardPimpinan
