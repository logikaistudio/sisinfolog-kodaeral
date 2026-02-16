# Panduan Migrasi Data Harkan dari localStorage ke Database

## 🎯 Tujuan

Memindahkan data Harkan yang tersimpan di localStorage browser ke database PostgreSQL (Neon).

---

## ⚠️ Mengapa Data Hilang?

Sebelumnya, data Harkan disimpan di **localStorage browser**:
- ✅ Cepat dan mudah
- ❌ Hilang saat clear cache/cookies
- ❌ Tidak terbawa saat redeploy
- ❌ Tidak bisa diakses dari device lain

Sekarang, data disimpan di **database PostgreSQL**:
- ✅ Persisten dan aman
- ✅ Tidak hilang saat redeploy
- ✅ Bisa diakses dari mana saja
- ✅ Backup otomatis (Neon)

---

## 🔄 Cara Migrasi Data

### Metode 1: Via Browser Console (Recommended)

**Langkah-langkah:**

1. **Buka aplikasi lokal di browser:**
   ```
   http://localhost:5173
   ```

2. **Buka Developer Console:**
   - Tekan `F12` atau
   - Klik kanan → Inspect → Console tab

3. **Copy script migrasi:**
   - Buka file: `migrations/migrate-localstorage-to-db.js`
   - Copy seluruh isi file

4. **Paste ke Console:**
   - Paste script di console
   - Tekan Enter

5. **Tunggu proses selesai:**
   ```
   🔄 Starting Data Harkan Migration...
   ✅ Found 5 records in localStorage
   📤 Starting migration to database...
   
   [1/5] Migrating: KRI Teluk Banten
      ✅ Success - New ID: 1
   [2/5] Migrating: KRI Banda Aceh
      ✅ Success - New ID: 2
   ...
   
   📊 Migration Summary:
      ✅ Success: 5
      ❌ Failed: 0
      📝 Total: 5
   
   ✅ Migration completed!
   ```

6. **Verifikasi:**
   - Refresh halaman Data Harkan
   - Data seharusnya muncul dari database

---

### Metode 2: Export-Import Manual

**Jika Metode 1 tidak berhasil:**

1. **Export dari localStorage:**
   ```javascript
   // Di browser console
   const data = localStorage.getItem('dataHarkan');
   console.log(data);
   // Copy output
   ```

2. **Simpan ke file JSON:**
   - Paste output ke text editor
   - Save as `harkan-backup.json`

3. **Import via API:**
   ```bash
   # Untuk setiap item di JSON
   curl -X POST http://localhost:3001/api/harkan \
     -H "Content-Type: application/json" \
     -d @harkan-backup.json
   ```

---

### Metode 3: Via Node.js Script (Advanced)

**Jika punya backup JSON:**

1. **Buat file `import-harkan.js`:**
   ```javascript
   const fs = require('fs');
   const fetch = require('node-fetch');
   
   const data = JSON.parse(fs.readFileSync('harkan-backup.json'));
   const apiEndpoint = 'http://localhost:3001/api/harkan';
   
   (async () => {
       for (const item of data) {
           const { id, ...itemData } = item;
           await fetch(apiEndpoint, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(itemData)
           });
       }
       console.log('✅ Import complete');
   })();
   ```

2. **Jalankan:**
   ```bash
   node import-harkan.js
   ```

---

## 🔍 Troubleshooting

### Problem: "No data found in localStorage"

**Solusi:**
- Pastikan Anda membuka aplikasi di browser yang sama dengan yang digunakan sebelumnya
- Check localStorage di Console:
  ```javascript
  console.log(localStorage.getItem('dataHarkan'));
  ```

### Problem: "Failed to migrate - 500 error"

**Solusi:**
1. Pastikan server lokal berjalan (`npm run dev:full`)
2. Check API endpoint di browser: `http://localhost:3001/api/harkan`
3. Check database connection di `.env`

### Problem: "Data muncul tapi tidak lengkap"

**Solusi:**
- Check field mapping di migration script
- Pastikan semua field JSONB (sertifikasi, pesawat, fotos) adalah array

---

## ✅ Verifikasi Migrasi Berhasil

### 1. Check via Browser
- Buka halaman Data Harkan
- Refresh halaman (Ctrl+F5)
- Data seharusnya muncul

### 2. Check via API
```bash
curl http://localhost:3001/api/harkan
```

### 3. Check via Database
```bash
node migrations/verify-tables.js
```

Output seharusnya:
```
📈 Total Records: 5  # Atau jumlah data Anda
```

---

## 🗑️ Cleanup (Opsional)

Setelah migrasi berhasil, Anda bisa hapus data di localStorage:

```javascript
// Di browser console
localStorage.removeItem('dataHarkan');
console.log('✅ localStorage cleaned');
```

**⚠️ WARNING:** Hanya lakukan ini setelah memastikan data sudah ada di database!

---

## 📊 Checklist Migrasi

- [ ] Backup data dari localStorage (copy ke file)
- [ ] Jalankan migration script
- [ ] Verifikasi data muncul di halaman Data Harkan
- [ ] Test CRUD operations (Create, Read, Update, Delete)
- [ ] Verifikasi data muncul di Peta Faslan
- [ ] (Opsional) Clear localStorage

---

## 🆘 Jika Masih Bermasalah

1. **Export data manual:**
   ```javascript
   // Di console
   const backup = localStorage.getItem('dataHarkan');
   console.log(backup);
   // Copy dan simpan ke file
   ```

2. **Contact support dengan:**
   - Screenshot error di console
   - Backup data JSON
   - Versi browser yang digunakan

---

## 📝 Notes

- Migration hanya perlu dilakukan **SEKALI**
- Setelah migrasi, data akan otomatis tersimpan di database
- Data di localStorage tidak akan otomatis ter-update lagi
- Gunakan database sebagai single source of truth

---

**Status:** Ready to migrate  
**Estimated Time:** < 1 minute  
**Risk:** Low (data di localStorage tetap ada sampai Anda hapus manual)
