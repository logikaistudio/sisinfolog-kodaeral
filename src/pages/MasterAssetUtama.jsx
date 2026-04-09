import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

const FONT_SYSTEM = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const FONT_MONO = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

// Dropdown options
const OPTIONS = {
    jenis_bmn: ['Tanah', 'Gedung dan Bangunan', 'Peralatan dan Mesin', 'Jalan Irigasi Jaringan', 'Aset Tetap Lainnya', 'Konstruksi Dalam Pengerjaan'],
    kondisi: ['Baik', 'Rusak Ringan', 'Rusak Berat'],
    status_bmn: ['Digunakan', 'Tidak Digunakan', 'Dimanfaatkan', 'Dalam Proses Penghapusan'],
    intra_extra: ['Intrakomptabel', 'Ekstrakomptabel'],
    henti_guna: ['Ya', 'Tidak'],
    status_sbsn: ['Ya', 'Tidak'],
    status_bmn_idle: ['Ya', 'Tidak'],
    status_kemitraan: ['Ya', 'Tidak'],
    bpybds: ['Ya', 'Tidak'],
    usulan_barang_hilang: ['Ya', 'Tidak'],
    usulan_barang_rb: ['Ya', 'Tidak'],
    usul_hapus: ['Ya', 'Tidak'],
    hibah_dktp: ['Ya', 'Tidak'],
    konsesi_jasa: ['Ya', 'Tidak'],
    properti_investasi: ['Ya', 'Tidak'],
    jenis_dokumen: ['Sertifikat Hak Milik (SHM)', 'Sertifikat HGB', 'Sertifikat HGU', 'Sertifikat SHSRS', 'Sertifikat HPL', 'Akta Jual Beli', 'Girik/Letter C', 'SPPT PBB', 'Lainnya'],
    status_sertifikasi: ['Bersertifikat', 'Belum Bersertifikat', 'Dalam Proses Sertifikasi'],
    jenis_sertifikat: ['SHM', 'SHGB', 'SHGU', 'SHSRS', 'HPL', 'HGB Pinjam Pakai', 'Lainnya'],
    status_bangunan: ['Permanen', 'Semi Permanen', 'Tidak Permanen'],
    optimalisasi: ['Ya', 'Tidak'],
    sbsk: ['Sesuai SBSK', 'Melebihi SBSK', 'Kurang dari SBSK'],
    status_pmk: ['Ya', 'Tidak'],
};

