/**
 * Clear Old Settings Script
 * Untuk clear localStorage settings lama agar warna baru diterapkan
 * 
 * Run this in browser console ONCE after deployment
 */

(function clearOldSettings() {
    console.log('🧹 Clearing old localStorage settings...\n');

    const itemsToClear = [
        'faslabuhSettings',  // Will reset to new red color
        'dataHarkan'         // Will be cleared after migration
    ];

    let clearedCount = 0;

    itemsToClear.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
            localStorage.removeItem(key);
            console.log(`✅ Cleared: ${key}`);
            clearedCount++;
        } else {
            console.log(`⚪ Not found: ${key}`);
        }
    });

    console.log(`\n📊 Summary: ${clearedCount} items cleared`);
    console.log('🔄 Refresh page to apply new colors!');
    console.log('   - Faslabuh nodes: RED (#ef4444)');
    console.log('   - Harkan nodes: YELLOW (#eab308)');
})();
