import { useState, useEffect } from 'react'

const AVAILABLE_PERMISSIONS = [
    { id: 'all', label: 'All Access (Super Admin)' },
    { id: 'manage_users', label: 'Manage Users' },
    { id: 'manage_content', label: 'Manage Content' },
    { id: 'read_content', label: 'Read Content' },
    { id: 'manage_roles', label: 'Manage Roles' }
];

function PengaturanUsers() {
    // Tabs state
    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'roles'

    // Users state
    const [users, setUsers] = useState([])
    const [loadingUsers, setLoadingUsers] = useState(false)
    const [errorUsers, setErrorUsers] = useState(null)
    const [showUserModal, setShowUserModal] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [userFormData, setUserFormData] = useState({
        name: '', email: '', username: '', role: 'User', status: 'Active', password: ''
    })
    const [isSavingUser, setIsSavingUser] = useState(false)

    // Roles state
    const [roles, setRoles] = useState([])
    const [loadingRoles, setLoadingRoles] = useState(false)
    const [errorRoles, setErrorRoles] = useState(null)
    const [showRoleModal, setShowRoleModal] = useState(false)
    const [editingRole, setEditingRole] = useState(null)
    const [roleFormData, setRoleFormData] = useState({ name: '', description: '', permissions: [] })
    const [isSavingRole, setIsSavingRole] = useState(false)

    // Fetch Users
    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const response = await fetch('/api/users');
            if (!response.ok) throw new Error('Gagal mengambil data user');
            const data = await response.json();
            setUsers(data);
            setLoadingUsers(false);
        } catch (err) {
            console.error('Error fetching users:', err);
            setErrorUsers(err.message);
            setLoadingUsers(false);
        }
    };

    // Fetch Roles
    const fetchRoles = async () => {
        setLoadingRoles(true);
        try {
            const response = await fetch('/api/roles');
            if (!response.ok) throw new Error('Gagal mengambil data roles');
            const data = await response.json();
            setRoles(data);
            setLoadingRoles(false);
        } catch (err) {
            console.error('Error fetching roles:', err);
            setErrorRoles(err.message);
            setLoadingRoles(false);
        }
    };

    useEffect(() => {
        fetchRoles(); // Roles are needed in user modal too
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'roles') fetchRoles();
    }, [activeTab]);

    // === USER HANDLERS ===
    const openUserModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setUserFormData({
                name: user.name || '',
                email: user.email || '',
                username: user.username || '',
                role: user.role || 'User',
                status: user.status || 'Active',
                password: '' // Don't fill password on edit
            });
        } else {
            setEditingUser(null);
            setUserFormData({
                name: '', email: '', username: '', role: 'User', status: 'Active', password: ''
            });
        }
        setShowUserModal(true);
    }

    const closeUserModal = () => {
        setShowUserModal(false);
        setEditingUser(null);
        setUserFormData({ name: '', email: '', username: '', role: 'User', status: 'Active', password: '' });
    }

    const handleUserFormChange = (e) => {
        const { name, value } = e.target;
        setUserFormData(prev => ({ ...prev, [name]: value }));
    }

    const saveUser = async () => {
        // Validation
        if (!userFormData.name || !userFormData.username || (!editingUser && !userFormData.password)) {
            alert('Mohon lengkapi Nama, Username, dan Password (untuk user baru)');
            return;
        }

        setIsSavingUser(true);
        try {
            const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
            const method = editingUser ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userFormData)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to save user');
            }

            await fetchUsers();
            closeUserModal();
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            setIsSavingUser(false);
        }
    }

    const deleteUser = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus user ini?')) return;

        try {
            const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Gagal menghapus user');
            fetchUsers();
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    }

    // === ROLE HANDLERS ===
    const openRoleModal = (role = null) => {
        if (role) {
            console.log('Opening role modal for edit:', role);
            setEditingRole(role);
            setRoleFormData({
                name: role.name || '',
                description: role.description || '',
                permissions: Array.isArray(role.permissions) ? role.permissions : []
            });
        } else {
            console.log('Opening role modal for new role');
            setEditingRole(null);
            setRoleFormData({ name: '', description: '', permissions: [] });
        }
        setShowRoleModal(true);
    }

    const closeRoleModal = () => {
        setShowRoleModal(false);
        setEditingRole(null);
        setRoleFormData({ name: '', description: '', permissions: [] });
    }

    const handleRoleFormChange = (e) => {
        const { name, value } = e.target;
        setRoleFormData(prev => ({ ...prev, [name]: value }));
    }

    const handlePermissionChange = (permId) => {
        setRoleFormData(prev => {
            const currentPerms = prev.permissions || [];
            if (currentPerms.includes(permId)) {
                return { ...prev, permissions: currentPerms.filter(p => p !== permId) };
            } else {
                return { ...prev, permissions: [...currentPerms, permId] };
            }
        });
    }

    const saveRole = async () => {
        // Validation
        if (!roleFormData.name || roleFormData.name.trim() === '') {
            alert('Nama role harus diisi!');
            return;
        }

        setIsSavingRole(true);
        try {
            const url = editingRole ? `/api/roles/${editingRole.id}` : '/api/roles';
            const method = editingRole ? 'PUT' : 'POST';

            console.log('Saving role:', { url, method, data: roleFormData });

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roleFormData)
            });

            const responseData = await response.json();
            console.log('Response:', { status: response.status, data: responseData });

            if (!response.ok) {
                throw new Error(responseData.error || responseData.details || 'Failed to save role');
            }

            alert(editingRole ? 'Role berhasil diupdate!' : 'Role berhasil ditambahkan!');
            await fetchRoles(); // Refresh list
            closeRoleModal();
        } catch (err) {
            console.error('Save role error:', err);
            alert(`Error: ${err.message}`);
        } finally {
            setIsSavingRole(false);
        }
    }

    const deleteRole = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus role ini?')) return;

        try {
            const response = await fetch(`/api/roles/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Gagal menghapus role');
            fetchRoles();
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Pengaturan Akses</h1>
                <p className="page-subtitle">Manajemen pengguna dan role aplikasi</p>
            </div>

            {/* Tabs Navigation */}
            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '20px' }}>
                <button
                    onClick={() => setActiveTab('users')}
                    style={{
                        padding: '10px 5px',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'users' ? '2px solid #0f172a' : '2px solid transparent',
                        fontWeight: activeTab === 'users' ? '600' : '500',
                        color: activeTab === 'users' ? '#0f172a' : '#64748b',
                        cursor: 'pointer'
                    }}
                >
                    Users Management
                </button>
                <button
                    onClick={() => setActiveTab('roles')}
                    style={{
                        padding: '10px 5px',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'roles' ? '2px solid #0f172a' : '2px solid transparent',
                        fontWeight: activeTab === 'roles' ? '600' : '500',
                        color: activeTab === 'roles' ? '#0f172a' : '#64748b',
                        cursor: 'pointer'
                    }}
                >
                    Role Management
                </button>
            </div>

            <div className="card">

                {/* === USERS TAB === */}
                {activeTab === 'users' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <input type="text" className="form-input" placeholder="Cari user..." style={{ width: '300px' }} />
                            </div>
                            <button className="btn btn-primary" onClick={() => openUserModal()}>
                                <span>+ Tambah User</span>
                            </button>
                        </div>

                        {loadingUsers ? (
                            <div className="text-center p-4">Loading users...</div>
                        ) : errorUsers ? (
                            <div className="text-center p-4 text-red-500">Error: {errorUsers}</div>
                        ) : (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Nama Lengkap</th>
                                            <th>Username / Email</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th className="text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.length > 0 ? (
                                            users.map(user => (
                                                <tr key={user.id}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <div style={{ fontWeight: '600', color: '#1e293b' }}>{user.name}</div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontSize: '0.9em', fontWeight: 'bold' }}>{user.username}</div>
                                                        <div style={{ fontSize: '0.8em', color: '#666' }}>{user.email}</div>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${user.role === 'Super Admin' ? 'badge-info' : 'badge-warning'}`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${user.status === 'Active' ? 'badge-success' : 'badge-error'}`}>
                                                            {user.status}
                                                        </span>
                                                    </td>
                                                    <td className="text-right">
                                                        <button
                                                            className="btn btn-sm btn-outline"
                                                            style={{ marginRight: '8px' }}
                                                            onClick={() => openUserModal(user)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-secondary"
                                                            style={{ color: '#ef4444' }}
                                                            onClick={() => deleteUser(user.id)}
                                                        >
                                                            Hapus
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center p-4">Tidak ada data user</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {/* === ROLES TAB === */}
                {activeTab === 'roles' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                            <button type="button" className="btn btn-primary" onClick={() => openRoleModal()}>
                                <span>+ Tambah Role</span>
                            </button>
                        </div>

                        {loadingRoles ? (
                            <div className="text-center p-4">Loading roles...</div>
                        ) : errorRoles ? (
                            <div className="text-center p-4 text-red-500">Error: {errorRoles}</div>
                        ) : (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Role Name</th>
                                            <th>Description</th>
                                            <th>Permissions</th>
                                            <th className="text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roles.length > 0 ? (
                                            roles.map(role => (
                                                <tr key={role.id}>
                                                    <td style={{ fontWeight: '600' }}>{role.name}</td>
                                                    <td>{role.description}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                                            {role.permissions && role.permissions.map((perm, idx) => (
                                                                <span key={idx} style={{
                                                                    fontSize: '0.75rem',
                                                                    padding: '2px 6px',
                                                                    background: '#f1f5f9',
                                                                    borderRadius: '4px',
                                                                    border: '1px solid #cbd5e1'
                                                                }}>
                                                                    {perm}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="text-right">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline"
                                                            style={{ marginRight: '8px' }}
                                                            onClick={() => openRoleModal(role)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-secondary"
                                                            style={{ color: '#ef4444' }}
                                                            onClick={() => deleteRole(role.id)}
                                                        >
                                                            Hapus
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center p-4">Tidak ada data role</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal for User */}
            {showUserModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '8px',
                        width: '500px',
                        maxWidth: '90%',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                            {editingUser ? 'Edit User' : 'Tambah User Baru'}
                        </h2>

                        <div className="form-group">
                            <label className="form-label">Nama Lengkap</label>
                            <input
                                type="text" name="name" className="form-input"
                                value={userFormData.name} onChange={handleUserFormChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Username (untuk Login)</label>
                            <input
                                type="text" name="username" className="form-input"
                                value={userFormData.username} onChange={handleUserFormChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email" name="email" className="form-input"
                                value={userFormData.email} onChange={handleUserFormChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password {editingUser && '(Kosongkan jika tidak ingin mengubah)'}</label>
                            <input
                                type="password" name="password" className="form-input"
                                value={userFormData.password} onChange={handleUserFormChange}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="form-label">Role</label>
                                <select
                                    name="role" className="form-input"
                                    value={userFormData.role} onChange={handleUserFormChange}
                                >
                                    {roles.map(r => (
                                        <option key={r.id} value={r.name}>{r.name}</option>
                                    ))}
                                    {/* Fallback if roles empty */}
                                    {roles.length === 0 && <option value="User">User</option>}
                                </select>
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="form-label">Status</label>
                                <select
                                    name="status" className="form-input"
                                    value={userFormData.status} onChange={handleUserFormChange}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '2rem' }}>
                            <button className="btn btn-secondary" onClick={closeUserModal}>Batal</button>
                            <button
                                className="btn btn-primary"
                                onClick={saveUser}
                                disabled={isSavingUser}
                            >
                                {isSavingUser ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Role */}
            {showRoleModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '8px',
                        width: '500px',
                        maxWidth: '90%',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                            {editingRole ? 'Edit Role' : 'Tambah Role Baru'}
                        </h2>

                        <div className="form-group">
                            <label className="form-label">Nama Role</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                value={roleFormData.name}
                                onChange={handleRoleFormChange}
                                placeholder="Contoh: Manager"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Deskripsi</label>
                            <textarea
                                name="description"
                                className="form-input"
                                value={roleFormData.description}
                                onChange={handleRoleFormChange}
                                placeholder="Deskripsi role..."
                                rows="3"
                                style={{ fontFamily: 'inherit' }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Hak Akses (Permissions)</label>
                            <div style={{
                                border: '1px solid #e2e8f0',
                                padding: '10px',
                                borderRadius: '6px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                maxHeight: '200px',
                                overflowY: 'auto'
                            }}>
                                {AVAILABLE_PERMISSIONS.map(perm => (
                                    <label key={perm.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={(roleFormData.permissions || []).includes(perm.id)}
                                            onChange={() => handlePermissionChange(perm.id)}
                                        />
                                        <span>{perm.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '2rem' }}>
                            <button className="btn btn-secondary" onClick={closeRoleModal}>Batal</button>
                            <button
                                className="btn btn-primary"
                                onClick={saveRole}
                                disabled={isSavingRole}
                            >
                                {isSavingRole ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PengaturanUsers
