import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as XLSX from 'xlsx';
import { downloadTemplate, validateImportData, mapColumnToField } from '../utils/importHelpers';
import MasterAssetList from './MasterAssetList';
import AssetFolderList from '../components/AssetFolderList';

function MasterAsset() {
    const [data, setData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [fileName, setFileName] = useState('');
    const [importMode, setImportMode] = useState('upsert'); // 'upsert', 'insert-only', 'update-only'
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState([]);
    const [importing, setImporting] = useState(false);
    const [importProgress, setImportProgress] = useState(null);
    const [validationErrors, setValidationErrors] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const fileInputRef = useRef(null);

    // --- FOLDER MANAGEMENT STATE ---
    const [viewMode, setViewMode] = useState('folders'); // 'folders' | 'detail'
    const [folders, setFolders] = useState([]);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [loadingFolders, setLoadingFolders] = useState(false);

    useEffect(() => {
        fetchFolders();
    }, []);

    const fetchFolders = async () => {
        setLoadingFolders(true);
        try {
            const res = await fetch('/api/structure/folders');
            if (res.ok) {
                setFolders(await res.json());
            } else if (res.status === 404) {
                // Endpoint not found - Server likely not updated
                console.error("API /api/structure/folders 404 Not Found");
                alert("⚠️ Backend Server belum ter-update.\n\nMohon RESTART terminal (Ctrl+C lalu npm run dev:full) agar fitur Folder berfungsi.");
            }
        } catch (error) {
            console.error("Error loading folders:", error);
        } finally {
            setLoadingFolders(false);
        }
    };

    const handleCreateFolder = async (data) => {
        try {
            const res = await fetch('/api/structure/folders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                fetchFolders();
            }
        } catch (error) {
            console.error("Error creating folder:", error);
            alert("Gagal membuat folder");
        }
    };

    const handleUpdateFolder = async (id, data) => {
        try {
            const res = await fetch(`/api/structure/folders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                fetchFolders();
            }
        } catch (error) {
            console.error("Error updating folder:", error);
            alert("Gagal update folder");
        }
    };

    const handleDeleteFolder = async (id) => {
        try {
            const res = await fetch(`/api/structure/folders/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchFolders();
            }
        } catch (error) {
            console.error("Error deleting folder:", error);
            alert("Gagal menghapus folder");
        }
    };

    const handleSelectFolder = (folder) => {
        setCurrentFolder(folder);
        setViewMode('detail');
    };

    const handleBackToFolders = () => {
        setCurrentFolder(null);
        setViewMode('folders');
        fetchFolders(); // Refresh counts
    };
    // -------------------------------

    const detectAssetType = (folder) => {
        if (!folder) return 'tanah';
        const name = folder.name.toLowerCase();
        if (name.includes('rumah negara') || name.includes('bangunan') || name.includes('rumneg')) {
            return 'bangunan';
        }
        return 'tanah';
    };

    // Helper function untuk format currency (Rupiah)
    const formatCurrency = (value) => {
        if (value === undefined || value === null || value === '') return '-';
        const num = parseFloat(value);
        if (isNaN(num)) return value;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    };

    // Helper function untuk format luas (dalam ribuan)
    const formatLuas = (value) => {
        if (value === undefined || value === null || value === '') return '-';
        const num = parseFloat(value);
        if (isNaN(num)) return value;
        return new Intl.NumberFormat('id-ID').format(num);
    };

    // Helper function untuk format header
    const formatHeader = (header) => {
        if (!header) return header;
        // Ganti "Luas Tanah Seluruhnya" menjadi "Luas Tanah (m2)"
        if (header.toLowerCase().includes('luas tanah seluruhnya')) {
            return 'Luas Tanah (m2)';
        }
        return header;
    };

    // Helper function untuk format cell value berdasarkan header
    const formatCellValue = (value, header) => {
        if (value === undefined || value === null || value === '') return '-';

        const headerLower = String(header || '').toLowerCase();

        // Format Nilai Perolehan sebagai currency
        if (headerLower.includes('nilai perolehan')) {
            return formatCurrency(value);
        }

        // Format Luas Tanah sebagai ribuan
        if (headerLower.includes('luas tanah')) {
            return formatLuas(value);
        }

        return String(value);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();

        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];

            const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });

            // Find Header Row (Scan first 20 rows)
            let headerRowIndex = 0;
            for (let i = 0; i < Math.min(20, rawData.length); i++) {
                const rowStr = JSON.stringify(rawData[i]).toUpperCase();
                // Check for mandatory or common columns
                if (rowStr.includes('NAMA') || rowStr.includes('NAME') || rowStr.includes('PERUMAHAN') || (rowStr.includes('NO') && (rowStr.includes('ASSET') || rowStr.includes('URUT')))) {
                    headerRowIndex = i;
                    break;
                }
            }

            if (rawData.length > headerRowIndex) {
                const headerRow = rawData[headerRowIndex];
                const contentRows = rawData.slice(headerRowIndex + 1);

                setHeaders(headerRow);
                setData(contentRows);
                setShowPreview(false);
            }
        };

        reader.readAsBinaryString(file);
    };

    const triggerFileUpload = () => {
        fileInputRef.current.click();
    };

    const handleDeleteAll = () => {
        if (confirm('Yakin ingin menghapus semua data?')) {
            setData([]);
            setHeaders([]);
            setFileName('');
            setShowPreview(false);
            setPreviewData([]);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleExport = () => {
        if (data.length === 0) {
            alert('Tidak ada data untuk diekspor');
            return;
        }

        const wsData = [headers, ...data];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Master Asset");
        XLSX.writeFile(wb, `Master_Asset_Export_${Date.now()}.xlsx`);
    };

    const transformDataForImport = () => {
        // Transform Excel data to API format
        return data.map((row, rowIndex) => {
            const asset = {};

            // 1. Map ALL columns from Excel using smart fuzzy matching
            headers.forEach((header, idx) => {
                if (!header) return;

                const fieldName = mapColumnToField(header);
                if (fieldName) {
                    let val = row[idx];
                    // Clean value
                    if (val !== undefined && val !== null && val !== '') {
                        val = String(val).trim();
                    } else {
                        val = null;
                    }
                    asset[fieldName] = val;
                }
            });

            // 2. Set 'name' field appropriately based on asset type
            // For Building Assets: name = area (perumahan/complex)
            // For Land Assets: name = nama_barang
            const assetType = detectAssetType(currentFolder);

            if (assetType === 'bangunan') {
                // Building: name should be the area/complex, not occupant name
                if (!asset.name) {
                    asset.name = asset.area || asset.occupant_name || `Building ${rowIndex + 1}`;
                }
                // Don't override nama_barang for buildings - it's not the primary identifier
            } else {
                // Land/Other: name comes from nama_barang
                if (!asset.name) {
                    asset.name = asset.nama_barang || asset.nama_asset || asset.area || '';
                }
                // Ensure nama_barang is set if name exists (for consistent display)
                if (asset.name && !asset.nama_barang) {
                    asset.nama_barang = asset.name;
                }
            }

            // 3. Set category from jenis_bmn or default
            if (!asset.category) {
                asset.category = asset.jenis_bmn || 'Tanah';
            }

            // 4. Map luas for legacy compatibility
            if (asset.luas_tanah_seluruhnya) {
                asset.luas = asset.luas_tanah_seluruhnya + ' m2';
            }

            // 5. Generate UNIQUE primary KEY 'code'
            // BMN data: kode_barang is a category code (shared by many items)
            // NUP (Nomor Urut Pendaftaran) makes it unique
            // Strategy: Use kode_barang-NUP if both exist, otherwise use available code

            if (asset.kode_barang && asset.nup) {
                // Combine for uniqueness: kode_barang-NUP
                asset.code = `${asset.kode_barang}-${asset.nup}`;
            } else if (asset.kode_barang) {
                asset.code = asset.kode_barang;
            } else if (asset.nup) {
                asset.code = asset.nup;
            } else {
                // Fallback: Do NOT search for random 'kode' columns to avoid picking up 'Kode Kota'
                // Just leave empty and let the next check handle it
            }

            // If still no code, generate one from row index
            if (!asset.code) {
                asset.code = `ROW_${rowIndex + 1}`;
            }

            return asset;
        }).filter(asset => asset.code !== null);
    };


    const handlePreview = () => {
        const transformed = transformDataForImport();
        const validation = validateImportData(transformed);

        setPreviewData(validation.validData);
        setValidationErrors(validation.errors);
        setShowPreview(true);

        if (validation.errors.length > 0) {
            alert(`⚠️ Ditemukan ${validation.errors.length} data yang tidak valid.\n\nSilakan cek preview untuk detail error.`);
        }
    };

    const handleImportToDatabase = async () => {
        const transformed = transformDataForImport();

        if (transformed.length === 0) {
            alert('Tidak ada data valid untuk diimport. Pastikan kolom "Kode" terisi.');
            return;
        }

        if (!confirm(`Anda akan mengimport ${transformed.length} data dengan mode "${getModeLabel(importMode)}". Lanjutkan?`)) {
            return;
        }

        setImporting(true);
        setImportProgress({ current: 0, total: transformed.length, status: 'Memulai import...' });

        const assetType = detectAssetType(currentFolder);
        const endpoint = assetType === 'bangunan' ? '/api/assets/bangunan/bulk-upsert' : '/api/assets/tanah/bulk-upsert';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    assets: transformed,
                    mode: importMode,
                    folder_id: currentFolder?.id,
                    source_file: fileName
                })
            });

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                if (response.status === 413) {
                    throw new Error("Ukuran file terlalu besar. Server menolak request (Payload Too Large). Coba kurangi jumlah data yang diimport sekaligus.");
                }
                const text = await response.text();
                // Check if it's a 404 HTML page (common cause: server not restarted)
                if (text.includes("<!DOCTYPE html>") || response.status === 404) {
                    throw new Error("Server belum mengenali endpoint ini. Mohon RESTART terminal server (Ctrl+C lalu npm run dev:full) agar update API terbaca.");
                }
                throw new Error(`Respon server tidak valid (${response.status}): ${text.substring(0, 100)}...`);
            }

            const result = await response.json();

            if (response.ok) {
                setImportProgress({
                    ...result,
                    status: 'Selesai!',
                    success: true
                });

                // Show detailed result
                let message = `✅ Import Berhasil!\n\n`;
                message += `Total: ${result.total} data\n`;
                message += `✅ Ditambahkan: ${result.inserted}\n`;
                message += `🔄 Diupdate: ${result.updated}\n`;
                if (result.failed > 0) {
                    message += `❌ Gagal: ${result.failed}\n\n`;
                    if (result.errors.length > 0) {
                        message += `Detail Error:\n`;
                        result.errors.slice(0, 5).forEach(err => {
                            message += `- Baris ${err.row} (${err.code}): ${err.error}\n`;
                        });
                        if (result.errors.length > 5) {
                            message += `... dan ${result.errors.length - 5} error lainnya\n`;
                        }
                    }
                }

                alert(message);

                // Clear data after successful import
                setTimeout(() => {
                    setData([]);
                    setHeaders([]);
                    setFileName('');
                    setShowPreview(false);
                    setPreviewData([]);
                    setImportProgress(null);
                    setRefreshKey(prev => prev + 1);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }, 2000);
            } else {
                throw new Error(result.error || 'Import gagal');
            }
        } catch (error) {
            console.error('Import error:', error);
            setImportProgress({
                status: 'Error!',
                success: false,
                error: error.message
            });
            alert(`❌ Import Gagal!\n\n${error.message}`);
        } finally {
            setImporting(false);
        }
    };

    const getModeLabel = (mode) => {
        switch (mode) {
            case 'upsert': return 'Tambah & Update Otomatis';
            case 'insert-only': return 'Hanya Tambah Data Baru';
            case 'update-only': return 'Hanya Update Data Existing';
            default: return mode;
        }
    };

    const getModeDescription = (mode) => {
        switch (mode) {
            case 'upsert': return 'Data baru akan ditambahkan, data existing akan diupdate berdasarkan Kode';
            case 'insert-only': return 'Hanya menambahkan data baru, akan error jika Kode sudah ada';
            case 'update-only': return 'Hanya mengupdate data yang sudah ada, data baru akan diabaikan';
            default: return '';
        }
    };

    if (viewMode === 'folders') {
        return (
            <AssetFolderList
                folders={folders}
                onCreate={handleCreateFolder}
                onEdit={handleUpdateFolder}
                onDelete={handleDeleteFolder}
                onSelect={handleSelectFolder}
            />
        );
    }

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <button
                    onClick={handleBackToFolders}
                    style={{
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s',
                        fontSize: '1.2rem'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translateX(-2px)'; e.currentTarget.style.borderColor = '#94a3b8'; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                    title="Kembali ke Folder"
                >
                    ⬅️
                </button>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>FOLDER</span>
                        <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>/</span>
                    </div>
                    <h1 className="page-title" style={{ margin: 0, fontSize: '1.5rem' }}>
                        {currentFolder ? currentFolder.name : 'Master Asset'}
                    </h1>
                </div>
            </div>

            {/* Description Card */}
            {currentFolder?.description && (
                <div style={{
                    background: '#f8fafc',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '24px',
                    borderLeft: '4px solid #3b82f6',
                    color: '#475569',
                    fontSize: '0.9rem'
                }}>
                    {currentFolder.description}
                </div>
            )}

            {/* Toolbar */}
            <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                        <h3 style={{ fontSize: '1rem', margin: '0 0 5px 0', fontWeight: '600' }}>Kelola Data</h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                            {fileName ? `File: ${fileName} (${data.length} baris)` : 'Belum ada file yang dipilih'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleFileUpload}
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                        />
                        <button
                            onClick={() => downloadTemplate(detectAssetType(currentFolder))}
                            className="btn btn-outline"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            disabled={importing}
                        >
                            <span>📥 Download Template</span>
                        </button>
                        <button
                            onClick={triggerFileUpload}
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            disabled={importing}
                        >
                            <span>📂 Import Excel</span>
                        </button>
                        {data.length > 0 && (
                            <>
                                <button
                                    onClick={handleExport}
                                    className="btn btn-outline"
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                    disabled={importing}
                                >
                                    <span>📤 Export Excel</span>
                                </button>
                                <button
                                    onClick={handleDeleteAll}
                                    className="btn btn-outline"
                                    style={{
                                        color: '#dc2626',
                                        borderColor: '#dc2626',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                    disabled={importing}
                                >
                                    <span>🗑️ Hapus Semua</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Import Mode Selection */}
            {data.length > 0 && !showPreview && (
                <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
                    <h3 style={{ fontSize: '1rem', margin: '0 0 15px 0', fontWeight: '600' }}>
                        🎯 Mode Import
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                        {['upsert', 'insert-only', 'update-only'].map((mode) => (
                            <div
                                key={mode}
                                onClick={() => !importing && setImportMode(mode)}
                                style={{
                                    padding: '15px',
                                    border: `2px solid ${importMode === mode ? '#003366' : '#e2e8f0'}`,
                                    borderRadius: '8px',
                                    cursor: importing ? 'not-allowed' : 'pointer',
                                    background: importMode === mode ? '#f0f9ff' : 'white',
                                    transition: 'all 0.2s',
                                    opacity: importing ? 0.6 : 1
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <input
                                        type="radio"
                                        checked={importMode === mode}
                                        onChange={() => setImportMode(mode)}
                                        disabled={importing}
                                        style={{ cursor: importing ? 'not-allowed' : 'pointer' }}
                                    />
                                    <strong style={{ fontSize: '0.9rem', color: '#1e293b' }}>
                                        {getModeLabel(mode)}
                                    </strong>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, paddingLeft: '24px' }}>
                                    {getModeDescription(mode)}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button
                            onClick={handlePreview}
                            className="btn btn-outline"
                            disabled={importing}
                        >
                            👁️ Preview Data
                        </button>
                        <button
                            onClick={handleImportToDatabase}
                            className="btn btn-primary"
                            disabled={importing}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            {importing ? (
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
                                    <span>Importing...</span>
                                </>
                            ) : (
                                <>
                                    <span>🚀 Import ke Database</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Import Progress */}
            {importProgress && (
                <div className="card" style={{ marginBottom: '20px', padding: '20px', background: importProgress.success ? '#f0fdf4' : '#fef2f2' }}>
                    <h3 style={{ fontSize: '1rem', margin: '0 0 15px 0', fontWeight: '600', color: importProgress.success ? '#166534' : '#991b1b' }}>
                        {importProgress.status}
                    </h3>
                    {importProgress.success && (
                        <div style={{ fontSize: '0.9rem', color: '#166534' }}>
                            <p style={{ margin: '5px 0' }}>✅ Ditambahkan: <strong>{importProgress.inserted}</strong></p>
                            <p style={{ margin: '5px 0' }}>🔄 Diupdate: <strong>{importProgress.updated}</strong></p>
                            {importProgress.failed > 0 && (
                                <p style={{ margin: '5px 0', color: '#dc2626' }}>❌ Gagal: <strong>{importProgress.failed}</strong></p>
                            )}
                        </div>
                    )}
                    {importProgress.error && (
                        <p style={{ color: '#991b1b', margin: '10px 0 0 0' }}>{importProgress.error}</p>
                    )}
                </div>
            )}

            {/* Preview Mode */}
            {showPreview && (previewData.length > 0 || validationErrors.length > 0) && (
                <>
                    {/* Validation Errors */}
                    {validationErrors.length > 0 && (
                        <div className="card" style={{ marginBottom: '20px', padding: '20px', background: '#fef2f2', border: '1px solid #fecaca' }}>
                            <h3 style={{ fontSize: '1rem', margin: '0 0 15px 0', fontWeight: '600', color: '#991b1b' }}>
                                ⚠️ Data Tidak Valid ({validationErrors.length})
                            </h3>
                            <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                                {validationErrors.map((error, idx) => (
                                    <div key={idx} style={{
                                        padding: '10px',
                                        marginBottom: '8px',
                                        background: 'white',
                                        borderRadius: '6px',
                                        border: '1px solid #fecaca'
                                    }}>
                                        <div style={{ fontSize: '0.85rem', color: '#991b1b', fontWeight: '600' }}>
                                            Baris {error.row} - Kode: {error.code}
                                        </div>
                                        <ul style={{ margin: '5px 0 0 20px', fontSize: '0.8rem', color: '#dc2626' }}>
                                            {error.errors.map((err, errIdx) => (
                                                <li key={errIdx}>{err}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                            <p style={{ fontSize: '0.85rem', color: '#991b1b', margin: '15px 0 0 0' }}>
                                💡 Perbaiki data di Excel dan upload ulang untuk melanjutkan import.
                            </p>
                        </div>
                    )}

                    {/* Valid Data Preview */}
                    {previewData.length > 0 && (
                        <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: '600' }}>
                                    👁️ Preview Data Valid ({previewData.length})
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowPreview(false);
                                        setValidationErrors([]);
                                    }}
                                    className="btn btn-outline"
                                    style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                                >
                                    ✕ Tutup Preview
                                </button>
                            </div>
                            <div style={{
                                maxHeight: '400px',
                                overflow: 'auto',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px'
                            }}>
                                <table className="table table-compact" style={{ marginBottom: 0 }}>
                                    <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 10 }}>
                                        <tr>
                                            <th style={{ padding: '8px', fontSize: '0.75rem' }}>No</th>
                                            <th style={{ padding: '8px', fontSize: '0.75rem' }}>Kode</th>
                                            <th style={{ padding: '8px', fontSize: '0.75rem' }}>Nama</th>
                                            <th style={{ padding: '8px', fontSize: '0.75rem' }}>Kategori</th>
                                            <th style={{ padding: '8px', fontSize: '0.75rem' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewData.slice(0, 50).map((asset, idx) => (
                                            <tr key={idx}>
                                                <td style={{ padding: '6px 8px', fontSize: '0.75rem' }}>{idx + 1}</td>
                                                <td style={{ padding: '6px 8px', fontSize: '0.75rem' }}>{asset.code || '-'}</td>
                                                <td style={{ padding: '6px 8px', fontSize: '0.75rem' }}>{asset.name || '-'}</td>
                                                <td style={{ padding: '6px 8px', fontSize: '0.75rem' }}>{asset.category || '-'}</td>
                                                <td style={{ padding: '6px 8px', fontSize: '0.75rem' }}>{asset.status || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {previewData.length > 50 && (
                                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '10px 0 0 0', textAlign: 'center' }}>
                                    Menampilkan 50 dari {previewData.length} data valid
                                </p>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Table */}
            {data.length > 0 ? (
                <div className="card" style={{
                    padding: 0,
                    overflow: 'hidden',
                    maxWidth: 'calc(100vw - var(--sidebar-width) - 48px)'
                }}>
                    {/* SCROLL CONTAINER - Horizontal */}
                    <div
                        id="table-scroll-container"
                        className="table-scroll-container"
                        style={{
                            width: '100%',
                            maxHeight: '65vh',
                            overflowX: 'scroll',
                            overflowY: 'auto',
                            WebkitOverflowScrolling: 'touch',
                            scrollBehavior: 'smooth'
                        }}
                    >
                        <table
                            className="table table-compact"
                            style={{
                                minWidth: `${Math.max(headers.length * 150, 2000)}px`,
                                width: 'max-content',
                                tableLayout: 'auto',
                                marginBottom: 0,
                                borderCollapse: 'collapse'
                            }}
                        >
                            <thead>
                                <tr style={{ background: 'linear-gradient(180deg, #003366 0%, #001f3f 100%)' }}>
                                    {headers.map((header, idx) => (
                                        <th key={idx} style={{
                                            padding: '10px 14px',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            color: '#ffffff',
                                            borderBottom: '2px solid #001f3f',
                                            whiteSpace: 'nowrap',
                                            minWidth: '120px',
                                            position: 'sticky',
                                            top: 0,
                                            background: 'linear-gradient(180deg, #003366 0%, #001f3f 100%)',
                                            zIndex: 10,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {formatHeader(header) || `Kolom ${idx + 1}`}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row, rowIdx) => (
                                    <tr key={rowIdx} style={{
                                        background: rowIdx % 2 === 0 ? 'white' : '#f0f9ff',
                                        transition: 'background 0.15s'
                                    }}>
                                        {headers.map((header, colIdx) => {
                                            const headerLower = String(header || '').toLowerCase();
                                            const isNilaiPerolehan = headerLower.includes('nilai perolehan');
                                            const isLuasTanah = headerLower.includes('luas tanah');

                                            return (
                                                <td key={colIdx} style={{
                                                    padding: '8px 14px',
                                                    fontSize: '0.8rem',
                                                    color: isNilaiPerolehan ? '#059669' : '#1e293b',
                                                    borderBottom: '1px solid #e2e8f0',
                                                    whiteSpace: 'nowrap',
                                                    fontWeight: isNilaiPerolehan ? '600' : '400',
                                                    textAlign: (isNilaiPerolehan || isLuasTanah) ? 'right' : 'left'
                                                }}>
                                                    {formatCellValue(row[colIdx], header)}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Info */}
                    <div style={{
                        padding: '12px 16px',
                        background: 'linear-gradient(180deg, #003366 0%, #001f3f 100%)',
                        fontSize: '0.85rem',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            📊 Total: <strong>{data.length}</strong> baris × <strong>{headers.length}</strong> kolom
                        </div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                            ↔️ Gunakan scroll mouse/trackpad untuk geser tabel
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ marginTop: '20px' }}>
                    <MasterAssetList
                        key={refreshKey}
                        folderId={currentFolder?.id}
                        assetType={detectAssetType(currentFolder)}
                    />
                </div>
            )}

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div >
    );
}

MasterAsset.propTypes = {};

export default MasterAsset;
