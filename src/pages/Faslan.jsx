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
    const [selectedIds, setSelectedIds] = useState([])
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const fileInputRef = useRef(null)

    // Data loading logic
    const fetchData = async () => {
        try {
            let endpoint = type === 'tanah' ? '/api/assets/tanah' : (type === 'kapling' ? '/api/assets/kapling' : '/api/assets/bangunan')

            // For Rumneg Lagoa, we use the bangunan endpoint
            if (type === 'rumneg-lagoa') {
                endpoint = '/api/assets/bangunan'
            }
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
                if (type === 'rumneg-lagoa') {
                    // Filter for Rumah Negara Lagoa
                    // Criteria: Location/Area contains 'Lagoa' OR Name contains 'Lagoa'
                    // And ideally Category contains 'Rumah' or 'Rumah Negara'
                    const filtered = result.filter(item => {
                        const searchStr = (item.name + ' ' + item.location + ' ' + item.area + ' ' + item.category).toLowerCase()
                        return searchStr.includes('lagoa')
                    })
                    setData(filtered)
                } else {
                    setData(result)
                }
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
        } else if (type === 'rumneg-lagoa') {
            setTitle('Fasilitas Pangkalan - Rumah Negara Lagoa')
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
        const typeName = type === 'tanah' ? 'Tanah' : (type === 'kapling' ? 'Kapling' : (type === 'rumneg-lagoa' ? 'RumahNegara' : 'Bangunan'));
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

        if (type === 'bangunan' || type === 'rumneg-lagoa') {
            const headers = [
                'NO',
                'NAMA PENGHUNI',
                'PANGKAT/KORPS',
                'NRP/NIP',
                'ALAMAT',
                'STATUS PENGHUNI',
                'NO SIP',
                'TANGGAL SIP',
                'TIPE',
                'GOL',
                'TAHUN BUAT',
                'ASAL PEROLEHAN',
                'MENDAPAT FASDIN',
                'KONDISI',
                'KETERANGAN'
            ];

            const sampleData = [
                {
                    'NO': 1,
                    'NAMA PENGHUNI': 'Pudji Bayu',
                    'PANGKAT/KORPS': 'Peltu TIS',
                    'NRP/NIP': 'Nrp. 3965',
                    'ALAMAT': 'Jl. Lagoa Kanal No. I',
                    'STATUS PENGHUNI': 'Anak Dewasa',
                    'NO SIP': 'SIP/902/VII/2009',
                    'TANGGAL SIP': '31-Jul-09',
                    'TIPE': '36 / 138',
                    'GOL': '',
                    'TAHUN BUAT': 1958,
                    'ASAL PEROLEHAN': 'Milik TNI AL',
                    'MENDAPAT FASDIN': '',
                    'KONDISI': 'Baik',
                    'KETERANGAN': ''
                }
            ];

            const ws = utils.json_to_sheet(sampleData, { header: headers });
            const wb = utils.book_new();
            utils.book_append_sheet(wb, ws, `Template ${type === 'rumneg-lagoa' ? 'Rumah Negara' : 'Bangunan'}`);
            writeFile(wb, `Template_Import_Aset_${type === 'rumneg-lagoa' ? 'RumahNegara' : 'Bangunan'}.xlsx`, { bookType: 'xlsx' });
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
        const typeName = type === 'tanah' ? 'Tanah' : (type === 'kapling' ? 'Kapling' : (type === 'rumneg-lagoa' ? 'RumahNegara' : 'Bangunan'));
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
            // Find header row: look for row containing 'NO' and 'NAMA' or 'NAME'
            let headerRowIndex = 0;
            const rawJson = utils.sheet_to_json(worksheet, { header: 1 });

            for (let i = 0; i < Math.min(10, rawJson.length); i++) {
                const rowStr = JSON.stringify(rawJson[i]).toUpperCase();
                if (rowStr.includes('NO') && (rowStr.includes('NAMA') || rowStr.includes('NAME'))) {
                    headerRowIndex = i;
                    break;
                }
            }

            // Re-parse with found header row
            const jsonData = utils.sheet_to_json(worksheet, { range: headerRowIndex });

            console.log('Sample row:', jsonData[0]); // Debug: lihat struktur data

            const formattedData = jsonData.map((row, index) => {
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
                        code: `KPL-${Date.now()}-${index}`,
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

                // --- LOGIC KHUSUS BANGUNAN & RUMNEG ---
                if (type === 'bangunan' || type === 'rumneg-lagoa') {
                    // Helper untuk mencari value dengan key yang mirip (fuzzy match)
                    const findVal = (patterns) => {
                        const keys = Object.keys(row);
                        for (const pattern of patterns) {
                            // 1. Exact or Partial Match (Normalized)
                            const foundKey = keys.find(k => {
                                const normKey = String(k).toUpperCase().replace(/[^A-Z0-9]/g, '');
                                const normPattern = String(pattern).toUpperCase().replace(/[^A-Z0-9]/g, '');
                                return normKey.includes(normPattern) || normPattern.includes(normKey);
                            });

                            if (foundKey && row[foundKey] && row[foundKey] !== '-') {
                                return String(row[foundKey]).trim();
                            }
                        }
                        return null;
                    };

                    // 1. Parsing Identitas Penghuni (Nama/Pangkat/NRP)
                    let parsedName = findVal(['NAMA PENGHUNI']) || '-';
                    let parsedRank = findVal(['PANGKAT', 'KORPS']) || '-';
                    let parsedNrp = findVal(['NRP', 'NIP']) || '-';
                    let rawOccupantInfo = findVal(['NAMA', 'PANGKAT', 'NRP']); // Mencari kolom gabungan "NAMA PANGKAT NRP"

                    // Jika ada kolom gabungan dan kolom terpisah kosong/tidak lengkap
                    if (rawOccupantInfo && (parsedName === '-' || parsedName.length < 3)) {
                        // Coba split berdasarkan newline
                        const parts = rawOccupantInfo.split(/[\n\r]+/);
                        if (parts.length >= 1) parsedName = parts[0].trim();
                        if (parts.length >= 2) parsedRank = parts[1].trim();
                        if (parts.length >= 3) parsedNrp = parts[2].trim();

                        // Fallback: Jika split gagal (tidak ada newline), masukkan semua ke Nama
                        if (parts.length === 1 && parsedName.length > 50) {
                            // Asumsi format panjang tanpa enter
                            parsedName = rawOccupantInfo;
                        }
                    }

                    // 2. Parsing SIP (No SIP / Tanggal)
                    let parsedSip = findVal(['NO SIP', 'NOMOR SIP']) || '-';
                    let parsedTglSip = findVal(['TANGGAL SIP', 'TGL SIP']) || '-';
                    const rawSipInfo = findVal(['NO SIP', 'TANGGAL']); // Kolom gabungan

                    if (rawSipInfo && (parsedSip === '-' || parsedSip.length < 3)) {
                        const parts = rawSipInfo.split(/[\n\r]+/);
                        if (parts.length >= 2) {
                            parsedSip = parts[0].trim();
                            parsedTglSip = parts[1].trim();
                        } else {
                            // Coba regex tanggal (dd-MMM-yy atau dd/mm/yyyy)
                            const dateMatch = rawSipInfo.match(/(\d{1,2}[-\s][A-Za-z]{3}[-\s]\d{2,4}|\d{1,2}\/\d{1,2}\/\d{2,4})/);
                            if (dateMatch) {
                                parsedTglSip = dateMatch[0];
                                parsedSip = rawSipInfo.replace(parsedTglSip, '').trim();
                            } else {
                                parsedSip = rawSipInfo; // Semuanya dianggap No SIP
                            }
                        }
                    }

                    // 3. Parsing Tahun Buat (Integer Only)
                    const rawTahun = findVal(['TAHUN BUAT', 'THN BUAT', 'TAHUN']);
                    let parsedTahun = null;
                    if (rawTahun) {
                        const match = String(rawTahun).match(/\d{4}/);
                        if (match) parsedTahun = parseInt(match[0]);
                    }

                    // 4. Parsing Luas (Numeric)
                    const rawLuas = findVal(['LUAS', 'LUAS BANGUNAN']) || '0';
                    let parsedLuas = 0;
                    if (rawLuas) {
                        let s = String(rawLuas).replace(/m2|m²|\s/gi, '');
                        s = s.replace(/\./g, '').replace(',', '.'); // Format Indo 1.000,00 -> 1000.00
                        parsedLuas = parseFloat(s) || 0;
                    }

                    // 5. Parsing Rumah Negara (Area/Komp) from specific column if exists
                    // 5. Parsing Rumah Negara (Area/Komp)
                    const keyArea = findVal(['AREA', 'WILAYAH', 'KOMPLEK', 'PERUMAHAN']);
                    let parsedArea = type === 'rumneg-lagoa' ? 'Komp. Rumneg Lagoa' : 'Jakarta Utara';
                    if (keyArea && keyArea !== '-' && keyArea !== '0') {
                        parsedArea = keyArea;
                    }

                    return {
                        code: `BG-${Date.now()}-${index}`,
                        // Name: Occupant Name (or default)
                        // If occupant is empty/unknown, maybe use the house type or just "Rumah Negara"
                        name: parsedName !== '-' ? parsedName : 'Rumah Negara',
                        category: type === 'rumneg-lagoa' ? 'Rumah Negara Lagoa' : 'Bangunan',
                        location: findVal(['ALAMAT', 'LOKASI']) || '-',
                        status: 'Aktif',
                        occupant_name: parsedName,
                        occupant_rank: parsedRank,
                        occupant_nrp: parsedNrp,
                        occupant_title: '-',
                        status_penghuni: findVal(['STATUS PENGHUNI', 'STATUS HUNIAN']) || '-',
                        no_sip: parsedSip,
                        tgl_sip: parsedTglSip,
                        tipe_rumah: findVal(['TIPE', 'TYPE']) || '-',
                        golongan: findVal(['GOL', 'GOLONGAN']) || '-',
                        tahun_buat: parsedTahun, // Must be integer or null
                        asal_perolehan: findVal(['ASAL PEROLEHAN', 'ASAL']) || '-',
                        mendapat_fasdin: findVal(['MENDAPAT FASDIN', 'FASDIN']) || '-',
                        kondisi: findVal(['KONDISI']) || '-',
                        keterangan: findVal(['KETERANGAN', 'KET']) || '-',
                        area: parsedArea,
                        coordinates: '-',
                        luas: String(parsedLuas),
                        map_boundary: '-'
                    };
                }

                // --- LOGIC EXISTING (TANAH) ---
                const name = row['Nama Bangunan/Komplek Bangunan'] || row['Nama Bangunan'] || row['Nama'] || 'Tanpa Nama';
                const category = row['Fungsi Bangunan'] || row['Fungsi'] || 'Tidak Ditentukan';
                const area = row['Area'] || '-';
                const location = row['Alamat'] || '-';
                const status = row['Status Aset'] || row['Status'] || 'Aktif';

                let coordinates = '-';
                const coordValue = row['Lokasi Koordinat'] || row['LOKASI KOORDINAT'] || row['Koordinat'] || '';
                if (coordValue && coordValue !== '-') {
                    coordinates = String(coordValue).trim();
                } else if (row['Lon'] && row['Lat']) {
                    coordinates = `${row['Lat']}, ${row['Lon']}`;
                } else if (row['Lon']) {
                    coordinates = `-, ${row['Lon']}`;
                } else if (row['Lat']) {
                    coordinates = `${row['Lat']}, -`;
                }

                let luasStr = String(row['Luas (m2)'] || row['Luas'] || row['LUAS'] || '0').trim();
                luasStr = luasStr.replace(/m2|m²|\s/gi, '');
                luasStr = luasStr.replace(/\./g, '').replace(',', '.');
                const luasNum = parseFloat(luasStr) || 0;
                const luas = luasNum.toString();

                const map_boundary = row['Keterangan'] || row['KETERANGAN'] || '-';

                return {
                    code: `IMP-${Date.now()}-${index}`,
                    name, category, location, status, coordinates, luas, map_boundary, area,
                    occupant_name: '-', occupant_rank: '-', occupant_nrp: '-', occupant_title: '-'
                };
            })

            if (type === 'bangunan' || type === 'rumneg-lagoa') {
                try {
                    console.log('Sending Bulk Upsert request...', formattedData.length, 'records');
                    const res = await fetch('/api/assets/bangunan/bulk-upsert', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ assets: formattedData, mode: 'upsert' })
                    });

                    if (!res.ok) throw new Error(`Server Error: ${res.statusText}`);
                    const result = await res.json();
                    alert(`Import Selesai.\n✅ Data Baru: ${result.inserted}\n✅ Data Update: ${result.updated}\n❌ Gagal: ${result.failed}`);
                } catch (err) {
                    console.error("Bulk Import Error:", err);
                    alert("Gagal melakukan Bulk Import: " + err.message);
                }
            } else {
                let apiPath = type === 'tanah' ? '/api/assets/tanah' : (type === 'kapling' ? '/api/assets/kapling' : '/api/assets/bangunan')
                const endpoint = apiPath
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
                        else failCount++;
                    } catch (err) {
                        failCount++;
                        console.error(`Error uploading item: ${item.name}`, err);
                    }
                }
                alert(`Import Selesai. Sukses: ${successCount}, Gagal: ${failCount}`);
            }
            fetchData()
        } catch (error) {
            console.error('Error importing file:', error)
            alert('Gagal mengimport file. Pastikan format sesuai.')
        }
        e.target.value = null
    }

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Yakin ingin menghapus ${selectedIds.length} data terpilih?`)) return;

        try {
            const res = await fetch('/api/assets/bangunan/bulk', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds })
            });

            if (res.ok) {
                alert(`Berhasil menghapus ${selectedIds.length} data.`);
                setSelectedIds([]);
                fetchData();
            } else {
                alert('Gagal menghapus data.');
            }
        } catch (error) {
            console.error('Bulk Delete Error:', error);
            alert('Terjadi kesalahan saat menghapus data.');
        }
    };

    const openModal = (e, asset) => {
        if (e && e.stopPropagation) e.stopPropagation();
        if (!asset) return;
        setSelectedAsset(asset);
        setIsEditing(false);
        setIsModalOpen(true);
    }

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedAsset(null), 200);
        setIsEditing(false);
    }

    const handleDelete = async () => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
        try {
            let apiPath = type === 'tanah' ? '/api/assets/tanah' : (type === 'kapling' ? '/api/assets/kapling' : '/api/assets/bangunan')
            if (type === 'rumneg-lagoa') apiPath = '/api/assets/bangunan'
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
            let apiPath = type === 'tanah' ? '/api/assets/tanah' : (type === 'kapling' ? '/api/assets/kapling' : '/api/assets/bangunan')
            if (type === 'rumneg-lagoa') apiPath = '/api/assets/bangunan'
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

    const handleDeleteAll = async () => {
        if (!window.confirm(`PERINGATAN: Apakah Anda yakin ingin MENGHAPUS SEMUA DATA aset ${type}?`)) return;
        try {
            let endpoint = type === 'tanah' ? '/api/assets/tanah' : (type === 'kapling' ? '/api/assets/kapling' : '/api/assets/bangunan');
            if (type === 'rumneg-lagoa') endpoint = '/api/assets/bangunan';
            await fetch(endpoint, { method: 'DELETE' });
            alert('Semua data berhasil dihapus');
            fetchData();
        } catch (error) {
            console.error('Error deleting all assets:', error);
            alert('Gagal menghapus data');
        }
    }

    const dataArray = Array.isArray(data) ? data : []

    const stats = (type === 'tanah' || type === 'kapling') ? [
        { label: `Total Aset`, value: dataArray.length.toString(), color: 'var(--navy-primary)' },
        {
            label: 'Luas Total',
            value: (() => {
                const totalLuas = dataArray.reduce((sum, item) => {
                    if (item.luas_tanah_seluruhnya && parseFloat(item.luas_tanah_seluruhnya) > 0) {
                        return sum + parseFloat(item.luas_tanah_seluruhnya);
                    }
                    let luasStr = String(item.luas || '0').replace(/m2|m²|\s/gi, '').replace(/\./g, '').replace(',', '.');
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

    return (
        <ErrorBoundary>
            <div>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls" style={{ display: 'none' }} />

                <div className="page-header">
                    <h1 className="page-title">{title}</h1>
                    <p className="page-subtitle">Manajemen data aset {type} di lingkungan Kodaeral 3 Jakarta</p>
                </div>

                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
                            <div className="stat-label">{stat.label}</div>
                            <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-center mb-lg">
                    <div className="flex gap-md">
                        <button className="btn btn-primary">Tambah</button>
                        {(type === 'tanah' || type === 'kapling' || type === 'bangunan' || type === 'rumneg-lagoa') && (
                            <>
                                <button className="btn btn-outline" onClick={handleImportClick}>Import Excel</button>
                                <button className="btn btn-outline" onClick={handleDownloadTemplate}>Template (.xls)</button>
                            </>
                        )}
                        <button className="btn btn-outline" onClick={handleExportData}>Export Data</button>

                        {!isSelectionMode ? (
                            <button className="btn btn-outline" style={{ borderColor: 'var(--error)', color: 'var(--error)' }} onClick={() => setIsSelectionMode(true)}>Hapus Multi</button>
                        ) : (
                            <>
                                <button className="btn btn-outline" onClick={() => { setIsSelectionMode(false); setSelectedIds([]); }}>Batal Hapus</button>
                                {selectedIds.length > 0 && (
                                    <button className="btn btn-danger" style={{ background: 'var(--error)', color: 'white', borderColor: 'var(--error)' }} onClick={handleBulkDelete}>Hapus ({selectedIds.length}) Item</button>
                                )}
                            </>
                        )}
                        <button className="btn btn-outline" style={{ borderColor: 'var(--navy-primary)', color: 'var(--navy-primary)' }} onClick={handleDeleteAll}>Reset All Data</button>
                    </div>
                </div>

                {/* Content: Grouped Table View */}
                {type === 'kapling' ? (
                    (() => {
                        const groupedData = dataArray.reduce((acc, asset) => {
                            const area = asset.area || 'Tidak Ditentukan';
                            if (!acc[area]) acc[area] = [];
                            acc[area].push(asset);
                            return acc;
                        }, {});

                        const sortedAreas = Object.keys(groupedData).sort();

                        return sortedAreas.map((area, areaIndex) => {
                            const assetsInArea = groupedData[area];
                            const totalOccupants = assetsInArea.filter(a => a.occupant_name && a.occupant_name !== '-').length;
                            const totalLuasArea = assetsInArea.reduce((sum, item) => {
                                if (item.luas_tanah_seluruhnya && parseFloat(item.luas_tanah_seluruhnya) > 0) return sum + parseFloat(item.luas_tanah_seluruhnya);
                                let luasStr = String(item.luas || '0').replace(/m2|m²|\s/gi, '').replace(/\./g, '').replace(',', '.');
                                return sum + (parseFloat(luasStr) || 0);
                            }, 0);

                            return (
                                <div key={area} style={{ marginBottom: '32px' }}>
                                    <div style={{ background: 'linear-gradient(135deg, #011F5B 0%, #023E8A 100%)', padding: '18px 28px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 16px rgba(1, 31, 91, 0.25)', position: 'relative', overflow: 'hidden' }}>
                                        <div style={{ position: 'relative', zIndex: 1 }}>
                                            <h3 style={{ color: 'white', fontSize: '17px', fontWeight: '700', margin: 0, marginBottom: '6px', letterSpacing: '0.3px' }}>📍 {area}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '8px' }}>
                                                    <span style={{ fontSize: '14px' }}>🏠</span>
                                                    <span style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>{assetsInArea.length} Unit</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.2)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                                    <span style={{ fontSize: '14px' }}>👤</span>
                                                    <span style={{ color: '#d1fae5', fontSize: '13px', fontWeight: '600' }}>{totalOccupants} Penghuni</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(245, 158, 11, 0.2)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                                                    <span style={{ fontSize: '14px' }}>📐</span>
                                                    <span style={{ color: '#fde68a', fontSize: '13px', fontWeight: '600' }}>Tot. Luas: {totalLuasArea.toLocaleString('id-ID', { maximumFractionDigits: 0 })} m²</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card" style={{ marginTop: 0, borderRadius: '0 0 12px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'block' }}>
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
                                                    {assetsInArea.map((asset, idx) => {
                                                        let displayLuas = '-';
                                                        if (asset.luas_tanah_seluruhnya && parseFloat(asset.luas_tanah_seluruhnya) > 0) displayLuas = parseFloat(asset.luas_tanah_seluruhnya).toLocaleString('id-ID', { maximumFractionDigits: 0 });
                                                        else if (asset.luas && asset.luas !== '-') {
                                                            let s = String(asset.luas).replace(/m2|m²|\s/gi, '').replace(/\./g, '').replace(',', '.');
                                                            displayLuas = (parseFloat(s) || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 });
                                                        }

                                                        return (
                                                            <tr key={asset.id || idx} onClick={(e) => openModal(e, asset)} style={{ cursor: 'pointer', transition: 'all 0.1s' }} className="hover:bg-slate-50">
                                                                <td style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
                                                                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '13px' }}>{asset.name || '-'}</div>
                                                                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{asset.code || asset.kode_asset || '-'}</div>
                                                                </td>
                                                                <td style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
                                                                    <div style={{ fontWeight: '600', color: '#0369a1', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>{asset.occupant_name ? `👤 ${asset.occupant_name}` : '-'}</div>
                                                                    {(asset.occupant_rank || asset.occupant_nrp) && <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', marginLeft: '22px' }}>{asset.occupant_rank || '-'} / {asset.occupant_nrp || '-'}</div>}
                                                                </td>
                                                                <td style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}><div style={{ fontSize: '12px', color: '#334155', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{asset.location || '-'}</div></td>
                                                                <td style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}><span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '20px', background: asset.status === 'Aktif' || asset.status === 'Terisi' ? '#dcfce7' : '#fef3c7', color: asset.status === 'Aktif' || asset.status === 'Terisi' ? '#166534' : '#b45309', fontSize: '10px', fontWeight: '700' }}>{asset.status || '-'}</span></td>
                                                                <td style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}><div style={{ fontWeight: '600', color: '#1e293b', fontSize: '13px', fontFamily: 'monospace' }}>{displayLuas}</div></td>
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            );
                        });
                    })()
                ) : (
                    (() => {
                        const groupedData = dataArray.reduce((acc, asset) => {
                            const area = asset.area || 'Tidak Ditentukan';
                            if (!acc[area]) acc[area] = [];
                            acc[area].push(asset);
                            return acc;
                        }, {});
                        const sortedAreas = Object.keys(groupedData).sort();

                        return sortedAreas.map((area, areaIndex) => (
                            <div key={area} style={{ marginBottom: '32px' }}>
                                <div style={{ background: 'linear-gradient(135deg, #011F5B 0%, #023E8A 100%)', padding: '18px 28px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 16px rgba(1, 31, 91, 0.25)', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <h3 style={{ color: 'white', fontSize: '17px', fontWeight: '700', margin: 0, marginBottom: '6px', letterSpacing: '0.3px' }}>📍 {area}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', margin: 0, fontWeight: '500' }}>{groupedData[area].length} aset terdaftar</p>
                                            <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.3)' }}></div>
                                            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', margin: 0, fontWeight: '500' }}>{groupedData[area].filter(i => i.status === 'Aktif' || i.status === 'Terisi').length} Terisi</p>
                                        </div>
                                    </div>
                                </div>

                                <div id={`table-area-${areaIndex}`} className="card" style={{ marginTop: 0, borderRadius: '0 0 12px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', display: 'block' }}>
                                    <div className="table-container">
                                        <table className="table table-compact" style={{ fontSize: '0.85rem' }}>
                                            <thead>
                                                <tr style={{ fontSize: '0.85rem', background: '#f8fafc' }}>
                                                    {(type === 'bangunan' || type === 'rumneg-lagoa') ? (
                                                        <>
                                                            {isSelectionMode && (
                                                                <th style={{ width: '40px', textAlign: 'center' }}>
                                                                    <input type="checkbox" onChange={(e) => {
                                                                        const areaIds = groupedData[area].map(a => a.id);
                                                                        if (e.target.checked) setSelectedIds(prev => [...new Set([...prev, ...areaIds])]);
                                                                        else setSelectedIds(prev => prev.filter(id => !areaIds.includes(id)));
                                                                    }} checked={groupedData[area].every(a => selectedIds.includes(a.id))} />
                                                                </th>
                                                            )}
                                                            <th style={{ width: '200px', fontSize: '0.7rem', fontWeight: '700' }}>NAMA<br />PANGKAT/KORPS<br />NRP/NIP</th>
                                                            <th style={{ width: '150px', fontSize: '0.7rem', fontWeight: '700' }}>PERUMAHAN</th>
                                                            <th style={{ width: '150px', fontSize: '0.7rem', fontWeight: '700' }}>ALAMAT</th>
                                                            <th style={{ width: '100px', fontSize: '0.7rem', fontWeight: '700' }}>STATUS PENGHUNI</th>
                                                            <th style={{ width: '120px', fontSize: '0.7rem', fontWeight: '700' }}>NO SIP /<br />TANGGAL</th>
                                                            <th style={{ width: '60px', fontSize: '0.7rem', fontWeight: '700' }}>Tipe</th>
                                                            <th style={{ width: '50px', fontSize: '0.7rem', fontWeight: '700' }}>Gol</th>
                                                            <th style={{ width: '60px', fontSize: '0.7rem', fontWeight: '700' }}>TAHUN BUAT</th>
                                                            <th style={{ width: '100px', fontSize: '0.7rem', fontWeight: '700' }}>ASAL PEROLEHAN</th>
                                                            <th style={{ width: '80px', fontSize: '0.7rem', fontWeight: '700' }}>MENDAPAT FASDIN</th>
                                                            <th style={{ width: '80px', fontSize: '0.7rem', fontWeight: '700' }}>KONDISI</th>
                                                            <th style={{ width: '100px', fontSize: '0.7rem', fontWeight: '700' }}>KETERANGAN</th>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <th style={{ width: '30%' }}>Nama Bangunan</th>
                                                            <th style={{ width: '50%' }}>Alamat</th>
                                                            <th style={{ width: '20%', textAlign: 'right' }}>Luas</th>
                                                        </>
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {groupedData[area].map((asset, idx) => {
                                                    let displayLuas = '-';
                                                    if (asset.luas_tanah_seluruhnya && parseFloat(asset.luas_tanah_seluruhnya) > 0) displayLuas = parseFloat(asset.luas_tanah_seluruhnya).toLocaleString('id-ID', { maximumFractionDigits: 0 });
                                                    else if (asset.luas && asset.luas !== '-') {
                                                        let s = String(asset.luas).replace(/m2|m²|\s/gi, '').replace(/\./g, '').replace(',', '.');
                                                        displayLuas = (parseFloat(s) || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 });
                                                    }

                                                    if (type === 'bangunan' || type === 'rumneg-lagoa') {
                                                        return (
                                                            <tr key={asset.id || idx} onClick={(e) => openModal(e, asset)} style={{ cursor: 'pointer', fontSize: '0.75rem' }} className="hover:bg-gray-50 transition-colors">
                                                                {isSelectionMode && (
                                                                    <td style={{ textAlign: 'center', padding: '8px', verticalAlign: 'top' }} onClick={(e) => e.stopPropagation()}>
                                                                        <input type="checkbox" checked={selectedIds.includes(asset.id)} onChange={(e) => {
                                                                            if (e.target.checked) setSelectedIds(prev => [...prev, asset.id]);
                                                                            else setSelectedIds(prev => prev.filter(id => id !== asset.id));
                                                                        }} />
                                                                    </td>
                                                                )}
                                                                <td style={{ padding: '8px', verticalAlign: 'top' }}>
                                                                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{asset.occupant_name || '-'}</div>
                                                                    <div style={{ fontSize: '10px', color: '#64748b' }}>{asset.occupant_rank || ''} {asset.occupant_nrp ? `/ ${asset.occupant_nrp}` : ''}</div>
                                                                </td>
                                                                <td style={{ padding: '8px', verticalAlign: 'top', fontWeight: '600', color: '#334155' }}>
                                                                    {asset.area || '-'}
                                                                </td>
                                                                <td style={{ padding: '8px', verticalAlign: 'top' }}>{asset.location || asset.alamat_detail || '-'}</td>
                                                                <td style={{ padding: '8px', verticalAlign: 'top' }}>{asset.status_penghuni || '-'}</td>
                                                                <td style={{ padding: '8px', verticalAlign: 'top' }}>
                                                                    <div style={{ fontWeight: '500' }}>{asset.no_sip || '-'}</div>
                                                                    <div style={{ fontSize: '10px', color: '#64748b' }}>{asset.tgl_sip || ''}</div>
                                                                </td>
                                                                <td style={{ padding: '8px', verticalAlign: 'top' }}>{asset.tipe_rumah || '-'}</td>
                                                                <td style={{ padding: '8px', verticalAlign: 'top' }}>{asset.golongan || '-'}</td>
                                                                <td style={{ padding: '8px', verticalAlign: 'top' }}>{asset.tahun_buat || '-'}</td>
                                                                <td style={{ padding: '8px', verticalAlign: 'top' }}>{asset.asal_perolehan || '-'}</td>
                                                                <td style={{ padding: '8px', verticalAlign: 'top' }}>{asset.mendapat_fasdin || '-'}</td>
                                                                <td style={{ padding: '8px', verticalAlign: 'top' }}>
                                                                    <div style={{ fontWeight: '500', color: asset.kondisi === 'Baik' ? 'green' : (asset.kondisi === 'Rusak Berat' ? 'red' : 'orange') }}>{asset.kondisi || '-'}</div>
                                                                </td>
                                                                <td style={{ padding: '8px', verticalAlign: 'top' }}>{asset.keterangan || asset.map_boundary || '-'}</td>
                                                            </tr>
                                                        );
                                                    }

                                                    return (
                                                        <tr key={asset.id} onClick={(e) => openModal(e, asset)} style={{ cursor: 'pointer', fontSize: '0.85rem' }} className="hover:bg-gray-50 transition-colors">
                                                            <td style={{ verticalAlign: 'top', padding: '12px' }}>
                                                                <div style={{ fontWeight: '500', color: '#1a1a1a', marginBottom: '4px' }}>{asset.name || '-'}</div>
                                                                {asset.category && asset.category !== '-' && asset.category !== 'Tidak Ditentukan' && <div style={{ fontSize: '0.75rem', color: '#666' }}>{asset.category}</div>}
                                                            </td>
                                                            <td style={{ verticalAlign: 'top', padding: '12px' }}><div style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.4', color: '#444' }}>{asset.location || '-'}</div></td>
                                                            <td style={{ verticalAlign: 'top', padding: '12px', textAlign: 'right', fontWeight: '500' }}>{displayLuas} <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 'normal' }}>m²</span></td>
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
                                        {(type === 'bangunan' || type === 'rumneg-lagoa') && (
                                            <div style={{ display: 'grid', gap: '18px' }}>
                                                {/* DETAIL RUMAH NEGARA (Sesuai Tabel Import) */}
                                                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
                                                    <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#011F5B', marginBottom: '16px', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                                                        DETAIL RUMAH NEGARA
                                                    </h3>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                                                        {/* NO (Auto Generated, Not Editable usually, but hidden here) */}

                                                        {/* NAMA PENHUNI */}
                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Nama Penghuni</label>
                                                            <input type="text" value={selectedAsset.occupant_name || ''} onChange={e => setSelectedAsset({ ...selectedAsset, occupant_name: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                                                        </div>

                                                        {/* PANGKAT/KORPS */}
                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Pangkat/Korps</label>
                                                            <input type="text" value={selectedAsset.occupant_rank || ''} onChange={e => setSelectedAsset({ ...selectedAsset, occupant_rank: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                                                        </div>

                                                        {/* NRP/NIP */}
                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>NRP/NIP</label>
                                                            <input type="text" value={selectedAsset.occupant_nrp || ''} onChange={e => setSelectedAsset({ ...selectedAsset, occupant_nrp: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                                                        </div>

                                                        {/* ALAMAT */}
                                                        <div style={{ gridColumn: 'span 2' }}>
                                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Alamat</label>
                                                            <input type="text" value={selectedAsset.location || ''} onChange={e => setSelectedAsset({ ...selectedAsset, location: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                                                        </div>

                                                        {/* STATUS PENGHUNI */}
                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Status Penghuni</label>
                                                            <input type="text" value={selectedAsset.status_penghuni || ''} onChange={e => setSelectedAsset({ ...selectedAsset, status_penghuni: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                                                        </div>

                                                        {/* NO SIP */}
                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>No SIP</label>
                                                            <input type="text" value={selectedAsset.no_sip || ''} onChange={e => setSelectedAsset({ ...selectedAsset, no_sip: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                                                        </div>

                                                        {/* TANGGAL SIP */}
                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Tanggal SIP</label>
                                                            <input type="text" placeholder="dd-MMM-yy" value={selectedAsset.tgl_sip || ''} onChange={e => setSelectedAsset({ ...selectedAsset, tgl_sip: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                                                        </div>

                                                        {/* TIPE */}
                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Tipe</label>
                                                            <input type="text" value={selectedAsset.tipe_rumah || ''} onChange={e => setSelectedAsset({ ...selectedAsset, tipe_rumah: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                                                        </div>

                                                        {/* GOL */}
                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Golongan</label>
                                                            <input type="text" value={selectedAsset.golongan || ''} onChange={e => setSelectedAsset({ ...selectedAsset, golongan: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                                                        </div>

                                                        {/* TAHUN BUAT */}
                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Tahun Buat</label>
                                                            <input type="number" value={selectedAsset.tahun_buat || ''} onChange={e => setSelectedAsset({ ...selectedAsset, tahun_buat: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                                                        </div>

                                                        {/* ASAL PEROLEHAN */}
                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Asal Perolehan</label>
                                                            <input type="text" value={selectedAsset.asal_perolehan || ''} onChange={e => setSelectedAsset({ ...selectedAsset, asal_perolehan: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                                                        </div>

                                                        {/* MENDAPAT FASDIN */}
                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Mendapat Fasdin</label>
                                                            <input type="text" value={selectedAsset.mendapat_fasdin || ''} onChange={e => setSelectedAsset({ ...selectedAsset, mendapat_fasdin: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                                                        </div>

                                                        {/* KONDISI */}
                                                        <div>
                                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Kondisi</label>
                                                            <select value={selectedAsset.kondisi || 'Baik'} onChange={e => setSelectedAsset({ ...selectedAsset, kondisi: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                                                                <option value="Baik">Baik</option>
                                                                <option value="Rusak Ringan">Rusak Ringan</option>
                                                                <option value="Rusak Berat">Rusak Berat</option>
                                                            </select>
                                                        </div>

                                                        {/* KETERANGAN */}
                                                        <div style={{ gridColumn: '1 / -1' }}>
                                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Keterangan</label>
                                                            <textarea value={selectedAsset.keterangan || selectedAsset.map_boundary || ''} onChange={e => setSelectedAsset({ ...selectedAsset, keterangan: e.target.value, map_boundary: e.target.value })} rows="3" style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }}></textarea>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {(type === 'tanah' || type === 'kapling') && (
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
                                        )}

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
                                        {/* DETAIL READ ONLY MODE (MATCHING EDIT MODE) */}
                                        {(type === 'bangunan' || type === 'rumneg-lagoa') && (
                                            <div style={{ display: 'grid', gap: '16px' }}>
                                                {/* Card Data Penghuni & SIP */}
                                                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
                                                    <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#011F5B', marginBottom: '16px', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                                                        DATA PENGHUNI & SIP
                                                    </h3>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                                                        <div>
                                                            <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Nama Penghuni</div>
                                                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{selectedAsset.occupant_name || '-'}</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Pangkat/Korps</div>
                                                            <div style={{ fontSize: '13px', color: '#1e293b' }}>{selectedAsset.occupant_rank || '-'}</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>NRP/NIP</div>
                                                            <div style={{ fontSize: '13px', color: '#1e293b' }}>{selectedAsset.occupant_nrp || '-'}</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Status Penghuni</div>
                                                            <div style={{ fontSize: '13px', color: '#1e293b' }}>{selectedAsset.status_penghuni || '-'}</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>No SIP</div>
                                                            <div style={{ fontSize: '13px', color: '#011F5B', fontWeight: '500' }}>{selectedAsset.no_sip || '-'}</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Tanggal SIP</div>
                                                            <div style={{ fontSize: '13px', color: '#1e293b' }}>{selectedAsset.tgl_sip || '-'}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Card Detail Bangunan */}
                                                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
                                                    <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#011F5B', marginBottom: '16px', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                                                        DETAIL BANGUNAN
                                                    </h3>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                                                        <div>
                                                            <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Area</div>
                                                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{selectedAsset.area || '-'}</div>
                                                        </div>
                                                        <div style={{ gridColumn: 'span 2' }}>
                                                            <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Alamat</div>
                                                            <div style={{ fontSize: '13px', color: '#1e293b' }}>{selectedAsset.location || '-'}</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Tipe Rumah</div>
                                                            <div style={{ fontSize: '13px', color: '#1e293b' }}>{selectedAsset.tipe_rumah || '-'}</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Golongan</div>
                                                            <div style={{ fontSize: '13px', color: '#1e293b' }}>{selectedAsset.golongan || '-'}</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Tahun Buat</div>
                                                            <div style={{ fontSize: '13px', color: '#1e293b' }}>{selectedAsset.tahun_buat || '-'}</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Asal Perolehan</div>
                                                            <div style={{ fontSize: '13px', color: '#1e293b' }}>{selectedAsset.asal_perolehan || '-'}</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Mendapat Fasdin</div>
                                                            <div style={{ fontSize: '13px', color: '#1e293b' }}>{selectedAsset.mendapat_fasdin || '-'}</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Kondisi</div>
                                                            <div style={{ fontSize: '13px', fontWeight: '600', color: selectedAsset.kondisi === 'Baik' ? 'green' : (selectedAsset.kondisi === 'Rusak Berat' ? 'red' : 'orange') }}>{selectedAsset.kondisi || '-'}</div>
                                                        </div>
                                                        <div style={{ gridColumn: '1 / -1' }}>
                                                            <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Keterangan</div>
                                                            <div style={{ fontSize: '13px', color: '#444', fontStyle: 'italic', background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>{selectedAsset.keterangan || selectedAsset.map_boundary || '-'}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            {
                                !isEditing && (
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
                                )
                            }
                        </div >
                    </div >
                )
                }
            </div >
        </ErrorBoundary >
    )
}

Faslan.propTypes = {
    type: PropTypes.string.isRequired
}

export default Faslan
