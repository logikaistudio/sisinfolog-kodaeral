import React from 'react'

function Satharkan() {
    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Satharkan (Satuan Pemeliharaan Pangkalan)</h1>
                <p className="page-subtitle">Manajemen kegiatan pemeliharaan pangkalan</p>
            </div>

            <div className="card text-center" style={{ padding: '60px 20px' }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏗️</div>
                <h2>Modul Satharkan</h2>
                <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto' }}>
                    Menu ini berisi penjadwalan, monitoring, dan pelaporan kegiatan pemeliharaan fasilitas pangkalan.
                </p>
            </div>
        </div>
    )
}

export default Satharkan
