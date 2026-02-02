import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { read, utils, writeFile } from 'xlsx'

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
            const endpoint = type === 'tanah' ? '/api/assets/tanah' : '/api/assets/bangunan'
            const finalEndpoint = import.meta.env.PROD ? endpoint : `http://localhost:3001${endpoint}`

            const response = await fetch(finalEndpoint)
            const result = await response.json()
            setData(result)
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }

    useEffect(() => {
        fetchData()

        if (type === 'tanah') {
            setTitle('Fasilitas Pangkalan - Aset Tanah')
        } else {
            setTitle('Fasilitas Pangkalan - Aset Bangunan')
        }
    }, [type])

    // Helper function to parse coordinates correctly
    // Rule: Pisahkan berdasarkan S (Latitude) dan E (Longitude)
    const parseCoordinates = (coordString) => {
        if (!coordString || coordString === '-') {
            return { lat: '', lon: '' };
        }

        // Check if format contains S and E markers (DMS format)
        if (coordString.includes('S') || coordString.includes('E') || coordString.includes('N') || coordString.includes('W')) {
            let lat = '';
            let lon = '';

            // Split by S or N for latitude
            const latMatch = coordString.match(/([^SE]+)\s*[SN]/i);
            if (latMatch) {
                lat = latMatch[1].trim() + ' S';
            }

            // Split by E or W for longitude
            const lonMatch = coordString.match(/([^SN]+)\s*[EW]/i);
            if (lonMatch) {
                // Extract only the part after latitude
                const afterLat = coordString.split(/[SN]/i)[1] || '';
                const lonPart = afterLat.match(/(.+?)\s*[EW]/i);
                if (lonPart) {
                    lon = lonPart[1].trim() + ' E';
                }
            }

            return { lat, lon };
        }

        // Original logic for decimal format
        const parts = coordString.split(',').map(s => s.trim()).filter(s => s);

        if (parts.length === 0) {
            return { lat: '', lon: '' };
        }

        if (parts.length === 1) {
            // Only one value - check if it's longitude (1xx) or latitude (0x/-x)
            const num = Math.abs(parseFloat(parts[0]));
            if (num >= 100) {
                // Ratusan = Longitude
                return { lat: '', lon: parts[0] };
            } else {
                // Puluhan/satuan = Latitude
                return { lat: parts[0], lon: '' };
            }
        }

        // Two values - determine which is lat and which is lon
        const num1 = Math.abs(parseFloat(parts[0]));
        const num2 = Math.abs(parseFloat(parts[1]));

        // Check first value
        if (num1 >= 100) {
            // First is longitude (1xx), second is latitude
            return { lat: parts[1], lon: parts[0] };
        } else {
            // First is latitude (0x/-x), second is longitude
            return { lat: parts[0], lon: parts[1] };
        }
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
        utils.book_append_sheet(wb, ws, `Data Aset ${type === 'tanah' ? 'Tanah' : 'Bangunan'}`);

        const fileName = `Export_Aset_${type === 'tanah' ? 'Tanah' : 'Bangunan'}_${new Date().toISOString().split('T')[0]}.xlsx`;
        writeFile(wb, fileName, { bookType: 'xlsx' });

        alert(`Berhasil mengekspor ${data.length} data`);
    };

    const handleDownloadTemplate = () => {
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
        utils.book_append_sheet(wb, ws, 'Template Aset Tanah');
        writeFile(wb, 'Template_Import_Aset_Tanah.xlsx', { bookType: 'xlsx' });
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

                // Format luas - cek kolom "Luas (m2)" atau "Luas"
                let luas = row['Luas (m2)'] || row['Luas'] || row['LUAS'] || '0';
                luas = String(luas).trim();
                // Hapus semua karakter non-angka dan non-titik
                const luasNum = parseFloat(luas.replace(/[^0-9.]/g, '')) || 0;
                // Format dengan pemisah ribuan (xxx.xxx)
                luas = luasNum.toLocaleString('id-ID', { maximumFractionDigits: 0 });

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

            const endpoint = import.meta.env.PROD ? '/api/assets/tanah' : 'http://localhost:3001/api/assets/tanah'
            for (const item of formattedData) {
                await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item)
                })
            }

            fetchData()
            alert(`Berhasil mengimport ${formattedData.length} data ke database!`)
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
            const endpoint = import.meta.env.PROD ? `/api/assets/tanah/${selectedAsset.id}` : `http://localhost:3001/api/assets/tanah/${selectedAsset.id}`;
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
            const endpoint = import.meta.env.PROD ? `/api/assets/tanah/${selectedAsset.id}` : `http://localhost:3001/api/assets/tanah/${selectedAsset.id}`;
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

    const stats = type === 'tanah' ? [
        { label: 'Total Aset Tanah', value: data.length.toString(), color: 'var(--navy-primary)' },
        {
            label: 'Luas Total',
            value: (() => {
                const totalLuas = data.reduce((sum, item) => {
                    const luasStr = item.luas || '0';
                    const luasNum = parseFloat(luasStr.replace(/[^0-9.]/g, '')) || 0;
                    return sum + luasNum;
                }, 0);
                return `${totalLuas.toLocaleString('id-ID')} m²`;
            })(),
            color: 'var(--success)'
        },
        { label: 'Status Aktif', value: data.filter(i => i.status === 'Aktif').length.toString(), color: 'var(--info)' },
        { label: 'Total Area', value: new Set(data.map(i => i.area).filter(a => a && a !== '-')).size.toString(), color: 'var(--warning)' }
    ] : []

    const handleDeleteAll = async () => {
        if (!window.confirm(`PERINGATAN: Apakah Anda yakin ingin MENGHAPUS SEMUA DATA aset ${type}? Tindakan ini tidak dapat dibatalkan.`)) return;
        if (!window.confirm('Verifikasi terakhir: Data akan hilang permanen. Lanjutkan?')) return;

        try {
            const endpoint = type === 'tanah' ? '/api/assets/tanah' : '/api/assets/bangunan';
            const finalEndpoint = import.meta.env.PROD ? endpoint : `http://localhost:3001${endpoint}`;

            await fetch(finalEndpoint, { method: 'DELETE' });
            alert('Semua data berhasil dihapus');
            fetchData();
        } catch (error) {
            console.error('Error deleting all assets:', error);
            alert('Gagal menghapus data');
        }
    }

    return (
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
                        Tambah {type === 'tanah' ? 'Tanah' : 'Bangunan'}
                    </button>
                    {type === 'tanah' && (
                        <>
                            <button className="btn btn-outline" onClick={handleImportClick}>Import Excel</button>
                            <button className="btn btn-outline" onClick={handleDownloadTemplate}>Template (.xls)</button>
                        </>
                    )}
                    <button className="btn btn-outline" onClick={handleExportData}>Export Data</button>
                    <button className="btn btn-outline" style={{ borderColor: 'var(--error)', color: 'var(--error)' }} onClick={handleDeleteAll}>Delete All</button>
                </div>
            </div>

            {/* Grouped Tables by Area */}
            {(() => {
                // Group data by area
                const groupedData = data.reduce((acc, asset) => {
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
                                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', margin: 0, fontWeight: '500' }}>
                                    {groupedData[area].length} aset terdaftar
                                </p>
                            </div>
                            <div style={{
                                background: 'rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(10px)',
                                padding: '10px 20px',
                                borderRadius: '24px',
                                border: '1px solid rgba(255,255,255,0.25)',
                                color: 'white',
                                fontSize: '15px',
                                fontWeight: '700',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                position: 'relative',
                                zIndex: 1
                            }}>
                                {groupedData[area].reduce((sum, a) => {
                                    const luasNum = parseFloat(String(a.luas || '0').replace(/[^0-9.]/g, '')) || 0;
                                    return sum + luasNum;
                                }, 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })} m²
                            </div>
                        </div>

                        {/* Table for this area */}
                        <div className="card" style={{ marginTop: 0, borderRadius: '0 0 12px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
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
                                            // Format luas untuk tampilan
                                            let displayLuas = '-';
                                            if (asset.luas && asset.luas !== '-') {
                                                const luasStr = String(asset.luas);
                                                const luasNum = parseFloat(luasStr.replace(/[^0-9.]/g, '')) || 0;
                                                displayLuas = luasNum.toLocaleString('id-ID', { maximumFractionDigits: 0 });
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
            })()}

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
                                            <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', fontFamily: 'monospace' }}>{selectedAsset.luas ? String(selectedAsset.luas).replace('m²', '') : '0'} <span style={{ fontSize: '13px', color: '#64748b', fontFamily: 'sans-serif', fontWeight: '500' }}>m²</span></div>
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
    )
}

Faslan.propTypes = {
    type: PropTypes.string.isRequired
}

export default Faslan
