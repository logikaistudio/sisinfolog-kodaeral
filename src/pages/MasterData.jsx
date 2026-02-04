import { useState, useEffect } from 'react'
import ErrorBoundary from '../components/ErrorBoundary'

function MasterData() {
    const [activeTab, setActiveTab] = useState('categories')

    const [categories, setCategories] = useState([])
    const [locations, setLocations] = useState([])
    const [officers, setOfficers] = useState([])
    const [units, setUnits] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const [catRes, locRes, offRes, unitRes] = await Promise.all([
                    fetch('http://localhost:3001/api/master/categories'),
                    fetch('http://localhost:3001/api/master/locations'),
                    fetch('http://localhost:3001/api/master/officers'),
                    fetch('http://localhost:3001/api/master/units')
                ]);

                if (catRes.ok) setCategories(await catRes.json());
                if (locRes.ok) setLocations(await locRes.json());
                if (offRes.ok) setOfficers(await offRes.json());
                if (unitRes.ok) setUnits(await unitRes.json());
            } catch (err) {
                console.error("Error fetching master data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const tabs = [
        { id: 'categories', label: 'Kategori', icon: '📁' },
        { id: 'locations', label: 'Lokasi', icon: '📍' },
        { id: 'officers', label: 'Petugas', icon: '👤' },
        { id: 'units', label: 'Satuan', icon: '📏' }
    ]

    return (
        <ErrorBoundary>
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
                    {loading ? (
                        <div className="text-center p-4">Loading Master Data...</div>
                    ) : (
                        <>
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
                                                            <td><span className="badge badge-info">{category.item_count || 0} item</span></td>
                                                            <td>
                                                                <div className="flex gap-sm">
                                                                    <button className="btn btn-sm btn-outline">Edit</button>
                                                                    <button className="btn btn-sm btn-secondary">Hapus</button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {categories.length === 0 && <tr><td colSpan="5" className="text-center">Tidak ada data</td></tr>}
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
                                                    {locations.length === 0 && <tr><td colSpan="6" className="text-center">Tidak ada data</td></tr>}
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
                                                    {officers.length === 0 && <tr><td colSpan="5" className="text-center">Tidak ada data</td></tr>}
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
                                                    {units.length === 0 && <tr><td colSpan="4" className="text-center">Tidak ada data</td></tr>}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
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
        </ErrorBoundary>
    )
}

export default MasterData
