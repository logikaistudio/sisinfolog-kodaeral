/**
 * Clear Old Settings Script
 * Untuk clear localStorage settings lama agar warna baru diterapkan
 * 
 * CARA PAKAI:
 * 1. Buka aplikasi di browser
 * 2. Tekan F12 untuk buka Developer Console
 * 3. Copy paste script ini ke console
 * 4. Tekan Enter
 * 5. Refresh halaman (Ctrl+F5)
 */

(function clearOldSettings() {
    console.log('🧹 Clearing old localStorage settings...\n');
    console.log('='.repeat(50));

    const itemsToClear = [
        'faslabuhSettings',  // Will reset to new RED color (#ef4444)
        'dataHarkan'         // Already cleared after migration
    ];

    let clearedCount = 0;

    itemsToClear.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
            localStorage.removeItem(key);
            console.log(`✅ Cleared: ${key}`);
            if (key === 'faslabuhSettings') {
                console.log(`   Old value: ${value}`);
                console.log(`   New color will be: RED (#ef4444)`);
            }
            clearedCount++;
        } else {
            console.log(`⚪ Not found: ${key}`);
        }
    });

    console.log('\n' + '='.repeat(50));
    console.log(`📊 Summary: ${clearedCount} items cleared`);
    console.log('\n🔄 REFRESH PAGE NOW to apply new colors!');
    console.log('   Press Ctrl+F5 or Cmd+Shift+R');
    console.log('\n🎨 New Colors:');
    console.log('   - Faslabuh nodes: 🔴 RED (#ef4444)');
    console.log('   - Faslabuh table header: 🔴 RED (#ef4444)');
    console.log('   - Harkan nodes: 🟡 YELLOW (#eab308)');
    console.log('='.repeat(50));
})();
