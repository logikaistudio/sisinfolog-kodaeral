import { useState, useEffect, useMemo, useRef } from 'react';

function FastanahAssetUtama() {
    const [assets, setAssets] = useState([]);
    const [rawDataMap, setRawDataMap] = useState({});
    const [loading, setLoading] = useState(true);

    // Editor State
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [editData, setEditData] = useState({ lanal: '', identifikasi_aset: '', longitude: '', latitude: '', alamat: '' });
    const [photos, setPhotos] = useState([]); // [{ base64, name, size }]
    const [isSaving, setIsSaving] = useState(false);

    const photoInputRef = useRef(null);

    const FONT_SYSTEM = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    const FONT_MONO = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/master-asset-utama');
                if (res.ok) {
                    const rawData = await res.json();

                    // Build raw data map for full-payload saves
                    const rawMap = {};
                    rawData.forEach(item => { rawMap[item.id] = item; });
                    setRawDataMap(rawMap);

                    // Filter specifically for Tanah assets
                    const tanahData = rawData.filter(item =>
                        item.jenis_bmn && item.jenis_bmn.toLowerCase().includes('tanah')
                    );

                    const formattedData = tanahData.map(item => {
                        const parts = [];
                        if (item.kelurahan_desa) parts.push(item.kelurahan_desa);
                        if (item.kecamatan) parts.push(`Kec. ${item.kecamatan}`);
                        if (item.kab_kota) parts.push(item.kab_kota);
                        if (item.provinsi) parts.push(`Prov. ${item.provinsi}`);

                        const alamatLengkap = parts.join(', ') || item.lokasi_ruang || '-';

                        let statusSertifikasi = 'Belum Bersertifikat';
                        if (item.no_sertifikat || item.no_dokumen || (item.jenis_dokumen && item.jenis_dokumen.includes('Bersertifikat'))) {
                            statusSertifikasi = 'Bersertifikat';
                        }

                        const area = item.kab_kota || item.provinsi || item.uraian_kanwil_djkn || 'Lokasi Tidak Diketahui';
                        const nama_bangunan = item.nama_barang || item.nama_satker || 'Aset Tanah';

                        // Parse saved photos from JSON string
                        let savedPhotos = [];
                        if (item.photos) {
                            try {
                                const parsed = JSON.parse(item.photos);
                                if (Array.isArray(parsed)) {
                                    savedPhotos = parsed.map((base64, i) => ({
                                        base64,
                                        name: `Foto ${i + 1}.jpg`,
                                        size: 0
                                    }));
                                }
                            } catch { /* ignore parse error */ }
                        }

                        return {
                            id: item.id,
                            nup: item.nup || '-',
                            kode_barang: item.kode_barang || '-',
                            nama_bangunan,
                            alamat_lengkap: alamatLengkap,
                            luas_tanah: parseFloat(item.luas_tanah_seluruhnya || 0),
                            no_psp: item.no_psp || '-',
                            jenis_dokumen: item.jenis_dokumen || '-',
                            no_dokumen: item.no_sertifikat || item.no_dokumen || '-',
                            status_sertifikasi: statusSertifikasi,
                            area,
                            // Editable operational fields
                            lanal: item.lanal || '',
                            identifikasi_aset: item.identifikasi_aset || '',
                            longitude: item.longitude || '',
                            latitude: item.latitude || '',
                            alamat: item.alamat || '',
                            photos: savedPhotos,
                        };
                    });

                    setAssets(formattedData);
                }
            } catch (err) {
                console.error('Gagal load data database:', err);
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

    const handleRowClick = (item) => {
        setCurrentItem(item);
        setEditData({
            lanal: item.lanal || '',
            identifikasi_aset: item.identifikasi_aset || '',
            longitude: item.longitude || '',
            latitude: item.latitude || '',
            alamat: item.alamat || item.alamat_lengkap || '',
        });
        setPhotos(item.photos || []);
        setIsEditorOpen(true);
    };

    // --- Photo Upload Handlers ---
    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = null; // reset so same file can be re-selected

        if (photos.length >= 4) {
            alert('Maksimal 4 foto yang dapat diunggah.');
            return;
        }
        
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            alert('Hanya format JPG/JPEG dan PNG yang diperbolehkan.');
            return;
        }

        const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = new Image();
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;
                    
                    const targetRatio = 9 / 16; // Fix rasio ke 9:16 sesuai permintaan
                    
                    let sx = 0, sy = 0, sWidth = width, sHeight = height;
                    const currentRatio = width / height;
                    
                    if (currentRatio > targetRatio) {
                        sWidth = height * targetRatio;
                        sx = (width - sWidth) / 2;
                    } else {
                        sHeight = width / targetRatio;
                        sy = (height - sHeight) / 2;
                    }
                    
                    const MAX_DIM = 800; // Limit resolusi maks
                    let newWidth, newHeight;
                    if (width >= height) {
                        newWidth = Math.min(MAX_DIM, sWidth);
                        newHeight = newWidth / targetRatio;
                    } else {
                        newHeight = Math.min(MAX_DIM, sHeight);
                        newWidth = newHeight * targetRatio;
                    }
                    
                    const canvas = document.createElement('canvas');
                    canvas.width = newWidth;
                    canvas.height = newHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, newWidth, newHeight);
                    
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });

        const roughSize = Math.round((base64.length * 3) / 4);
        if (roughSize > 1024 * 1024) {
             alert(`Ukuran foto masih terlalu besar setelah dikompresi. Mohon gunakan foto lain.`);
             return;
        }

        setPhotos(prev => [...prev, {
            base64: base64,
            name: file.name,
            size: roughSize,
        }]);
    };

    const removePhoto = (idx) => {
        setPhotos(prev => prev.filter((_, i) => i !== idx));
    };

    // --- Save Handler ---
    const handleSave = async () => {
        if (!currentItem) return;
        setIsSaving(true);
        try {
            const rawItem = rawDataMap[currentItem.id] || {};
            const photosJson = JSON.stringify(photos.map(p => typeof p === 'string' ? p : p.base64));

            const payload = {
                ...rawItem,
                lanal: editData.lanal,
                identifikasi_aset: editData.identifikasi_aset,
                longitude: editData.longitude,
                latitude: editData.latitude,
                alamat: editData.alamat,
                photos: photosJson,
            };

            const res = await fetch(`/api/master-asset-utama/${currentItem.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const updated = await res.json();
                // Sync raw data map
                setRawDataMap(prev => ({ ...prev, [currentItem.id]: updated }));
                // Sync assets list
                setAssets(prev => prev.map(a => a.id === currentItem.id
                    ? { ...a, lanal: editData.lanal, identifikasi_aset: editData.identifikasi_aset, longitude: editData.longitude, latitude: editData.latitude, alamat: editData.alamat, photos: [...photos] }
                    : a
                ));
                alert('✅ Data berhasil disimpan!');
                closeEditor();
            } else {
                const errText = await res.text();
                alert('❌ Gagal menyimpan: ' + errText);
            }
        } catch (err) {
            alert('❌ Error: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const closeEditor = () => {
        setIsEditorOpen(false);
        setTimeout(() => {
            setCurrentItem(null);
            setEditData({ lanal: '', identifikasi_aset: '', longitude: '', latitude: '', alamat: '' });
            setPhotos([]);
        }, 200);
    };

    // --- Summary calculations ---
    const totalLuas = useMemo(() =>
        assets.reduce((sum, asset) => sum + (isNaN(asset.luas_tanah) ? 0 : asset.luas_tanah), 0),
    [assets]);
    const certifiedCount = useMemo(() => assets.filter(a => a.status_sertifikasi === 'Bersertifikat').length, [assets]);

    const groupedAssets = useMemo(() => {
        const groups = {};
        assets.forEach(asset => {
            const area = asset.lanal || 'Tidak Ada Lanal';
            if (!groups[area]) groups[area] = [];
            groups[area].push(asset);
        });
        return groups;
    }, [assets]);

    const uniqueAreas = Object.keys(groupedAssets).length;

    const summaryCards = [
        { title: 'Total Aset', value: assets.length, color: '#0f172a', border: '#1e293b' },
        { title: 'Luas Total', value: formatLuas(totalLuas), color: '#10b981', border: '#10b981' },
        { title: 'Bersertifikat', value: certifiedCount, color: '#3b82f6', border: '#3b82f6' },
        { title: 'Total Area', value: uniqueAreas, color: '#f59e0b', border: '#f59e0b' },
    ];

    return (
        <div className="fade-in" style={{ fontFamily: FONT_SYSTEM, minHeight: '100%', display: 'flex', flexDirection: 'column', background: '#f8fafc', padding: '20px 30px' }}>

            <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg, image/png"
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
            />

            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#003366', fontWeight: 'bold' }}>
                    Fasilitas Pangkalan — Aset Tanah
                </h1>
                <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>
                    Manajemen data aset tanah di lingkungan Kodaeral 3 Jakarta. Klik baris untuk membuka editor.
                </p>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {summaryCards.map((card, idx) => (
                    <div key={idx} style={{
                        background: 'white', borderRadius: '10px', padding: '18px 20px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)', borderLeft: `4px solid ${card.border}`,
                        display: 'flex', flexDirection: 'column', gap: '6px'
                    }}>
                        <span style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: '500' }}>{card.title}</span>
                        <span style={{ color: card.color, fontSize: '1.65rem', fontWeight: 'bold' }}>{card.value}</span>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '28px' }}>
                <button style={btnStyle('#003366', 'white', '#003366')}>Tambah</button>
                <button style={btnStyle('white', '#003366', '#cbd5e1')}>Import Excel</button>
                <button style={btnStyle('white', '#003366', '#cbd5e1')}>Template (.xls)</button>
                <button style={btnStyle('white', '#003366', '#cbd5e1')}>Export Data</button>
                <button style={btnStyle('white', '#ef4444', '#fca5a5')}>Hapus Multi</button>
                <button style={btnStyle('white', '#64748b', '#e2e8f0')}>Reset All Data</button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', flex: 1 }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
                    <p style={{ color: '#64748b' }}>Mengambil data dari database...</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {Object.keys(groupedAssets).map((area, idx) => {
                        const areaAssets = groupedAssets[area];
                        const areaTotalLuas = areaAssets.reduce((s, a) => s + (isNaN(a.luas_tanah) ? 0 : a.luas_tanah), 0);
                        return (
                            <div key={idx} style={{ background: '#003366', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
                                <div style={{ padding: '20px 24px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                                            <span style={{ color: '#ef4444', fontSize: '1.4rem' }}>📍</span>
                                            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '700', color: 'white', letterSpacing: '0.5px' }}>{area}</h2>
                                        </div>
                                        <div style={{ fontSize: '0.88rem', color: '#cbd5e1', paddingLeft: '36px' }}>
                                            {areaAssets.length} aset terdaftar
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Luas</div>
                                        <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#34d399' }}>{formatLuas(areaTotalLuas)}</div>
                                    </div>
                                </div>

                                <div style={{ background: 'white', padding: '0 20px 20px', borderRadius: '0 0 12px 12px' }}>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '820px' }}>
                                            <thead>
                                                <tr>
                                                    <th style={thStyle}>NUP &amp; Kode Barang</th>
                                                    <th style={thStyle}>Nama Aset &amp; Alamat</th>
                                                    <th style={{ ...thStyle, textAlign: 'right' }}>Luas</th>
                                                    <th style={thStyle}>Lanal</th>
                                                    <th style={thStyle}>Identitas Aset</th>
                                                    <th style={thStyle}>Legalitas</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {areaAssets.map((asset, assetIdx) => (
                                                    <tr
                                                        key={asset.id || assetIdx}
                                                        onClick={() => handleRowClick(asset)}
                                                        style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.15s' }}
                                                        onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        <td style={tdStyle}>
                                                            <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.82rem' }}>{asset.nup}</div>
                                                            <div style={{ color: '#94a3b8', fontFamily: FONT_MONO, fontSize: '0.72rem', marginTop: '2px' }}>{asset.kode_barang}</div>
                                                        </td>
                                                        <td style={tdStyle}>
                                                            <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.85rem' }}>{asset.nama_bangunan}</div>
                                                            <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '3px', lineHeight: '1.4' }}>{asset.alamat || asset.alamat_lengkap}</div>
                                                        </td>
                                                        <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '600', color: '#334155', whiteSpace: 'nowrap' }}>
                                                            {formatLuas(asset.luas_tanah)}
                                                        </td>
                                                        <td style={tdStyle}>
                                                            <span style={{ fontSize: '0.82rem', color: asset.lanal ? '#003366' : '#cbd5e1', fontWeight: asset.lanal ? '500' : '400' }}>
                                                                {asset.lanal || '—'}
                                                            </span>
                                                        </td>
                                                        <td style={tdStyle}>
                                                            <span style={{ fontSize: '0.82rem', color: asset.identifikasi_aset ? '#0f172a' : '#cbd5e1' }}>
                                                                {asset.identifikasi_aset || '—'}
                                                            </span>
                                                        </td>
                                                        <td style={tdStyle}>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                                                    <strong>PSP:</strong> {asset.no_psp}
                                                                </span>
                                                                <span style={{ fontSize: '0.73rem', color: '#64748b', lineHeight: '1.3' }}>
                                                                    <strong>Dok:</strong> {asset.jenis_dokumen}
                                                                    {asset.no_dokumen !== '-' && <span style={{ display: 'block', color: '#94a3b8' }}>{asset.no_dokumen}</span>}
                                                                </span>
                                                                {asset.status_sertifikasi === 'Bersertifikat' && (
                                                                    <span style={{
                                                                        display: 'inline-block', padding: '2px 7px', borderRadius: '4px',
                                                                        fontSize: '0.68rem', fontWeight: '600',
                                                                        background: '#dcfce7', color: '#166534', width: 'fit-content',
                                                                    }}>{asset.status_sertifikasi}</span>
                                                                )}
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
                            <span style={{ fontSize: '2.5rem' }}>🗺️</span>
                            <p style={{ color: '#64748b', marginTop: '12px' }}>Belum ada data aset tanah yang terdaftar.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ─── EDITOR MODAL ─── */}
            {isEditorOpen && currentItem && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,20,50,0.62)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px'
                }} onClick={closeEditor}>
                    <div style={{
                        width: '100%', maxWidth: '880px', maxHeight: '92vh',
                        background: 'white', borderRadius: '16px',
                        boxShadow: '0 28px 56px -8px rgba(0,0,0,0.35)',
                        display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    }} onClick={e => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div style={{
                            padding: '16px 22px',
                            background: 'linear-gradient(135deg, #002855 0%, #003f88 100%)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            flexShrink: 0,
                        }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'white', fontWeight: '700' }}>
                                    ✏️ Editor Data Aset Tanah
                                </h2>
                                <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)' }}>
                                    {currentItem.nama_bangunan}
                                </p>
                            </div>
                            <button onClick={closeEditor} style={{
                                background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)',
                                color: 'white', borderRadius: '8px', width: '34px', height: '34px',
                                cursor: 'pointer', fontSize: '1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>×</button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '22px 26px', overflowY: 'auto', flex: 1 }}>

                            {/* ── Section: Identitas (Readonly) ── */}
                            <div style={sectionHeaderStyle}>📋 Identitas Aset</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                                <div>
                                    <label style={roLabelStyle}>NUK (Nomor Urut Pencatatan)</label>
                                    <input readOnly value={currentItem.nup} style={roInputStyle} />
                                </div>
                                <div>
                                    <label style={roLabelStyle}>Kode Barang</label>
                                    <input readOnly value={currentItem.kode_barang} style={{ ...roInputStyle, fontFamily: FONT_MONO }} />
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={roLabelStyle}>Nama Aset</label>
                                    <input readOnly value={currentItem.nama_bangunan} style={roInputStyle} />
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={edLabelStyle}>Alamat Lengkap</label>
                                    <textarea
                                        value={editData.alamat}
                                        onChange={e => setEditData(p => ({ ...p, alamat: e.target.value }))}
                                        style={{ ...edInputStyle, minHeight: '52px', resize: 'vertical' }}
                                    />
                                </div>
                            </div>

                            {/* ── Section: Data Operasional (Editable) ── */}
                            <div style={sectionHeaderStyle}>🌐 Data Operasional &amp; Koordinat</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                                <div>
                                    <label style={edLabelStyle}>Lanal (Pangkalan TNI AL)</label>
                                    <input
                                        type="text"
                                        value={editData.lanal}
                                        onChange={e => setEditData(p => ({ ...p, lanal: e.target.value }))}
                                        placeholder="Contoh: Lanal Tanjung Priok"
                                        style={edInputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={edLabelStyle}>Identifikasi Aset</label>
                                    <input
                                        type="text"
                                        value={editData.identifikasi_aset}
                                        onChange={e => setEditData(p => ({ ...p, identifikasi_aset: e.target.value }))}
                                        placeholder="Contoh: Gedung Mako Utama"
                                        style={edInputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={edLabelStyle}>Longitude</label>
                                    <input
                                        type="text"
                                        value={editData.longitude}
                                        onChange={e => setEditData(p => ({ ...p, longitude: e.target.value }))}
                                        placeholder="Contoh: 106.845599"
                                        style={{ ...edInputStyle, fontFamily: FONT_MONO }}
                                    />
                                </div>
                                <div>
                                    <label style={edLabelStyle}>Latitude</label>
                                    <input
                                        type="text"
                                        value={editData.latitude}
                                        onChange={e => setEditData(p => ({ ...p, latitude: e.target.value }))}
                                        placeholder="Contoh: -6.121435"
                                        style={{ ...edInputStyle, fontFamily: FONT_MONO }}
                                    />

                            </div>

                            <div style={{ ...sectionHeaderStyle, justifyContent: 'space-between' }}>
                                <span>📷 Foto Aset</span>
                                <span style={{ fontWeight: '400', fontSize: '0.72rem', color: '#94a3b8', textTransform: 'none', letterSpacing: 0 }}>
                                    JPG/PNG · Auto Crop (9:16) · Maks 4 Foto ({photos.length}/4)
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '10px' }}>
                                {[0, 1, 2, 3].map(idx => (
                                    <div key={idx} style={{
                                        aspectRatio: '3/4', borderRadius: '10px', overflow: 'hidden',
                                        position: 'relative',
                                        border: photos[idx] ? '2px solid #60a5fa' : '2px dashed #cbd5e1',
                                        background: photos[idx] ? '#000' : '#f8fafc',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'border-color 0.2s',
                                    }}>
                                        {photos[idx] ? (
                                            <>
                                                <img
                                                    src={typeof photos[idx] === 'string' ? photos[idx] : photos[idx].base64}
                                                    alt={`Foto ${idx + 1}`}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                                />
                                                {/* Overlay footer */}
                                                <div style={{
                                                    position: 'absolute', bottom: 0, left: 0, right: 0,
                                                    background: 'linear-gradient(0deg, rgba(0,0,0,0.72) 0%, transparent 100%)',
                                                    padding: '18px 7px 7px',
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                                                }}>
                                                    <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.65rem' }}>
                                                        Foto {idx + 1}
                                                    </span>
                                                    <button
                                                        onClick={e => { e.stopPropagation(); removePhoto(idx); }}
                                                        title="Hapus foto"
                                                        style={{
                                                            background: '#ef4444', border: 'none', color: 'white',
                                                            width: '22px', height: '22px', borderRadius: '50%',
                                                            cursor: 'pointer', fontSize: '13px', lineHeight: 1,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        }}
                                                    >×</button>
                                                </div>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => photoInputRef.current?.click()}
                                                disabled={photos.length >= 4}
                                                style={{
                                                    background: 'none', border: 'none',
                                                    cursor: photos.length >= 4 ? 'not-allowed' : 'pointer',
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                                    gap: '6px', padding: '12px', width: '100%', height: '100%',
                                                    justifyContent: 'center', opacity: photos.length >= 4 ? 0.4 : 1,
                                                }}
                                            >
                                                <span style={{ fontSize: '1.6rem' }}>📷</span>
                                                <span style={{ fontSize: '0.68rem', color: '#94a3b8', textAlign: 'center', lineHeight: '1.4' }}>
                                                    Foto {idx + 1}<br />
                                                    <span style={{ color: '#cbd5e1' }}>Klik untuk tambah</span>
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>
                                * Format JPEG (.jpg), ukuran maks 400 KB/foto, maks 4 foto per aset.
                            </p>
                        </div>

                        {/* Modal Footer */}
                        <div style={{
                            padding: '12px 22px', borderTop: '1px solid #e2e8f0',
                            display: 'flex', justifyContent: 'flex-end', gap: '10px',
                            background: '#f8fafc', flexShrink: 0,
                        }}>
                            <button onClick={closeEditor} style={{
                                padding: '8px 20px', borderRadius: '8px', border: '1px solid #cbd5e1',
                                background: 'white', color: '#334155', fontWeight: '500', cursor: 'pointer', fontSize: '0.875rem'
                            }}>Tutup</button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                style={{
                                    padding: '8px 24px', borderRadius: '8px', border: 'none',
                                    background: isSaving ? '#93c5fd' : '#003366',
                                    color: 'white', fontWeight: '600',
                                    cursor: isSaving ? 'not-allowed' : 'pointer', fontSize: '0.875rem',
                                    display: 'flex', alignItems: 'center', gap: '7px',
                                }}
                            >
                                {isSaving ? '⏳ Menyimpan...' : '💾 Simpan Perubahan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Style Helpers ───────────────────────────────────────────────────────────

const btnStyle = (bg, color, border) => ({
    background: bg, color, border: `1px solid ${border}`,
    borderRadius: '6px', padding: '8px 16px', fontSize: '0.84rem',
    fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease',
});

const thStyle = {
    padding: '14px 12px 10px', fontSize: '0.72rem', fontWeight: '700',
    color: '#64748b', textAlign: 'left', borderBottom: '2px solid #e2e8f0',
    textTransform: 'uppercase', letterSpacing: '0.03em',
};

const tdStyle = { padding: '14px 12px', verticalAlign: 'top' };

const sectionHeaderStyle = {
    fontSize: '0.72rem', fontWeight: '700', color: '#003366',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    borderBottom: '2px solid #e2e8f0', paddingBottom: '7px',
    marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px',
};

const roLabelStyle = {
    display: 'block', marginBottom: '5px', fontSize: '0.76rem',
    color: '#94a3b8', fontWeight: '500',
};

const roInputStyle = {
    width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0',
    borderRadius: '7px', fontSize: '0.875rem', color: '#475569',
    backgroundColor: '#f8fafc', boxSizing: 'border-box', fontFamily: 'inherit',
};

const edLabelStyle = {
    display: 'block', marginBottom: '5px', fontSize: '0.78rem',
    color: '#003366', fontWeight: '600',
};

const edInputStyle = {
    width: '100%', padding: '9px 12px',
    border: '1.5px solid #93c5fd', borderRadius: '7px',
    fontSize: '0.875rem', color: '#0f172a',
    backgroundColor: 'white', boxSizing: 'border-box',
    fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s',
};

export default FastanahAssetUtama;
