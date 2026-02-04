import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Asset Detail Page
 * Menampilkan detail lengkap Master Asset BMN beserta semua relasi
 * (Faslan, Fasharpan, DisBek, DisAng, Kerjasama, Peta)
 */
function AssetDetail({ kodeAsset, onBack }) {
    const [asset, setAsset] = useState(null);
    const [relations, setRelations] = useState({
        faslan: [],
        maintenance: [],
        inventory: [],
        vehicles: [],
        partnerships: [],
        locations: []
    });
    const [activeTab, setActiveTab] = useState('info');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (kodeAsset) {
            fetchAssetDetail();
        }
    }, [kodeAsset]);

    const fetchAssetDetail = async () => {
        setLoading(true);
        try {
            // Fetch asset detail
            const assetResponse = await fetch(`http://localhost:3001/api/assets/tanah/${kodeAsset}`);
            const assetData = await assetResponse.json();
            setAsset(assetData);

            // Fetch all relations
            const [faslan, maintenance, inventory, vehicles, partnerships, locations] = await Promise.all([
                fetch(`http://localhost:3001/api/faslan?kode_asset=${kodeAsset}`).then(r => r.json()),
                fetch(`http://localhost:3001/api/fasharpan/maintenance?kode_asset=${kodeAsset}`).then(r => r.json()),
                fetch(`http://localhost:3001/api/disbek/inventory?kode_asset=${kodeAsset}`).then(r => r.json()),
                fetch(`http://localhost:3001/api/disang/vehicles?kode_asset=${kodeAsset}`).then(r => r.json()),
                fetch(`http://localhost:3001/api/kerjasama?kode_asset=${kodeAsset}`).then(r => r.json()),
                fetch(`http://localhost:3001/api/peta-faslan/locations?kode_asset=${kodeAsset}`).then(r => r.json())
            ]);

            setRelations({
                faslan,
                maintenance,
                inventory,
                vehicles,
                partnerships,
                locations
            });
        } catch (error) {
            console.error('Error fetching asset detail:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        if (!value) return '-';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            'Baik': '#10b981',
            'Rusak Ringan': '#f59e0b',
            'Rusak Berat': '#ef4444',
            'Operasional': '#10b981',
            'Standby': '#3b82f6',
            'Maintenance': '#f59e0b',
            'Rusak': '#ef4444',
            'Active': '#10b981',
            'Expired': '#ef4444',
            'Completed': '#10b981',
            'In Progress': '#3b82f6',
            'Scheduled': '#94a3b8'
        };

        return (
            <span style={{
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: '600',
                background: `${statusColors[status] || '#94a3b8'}20`,
                color: statusColors[status] || '#64748b'
            }}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="fade-in" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                <p style={{ color: '#64748b' }}>Loading asset detail...</p>
            </div>
        );
    }

    if (!asset) {
        return (
            <div className="fade-in" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
                <h3 style={{ color: '#64748b', marginBottom: '16px' }}>Asset Tidak Ditemukan</h3>
                <button onClick={onBack} className="btn btn-primary">
                    ← Kembali ke Master Asset
                </button>
            </div>
        );
    }

    return (
        <div className="fade-in">
            {/* Header */}
            <div className="page-header" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <button
                        onClick={onBack}
                        style={{
                            padding: '8px 12px',
                            background: 'white',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        ← Kembali
                    </button>
                    <h1 className="page-title" style={{ margin: 0 }}>Detail Asset BMN</h1>
                </div>
                <p className="page-subtitle">{asset.code} - {asset.name}</p>
            </div>

            {/* Summary Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
            }}>
                <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏢</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>Jenis BMN</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#003366' }}>
                        {asset.jenis_bmn || asset.category || '-'}
                    </div>
                </div>

                <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📋</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>NUP</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#003366' }}>
                        {asset.nup || '-'}
                    </div>
                </div>

                <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💰</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>Nilai Perolehan</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#10b981' }}>
                        {formatCurrency(asset.nilai_perolehan)}
                    </div>
                </div>

                <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📏</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>Luas Tanah</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#003366' }}>
                        {asset.luas_tanah || asset.luas || '-'} m²
                    </div>
                </div>

                <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>Kondisi</div>
                    <div style={{ marginTop: '8px' }}>
                        {getStatusBadge(asset.kondisi || asset.status || 'N/A')}
                    </div>
                </div>

                <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📅</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>Tanggal Perolehan</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#003366' }}>
                        {formatDate(asset.tanggal_perolehan)}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="card" style={{ padding: 0 }}>
                {/* Tab Headers */}
                <div style={{
                    display: 'flex',
                    borderBottom: '2px solid #e2e8f0',
                    overflowX: 'auto',
                    background: '#f8fafc'
                }}>
                    {[
                        { id: 'info', label: '📋 Informasi BMN', count: null },
                        { id: 'sertifikat', label: '📜 Sertifikat & Dokumen', count: null },
                        { id: 'lokasi', label: '📍 Lokasi', count: null },
                        { id: 'faslan', label: '🚢 Faslan', count: relations.faslan.length },
                        { id: 'maintenance', label: '🔧 Maintenance', count: relations.maintenance.length },
                        { id: 'inventory', label: '📦 Inventory', count: relations.inventory.length },
                        { id: 'vehicles', label: '🚗 Kendaraan', count: relations.vehicles.length },
                        { id: 'kerjasama', label: '🤝 Kerjasama', count: relations.partnerships.length }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '16px 24px',
                                border: 'none',
                                background: activeTab === tab.id ? 'white' : 'transparent',
                                borderBottom: activeTab === tab.id ? '3px solid #003366' : '3px solid transparent',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: activeTab === tab.id ? '600' : '400',
                                color: activeTab === tab.id ? '#003366' : '#64748b',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {tab.label}
                            {tab.count !== null && tab.count > 0 && (
                                <span style={{
                                    background: '#003366',
                                    color: 'white',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600'
                                }}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div style={{ padding: '24px' }}>
                    {/* Informasi BMN */}
                    {activeTab === 'info' && (
                        <InfoBMNTab asset={asset} formatCurrency={formatCurrency} formatDate={formatDate} />
                    )}

                    {/* Sertifikat & Dokumen */}
                    {activeTab === 'sertifikat' && (
                        <SertifikatTab asset={asset} formatDate={formatDate} />
                    )}

                    {/* Lokasi */}
                    {activeTab === 'lokasi' && (
                        <LokasiTab asset={asset} locations={relations.locations} />
                    )}

                    {/* Faslan */}
                    {activeTab === 'faslan' && (
                        <FaslanTab faslan={relations.faslan} />
                    )}

                    {/* Maintenance */}
                    {activeTab === 'maintenance' && (
                        <MaintenanceTab maintenance={relations.maintenance} formatCurrency={formatCurrency} formatDate={formatDate} getStatusBadge={getStatusBadge} />
                    )}

                    {/* Inventory */}
                    {activeTab === 'inventory' && (
                        <InventoryTab inventory={relations.inventory} formatCurrency={formatCurrency} />
                    )}

                    {/* Vehicles */}
                    {activeTab === 'vehicles' && (
                        <VehiclesTab vehicles={relations.vehicles} getStatusBadge={getStatusBadge} />
                    )}

                    {/* Kerjasama */}
                    {activeTab === 'kerjasama' && (
                        <KerjasamaTab partnerships={relations.partnerships} formatCurrency={formatCurrency} formatDate={formatDate} getStatusBadge={getStatusBadge} />
                    )}
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// TAB COMPONENTS
// ============================================================================

function InfoBMNTab({ asset, formatCurrency, formatDate }) {
    const InfoRow = ({ label, value }) => (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            padding: '12px 0',
            borderBottom: '1px solid #e2e8f0'
        }}>
            <div style={{ fontWeight: '600', color: '#475569' }}>{label}</div>
            <div style={{ color: '#1e293b' }}>{value || '-'}</div>
        </div>
    );

    return (
        <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '20px', color: '#003366' }}>
                Informasi Lengkap BMN
            </h3>
            <InfoRow label="Kode Asset" value={asset.code} />
            <InfoRow label="NUP" value={asset.nup} />
            <InfoRow label="Nama Asset" value={asset.name} />
            <InfoRow label="Jenis BMN" value={asset.jenis_bmn || asset.category} />
            <InfoRow label="Kondisi" value={asset.kondisi || asset.status} />
            <InfoRow label="Tanggal Perolehan" value={formatDate(asset.tanggal_perolehan)} />
            <InfoRow label="Nilai Perolehan" value={formatCurrency(asset.nilai_perolehan)} />
            <InfoRow label="Luas Tanah" value={asset.luas_tanah ? `${asset.luas_tanah} m²` : '-'} />
            <InfoRow label="Keterangan" value={asset.keterangan} />
        </div>
    );
}

InfoBMNTab.propTypes = {
    asset: PropTypes.object.isRequired,
    formatCurrency: PropTypes.func.isRequired,
    formatDate: PropTypes.func.isRequired
};

function SertifikatTab({ asset, formatDate }) {
    const InfoRow = ({ label, value }) => (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            padding: '12px 0',
            borderBottom: '1px solid #e2e8f0'
        }}>
            <div style={{ fontWeight: '600', color: '#475569' }}>{label}</div>
            <div style={{ color: '#1e293b' }}>{value || '-'}</div>
        </div>
    );

    return (
        <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '20px', color: '#003366' }}>
                Sertifikat & Dokumen Legal
            </h3>
            <InfoRow label="No. Sertifikat" value={asset.no_sertifikat} />
            <InfoRow label="No. PSP" value={asset.no_psp} />
            <InfoRow label="Tanggal PSP" value={formatDate(asset.tanggal_psp)} />

            {!asset.no_sertifikat && !asset.no_psp && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
                    <p>Belum ada data sertifikat atau dokumen legal</p>
                </div>
            )}
        </div>
    );
}

