/**
 * Migration Script: localStorage to Database
 * Untuk migrasi data Harkan dari localStorage ke Neon DB
 * 
 * CARA PAKAI:
 * 1. Buka browser di aplikasi lokal (http://localhost:5173)
 * 2. Buka Console (F12)
 * 3. Copy paste script ini ke console
 * 4. Script akan otomatis migrate data dari localStorage ke database
 */

(async function migrateHarkanData() {
    console.log('🔄 Starting Data Harkan Migration from localStorage to Database\n');
    console.log('='.repeat(70));

    // Check if localStorage has data
    const storedData = localStorage.getItem('dataHarkan');

    if (!storedData) {
        console.log('❌ No data found in localStorage (key: "dataHarkan")');
        console.log('   Nothing to migrate.');
        return;
    }

    let data;
    try {
        data = JSON.parse(storedData);
    } catch (error) {
        console.error('❌ Failed to parse localStorage data:', error);
        return;
    }

    if (!Array.isArray(data) || data.length === 0) {
        console.log('❌ No valid data to migrate (empty or invalid format)');
        return;
    }

    console.log(`\n✅ Found ${data.length} records in localStorage`);
    console.log('📤 Starting migration to database...\n');

    const apiEndpoint = 'http://localhost:3001/api/harkan';
    let successCount = 0;
    let failCount = 0;
    const errors = [];

    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        console.log(`\n[${i + 1}/${data.length}] Migrating: ${item.nama || 'Unnamed'}`);

        try {
            // Remove the old ID (database will generate new one)
            const { id, ...itemData } = item;

            // Ensure arrays are properly formatted
            itemData.sertifikasi = itemData.sertifikasi || [];
            itemData.pesawat = itemData.pesawat || [];
            itemData.fotos = itemData.fotos || [];

            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(itemData)
            });

            if (response.ok) {
                const result = await response.json();
                console.log(`   ✅ Success - New ID: ${result.id}`);
                successCount++;
            } else {
                const errorText = await response.text();
                console.error(`   ❌ Failed - Status: ${response.status}`);
                console.error(`   Error: ${errorText}`);
                failCount++;
                errors.push({ item: item.nama, error: errorText });
            }
        } catch (error) {
            console.error(`   ❌ Failed - ${error.message}`);
            failCount++;
            errors.push({ item: item.nama, error: error.message });
        }

        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📝 Total: ${data.length}`);

    if (errors.length > 0) {
        console.log('\n❌ Errors:');
        errors.forEach((err, idx) => {
            console.log(`   ${idx + 1}. ${err.item}: ${err.error}`);
        });
    }

    if (successCount > 0) {
        console.log('\n✅ Migration completed!');
        console.log('💡 Tip: You can now safely clear localStorage if needed:');
        console.log('   localStorage.removeItem("dataHarkan")');
    }

    console.log('='.repeat(70));
})();
