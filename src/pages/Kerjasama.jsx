import React, { useState, useEffect, useRef } from 'react'
import { read, utils, writeFile } from 'xlsx'
import ErrorBoundary from '../components/ErrorBoundary'
import { pemanfaatanAssetData } from '../data/pemanfaatanData'

// Helper function to split objek_pemanfaatan into objek and pemanfaatan
const splitObjekPemanfaatan = (text) => {
    if (!text) return { objek: '-', pemanfaatan: '-' };

    // Find "untuk" keyword
    const untukIndex = text.toLowerCase().indexOf('untuk');

    if (untukIndex === -1) {
        // No "untuk" found, put everything in objek
        return { objek: text.trim(), pemanfaatan: '-' };
    }

    const objek = text.substring(0, untukIndex).trim();
    const pemanfaatan = text.substring(untukIndex + 5).trim(); // Skip "untuk"

    return { objek, pemanfaatan };
};

// Helper function to clean kompensasi (remove /thn, /3thn, etc.)
const cleanKompensasi = (value) => {
    if (!value) return '-';
    // Remove /thn, /3thn, /tahun, etc.
    return String(value).replace(/\s*\/\s*(thn|tahun|\d+thn)/gi, '').trim();
};

function Kerjasama() {
    // State management
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [formData, setFormData] = useState({})
    const fileInputRef = useRef(null)

    // Load data from API
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/assets/pemanfaatan');
            const result = await response.json();

            if (Array.isArray(result) && result.length > 0) {
                setData(result);
            } else {
                // Seed initial data if empty
                console.log('Seeding initial data...');

                // Process data before seeding
                const processedData = pemanfaatanAssetData.map(item => {
                    const { objek, pemanfaatan } = splitObjekPemanfaatan(item.objek_pemanfaatan);
                    return {
                        ...item,
                        objek,
                        pemanfaatan,
                        nilai_kompensasi: cleanKompensasi(item.nilai_kompensasi)
                    };
                });

                const seedResponse = await fetch('/api/assets/pemanfaatan/bulk', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(processedData)
                });
                const seededData = await seedResponse.json();
                setData(seededData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleImportClick = () => {
        fileInputRef.current.click()
    }

    const handleDownloadTemplate = () => {
        const headers = [
            'No',
            'Objek',
            'Pemanfaatan',
            'Luas (m²)',
            'Bentuk',
            'Pihak PKS',
            'Nomor PKS',
            'Tgl PKS',
            'Kompensasi',
            'Jangka Waktu',
            'Nomor Persetujuan',
            'Tgl Persetujuan',
            'Nomor NTPN',
            'Tgl NTPN'
        ];

        const sampleData = [
            '',
            'Jl Merawan P Jati Pondok Labu Jaksel',
            'Penjualan alat-alat',
            '101.5',
            'Sewa',
            'Yayasan Masjid Imam Bonjol',
            'PKS/19/XII/2023',
            '01/12/2023',
            '17,050,000',
            '011223-011226',
            'S-172/MK.6/KNL.0705/2023',
            '08/08/2023',
            '688656U8F8D82HP5',
            '26-Sep-24'
        ];

        const wsData = [headers, sampleData];
        const ws = utils.aoa_to_sheet(wsData);

        const wscols = headers.map(h => ({ wch: Math.max(h.length + 2, 15) }));
        ws['!cols'] = wscols;

        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, 'Template Pemanfaatan Aset');
        writeFile(wb, 'Template_Import_Pemanfaatan_Aset.xlsx', { bookType: 'xlsx' });
    }

    const handleFileUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setLoading(true)
        try {
            const buffer = await file.arrayBuffer()
            const workbook = read(buffer)
            const worksheet = workbook.Sheets[workbook.SheetNames[0]]

            const rawData = utils.sheet_to_json(worksheet, { header: 1 })

            if (rawData.length < 2) {
                alert('Format file tidak sesuai (terlalu sedikit baris)')
                setLoading(false)
                return
            }

            let headerRowIndex = 0;
            for (let i = 0; i < Math.min(10, rawData.length); i++) {
                const rowStr = JSON.stringify(rawData[i]).toLowerCase();
                if (rowStr.includes('objek') || rowStr.includes('pemanfaatan')) {
                    headerRowIndex = i;
                    break;
                }
            }

            const headers = rawData[headerRowIndex];
            const importedData = []

            for (let i = headerRowIndex + 1; i < rawData.length; i++) {
                const row = rawData[i];
                if (!row || row.length === 0) continue;

                const getColIndex = (keyword) => headers.findIndex(h => String(h).toLowerCase().includes(keyword.toLowerCase()));

                const idxObjek = getColIndex('objek');
                if (idxObjek !== -1 && row[idxObjek] && (String(row[idxObjek]).trim() === '2')) {
                    continue;
                }

                if (idxObjek !== -1 && !row[idxObjek]) continue;

                const item = {
                    objek: row[getColIndex('objek')] || '-',
                    pemanfaatan: row[getColIndex('pemanfaatan')] || '-',
                    luas: String(row[getColIndex('luas')] || '0'),
                    bentuk_pemanfaatan: row[getColIndex('bentuk')] || '-',
                    pihak_pks: row[getColIndex('pihak')] || '-',
                    no_pks: row[getColIndex('nomor pks')] || row[getColIndex('no. pks')] || '-',
                    tgl_pks: row[getColIndex('tgl pks')] || row[getColIndex('tanggal pks')] || '-',
                    nilai_kompensasi: cleanKompensasi(row[getColIndex('kompensasi')] || row[getColIndex('besaran')] || '-'),
                    jangka_waktu: row[getColIndex('jangka')] || '-',
                    no_persetujuan: row[getColIndex('nomor persetujuan')] || row[getColIndex('no persetujuan')] || '-',
                    tgl_persetujuan: row[getColIndex('tgl persetujuan')] || row[getColIndex('tanggal persetujuan')] || '-',
                    no_ntpn: row[getColIndex('nomor ntpn')] || row[getColIndex('no. ntpn')] || '-',
                    tgl_ntpn: row[getColIndex('tgl ntpn')] || row[getColIndex('tanggal ntpn')] || '-'
                };

                if (item.objek !== '-' || item.pemanfaatan !== '-') {
                    importedData.push(item);
                }
            }

            const response = await fetch('/api/assets/pemanfaatan/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(importedData)
            });

            if (response.ok) {
                const savedItems = await response.json();
                setData([...data, ...savedItems]);
                alert(`Berhasil mengimport ${savedItems.length} data!`);
                fetchData();
            } else {
                alert('Gagal menyimpan data ke database.');
            }

        } catch (error) {
            console.error('Error processing file:', error)
            alert('Gagal memproses file. Pastikan format sesuai template.')
        } finally {
            setLoading(false)
            e.target.value = null
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Hapus data ini?')) {
            try {
                await fetch(`/api/assets/pemanfaatan/${id}`, { method: 'DELETE' });
                setData(data.filter(item => item.id !== id));
            } catch (error) {
                console.error('Error deleting item', error);
                alert('Gagal menghapus data');
            }
        }
    }

    const handleDeleteAll = async () => {
        if (window.confirm('Yakin ingin menghapus SEMUA data?')) {
            try {
                await fetch('/api/assets/pemanfaatan', { method: 'DELETE' });
                setData([]);
                alert('Semua data berhasil dihapus');
            } catch (error) {
                console.error('Error deleting all items', error);
                alert('Gagal menghapus semua data');
            }
        }
    }

    // Modal handlers
    const handleRowClick = (item) => {
        setSelectedItem(item);
        setFormData(item);
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
        setFormData({});
        setIsEditMode(false);
    };

    const handleEditToggle = () => {
        setIsEditMode(!isEditMode);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveEdit = async () => {
        try {
            const response = await fetch(`/api/assets/pemanfaatan/${selectedItem.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const updatedItem = await response.json();
                setData(data.map(item => item.id === selectedItem.id ? updatedItem : item));
                alert('Data berhasil diupdate');
                handleCloseModal();
            } else {
                alert('Gagal mengupdate data');
            }
        } catch (error) {
            console.error('Error updating item:', error);
            alert('Gagal mengupdate data');
        }
    };

    const handleDeleteFromModal = async () => {
        if (window.confirm('Hapus data ini?')) {
            try {
                await fetch(`/api/assets/pemanfaatan/${selectedItem.id}`, { method: 'DELETE' });
                setData(data.filter(item => item.id !== selectedItem.id));
                alert('Data berhasil dihapus');
                handleCloseModal();
            } catch (error) {
                console.error('Error deleting item:', error);
                alert('Gagal menghapus data');
            }
        }
    };

    // Calculate summary statistics
    const totalObjek = data.length;
    const totalLuas = data.reduce((sum, item) => {
        const luas = parseFloat(String(item.luas).replace(/,/g, '')) || 0;
        return sum + luas;
    }, 0);
    const totalKompensasi = data.reduce((sum, item) => {
        const kompensasi = parseFloat(String(item.nilai_kompensasi).replace(/,/g, '')) || 0;
        return sum + kompensasi;
    }, 0);

    // Count by bentuk pemanfaatan
    const bentukCounts = data.reduce((acc, item) => {
        const bentuk = item.bentuk_pemanfaatan || 'Lainnya';
        acc[bentuk] = (acc[bentuk] || 0) + 1;
        return acc;
    }, {});

    // Format number with thousand separator
    const formatNumber = (num) => {
        return new Intl.NumberFormat('id-ID').format(num);
    };

    return (
        <ErrorBoundary>
            <div className="fade-in">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls" style={{ display: 'none' }} />

                <div className="page-header">
                    <h1 className="page-title">Pemanfaatan Aset</h1>
                    <p className="page-subtitle">Data kerjasama pemanfaatan lahan dan bangunan (Sewa, KSP, Pinjam Pakai)</p>
                </div>

                {/* Summary Statistics */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '12px',
                    marginBottom: '20px'
                }}>
                    {/* Total Objek */}
                    <div style={{
                        background: 'linear-gradient(135deg, #003366 0%, #004d99 100%)',
                        borderRadius: '8px',
                        padding: '16px',
                        color: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ fontSize: '11px', opacity: 0.9, marginBottom: '6px', fontWeight: '500', fontFamily: 'var(--font-family)' }}>📍 Total Objek</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '2px', fontFamily: 'var(--font-family)' }}>{formatNumber(totalObjek)}</div>
                        <div style={{ fontSize: '11px', opacity: 0.8, fontFamily: 'var(--font-family)' }}>Objek pemanfaatan</div>
                    </div>

                    {/* Total Luas */}
                    <div style={{
                        background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)',
                        borderRadius: '8px',
                        padding: '16px',
                        color: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ fontSize: '11px', opacity: 0.9, marginBottom: '6px', fontWeight: '500', fontFamily: 'var(--font-family)' }}>📐 Total Luas</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '2px', fontFamily: 'var(--font-family)' }}>{formatNumber(totalLuas.toFixed(2))}</div>
                        <div style={{ fontSize: '11px', opacity: 0.8, fontFamily: 'var(--font-family)' }}>Meter persegi (m²)</div>
                    </div>

                    {/* Total Kompensasi */}
                    <div style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        borderRadius: '8px',
                        padding: '16px',
                        color: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ fontSize: '11px', opacity: 0.9, marginBottom: '6px', fontWeight: '500', fontFamily: 'var(--font-family)' }}>💰 Total Kompensasi</div>
                        <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '2px', fontFamily: 'var(--font-family)' }}>Rp {formatNumber(totalKompensasi)}</div>
                        <div style={{ fontSize: '11px', opacity: 0.8, fontFamily: 'var(--font-family)' }}>Nilai kompensasi</div>
                    </div>

                    {/* Bentuk Pemanfaatan Breakdown */}
                    <div style={{
                        background: 'linear-gradient(135deg, #001f3f 0%, #003366 100%)',
                        borderRadius: '8px',
                        padding: '16px',
                        color: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ fontSize: '11px', opacity: 0.9, marginBottom: '6px', fontWeight: '500', fontFamily: 'var(--font-family)' }}>📊 Bentuk Pemanfaatan</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                            {Object.entries(bentukCounts).map(([bentuk, count]) => (
                                <div key={bentuk} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontSize: '11px',
                                    background: 'rgba(255,255,255,0.15)',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontFamily: 'var(--font-family)'
                                }}>
                                    <span style={{ fontWeight: '500' }}>{bentuk}</span>
                                    <span style={{ fontWeight: '700', fontSize: '13px' }}>{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    {/* Toolbar */}
                    <div style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                        background: '#f9fafb'
                    }}>
                        <div style={{
                            background: '#dbeafe',
                            color: '#1e40af',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            fontFamily: 'system-ui, -apple-system, sans-serif'
                        }}>
                            Total: {data.length} Data
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-outline" onClick={handleImportClick} disabled={loading} style={{ fontSize: '13px', padding: '8px 16px' }}>
                                {loading ? 'Loading...' : '📥 Import Excel'}
                            </button>
                            <button className="btn btn-outline" onClick={handleDownloadTemplate} disabled={loading} style={{ fontSize: '13px', padding: '8px 16px' }}>
                                📄 Template
                            </button>
                            {data.length > 0 && (
                                <button className="btn btn-outline" style={{ borderColor: '#ef4444', color: '#ef4444', fontSize: '13px', padding: '8px 16px' }} onClick={handleDeleteAll}>
                                    🗑️ Hapus Semua
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Modern Table */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '11px',
                            fontFamily: 'var(--font-family)'
                        }}>
                            <thead>
                                <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>No</th>
                                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '180px' }}>Objek</th>
                                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '150px' }}>Pemanfaatan</th>
                                    <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600', color: '#374151', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Luas (m²)</th>
                                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bentuk</th>
                                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '140px' }}>Pihak PKS</th>
                                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>No. & Tgl PKS</th>
                                    <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600', color: '#374151', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kompensasi</th>
                                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Jangka Waktu</th>
                                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Persetujuan</th>
                                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>NTPN</th>
                                    <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: '600', color: '#374151', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length === 0 ? (
                                    <tr>
                                        <td colSpan="12" style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>
                                            <div style={{ marginBottom: '8px', fontSize: '28px' }}>📋</div>
                                            Belum ada data. Silahkan import data menggunakan template Excel.
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((item, index) => (
                                        <tr key={item.id || index}
                                            onClick={() => handleRowClick(item)}
                                            style={{
                                                borderBottom: '1px solid #f3f4f6',
                                                transition: 'background-color 0.15s',
                                                cursor: 'pointer'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <td style={{ padding: '8px 12px', color: '#6b7280', fontWeight: '500' }}>{index + 1}</td>
                                            <td style={{ padding: '8px 12px', color: '#111827', fontWeight: '500' }}>{item.objek || '-'}</td>
                                            <td style={{ padding: '8px 12px', color: '#4b5563' }}>{item.pemanfaatan || '-'}</td>
                                            <td style={{ padding: '8px 12px', textAlign: 'right', color: '#111827', fontFamily: 'monospace' }}>{item.luas}</td>
                                            <td style={{ padding: '8px 12px' }}>
                                                <span style={{
                                                    padding: '3px 8px',
                                                    borderRadius: '10px',
                                                    fontSize: '10px',
                                                    fontWeight: '600',
                                                    background: item.bentuk_pemanfaatan?.toLowerCase().includes('sewa') ? '#dcfce7' : item.bentuk_pemanfaatan?.toLowerCase().includes('ksp') ? '#fef3c7' : '#e0e7ff',
                                                    color: item.bentuk_pemanfaatan?.toLowerCase().includes('sewa') ? '#166534' : item.bentuk_pemanfaatan?.toLowerCase().includes('ksp') ? '#b45309' : '#3730a3'
                                                }}>
                                                    {item.bentuk_pemanfaatan}
                                                </span>
                                            </td>
                                            <td style={{ padding: '8px 12px', color: '#374151' }}>{item.pihak_pks}</td>
                                            <td style={{ padding: '8px 12px' }}>
                                                <div style={{ color: '#111827', fontSize: '11px', fontWeight: '500' }}>{item.no_pks}</div>
                                                <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>{item.tgl_pks}</div>
                                            </td>
                                            <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace', color: '#059669', fontWeight: '600' }}>{item.nilai_kompensasi}</td>
                                            <td style={{ padding: '8px 12px', color: '#4b5563', fontSize: '11px' }}>{item.jangka_waktu}</td>
                                            <td style={{ padding: '8px 12px' }}>
                                                <div style={{ color: '#111827', fontSize: '11px' }}>{item.no_persetujuan}</div>
                                                <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>{item.tgl_persetujuan}</div>
                                            </td>
                                            <td style={{ padding: '8px 12px' }}>
                                                <div style={{ color: '#111827', fontSize: '11px', fontFamily: 'monospace' }}>{item.no_ntpn}</div>
                                                <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>{item.tgl_ntpn}</div>
                                            </td>
                                            <td style={{ padding: '8px 12px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(item.id);
                                                    }}
                                                    style={{
                                                        color: '#ef4444',
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        padding: '4px',
                                                        borderRadius: '4px',
                                                        transition: 'background-color 0.15s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                    title="Hapus"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Detail Modal */}
                {isModalOpen && selectedItem && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }}>
                        <div style={{
                            background: 'white',
                            borderRadius: '12px',
                            width: '100%',
                            maxWidth: '800px',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                        }}>
                            {/* Modal Header */}
                            <div style={{
                                padding: '24px',
                                borderBottom: '2px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)',
                                color: 'white',
                                borderRadius: '12px 12px 0 0',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                            }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#ffffff', letterSpacing: '0.3px' }}>📋 Detail Pemanfaatan Aset</h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-family)' }}>Informasi lengkap data kerjasama</p>
                                </div>
                                <button onClick={handleCloseModal} style={{
                                    background: 'rgba(255,255,255,0.15)',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    color: '#ffffff',
                                    fontSize: '20px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s',
                                    fontFamily: 'var(--font-family)'
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                >×</button>
                            </div>

                            {/* Modal Body */}
                            <div style={{ padding: '24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    {/* Objek */}
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Objek</label>
                                        <input
                                            type="text"
                                            name="objek"
                                            value={formData.objek || ''}
                                            onChange={handleInputChange}
                                            readOnly={!isEditMode}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                background: isEditMode ? 'white' : '#f9fafb',
                                                fontFamily: 'var(--font-family)'
                                            }}
                                        />
                                    </div>

                                    {/* Pemanfaatan */}
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Pemanfaatan</label>
                                        <input
                                            type="text"
                                            name="pemanfaatan"
                                            value={formData.pemanfaatan || ''}
                                            onChange={handleInputChange}
                                            readOnly={!isEditMode}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                background: isEditMode ? 'white' : '#f9fafb',
                                                fontFamily: 'var(--font-family)'
                                            }}
                                        />
                                    </div>

                                    {/* Luas */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Luas (m²)</label>
                                        <input
                                            type="text"
                                            name="luas"
                                            value={formData.luas || ''}
                                            onChange={handleInputChange}
                                            readOnly={!isEditMode}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                background: isEditMode ? 'white' : '#f9fafb',
                                                fontFamily: 'var(--font-family)'
                                            }}
                                        />
                                    </div>

                                    {/* Bentuk Pemanfaatan */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Bentuk Pemanfaatan</label>
                                        <input
                                            type="text"
                                            name="bentuk_pemanfaatan"
                                            value={formData.bentuk_pemanfaatan || ''}
                                            onChange={handleInputChange}
                                            readOnly={!isEditMode}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                background: isEditMode ? 'white' : '#f9fafb',
                                                fontFamily: 'var(--font-family)'
                                            }}
                                        />
                                    </div>

                                    {/* Pihak PKS */}
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Pihak PKS</label>
                                        <input
                                            type="text"
                                            name="pihak_pks"
                                            value={formData.pihak_pks || ''}
                                            onChange={handleInputChange}
                                            readOnly={!isEditMode}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                background: isEditMode ? 'white' : '#f9fafb',
                                                fontFamily: 'var(--font-family)'
                                            }}
                                        />
                                    </div>

                                    {/* No PKS */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Nomor PKS</label>
                                        <input
                                            type="text"
                                            name="no_pks"
                                            value={formData.no_pks || ''}
                                            onChange={handleInputChange}
                                            readOnly={!isEditMode}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                background: isEditMode ? 'white' : '#f9fafb',
                                                fontFamily: 'var(--font-family)'
                                            }}
                                        />
                                    </div>

                                    {/* Tgl PKS */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Tanggal PKS</label>
                                        <input
                                            type="text"
                                            name="tgl_pks"
                                            value={formData.tgl_pks || ''}
                                            onChange={handleInputChange}
                                            readOnly={!isEditMode}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                background: isEditMode ? 'white' : '#f9fafb',
                                                fontFamily: 'var(--font-family)'
                                            }}
                                        />
                                    </div>

                                    {/* Nilai Kompensasi */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Nilai Kompensasi</label>
                                        <input
                                            type="text"
                                            name="nilai_kompensasi"
                                            value={formData.nilai_kompensasi || ''}
                                            onChange={handleInputChange}
                                            readOnly={!isEditMode}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                background: isEditMode ? 'white' : '#f9fafb',
                                                fontFamily: 'var(--font-family)'
                                            }}
                                        />
                                    </div>

                                    {/* Jangka Waktu */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Jangka Waktu</label>
                                        <input
                                            type="text"
                                            name="jangka_waktu"
                                            value={formData.jangka_waktu || ''}
                                            onChange={handleInputChange}
                                            readOnly={!isEditMode}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                background: isEditMode ? 'white' : '#f9fafb',
                                                fontFamily: 'var(--font-family)'
                                            }}
                                        />
                                    </div>

                                    {/* No Persetujuan */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Nomor Persetujuan</label>
                                        <input
                                            type="text"
                                            name="no_persetujuan"
                                            value={formData.no_persetujuan || ''}
                                            onChange={handleInputChange}
                                            readOnly={!isEditMode}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                background: isEditMode ? 'white' : '#f9fafb',
                                                fontFamily: 'var(--font-family)'
                                            }}
                                        />
                                    </div>

                                    {/* Tgl Persetujuan */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Tanggal Persetujuan</label>
                                        <input
                                            type="text"
                                            name="tgl_persetujuan"
                                            value={formData.tgl_persetujuan || ''}
                                            onChange={handleInputChange}
                                            readOnly={!isEditMode}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                background: isEditMode ? 'white' : '#f9fafb',
                                                fontFamily: 'var(--font-family)'
                                            }}
                                        />
                                    </div>

                                    {/* No NTPN */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Nomor NTPN</label>
                                        <input
                                            type="text"
                                            name="no_ntpn"
                                            value={formData.no_ntpn || ''}
                                            onChange={handleInputChange}
                                            readOnly={!isEditMode}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                background: isEditMode ? 'white' : '#f9fafb',
                                                fontFamily: 'var(--font-family)'
                                            }}
                                        />
                                    </div>

                                    {/* Tgl NTPN */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Tanggal NTPN</label>
                                        <input
                                            type="text"
                                            name="tgl_ntpn"
                                            value={formData.tgl_ntpn || ''}
                                            onChange={handleInputChange}
                                            readOnly={!isEditMode}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                background: isEditMode ? 'white' : '#f9fafb',
                                                fontFamily: 'var(--font-family)'
                                            }}
                                        />
                                    </div>

                                    {/* Divider for Location Section */}
                                    <div style={{ gridColumn: '1 / -1', margin: '16px 0 8px 0', borderTop: '2px solid #e5e7eb', paddingTop: '16px' }}>
                                        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-family)' }}>
                                            📍 Koordinat Lokasi
                                            <span style={{ fontSize: '11px', fontWeight: '400', color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: '4px' }}>Opsional</span>
                                        </h4>
                                        <p style={{ margin: '0', fontSize: '11px', color: '#6b7280', fontFamily: 'var(--font-family)' }}>Isi koordinat untuk menampilkan lokasi di Peta Faslan dengan marker ungu</p>
                                    </div>

                                    {/* Longitude */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>🌐 Longitude</label>
                                        <input
                                            type="number"
                                            step="any"
                                            name="longitude"
                                            value={formData.longitude || ''}
                                            onChange={handleInputChange}
                                            readOnly={!isEditMode}
                                            placeholder="Contoh: 106.8456"
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                background: isEditMode ? 'white' : '#f9fafb',
                                                fontFamily: 'var(--font-family)'
                                            }}
                                        />
                                    </div>

                                    {/* Latitude */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>🌐 Latitude</label>
                                        <input
                                            type="number"
                                            step="any"
                                            name="latitude"
                                            value={formData.latitude || ''}
                                            onChange={handleInputChange}
                                            readOnly={!isEditMode}
                                            placeholder="Contoh: -6.2088"
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                background: isEditMode ? 'white' : '#f9fafb',
                                                fontFamily: 'var(--font-family)'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div style={{
                                padding: '16px 24px',
                                borderTop: '1px solid #e5e7eb',
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: '12px',
                                background: '#f9fafb'
                            }}>
                                <button
                                    onClick={handleDeleteFromModal}
                                    style={{
                                        padding: '8px 16px',
                                        background: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'background 0.15s',
                                        fontFamily: 'var(--font-family)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                                >
                                    🗑️ Hapus
                                </button>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {!isEditMode ? (
                                        <button
                                            onClick={handleEditToggle}
                                            style={{
                                                padding: '8px 16px',
                                                background: '#0066cc',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                fontWeight: '500',
                                                cursor: 'pointer',
                                                transition: 'background 0.15s',
                                                fontFamily: 'var(--font-family)'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#0052a3'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = '#0066cc'}
                                        >
                                            ✏️ Edit
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleEditToggle}
                                                style={{
                                                    padding: '8px 16px',
                                                    background: '#6b7280',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontSize: '13px',
                                                    fontWeight: '500',
                                                    cursor: 'pointer',
                                                    transition: 'background 0.15s',
                                                    fontFamily: 'var(--font-family)'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#4b5563'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#6b7280'}
                                            >
                                                ❌ Batal
                                            </button>
                                            <button
                                                onClick={handleSaveEdit}
                                                style={{
                                                    padding: '8px 16px',
                                                    background: '#10b981',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontSize: '13px',
                                                    fontWeight: '500',
                                                    cursor: 'pointer',
                                                    transition: 'background 0.15s',
                                                    fontFamily: 'var(--font-family)'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
                                            >
                                                💾 Simpan
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={handleCloseModal}
                                        style={{
                                            padding: '8px 16px',
                                            background: '#e5e7eb',
                                            color: '#374151',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            transition: 'background 0.15s',
                                            fontFamily: 'var(--font-family)'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#d1d5db'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = '#e5e7eb'}
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ErrorBoundary>
    )
}

export default Kerjasama
