import { useState } from 'react'

function PengaturanRoles() {
    const [roles, setRoles] = useState([
        { id: 1, name: 'Super Admin', description: 'Akses penuh ke seluruh fitur sistem', usersCount: 2 },
        { id: 2, name: 'Operator', description: 'Dapat mengelola data namun terbatas pada modul tertentu', usersCount: 5 },
        { id: 3, name: 'Viewer', description: 'Hanya dapat melihat data dashboard dan peta', usersCount: 12 },
    ])

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Role Management</h1>
                <p className="page-subtitle">Pengaturan peran dan izin akses pengguna</p>
            </div>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <input type="text" className="form-input" placeholder="Cari role..." style={{ width: '300px' }} />
                    </div>
                    <button className="btn btn-primary">
                        <span>+ Tambah Role</span>
                    </button>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Nama Role</th>
                                <th>Deskripsi</th>
                                <th>Jumlah User</th>
                                <th className="text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map(role => (
                                <tr key={role.id}>
                                    <td>
                                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{role.name}</div>
                                    </td>
                                    <td>{role.description}</td>
                                    <td>{role.usersCount} User</td>
                                    <td className="text-right">
                                        <button className="btn btn-sm btn-outline" style={{ marginRight: '8px' }}>Permission</button>
                                        <button className="btn btn-sm btn-secondary" style={{ marginRight: '8px' }}>Edit</button>
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

export default PengaturanRoles
