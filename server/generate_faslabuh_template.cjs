const XLSX = require('xlsx');
const path = require('path');

// Define column headers matching the database structure
const headers = [
    // A-C: Informasi Lokasi
    'Lantamal',
    'Lanal/Faslan',
    'Lokasi Dermaga',

    // D-E: Identifikasi Dermaga
    'Nama Dermaga',
    'Jenis Dermaga',

    // F-K: Spesifikasi Teknis
    'Panjang (m)',
    'Lebar (m)',
    'Kedalaman (m)',
    'Luas (m²)',
    'Konstruksi',
    'Tahun Pembangunan',

    // L-O: Kapasitas
    'Kapasitas Kapal',
    'Tonase Max (ton)',
    'Jumlah Tambat',
    'Panjang Tambat (m)',

    // P-S: Kondisi Fisik
    'Kondisi Dermaga',
    'Kondisi Lantai',
    'Kondisi Dinding',
    'Kondisi Fender',

    // T-W: Fasilitas Pendukung
    'Bollard (unit)',
    'Fender (unit)',
    'Tangga Kapal (unit)',
    'Lampu Dermaga (unit)',

    // X-AA: Utilitas (Ya/Tidak)
    'Air Bersih',
    'Listrik',
    'BBM',
    'Crane',

    // AB-AE: Dimensi Tambahan
    'Elevasi (m)',
    'Draft (m)',
    'Lebar Apron (m)',
    'Panjang Apron (m)',

    // AF-AH: Informasi Tambahan
    'Fungsi Dermaga',
    'Keterangan',
    'Status Operasional',

    // AI-AJ: Koordinat
    'Longitude',
    'Latitude'
];

// Sample data rows
const sampleData = [
    [
        'Lantamal III',
        'Lanal Jakarta',
        'Jl. Gunung Sahari, Jakarta Utara',
        'Dermaga Utama A',
        'Dermaga Umum',
        150.5,
        20.0,
        8.5,
        3010.0,
        'Beton Bertulang',
        2015,
        'Kapal Patroli, KRI',
        5000,
        4,
        35.0,
        'Baik',
        'Baik',
        'Baik',
        'Baik',
        12,
        24,
        4,
        16,
        'Ya',
        'Ya',
        'Ya',
        'Tidak',
        2.5,
        7.0,
        15.0,
        140.0,
        'Dermaga sandar kapal patroli dan KRI',
        'Dilengkapi fasilitas lengkap',
        'Aktif',
        106.8456,
        -6.1234
    ],
    [
        'Lantamal III',
        'Lanal Jakarta',
        'Jl. Gunung Sahari, Jakarta Utara',
        'Dermaga B',
        'Dermaga Khusus',
        80.0,
        15.0,
        6.0,
        1200.0,
        'Beton',
        2010,
        'Kapal Kecil',
        1000,
        2,
        20.0,
        'Rusak Ringan',
        'Baik',
        'Rusak Ringan',
        'Baik',
        8,
        16,
        2,
        8,
        'Ya',
        'Ya',
        'Tidak',
        'Tidak',
        2.0,
        5.0,
        10.0,
        70.0,
        'Dermaga untuk kapal kecil',
        'Perlu perbaikan dinding',
        'Dalam Perbaikan',
        106.8467,
        -6.1245
    ]
];

// Create workbook
const wb = XLSX.utils.book_new();

// Create worksheet with headers and sample data
const wsData = [headers, ...sampleData];
const ws = XLSX.utils.aoa_to_sheet(wsData);

// Set column widths
const colWidths = headers.map((h, idx) => {
    if (idx <= 2) return { wch: 20 }; // Lokasi columns
    if (idx <= 4) return { wch: 25 }; // Nama/Jenis
    if (idx <= 10) return { wch: 15 }; // Spesifikasi
    if (idx <= 14) return { wch: 18 }; // Kapasitas
    if (idx <= 18) return { wch: 18 }; // Kondisi
    if (idx <= 22) return { wch: 15 }; // Fasilitas
    if (idx <= 26) return { wch: 12 }; // Utilitas
    if (idx <= 30) return { wch: 15 }; // Dimensi
    if (idx <= 33) return { wch: 30 }; // Info tambahan
    return { wch: 12 }; // Koordinat
});
ws['!cols'] = colWidths;

// Add worksheet to workbook
XLSX.utils.book_append_sheet(wb, ws, 'Data Faslabuh');

