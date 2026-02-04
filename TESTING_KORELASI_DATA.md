# Panduan Testing Korelasi Data Master Asset BMN

## 🎯 Tujuan Testing

Memastikan bahwa ketika membuka detail salah satu asset tanah, semua data terkait (sertifikat, kerjasama, bangunan, faslabuh) muncul dengan jelas dan menunjukkan status lengkap asset tersebut.

## 📋 Skenario Testing

### Skenario 1: Asset Tanah dengan Data Lengkap

#### **Data Master Asset BMN**
```json
{
    "jenis_bmn": "Tanah",
    "kode_asset": "BMN-TN-001",
    "nup": "12345678901234567890123",
    "nama_asset": "Tanah Kantor Pusat Kodaeral 3",
    "no_sertifikat": "SHM-001/2020",
    "kondisi": "Baik",
    "tanggal_perolehan": "2020-01-15",
    "nilai_perolehan": 5000000000,
    "luas_tanah": 1500,
    "no_psp": "PSP-001/2020",
    "tanggal_psp": "2020-02-01",
    "alamat": "Jl. Gunung Sahari No. 67",
    "rt_rw": "005/008",
    "desa_kelurahan": "Gunung Sahari Selatan",
    "kecamatan": "Kemayoran",
    "kota_kabupaten": "Jakarta Pusat",
    "kode_kota": "3171",
    "provinsi": "DKI Jakarta",
    "keterangan": "Tanah untuk kantor pusat"
}
```

#### **Data Relasi yang Harus Muncul:**

##### 1. **Sertifikat & Dokumen Legal**
```
✅ No. Sertifikat: SHM-001/2020
✅ No. PSP: PSP-001/2020
✅ Tanggal PSP: 01 Februari 2020
```

##### 2. **Lokasi Lengkap**
```
✅ Alamat: Jl. Gunung Sahari No. 67
✅ RT/RW: 005/008
✅ Desa/Kelurahan: Gunung Sahari Selatan
✅ Kecamatan: Kemayoran
✅ Kota/Kabupaten: Jakarta Pusat
✅ Kode Kota: 3171
✅ Provinsi: DKI Jakarta
```

##### 3. **Bangunan di Atas Tanah** (Faslan)
```json
{
    "kode_asset": "BMN-TN-001",
    "jenis_faslan": "Bangunan",
    "nama_bangunan": "Gedung Kantor 3 Lantai",
    "status_operasional": "Operasional",
    "tahun_pembuatan": 2020,
    "luas_bangunan": 800
}
```

##### 4. **Kerjasama Terkait Tanah**
```json
{
    "kode_asset": "BMN-TN-001",
    "jenis_kerjasama": "Sewa Sebagian",
    "mitra_nama": "PT. Kantin Sejahtera",
    "nomor_perjanjian": "KS-001/2024",
    "tanggal_mulai": "2024-01-01",
    "tanggal_selesai": "2025-12-31",
    "nilai_kerjasama": 50000000,
    "status": "Active"
}
```

##### 5. **Fasilitas Labuh (Jika Ada)**
```json
{
    "kode_asset": "BMN-TN-001",
    "jenis_faslan": "Dermaga",
    "nomor_lambung": "D-001",
    "status_operasional": "Operasional",
    "lokasi_penyimpanan": "Pantai Utara"
}
```

---

## 🧪 Langkah-Langkah Testing

### **Step 1: Setup Data Testing**

#### A. Import Master Asset BMN
```bash
1. Buka halaman Master Asset
2. Download template Excel
3. Isi data sesuai contoh di atas
4. Import dengan mode "Upsert"
```

#### B. Link Data Bangunan
```bash
1. Buka halaman Faslan
2. Klik "Tambah Faslan"
3. Pilih asset "BMN-TN-001"
4. Input data bangunan
5. Simpan
```

#### C. Link Data Kerjasama
```bash
1. Buka halaman Kerjasama
2. Klik "Tambah Kerjasama"
3. Pilih asset "BMN-TN-001"
4. Input data kerjasama
5. Simpan
```

### **Step 2: Buka Detail Asset**

```bash
1. Buka halaman Master Asset
2. Klik pada asset "BMN-TN-001"
3. Halaman detail akan terbuka
```

