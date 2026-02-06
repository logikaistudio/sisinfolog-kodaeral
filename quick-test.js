// Simple test untuk verifikasi semua endpoint auth bekerja
const baseURL = 'http://localhost:3001';

async function quickTest() {
    console.log('🔍 Quick Auth Test\n');

    try {
        // Test 1: Login
        console.log('1. Testing LOGIN...');
        const loginRes = await fetch(`${baseURL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'kodaeral', password: 'kodaeral' })
        });
        const loginData = await loginRes.json();
        console.log(loginRes.ok ? '✅ Login OK' : '❌ Login FAILED:', loginData);

        // Test 2: Get Users
        console.log('\n2. Testing GET USERS...');
        const usersRes = await fetch(`${baseURL}/api/users`);
        const users = await usersRes.json();
        console.log(usersRes.ok ? `✅ Users OK (${users.length} users)` : '❌ Users FAILED:', users);

        // Test 3: Get Roles
        console.log('\n3. Testing GET ROLES...');
        const rolesRes = await fetch(`${baseURL}/api/roles`);
        const roles = await rolesRes.json();
        console.log(rolesRes.ok ? `✅ Roles OK (${roles.length} roles)` : '❌ Roles FAILED:', roles);

        // Test 4: Create Role
        console.log('\n4. Testing CREATE ROLE...');
        const createRes = await fetch(`${baseURL}/api/roles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Role ' + Date.now(),
                description: 'Test description',
                permissions: ['read_content']
            })
        });
        const created = await createRes.json();
        console.log(createRes.ok ? '✅ Create Role OK' : '❌ Create FAILED:', created);

        // Test 5: Update Role (if created)
        if (createRes.ok && created.id) {
            console.log('\n5. Testing UPDATE ROLE...');
            const updateRes = await fetch(`${baseURL}/api/roles/${created.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: created.name,
                    description: 'UPDATED description',
                    permissions: ['read_content', 'manage_content']
                })
            });
            const updated = await updateRes.json();
            console.log(updateRes.ok ? '✅ Update Role OK' : '❌ Update FAILED:', updated);

            // Test 6: Delete Role
            console.log('\n6. Testing DELETE ROLE...');
            const deleteRes = await fetch(`${baseURL}/api/roles/${created.id}`, {
                method: 'DELETE'
            });
            const deleted = await deleteRes.json();
            console.log(deleteRes.ok ? '✅ Delete Role OK' : '❌ Delete FAILED:', deleted);
        }

        console.log('\n✨ All tests completed!\n');

    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
}

// Wait a bit for server to be ready
setTimeout(quickTest, 1000);
