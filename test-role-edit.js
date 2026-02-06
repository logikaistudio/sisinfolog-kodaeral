// Quick test untuk Role Edit
const baseURL = 'http://localhost:3000';

async function testRoleEdit() {
    console.log('🧪 Testing Role Edit Function...\n');

    try {
        // 1. Get all roles first
        console.log('1️⃣ Fetching all roles...');
        const rolesRes = await fetch(`${baseURL}/api/roles`);
        const roles = await rolesRes.json();
        console.log('✅ Roles:', roles.map(r => `${r.id}: ${r.name}`).join(', '));

        if (roles.length === 0) {
            console.log('❌ No roles found. Please create a role first.');
            return;
        }

        // 2. Pick first role to edit
        const roleToEdit = roles[0];
        console.log(`\n2️⃣ Editing role: ${roleToEdit.name} (ID: ${roleToEdit.id})`);

        // 3. Update the role
        const updatedData = {
            name: roleToEdit.name,
            description: `${roleToEdit.description} - UPDATED at ${new Date().toLocaleTimeString()}`,
            permissions: roleToEdit.permissions || []
        };

        console.log('Sending PUT request with data:', updatedData);

        const updateRes = await fetch(`${baseURL}/api/roles/${roleToEdit.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        const updateResult = await updateRes.json();
        console.log('Response status:', updateRes.status);
        console.log('Response data:', updateResult);

        if (updateRes.ok) {
            console.log('✅ Role updated successfully!');
        } else {
            console.log('❌ Update failed:', updateResult.error || updateResult.details);
        }

        // 4. Verify the update
        console.log('\n3️⃣ Verifying update...');
        const verifyRes = await fetch(`${baseURL}/api/roles`);
        const updatedRoles = await verifyRes.json();
        const verifiedRole = updatedRoles.find(r => r.id === roleToEdit.id);

        if (verifiedRole) {
            console.log('✅ Verified role:', verifiedRole);
            console.log('Description changed:', roleToEdit.description, '→', verifiedRole.description);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testRoleEdit();
