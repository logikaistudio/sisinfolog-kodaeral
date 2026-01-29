import { useState } from 'react'

function MasterData() {
    const [activeTab, setActiveTab] = useState('categories')

    const categories = [
        { id: 1, code: 'CNT', name: 'Container', description: 'Kontainer pengangkutan', items: 15 },
        { id: 2, code: 'BBM', name: 'Bahan Bakar', description: 'Bahan bakar dan pelumas', items: 8 },
        { id: 3, code: 'ALB', name: 'Alat Berat', description: 'Peralatan berat operasional', items: 12 },
        { id: 4, code: 'KSM', name: 'Konsumsi', description: 'Bahan konsumsi dan makanan', items: 45 }
    ]

    const locations = [
        { id: 1, code: 'GDA', name: 'Gudang A', type: 'Gudang', capacity: '500 m²', status: 'Aktif' },
        { id: 2, code: 'GDB', name: 'Gudang B', type: 'Gudang', capacity: '350 m²', status: 'Aktif' },
        { id: 3, code: 'AOP', name: 'Area Operasi', type: 'Lapangan', capacity: '1000 m²', status: 'Aktif' },
        { id: 4, code: 'WKS', name: 'Workshop', type: 'Workshop', capacity: '200 m²', status: 'Aktif' }
    ]

    const officers = [
        { id: 1, nrp: '11950234', name: 'Letda Budi Santoso', position: 'Kepala Gudang', phone: '081234567890' },
        { id: 2, nrp: '11960145', name: 'Letda Andi Wijaya', position: 'Supervisor Logistik', phone: '081234567891' },
        { id: 3, nrp: '11970089', name: 'Lettu Rudi Hartono', position: 'Petugas Lapangan', phone: '081234567892' },
        { id: 4, nrp: '11980123', name: 'Serda Ahmad Yani', position: 'Admin Bekal', phone: '081234567893' }
    ]

    const units = [
        { id: 1, code: 'KG', name: 'Kilogram', type: 'Berat' },
        { id: 2, code: 'LTR', name: 'Liter', type: 'Volume' },
        { id: 3, code: 'UNIT', name: 'Unit', type: 'Satuan' },
        { id: 4, code: 'M3', name: 'Meter Kubik', type: 'Volume' }
    ]

    const tabs = [
        { id: 'categories', label: 'Kategori', icon: '📁' },
        { id: 'locations', label: 'Lokasi', icon: '📍' },
        { id: 'officers', label: 'Petugas', icon: '👤' },
        { id: 'units', label: 'Satuan', icon: '📏' }
    ]

    return (
        <div>
            {/* Page Header */}
            <div className="page-header">
                <h1 className="page-title">Master Data</h1>
                <p className="page-subtitle">Kelola data master sistem informasi logistik</p>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: 'var(--spacing-sm)',
                marginBottom: 'var(--spacing-xl)',
                borderBottom: '2px solid var(--gray-200)',
                overflowX: 'auto'
            }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: 'var(--spacing-md) var(--spacing-lg)',
                            background: activeTab === tab.id ? 'var(--navy-primary)' : 'transparent',
                            color: activeTab === tab.id ? 'var(--white)' : 'var(--gray-600)',
                            border: 'none',
                            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                            cursor: 'pointer',
                            fontWeight: activeTab === tab.id ? '600' : '400',
                            fontSize: 'var(--font-size-sm)',
                            transition: 'all var(--transition-fast)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="fade-in">
                {/* Categories Tab */}
                {activeTab === 'categories' && (
                    <div>
                        <div className="flex justify-between items-center mb-lg">
                            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '600', color: 'var(--navy-primary)' }}>
                                Kategori Aset & Bekal
                            </h2>
                            <button className="btn btn-primary">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 5v14M5 12h14" />
                                </svg>
                                Tambah Kategori
                            </button>
                        </div>
                        <div className="card">
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Kode</th>
                                            <th>Nama Kategori</th>
                                            <th>Deskripsi</th>
                                            <th>Jumlah Item</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.map((category) => (
                                            <tr key={category.id}>
                                                <td><strong>{category.code}</strong></td>
                                                <td>{category.name}</td>
                                                <td>{category.description}</td>
                                                <td><span className="badge badge-info">{category.items} item</span></td>
                                                <td>
                                                    <div className="flex gap-sm">
                                                        <button className="btn btn-sm btn-outline">Edit</button>
                                                        <button className="btn btn-sm btn-secondary">Hapus</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Locations Tab */}
                {activeTab === 'locations' && (
                    <div>
                        <div className="flex justify-between items-center mb-lg">
                            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '600', color: 'var(--navy-primary)' }}>
                                Lokasi Penyimpanan
                            </h2>
                            <button className="btn btn-primary">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 5v14M5 12h14" />
                                </svg>
                                Tambah Lokasi
                            </button>
                        </div>
                        <div className="card">
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Kode</th>
                                            <th>Nama Lokasi</th>
                                            <th>Tipe</th>
                                            <th>Kapasitas</th>
                                            <th>Status</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {locations.map((location) => (
                                            <tr key={location.id}>
                                                <td><strong>{location.code}</strong></td>
                                                <td>{location.name}</td>
                                                <td>{location.type}</td>
                                                <td>{location.capacity}</td>
                                                <td><span className="badge badge-success">{location.status}</span></td>
                                                <td>
                                                    <div className="flex gap-sm">
                                                        <button className="btn btn-sm btn-outline">Edit</button>
                                                        <button className="btn btn-sm btn-secondary">Hapus</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Officers Tab */}
                {activeTab === 'officers' && (
                    <div>
                        <div className="flex justify-between items-center mb-lg">
                            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '600', color: 'var(--navy-primary)' }}>
                                Data Petugas
                            </h2>
                            <button className="btn btn-primary">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 5v14M5 12h14" />
                                </svg>
                                Tambah Petugas
                            </button>
                        </div>
                        <div className="card">
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>NRP</th>
                                            <th>Nama</th>
                                            <th>Jabatan</th>
                                            <th>Telepon</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {officers.map((officer) => (
                                            <tr key={officer.id}>
                                                <td><strong>{officer.nrp}</strong></td>
                                                <td>{officer.name}</td>
                                                <td>{officer.position}</td>
                                                <td>{officer.phone}</td>
                                                <td>
                                                    <div className="flex gap-sm">
                                                        <button className="btn btn-sm btn-outline">Edit</button>
                                                        <button className="btn btn-sm btn-secondary">Hapus</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Units Tab */}
                {activeTab === 'units' && (
                    <div>
                        <div className="flex justify-between items-center mb-lg">
                            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '600', color: 'var(--navy-primary)' }}>
                                Satuan Pengukuran
                            </h2>
                            <button className="btn btn-primary">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 5v14M5 12h14" />
                                </svg>
                                Tambah Satuan
                            </button>
                        </div>
                        <div className="card">
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Kode</th>
                                            <th>Nama Satuan</th>
                                            <th>Tipe</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {units.map((unit) => (
                                            <tr key={unit.id}>
                                                <td><strong>{unit.code}</strong></td>
                                                <td>{unit.name}</td>
                                                <td><span className="badge badge-info">{unit.type}</span></td>
                                                <td>
                                                    <div className="flex gap-sm">
                                                        <button className="btn btn-sm btn-outline">Edit</button>
                                                        <button className="btn btn-sm btn-secondary">Hapus</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Info Cards */}
            <div className="mt-xl" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-lg)' }}>
                <div className="card" style={{ background: 'linear-gradient(135deg, var(--navy-primary) 0%, var(--navy-dark) 100%)', color: 'var(--white)' }}>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-md)', color: 'var(--white)' }}>
                        💡 Tips
                    </h3>
                    <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: '1.6', margin: 0, opacity: 0.9 }}>
                        Pastikan semua data master selalu terbarui untuk memudahkan proses pencatatan dan pelaporan logistik.
                    </p>
                </div>

                <div className="card" style={{ borderLeft: '4px solid var(--info)' }}>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-md)', color: 'var(--navy-primary)' }}>
                        📊 Statistik
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 'var(--font-size-sm)' }}>Total Kategori</span>
                            <strong>{categories.length}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 'var(--font-size-sm)' }}>Total Lokasi</span>
                            <strong>{locations.length}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 'var(--font-size-sm)' }}>Total Petugas</span>
                            <strong>{officers.length}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MasterData
