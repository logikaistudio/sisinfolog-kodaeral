import { useState } from 'react'

const DashboardPimpinan = () => {
    // Mock Data Ringkasan
    const stats = [
        { label: 'Total Aset Tanah', value: '128', unit: 'Lokasi', icon: '📍', color: '#0ea5e9' },
        { label: 'Kondisi Dermaga Baik', value: '85%', unit: 'Siap Operasi', icon: '⚓', color: '#10b981' },
        { label: 'Fasilitas Pemeliharaan', value: '12', unit: 'Unit Aktif', icon: '🛠️', color: '#f59e0b' },
        { label: 'Dukungan Logistik', value: '92%', unit: 'Tersedia', icon: '📦', color: '#8b5cf6' }
    ]

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Dashboard Pimpinan</h1>
                <p className="page-subtitle">Ringkasan Eksekutif Data Logistik & Fasilitas Kodaeral</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat, idx) => (
                    <div key={idx} className="stat-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div className="stat-label">{stat.label}</div>
                                <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{stat.unit}</div>
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

            {/* Chart Area Placeholder */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '20px' }}>
                <div className="card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>📊</div>
                    <h3>Grafik Performa Aset</h3>
                    <p>Visualisasi data tren pemeliharaan dan kondisi aset akan ditampilkan di sini.</p>
                </div>

                <div className="card" style={{ minHeight: '400px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#003366' }}>Pemberitahuan Penting</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {[1, 2, 3].map(i => (
                            <li key={i} style={{
                                padding: '10px 0',
                                borderBottom: '1px solid #f1f5f9',
                                display: 'flex',
                                gap: '10px',
                                alignItems: 'center'
                            }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span>
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Laporan Bulanan Faslabuh</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Perlu persetujuan - 2 Jam lalu</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default DashboardPimpinan
