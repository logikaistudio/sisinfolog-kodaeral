import { useState, useEffect, useMemo } from 'react';

function FastanahAssetUtama() {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);

    const FONT_SYSTEM = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    const FONT_MONO = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/master-asset-utama');
                if (res.ok) {
                    const rawData = await res.json();
                    
                    // Filter specifically for Tanah assets
                    const tanahData = rawData.filter(item => 
                        item.jenis_bmn && item.jenis_bmn.toLowerCase().includes('tanah')
                    );
                    
                    const formattedData = tanahData.map(item => {
                        // Gabungkan Alamat
                        const parts = [];
                        if (item.kelurahan_desa) parts.push(item.kelurahan_desa);
                        if (item.kecamatan) parts.push(`Kec. ${item.kecamatan}`);
                        if (item.kab_kota) parts.push(item.kab_kota);
                        if (item.provinsi) parts.push(`Prov. ${item.provinsi}`);
                        
                        const alamatLengkap = parts.join(', ') || item.lokasi_ruang || '-';
                        
                        // Status Sertifikasi
                        let statusSertifikasi = 'Belum Bersertifikat';
                        if (item.sertifikat || item.no_identitas) {
                            statusSertifikasi = 'Bersertifikat';
                        }
                        
                        const area = item.provinsi || item.uraian_kanwil_djkn || 'Provinsi Tidak Diketahui';

                        const nama_bangunan = item.nama_satker || item.uraian_kpknl || 'Aset Tanah';

                        return {
                            id: item.id,
                            nup: item.nup || '-',
                            kode_barang: item.kode_barang || '-',
                            nama_bangunan: nama_bangunan,
                            alamat_lengkap: alamatLengkap,
                            luas_tanah: parseFloat(item.luas_tanah_seluruhnya || 0),
                            no_psp: item.sbsk || '-',
                            status_sertifikasi: statusSertifikasi,
                            area: area
                        };
                    });
                    
                    setAssets(formattedData);
                }
            } catch (err) {
                console.error("Gagal load data database:", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const formatLuas = (value) => {
        if (!value && value !== 0) return '-';
        const num = parseFloat(value);
        if (isNaN(num)) return value;
        return new Intl.NumberFormat('id-ID').format(num) + ' m²';
    };

    // Calculate summaries
    const totalLuas = useMemo(() => assets.reduce((sum, asset) => sum + (isNaN(asset.luas_tanah) ? 0 : asset.luas_tanah), 0), [assets]);
    const certifiedCount = useMemo(() => assets.filter(a => a.status_sertifikasi === 'Bersertifikat').length, [assets]);
    
    // Group assets by area
    const groupedAssets = useMemo(() => {
        const groups = {};
        assets.forEach(asset => {
            const area = asset.area;
            if (!groups[area]) groups[area] = [];
            groups[area].push(asset);
        });
        return groups;
    }, [assets]);
    
    const uniqueAreas = Object.keys(groupedAssets).length;

    const summaryCards = [
        { title: 'Total Aset', value: assets.length, color: '#0f172a', border: '#1e293b' },
        { title: 'Luas Total', value: formatLuas(totalLuas), color: '#10b981', border: '#10b981' },
        { title: 'Status Aktif', value: certifiedCount, color: '#3b82f6', border: '#3b82f6' },
        { title: 'Total Area', value: uniqueAreas, color: '#f59e0b', border: '#f59e0b' },
    ];

    return (
        <div className="fade-in" style={{ fontFamily: FONT_SYSTEM, minHeight: '100%', display: 'flex', flexDirection: 'column', background: '#f8fafc', padding: '20px 30px' }}>
            
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#003366', fontWeight: 'bold' }}>
                    Fasilitas Pangkalan - Aset Tanah
                </h1>
                <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>
                    Manajemen data aset tanah di lingkungan Kodaeral 3 Jakarta
                </p>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                {summaryCards.map((card, idx) => (
                    <div key={idx} style={{
                        background: 'white',
                        borderRadius: '8px',
                        padding: '20px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        borderLeft: `4px solid ${card.border}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                    }}>
                        <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '500' }}>{card.title}</span>
                        <span style={{ color: card.color, fontSize: '1.75rem', fontWeight: 'bold' }}>{card.value}</span>
                    </div>
                ))}
            </div>

            {/* Actions Toolbar */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
                <button style={btnStyle('#003366', 'white', '#003366')}>Tambah</button>
                <button style={btnStyle('white', '#003366', '#cbd5e1')}>Import Excel</button>
                <button style={btnStyle('white', '#003366', '#cbd5e1')}>Template (.xls)</button>
                <button style={btnStyle('white', '#003366', '#cbd5e1')}>Export Data</button>
                <button style={btnStyle('white', '#ef4444', '#fca5a5')}>Hapus Multi</button>
                <button style={btnStyle('white', '#003366', '#cbd5e1')}>Reset All Data</button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px', animation: 'pulse 2s infinite' }}>⏳</div>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Mengambil data dari database...</p>
                    <style>{`@keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }`}</style>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {Object.keys(groupedAssets).map((area, idx) => {
                        const areaAssets = groupedAssets[area];
                        const areaTotalLuas = areaAssets.reduce((sum, asset) => sum + (isNaN(asset.luas_tanah) ? 0 : asset.luas_tanah), 0);
                        return (
                            <div key={idx} style={{
                                background: '#003366',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}>
                                {/* Group Header */}
                                <div style={{ padding: '20px 24px', color: 'white' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                        <span style={{ color: '#ef4444', fontSize: '1.2rem' }}>📍</span>
                                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: 'white' }}>{area}</h2>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', gap: '12px', paddingLeft: '32px', alignItems: 'center' }}>
                                        <span>{areaAssets.length} aset terdaftar</span>
                                        <span style={{ color: '#cbd5e1' }}>|</span>
                                        <span>0 Terisi</span>
                                        <span style={{ color: '#cbd5e1' }}>|</span>
                                        <span style={{ color: 'white', fontWeight: '600' }}>Total Luas: {formatLuas(areaTotalLuas)}</span>
                                    </div>
                                </div>

                                {/* Table Container */}
                                <div style={{ background: 'white', padding: '8px 24px 24px 24px', borderRadius: '0 0 12px 12px' }}>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                            <thead>
                                                <tr>
                                                    <th style={thStyle}>NUP & Kode Barang</th>
                                                    <th style={thStyle}>Nama Bangunan & Alamat</th>
                                                    <th style={{...thStyle, textAlign: 'right'}}>Luas Keseluruhan</th>
                                                    <th style={thStyle}>Legalitas</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {areaAssets.map((asset, assetIdx) => (
                                                    <tr key={asset.id || assetIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                        <td style={tdStyle}>
                                                            <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#0f172a' }}>{asset.nup}</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: FONT_MONO, marginTop: '2px' }}>{asset.kode_barang}</div>
                                                        </td>
                                                        <td style={tdStyle}>
                                                            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>{asset.nama_bangunan}</div>
                                                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', lineHeight: '1.4' }}>{asset.alamat_lengkap}</div>
                                                        </td>
                                                        <td style={{...tdStyle, textAlign: 'right', fontWeight: '600', color: '#334155'}}>
                                                            {formatLuas(asset.luas_tanah)}
                                                        </td>
                                                        <td style={tdStyle}>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>PSP: {asset.no_psp}</span>
                                                                <span style={{
                                                                    display: 'inline-block',
                                                                    padding: '3px 8px',
                                                                    borderRadius: '4px',
                                                                    fontSize: '0.7rem',
                                                                    fontWeight: '600',
                                                                    background: asset.status_sertifikasi === 'Bersertifikat' ? '#dcfce7' : '#fee2e2',
                                                                    color: asset.status_sertifikasi === 'Bersertifikat' ? '#166534' : '#991b1b',
                                                                    width: 'fit-content'
                                                                }}>
                                                                    {asset.status_sertifikasi}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {Object.keys(groupedAssets).length === 0 && (
                        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                            <span style={{ fontSize: '2rem', color: '#cbd5e1' }}>🗺️</span>
                            <p style={{ color: '#64748b', marginTop: '12px' }}>Belum ada data aset tanah yang terdaftar.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Helpers for styles
const btnStyle = (bg, color, border) => ({
    background: bg,
    color: color,
    border: `1px solid ${border}`,
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    boxShadow: bg === 'white' ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease',
});

const thStyle = {
    padding: '16px 12px 12px 12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'left',
    borderBottom: '2px solid #e2e8f0',
};

const tdStyle = {
    padding: '16px 12px',
    verticalAlign: 'top',
};

export default FastanahAssetUtama;