// All columns with full metadata
const ALL_COLUMNS = [
    { key: 'jenis_bmn', label: 'Jenis BMN', section: 'Identitas', dropdown: true },
    { key: 'kode_satker', label: 'Kode Satker', section: 'Identitas', mono: true },
    { key: 'nama_satker', label: 'Nama Satker', section: 'Identitas' },
    { key: 'kode_barang', label: 'Kode Barang', section: 'Identitas', mono: true },
    { key: 'nup', label: 'NUP', section: 'Identitas', mono: true },
    { key: 'nama_barang', label: 'Nama Barang', section: 'Identitas' },
    { key: 'status_bmn', label: 'Status BMN', section: 'Identitas', dropdown: true },
    { key: 'merk', label: 'Merk', section: 'Identitas' },
    { key: 'tipe', label: 'Tipe', section: 'Identitas' },
    { key: 'kondisi', label: 'Kondisi', section: 'Identitas', dropdown: true },
    { key: 'umur_aset', label: 'Umur Aset (tahun)', section: 'Identitas', type: 'number' },
    { key: 'intra_extra', label: 'Intra/Extra', section: 'Identitas', dropdown: true },
    { key: 'henti_guna', label: 'Henti Guna', section: 'Status', dropdown: true },
    { key: 'status_sbsn', label: 'Status SBSN', section: 'Status', dropdown: true },
    { key: 'status_bmn_idle', label: 'Status BMN Idle', section: 'Status', dropdown: true },
    { key: 'status_kemitraan', label: 'Status Kemitraan', section: 'Status', dropdown: true },
    { key: 'bpybds', label: 'BPYBDS', section: 'Status', dropdown: true },
    { key: 'usulan_barang_hilang', label: 'Usulan Barang Hilang', section: 'Status', dropdown: true },
    { key: 'usulan_barang_rb', label: 'Usulan Barang RB', section: 'Status', dropdown: true },
    { key: 'usul_hapus', label: 'Usul Hapus', section: 'Status', dropdown: true },
    { key: 'hibah_dktp', label: 'Hibah DKTP', section: 'Status', dropdown: true },
    { key: 'konsesi_jasa', label: 'Konsesi Jasa', section: 'Status', dropdown: true },
    { key: 'properti_investasi', label: 'Properti Investasi', section: 'Status', dropdown: true },
    { key: 'jenis_dokumen', label: 'Jenis Dokumen', section: 'Dokumen', dropdown: true },
    { key: 'no_dokumen', label: 'No. Dokumen', section: 'Dokumen' },
    { key: 'no_bpkp', label: 'No. BPKP', section: 'Dokumen', mono: true },
    { key: 'no_polisi', label: 'No. Polisi', section: 'Dokumen', mono: true },
    { key: 'status_sertifikasi', label: 'Status Sertifikasi', section: 'Sertifikasi', dropdown: true },
    { key: 'jenis_sertifikat', label: 'Jenis Sertifikat', section: 'Sertifikasi', dropdown: true },
    { key: 'no_sertifikat', label: 'No. Sertifikat', section: 'Sertifikasi' },
    { key: 'nama_sertifikat', label: 'Nama Sertifikat', section: 'Sertifikasi' },
    { key: 'tanggal_buku_pertama', label: 'Tanggal Buku Pertama', section: 'Tanggal', type: 'date' },
    { key: 'tanggal_perolehan', label: 'Tanggal Perolehan', section: 'Tanggal', type: 'date' },
    { key: 'tanggal_penghapusan', label: 'Tanggal Penghapusan', section: 'Tanggal', type: 'date' },
    { key: 'nilai_perolehan_pertama', label: 'Nilai Perolehan Pertama', section: 'Nilai', type: 'currency' },
    { key: 'nilai_mutasi', label: 'Nilai Mutasi', section: 'Nilai', type: 'currency' },
    { key: 'nilai_perolehan', label: 'Nilai Perolehan', section: 'Nilai', type: 'currency' },
    { key: 'nilai_penyusutan', label: 'Nilai Penyusutan', section: 'Nilai', type: 'currency' },
    { key: 'nilai_buku', label: 'Nilai Buku', section: 'Nilai', type: 'currency' },
    { key: 'luas_tanah_seluruhnya', label: 'Luas Tanah Seluruhnya (m²)', section: 'Luas', type: 'number' },
    { key: 'luas_tanah_bangunan', label: 'Luas Tanah Untuk Bangunan (m²)', section: 'Luas', type: 'number' },
    { key: 'luas_tanah_sarana', label: 'Luas Tanah Untuk Sarana Lingkungan (m²)', section: 'Luas', type: 'number' },
    { key: 'luas_tanah_kosong', label: 'Luas Tanah Kosong (m²)', section: 'Luas', type: 'number' },
    { key: 'luas_bangunan', label: 'Luas Bangunan (m²)', section: 'Luas', type: 'number' },
    { key: 'luas_tapak_bangunan', label: 'Luas Tapak Bangunan (m²)', section: 'Luas', type: 'number' },
    { key: 'luas_pemanfaatan', label: 'Luas Pemanfaatan (m²)', section: 'Luas', type: 'number' },
    { key: 'jumlah_lantai', label: 'Jumlah Lantai', section: 'Bangunan', type: 'number' },
    { key: 'jumlah_foto', label: 'Jumlah Foto', section: 'Bangunan', type: 'number' },
    { key: 'status_bangunan', label: 'Status Bangunan', section: 'Bangunan', dropdown: true },
    { key: 'no_psp', label: 'No. PSP', section: 'PSP' },
    { key: 'tanggal_psp', label: 'Tanggal PSP', section: 'PSP', type: 'date' },
    { key: 'alamat', label: 'Alamat', section: 'Lokasi', wide: true },
    { key: 'rt_rw', label: 'RT/RW', section: 'Lokasi' },
    { key: 'kelurahan_desa', label: 'Kelurahan/Desa', section: 'Lokasi' },
    { key: 'kecamatan', label: 'Kecamatan', section: 'Lokasi' },
    { key: 'kab_kota', label: 'Kab/Kota', section: 'Lokasi' },
    { key: 'kode_kab_kota', label: 'Kode Kab/Kota', section: 'Lokasi', mono: true },
    { key: 'provinsi', label: 'Provinsi', section: 'Lokasi' },
    { key: 'kode_provinsi', label: 'Kode Provinsi', section: 'Lokasi', mono: true },
    { key: 'kode_pos', label: 'Kode Pos', section: 'Lokasi', mono: true },
    { key: 'longitude', label: 'Longitude', section: 'Koordinat', mono: true },
    { key: 'latitude', label: 'Latitude', section: 'Koordinat', mono: true },
    { key: 'sbsk', label: 'SBSK', section: 'Pengelolaan', dropdown: true },
    { key: 'optimalisasi', label: 'Optimalisasi', section: 'Pengelolaan', dropdown: true },
    { key: 'penghuni', label: 'Penghuni', section: 'Pengelolaan' },
    { key: 'pengguna', label: 'Pengguna', section: 'Pengelolaan' },
    { key: 'kode_kpknl', label: 'Kode KPKNL', section: 'KPKNL', mono: true },
    { key: 'uraian_kpknl', label: 'Uraian KPKNL', section: 'KPKNL' },
    { key: 'uraian_kanwil_djkn', label: 'Uraian Kanwil DJKN', section: 'KPKNL' },
    { key: 'nama_kl', label: 'Nama K/L', section: 'Organisasi' },
    { key: 'nama_e1', label: 'Nama E1', section: 'Organisasi' },
    { key: 'nama_korwil', label: 'Nama Korwil', section: 'Organisasi' },
    { key: 'lanal', label: 'Lanal', section: 'Organisasi' },
    { key: 'identifikasi_aset', label: 'Identifikasi Aset', section: 'Organisasi' },
    { key: 'kode_register', label: 'Kode Register', section: 'Identitas Tambahan', mono: true },
    { key: 'lokasi_ruang', label: 'Lokasi Ruang', section: 'Identitas Tambahan' },
    { key: 'jenis_identitas', label: 'Jenis Identitas', section: 'Identitas Tambahan' },
    { key: 'no_identitas', label: 'No. Identitas', section: 'Identitas Tambahan', mono: true },
    { key: 'no_stnk', label: 'No. STNK', section: 'Identitas Tambahan', mono: true },
    { key: 'nama_pengguna', label: 'Nama Pengguna', section: 'Identitas Tambahan' },
    { key: 'status_pmk', label: 'Status PMK', section: 'Identitas Tambahan', dropdown: true },
];

