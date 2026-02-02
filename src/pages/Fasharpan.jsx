import React from 'react'

function Fasharpan() {
    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Fasharpan (Fasilitas Pemeliharaan & Perbaikan)</h1>
                <p className="page-subtitle">Data KRI, KAL, KAMLA dan fasilitas pemeliharaan</p>
            </div>

            <div className="card text-center" style={{ padding: '60px 20px' }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>🛠️</div>
                <h2>Modul Fasharpan</h2>
                <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto' }}>
                    Modul ini sebelumnya "Harpan". Fitur monitoring status KRI/KAL/KAMLA dan jadwal pemeliharaan akan tersedia di sini.
                </p>
            </div>
        </div>
    )
}

export default Fasharpan
