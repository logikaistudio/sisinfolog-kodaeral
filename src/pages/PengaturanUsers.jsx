import { useState } from 'react'

function PengaturanUsers() {
    const [users, setUsers] = useState([
        { id: 1, name: 'Admin Utama', email: 'admin@kodaeral.mil.id', role: 'Super Admin', status: 'Active' },
        { id: 2, name: 'Operator Faslan', email: 'faslan@kodaeral.mil.id', role: 'Operator', status: 'Active' },
        { id: 3, name: 'Komandan Satgas', email: 'dansatgas@kodaeral.mil.id', role: 'Viewer', status: 'Inactive' },
    ])

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
                    <button className="btn btn-primary">
                        <span>+ Tambah User</span>
                    </button>
                </div>

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
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>
                                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{user.name}</div>
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default PengaturanUsers
