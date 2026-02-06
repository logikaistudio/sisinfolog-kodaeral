// Test Script untuk Verifikasi Auth & User Management
// Jalankan dengan: node test-auth.js

const DATABASE_URL = process.env.DATABASE_URL || 'your-neon-db-url';

async function testAuthSystem() {
    console.log('🔍 Testing Authentication System...\n');

    const baseURL = 'http://localhost:3000';

    try {
        // Test 1: Get Users (should auto-create table)
        console.log('1️⃣ Testing GET /api/users...');
        const usersRes = await fetch(`${baseURL}/api/users`);
        const users = await usersRes.json();
        console.log(`✅ Users fetched: ${users.length} users`);
        console.log('   Default admin exists:', users.some(u => u.username === 'kodaeral'));

        // Test 2: Get Roles (should auto-create table)
        console.log('\n2️⃣ Testing GET /api/roles...');
        const rolesRes = await fetch(`${baseURL}/api/roles`);
        const roles = await rolesRes.json();
        console.log(`✅ Roles fetched: ${roles.length} roles`);
        console.log('   Roles:', roles.map(r => r.name).join(', '));

        // Test 3: Login with default credentials
        console.log('\n3️⃣ Testing POST /api/auth/login...');
        const loginRes = await fetch(`${baseURL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'kodaeral', password: 'kodaeral' })
        });
        const loginData = await loginRes.json();
        if (loginRes.ok) {
            console.log('✅ Login successful');
            console.log('   User:', loginData.user.name, '-', loginData.user.role);
        } else {
            console.log('❌ Login failed:', loginData.error);
        }

        // Test 4: Create new user
        console.log('\n4️⃣ Testing POST /api/users...');
        const newUser = {
            name: 'Test User',
            email: 'test@example.com',
            username: 'testuser',
            password: 'test123',
            role: 'User',
            status: 'Active'
        };
        const createUserRes = await fetch(`${baseURL}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });
        const createdUser = await createUserRes.json();
        if (createUserRes.ok) {
            console.log('✅ User created:', createdUser.name);
        } else {
            console.log('⚠️  User creation:', createdUser.error);
        }

        // Test 5: Update user (if created)
        if (createUserRes.ok && createdUser.id) {
            console.log('\n5️⃣ Testing PUT /api/users/:id...');
            const updateRes = await fetch(`${baseURL}/api/users/${createdUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newUser,
                    name: 'Test User Updated',
                    password: '' // Don't change password
                })
            });
            const updatedUser = await updateRes.json();
            if (updateRes.ok) {
                console.log('✅ User updated:', updatedUser.name);
            } else {
                console.log('❌ Update failed:', updatedUser.error);
            }
        }

        // Test 6: Create new role
        console.log('\n6️⃣ Testing POST /api/roles...');
        const newRole = {
            name: 'Manager',
            description: 'Management role',
            permissions: ['manage_content', 'read_content']
        };
        const createRoleRes = await fetch(`${baseURL}/api/roles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newRole)
        });
        const createdRole = await createRoleRes.json();
        if (createRoleRes.ok) {
            console.log('✅ Role created:', createdRole.name);
        } else {
            console.log('⚠️  Role creation:', createdRole.error);
        }

        // Test 7: Update role (if created)
        if (createRoleRes.ok && createdRole.id) {
            console.log('\n7️⃣ Testing PUT /api/roles/:id...');
            const updateRoleRes = await fetch(`${baseURL}/api/roles/${createdRole.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newRole,
                    description: 'Updated management role'
                })
            });
            const updatedRole = await updateRoleRes.json();
            if (updateRoleRes.ok) {
                console.log('✅ Role updated:', updatedRole.name);
            } else {
                console.log('❌ Role update failed:', updatedRole.error);
            }
        }

        console.log('\n✨ All tests completed!\n');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run tests
testAuthSystem();
