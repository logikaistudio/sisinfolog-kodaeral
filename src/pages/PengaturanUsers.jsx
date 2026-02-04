import { useState, useEffect } from 'react'

function PengaturanUsers() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Gunakan URL default jika di local, atau sesuaikan dengan env
                const response = await fetch('http://localhost:3001/api/users');
                if (!response.ok) throw new Error('Gagal mengambil data user');
                const data = await response.json();
                setUsers(data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleAddUser = () => {
        alert('Fitur tambah user akan diimplementasikan dengan API endpoint yang baru dibuat.');
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Akses Masuk (Users)</h1>
                <p className="page-subtitle">Manajemen pengguna dan hak akses aplikasi</p>
            </div>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <input type="text" className="form-input" placeholder="Cari user..." style={{ width: '300px' }} />
                    </div>
                    <button className="btn btn-primary" onClick={handleAddUser}>
                        <span>+ Tambah User</span>
                    </button>
                </div>

                {loading ? (
                    <div className="text-center p-4">Loading users...</div>
                ) : error ? (
                    <div className="text-center p-4 text-red-500">Error: {error}</div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Nama Lengkap</th>
                                    <th>Email</th>
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
                                                    {user.avatar && (
                                                        <img
                                                            src={user.avatar}
                                                            alt="avatar"
                                                            style={{ width: '30px', height: '30px', borderRadius: '50%' }}
                                                        />
                                                    )}
                                                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{user.name}</div>
                                                </div>
                                            </td>
                                            <td>{user.email}</td>
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
                                                <button className="btn btn-sm btn-outline" style={{ marginRight: '8px' }}>Edit</button>
                                                <button className="btn btn-sm btn-secondary" style={{ color: '#ef4444' }}>Hapus</button>
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
            </div>
        </div>
    )
}

export default PengaturanUsers