SertifikatTab.propTypes = {
    asset: PropTypes.object.isRequired,
    formatDate: PropTypes.func.isRequired
};

function LokasiTab({ asset, locations }) {
    const InfoRow = ({ label, value }) => (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            padding: '12px 0',
            borderBottom: '1px solid #e2e8f0'
        }}>
            <div style={{ fontWeight: '600', color: '#475569' }}>{label}</div>
            <div style={{ color: '#1e293b' }}>{value || '-'}</div>
        </div>
    );

    return (
        <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '20px', color: '#003366' }}>
                Informasi Lokasi
            </h3>
            <InfoRow label="Alamat" value={asset.alamat || asset.location} />
            <InfoRow label="RT/RW" value={asset.rt_rw} />
            <InfoRow label="Desa/Kelurahan" value={asset.desa_kelurahan} />
            <InfoRow label="Kecamatan" value={asset.kecamatan} />
            <InfoRow label="Kota/Kabupaten" value={asset.kota_kabupaten} />
            <InfoRow label="Kode Kota" value={asset.kode_kota} />
            <InfoRow label="Provinsi" value={asset.provinsi} />

            {locations && locations.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px', color: '#475569' }}>
                        Koordinat Peta
                    </h4>
                    {locations.map((loc, idx) => (
                        <div key={idx} style={{
                            padding: '12px',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            marginBottom: '8px'
                        }}>
                            <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
                                <strong>Area:</strong> {loc.area_name || 'N/A'}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                Lat: {loc.koordinat_lat}, Lng: {loc.koordinat_lng}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

LokasiTab.propTypes = {
    asset: PropTypes.object.isRequired,
    locations: PropTypes.array.isRequired
};

function FaslanTab({ faslan }) {
    if (faslan.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚢</div>
                <p>Belum ada data Faslan terkait asset ini</p>
            </div>
        );
    }

    return (
        <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '20px', color: '#003366' }}>
                Fasilitas Angkutan Laut ({faslan.length})
            </h3>
            <div style={{ display: 'grid', gap: '16px' }}>
                {faslan.map((item, idx) => (
                    <div key={idx} className="card" style={{ padding: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Jenis Faslan</div>
                                <div style={{ fontWeight: '600' }}>{item.jenis_faslan}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Nomor Lambung</div>
                                <div style={{ fontWeight: '600' }}>{item.nomor_lambung || '-'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Status</div>
                                <div>{item.status_operasional}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Lokasi</div>
                                <div>{item.lokasi_penyimpanan || '-'}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

FaslanTab.propTypes = {
    faslan: PropTypes.array.isRequired
};

function MaintenanceTab({ maintenance, formatCurrency, formatDate, getStatusBadge }) {
    if (maintenance.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔧</div>
                <p>Belum ada riwayat maintenance</p>
            </div>
        );
    }

    return (
        <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '20px', color: '#003366' }}>
                Riwayat Maintenance ({maintenance.length})
            </h3>
            <div style={{ display: 'grid', gap: '16px' }}>
                {maintenance.map((item, idx) => (
                    <div key={idx} className="card" style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '4px' }}>
                                    {item.jenis_maintenance}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                    {formatDate(item.tanggal_maintenance)}
                                </div>
                            </div>
                            {getStatusBadge(item.status)}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '8px' }}>
                            {item.deskripsi}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                            Biaya: {formatCurrency(item.biaya)} • Teknisi: {item.teknisi_nama || '-'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

MaintenanceTab.propTypes = {
    maintenance: PropTypes.array.isRequired,
    formatCurrency: PropTypes.func.isRequired,
    formatDate: PropTypes.func.isRequired,
    getStatusBadge: PropTypes.func.isRequired
};

function InventoryTab({ inventory, formatCurrency }) {
    if (inventory.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
                <p>Belum ada data inventory</p>
            </div>
        );
    }

    return (
        <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '20px', color: '#003366' }}>
                Inventory ({inventory.length})
            </h3>
            <div style={{ overflowX: 'auto' }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Kategori</th>
                            <th>Satuan</th>
                            <th>Stok</th>
                            <th>Min/Max</th>
                            <th>Harga Satuan</th>
                            <th>Total Nilai</th>
                            <th>Lokasi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventory.map((item, idx) => (
                            <tr key={idx}>
                                <td>{item.kategori}</td>
                                <td>{item.satuan}</td>
                                <td style={{ fontWeight: '600' }}>{item.stok_saat_ini}</td>
                                <td>{item.stok_minimum} / {item.stok_maksimum}</td>
                                <td>{formatCurrency(item.harga_satuan)}</td>
                                <td style={{ fontWeight: '600', color: '#10b981' }}>
                                    {formatCurrency(item.total_nilai)}
                                </td>
                                <td>{item.lokasi_gudang}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

InventoryTab.propTypes = {
    inventory: PropTypes.array.isRequired,
    formatCurrency: PropTypes.func.isRequired
};

function VehiclesTab({ vehicles, getStatusBadge }) {
    if (vehicles.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚗</div>
                <p>Belum ada data kendaraan</p>
            </div>
        );
    }

    return (
        <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '20px', color: '#003366' }}>
                Kendaraan ({vehicles.length})
            </h3>
            <div style={{ display: 'grid', gap: '16px' }}>
                {vehicles.map((item, idx) => (
                    <div key={idx} className="card" style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '4px' }}>
                                    {item.merk} {item.model} - {item.nomor_polisi}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                    {item.jenis_kendaraan} • Tahun {item.tahun_pembuatan}
                                </div>
                            </div>
                            {getStatusBadge(item.status_kendaraan)}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                            Driver: {item.driver_nama || '-'} • BBM: {item.jenis_bbm || '-'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

VehiclesTab.propTypes = {
    vehicles: PropTypes.array.isRequired,
    getStatusBadge: PropTypes.func.isRequired
};

function KerjasamaTab({ partnerships, formatCurrency, formatDate, getStatusBadge }) {
    if (partnerships.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🤝</div>
                <p>Belum ada data kerjasama</p>
            </div>
        );
    }

    return (
        <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '20px', color: '#003366' }}>
                Kerjasama & Partnership ({partnerships.length})
            </h3>
            <div style={{ display: 'grid', gap: '16px' }}>
                {partnerships.map((item, idx) => (
                    <div key={idx} className="card" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '4px' }}>
                                    {item.mitra_nama}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                    {item.jenis_kerjasama} • {item.nomor_perjanjian}
                                </div>
                            </div>
                            {getStatusBadge(item.status)}
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '12px',
                            marginBottom: '12px'
                        }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Periode</div>
                                <div style={{ fontSize: '0.9rem' }}>
                                    {formatDate(item.tanggal_mulai)} - {formatDate(item.tanggal_selesai)}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Nilai Kerjasama</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#10b981' }}>
                                    {formatCurrency(item.nilai_kerjasama)}
                                </div>
                            </div>
                        </div>

                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                            PIC Internal: {item.pic_internal || '-'} • PIC Mitra: {item.pic_mitra || '-'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

KerjasamaTab.propTypes = {
    partnerships: PropTypes.array.isRequired,
    formatCurrency: PropTypes.func.isRequired,
    formatDate: PropTypes.func.isRequired,
    getStatusBadge: PropTypes.func.isRequired
};

AssetDetail.propTypes = {
    kodeAsset: PropTypes.string.isRequired,
    onBack: PropTypes.func.isRequired
};

export default AssetDetail;