### **Step 3: Verifikasi Setiap Tab**

#### ✅ **Tab 1: Informasi BMN**
Harus menampilkan:
- Kode Asset: BMN-TN-001
- NUP: 12345678901234567890123
- Nama Asset: Tanah Kantor Pusat Kodaeral 3
- Jenis BMN: Tanah
- Kondisi: Baik
- Tanggal Perolehan: 15 Januari 2020
- Nilai Perolehan: Rp 5.000.000.000
- Luas Tanah: 1500 m²
- Keterangan: Tanah untuk kantor pusat

#### ✅ **Tab 2: Sertifikat & Dokumen**
Harus menampilkan:
- No. Sertifikat: SHM-001/2020
- No. PSP: PSP-001/2020
- Tanggal PSP: 01 Februari 2020

#### ✅ **Tab 3: Lokasi**
Harus menampilkan:
- Alamat lengkap
- RT/RW
- Desa/Kelurahan
- Kecamatan
- Kota/Kabupaten
- Kode Kota
- Provinsi

#### ✅ **Tab 4: Faslan**
Harus menampilkan:
- Badge jumlah: (1) atau lebih
- List bangunan/fasilitas di atas tanah
- Status operasional masing-masing

#### ✅ **Tab 5: Maintenance**
Harus menampilkan:
- Riwayat maintenance (jika ada)
- Atau pesan "Belum ada riwayat maintenance"

#### ✅ **Tab 6: Inventory**
Harus menampilkan:
- Inventory yang disimpan di lokasi ini (jika ada)
- Atau pesan "Belum ada data inventory"

#### ✅ **Tab 7: Kendaraan**
Harus menampilkan:
- Kendaraan yang terdaftar di lokasi ini (jika ada)
- Atau pesan "Belum ada data kendaraan"

#### ✅ **Tab 8: Kerjasama**
Harus menampilkan:
- Badge jumlah: (1) atau lebih
- Detail kerjasama:
  - Nama mitra
  - Jenis kerjasama
  - Nomor perjanjian
  - Periode
  - Nilai kerjasama
  - Status (Active/Expired)

---

## 📊 Checklist Verifikasi

### **Summary Cards (Atas)**
- [ ] Jenis BMN ditampilkan dengan benar
- [ ] NUP ditampilkan lengkap 23 digit
- [ ] Nilai Perolehan format Rupiah
- [ ] Luas Tanah dengan satuan m²
- [ ] Kondisi dengan badge warna
- [ ] Tanggal Perolehan format Indonesia

### **Tab Informasi BMN**
- [ ] Semua field terisi dengan benar
- [ ] Format tanggal: DD MMMM YYYY
- [ ] Format currency: Rp X.XXX.XXX.XXX
- [ ] Tidak ada field yang "undefined"

### **Tab Sertifikat**
- [ ] No. Sertifikat muncul
- [ ] No. PSP muncul
- [ ] Tanggal PSP format benar
- [ ] Jika kosong, tampil pesan "Belum ada data"

### **Tab Lokasi**
- [ ] Alamat lengkap muncul
- [ ] Semua field administratif terisi
- [ ] Koordinat peta (jika ada)
- [ ] Tidak ada field yang null/undefined

### **Tab Faslan (Bangunan)**
- [ ] Badge count sesuai jumlah data
- [ ] Card bangunan muncul
- [ ] Status operasional dengan badge
- [ ] Jika kosong, tampil empty state

### **Tab Kerjasama**
- [ ] Badge count sesuai jumlah data
- [ ] Detail kerjasama lengkap
- [ ] Periode tanggal format benar
- [ ] Nilai kerjasama format Rupiah
- [ ] Status dengan badge warna
- [ ] Jika kosong, tampil empty state

---

## 🔍 Test Cases Detail

### **Test Case 1: Asset dengan Semua Relasi**
```
Given: Asset BMN-TN-001 dengan data lengkap
When: User membuka detail asset
Then: 
  - Semua 8 tab dapat diakses
  - Setiap tab menampilkan data yang benar
  - Badge count di tab sesuai jumlah data
  - Tidak ada error di console
```

