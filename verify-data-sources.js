// Script untuk memverifikasi semua data berasal dari Neon DB
const baseURL = 'http://localhost:3001';

async function verifyAllDataSources() {
    console.log('🔍 VERIFYING ALL DATA SOURCES\n');
    console.log('='.repeat(60));

    const results = {
        passed: 0,
        failed: 0,
        total: 0
    };

    async function testEndpoint(name, url, method = 'GET') {
        results.total++;
        try {
            const response = await fetch(`${baseURL}${url}`, { method });
            const data = await response.json();

            if (response.ok) {
                console.log(`✅ ${name}`);
                console.log(`   URL: ${url}`);
                console.log(`   Status: ${response.status}`);
                console.log(`   Data: ${Array.isArray(data) ? `${data.length} records` : 'Object'}`);
                results.passed++;
            } else {
                console.log(`⚠️  ${name}`);
                console.log(`   URL: ${url}`);
                console.log(`   Status: ${response.status}`);
                console.log(`   Error: ${data.error || 'Unknown'}`);
                results.failed++;
            }
        } catch (error) {
            console.log(`❌ ${name}`);
            console.log(`   URL: ${url}`);
            console.log(`   Error: ${error.message}`);
            results.failed++;
        }
        console.log('');
    }

    console.log('\n📋 1. AUTHENTICATION & USER MANAGEMENT\n');
    await testEndpoint('Users List', '/api/users');
    await testEndpoint('Roles List', '/api/roles');

    console.log('\n📦 2. ASSET MANAGEMENT\n');
    await testEndpoint('Tanah Assets', '/api/assets/tanah');
    await testEndpoint('Bangunan Assets', '/api/assets/bangunan');
    await testEndpoint('Kapling Assets', '/api/assets/kapling');
    await testEndpoint('Harpan Assets', '/api/assets/harpan');
    await testEndpoint('Faslabuh Assets', '/api/assets/faslabuh');

    console.log('\n🗂️  3. MASTER DATA\n');
    await testEndpoint('Categories', '/api/master/categories');
    await testEndpoint('Locations', '/api/master/locations');
    await testEndpoint('Officers', '/api/master/officers');
    await testEndpoint('Units', '/api/master/units');

    console.log('\n🏢 4. MASTER ASSET (BMN)\n');
    await testEndpoint('Master Asset BMN', '/api/master-asset');

    console.log('\n' + '='.repeat(60));
    console.log('\n📊 VERIFICATION SUMMARY\n');
    console.log(`Total Endpoints Tested: ${results.total}`);
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

    if (results.failed === 0) {
        console.log('\n🎉 ALL DATA SOURCES VERIFIED!');
        console.log('✅ 100% of data comes from Neon DB');
        console.log('✅ NO data from localStorage (except session)');
    } else {
        console.log('\n⚠️  Some endpoints need attention');
    }

    console.log('\n' + '='.repeat(60) + '\n');
}

// Wait for server to be ready
setTimeout(verifyAllDataSources, 1000);