// Create instructions sheet
const instructions = [
    ['TEMPLATE IMPORT DATA FASLABUH (DERMAGA)'],
    [''],
    ['PETUNJUK PENGGUNAAN:'],
    ['1. Isi data pada sheet "Data Faslabuh" mulai dari baris ke-2'],
    ['2. Jangan mengubah nama kolom (baris pertama)'],
    ['3. Pastikan format data sesuai dengan contoh yang diberikan'],
    ['4. Simpan file dalam format .xlsx'],
    ['5. Upload file melalui halaman Faslabuh di aplikasi'],
    [''],
    ['KETERANGAN KOLOM:'],
    [''],
    ['A. INFORMASI LOKASI'],
    ['   - Lantamal: Nama Lantamal (contoh: Lantamal III)'],
    ['   - Lanal/Faslan: Nama Lanal atau Faslan (contoh: Lanal Jakarta)'],
    ['   - Lokasi Dermaga: Alamat lengkap dermaga'],
    [''],
    ['B. IDENTIFIKASI DERMAGA'],
    ['   - Nama Dermaga: Nama dermaga (contoh: Dermaga Utama A)'],
    ['   - Jenis Dermaga: Jenis dermaga (Dermaga Umum/Dermaga Khusus/dll)'],
    [''],
    ['C. SPESIFIKASI TEKNIS'],
    ['   - Panjang (m): Panjang dermaga dalam meter'],
    ['   - Lebar (m): Lebar dermaga dalam meter'],
    ['   - Kedalaman (m): Kedalaman air di dermaga'],
    ['   - Luas (m²): Luas total dermaga'],
    ['   - Konstruksi: Jenis konstruksi (Beton/Beton Bertulang/Kayu/dll)'],
    ['   - Tahun Pembangunan: Tahun dermaga dibangun'],
    [''],
    ['D. KAPASITAS'],
    ['   - Kapasitas Kapal: Jenis kapal yang dapat ditampung'],
    ['   - Tonase Max (ton): Tonase maksimal kapal'],
    ['   - Jumlah Tambat: Jumlah titik tambat'],
    ['   - Panjang Tambat (m): Panjang area tambat'],
    [''],
    ['E. KONDISI FISIK'],
    ['   - Kondisi Dermaga: Baik/Rusak Ringan/Rusak Berat'],
    ['   - Kondisi Lantai: Baik/Rusak Ringan/Rusak Berat'],
    ['   - Kondisi Dinding: Baik/Rusak Ringan/Rusak Berat'],
    ['   - Kondisi Fender: Baik/Rusak Ringan/Rusak Berat'],
    [''],
    ['F. FASILITAS PENDUKUNG'],
    ['   - Bollard (unit): Jumlah bollard'],
    ['   - Fender (unit): Jumlah fender'],
    ['   - Tangga Kapal (unit): Jumlah tangga kapal'],
    ['   - Lampu Dermaga (unit): Jumlah lampu'],
    [''],
    ['G. UTILITAS (Isi dengan Ya/Tidak)'],
    ['   - Air Bersih: Tersedia air bersih?'],
    ['   - Listrik: Tersedia listrik?'],
    ['   - BBM: Tersedia BBM?'],
    ['   - Crane: Tersedia crane?'],
    [''],
    ['H. DIMENSI TAMBAHAN'],
    ['   - Elevasi (m): Elevasi dermaga'],
    ['   - Draft (m): Draft maksimal'],
    ['   - Lebar Apron (m): Lebar apron'],
    ['   - Panjang Apron (m): Panjang apron'],
    [''],
    ['I. INFORMASI TAMBAHAN'],
    ['   - Fungsi Dermaga: Fungsi/kegunaan dermaga'],
    ['   - Keterangan: Catatan tambahan'],
    ['   - Status Operasional: Aktif/Tidak Aktif/Dalam Perbaikan'],
    [''],
    ['J. KOORDINAT (untuk integrasi peta)'],
    ['   - Longitude: Koordinat longitude (contoh: 106.8456)'],
    ['   - Latitude: Koordinat latitude (contoh: -6.1234)'],
    [''],
    ['CATATAN PENTING:'],
    ['- Kolom yang wajib diisi: Nama Dermaga, Lokasi Dermaga, Kondisi Dermaga'],
    ['- Kolom numerik harus berisi angka (gunakan titik untuk desimal)'],
    ['- Kolom utilitas harus diisi Ya atau Tidak'],
    ['- Koordinat opsional, namun diperlukan untuk tampil di peta']
];

const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
wsInstructions['!cols'] = [{ wch: 80 }];
XLSX.utils.book_append_sheet(wb, wsInstructions, 'Petunjuk');

// Write file
const outputPath = path.join(__dirname, '..', 'Template_Import_Faslabuh.xlsx');
XLSX.writeFile(wb, outputPath);

console.log('✅ Template Excel berhasil dibuat!');
console.log(`📁 Lokasi file: ${outputPath}`);
console.log('');
console.log('📋 Template berisi:');
console.log('   - Sheet "Data Faslabuh": Template dengan 2 contoh data');
console.log('   - Sheet "Petunjuk": Panduan lengkap pengisian');
console.log('');
console.log('🎯 Kolom yang tersedia (37 kolom):');
console.log('   A-C:   Informasi Lokasi (3 kolom)');
console.log('   D-E:   Identifikasi Dermaga (2 kolom)');
console.log('   F-K:   Spesifikasi Teknis (6 kolom)');
console.log('   L-O:   Kapasitas (4 kolom)');
console.log('   P-S:   Kondisi Fisik (4 kolom)');
console.log('   T-W:   Fasilitas Pendukung (4 kolom)');
console.log('   X-AA:  Utilitas (4 kolom)');
console.log('   AB-AE: Dimensi Tambahan (4 kolom)');
console.log('   AF-AH: Informasi Tambahan (3 kolom)');
console.log('   AI-AJ: Koordinat (2 kolom)');
