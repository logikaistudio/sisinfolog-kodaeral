
async function testImport() {
    console.log('Testing import endpoint...');
    const data = {
        mode: 'upsert',
        assets: [
            {
                code: 'TEST-001-' + Date.now(),
                name: 'Test Asset Direct',
                category: 'Tanah',
                luas: '100 m2',
                status: 'Aman',
                location: 'Test Loc'
            }
        ]
    };

    try {
        const response = await fetch('http://localhost:3001/api/assets/tanah/bulk-upsert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Body:', text);

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

testImport();
