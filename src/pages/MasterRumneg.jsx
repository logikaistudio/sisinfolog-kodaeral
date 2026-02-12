import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

function MasterRumneg() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Selection State
    const [selectedIds, setSelectedIds] = useState([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    // Editor State
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [isNewItem, setIsNewItem] = useState(false);

    // Import State
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [previewData, setPreviewData] = useState([]);

    // --- FETCH DATA ---
    const fetchData = async () => {
        setLoading(true);
        try {
            // Gunakan relative path agar diproxy vite ke backend yang benar
            const response = await fetch('/api/assets/rumneg');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result = await response.json();
            // Validasi format data array
            setData(Array.isArray(result) ? result : []);
            setSelectedIds([]); // Reset selection on refresh
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

    // --- SELECTION LOGIC ---
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(data.map(item => item.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id, e) => {
        e.stopPropagation();
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedIds([]); // Reset saat toggle
    };

    // --- DELETE LOGIC ---
    const handleDeleteMulti = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Yakin ingin menghapus ${selectedIds.length} data terpilih?`)) return;

        setLoading(true);
        try {
            const response = await fetch('/api/assets/rumneg/bulk', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds })
            });

            if (response.ok) {
                alert('Data terpilih berhasil dihapus');
                fetchData();
                setIsSelectionMode(false); // Keluar mode hapus setelah sukses
            }
        } catch (error) {
            console.error('Error deleting multiple:', error);
            alert('Gagal menghapus data');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAll = async () => {
        if (!confirm('PERINGATAN: Apakah Anda yakin ingin MENGHAPUS SEMUA DATA assets rumneg? Tindakan ini tidak dapat dibatalkan!')) return;

        setLoading(true);
        try {
            const response = await fetch('/api/assets/rumneg/all', {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Semua data berhasil dihapus');
                fetchData();
            }
        } catch (error) {
            console.error('Error deleting all:', error);
            alert('Gagal menghapus data');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async () => {
        if (!confirm('Yakin ingin menghapus data ini?')) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/assets/rumneg/${currentItem.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setIsEditorOpen(false);
                fetchData();
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('Gagal menghapus data');
        } finally {
            setLoading(false);
        }
    };

    // --- EDITOR LOGIC ---
    const handleRowClick = (item) => {
        if (isSelectionMode) {
            // Jika mode seleksi, klik baris = select/deselect
            if (selectedIds.includes(item.id)) {
                setSelectedIds(selectedIds.filter(id => id !== item.id));
            } else {
                setSelectedIds([...selectedIds, item.id]);
            }
        } else {
            // Mode normal = buka editor
            setCurrentItem({ ...item });
            setIsNewItem(false);
            setIsEditorOpen(true);
        }
    };

    const handleAddNew = () => {
        setCurrentItem({});
        setIsNewItem(true);
        setIsEditorOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = isNewItem
                ? '/api/assets/rumneg/bulk' // Menggunakan bulk dulu untuk single insert
                : `/api/assets/rumneg/${currentItem.id}`;

            const method = isNewItem ? 'POST' : 'PUT';
            const body = isNewItem ? JSON.stringify([currentItem]) : JSON.stringify(currentItem);

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: body
            });

            if (response.ok) {
                setIsEditorOpen(false);
                fetchData();
            } else {
                alert('Gagal menyimpan data');
            }
        } catch (error) {
            console.error('Error saving:', error);
            alert('Terjadi kesalahan saat menyimpan');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setCurrentItem({ ...currentItem, [field]: value });
    };

    // --- EXCEL & EXPORT LOGIC ---
    const downloadTemplate = () => {
        const template = [
            {
                'NAMA': 'Contoh Nama',
                'PANGKAT/KORPS': 'Mayor Laut',
                'NRP/NIP': '123456',
                'PERUMAHAN': 'Lagoa',
                'ALAMAT': 'Jl. Contoh No. 1',
                'LON': '106.8456',
                'LAT': '-6.2088',
                'STATUS PENGHUNI': 'Dinas',
                'NO SIP': 'SIP/001/2024',
                'TGL SIP': '2024-01-15',
                'TIPE': 'A',
                'GOLONGAN': 'III',
                'TAHUN BUAT': '2020',
                'ASAL PEROLEHAN': 'Pembelian',
                'MENDAPAT FASDIN': 'Dapat',
                'KONDISI': 'Baik',
                'KETERANGAN': 'Contoh keterangan'
            }
        ];
        const ws = XLSX.utils.json_to_sheet(template);
        // Auto width untuk template
        const wscols = [
            { wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 30 },
            { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 20 }, { wch: 15 },
            { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 30 }
        ];
        ws['!cols'] = wscols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template Rumneg');
        XLSX.writeFile(wb, 'Template_Master_Rumneg.xlsx');
    };

    const handleExportData = () => {
        if (data.length === 0) {
            alert('Tidak ada data untuk diexport');
            return;
        }

        const exportData = data.map((item, index) => ({
            'No': index + 1,
            'Nama Penghuni': item.occupant_name || '-',
            'Pangkat/Korps': item.occupant_rank || '-',
            'NRP/NIP': item.occupant_nrp || '-',
            'Perumahan': item.area || '-',
            'Alamat': item.alamat_detail || '-',
            'Status Penghuni': item.status_penghuni || '-',
            'No SIP': item.no_sip || '-',
            'Tgl SIP': item.tgl_sip || '-',
            'Tipe': item.tipe_rumah || '-',
            'Gol': item.golongan || '-',
            'Tahun Buat': item.tahun_buat || '-',
            'Asal Perolehan': item.asal_perolehan || '-',
            'Fasdin': item.mendapat_fasdin || '-',
            'Kondisi': item.kondisi || '-',
            'Keterangan': item.keterangan || '-'
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);

        // Auto Column Width Calculation
        const wscols = Object.keys(exportData[0]).map(key => {
            return { wch: Math.max(key.length, 10, ...exportData.map(row => String(row[key] || '').length)) + 2 };
        });
        ws['!cols'] = wscols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Data Rumneg');
        XLSX.writeFile(wb, `Data_Aset_Rumneg_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const workbook = XLSX.read(event.target.result, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            const getValue = (row, keys) => {
                const rowKeys = Object.keys(row);
                for (const key of keys) {
                    const foundKey = rowKeys.find(k => k.trim().toLowerCase() === key.toLowerCase());
                    if (foundKey) return row[foundKey];
                }
                return '';
            };

            const transformedData = jsonData.map((row, index) => ({
                id: `temp-${index}`,
                occupant_name: getValue(row, ['NAMA', 'nama', 'Nama Lengkap', 'Nama']),
                occupant_rank: getValue(row, ['PANGKAT/KORPS', 'pangkat', 'korps', 'Pangkat']),
                occupant_nrp: getValue(row, ['NRP/NIP', 'nrp', 'nip', 'NRP', 'NIP']),
                area: getValue(row, ['PERUMAHAN', 'perumahan', 'Komplek', 'Area']),
                alamat_detail: getValue(row, ['ALAMAT', 'alamat', 'Lokasi']),
                longitude: getValue(row, ['LON', 'lon', 'longitude', 'Longitude']),
                latitude: getValue(row, ['LAT', 'lat', 'latitude', 'Latitude']),
                status_penghuni: getValue(row, ['STATUS PENGHUNI', 'status penghuni', 'Status']),
                no_sip: getValue(row, ['NO SIP', 'no sip', 'Nomor SIP']),
                tgl_sip: getValue(row, ['TGL SIP', 'tgl sip', 'Tanggal SIP']),
                tipe_rumah: getValue(row, ['TIPE', 'tipe', 'Type']),
                golongan: getValue(row, ['GOLONGAN', 'golongan', 'Gol']),
                tahun_buat: getValue(row, ['TAHUN BUAT', 'tahun buat', 'Tahun']),
                asal_perolehan: getValue(row, ['ASAL PEROLEHAN', 'asal perolehan', 'Asal']),
                mendapat_fasdin: getValue(row, ['MENDAPAT FASDIN', 'mendapat fasdin', 'Fasdin']),
                kondisi: getValue(row, ['KONDISI', 'kondisi']),
                keterangan: getValue(row, ['KETERANGAN', 'keterangan', 'Ket'])
            }));

            setPreviewData(transformedData);
        };
        reader.readAsBinaryString(file);
    };

    const handleImport = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/assets/rumneg/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(previewData)
            });

            if (response.ok) {
                alert('Data berhasil diimport!');
                setImportModalOpen(false);
                setPreviewData([]);
                fetchData();
            } else {
                alert('Gagal import data');
            }
        } catch (error) {
            console.error('Error importing:', error);
            alert('Error saat import data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            {/* Header */}
            <div className="page-header" style={{ marginBottom: '16px' }}>
                <div>
                    <h1 className="page-title">Master Data Aset Rumneg</h1>
                    <p className="page-subtitle">Kelola data rumah negara dan penghuni</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {/* Delete Actions */}
                    <button
                        onClick={toggleSelectionMode}
                        style={{
                            padding: '8px 16px',
                            background: isSelectionMode ? '#94a3b8' : '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                        }}
                    >
                        {isSelectionMode ? 'Batal Hapus' : '🗑️ Mode Hapus Multi'}
                    </button>

                    {isSelectionMode && selectedIds.length > 0 && (
                        <button
                            onClick={handleDeleteMulti}
                            style={{
                                padding: '8px 16px',
                                background: '#dc2626',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: '600'
                            }}
                        >
                            Konfirmasi Hapus ({selectedIds.length})
                        </button>
                    )}

                    {!isSelectionMode && (
                        <button
                            onClick={handleDeleteAll}
                            style={{
                                padding: '8px 16px',
                                background: 'white',
                                color: '#ef4444',
                                border: '1px solid #ef4444',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: '600'
                            }}
                        >
                            ⚠️ Reset DB
                        </button>
                    )}

                    {/* Import/Export Actions */}
                    <button
                        onClick={handleExportData}
                        style={{
                            padding: '8px 16px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '600'
                        }}
                    >
                        📊 Export Excel
                    </button>
                    <button
                        onClick={downloadTemplate}
                        style={{
                            padding: '8px 16px',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '600'
                        }}
                    >
                        📥 Template
                    </button>
                    <button
                        onClick={() => setImportModalOpen(true)}
                        style={{
                            padding: '8px 16px',
                            background: '#0ea5e9',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '600'
                        }}
                    >
                        📤 Import
                    </button>
                    <button
                        onClick={handleAddNew}
                        style={{
                            padding: '8px 16px',
                            background: '#6366f1',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '600'
                        }}
                    >
                        + Baru
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                marginBottom: '16px'
            }}>
                <div className="card" style={{ padding: '12px', borderLeft: '4px solid #0ea5e9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Data</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>{data.length}</div>
                    </div>
                </div>
                <div className="card" style={{ padding: '12px', borderLeft: '4px solid #10b981', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Kondisi Baik</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
                            {data.filter(d => d.kondisi?.toLowerCase() === 'baik').length}
                        </div>
                    </div>
                </div>
                <div className="card" style={{ padding: '12px', borderLeft: '4px solid #f59e0b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Perlu Perbaikan</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
                            {data.filter(d => d.kondisi?.toLowerCase().includes('rusak')).length}
                        </div>
                    </div>
                </div>
                <div className="card" style={{ padding: '12px', borderLeft: '4px solid #6366f1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Ditempati</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
                            {data.filter(d => d.occupant_name && d.occupant_name !== '-').length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '0.75rem', // Smaller font for efficiency
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', height: '36px' }}>
                                {isSelectionMode && (
                                    <th style={{ padding: '4px 8px', width: '30px', textAlign: 'center' }}>
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={data.length > 0 && selectedIds.length === data.length}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </th>
                                )}
                                <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '600', color: '#475569', width: '30px' }}>No</th>
                                <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '600', color: '#475569', minWidth: '160px' }}>Penghuni & Pangkat</th>
                                <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '600', color: '#475569', minWidth: '100px' }}>Perumahan</th>
                                <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '600', color: '#475569', minWidth: '180px' }}>Alamat</th>
                                <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '600', color: '#475569', width: '80px' }}>Status</th>
                                <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '600', color: '#475569', minWidth: '100px' }}>No SIP</th>
                                <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: '600', color: '#475569', width: '50px' }}>Tipe</th>
                                <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: '600', color: '#475569', width: '40px' }}>Gol</th>
                                <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: '600', color: '#475569', width: '50px' }}>Thn</th>
                                <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '600', color: '#475569', minWidth: '80px' }}>Asal</th>
                                <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: '600', color: '#475569', width: '60px' }}>Fasdin</th>
                                <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: '600', color: '#475569', width: '80px' }}>Kondisi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && data.length === 0 ? (
                                <tr><td colSpan="15" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>⏳ Memuat data...</td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan="15" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>📭 Belum ada data. Silakan import atau tambah data.</td></tr>
                            ) : (
                                data.map((row, index) => (
                                    <tr
                                        key={row.id}
                                        onClick={() => handleRowClick(row)}
                                        style={{
                                            borderBottom: '1px solid #f1f5f9',
                                            cursor: 'pointer',
                                            transition: 'background 0.1s',
                                            background: selectedIds.includes(row.id) ? '#e0f2fe' : 'white',
                                            height: '32px' // Compact row height
                                        }}
                                        onMouseEnter={(e) => { if (!selectedIds.includes(row.id)) e.currentTarget.style.background = '#f8fafc' }}
                                        onMouseLeave={(e) => { if (!selectedIds.includes(row.id)) e.currentTarget.style.background = 'white' }}
                                    >
                                        {isSelectionMode && (
                                            <td style={{ padding: '4px 8px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(row.id)}
                                                    onChange={(e) => handleSelectRow(row.id, e)}
                                                />
                                            </td>
                                        )}
                                        <td style={{ padding: '4px 8px', color: '#64748b', textAlign: 'center' }}>{index + 1}</td>
                                        <td style={{ padding: '4px 8px' }}>
                                            <div style={{ lineHeight: '1.2' }}>
                                                <div style={{ fontWeight: '600', color: '#1e293b' }}>{row.occupant_name || '-'}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                                    {row.occupant_rank} {row.occupant_nrp ? `(${row.occupant_nrp})` : ''}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '4px 8px', color: '#334155' }}>{row.area || '-'}</td>
                                        <td style={{ padding: '4px 8px', color: '#64748b' }}>
                                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }} title={row.alamat_detail}>
                                                {row.alamat_detail || '-'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '4px 8px', color: '#334155' }}>{row.status_penghuni || '-'}</td>
                                        <td style={{ padding: '4px 8px', color: '#64748b' }}>
                                            <div style={{ fontSize: '0.7rem' }}>
                                                <span title={row.no_sip}>{row.no_sip || '-'}</span>
                                                {row.tgl_sip && <div style={{ color: '#94a3b8' }}>{row.tgl_sip}</div>}
                                            </div>
                                        </td>
                                        <td style={{ padding: '4px 8px', textAlign: 'center', color: '#334155' }}>{row.tipe_rumah || '-'}</td>
                                        <td style={{ padding: '4px 8px', textAlign: 'center', color: '#334155' }}>{row.golongan || '-'}</td>
                                        <td style={{ padding: '4px 8px', textAlign: 'center', color: '#64748b' }}>{row.tahun_buat || '-'}</td>
                                        <td style={{ padding: '4px 8px', color: '#64748b' }}>{row.asal_perolehan || '-'}</td>
                                        <td style={{ padding: '4px 8px', textAlign: 'center' }}>
                                            {row.mendapat_fasdin?.toLowerCase() === 'dapat' && (
                                                <span style={{ color: '#059669', fontWeight: 'bold' }}>✓</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '4px 8px', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '600',
                                                background: row.kondisi?.toLowerCase() === 'baik' ? '#dcfce7' :
                                                    row.kondisi?.toLowerCase().includes('rusak') ? '#fee2e2' :
                                                        row.kondisi?.toLowerCase() === 'renovasi' ? '#fef9c3' : '#f1f5f9',
                                                color: row.kondisi?.toLowerCase() === 'baik' ? '#166534' :
                                                    row.kondisi?.toLowerCase().includes('rusak') ? '#991b1b' :
                                                        row.kondisi?.toLowerCase() === 'renovasi' ? '#854d0e' : '#475569'
                                            }}>
                                                {row.kondisi || '-'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* EDITOR MODAL (Same as before but compact) */}
            {isEditorOpen && currentItem && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }} onClick={() => setIsEditorOpen(false)}>
                    <div className="card" style={{ width: '90%', maxWidth: '800px', maxHeight: '90vh', overflow: 'auto', padding: '20px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{isNewItem ? 'Tambah Data Aset' : 'Edit Data Aset'}</h2>
                            <button onClick={() => setIsEditorOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
                        </div>

                        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {/* Identitas Penghuni */}
                            <div style={{ gridColumn: 'span 2', fontWeight: '600', color: '#0f172a', fontSize: '0.9rem', marginTop: '4px' }}>👤 Identitas Penghuni</div>
                            <div>
                                <label className="form-label">Nama Lengkap</label>
                                <input className="form-input" value={currentItem.occupant_name || ''} onChange={(e) => handleInputChange('occupant_name', e.target.value)} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <div>
                                    <label className="form-label">Pangkat</label>
                                    <input className="form-input" value={currentItem.occupant_rank || ''} onChange={(e) => handleInputChange('occupant_rank', e.target.value)} />
                                </div>
                                <div>
                                    <label className="form-label">NRP/NIP</label>
                                    <input className="form-input" value={currentItem.occupant_nrp || ''} onChange={(e) => handleInputChange('occupant_nrp', e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label className="form-label">Status Penghuni</label>
                                <input className="form-input" value={currentItem.status_penghuni || ''} onChange={(e) => handleInputChange('status_penghuni', e.target.value)} />
                            </div>

                            {/* Lokasi */}
                            <div style={{ gridColumn: 'span 2', fontWeight: '600', color: '#0f172a', fontSize: '0.9rem', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>📍 Lokasi & Fisik</div>
                            <div>
                                <label className="form-label">Nama Perumahan/Area</label>
                                <input className="form-input" value={currentItem.area || ''} onChange={(e) => handleInputChange('area', e.target.value)} />
                            </div>
                            <div>
                                <label className="form-label">Alamat Lengkap</label>
                                <input className="form-input" value={currentItem.alamat_detail || ''} onChange={(e) => handleInputChange('alamat_detail', e.target.value)} />
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="form-label">Tipe Rumah</label>
                                    <input className="form-input" value={currentItem.tipe_rumah || ''} onChange={(e) => handleInputChange('tipe_rumah', e.target.value)} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="form-label">Golongan</label>
                                    <input className="form-input" value={currentItem.golongan || ''} onChange={(e) => handleInputChange('golongan', e.target.value)} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="form-label">Tahun Buat</label>
                                    <input className="form-input" value={currentItem.tahun_buat || ''} onChange={(e) => handleInputChange('tahun_buat', e.target.value)} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="form-label">Kondisi</label>
                                    <select className="form-input" value={currentItem.kondisi || ''} onChange={(e) => handleInputChange('kondisi', e.target.value)}>
                                        <option value="">- Pilih -</option>
                                        <option value="Baik">Baik</option>
                                        <option value="Rusak Ringan">Rusak Ringan</option>
                                        <option value="Rusak Berat">Rusak Berat</option>
                                        <option value="Renovasi">Renovasi</option>
                                    </select>
                                </div>
                            </div>

                            {/* Administrasi */}
                            <div style={{ gridColumn: 'span 2', fontWeight: '600', color: '#0f172a', fontSize: '0.9rem', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>📄 Administrasi</div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <div style={{ flex: 2 }}>
                                    <label className="form-label">Nomor SIP</label>
                                    <input className="form-input" value={currentItem.no_sip || ''} onChange={(e) => handleInputChange('no_sip', e.target.value)} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="form-label">Tanggal SIP</label>
                                    <input className="form-input" value={currentItem.tgl_sip || ''} onChange={(e) => handleInputChange('tgl_sip', e.target.value)} placeholder="DD/MM/YYYY" />
                                </div>
                            </div>
                            <div>
                                <label className="form-label">Asal Perolehan</label>
                                <input className="form-input" value={currentItem.asal_perolehan || ''} onChange={(e) => handleInputChange('asal_perolehan', e.target.value)} />
                            </div>
                            <div>
                                <label className="form-label">Mendapat Fasdin?</label>
                                <select className="form-input" value={currentItem.mendapat_fasdin || ''} onChange={(e) => handleInputChange('mendapat_fasdin', e.target.value)}>
                                    <option value="">- Pilih -</option>
                                    <option value="Dapat">Dapat</option>
                                    <option value="Tidak Dapat">Tidak Dapat</option>
                                </select>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Keterangan Tambahan</label>
                                <textarea className="form-input" value={currentItem.keterangan || ''} onChange={(e) => handleInputChange('keterangan', e.target.value)} style={{ minHeight: '60px' }} />
                            </div>


                            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                                {!isNewItem ? (
                                    <button type="button" onClick={handleDeleteItem} style={{ padding: '8px 16px', background: 'white', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                                        🗑️ Hapus
                                    </button>
                                ) : <div></div>}
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button type="button" onClick={() => setIsEditorOpen(false)} style={{ padding: '8px 16px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                                        Batal
                                    </button>
                                    <button type="submit" style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                                        💾 Simpan
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* IMPORT MODAL */}
            {importModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{ width: '90%', maxWidth: '800px', maxHeight: '80vh', overflow: 'auto', padding: '24px' }}>
                        <h2 style={{ marginTop: 0, marginBottom: '16px' }}>Import Data Excel</h2>
                        <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} style={{ marginBottom: '16px' }} />
                        {previewData.length > 0 && (
                            <>
                                <p style={{ color: '#64748b', marginBottom: '12px' }}>Preview: {previewData.length} baris data</p>
                                <div style={{ maxHeight: '300px', overflow: 'auto', marginBottom: '16px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                    <table style={{ width: '100%', fontSize: '0.875rem' }}>
                                        <thead style={{ position: 'sticky', top: 0, background: '#f8fafc' }}>
                                            <tr><th style={{ padding: '8px' }}>Nama</th><th style={{ padding: '8px' }}>Perumahan</th><th style={{ padding: '8px' }}>Kondisi</th></tr>
                                        </thead>
                                        <tbody>
                                            {previewData.slice(0, 10).map((row, idx) => (
                                                <tr key={idx}><td style={{ padding: '8px' }}>{row.occupant_name}</td><td style={{ padding: '8px' }}>{row.area}</td><td style={{ padding: '8px' }}>{row.kondisi}</td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button onClick={() => { setImportModalOpen(false); setPreviewData([]); }} style={{ padding: '10px 20px', background: '#64748b', color: 'white', borderRadius: '8px', border: 'none' }}>Batal</button>
                            <button onClick={handleImport} disabled={previewData.length === 0} style={{ padding: '10px 20px', background: previewData.length === 0 ? '#cbd5e1' : '#10b981', color: 'white', borderRadius: '8px', border: 'none' }}>Import {previewData.length} Data</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .form-input {
                    width: 100%;
                    padding: 8px 10px;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    transition: border-color 0.2s;
                }
                .form-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
                }
                .form-label {
                    display: block;
                    font-size: 0.75rem;
                    color: #64748b;
                    margin-bottom: 4px;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
}

export default MasterRumneg;
