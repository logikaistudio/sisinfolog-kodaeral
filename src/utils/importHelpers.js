import * as XLSX from 'xlsx';

/**
 * Generate and download template Excel for Master Asset BMN import
 */
export const downloadTemplate = () => {
    // Define headers sesuai struktur BMN
    const headers = [
        'Jenis BMN',
        'Kode Asset',
        'NUP',
        'Nama Asset',
        'No Sertifikat',
        'Kondisi',
        'Tanggal Perolehan',
        'Nilai Perolehan',
        'Luas Tanah (m2)',
        'No. PSP',
        'Tanggal PSP',
        'Alamat',
        'RT/RW',
        'Desa/Kelurahan',
        'Kecamatan',
        'Kota/Kabupaten',
        'Kode Kota/Kabupaten',
        'Provinsi',
        'Keterangan'
    ];

    // Sample data BMN
    const sampleData = [
        [
            'Tanah',
            'BMN-TN-001',
            '12345678901234567890123',
            'Tanah Kantor Pusat Kodaeral 3',
            'SHM-001/2020',
            'Baik',
            '2020-01-15',
            '5000000000',
            '1500',
            'PSP-001/2020',
            '2020-02-01',
            'Jl. Gunung Sahari No. 67',
            '005/008',
            'Gunung Sahari Selatan',
            'Kemayoran',
            'Jakarta Pusat',
            '3171',
            'DKI Jakarta',
            'Tanah untuk kantor pusat'
        ],
        [
            'Bangunan',
            'BMN-BG-001',
            '98765432109876543210987',
            'Gedung Perkantoran Kodaeral 3',
            'IMB-002/2020',
            'Baik',
            '2020-06-20',
            '15000000000',
            '800',
            'PSP-002/2020',
            '2020-07-01',
            'Jl. Gunung Sahari No. 67',
            '005/008',
            'Gunung Sahari Selatan',
            'Kemayoran',
            'Jakarta Pusat',
            '3171',
            'DKI Jakarta',
            'Gedung kantor 3 lantai'
        ],
        [
            'Tanah',
            'BMN-TN-002',
            '11122233344455566677788',
            'Tanah Gudang Logistik',
            'SHM-003/2019',
            'Baik',
            '2019-03-10',
            '3000000000',
            '2000',
            'PSP-003/2019',
            '2019-04-01',
            'Jl. Tanjung Priok No. 123',
            '010/005',
            'Tanjung Priok',
            'Tanjung Priok',
            'Jakarta Utara',
            '3172',
            'DKI Jakarta',
            'Tanah untuk gudang penyimpanan'
        ]
    ];

    // Create worksheet data (headers + sample data)
    const wsData = [headers, ...sampleData];

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws['!cols'] = [
        { wch: 12 },  // Jenis BMN
        { wch: 15 },  // Kode Asset
        { wch: 25 },  // NUP
        { wch: 30 },  // Nama Asset
        { wch: 18 },  // No Sertifikat
        { wch: 10 },  // Kondisi
        { wch: 15 },  // Tanggal Perolehan
        { wch: 15 },  // Nilai Perolehan
        { wch: 15 },  // Luas Tanah
        { wch: 15 },  // No. PSP
        { wch: 15 },  // Tanggal PSP
        { wch: 35 },  // Alamat
        { wch: 10 },  // RT/RW
        { wch: 20 },  // Desa/Kelurahan
        { wch: 15 },  // Kecamatan
        { wch: 18 },  // Kota/Kabupaten
        { wch: 12 },  // Kode Kota/Kabupaten
        { wch: 15 },  // Provinsi
        { wch: 30 }   // Keterangan
    ];

    // Style header row (bold)
    const headerRange = XLSX.utils.decode_range(ws['!ref']);
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cellAddress]) continue;
        ws[cellAddress].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "D9E1F2" } },
            alignment: { horizontal: "center", vertical: "center" }
        };
    }

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Master Asset BMN");

    // Add instruction sheet
    const instructionData = [
        ['PANDUAN IMPORT MASTER ASSET BMN (BARANG MILIK NEGARA)'],
        [''],
        ['Format Kolom:'],
        ['Jenis BMN', 'WAJIB - Jenis BMN (Tanah/Bangunan/Peralatan/dll)'],
        ['Kode Asset', 'WAJIB - Kode unik asset (digunakan untuk identifikasi update/insert)'],
        ['NUP', 'WAJIB - Nomor Urut Pendaftaran (23 digit)'],
        ['Nama Asset', 'WAJIB - Nama lengkap asset'],
        ['No Sertifikat', 'Opsional - Nomor sertifikat (SHM/SHGB/IMB/dll)'],
        ['Kondisi', 'Opsional - Kondisi asset (Baik/Rusak Ringan/Rusak Berat)'],
        ['Tanggal Perolehan', 'Opsional - Format: YYYY-MM-DD (contoh: 2020-01-15)'],
        ['Nilai Perolehan', 'Opsional - Nilai dalam Rupiah (angka tanpa titik/koma)'],
        ['Luas Tanah (m2)', 'Opsional - Luas dalam meter persegi (angka)'],
        ['No. PSP', 'Opsional - Nomor Penetapan Status Penggunaan'],
        ['Tanggal PSP', 'Opsional - Format: YYYY-MM-DD'],
        ['Alamat', 'Opsional - Alamat lengkap lokasi asset'],
        ['RT/RW', 'Opsional - Format: 001/002'],
        ['Desa/Kelurahan', 'Opsional - Nama desa atau kelurahan'],
        ['Kecamatan', 'Opsional - Nama kecamatan'],
        ['Kota/Kabupaten', 'Opsional - Nama kota atau kabupaten'],
        ['Kode Kota/Kabupaten', 'Opsional - Kode wilayah (4 digit)'],
        ['Provinsi', 'Opsional - Nama provinsi'],
        ['Keterangan', 'Opsional - Catatan tambahan'],
        [''],
        ['Mode Import:'],
        ['1. Tambah & Update Otomatis (Upsert)', 'Data baru ditambah, existing diupdate berdasarkan Kode Asset'],
        ['2. Hanya Tambah Data Baru', 'Hanya insert, error jika Kode Asset sudah ada'],
        ['3. Hanya Update Existing', 'Hanya update, skip jika Kode Asset tidak ada'],
        [''],
        ['Tips Penting:'],
        ['✓ Pastikan Kode Asset, NUP, dan Nama Asset selalu terisi'],
        ['✓ NUP harus 23 digit angka'],
        ['✓ Tanggal gunakan format YYYY-MM-DD (contoh: 2020-01-15)'],
        ['✓ Nilai Perolehan gunakan angka tanpa titik/koma (contoh: 5000000000)'],
        ['✓ Luas Tanah gunakan angka desimal jika perlu (contoh: 1500.5)'],
        ['✓ Gunakan Preview untuk validasi sebelum import'],
        ['✓ Backup data sebelum import besar'],
        [''],
        ['Contoh Jenis BMN:'],
        ['- Tanah', '- Bangunan', '- Peralatan dan Mesin', '- Jalan, Irigasi, dan Jaringan'],
        ['- Aset Tetap Lainnya', '- Konstruksi Dalam Pengerjaan']
    ];

    const wsInstruction = XLSX.utils.aoa_to_sheet(instructionData);
    wsInstruction['!cols'] = [{ wch: 30 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, wsInstruction, "Panduan");

    // Download file
    XLSX.writeFile(wb, `Template_Master_Asset_BMN_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Validate imported BMN data - More lenient validation
 * @param {Array} data - Array of asset objects
 * @returns {Object} - Validation result with valid data and errors
 */
export const validateImportData = (data) => {
    const validData = [];
    const errors = [];

    data.forEach((asset, index) => {
        const rowNumber = index + 1;
        const rowErrors = [];

        // Only require a code field - all other fields are optional
        if (!asset.code || String(asset.code).trim() === '') {
            rowErrors.push('Kode (code) wajib diisi');
        }

        // WARNING: Suspicious Kode Barang (likely mismatched with City Code)
        if (asset.kode_barang && /^\d{4}$/.test(String(asset.kode_barang).trim())) {
            rowErrors.push('⚠️ Perhatian: Kode Barang hanya 4 digit (mirip Kode Kota). Mohon cek mapping.');
        }

        if (rowErrors.length > 0) {
            errors.push({
                row: rowNumber,
                code: asset.code || 'N/A',
                errors: rowErrors
            });
        } else {
            validData.push(asset);
        }
    });

    return {
        validData,
        errors,
        isValid: errors.length === 0,
        summary: {
            total: data.length,
            valid: validData.length,
            invalid: errors.length
        }
    };
};

/**
 * Flexible Column Mapping - Accepts ANY Excel header format
 * Maps Excel column headers to database fields using fuzzy matching
 * 
 * The function normalizes headers by:
 * 1. Converting to lowercase
 * 2. Removing extra whitespace
 * 3. Matching against known patterns
 */
export const COLUMN_MAPPING = {
    // === KODE / CODE ===
    'kode barang': 'kode_barang',
    'kode brg': 'kode_barang',
    'kode asset': 'kode_barang',
    'kode aset': 'kode_barang',
    'kode': 'kode_barang',
    'code': 'kode_barang',
    'asset code': 'kode_barang',

    // === NUP ===
    'nup': 'nup',
    'no nup': 'nup',
    'no. nup': 'nup',
    'nomor urut pendaftaran': 'nup',

    // === NAMA / NAME ===
    'nama barang': 'nama_barang',
    'nama brg': 'nama_barang',
    'nama asset': 'nama_barang',
    'nama aset': 'nama_barang',
    'nama': 'nama_barang',
    'uraian': 'nama_barang',
    'uraian barang': 'nama_barang',
    'deskripsi': 'nama_barang',
    'description': 'nama_barang',
    'name': 'nama_barang',

    // === JENIS BMN ===
    'jenis bmn': 'jenis_bmn',
    'jenis aset': 'jenis_bmn',
    'jenis asset': 'jenis_bmn',
    'jenis': 'jenis_bmn',
    'tipe': 'jenis_bmn',
    'type': 'jenis_bmn',
    'kategori': 'jenis_bmn',
    'category': 'jenis_bmn',

    // === KONDISI ===
    'kondisi': 'kondisi',
    'keadaan': 'kondisi',
    'condition': 'kondisi',
    'status kondisi': 'kondisi',

    // === LUAS TANAH ===
    'luas tanah seluruhnya': 'luas_tanah_seluruhnya',
    'luas tanah (m2)': 'luas_tanah_seluruhnya',
    'luas tanah': 'luas_tanah_seluruhnya',
    'luas (m2)': 'luas_tanah_seluruhnya',
    'luas m2': 'luas_tanah_seluruhnya',
    'luas': 'luas_tanah_seluruhnya',
    'area': 'luas_tanah_seluruhnya',
    'ukuran': 'luas_tanah_seluruhnya',

    // === TANAH BERSERTIFIKAT ===
    'tanah yg telah bersertifikat': 'tanah_yg_telah_bersertifikat',
    'tanah bersertifikat': 'tanah_yg_telah_bersertifikat',
    'luas sertifikat': 'tanah_yg_telah_bersertifikat',

    // === TANAH BELUM BERSERTIFIKAT ===
    'tanah yg belum bersertifikat': 'tanah_yg_belum_bersertifikat',
    'tanah belum sertifikat': 'tanah_yg_belum_bersertifikat',

    // === NILAI / VALUE ===
    'nilai perolehan': 'nilai_perolehan',
    'nilai': 'nilai_perolehan',
    'harga': 'nilai_perolehan',
    'harga perolehan': 'nilai_perolehan',
    'value': 'nilai_perolehan',
    'price': 'nilai_perolehan',
    'nilai buku': 'nilai_perolehan',

    // === TANGGAL PEROLEHAN ===
    'tanggal perolehan': 'tanggal_perolehan',
    'tgl perolehan': 'tanggal_perolehan',
    'tanggal beli': 'tanggal_perolehan',
    'tgl beli': 'tanggal_perolehan',
    'date': 'tanggal_perolehan',
    'acquisition date': 'tanggal_perolehan',

    // === SERTIFIKAT ===
    'no sertifikat': 'no_sertifikat',
    'no. sertifikat': 'no_sertifikat',
    'nomor sertifikat': 'no_sertifikat',
    'sertifikat': 'no_sertifikat',
    'no shm': 'no_sertifikat',
    'no. shm': 'no_sertifikat',

    // === TANGGAL SERTIFIKAT ===
    'tgl sertifikat': 'tgl_sertifikat',
    'tanggal sertifikat': 'tgl_sertifikat',

    // === ALAMAT ===
    'alamat': 'alamat_detail',
    'alamat detail': 'alamat_detail',
    'alamat lengkap': 'alamat_detail',
    'address': 'alamat_detail',
    'lokasi': 'alamat_detail',
    'location': 'alamat_detail',

    // === KECAMATAN ===
    'kecamatan': 'kecamatan',
    'kec': 'kecamatan',
    'kec.': 'kecamatan',
    'district': 'kecamatan',

    // === KABUPATEN ===
    'kabupaten': 'kabupaten',
    'kab': 'kabupaten',
    'kab.': 'kabupaten',
    'kota': 'kabupaten',
    'kota/kabupaten': 'kabupaten',
    'kab/kota': 'kabupaten',
    'city': 'kabupaten',
    'regency': 'kabupaten',

    // === PROVINSI ===
    'provinsi': 'provinsi',
    'prov': 'provinsi',
    'prov.': 'provinsi',
    'province': 'provinsi',

    // === KETERANGAN ===
    'keterangan': 'keterangan_bmn',
    'keterangan bmn': 'keterangan_bmn',
    'catatan': 'keterangan_bmn',
    'notes': 'keterangan_bmn',
    'remark': 'keterangan_bmn',
    'remarks': 'keterangan_bmn',

    // === STANDAR SATUAN ===
    'standar satuan': 'standar_satuan',
    'satuan': 'standar_satuan',
    'unit': 'standar_satuan',

    // === STATUS ===
    'status': 'status',
    'status penggunaan': 'status',
    'status bmn': 'status',
    // === KODE KOTA ===
    'kode kota': 'kode_kota',
    'kode kab': 'kode_kota',
    'kode kabupaten': 'kode_kota',
    'kode kota/kabupaten': 'kode_kota',
    'kode kab/kota': 'kode_kota',
    'kode wilayah': 'kode_kota',
};

/**
 * Smart column mapping function that matches Excel headers to database fields
 * Uses fuzzy matching to handle variations in column names
 */
export const mapColumnToField = (header) => {
    if (!header) return null;

    // Normalize the header: lowercase, trim, remove extra spaces
    const normalized = String(header).toLowerCase().trim().replace(/\s+/g, ' ');

    // Direct match first
    if (COLUMN_MAPPING[normalized]) {
        return COLUMN_MAPPING[normalized];
    }

    // SAFETY CHECK: BLACKLIST
    // If header contains 'kota', 'kab', or 'wilayah', it MUST NOT be mapped to 'kode_barang'
    const isCityRelated = /kota|kab|wilayah/i.test(normalized);

    // 3. Try partial matching for common patterns
    const patterns = [
        // === KODE KOTA (PRIORITY) ===
        // Must come before generic 'kode' patterns
        { pattern: /kode\s+(kota|kab|wilayah)/i, field: 'kode_kota' },
        { pattern: /kd\s+(kota|kab)/i, field: 'kode_kota' },

        // === KODE BARANG ===
        // Strict patterns to avoid matching "Kode Kota" or others
        // { pattern: /^kode$/i, field: 'kode_barang' }, // REMOVED: Too ambiguous. Matches "Kode" which might be City Code.
        { pattern: /^kode\s+(barang|brg|asset|aset|bmn)$/i, field: 'kode_barang' }, // Specific
        { pattern: /^code(\s+asset)?$/i, field: 'kode_barang' },

        // === NAMA ===
        { pattern: /nama\s*(barang|brg|asset|aset)/i, field: 'nama_barang' },
        { pattern: /uraian/i, field: 'nama_barang' },
        { pattern: /nup/i, field: 'nup' },

        { pattern: /jenis\s*(bmn|aset|asset)?/i, field: 'jenis_bmn' },
        { pattern: /kondisi/i, field: 'kondisi' },
        { pattern: /luas\s*(tanah)?(\s*seluruhnya)?/i, field: 'luas_tanah_seluruhnya' },
        { pattern: /nilai\s*(perolehan)?/i, field: 'nilai_perolehan' },
        { pattern: /harga/i, field: 'nilai_perolehan' },
        { pattern: /tanggal\s*perolehan/i, field: 'tanggal_perolehan' },
        { pattern: /tgl\s*perolehan/i, field: 'tanggal_perolehan' },
        { pattern: /sertifikat/i, field: 'no_sertifikat' },
        { pattern: /alamat/i, field: 'alamat_detail' },
        { pattern: /lokasi/i, field: 'alamat_detail' },
        { pattern: /kecamatan/i, field: 'kecamatan' },

        // Kabupaten/Kota (TEXT name, not code)
        // Ensure this doesn't capture "Kode Kota" (already handled above)
        { pattern: /^(kota|kabupaten|kab|city|regency)$/i, field: 'kabupaten' },
        { pattern: /^(kota\/kabupaten|kab\/kota)$/i, field: 'kabupaten' },

        { pattern: /provinsi/i, field: 'provinsi' },
        { pattern: /keterangan/i, field: 'keterangan_bmn' },
        { pattern: /catatan/i, field: 'keterangan_bmn' },
        { pattern: /status/i, field: 'status' },
        { pattern: /satuan/i, field: 'standar_satuan' },
        { pattern: /tanah.*(bersertifikat|sertifikat)/i, field: 'tanah_yg_telah_bersertifikat' },
        { pattern: /tanah.*belum/i, field: 'tanah_yg_belum_bersertifikat' },
    ];

    for (const { pattern, field } of patterns) {
        if (pattern.test(normalized)) {
            // BLACKLIST Enforcement
            // If header is city-related, it CANNOT be mapped to kode_barang
            if (field === 'kode_barang' && isCityRelated) {
                continue;
            }
            return field;
        }
    }

    // If no match found, store it as an extra field with cleaned name
    // This allows accepting ANY column from the source
    const cleanedName = normalized.replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
    return `extra_${cleanedName}`;
};