### **Test Case 2: Asset Tanpa Relasi**
```
Given: Asset BMN-TN-002 tanpa data relasi
When: User membuka detail asset
Then:
  - Tab Info BMN, Sertifikat, Lokasi tetap menampilkan data
  - Tab Faslan, Maintenance, dll menampilkan empty state
  - Badge count tidak muncul atau menunjukkan (0)
```

### **Test Case 3: Asset dengan Kerjasama Expired**
```
Given: Asset BMN-TN-003 dengan kerjasama expired
When: User membuka tab Kerjasama
Then:
  - Status badge berwarna merah
  - Tanggal selesai sudah lewat
  - Masih tetap ditampilkan di list
```

### **Test Case 4: Asset dengan Multiple Bangunan**
```
Given: Asset BMN-TN-004 dengan 3 bangunan
When: User membuka tab Faslan
Then:
  - Badge menunjukkan (3)
  - Semua 3 bangunan ditampilkan
  - Masing-masing dengan status yang benar
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Data Tidak Muncul
**Symptom**: Tab kosong padahal data sudah ada
**Solution**:
```javascript
// Check API response
fetch('http://localhost:3001/api/faslan?kode_asset=BMN-TN-001')
    .then(r => r.json())
    .then(data => console.log(data));

// Check foreign key
SELECT * FROM faslan_assets WHERE kode_asset = 'BMN-TN-001';
```

### Issue 2: Badge Count Salah
**Symptom**: Badge menunjukkan angka yang salah
**Solution**:
```javascript
// Verify count
SELECT COUNT(*) FROM faslan_assets WHERE kode_asset = 'BMN-TN-001';
```

### Issue 3: Format Tanggal Salah
**Symptom**: Tanggal muncul sebagai timestamp
**Solution**:
```javascript
// Check formatDate function
const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
};
```

### Issue 4: Nilai Perolehan Tidak Format Rupiah
**Symptom**: Nilai muncul sebagai angka biasa
**Solution**:
```javascript
// Check formatCurrency function
const formatCurrency = (value) => {
    if (!value) return '-';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(value);
};
```

---

## 📸 Screenshot Expected Results

### 1. Summary Cards
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│  🏢 Tanah   │  📋 NUP     │ 💰 Rp 5M    │ 📏 1500 m²  │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### 2. Tab Headers
```
[📋 Informasi BMN] [📜 Sertifikat] [📍 Lokasi] [🚢 Faslan (2)] 
[🔧 Maintenance] [📦 Inventory] [🚗 Kendaraan] [🤝 Kerjasama (1)]
```

### 3. Kerjasama Card
```
┌──────────────────────────────────────────────────────┐
│ PT. Kantin Sejahtera                    [Active]     │
│ Sewa Sebagian • KS-001/2024                          │
├──────────────────────────────────────────────────────┤
│ Periode: 01 Januari 2024 - 31 Desember 2025         │
│ Nilai: Rp 50.000.000                                 │
│ PIC Internal: Mayor Budi • PIC Mitra: Pak Ahmad      │
└──────────────────────────────────────────────────────┘
```

---

## ✅ Success Criteria

Testing dianggap berhasil jika:

1. ✅ **Semua data BMN muncul** di tab Informasi
2. ✅ **Sertifikat & PSP muncul** di tab Sertifikat
3. ✅ **Alamat lengkap muncul** di tab Lokasi
4. ✅ **Bangunan/Faslan muncul** dengan badge count yang benar
5. ✅ **Kerjasama muncul** dengan detail lengkap
6. ✅ **Status badge** menampilkan warna yang sesuai
7. ✅ **Format tanggal** dalam bahasa Indonesia
8. ✅ **Format currency** dalam Rupiah
9. ✅ **Empty state** muncul untuk tab tanpa data
10. ✅ **Tidak ada error** di browser console

---

## 🚀 Next Steps Setelah Testing

1. ✅ Verifikasi semua test cases pass
2. ✅ Screenshot hasil testing
3. ✅ Dokumentasi bug yang ditemukan
4. ✅ Fix bugs
5. ✅ Re-test
6. ✅ User Acceptance Testing (UAT)
7. ✅ Deploy to production

---

**Happy Testing! 🎉**