// Columns used for Excel export/import template (all fields)
const EXPORT_COLUMNS = ALL_COLUMNS;

// Columns shown in the main table
const TABLE_COLUMNS = [
    { key: 'no', label: 'No', width: 50, align: 'center' },
    { key: 'nama_barang', label: 'Nama Barang', width: 240 },
    { key: 'no_sertifikat', label: 'No. Sertifikat', width: 140 },
    { key: 'no_psp', label: 'No. PSP', width: 130 },
    { key: 'lanal', label: 'Lanal', width: 160 },
    { key: 'identifikasi_aset', label: 'Identifikasi Aset', width: 160 },
    { key: 'luas_tanah_seluruhnya', label: 'Luas Tanah (m²)', width: 140, align: 'right', type: 'number' },
    { key: 'nilai_perolehan', label: 'Nilai Perolehan', width: 180, align: 'right', type: 'currency' },
    { key: 'alamat', label: 'Alamat', width: 300 },
];

function formatNumber(v) {
    if (v === null || v === undefined || v === '') return '-';
    const n = parseFloat(v);
    return isNaN(n) ? String(v) : new Intl.NumberFormat('id-ID').format(n);
}

function formatCurrency(v) {
    if (v === null || v === undefined || v === '') return '-';
    const n = parseFloat(v);
    return isNaN(n) ? String(v) : new Intl.NumberFormat('id-ID').format(n);
}

