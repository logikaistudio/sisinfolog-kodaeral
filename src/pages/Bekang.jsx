import { useState } from 'react'

function Bekang() {
    const [supplies] = useState([
        { id: 1, name: 'Bahan Bakar Solar', code: 'BBM-001', category: 'BBM', stock: 15000, unit: 'Liter', lastUpdate: '2026-01-28', status: 'Normal' },
        { id: 2, name: 'Oli Mesin', code: 'OLI-001', category: 'Pelumas', stock: 500, unit: 'Liter', lastUpdate: '2026-01-27', status: 'Normal' },
        { id: 3, name: 'Air Tawar', code: 'AIR-001', category: 'Konsumsi', stock: 8000, unit: 'Liter', lastUpdate: '2026-01-28', status: 'Normal' },
        { id: 4, name: 'Makanan Kering', code: 'MKN-001', category: 'Konsumsi', stock: 250, unit: 'Kg', lastUpdate: '2026-01-26', status: 'Low' },
        { id: 5, name: 'Suku Cadang Mesin', code: 'SPR-001', category: 'Sparepart', stock: 45, unit: 'Unit', lastUpdate: '2026-01-25', status: 'Normal' }
    ])

    const stats = [
        { label: 'Total Item', value: '156', color: 'var(--navy-primary)' },
        { label: 'Stok Normal', value: '142', color: 'var(--success)' },
        { label: 'Stok Rendah', value: '12', color: 'var(--warning)' },
        { label: 'Perlu Restock', value: '2', color: 'var(--error)' }
    ]

    return (
        <div>
            {/* Page Header */}
            <div className="page-header">
                <h1 className="page-title">Bekang - Bekal Angkutan</h1>
                <p className="page-subtitle">Manajemen bekal dan persediaan angkutan Kodaeral 3 Jakarta</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
                        <div className="stat-label">{stat.label}</div>
                        <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mb-lg">
                <div className="flex gap-md">
                    <button className="btn btn-primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Tambah Bekal
                    </button>
                    <button className="btn btn-success">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 11l3 3L22 4" />
                            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                        </svg>
                        Catat Penerimaan
                    </button>
                    <button className="btn btn-outline">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                        </svg>
                        Laporan Stok
                    </button>
                </div>
                <div className="flex gap-sm">
                    <select className="form-select" style={{ width: '150px' }}>
                        <option>Semua Kategori</option>
                        <option>BBM</option>
                        <option>Pelumas</option>
                        <option>Konsumsi</option>
                        <option>Sparepart</option>
                    </select>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Cari bekal..."
                        style={{ width: '200px' }}
                    />
                </div>
            </div>

            {/* Supplies Table */}
            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Kode</th>
                                <th>Nama Bekal</th>
                                <th>Kategori</th>
                                <th>Stok</th>
                                <th>Satuan</th>
                                <th>Update Terakhir</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {supplies.map((supply) => (
                                <tr key={supply.id}>
                                    <td><strong>{supply.code}</strong></td>
                                    <td>{supply.name}</td>
                                    <td>{supply.category}</td>
                                    <td><strong>{supply.stock.toLocaleString()}</strong></td>
                                    <td>{supply.unit}</td>
                                    <td>{supply.lastUpdate}</td>
                                    <td>
                                        <span className={`badge ${supply.status === 'Normal' ? 'badge-success' :
                                                supply.status === 'Low' ? 'badge-warning' :
                                                    'badge-error'
                                            }`}>
                                            {supply.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-sm">
                                            <button className="btn btn-sm btn-outline">Edit</button>
                                            <button className="btn btn-sm btn-secondary">Riwayat</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="mt-xl" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-lg)' }}>
                <div className="card">
                    <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-md)', color: 'var(--navy-primary)' }}>
                        📊 Kategori Terbanyak
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-sm) 0', borderBottom: '1px solid var(--gray-200)' }}>
                            <span>BBM</span>
                            <strong>45 item</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-sm) 0', borderBottom: '1px solid var(--gray-200)' }}>
                            <span>Konsumsi</span>
                            <strong>38 item</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-sm) 0' }}>
                            <span>Sparepart</span>
                            <strong>32 item</strong>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-md)', color: 'var(--navy-primary)' }}>
                        ⚠️ Perlu Perhatian
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                        <div style={{ padding: 'var(--spacing-sm)', background: 'var(--warning-light)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ fontWeight: '600', color: 'var(--warning)' }}>Makanan Kering</div>
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Stok: 250 Kg (Rendah)</div>
                        </div>
                        <div style={{ padding: 'var(--spacing-sm)', background: 'var(--error-light)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ fontWeight: '600', color: 'var(--error)' }}>Filter Udara</div>
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>Stok: 5 Unit (Kritis)</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Bekang
