import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { read, utils, writeFile } from 'xlsx'
import ErrorBoundary from '../components/ErrorBoundary'

function Faslan({ type }) {
    const [data, setData] = useState([])
    const [title, setTitle] = useState('')
    const [selectedAsset, setSelectedAsset] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const fileInputRef = useRef(null)

    // Data loading logic
    const fetchData = async () => {
        try {
            const endpoint = type === 'tanah' ? '/api/assets/tanah' : (type === 'kapling' ? '/api/assets/kapling' : '/api/assets/bangunan')
            // Use relative path to leverage Vite proxy in dev match prod behavior
            const finalEndpoint = endpoint

            console.log(`Fetching data from: ${finalEndpoint}`);
            const response = await fetch(finalEndpoint)

            if (!response.ok) {
                const text = await response.text();
                console.error(`API Error (${response.status}):`, text.substring(0, 200));
                throw new Error(`Server returned ${response.status}`);
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error("Received non-JSON response:", text.substring(0, 200));
                throw new Error("Received non-JSON response from server");
            }

            const result = await response.json()

            if (Array.isArray(result)) {
                setData(result)
            } else {
                console.error("Expected array from API but got:", result)
                setData([])
            }
        } catch (error) {
            console.error('Error fetching data:', error)
            setData([])
        }
    }

    useEffect(() => {
        fetchData()

        if (type === 'tanah') {
            setTitle('Fasilitas Pangkalan - Aset Tanah')
        } else if (type === 'kapling') {
            setTitle('Fasilitas Pangkalan - Aset Kapling')
        } else {
            setTitle('Fasilitas Pangkalan - Aset Bangunan')
        }
    }, [type])

    // Helper function to parse coordinates correctly
    const parseCoordinates = (coordString) => {
        if (!coordString || coordString === '-' || String(coordString).trim() === '') {
            return { lat: '', lon: '' };
        }

        let str = String(coordString).trim();

        // 1. Coba Deteksi DMS (Format: 6°09'51.78"S 106°50'22.68"E)
        // Handle karakter aneh seperti & atau spasi berlebih
        const dmsPattern = /(\d+)\s*[°ᵒo]\s*(\d+)\s*[′'´]\s*([\d.]+)\s*[″"₺]?\s*[^NS]*([NS])[^°\d]*(\d+)\s*[°ᵒo]\s*(\d+)\s*[′'´]\s*([\d.]+)\s*[″"₺]?\s*[^EW]*([EW])/i;
        const dmsMatch = str.match(dmsPattern);

        if (dmsMatch) {
            // Return format DMS yang rapi
            return {
                lat: `${dmsMatch[1]}°${dmsMatch[2]}'${dmsMatch[3]}" ${dmsMatch[4]}`,
                lon: `${dmsMatch[5]}°${dmsMatch[6]}'${dmsMatch[7]}" ${dmsMatch[8]}`
            };
        }

        // 2. Coba Deteksi Desimal
        let parts = [];

        if (str.includes(';')) {
            // Separator titik koma = ganti koma desimal jadi titik
            parts = str.split(';').map(s => s.replace(',', '.'));
        } else {
            // Hitung jumlah koma untuk tebak format
            const commaCount = (str.match(/,/g) || []).length;

            if (commaCount > 1) {
                // Format Indo: -6,1234, 106,1234 (koma sbg desimal)
                const normalized = str.replace(/(\d),(\d)/g, '$1.$2');
                // Sisa koma adalah separator (jika ada)
                if (normalized.includes(',')) parts = normalized.split(',');
                else parts = normalized.split(/\s+/);
            } else if (commaCount === 1) {
                // Format Standar: -6.1234, 106.1234
                parts = str.split(',');
            } else {
                // Pisah spasi
                parts = str.split(/\s+/);
            }
        }

        parts = parts.map(s => s.trim()).filter(s => s);

        if (parts.length >= 2) {
            const num1 = parseFloat(parts[0]);
            const num2 = parseFloat(parts[1]);

            if (!isNaN(num1) && !isNaN(num2)) {
                // Auto-detect Lat/Lon (Lon Indonesia > 90, Lat < 90)
                let lat, lon;
                if (Math.abs(num1) > 90) {
                    lon = num1;
                    lat = num2;
                } else if (Math.abs(num2) > 90) {
                    lat = num1;
                    lon = num2;
                } else {
                    // Fallback
                    lat = num1;
                    lon = num2;
                }

                return { lat: String(lat), lon: String(lon) };
            }
        }

        // Fallback: DMS Sederhana / Format Lain
        // Jika masih gagal, coba regex sederhana lama
        if (str.includes('S') || str.includes('N')) {
            const latPart = str.match(/[^EW,]*[SN]/i);
            const lonPart = str.match(/[^SN,]*[EW]/i);
            return {
                lat: latPart ? latPart[0].trim() : '',
                lon: lonPart ? lonPart[0].trim() : ''
            };
        }

        return { lat: '', lon: '' };
    };

    const combineCoordinates = (lat, lon) => {
        const latTrim = (lat || '').trim();
        const lonTrim = (lon || '').trim();

        if (!latTrim && !lonTrim) return '-';
        if (!latTrim) return lonTrim;
        if (!lonTrim) return latTrim;

        return `${latTrim}, ${lonTrim}`;
    };

    const handleImportClick = () => {
        fileInputRef.current.click()
    }

    const handleExportData = () => {
        if (data.length === 0) {
            alert('Tidak ada data untuk diekspor');
            return;
        }

        // Format data untuk export
        const exportData = data.map((item) => {
            // Pisahkan coordinates menjadi Lat dan Lon
            let lat = '-';
            let lon = '-';
            if (item.coordinates && item.coordinates !== '-') {
                const coords = item.coordinates.split(',').map(c => c.trim());
                if (coords.length === 2) {
                    lat = coords[0];
                    lon = coords[1];
                }
            }

            // Format luas - hapus m² dan format angka saja
            let luasValue = '0';
            if (item.luas && item.luas !== '-') {
                const luasStr = String(item.luas);
                luasValue = luasStr.replace(/[^0-9.]/g, '');
            }

            return {
                'Nama Bangunan/Komplek Bangunan': item.name || '-',
                'Fungsi Bangunan': item.category || '-',
                'Area': item.area || '-',
                'Alamat': item.location || '-',
                'Status Aset': item.status || '-',
                'Lokasi Koordinat': item.coordinates || '-',
                'Luas (m2)': luasValue,
                'Keterangan': item.map_boundary || '-'
            };
        });

        // Create workbook and export
        const ws = utils.json_to_sheet(exportData);
        const wb = utils.book_new();
        const typeName = type === 'tanah' ? 'Tanah' : (type === 'kapling' ? 'Kapling' : 'Bangunan');
        utils.book_append_sheet(wb, ws, `Data Aset ${typeName}`);

        const fileName = `Export_Aset_${typeName}_${new Date().toISOString().split('T')[0]}.xlsx`;
        writeFile(wb, fileName, { bookType: 'xlsx' });

        alert(`Berhasil mengekspor ${data.length} data`);
    };

    const handleDownloadTemplate = () => {
        if (type === 'kapling') {
            const sampleData = [{
                'Nama depan': 'Budi',
                'Nama Belakang': 'Santoso',
                'Pangkat': 'Mayor',
                'NRP/NIP': '12345678',
                'Lokasi Kapling': 'Komplek Kodamar',
                'Jalan': 'Jl. Gading Raya No. 1',
                'Nama Blok': 'Blok A1',
                'No Blok': '5',
                'Luas': '120',
                'Dialihkan/Belum': 'Belum',
                'Nomor Permohonan': 'PMH-2024-001',
                'Keterangan': '-'
            }];
            const ws = utils.json_to_sheet(sampleData);
            const wb = utils.book_new();
            utils.book_append_sheet(wb, ws, 'Template Aset Kapling');
            writeFile(wb, 'Template_Import_Aset_Kapling.xlsx', { bookType: 'xlsx' });
            return;
        }

        const headers = [
            'Nama Bangunan/Komplek Bangunan', 'Fungsi Bangunan', 'Area', 'Alamat', 'Status Aset',
            'Lokasi Koordinat', 'Luas (m2)', 'Keterangan'
        ];

        const sampleData = [
            {
                'Nama Bangunan/Komplek Bangunan': 'Komplek Mako Armada',
                'Fungsi Bangunan': 'Perkantoran',
                'Area': 'Jakarta Pusat',
                'Alamat': 'Jl. Gn.Sahari No.67 Kel. Gunung Sahari Selatan Kec. Kemayoran Jakarta Pusat',
                'Status Aset': 'Sertifikat dan masuk Barang Milik Negara (BMN) TNI AL',
                'Lokasi Koordinat': '6°09\'51.78 & S 106°50\'22.68 & E',
                'Luas (m2)': '44.999',
                'Keterangan': '-'
            }
        ];

        const ws = utils.json_to_sheet(sampleData);
        const wb = utils.book_new();
        const typeName = type === 'tanah' ? 'Tanah' : (type === 'kapling' ? 'Kapling' : 'Bangunan');
        utils.book_append_sheet(wb, ws, `Template Aset ${typeName}`);
        writeFile(wb, `Template_Import_Aset_${typeName}.xlsx`, { bookType: 'xlsx' });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        try {
            const data = await file.arrayBuffer()
            const workbook = read(data)
            const worksheet = workbook.Sheets[workbook.SheetNames[0]]
            const jsonData = utils.sheet_to_json(worksheet)

            console.log('Sample row:', jsonData[0]); // Debug: lihat struktur data

            const formattedData = jsonData.map((row) => {
                // --- LOGIC KHUSUS ASET KAPLING ---
                if (type === 'kapling') {
                    const namaDepan = row['Nama depan'] || row['Nama Depan'] || '';
                    const namaBelakang = row['Nama Belakang'] || '';
                    const pangkat = row['Pangkat'] || '';
                    const nrp = row['NRP/NIP'] || row['NRP'] || row['NIP'] || '';

                    // Blok Logic
                    const namaBlok = row['Nama Blok'] || '';
                    const noBlok = row['No Blok'] || row['No. Blok'] || '';
                    let assetName = namaBlok || 'Blok Tanpa Nama';
                    if (noBlok) {
                        assetName = `${namaBlok} No. ${noBlok}`;
                    }

                    // Parse Luas (Format Indo)
                    let luasStr = String(row['Luas'] || '0').trim();
                    luasStr = luasStr.replace(/m2|m²|\s/gi, '').replace(/\./g, '').replace(',', '.');
                    const luasNum = parseFloat(luasStr) || 0;
                    const luas = luasNum.toString();

                    return {
                        code: `KPL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                        name: assetName,
                        occupant_name: `${namaDepan} ${namaBelakang}`.trim(),
                        occupant_rank: pangkat,
                        occupant_nrp: nrp,
                        area: row['Lokasi Kapling'] || row['Area'] || row['Wilayah'] || row['Komplek'] || '-',
                        location: row['Jalan'] || row['Alamat'] || row['Alamat Lengkap'] || row['Lokasi'] || '-',
                        luas: luas,
                        luas_tanah_seluruhnya: luas,
                        status: row['Dialihkan/Belum'] || 'Belum Dialihkan',
                        no_sertifikat: row['Nomor Permohonan'] || '',
                        map_boundary: row['Keterangan'] || '-',
                        category: 'Kapling',
                        coordinates: '-',
                        occupant_title: '-'
                    };
                }

                // --- LOGIC EXISTING (TANAH/BANGUNAN) ---
                // Ambil nama bangunan - cek berbagai kemungkinan nama kolom
                const name = row['Nama Bangunan/Komplek Bangunan'] || row['Nama Bangunan'] || row['Nama'] || 'Tanpa Nama';

                // Ambil fungsi/kategori
                const category = row['Fungsi Bangunan'] || row['Fungsi'] || 'Tidak Ditentukan';

                // Ambil area
                const area = row['Area'] || '-';

                // Ambil alamat
                const location = row['Alamat'] || '-';

                // Ambil status aset
                const status = row['Status Aset'] || row['Status'] || 'Aktif';

                // Ambil koordinat dari kolom "Lokasi Koordinat"
                let coordinates = '-';
                const coordValue = row['Lokasi Koordinat'] || row['LOKASI KOORDINAT'] || row['Koordinat'] || '';

                if (coordValue && coordValue !== '-') {
                    // Format: "6°09'51.78 & S 106°50'22.68 & E" atau format lainnya
                    coordinates = String(coordValue).trim();
                }
                // Jika tidak ada, coba gabungkan dari Lon dan Lat terpisah
                else if (row['Lon'] && row['Lat']) {
                    coordinates = `${row['Lat']}, ${row['Lon']}`;
                } else if (row['Lon']) {
                    coordinates = `-, ${row['Lon']}`;
                } else if (row['Lat']) {
                    coordinates = `${row['Lat']}, -`;
                }

                // Format luas - hapus titik ribuan, ganti koma jadi titik
                let luasStr = String(row['Luas (m2)'] || row['Luas'] || row['LUAS'] || '0').trim();
                luasStr = luasStr.replace(/m2|m²|\s/gi, ''); // Hapus satuan
                // Format Indo: 1.234,56 -> Hapus titik, ganti koma jadi titik
                luasStr = luasStr.replace(/\./g, '').replace(',', '.');

                const luasNum = parseFloat(luasStr) || 0;
                // Simpan sebagai string format standar (opsional) atau raw number
                luas = luasNum.toString();

                // Ambil keterangan
                const map_boundary = row['Keterangan'] || row['KETERANGAN'] || '-';

                return {
                    code: `IMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    name: name,
                    category: category,
                    location: location,
                    status: status,
                    coordinates: coordinates,
                    luas: luas,
                    map_boundary: map_boundary,
                    area: area,
                    occupant_name: '-',
                    occupant_rank: '-',
                    occupant_nrp: '-',
                    occupant_title: '-'
                };
            })

            const apiPath = type === 'tanah' ? '/api/assets/tanah' : (type === 'kapling' ? '/api/assets/kapling' : '/api/assets/bangunan')
            const endpoint = apiPath // Use relative path

            let successCount = 0;
            let failCount = 0;

            for (const item of formattedData) {
                try {
                    const res = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(item)
                    })
                    if (res.ok) successCount++;
                    else {
                        failCount++;
                        console.error(`Failed to upload item: ${item.name}`, await res.text());
                    }
                } catch (err) {
                    failCount++;
                    console.error(`Error uploading item: ${item.name}`, err);
                }
            }

            fetchData()

            if (failCount > 0) {
                // Determine if we have captured an error response text
                // Since this is in the loop, we'll just say "Check console for details" or try to capture last error in variable if scope allowed,
                // but for now let's just alert the counts.
                alert(`Import Selesai.\n✅ Berhasil: ${successCount}\n❌ Gagal: ${failCount}\n\nCek console browser (F12) untuk detail error jika ada.`);
            } else {
                alert(`Berhasil mengimport ${successCount} data ke database!`);
            }
        } catch (error) {
            console.error('Error importing file:', error)
            alert('Gagal mengimport file. Pastikan format sesuai.')
        }
        e.target.value = null
    }

    // --- Modal Logic ---
    const openModal = (e, asset) => {
        if (e && e.stopPropagation) e.stopPropagation();
        console.log('Opening modal for:', asset?.name);

        if (!asset) return;
        setSelectedAsset(asset);
        setIsEditing(false);
        setIsModalOpen(true);
    }

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedAsset(null), 200); // Delay clear data agar animasi smooth
        setIsEditing(false);
    }

    const handleDelete = async () => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
        try {
            const apiPath = type === 'tanah' ? '/api/assets/tanah' : (type === 'kapling' ? '/api/assets/kapling' : '/api/assets/bangunan')
            const endpoint = `${apiPath}/${selectedAsset.id}`;
            await fetch(endpoint, { method: 'DELETE' });
            alert('Data berhasil dihapus');
            closeModal();
            fetchData();
        } catch (error) {
            console.error('Error deleting asset:', error);
            alert('Gagal menghapus data');
        }
    }

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const apiPath = type === 'tanah' ? '/api/assets/tanah' : (type === 'kapling' ? '/api/assets/kapling' : '/api/assets/bangunan')
            const endpoint = `${apiPath}/${selectedAsset.id}`;
            await fetch(endpoint, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedAsset)
            });
            alert('Data berhasil diupdate');
            setIsEditing(false);
            fetchData();
        } catch (error) {
            console.error('Error updating asset:', error);
            alert('Gagal mengupdate data');
        }
    }

    const dataArray = Array.isArray(data) ? data : []

    const stats = (type === 'tanah' || type === 'kapling') ? [
        { label: `Total Aset ${type === 'kapling' ? 'Kapling' : 'Tanah'}`, value: dataArray.length.toString(), color: 'var(--navy-primary)' },
        {
            label: 'Luas Total',
            value: (() => {
                const totalLuas = dataArray.reduce((sum, item) => {
                    // Prioritaskan luas_tanah_seluruhnya dari data detail
                    if (item.luas_tanah_seluruhnya && parseFloat(item.luas_tanah_seluruhnya) > 0) {
                        return sum + parseFloat(item.luas_tanah_seluruhnya);
                    }
                    // Fallback ke luas biasa - PERBAIKAN PARSING
                    let luasStr = String(item.luas || '0').replace(/m2|m²|\s/gi, '');
                    // Fix: Hapus titik (ribuan), ganti koma (desimal) jadi titik
                    luasStr = luasStr.replace(/\./g, '').replace(',', '.');
                    const luasNum = parseFloat(luasStr) || 0;
                    return sum + luasNum;
                }, 0);
                return `${totalLuas.toLocaleString('id-ID')} m²`;
            })(),
            color: 'var(--success)'
        },
        { label: 'Status Aktif', value: dataArray.filter(i => i.status === 'Aktif').length.toString(), color: 'var(--info)' },
        { label: 'Total Area', value: new Set(dataArray.map(i => i.area).filter(a => a && a !== '-')).size.toString(), color: 'var(--warning)' }
    ] : []

    const handleDeleteAll = async () => {
        if (!window.confirm(`PERINGATAN: Apakah Anda yakin ingin MENGHAPUS SEMUA DATA aset ${type}? Tindakan ini tidak dapat dibatalkan.`)) return;
        if (!window.confirm('Verifikasi terakhir: Data akan hilang permanen. Lanjutkan?')) return;

        try {
            const endpoint = type === 'tanah' ? '/api/assets/tanah' : (type === 'kapling' ? '/api/assets/kapling' : '/api/assets/bangunan');
            const finalEndpoint = endpoint;

            await fetch(finalEndpoint, { method: 'DELETE' });
            alert('Semua data berhasil dihapus');
            fetchData();
        } catch (error) {
            console.error('Error deleting all assets:', error);
            alert('Gagal menghapus data');
        }
    }

    return (
        <ErrorBoundary>
            <div>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls" style={{ display: 'none' }} />

                {/* Page Header */}
                <div className="page-header">
                    <h1 className="page-title">{title}</h1>
                    <p className="page-subtitle">Manajemen data aset {type} di lingkungan Kodaeral 3 Jakarta</p>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
                            <div className="stat-label">{stat.label}</div>
                            <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center mb-lg">
                    <div className="flex gap-md">
                        <button className="btn btn-primary">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                            Tambah {type === 'tanah' ? 'Tanah' : (type === 'kapling' ? 'Kapling' : 'Bangunan')}
                        </button>
                        {(type === 'tanah' || type === 'kapling') && (
                            <>
                                <button className="btn btn-outline" onClick={handleImportClick}>Import Excel</button>
                                <button className="btn btn-outline" onClick={handleDownloadTemplate}>Template (.xls)</button>
                            </>
                        )}
                        <button className="btn btn-outline" onClick={handleExportData}>Export Data</button>
                        <button className="btn btn-outline" style={{ borderColor: 'var(--error)', color: 'var(--error)' }} onClick={handleDeleteAll}>Delete All</button>
                    </div>
                </div>

                {/* Content: Grouped Table View for Kapling */}
                {type === 'kapling' ? (
                    (() => {
                        // Group data by area
                        const groupedData = dataArray.reduce((acc, asset) => {
                            const area = asset.area || 'Tidak Ditentukan';
                            if (!acc[area]) {
                                acc[area] = [];
                            }
                            acc[area].push(asset);
                            return acc;
                        }, {});

                        // Sort areas alphabetically
                        const sortedAreas = Object.keys(groupedData).sort();

                        return sortedAreas.map((area, areaIndex) => {
                            const assetsInArea = groupedData[area];

                            // Calculate summaries for this area
                            const totalOccupants = assetsInArea.filter(a => a.occupant_name && a.occupant_name !== '-').length;
                            const totalLuasArea = assetsInArea.reduce((sum, item) => {
                                if (item.luas_tanah_seluruhnya && parseFloat(item.luas_tanah_seluruhnya) > 0) {
                                    return sum + parseFloat(item.luas_tanah_seluruhnya);
                                }
                                let luasStr = String(item.luas || '0').replace(/m2|m²|\s/gi, '');
                                luasStr = luasStr.replace(/\./g, '').replace(',', '.');
                                const luasNum = parseFloat(luasStr) || 0;
                                return sum + luasNum;
                            }, 0);

                            return (
                                <div key={area} style={{ marginBottom: '32px' }}>
                                    {/* Area Header */}
                                    <div style={{
                                        background: 'linear-gradient(135deg, #011F5B 0%, #023E8A 100%)',
                                        padding: '18px 28px',
                                        borderRadius: '16px 16px 0 0',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        boxShadow: '0 4px 16px rgba(1, 31, 91, 0.25)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        {/* Decorative gradient overlay */}
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            width: '300px',
                                            height: '100%',
                                            background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 70%)',
                                            pointerEvents: 'none'
                                        }}></div>

                                        <div style={{ position: 'relative', zIndex: 1 }}>
                                            <h3 style={{ color: 'white', fontSize: '17px', fontWeight: '700', margin: 0, marginBottom: '6px', letterSpacing: '0.3px' }}>
                                                📍 {area}
                                            </h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '8px' }}>
                                                    <span style={{ fontSize: '14px' }}>🏠</span>
                                                    <span style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>
                                                        {assetsInArea.length} Unit
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.2)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                                    <span style={{ fontSize: '14px' }}>👤</span>
                                                    <span style={{ color: '#d1fae5', fontSize: '13px', fontWeight: '600' }}>
                                                        {totalOccupants} Penghuni
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(245, 158, 11, 0.2)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                                                    <span style={{ fontSize: '14px' }}>📐</span>
                                                    <span style={{ color: '#fde68a', fontSize: '13px', fontWeight: '600' }}>
                                                        Tot. Luas: {totalLuasArea.toLocaleString('id-ID', { maximumFractionDigits: 0 })} m²
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ position: 'relative', zIndex: 1 }}>
                                            <button
                                                onClick={() => {
                                                    const el = document.getElementById(`table-kapling-${areaIndex}`);
                                                    const icon = document.getElementById(`icon-kapling-${areaIndex}`);
                                                    if (el) {
                                                        if (el.style.display === 'none') {
                                                            el.style.display = 'block';
                                                            if (icon) icon.style.transform = 'rotate(180deg)';
                                                        } else {
                                                            el.style.display = 'none';
                                                            if (icon) icon.style.transform = 'rotate(0deg)';
                                                        }
                                                    }
                                                }}
                                                style={{
                                                    background: 'rgba(255,255,255,0.1)',
                                                    border: '1px solid rgba(255,255,255,0.3)',
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    color: 'white',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <svg id={`icon-kapling-${areaIndex}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transition: 'transform 0.3s', transform: 'rotate(180deg)' }}>
                                                    <path d="M6 9l6 6 6-6" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Table for this area */}
                                    <div id={`table-kapling-${areaIndex}`} className="card" style={{ marginTop: 0, borderRadius: '0 0 12px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'block' }}>
                                        <div style={{ overflowX: 'auto' }}>
                                            <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                                                <thead>
                                                    <tr style={{ background: '#f8fafc', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                        <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: '600', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Identitas Aset</th>
                                                        <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: '600', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Penghuni</th>
                                                        <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: '600', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Lokasi</th>
                                                        <th style={{ padding: '14px 20px', textAlign: 'center', fontWeight: '600', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                                                        <th style={{ padding: '14px 20px', textAlign: 'right', fontWeight: '600', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Luas (m²)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {assetsInArea.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                                                                Tidak ada data pada kelompok ini.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        assetsInArea.map((asset, idx) => {
                                                            // Format luas
                                                            let displayLuas = '-';
                                                            if (asset.luas_tanah_seluruhnya && parseFloat(asset.luas_tanah_seluruhnya) > 0) {
                                                                displayLuas = parseFloat(asset.luas_tanah_seluruhnya).toLocaleString('id-ID', { maximumFractionDigits: 0 });
                                                            } else if (asset.luas && asset.luas !== '-') {
                                                                let s = String(asset.luas).replace(/m2|m²|\s/gi, '');
                                                                s = s.replace(/\./g, '').replace(',', '.');
                                                                const val = parseFloat(s) || 0;
                                                                displayLuas = val.toLocaleString('id-ID', { maximumFractionDigits: 0 });
                                                            }

                                                            return (
                                                                <tr
                                                                    key={asset.id || idx}
                                                                    onClick={(e) => openModal(e, asset)}
                                                                    style={{ cursor: 'pointer', transition: 'all 0.1s' }}
                                                                    className="hover:bg-slate-50"
                                                                >
                                                                    <td style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
                                                                        <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '13px' }}>{asset.name || '-'}</div>
                                                                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{asset.code || asset.kode_asset || '-'}</div>
                                                                    </td>
                                                                    <td style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
                                                                        <div style={{ fontWeight: '600', color: '#0369a1', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                            {asset.occupant_name ? `👤 ${asset.occupant_name}` : '-'}
                                                                        </div>
                                                                        {(asset.occupant_rank || asset.occupant_nrp) && (
                                                                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', marginLeft: '22px' }}>
                                                                                {asset.occupant_rank || '-'} / {asset.occupant_nrp || '-'}
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
                                                                        <div style={{ fontSize: '12px', color: '#334155', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                            {asset.location || '-'}
                                                                        </div>
                                                                    </td>
                                                                    <td style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                                                                        <span style={{
                                                                            display: 'inline-block',
                                                                            padding: '2px 10px',
                                                                            borderRadius: '20px',
                                                                            background: asset.status === 'Aktif' || asset.status === 'Terisi' ? '#dcfce7' : '#fef3c7',
                                                                            color: asset.status === 'Aktif' || asset.status === 'Terisi' ? '#166534' : '#b45309',
                                                                            fontSize: '10px',
                                                                            fontWeight: '700'
                                                                        }}>
                                                                            {asset.status || '-'}
                                                                        </span>
                                                                    </td>
                                                                    <td style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>
                                                                        <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '13px', fontFamily: 'monospace' }}>
                                                                            {displayLuas}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            );
                        });
                    })()
                ) : (
                    // Grouped Tables by Area (Existing Logic for Tanah/Bangunan)
                    (() => {
                        // Group data by area
                        const groupedData = dataArray.reduce((acc, asset) => {
                            const area = asset.area || 'Tidak Ditentukan';
                            if (!acc[area]) {
                                acc[area] = [];
                            }
                            acc[area].push(asset);
                            return acc;
                        }, {});

                        // Sort areas alphabetically
                        const sortedAreas = Object.keys(groupedData).sort();

                        return sortedAreas.map((area, areaIndex) => (
                            <div key={area} style={{ marginBottom: '32px' }}>
                                {/* Area Header */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #011F5B 0%, #023E8A 100%)',
                                    padding: '18px 28px',
                                    borderRadius: '16px 16px 0 0',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    boxShadow: '0 4px 16px rgba(1, 31, 91, 0.25)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {/* Decorative gradient overlay */}
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        width: '300px',
                                        height: '100%',
                                        background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 70%)',
                                        pointerEvents: 'none'
                                    }}></div>

                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <h3 style={{ color: 'white', fontSize: '17px', fontWeight: '700', margin: 0, marginBottom: '6px', letterSpacing: '0.3px' }}>
                                            📍 {area}
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', margin: 0, fontWeight: '500' }}>
                                                {groupedData[area].length} aset terdaftar
                                            </p>
                                            <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.3)' }}></div>
                                            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', margin: 0, fontWeight: '500' }}>
                                                {groupedData[area].filter(i => i.status === 'Aktif' || i.status === 'Terisi').length} Terisi
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
                                        <div style={{
                                            background: 'rgba(255,255,255,0.15)',
                                            backdropFilter: 'blur(10px)',
                                            padding: '8px 16px',
                                            borderRadius: '24px',
                                            border: '1px solid rgba(255,255,255,0.25)',
                                            color: 'white',
                                            fontSize: '14px',
                                            fontWeight: '700',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}>
                                            {groupedData[area].reduce((sum, a) => {
                                                let luasVal = 0;
                                                if (a.luas_tanah_seluruhnya && parseFloat(a.luas_tanah_seluruhnya) > 0) {
                                                    luasVal = parseFloat(a.luas_tanah_seluruhnya);
                                                } else {
                                                    let s = String(a.luas || '0').replace(/m2|m²|\s/gi, '');
                                                    s = s.replace(/\./g, '').replace(',', '.');
                                                    luasVal = parseFloat(s) || 0;
                                                }
                                                return sum + luasVal;
                                            }, 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })} m²
                                        </div>
                                        <button
                                            onClick={() => {
                                                const el = document.getElementById(`table-area-${areaIndex}`);
                                                const icon = document.getElementById(`icon-area-${areaIndex}`);
                                                if (el) {
                                                    if (el.style.display === 'none') {
                                                        el.style.display = 'block';
                                                        if (icon) icon.style.transform = 'rotate(180deg)';
                                                    } else {
                                                        el.style.display = 'none';
                                                        if (icon) icon.style.transform = 'rotate(0deg)';
                                                    }
                                                }
                                            }}
                                            style={{
                                                background: 'rgba(255,255,255,0.1)',
                                                border: '1px solid rgba(255,255,255,0.3)',
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                color: 'white',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <svg id={`icon-area-${areaIndex}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transition: 'transform 0.3s', transform: 'rotate(180deg)' }}>
                                                <path d="M6 9l6 6 6-6" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Table for this area */}
                                <div id={`table-area-${areaIndex}`} className="card" style={{ marginTop: 0, borderRadius: '0 0 12px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', display: 'block' }}>
                                    <div className="table-container">
                                        <table className="table table-compact" style={{ fontSize: '0.85rem' }}>
                                            <thead>
                                                <tr style={{ fontSize: '0.85rem', background: '#f8fafc' }}>
                                                    <th style={{ width: '30%' }}>Nama Bangunan</th>
                                                    <th style={{ width: '50%' }}>Alamat</th>
                                                    <th style={{ width: '20%', textAlign: 'right' }}>Luas</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {groupedData[area].map((asset) => {
                                                    // Format luas untuk tampilan - Prioritaskan luas_tanah_seluruhnya
                                                    let displayLuas = '-';
                                                    let luasVal = 0;

                                                    if (asset.luas_tanah_seluruhnya && parseFloat(asset.luas_tanah_seluruhnya) > 0) {
                                                        luasVal = parseFloat(asset.luas_tanah_seluruhnya);
                                                        displayLuas = luasVal.toLocaleString('id-ID', { maximumFractionDigits: 0 });
                                                    } else if (asset.luas && asset.luas !== '-') {
                                                        // Fix parsing: 1.379 -> 1379
                                                        let s = String(asset.luas).replace(/m2|m²|\s/gi, '');
                                                        s = s.replace(/\./g, '').replace(',', '.');
                                                        luasVal = parseFloat(s) || 0;
                                                        displayLuas = luasVal.toLocaleString('id-ID', { maximumFractionDigits: 0 });
                                                    }

                                                    return (
                                                        <tr key={asset.id} onClick={(e) => openModal(e, asset)} style={{ cursor: 'pointer', fontSize: '0.85rem' }} className="hover:bg-gray-50 transition-colors">
                                                            <td style={{ verticalAlign: 'top', padding: '12px' }}>
                                                                <div style={{ fontWeight: '500', color: '#1a1a1a', marginBottom: '4px' }}>
                                                                    {asset.name || '-'}
                                                                </div>
                                                                {asset.category && asset.category !== '-' && asset.category !== 'Tidak Ditentukan' && (
                                                                    <div style={{ fontSize: '0.75rem', color: '#666' }}>
                                                                        {asset.category}
                                                                    </div>
                                                                )}
                                                                {type === 'kapling' && asset.occupant_name && (
                                                                    <div style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: '600', marginTop: '2px' }}>
                                                                        👤 {asset.occupant_name} {asset.occupant_rank ? `(${asset.occupant_rank})` : ''}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td style={{ verticalAlign: 'top', padding: '12px' }}>
                                                                <div style={{
                                                                    overflow: 'hidden',
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 2,
                                                                    WebkitBoxOrient: 'vertical',
                                                                    lineHeight: '1.4',
                                                                    color: '#444'
                                                                }}>
                                                                    {asset.location || '-'}
                                                                </div>
                                                            </td>
                                                            <td style={{ verticalAlign: 'top', padding: '12px', textAlign: 'right', fontWeight: '500' }}>
                                                                {displayLuas} <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 'normal' }}>m²</span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ));
                    })()
                )}

                {/* Modal Detail/Edit - Ultra Modern 2026 */}
                {isModalOpen && selectedAsset && (
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(15, 23, 42, 0.8)',
                            backdropFilter: 'blur(16px)',
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '16px'
                        }}
                        onClick={(e) => e.target === e.currentTarget && closeModal()}
                    >
                        <div style={{
                            width: '100%',
                            maxWidth: '700px',
                            maxHeight: '92vh',
                            background: 'linear-gradient(to bottom right, #ffffff, #f8fafc)',
                            borderRadius: '20px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.1)',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            {/* Header dengan Gradient Navy */}
                            <div style={{
                                background: 'linear-gradient(135deg, #011F5B 0%, #023E8A 100%)',
                                padding: '24px 28px',
                                color: 'white',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {/* Decorative elements */}
                                <div style={{ position: 'absolute', top: 0, right: 0, width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)', borderRadius: '50%', transform: 'translate(30%, -30%)' }}></div>
                                <div style={{ position: 'absolute', bottom: -20, left: -20, width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)', borderRadius: '50%' }}></div>

                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1.5px', opacity: 0.9, marginBottom: '8px', textTransform: 'uppercase' }}>
                                                {isEditing ? '✏️ Mode Edit' : '📋 Detail Aset'}
                                            </div>
                                            <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0, lineHeight: '1.2', textShadow: '0 2px 8px rgba(0,0,0,0.1)', color: 'white' }}>
                                                {selectedAsset.name || 'Aset Tanah'}
                                            </h2>
                                            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                <span style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', padding: '6px 14px', borderRadius: '18px', fontSize: '12px', fontWeight: '600', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                                    {selectedAsset.category || 'Kategori'}
                                                </span>
                                                <span style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', padding: '6px 14px', borderRadius: '18px', fontSize: '12px', fontWeight: '600', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                                    📍 {selectedAsset.area || 'Area'}
                                                </span>
                                            </div>
                                        </div>
                                        <button onClick={closeModal} style={{
                                            background: 'rgba(255,255,255,0.15)',
                                            border: '1px solid rgba(255,255,255,0.3)',
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            fontSize: '24px',
                                            color: 'white',
                                            transition: 'all 0.2s',
                                            backdropFilter: 'blur(10px)',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                        }} onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; e.currentTarget.style.transform = 'scale(1.05)'; }} onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'scale(1)'; }}>
                                            ×
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Body Content */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%)' }}>
                                {isEditing ? (
                                    <form onSubmit={handleUpdate} style={{ display: 'grid', gap: '18px' }}>
                                        {/* Form Identitas */}
                                        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
                                            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#011F5B', marginBottom: '16px', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ width: '4px', height: '16px', background: '#011F5B', borderRadius: '2px' }}></span>
                                                IDENTITAS ASET
                                            </h3>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nama Bangunan</label>
                                                    <input type="text" value={selectedAsset.name} onChange={e => setSelectedAsset({ ...selectedAsset, name: e.target.value })} style={{ width: '100%', padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', transition: 'all 0.2s' }} onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fungsi</label>
                                                    <input type="text" value={selectedAsset.category} onChange={e => setSelectedAsset({ ...selectedAsset, category: e.target.value })} style={{ width: '100%', padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', transition: 'all 0.2s' }} onFocus={(e) => e.target.style.borderColor = '#3b82f6'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Form Lokasi */}
                                        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
                                            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#011F5B', marginBottom: '16px', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ width: '4px', height: '16px', background: '#10b981', borderRadius: '2px' }}></span>
                                                LOKASI & DIMENSI
                                            </h3>
                                            <div style={{ display: 'grid', gap: '14px' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Area</label>
                                                        <input type="text" value={selectedAsset.area} onChange={e => setSelectedAsset({ ...selectedAsset, area: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '13px' }} onFocus={(e) => e.target.style.borderColor = '#10b981'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Luas (m²)</label>
                                                        <input type="text" value={selectedAsset.luas} onChange={e => setSelectedAsset({ ...selectedAsset, luas: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', fontFamily: 'monospace' }} onFocus={(e) => e.target.style.borderColor = '#10b981'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Alamat Lengkap</label>
                                                    <input type="text" value={selectedAsset.location} onChange={e => setSelectedAsset({ ...selectedAsset, location: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '13px' }} onFocus={(e) => e.target.style.borderColor = '#10b981'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status Aset</label>
                                                    <input type="text" value={selectedAsset.status} onChange={e => setSelectedAsset({ ...selectedAsset, status: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '13px' }} onFocus={(e) => e.target.style.borderColor = '#10b981'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Latitude</label>
                                                        <input
                                                            type="text"
                                                            placeholder="-6.xxx"
                                                            value={parseCoordinates(selectedAsset.coordinates).lat}
                                                            onChange={e => {
                                                                const currentCoords = parseCoordinates(selectedAsset.coordinates);
                                                                setSelectedAsset({
                                                                    ...selectedAsset,
                                                                    coordinates: combineCoordinates(e.target.value, currentCoords.lon)
                                                                });
                                                            }}
                                                            style={{ width: '100%', padding: '10px 14px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '12px', fontFamily: 'monospace' }}
                                                            onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                                                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Longitude</label>
                                                        <input
                                                            type="text"
                                                            placeholder="106.xxx"
                                                            value={parseCoordinates(selectedAsset.coordinates).lon}
                                                            onChange={e => {
                                                                const currentCoords = parseCoordinates(selectedAsset.coordinates);
                                                                setSelectedAsset({
                                                                    ...selectedAsset,
                                                                    coordinates: combineCoordinates(currentCoords.lat, e.target.value)
                                                                });
                                                            }}
                                                            style={{ width: '100%', padding: '10px 14px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '12px', fontFamily: 'monospace' }}
                                                            onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                                                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Keterangan */}
                                        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
                                            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#011F5B', marginBottom: '12px', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ width: '4px', height: '16px', background: '#8b5cf6', borderRadius: '2px' }}></span>
                                                KETERANGAN TAMBAHAN
                                            </h3>
                                            <textarea value={selectedAsset.map_boundary || ''} onChange={e => setSelectedAsset({ ...selectedAsset, map_boundary: e.target.value })} rows="3" style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '13px', resize: 'vertical', transition: 'all 0.2s' }} onFocus={(e) => { e.target.style.borderColor = '#011F5B'; e.target.style.boxShadow = '0 0 0 3px rgba(1,31,91,0.1)'; }} onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}></textarea>
                                        </div>

                                        {/* Action Buttons */}
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '4px' }}>
                                            <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '10px 20px', borderRadius: '10px', border: '2px solid #e2e8f0', background: 'white', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>Batal</button>
                                            <button type="submit" style={{ padding: '10px 28px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', fontWeight: '600', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>💾 Simpan Perubahan</button>
                                        </div>
                                    </form>
                                ) : (
                                    <div style={{ display: 'grid', gap: '16px' }}>
                                        {/* Info Card - Khusus Kapling: Penghuni */}
                                        {type === 'kapling' && (
                                            <div style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', padding: '18px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #10b981' }}>
                                                <div style={{ fontSize: '10px', fontWeight: '700', color: '#047857', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    👤 DATA PENGHUNI
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                    <div>
                                                        <div style={{ fontSize: '9px', fontWeight: '700', color: '#065f46', marginBottom: '3px' }}>NAMA LENGKAP</div>
                                                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{selectedAsset.occupant_name || '-'}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '9px', fontWeight: '700', color: '#065f46', marginBottom: '3px' }}>PANGKAT & NRP</div>
                                                        <div style={{ fontSize: '13px', color: '#1e293b' }}>
                                                            {selectedAsset.occupant_rank || '-'} / {selectedAsset.occupant_nrp || '-'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Info Card 1: Alamat */}
                                        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                                                <div style={{ width: '42px', height: '42px', borderRadius: '11px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', letterSpacing: '1px', marginBottom: '5px' }}>ALAMAT LENGKAP</div>
                                                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', lineHeight: '1.5' }}>{selectedAsset.location || '-'}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Info Grid */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                                            <div style={{ background: 'white', padding: '18px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
                                                <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', letterSpacing: '1px', marginBottom: '6px' }}>STATUS</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                                                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: selectedAsset.status === 'Aktif' ? '#10b981' : '#f59e0b' }}></span>
                                                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{selectedAsset.status || '-'}</span>
                                                </div>
                                            </div>
                                            <div style={{ background: 'white', padding: '18px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
                                                <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', letterSpacing: '1px', marginBottom: '6px' }}>LUAS TANAH</div>
                                                <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', fontFamily: 'monospace' }}>
                                                    {(() => {
                                                        let luasVal = 0;
                                                        if (selectedAsset.luas_tanah_seluruhnya && parseFloat(selectedAsset.luas_tanah_seluruhnya) > 0) {
                                                            luasVal = parseFloat(selectedAsset.luas_tanah_seluruhnya);
                                                        } else if (selectedAsset.luas) {
                                                            let s = String(selectedAsset.luas).replace(/m2|m²|\s/gi, '');
                                                            s = s.replace(/\./g, '').replace(',', '.');
                                                            luasVal = parseFloat(s) || 0;
                                                        }
                                                        return luasVal.toLocaleString('id-ID', { maximumFractionDigits: 0 });
                                                    })()} <span style={{ fontSize: '13px', color: '#64748b', fontFamily: 'sans-serif', fontWeight: '500' }}>m²</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Koordinat */}
                                        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
                                            <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', letterSpacing: '1px', marginBottom: '12px' }}>KOORDINAT GPS</div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                <div style={{ background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                                                    <div style={{ fontSize: '9px', fontWeight: '700', color: '#64748b', marginBottom: '5px', letterSpacing: '0.8px' }}>LATITUDE</div>
                                                    <code style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                                                        {parseCoordinates(selectedAsset.coordinates).lat || '-'}
                                                    </code>
                                                </div>
                                                <div style={{ background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                                                    <div style={{ fontSize: '9px', fontWeight: '700', color: '#64748b', marginBottom: '5px', letterSpacing: '0.8px' }}>LONGITUDE</div>
                                                    <code style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                                                        {parseCoordinates(selectedAsset.coordinates).lon || '-'}
                                                    </code>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Informasi BMN */}
                                        <div style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #fbbf24' }}>
                                            <div style={{ fontSize: '10px', fontWeight: '700', color: '#92400e', letterSpacing: '1px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                📋 INFORMASI BMN (BARANG MILIK NEGARA)
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                                                <div style={{ background: 'rgba(255,255,255,0.8)', padding: '12px', borderRadius: '10px' }}>
                                                    <div style={{ fontSize: '9px', fontWeight: '700', color: '#78716c', marginBottom: '4px', letterSpacing: '0.5px' }}>KODE ASSET</div>
                                                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', fontFamily: 'monospace' }}>
                                                        {selectedAsset.code || selectedAsset.kode_asset || '-'}
                                                    </div>
                                                </div>
                                                <div style={{ background: 'rgba(255,255,255,0.8)', padding: '12px', borderRadius: '10px' }}>
                                                    <div style={{ fontSize: '9px', fontWeight: '700', color: '#78716c', marginBottom: '4px', letterSpacing: '0.5px' }}>NUP</div>
                                                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', fontFamily: 'monospace' }}>
                                                        {selectedAsset.nup || '-'}
                                                    </div>
                                                </div>
                                                <div style={{ background: 'rgba(255,255,255,0.8)', padding: '12px', borderRadius: '10px' }}>
                                                    <div style={{ fontSize: '9px', fontWeight: '700', color: '#78716c', marginBottom: '4px', letterSpacing: '0.5px' }}>TGL PEROLEHAN</div>
                                                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                                                        {selectedAsset.tanggal_perolehan || '-'}
                                                    </div>
                                                </div>
                                                <div style={{ background: 'rgba(255,255,255,0.8)', padding: '12px', borderRadius: '10px' }}>
                                                    <div style={{ fontSize: '9px', fontWeight: '700', color: '#78716c', marginBottom: '4px', letterSpacing: '0.5px' }}>NILAI PEROLEHAN</div>
                                                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#059669' }}>
                                                        {selectedAsset.nilai_perolehan
                                                            ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(selectedAsset.nilai_perolehan)
                                                            : '-'}
                                                    </div>
                                                </div>
                                                <div style={{ background: 'rgba(255,255,255,0.8)', padding: '12px', borderRadius: '10px', gridColumn: 'span 2' }}>
                                                    <div style={{ fontSize: '9px', fontWeight: '700', color: '#78716c', marginBottom: '4px', letterSpacing: '0.5px' }}>NO. SERTIFIKAT</div>
                                                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                                                        {selectedAsset.no_sertifikat || '-'}
                                                    </div>
                                                </div>
                                            </div>
                                            {!selectedAsset.code && !selectedAsset.kode_asset && !selectedAsset.nup && (
                                                <div style={{ marginTop: '12px', fontSize: '11px', color: '#92400e', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    ⚠️ Data BMN belum terisi. Import dari Master Asset untuk mengisi data ini.
                                                </div>
                                            )}
                                        </div>

                                        {/* Keterangan */}
                                        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
                                            <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', letterSpacing: '1px', marginBottom: '10px' }}>KETERANGAN</div>
                                            <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', fontStyle: selectedAsset.map_boundary && selectedAsset.map_boundary !== '-' ? 'normal' : 'italic' }}>
                                                {selectedAsset.map_boundary && selectedAsset.map_boundary !== '-' ? selectedAsset.map_boundary : 'Tidak ada keterangan tambahan.'}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            {!isEditing && (
                                <div style={{ padding: '20px 24px', borderTop: '1px solid #e5e7eb', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <button onClick={handleDelete} style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', color: '#dc2626', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(220,38,38,0.15)' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(220,38,38,0.25)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(220,38,38,0.15)'; }}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                                        Hapus
                                    </button>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button onClick={closeModal} style={{ padding: '10px 24px', borderRadius: '12px', border: '2px solid #e5e7eb', background: 'white', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f9fafb'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = 'white'; }}>Tutup</button>
                                        <button onClick={() => setIsEditing(true)} style={{ padding: '10px 28px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #011F5B 0%, #023E8A 100%)', color: 'white', fontWeight: '600', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(1,31,91,0.3)', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(1,31,91,0.4)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(1,31,91,0.3)'; }}>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                            Edit Data
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </ErrorBoundary>
    )
}

Faslan.propTypes = {
    type: PropTypes.string.isRequired
}

export default Faslan