function formatDate(v) {
    if (!v) return '-';
    try {
        return new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return String(v); }
}

function displayValue(col, val) {
    if (val === null || val === undefined || val === '') return '-';
    if (col.type === 'currency') return formatCurrency(val);
    if (col.type === 'number') return formatNumber(val);
    if (col.type === 'date') return formatDate(val);
    return String(val);
}

function MasterAssetUtama() {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [viewingAsset, setViewingAsset] = useState(null); // detail modal
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef(null);

    const loadMasterData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/master-asset-utama');
            if (res.ok) setAssets(await res.json());
            else setAssets([]);
        } catch { setAssets([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadMasterData(); }, []);

    const filtered = assets.filter(a => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (a.nama_barang || '').toLowerCase().includes(q)
            || (a.no_sertifikat || '').toLowerCase().includes(q)
            || (a.alamat || '').toLowerCase().includes(q)
            || (a.kode_barang || '').toLowerCase().includes(q)
            || (a.no_psp || '').toLowerCase().includes(q);
    });

    // Row click → view detail (read-only)
    const openDetail = (asset) => {
        setViewingAsset(asset);
        setIsEditing(false);
        setEditData({ ...asset });
    };

    const startEdit = () => setIsEditing(true);
    const cancelEdit = () => { setIsEditing(false); setEditData({ ...viewingAsset }); };
    const closeDetail = () => { setViewingAsset(null); setIsEditing(false); setEditData(null); };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch(`/api/master-asset-utama/${viewingAsset.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData)
            });
            if (res.ok) {
                const updated = await res.json();
                setAssets(assets.map(a => a.id === updated.id ? updated : a));
                setViewingAsset(updated);
                setEditData({ ...updated });
                setIsEditing(false);
                alert('✅ Data berhasil diperbarui!');
            } else {
                alert('❌ Gagal menyimpan: ' + await res.text());
            }
        } catch (err) {
            alert('❌ Error: ' + err.message);
        } finally { setIsSaving(false); }
    };

    const handleExportExcel = () => {
        try {
            const header = EXPORT_COLUMNS.map(c => c.label);
            const rows = assets.map(a => EXPORT_COLUMNS.map(c => {
                const v = a[c.key];
                return (v === null || v === undefined) ? '' : v;
            }));
            const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Master Aset Utama');
            XLSX.writeFile(wb, 'Master_Aset_Utama.xlsx');
        } catch (err) { alert('Gagal export: ' + err.message); }
    };

    const handleImportExcel = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const data = new Uint8Array(evt.target.result);
                const wb = XLSX.read(data, { type: 'array' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(ws, { defval: '' });
                if (!jsonData.length) { alert('File kosong.'); return; }

                const labelToKey = {};
                EXPORT_COLUMNS.forEach(c => { labelToKey[c.label] = c.key; });

                const mappedData = jsonData.map(row => {
                    const entry = {};
                    Object.keys(row).forEach(h => {
                        const key = labelToKey[h] || h.toLowerCase().replace(/ /g, '_');
                        entry[key] = row[h];
                    });
                    return entry;
                });

                const modeAman = window.confirm(
                    "PILIH MODE IMPORT:\n\n▶ [OK] = UPDATE / LENGKAPI\nDeteksi duplikat & perbarui data lama. Data baru ditambahkan.\n\n▶ [CANCEL] = GANTI TOTAL\nHapus seluruh data & ganti dengan Excel ini."
                );
                let importMode = 'upsert';
                if (!modeAman) {
                    if (!window.confirm("⛔ PERINGATAN! Semua data lama akan dihapus. Lanjutkan?")) {
                        e.target.value = null; return;
                    }
                    importMode = 'replace';
                    await fetch('/api/master-asset-utama', { method: 'DELETE' });
                }

                setLoading(true);
                const res = await fetch('/api/master-asset-utama/bulk-upsert', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ assets: mappedData, mode: importMode === 'replace' ? 'insert' : 'upsert' })
                });
                if (res.ok) {
                    const result = await res.json();
                    alert(`✅ Import Selesai!\n• Baru: ${result.inserted || 0}\n• Diperbarui: ${result.updated || 0}\n• Gagal: ${result.failed || 0}`);
                } else {
                    alert('❌ Import gagal: ' + await res.text());
                }
                await loadMasterData();
            } catch (err) { alert('❌ Gagal baca file: ' + err.message); setLoading(false); }
        };
        reader.readAsArrayBuffer(file);
        e.target.value = null;
    };

    const handleExportPDF = () => {
        try {
            const doc = new jsPDF({ orientation: 'landscape', format: 'a3' });

            // Title block
            doc.setFillColor(0, 51, 102);
            doc.rect(0, 0, doc.internal.pageSize.getWidth(), 28, 'F');
            doc.setFontSize(15); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
            doc.text('DATA MASTER ASET UTAMA', 14, 12);
            doc.setFontSize(8); doc.setFont('helvetica', 'normal');
            doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' })}   |   Total Aset: ${assets.length} record`, 14, 20);
            doc.text(`Status: Data SIMAK BMN Resmi`, doc.internal.pageSize.getWidth() - 14, 20, { align: 'right' });

            doc.setTextColor(0, 0, 0);

            autoTable(doc, {
                head: [['No', 'Nama Barang', 'No. Sertifikat', 'No. PSP', 'Luas Tanah (m²)', 'Nilai Perolehan (Rp)', 'Alamat']],
                body: assets.map((a, i) => [
                    i + 1,
                    a.nama_barang || '-',
                    a.no_sertifikat || '-',
                    a.no_psp || '-',
                    a.luas_tanah_seluruhnya ? formatNumber(a.luas_tanah_seluruhnya) : '-',
                    a.nilai_perolehan ? formatCurrency(a.nilai_perolehan) : '-',
                    a.alamat || '-'
                ]),
                startY: 32,
                styles: {
                    fontSize: 7.5,
                    cellPadding: { top: 3, right: 4, bottom: 3, left: 4 },
                    lineColor: [200, 210, 220],
                    lineWidth: 0.2,
                    font: 'helvetica',
                    overflow: 'linebreak'
                },
                headStyles: {
                    fillColor: [0, 51, 102],
                    textColor: 255,
                    fontStyle: 'bold',
                    fontSize: 7.5,
                    halign: 'center',
                    valign: 'middle',
                    cellPadding: { top: 5, right: 4, bottom: 5, left: 4 }
                },
                alternateRowStyles: { fillColor: [245, 249, 255] },
                columnStyles: {
                    0: { halign: 'center', cellWidth: 12 },
                    1: { cellWidth: 70 },
                    2: { cellWidth: 42 },
                    3: { cellWidth: 45 },
                    4: { halign: 'right', cellWidth: 38, fontStyle: 'bold' },
                    5: { halign: 'right', cellWidth: 48, fontStyle: 'bold', textColor: [0, 100, 80] },
                    6: { cellWidth: 'auto' }
                },
                didDrawPage: (data) => {
                    // Footer on each page
                    const pageSize = doc.internal.pageSize;
                    const pageH = pageSize.getHeight();
                    doc.setFontSize(7); doc.setTextColor(120, 120, 120);
                    doc.text(`Halaman ${data.pageNumber}`, pageSize.getWidth() / 2, pageH - 8, { align: 'center' });
                    doc.text('© SISTEM INFORMASI ASET', 14, pageH - 8);
                    doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, pageSize.getWidth() - 14, pageH - 8, { align: 'right' });
                }
            });

            doc.save('Master_Aset_Utama.pdf');
        } catch (err) { alert('❌ Gagal export PDF: ' + err.message); }
    };

    // Group ALL_COLUMNS by section for detail view
    const sections = [...new Set(ALL_COLUMNS.map(c => c.section))];
    const bySection = sec => ALL_COLUMNS.filter(c => c.section === sec);

    const totalWidth = TABLE_COLUMNS.reduce((s, c) => s + c.width, 0);

    return (
        <div className="fade-in" style={{ fontFamily: FONT_SYSTEM, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ marginBottom: '16px', padding: '14px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Master Aset Utama</h1>
                <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px', marginBottom: 0 }}>
                    Klik baris untuk melihat detail lengkap. Tersedia {assets.length} aset.
                </p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', flex: 1 }}>
                    <div style={{ fontSize: '28px', marginBottom: '10px' }}>⏳</div>
                    <p style={{ color: '#64748b' }}>Memuat data...</p>
                </div>
            ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Toolbar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'white', borderRadius: '8px', marginBottom: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', gap: '10px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                                type="text"
                                placeholder="🔍 Cari nama, sertifikat, alamat, PSP..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', width: '280px', outline: 'none' }}
                            />
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{filtered.length} data</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <input type="file" accept=".xlsx,.xls" style={{ display: 'none' }} ref={fileInputRef} onChange={handleImportExcel} />
                            {[
                                { label: '📥 Import', onClick: () => fileInputRef.current?.click(), style: { background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155' } },
                                { label: '📊 Export Excel', onClick: handleExportExcel, style: { background: '#10b981', border: 'none', color: 'white' } },
                                { label: '📄 Export PDF', onClick: handleExportPDF, style: { background: '#ef4444', border: 'none', color: 'white' } },
                            ].map(btn => (
                                <button key={btn.label} onClick={btn.onClick} style={{
                                    ...btn.style, borderRadius: '6px', padding: '6px 12px',
                                    fontSize: '0.75rem', cursor: 'pointer', fontWeight: '500'
                                }}>{btn.label}</button>
                            ))}
                        </div>
                    </div>

                    {/* Main Table */}
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(100vh - 300px)' }}>
                            <table style={{ minWidth: `${totalWidth}px`, borderCollapse: 'collapse', tableLayout: 'auto', width: 'max-content' }}>
                                <thead>
                                    <tr style={{ background: 'linear-gradient(180deg, #003366 0%, #001f3f 100%)' }}>
                                        {TABLE_COLUMNS.map(col => (
                                            <th key={col.key} style={{
                                                width: `${col.width}px`, minWidth: `${col.width}px`,
                                                padding: '8px 10px', fontSize: '0.68rem', fontWeight: '700',
                                                textTransform: 'uppercase', letterSpacing: '0.04em',
                                                color: '#fff', textAlign: col.align || 'left',
                                                position: 'sticky', top: 0, zIndex: 10,
                                                borderBottom: '2px solid #001a33', whiteSpace: 'nowrap', verticalAlign: 'middle'
                                            }}>
                                                {col.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((asset, idx) => (
                                        <tr key={asset.id}
                                            onClick={() => openDetail(asset)}
                                            style={{
                                                background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                                                cursor: 'pointer', transition: 'background 0.15s',
                                                borderBottom: '1px solid #e2e8f0'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#e0f2fe'}
                                            onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#f8fafc'}
                                        >
                                            {TABLE_COLUMNS.map(col => {
                                                let val = col.key === 'no' ? idx + 1 : asset[col.key];
                                                let display = col.key === 'no' ? idx + 1
                                                    : col.type === 'currency' ? formatCurrency(val)
                                                    : col.type === 'number' ? formatNumber(val)
                                                    : (val || '-');
                                                return (
                                                    <td key={col.key} style={{
                                                        width: `${col.width}px`, minWidth: `${col.width}px`,
                                                        padding: '5px 9px', fontSize: '0.8rem',
                                                        color: col.type === 'currency' ? '#0f766e' : '#334155',
                                                        fontFamily: col.type === 'currency' || col.type === 'number' ? FONT_MONO : FONT_SYSTEM,
                                                        fontWeight: col.type === 'currency' ? '500' : 'normal',
                                                        textAlign: col.align || 'left',
                                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                        maxWidth: `${col.width}px`, verticalAlign: 'middle'
                                                    }}>
                                                        {display}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                    {filtered.length === 0 && (
                                        <tr><td colSpan={TABLE_COLUMNS.length} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '0.9rem' }}>
                                            {search ? '🔍 Tidak ada data yang sesuai pencarian.' : '📭 Belum ada data aset.'}
                                        </td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail / Edit Modal */}
            {viewingAsset && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,20,50,0.55)', zIndex: 9999,
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    padding: '16px'
                }} onClick={e => { if (e.target === e.currentTarget) closeDetail(); }}>
                    <div style={{
                        background: 'white', borderRadius: '14px', width: '100%', maxWidth: '960px',
                        maxHeight: '92vh', display: 'flex', flexDirection: 'column',
                        boxShadow: '0 24px 48px -8px rgba(0,0,0,0.25)'
                    }}>
                        {/* Modal header */}
                        <div style={{
                            padding: '16px 22px', borderBottom: '1px solid #e2e8f0',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: 'linear-gradient(135deg, #003366 0%, #004080 100%)',
                            borderRadius: '14px 14px 0 0'
                        }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'white', fontWeight: '700' }}>
                                    {isEditing ? '✏️ Edit Data Aset' : '📋 Detail Aset Utama'}
                                </h2>
                                <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
                                    {viewingAsset.nama_barang || 'Data Aset'}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {!isEditing && (
                                    <button onClick={startEdit} style={{
                                        padding: '7px 16px', borderRadius: '7px', border: '1.5px solid rgba(255,255,255,0.5)',
                                        background: 'rgba(255,255,255,0.15)', color: 'white',
                                        fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer'
                                    }}>✏️ Edit</button>
                                )}
                                <button onClick={closeDetail} style={{
                                    background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)',
                                    color: 'white', borderRadius: '7px', width: '32px', height: '32px',
                                    cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>×</button>
                            </div>
                        </div>

                        {/* Modal body */}
                        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
                            <form id="detailEditForm" onSubmit={handleSave}>
                                {sections.map(sec => (
                                    <div key={sec} style={{ marginBottom: '22px' }}>
                                        <div style={{
                                            fontSize: '0.7rem', fontWeight: '700', color: '#003366',
                                            textTransform: 'uppercase', letterSpacing: '0.08em',
                                            borderBottom: '2px solid #e2e8f0', paddingBottom: '6px', marginBottom: '12px'
                                        }}>
                                            {sec}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                                            {bySection(sec).map(col => {
                                                const rawVal = editData?.[col.key];
                                                const displayVal = displayValue(col, viewingAsset[col.key]);
                                                const inputVal = rawVal === null || rawVal === undefined ? '' : rawVal;

                                                return (
                                                    <div key={col.key} style={{ display: 'flex', flexDirection: 'column', gap: '3px', gridColumn: col.wide ? '1 / -1' : undefined }}>
                                                        <label style={{ fontSize: '0.7rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                                                            {col.label}
                                                        </label>

                                                        {isEditing ? (
                                                            col.dropdown && OPTIONS[col.key] ? (
                                                                <select
                                                                    value={inputVal}
                                                                    onChange={e => setEditData({ ...editData, [col.key]: e.target.value })}
                                                                    style={{
                                                                        padding: '7px 10px', borderRadius: '6px',
                                                                        border: '1.5px solid #cbd5e1', fontSize: '0.83rem',
                                                                        background: 'white', outline: 'none',
                                                                        fontFamily: FONT_SYSTEM
                                                                    }}
                                                                >
                                                                    <option value="">-- Pilih --</option>
                                                                    {OPTIONS[col.key].map(opt => (
                                                                        <option key={opt} value={opt}>{opt}</option>
                                                                    ))}
                                                                </select>
                                                            ) : (
                                                                <input
                                                                    type={col.type === 'date' ? 'date' : 'text'}
                                                                    value={col.type === 'date' ? (inputVal ? String(inputVal).substring(0, 10) : '') : inputVal}
                                                                    onChange={e => setEditData({ ...editData, [col.key]: e.target.value })}
                                                                    style={{
                                                                        padding: '7px 10px', borderRadius: '6px',
                                                                        border: '1.5px solid #cbd5e1', fontSize: '0.83rem',
                                                                        fontFamily: col.mono || col.type === 'currency' || col.type === 'number' ? FONT_MONO : FONT_SYSTEM,
                                                                        outline: 'none'
                                                                    }}
                                                                />
                                                            )
                                                        ) : (
                                                            <div style={{
                                                                padding: '7px 10px', borderRadius: '6px',
                                                                background: '#f8fafc', border: '1px solid #e2e8f0',
                                                                fontSize: '0.83rem', minHeight: '34px',
                                                                fontFamily: col.mono || col.type === 'currency' || col.type === 'number' ? FONT_MONO : FONT_SYSTEM,
                                                                color: displayVal === '-' ? '#94a3b8' : (col.type === 'currency' ? '#0f766e' : '#1e293b'),
                                                                fontWeight: col.type === 'currency' ? '600' : 'normal',
                                                                wordBreak: 'break-word',
                                                                lineHeight: '1.4'
                                                            }}>
                                                                {displayVal}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </form>
                        </div>

                        {/* Modal footer */}
                        <div style={{
                            padding: '12px 22px', borderTop: '1px solid #e2e8f0',
                            display: 'flex', justifyContent: 'flex-end', gap: '10px',
                            background: '#f8fafc', borderRadius: '0 0 14px 14px'
                        }}>
                            {isEditing ? (
                                <>
                                    <button type="button" onClick={cancelEdit} style={{
                                        padding: '8px 18px', borderRadius: '7px', border: '1px solid #cbd5e1',
                                        background: 'white', color: '#334155', fontWeight: '500', cursor: 'pointer', fontSize: '0.85rem'
                                    }}>Batal</button>
                                    <button type="submit" form="detailEditForm" disabled={isSaving} style={{
                                        padding: '8px 18px', borderRadius: '7px', border: 'none',
                                        background: '#003366', color: 'white', fontWeight: '600',
                                        cursor: isSaving ? 'not-allowed' : 'pointer', fontSize: '0.85rem',
                                        opacity: isSaving ? 0.7 : 1
                                    }}>
                                        {isSaving ? '⏳ Menyimpan...' : '💾 Simpan Perubahan'}
                                    </button>
                                </>
                            ) : (
                                <button onClick={closeDetail} style={{
                                    padding: '8px 18px', borderRadius: '7px', border: '1px solid #cbd5e1',
                                    background: 'white', color: '#334155', fontWeight: '500', cursor: 'pointer', fontSize: '0.85rem'
                                }}>Tutup</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MasterAssetUtama;
