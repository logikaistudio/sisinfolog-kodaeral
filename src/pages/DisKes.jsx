import { useState } from 'react'
import PropTypes from 'prop-types'

function DisKes() {
    const [activeTab, setActiveTab] = useState('fasilitas')

    // Mock Data for Health Facilities
    const [facilities] = useState([
        { id: 1, name: 'Rumah Sakit TNI AL Dr. Mintohardjo', type: 'Rumah Sakit', location: 'Bendungan Hilir', capacity: '300 Bed', staff: 450, status: 'Operasional' },
        { id: 2, name: 'Balai Pengobatan Kodaeral', type: 'Balai Pengobatan', location: 'Kodaeral 3', capacity: '10 Bed', staff: 15, status: 'Operasional' },
        { id: 3, name: 'Poliklinik Gigi', type: 'Klinik Spesialis', location: 'Gedung B', capacity: '5 Kursi', staff: 8, status: 'Renovasi' }
    ])

    // Mock Data for Medical Equipment
    const [equipment] = useState([
        { id: 1, name: 'MRI Scanner 3T', type: 'Diagnostik', location: 'Radiologi', condition: 'Baik', lastMaintenance: '2023-11-15' },
        { id: 2, name: 'Unit Hemodialisa', type: 'Terapi', location: 'Ruang Cuci Darah', condition: 'Baik', lastMaintenance: '2024-01-10' },
        { id: 3, name: 'Ventilator Transport', type: 'Life Support', location: 'IGD', condition: 'Perlu Perbaikan', lastMaintenance: '2023-09-05' },
        { id: 4, name: 'Ambulans VIP', type: 'Transportasi', location: 'Pool Kendaraan', condition: 'Baik', lastMaintenance: '2024-02-01' }
    ])

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Fasilitas Kesehatan (DisKes)</h1>
                <p className="page-subtitle">Manajemen Fasilitas Kesehatan dan Peralatan Medis Kodaeral 3</p>
            </div>

            {/* Stats Overview */}
            <div className="stats-grid" style={{ marginBottom: '24px' }}>
                <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
                    <div className="stat-label">Total Fasilitas</div>
                    <div className="stat-value" style={{ color: '#ef4444' }}>{facilities.length}</div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <div className="stat-label">Total Alkes Utama</div>
                    <div className="stat-value" style={{ color: '#3b82f6' }}>{equipment.length}</div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
                    <div className="stat-label">Tenaga Medis</div>
                    <div className="stat-value" style={{ color: '#10b981' }}>473</div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <div className="stat-label">Pasien Rawat Inap</div>
                    <div className="stat-value" style={{ color: '#f59e0b' }}>185</div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
                <button
                    onClick={() => setActiveTab('fasilitas')}
                    style={{
                        padding: '10px 20px',
                        borderBottom: activeTab === 'fasilitas' ? '2px solid #011F5B' : '2px solid transparent',
                        color: activeTab === 'fasilitas' ? '#011F5B' : '#64748b',
                        fontWeight: activeTab === 'fasilitas' ? '600' : '500',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'fasilitas' ? '2px solid #011F5B' : 'none',
                        cursor: 'pointer'
                    }}
                >
                    Fasilitas Kesehatan
                </button>
                <button
                    onClick={() => setActiveTab('alkes')}
                    style={{
                        padding: '10px 20px',
                        borderBottom: activeTab === 'alkes' ? '2px solid #011F5B' : '2px solid transparent',
                        color: activeTab === 'alkes' ? '#011F5B' : '#64748b',
                        fontWeight: activeTab === 'alkes' ? '600' : '500',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'alkes' ? '2px solid #011F5B' : 'none',
                        cursor: 'pointer'
                    }}
                >
                    Alat Kesehatan & Transportasi
                </button>
            </div>

            {/* Content Area */}
            <div className="card">
                {activeTab === 'fasilitas' ? (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                            <button className="btn btn-primary">Tambah Fasilitas</button>
                        </div>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Nama Fasilitas</th>
                                    <th>Jenis</th>
                                    <th>Lokasi</th>
                                    <th>Kapasitas</th>
                                    <th>Personel</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {facilities.map(item => (
                                    <tr key={item.id}>
                                        <td style={{ fontWeight: '600' }}>{item.name}</td>
                                        <td>{item.type}</td>
                                        <td>{item.location}</td>
                                        <td>{item.capacity}</td>
                                        <td>{item.staff}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                background: item.status === 'Operasional' ? '#dcfce7' : '#fee2e2',
                                                color: item.status === 'Operasional' ? '#166534' : '#991b1b'
                                            }}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-sm btn-outline">Detail</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                            <button className="btn btn-warning" style={{ background: '#f59e0b', borderColor: '#f59e0b', color: 'white' }}>Tambah Alkes</button>
                        </div>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Nama Alat / Kendaraan</th>
                                    <th>Jenis</th>
                                    <th>Lokasi Penempatan</th>
                                    <th>Kondisi</th>
                                    <th>Pemeliharaan Terakhir</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {equipment.map(item => (
                                    <tr key={item.id}>
                                        <td style={{ fontWeight: '600' }}>{item.name}</td>
                                        <td>{item.type}</td>
                                        <td>{item.location}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                background: item.condition === 'Baik' ? '#dcfce7' : '#fef9c3',
                                                color: item.condition === 'Baik' ? '#166534' : '#854d0e'
                                            }}>
                                                {item.condition}
                                            </span>
                                        </td>
                                        <td>{item.lastMaintenance}</td>
                                        <td>
                                            <button className="btn btn-sm btn-outline">Log Perbaikan</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default DisKes
