import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

function Faslan({ type }) {
    const [data, setData] = useState([])
    const [title, setTitle] = useState('')

    const tanahData = [
        { id: 1, name: 'Lahan Dermaga A', code: 'TNH-001', category: 'Tanah Operasional', luas: '5000 m²', status: 'Aktif', location: 'Area Utama' },
        { id: 2, name: 'Lahan Gudang Logistik', code: 'TNH-002', category: 'Tanah Bangunan', luas: '2500 m²', status: 'Aktif', location: 'Sektor B' },
        { id: 3, name: 'Lahan Kosong Sektor C', code: 'TNH-003', category: 'Tanah Cadangan', luas: '1500 m²', status: 'Siap Bangun', location: 'Sektor C' }
    ]

    const bangunanData = [
        { id: 1, name: 'Gedung Markas Komando', code: 'BGN-001', category: 'Perkantoran', luas: '1200 m²', status: 'Baik', location: 'Area Utama' },
        { id: 2, name: 'Gudang Logistik A', code: 'BGN-002', category: 'Gudang', luas: '800 m²', status: 'Baik', location: 'Sektor B' },
        { id: 3, name: 'Pos Penjagaan Utama', code: 'BGN-003', category: 'Pos Jaga', luas: '45 m²', status: 'Perlu Rehab', location: 'Gerbang Depan' },
        { id: 4, name: 'Mess Perwira', code: 'BGN-004', category: 'Hunian', luas: '600 m²', status: 'Baik', location: 'Sektor A' }
    ]

    useEffect(() => {
        if (type === 'tanah') {
            setData(tanahData)
            setTitle('Fasilitas Pangkalan - Aset Tanah')
        } else {
            setData(bangunanData)
            setTitle('Fasilitas Pangkalan - Aset Bangunan')
        }
    }, [type])

    const stats = type === 'tanah' ? [
        { label: 'Total Aset Tanah', value: '3', color: 'var(--navy-primary)' },
        { label: 'Luas Total', value: '9,000 m²', color: 'var(--success)' },
        { label: 'Tanah Operasional', value: '2', color: 'var(--info)' },
        { label: 'Tanah Cadangan', value: '1', color: 'var(--warning)' }
    ] : [
        { label: 'Total Bangunan', value: '4', color: 'var(--navy-primary)' },
        { label: 'Kondisi Baik', value: '3', color: 'var(--success)' },
        { label: 'Perlu Rehab', value: '1', color: 'var(--warning)' },
        { label: 'Rusak Berat', value: '0', color: 'var(--error)' }
    ]

    return (
        <div>
            {/* Page Header */}
            <div className="page-header">
                <h1 className="page-title">{title}</h1>
                <p className="page-subtitle">Manajemen data aset {type} di lingkungan Kodaeral 3 Jakarta</p>
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
                        Tambah {type === 'tanah' ? 'Tanah' : 'Bangunan'}
                    </button>
                    <button className="btn btn-outline">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                        </svg>
                        Export Data
                    </button>
                </div>
                <div className="flex gap-sm">
                    <input
                        type="text"
                        className="form-input"
                        placeholder={`Cari aset ${type}...`}
                        style={{ width: '250px' }}
                    />
                </div>
            </div>

            {/* Assets Table */}
            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Kode</th>
                                <th>Nama Aset</th>
                                <th>Kategori</th>
                                <th>Luas</th>
                                <th>Status</th>
                                <th>Lokasi</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((asset) => (
                                <tr key={asset.id}>
                                    <td><strong>{asset.code}</strong></td>
                                    <td>{asset.name}</td>
                                    <td>{asset.category}</td>
                                    <td>{asset.luas}</td>
                                    <td>
                                        <span className={`badge ${asset.status === 'Aktif' || asset.status === 'Baik' ? 'badge-success' :
                                                asset.status === 'Siap Bangun' ? 'badge-info' :
                                                    'badge-warning'
                                            }`}>
                                            {asset.status}
                                        </span>
                                    </td>
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

Faslan.propTypes = {
    type: PropTypes.string.isRequired
}

export default Faslan
