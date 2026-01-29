import { useState } from 'react'

function Harpan() {
    const [assets] = useState([
        { id: 1, type: 'KRI', code: '359', name: 'KRI Usman Harun', category: 'Korvet', status: 'Siap Operasi', condition: 'Baik', location: 'Dermaga A' },
        { id: 2, type: 'KRI', code: '502', name: 'KRI Teluk Penyu', category: 'LST', status: 'Docking', condition: 'Perbaikan Rutin', location: 'Docking Surabaya' },
        { id: 3, type: 'KAL', code: 'KAL-01', name: 'KAL Cobra', category: 'Patroli', status: 'Siap Operasi', condition: 'Baik', location: 'Dermaga B' },
        { id: 4, type: 'KAL', code: 'KAL-02', name: 'KAL Viper', category: 'Patroli', status: 'Perbaikan', condition: 'Rusak Ringan', location: 'Dermaga B' },
        { id: 5, type: 'KAMLA', code: 'P-001', name: 'Patkamla Bali', category: 'Patkamla', status: 'Siap Operasi', condition: 'Baik', location: 'Posal A' },
        { id: 6, type: 'Ranops', code: '9001-03', name: 'Truk Reo Isuzu', category: 'Angkut Personel', status: 'Siap Operasi', condition: 'Baik', location: 'Garasi Utama' },
        { id: 7, type: 'Ranops', code: '9002-03', name: 'Ambulance Ford', category: 'Medis', status: 'Siaga', condition: 'Baik', location: 'Rumkital' },
        { id: 8, type: 'Ranops', code: '9003-03', name: 'Ford Ranger Kawal', category: 'Pengawalan', status: 'Perbaikan', condition: 'Rusak Berat', location: 'Bengkel Pusat' },
    ])

    // Calculate stats
    const stats = [
        { label: 'Total KRI', value: assets.filter(a => a.type === 'KRI').length, color: 'var(--navy-primary)' },
        { label: 'Total KAL', value: assets.filter(a => a.type === 'KAL').length, color: 'var(--navy-accent)' },
        { label: 'Total KAMLA', value: assets.filter(a => a.type === 'KAMLA').length, color: 'var(--info)' },
        { label: 'Kendaraan Ops', value: assets.filter(a => a.type === 'Ranops').length, color: 'var(--warning)' }
    ]

    return (
        <div>
            {/* Page Header */}
            <div className="page-header">
                <h1 className="page-title">Harpan - Data Aset Alutsista & Ranops</h1>
                <p className="page-subtitle">Manajemen data aset KRI, KAL, KAMLA, dan Kendaraan Operasional</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
                        <div className="stat-label">{stat.label}</div>
                        <div className="stat-value" style={{ color: stat.color }}>
                            {stat.value} Unit
                        </div>
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
                        Tambah Aset
                    </button>
                    <button className="btn btn-outline">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                        </svg>
                        Export Data
                    </button>
                </div>
                <div className="flex gap-sm">
                    <select className="form-select" style={{ width: '150px' }}>
                        <option value="">Semua Jenis</option>
                        <option value="KRI">KRI</option>
                        <option value="KAL">KAL</option>
                        <option value="KAMLA">KAMLA</option>
                        <option value="Ranops">Ranops</option>
                    </select>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Cari aset..."
                        style={{ width: '200px' }}
                    />
                </div>
            </div>

            {/* Assets Table */}
            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Jenis</th>
                                <th>No. Lambung / Plat</th>
                                <th>Nama Aset</th>
                                <th>Kategori</th>
                                <th>Status</th>
                                <th>Kondisi</th>
                                <th>Lokasi</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assets.map((asset) => (
                                <tr key={asset.id}>
                                    <td>
                                        <span className="badge" style={{
                                            background: 'var(--gray-200)',
                                            color: 'var(--gray-800)',
                                            fontWeight: '700'
                                        }}>
                                            {asset.type}
                                        </span>
                                    </td>
                                    <td><strong>{asset.code}</strong></td>
                                    <td>{asset.name}</td>
                                    <td>{asset.category}</td>
                                    <td>
                                        <span className={`badge ${asset.status === 'Siap Operasi' || asset.status === 'Siaga' ? 'badge-success' :
                                                asset.status === 'Docking' || asset.status === 'Perbaikan' ? 'badge-warning' :
                                                    'badge-info'
                                            }`}>
                                            {asset.status}
                                        </span>
                                    </td>
                                    <td>{asset.condition}</td>
                                    <td>{asset.location}</td>
                                    <td>
                                        <div className="flex gap-sm">
                                            <button className="btn btn-sm btn-outline">Edit</button>
                                            <button className="btn btn-sm btn-secondary">Detail</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Harpan
