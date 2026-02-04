import { useState, useEffect } from 'react';
import AssetSelector from '../components/AssetSelector';

/**
 * Contoh Implementasi: Link Asset BMN ke Faslan
 * Halaman untuk menambahkan/edit data Faslan dengan link ke Master Asset BMN
 */
function FaslanAssetLink() {
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [faslanData, setFaslanData] = useState({
        jenis_faslan: '',
        nomor_lambung: '',
        tahun_pembuatan: '',
        negara_pembuat: '',
        status_operasional: 'Operasional',
        lokasi_penyimpanan: '',
        koordinat_lat: '',
        koordinat_lng: '',
        komandan_nama: '',
        komandan_pangkat: '',
        komandan_nrp: '',
        jumlah_abk: ''
    });
    const [saving, setSaving] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFaslanData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedAsset) {
            alert('Silakan pilih Asset BMN terlebih dahulu');
            return;
        }

        setSaving(true);

        try {
            const payload = {
                kode_asset: selectedAsset.code,
                bmn_id: selectedAsset.id,
                ...faslanData
            };

            const response = await fetch('http://localhost:3001/api/faslan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('✅ Data Faslan berhasil ditambahkan dan di-link ke Asset BMN!');
                // Reset form
                setSelectedAsset(null);
                setFaslanData({
                    jenis_faslan: '',
                    nomor_lambung: '',
                    tahun_pembuatan: '',
                    negara_pembuat: '',
                    status_operasional: 'Operasional',
                    lokasi_penyimpanan: '',
                    koordinat_lat: '',
                    koordinat_lng: '',
                    komandan_nama: '',
                    komandan_pangkat: '',
                    komandan_nrp: '',
                    jumlah_abk: ''
                });
            } else {
                const error = await response.json();
                alert(`❌ Gagal menyimpan: ${error.message}`);
            }
        } catch (error) {
            console.error('Error saving faslan:', error);
            alert('❌ Terjadi kesalahan saat menyimpan data');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Link Asset BMN ke Faslan</h1>
                <p className="page-subtitle">Hubungkan Master Asset BMN dengan data Fasilitas Angkutan Laut</p>
            </div>

            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <form onSubmit={handleSubmit}>
                    {/* Asset Selector */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontWeight: '600',
                            color: '#1e293b'
                        }}>
                            Pilih Asset BMN <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <AssetSelector
                            onSelect={setSelectedAsset}
                            selectedAsset={selectedAsset}
                            filter={{ category: 'Tanah,Bangunan' }} // Filter hanya Tanah & Bangunan
                            placeholder="Cari asset berdasarkan kode, nama, atau NUP..."
                        />
                    </div>

                    {/* Faslan Specific Fields */}
                    {selectedAsset && (
                        <div style={{
                            padding: '20px',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            marginBottom: '24px'
                        }}>
                            <h3 style={{
                                fontSize: '1rem',
                                fontWeight: '600',
                                marginBottom: '16px',
                                color: '#003366'
                            }}>
                                Data Faslan
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {/* Jenis Faslan */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
                                        Jenis Faslan <span style={{ color: '#dc2626' }}>*</span>
                                    </label>
                                    <select
                                        name="jenis_faslan"
                                        value={faslanData.jenis_faslan}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '6px',
                                            fontSize: '0.95rem'
                                        }}
                                    >
                                        <option value="">Pilih Jenis</option>
                                        <option value="KRI">KRI (Kapal Republik Indonesia)</option>
                                        <option value="KAL">KAL (Kapal Angkutan Laut)</option>
                                        <option value="KAMLA">KAMLA (Kapal Keamanan Laut)</option>
                                        <option value="Dermaga">Dermaga</option>
                                        <option value="Gudang">Gudang</option>
                                        <option value="Bengkel">Bengkel</option>
                                    </select>
                                </div>

                                {/* Nomor Lambung */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
                                        Nomor Lambung
                                    </label>
                                    <input
                                        type="text"
                                        name="nomor_lambung"
                                        value={faslanData.nomor_lambung}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: 123"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '6px',
                                            fontSize: '0.95rem'
                                        }}
                                    />
                                </div>

                                {/* Tahun Pembuatan */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
                                        Tahun Pembuatan
                                    </label>
                                    <input
                                        type="number"
                                        name="tahun_pembuatan"
                                        value={faslanData.tahun_pembuatan}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: 2015"
                                        min="1900"
                                        max={new Date().getFullYear()}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '6px',
                                            fontSize: '0.95rem'
                                        }}
                                    />
                                </div>

                                {/* Negara Pembuat */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
                                        Negara Pembuat
                                    </label>
                                    <input
                                        type="text"
                                        name="negara_pembuat"
                                        value={faslanData.negara_pembuat}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: Indonesia"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '6px',
                                            fontSize: '0.95rem'
                                        }}
                                    />
                                </div>

                                {/* Status Operasional */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
                                        Status Operasional <span style={{ color: '#dc2626' }}>*</span>
                                    </label>
                                    <select
                                        name="status_operasional"
                                        value={faslanData.status_operasional}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '6px',
                                            fontSize: '0.95rem'
                                        }}
                                    >
                                        <option value="Operasional">Operasional</option>
                                        <option value="Standby">Standby</option>
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Rusak">Rusak</option>
                                    </select>
                                </div>

                                {/* Lokasi Penyimpanan */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
                                        Lokasi Penyimpanan
                                    </label>
                                    <input
                                        type="text"
                                        name="lokasi_penyimpanan"
                                        value={faslanData.lokasi_penyimpanan}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: Dermaga A"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '6px',
                                            fontSize: '0.95rem'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Komandan Section */}
                            <h4 style={{
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                marginTop: '20px',
                                marginBottom: '12px',
                                color: '#475569'
                            }}>
                                Data Komandan/PIC
                            </h4>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                {/* Komandan Nama */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
                                        Nama Komandan
                                    </label>
                                    <input
                                        type="text"
                                        name="komandan_nama"
                                        value={faslanData.komandan_nama}
                                        onChange={handleInputChange}
                                        placeholder="Nama lengkap"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '6px',
                                            fontSize: '0.95rem'
                                        }}
                                    />
                                </div>

                                {/* Pangkat */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
                                        Pangkat
                                    </label>
                                    <input
                                        type="text"
                                        name="komandan_pangkat"
                                        value={faslanData.komandan_pangkat}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: Mayor"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '6px',
                                            fontSize: '0.95rem'
                                        }}
                                    />
                                </div>

                                {/* NRP */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
                                        NRP
                                    </label>
                                    <input
                                        type="text"
                                        name="komandan_nrp"
                                        value={faslanData.komandan_nrp}
                                        onChange={handleInputChange}
                                        placeholder="Nomor NRP"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '6px',
                                            fontSize: '0.95rem'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    {selectedAsset && (
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedAsset(null);
                                    setFaslanData({
                                        jenis_faslan: '',
                                        nomor_lambung: '',
                                        tahun_pembuatan: '',
                                        negara_pembuat: '',
                                        status_operasional: 'Operasional',
                                        lokasi_penyimpanan: '',
                                        koordinat_lat: '',
                                        koordinat_lng: '',
                                        komandan_nama: '',
                                        komandan_pangkat: '',
                                        komandan_nrp: '',
                                        jumlah_abk: ''
                                    });
                                }}
                                className="btn btn-outline"
                                disabled={saving}
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={saving}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                {saving ? (
                                    <>
                                        <span className="spinner" style={{
                                            width: '14px',
                                            height: '14px',
                                            border: '2px solid white',
                                            borderTopColor: 'transparent',
                                            borderRadius: '50%',
                                            display: 'inline-block',
                                            animation: 'spin 0.8s linear infinite'
                                        }}></span>
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>💾 Simpan Data Faslan</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </form>
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default FaslanAssetLink;
