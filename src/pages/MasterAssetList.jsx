import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Master Asset List - Menampilkan daftar asset dari database
 * Tabel lengkap dengan inline editing
 */
function MasterAssetList({ folderId, assetType = 'tanah' }) {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editedData, setEditedData] = useState({});

    useEffect(() => {
        fetchAssets();
    }, [folderId]);

    const fetchAssets = async () => {
        setLoading(true);
        try {
            let url = assetType === 'bangunan' ? '/api/assets/bangunan' : '/api/assets/tanah';
            if (folderId) {
                url += `?folder_id=${folderId}`;
            }
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch assets');
            }
            const data = await response.json();
            setAssets(data);
        } catch (err) {
            console.error('Error fetching assets:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Format currency
    const formatCurrency = (value) => {
        if (!value) return '-';
        const num = parseFloat(value);
        if (isNaN(num)) return value;
        return 'Rp ' + new Intl.NumberFormat('id-ID').format(num);
    };

    // Format number
    const formatNumber = (value) => {
        if (!value) return '-';
        const num = parseFloat(value);
        if (isNaN(num)) return value;
        return new Intl.NumberFormat('id-ID').format(num);
    };

    // Format date
    const formatDate = (value) => {
        if (!value) return '-';
        try {
            const date = new Date(value);
            return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch {
            return value;
        }
    };

    // Consistent font families
    const FONT_SYSTEM = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    const FONT_MONO = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

    // Handle row click to edit
    const handleRowClick = (asset) => {
        if (editingId === asset.id) return; // Already editing
        setEditingId(asset.id);
        setEditedData({ ...asset });
    };

    // Handle field change
    const handleFieldChange = (key, value) => {
        setEditedData(prev => ({ ...prev, [key]: value }));
    };

    // Save changes
    const handleSave = async () => {
        try {
            const endpoint = assetType === 'bangunan' ? `/api/assets/bangunan/${editingId}` : `/api/assets/tanah/${editingId}`;
            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editedData)
            });

            if (!response.ok) {
                throw new Error('Failed to update asset');
            }

            // Update local state
            setAssets(prev => prev.map(a => a.id === editingId ? { ...editedData } : a));
            setEditingId(null);
            setEditedData({});

            alert('✅ Data berhasil diupdate!');
        } catch (err) {
            console.error('Save error:', err);
            alert('❌ Gagal menyimpan: ' + err.message);
        }
    };

    // Cancel editing
    const handleCancel = () => {
        setEditingId(null);
        setEditedData({});
    };

    // Delete asset
    const handleDelete = async (id) => {
        if (!confirm('⚠️ Yakin ingin menghapus data ini?')) return;

        try {
            const endpoint = assetType === 'bangunan' ? `/api/assets/bangunan/${id}` : `/api/assets/tanah/${id}`;
            const response = await fetch(endpoint, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete asset');
            }

            setAssets(prev => prev.filter(a => a.id !== id));
            setEditingId(null);
            setEditedData({});

            alert('✅ Data berhasil dihapus!');
        } catch (err) {
            console.error('Delete error:', err);
            alert('❌ Gagal menghapus: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="fade-in" style={{ textAlign: 'center', padding: '40px 20px', fontFamily: FONT_SYSTEM }}>
                <div style={{ fontSize: '32px', marginBottom: '12px', animation: 'pulse 2s infinite' }}>⏳</div>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Memuat data aset...</p>
                <style>{`@keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }`}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fade-in" style={{ textAlign: 'center', padding: '40px 20px', fontFamily: FONT_SYSTEM }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>❌</div>
                <h3 style={{ color: '#64748b', marginBottom: '12px', fontSize: '0.95rem' }}>Gagal Memuat Data</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{error}</p>
                <button onClick={fetchAssets} className="btn btn-primary" style={{ marginTop: '12px', fontSize: '0.8rem', padding: '6px 16px', fontFamily: FONT_SYSTEM }}>
                    🔄 Coba Lagi
                </button>
            </div>
        );
    }

    // Define editable columns based on assetType
    const columnsTanah = [
        { key: 'no', label: 'No', width: 40, align: 'center', type: 'number', editable: false },
        { key: 'jenis_bmn', label: 'Jenis BMN', width: 90, type: 'text', editable: true },
        { key: 'kode_barang', label: 'Kode Barang', width: 120, type: 'code', editable: true },
        { key: 'nup', label: 'NUP', width: 80, type: 'code', editable: true },
        { key: 'nama_barang', label: 'Nama Barang', width: 220, type: 'text', editable: true },
        { key: 'kondisi', label: 'Kondisi', width: 80, type: 'select', editable: true, options: ['Baik', 'Rusak Ringan', 'Rusak Berat'] },
        { key: 'no_sertifikat', label: 'No Sertifikat', width: 120, type: 'text', editable: true },
        { key: 'tanggal_perolehan', label: 'Tgl Perolehan', width: 100, align: 'center', format: 'date', type: 'date', editable: true },
        { key: 'nilai_perolehan', label: 'Nilai Perolehan', width: 140, align: 'right', format: 'currency', type: 'currency', editable: true },
        { key: 'luas_tanah', label: 'Luas Tanah (m²)', width: 110, align: 'right', format: 'number', type: 'number', editable: true },
        { key: 'no_psp', label: 'No PSP', width: 100, type: 'text', editable: true },
        { key: 'tgl_psp', label: 'Tgl PSP', width: 100, align: 'center', format: 'date', type: 'date', editable: true },
        { key: 'alamat_detail', label: 'Alamat', width: 200, type: 'text', editable: true },
        { key: 'rt_rw', label: 'RT/RW', width: 80, type: 'text', editable: true },
        { key: 'kelurahan_desa', label: 'Kelurahan/Desa', width: 130, type: 'text', editable: true },
        { key: 'kecamatan', label: 'Kecamatan', width: 120, type: 'text', editable: true },
        { key: 'kabupaten', label: 'Kab/Kota', width: 130, type: 'text', editable: true },
        { key: 'kode_kota', label: 'Kode Kab/Kota', width: 110, type: 'code', editable: true },
        { key: 'provinsi', label: 'Provinsi', width: 110, type: 'text', editable: true },
    ];

    const columnsBangunan = [
        { key: 'no', label: 'NO', width: 40, align: 'center', type: 'number', editable: false },
        { key: 'occupant_info', label: 'NAMA\nPANGKAT/KORPS\nNRP/NIP', width: 250, type: 'text', editable: false, multiline: true },
        { key: 'area', label: 'PERUMAHAN', width: 200, type: 'text', editable: true },
        { key: 'alamat_detail', label: 'ALAMAT', width: 200, type: 'text', editable: true },
        { key: 'status_penghuni', label: 'STATUS PENGHUNI', width: 120, type: 'text', editable: true },
        { key: 'sip_info', label: 'NO SIP /\nTANGGAL', width: 150, type: 'text', editable: false, multiline: true },
        { key: 'tipe_rumah', label: 'Tipe', width: 60, type: 'text', editable: true },
        { key: 'golongan', label: 'Gol', width: 50, type: 'text', editable: true },
        { key: 'tahun_buat', label: 'TAHUN BUAT', width: 80, type: 'number', editable: true },
        { key: 'asal_perolehan', label: 'ASAL PEROLEHAN', width: 120, type: 'text', editable: true },
        { key: 'mendapat_fasdin', label: 'MENDAPAT FASDIN', width: 100, type: 'text', editable: true },
        { key: 'kondisi', label: 'KONDISI', width: 100, type: 'select', editable: true, options: ['Baik', 'Rusak Ringan', 'Rusak Berat'] },
        { key: 'keterangan', label: 'KETERANGAN', width: 150, type: 'text', editable: true },
    ];

    const columns = assetType === 'bangunan' ? columnsBangunan : columnsTanah;

    const getCellValue = (asset, col, index) => {
        if (col.key === 'no') return index + 1;

        // Custom composite columns for Bangunan
        if (assetType === 'bangunan') {
            if (col.key === 'occupant_info') {
                const parts = [
                    asset.occupant_name,
                    asset.occupant_rank,
                    asset.occupant_nrp
                ].filter(p => p && p !== '-');
                return parts.length > 0 ? parts.join(' / ') : '-';
            }
            if (col.key === 'sip_info') {
                const parts = [
                    asset.no_sip,
                    formatDate(asset.tgl_sip)
                ].filter(p => p && p !== '-' && p !== 'NaN/NaN/NaN');
                return parts.length > 0 ? parts.join(' / ') : '-';
            }
        }

        let value = asset[col.key];

        // name priority: name > nama_barang > area
        if (col.key === 'name') {
            value = asset.name || asset.nama_barang || asset.area || '-';
        }

        if (col.key === 'area') {
            value = asset.area || '-';
        }

        // nama_barang priority
        if (col.key === 'nama_barang') {
            value = asset.nama_barang || asset.name || '-';
        }

        if (col.key === 'luas_tanah' && !value) {
            value = asset.luas_tanah_seluruhnya || '-';
        }

        if (!value && value !== 0) return '-';

        if (col.format === 'currency') return formatCurrency(value);
        if (col.format === 'number') return formatNumber(value);
        if (col.format === 'date') return formatDate(value);

        return String(value);
    };

    const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);

    return (
        <div className="fade-in" style={{ fontFamily: FONT_SYSTEM }}>
            {assets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f8fafc', borderRadius: '8px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.5 }}>📊</div>
                    <h3 style={{ color: '#64748b', marginBottom: '0.5rem', fontSize: '0.95rem' }}>Belum Ada Data Asset</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Silakan import data baru.</p>
                </div>
            ) : (
                <div>
                    {/* Summary Bar */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        background: '#f8fafc',
                        borderRadius: '6px',
                        marginBottom: '10px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1rem' }}>📊</span>
                            <span style={{ fontSize: '0.75rem', color: '#475569' }}>
                                Total: <strong>{assets.length}</strong> Asset
                            </span>
                            {editingId && (
                                <span style={{ fontSize: '0.7rem', color: '#f59e0b', marginLeft: '8px' }}>
                                    ✏️ Mode Edit Aktif
                                </span>
                            )}
                        </div>
                        <button
                            onClick={fetchAssets}
                            style={{
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '4px',
                                padding: '4px 10px',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                color: '#64748b',
                                fontFamily: FONT_SYSTEM
                            }}
                        >
                            🔄 Refresh
                        </button>
                    </div>

                    {/* Instruction */}
                    <div style={{
                        fontSize: '0.7rem',
                        color: '#64748b',
                        marginBottom: '8px',
                        padding: '6px 10px',
                        background: '#eff6ff',
                        borderRadius: '4px',
                        border: '1px solid #bfdbfe'
                    }}>
                        💡 <strong>Klik baris</strong> untuk edit • <strong>Simpan/Batal/Hapus</strong> muncul saat mode edit
                    </div>

                    {/* Data Table */}
                    <div style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            overflowX: 'auto',
                            overflowY: 'auto',
                            maxHeight: 'calc(100vh - 320px)',
                            WebkitOverflowScrolling: 'touch'
                        }}>
                            <table style={{
                                minWidth: `${totalWidth}px`,
                                borderCollapse: 'collapse',
                                width: 'max-content',
                                tableLayout: 'fixed'
                            }}>
                                <thead>
                                    <tr>
                                        {columns.map((col) => (
                                            <th
                                                key={col.key}
                                                style={{
                                                    width: `${col.width}px`,
                                                    minWidth: `${col.width}px`,
                                                    padding: '8px 10px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: '700',
                                                    fontFamily: FONT_SYSTEM,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.03em',
                                                    color: '#fff',
                                                    background: '#003366',
                                                    textAlign: col.align || 'left',
                                                    position: 'sticky',
                                                    top: 0,
                                                    zIndex: 10,
                                                    borderBottom: '2px solid #001a33',
                                                    whiteSpace: col.multiline ? 'pre-wrap' : 'nowrap',
                                                    verticalAlign: 'middle'
                                                }}
                                            >
                                                {col.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {assets.map((asset, index) => {
                                        const isEditing = editingId === asset.id;

                                        return (
                                            <tr
                                                key={asset.id}
                                                onClick={() => !isEditing && handleRowClick(asset)}
                                                style={{
                                                    background: isEditing ? '#fef3c7' : (index % 2 === 0 ? '#ffffff' : '#f8fafc'),
                                                    cursor: isEditing ? 'default' : 'pointer',
                                                    transition: 'background 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isEditing) e.currentTarget.style.background = '#e0f2fe';
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isEditing) e.currentTarget.style.background = index % 2 === 0 ? '#ffffff' : '#f8fafc';
                                                }}
                                            >
                                                {columns.map((col) => {
                                                    const cellValue = getCellValue(asset, col, index);
                                                    const isMonospace = col.type === 'code' || col.type === 'currency' || col.type === 'number' || col.type === 'date';

                                                    // Get current value with fallback
                                                    let currentValue = isEditing ? editedData[col.key] : asset[col.key];
                                                    if (col.key === 'luas_tanah' && !currentValue) {
                                                        currentValue = isEditing ? (editedData.luas_tanah_seluruhnya || asset.luas_tanah_seluruhnya) : asset.luas_tanah_seluruhnya;
                                                    }

                                                    return (
                                                        <td
                                                            key={col.key}
                                                            style={{
                                                                width: `${col.width}px`,
                                                                minWidth: `${col.width}px`,
                                                                padding: '4px 8px',
                                                                fontSize: '0.75rem',
                                                                fontFamily: isMonospace ? FONT_MONO : FONT_SYSTEM,
                                                                color: '#334155',
                                                                borderBottom: '1px solid #f1f5f9',
                                                                textAlign: col.align || 'left',
                                                                verticalAlign: 'top',
                                                                position: 'relative',
                                                                whiteSpace: col.multiline ? 'pre-wrap' : 'nowrap',
                                                                lineHeight: col.multiline ? '1.4' : 'normal'
                                                            }}
                                                            onClick={(e) => isEditing && e.stopPropagation()}
                                                        >
                                                            {/* Floating action buttons for first column when editing */}
                                                            {isEditing && col.key === 'no' && (
                                                                <div style={{
                                                                    position: 'absolute',
                                                                    left: '100%',
                                                                    top: '50%',
                                                                    transform: 'translateY(-50%)',
                                                                    display: 'flex',
                                                                    gap: '4px',
                                                                    marginLeft: '8px',
                                                                    zIndex: 100,
                                                                    whiteSpace: 'nowrap'
                                                                }}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <button
                                                                        onClick={handleSave}
                                                                        style={{
                                                                            padding: '4px 10px',
                                                                            fontSize: '0.7rem',
                                                                            background: '#10b981',
                                                                            color: 'white',
                                                                            border: 'none',
                                                                            borderRadius: '4px',
                                                                            cursor: 'pointer',
                                                                            fontFamily: FONT_SYSTEM,
                                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                                        }}
                                                                    >
                                                                        💾 Simpan
                                                                    </button>
                                                                    <button
                                                                        onClick={handleCancel}
                                                                        style={{
                                                                            padding: '4px 10px',
                                                                            fontSize: '0.7rem',
                                                                            background: '#6b7280',
                                                                            color: 'white',
                                                                            border: 'none',
                                                                            borderRadius: '4px',
                                                                            cursor: 'pointer',
                                                                            fontFamily: FONT_SYSTEM,
                                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                                        }}
                                                                    >
                                                                        ✕ Batal
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(asset.id)}
                                                                        style={{
                                                                            padding: '4px 10px',
                                                                            fontSize: '0.7rem',
                                                                            background: '#ef4444',
                                                                            color: 'white',
                                                                            border: 'none',
                                                                            borderRadius: '4px',
                                                                            cursor: 'pointer',
                                                                            fontFamily: FONT_SYSTEM,
                                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                                        }}
                                                                    >
                                                                        🗑️ Hapus
                                                                    </button>
                                                                </div>
                                                            )}

                                                            {isEditing && col.editable ? (
                                                                col.type === 'select' ? (
                                                                    <select
                                                                        value={currentValue || ''}
                                                                        onChange={(e) => handleFieldChange(col.key, e.target.value)}
                                                                        style={{
                                                                            width: '100%',
                                                                            padding: '2px 4px',
                                                                            fontSize: '0.75rem',
                                                                            fontFamily: FONT_SYSTEM,
                                                                            border: '1px solid #cbd5e1',
                                                                            borderRadius: '3px'
                                                                        }}
                                                                    >
                                                                        <option value="">-</option>
                                                                        {col.options.map(opt => (
                                                                            <option key={opt} value={opt}>{opt}</option>
                                                                        ))}
                                                                    </select>
                                                                ) : col.type === 'date' ? (
                                                                    <input
                                                                        type="date"
                                                                        value={currentValue ? new Date(currentValue).toISOString().split('T')[0] : ''}
                                                                        onChange={(e) => handleFieldChange(col.key, e.target.value)}
                                                                        style={{
                                                                            width: '100%',
                                                                            padding: '2px 4px',
                                                                            fontSize: '0.7rem',
                                                                            fontFamily: FONT_MONO,
                                                                            border: '1px solid #cbd5e1',
                                                                            borderRadius: '3px'
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <input
                                                                        type={col.type === 'number' || col.type === 'currency' ? 'number' : 'text'}
                                                                        value={currentValue || ''}
                                                                        onChange={(e) => handleFieldChange(col.key, e.target.value)}
                                                                        style={{
                                                                            width: '100%',
                                                                            padding: '2px 4px',
                                                                            fontSize: '0.75rem',
                                                                            fontFamily: isMonospace ? FONT_MONO : FONT_SYSTEM,
                                                                            border: '1px solid #cbd5e1',
                                                                            borderRadius: '3px',
                                                                            textAlign: col.align || 'left'
                                                                        }}
                                                                    />
                                                                )
                                                            ) : (
                                                                col.type === 'badge' ? (
                                                                    <span style={{
                                                                        display: 'inline-block',
                                                                        padding: '2px 8px',
                                                                        borderRadius: '4px',
                                                                        fontSize: '0.7rem',
                                                                        fontWeight: '600',
                                                                        fontFamily: FONT_SYSTEM,
                                                                        background: (asset[col.key] === 'Baik' || asset[col.key] === 'Aktif') ? '#dcfce7' : '#fef3c7',
                                                                        color: (asset[col.key] === 'Baik' || asset[col.key] === 'Aktif') ? '#15803d' : '#b45309'
                                                                    }}>
                                                                        {cellValue}
                                                                    </span>
                                                                ) : col.type === 'currency' ? (
                                                                    <span style={{ fontWeight: '500', color: '#0f172a' }}>
                                                                        {cellValue}
                                                                    </span>
                                                                ) : (
                                                                    cellValue
                                                                )
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{
                        marginTop: '8px',
                        fontSize: '0.7rem',
                        color: '#94a3b8',
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}>
                        <span>Menampilkan {assets.length} data</span>
                        <span>↔️ Scroll horizontal untuk melihat semua kolom</span>
                    </div>
                </div>
            )}
        </div>
    );
}

MasterAssetList.propTypes = {
    folderId: PropTypes.number,
    assetType: PropTypes.oneOf(['tanah', 'bangunan'])
};

export default MasterAssetList;
