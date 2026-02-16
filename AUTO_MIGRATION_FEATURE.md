# Auto-Migration Feature - Data Harkan

## 🎯 Fitur Baru: Auto-Migration

Data Harkan sekarang akan **otomatis ter-migrate** dari localStorage ke database saat pertama kali halaman dibuka!

---

## ✨ Cara Kerja

### 1. **Deteksi Otomatis**
Saat halaman Data Harkan dibuka:
- ✅ Cek apakah database kosong
- ✅ Cek apakah localStorage punya data
- ✅ Jika ya, otomatis migrate

### 2. **Proses Migration**
```
1. Fetch data dari API
2. Jika database kosong:
   a. Baca data dari localStorage
   b. Untuk setiap record:
      - Hapus ID lama
      - POST ke API
   c. Fetch ulang dari database
3. Tampilkan data
```

### 3. **Notifikasi Visual**
User akan melihat notifikasi:
- 🔄 "Migrating X records..." (saat proses)
- ✅ "Migration complete: X records" (selesai)

---

## 🚀 Keuntungan

1. **Zero Manual Work**
   - Tidak perlu copy-paste script
   - Tidak perlu buka console
   - Otomatis saat buka halaman

2. **User Friendly**
   - Notifikasi jelas
   - Progress visible
   - No technical knowledge needed

3. **Safe**
   - Data di localStorage tetap ada
   - Bisa rollback jika perlu
   - No data loss

---

## 📋 Skenario Penggunaan

### Skenario 1: User Lama (Punya Data di localStorage)
```
1. User buka halaman Data Harkan
2. Database kosong (baru deploy)
3. localStorage punya 5 records
4. Auto-migration berjalan
5. Notifikasi: "Migrating 5 records..."
6. Selesai: "Migration complete: 5 records"
7. Data muncul di tabel
```

### Skenario 2: User Baru (Tidak Ada Data)
```
1. User buka halaman Data Harkan
2. Database kosong
3. localStorage juga kosong
4. Tidak ada migration
5. Tabel kosong (normal)
```

### Skenario 3: Data Sudah Ada di Database
```
1. User buka halaman Data Harkan
2. Database punya data
3. Skip migration
4. Langsung tampilkan data dari database
```

---

## 🔧 Technical Details

### Code Location
**File:** `src/pages/DataHarkan.jsx`

**Functions:**
1. `fetchData()` - Main fetch function
2. `migrateFromLocalStorage()` - Migration logic

### Migration Logic
```javascript
const migrateFromLocalStorage = async (apiEndpoint) => {
    // 1. Check localStorage
    const storedData = localStorage.getItem('dataHarkan')
    if (!storedData) return
    
    // 2. Parse data
    const localData = JSON.parse(storedData)
    
    // 3. Migrate each item
    for (const item of localData) {
        const { id, ...itemData } = item
        await fetch(apiEndpoint, {
            method: 'POST',
            body: JSON.stringify(itemData)
        })
    }
    
    // 4. Update status
    setMigrationStatus('Migration complete')
}
```

### State Management
```javascript
const [migrationStatus, setMigrationStatus] = useState(null)
```

**Values:**
- `null` - No migration
- `"Migrating X records..."` - In progress
- `"Migration complete: X records"` - Done
- `"Migration failed"` - Error

---

## 🎨 UI Components

### Migration Notification
**Location:** Top of main content card

**Styles:**
- **In Progress:** Blue background (#dbeafe)
- **Complete:** Green background (#dcfce7)
- **Failed:** Red background (if error)

**Auto-hide:** No (stays visible for user confirmation)

---

## 🧪 Testing

### Test Case 1: Normal Migration
```
1. Add test data to localStorage:
   localStorage.setItem('dataHarkan', JSON.stringify([{
       nama: 'Test Ship',
       unsur: 'KRI',
       kondisi: 'Siap'
   }]))

2. Clear database (or use fresh DB)

3. Open Data Harkan page

4. Expected:
   - See notification "Migrating 1 records..."
   - Then "Migration complete: 1 records"
   - Data appears in table
```

### Test Case 2: No Data to Migrate
```
1. Clear localStorage:
   localStorage.removeItem('dataHarkan')

2. Open Data Harkan page

3. Expected:
   - No notification
   - Empty table
```

### Test Case 3: Database Already Has Data
```
1. Database has 3 records
2. localStorage has 2 records
3. Open Data Harkan page
4. Expected:
   - No migration
   - Shows 3 records from database
```

---

## ⚠️ Important Notes

1. **Migration Only Runs Once**
   - Only when database is empty
   - Won't duplicate data

2. **localStorage Not Cleared**
   - Data stays in localStorage
   - Can be manually cleared later
   - Safe fallback if needed

3. **ID Regeneration**
   - Old IDs from localStorage are discarded
   - Database generates new sequential IDs
   - No ID conflicts

4. **Array Fields**
   - Ensures sertifikasi, pesawat, fotos are arrays
   - Prevents null/undefined errors

---

## 🔄 Manual Migration (Backup Method)

If auto-migration fails, use manual method:

**Option 1: Browser Console Script**
```
See: migrations/migrate-localstorage-to-db.js
```

**Option 2: Migration Guide**
```
See: migrations/MIGRATION_GUIDE.md
```

---

## 📊 Migration Statistics

**Logged to Console:**
```
🔄 Auto-migrating 5 records from localStorage to database...
✅ Migration complete: 5/5 records migrated
```

**Shown to User:**
```
🔄 Migrating 5 records...
✅ Migration complete: 5 records
```

---

## 🆘 Troubleshooting

### Problem: Migration doesn't start

**Check:**
1. Is database empty? (must be 0 records)
2. Does localStorage have data?
   ```javascript
   console.log(localStorage.getItem('dataHarkan'))
   ```
3. Is API endpoint accessible?

### Problem: Migration fails

**Check:**
1. Browser console for errors
2. Network tab for failed requests
3. API server is running
4. DATABASE_URL is correct

### Problem: Data duplicated

**Cause:** Migration ran multiple times

**Solution:**
- Delete duplicate records
- Migration only runs when DB is empty

---

## ✅ Deployment Checklist

- [x] Auto-migration code added
- [x] UI notification implemented
- [x] Console logging added
- [x] Error handling included
- [x] Documentation complete
- [ ] Test on production
- [ ] Verify with real user data

---

**Status:** ✅ Ready for Production  
**Version:** 1.0.0  
**Date:** 2026-02-17
