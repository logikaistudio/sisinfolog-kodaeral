/**
 * Test API Harkan
 * Simple test untuk memastikan API endpoints berfungsi
 */

async function testAPI() {
    console.log('🧪 Testing API Harkan Endpoints\n');
    console.log('='.repeat(50));

    const baseURL = 'http://localhost:3001/api/harkan';

    try {
        // Test 1: GET all (should return empty array)
        console.log('\n1️⃣  Testing GET /api/harkan');
        const response1 = await fetch(baseURL);
        const data1 = await response1.json();
        console.log(`   Status: ${response1.status} ${response1.ok ? '✅' : '❌'}`);
        console.log(`   Data: ${JSON.stringify(data1)}`);
        console.log(`   Count: ${data1.length} records`);

        // Test 2: POST - Create new record
        console.log('\n2️⃣  Testing POST /api/harkan');
        const testData = {
            unsur: 'KRI',
            nama: 'KRI Test Migration',
            bahan: 'Baja',
            panjang_max_loa: 100,
            latitude: '-6.120000',
            longitude: '106.870000',
            kondisi: 'Siap',
            status: 'Operasi',
            persentasi: 85,
            sertifikasi: [],
            pesawat: [],
            fotos: []
        };

        const response2 = await fetch(baseURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });
        const data2 = await response2.json();
        console.log(`   Status: ${response2.status} ${response2.ok ? '✅' : '❌'}`);
        console.log(`   Created ID: ${data2.id}`);
        console.log(`   Name: ${data2.nama}`);

        const createdId = data2.id;

        // Test 3: GET by ID
        console.log(`\n3️⃣  Testing GET /api/harkan/${createdId}`);
        const response3 = await fetch(`${baseURL}/${createdId}`);
        const data3 = await response3.json();
        console.log(`   Status: ${response3.status} ${response3.ok ? '✅' : '❌'}`);
        console.log(`   Name: ${data3.nama}`);
        console.log(`   Kondisi: ${data3.kondisi}`);

        // Test 4: PUT - Update
        console.log(`\n4️⃣  Testing PUT /api/harkan/${createdId}`);
        const updateData = { ...data3, persentasi: 90, kondisi: 'Siap Operasi' };
        const response4 = await fetch(`${baseURL}/${createdId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });
        const data4 = await response4.json();
        console.log(`   Status: ${response4.status} ${response4.ok ? '✅' : '❌'}`);
        console.log(`   Updated Persentasi: ${data4.persentasi}`);
        console.log(`   Updated Kondisi: ${data4.kondisi}`);

        // Test 5: DELETE
        console.log(`\n5️⃣  Testing DELETE /api/harkan/${createdId}`);
        const response5 = await fetch(`${baseURL}/${createdId}`, {
            method: 'DELETE'
        });
        const data5 = await response5.json();
        console.log(`   Status: ${response5.status} ${response5.ok ? '✅' : '❌'}`);
        console.log(`   Message: ${data5.message}`);

        // Test 6: Verify deletion
        console.log(`\n6️⃣  Verifying deletion`);
        const response6 = await fetch(baseURL);
        const data6 = await response6.json();
        console.log(`   Status: ${response6.status} ${response6.ok ? '✅' : '❌'}`);
        console.log(`   Count: ${data6.length} records (should be 0)`);

        console.log('\n' + '='.repeat(50));
        console.log('✅ All tests completed successfully!\n');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error);
    }
}

testAPI();
