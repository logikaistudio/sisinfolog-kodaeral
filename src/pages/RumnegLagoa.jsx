import { useState, useEffect } from 'react';

function RumnegLagoa() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Editor State
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    // --- FETCH DATA ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/assets/rumneg');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result = await response.json();

            // FILTER ONLY LAGOA DATA
            // Checks if 'area' or 'alamat_detail' contains 'lagoa' (case insensitive)
            const lagoaData = Array.isArray(result) ? result.filter(item => {
                const area = (item.area || '').toLowerCase();
                const alamat = (item.alamat_detail || '').toLowerCase();
                return area.includes('lagoa') || alamat.includes('lagoa');
            }) : [];

            setData(lagoaData);
        } catch (error) {
            console.error('Error fetching data:', error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- STATS CALCULATION ---
    const stats = {
        total: data.length,
        // Status Penghuni
        aktif: data.filter(d => (d.status_penghuni || '').toLowerCase().includes('aktif') || (d.status_penghuni || '').toLowerCase().includes('dinas')).length,
        anak: data.filter(d => (d.status_penghuni || '').toLowerCase().includes('anak')).length,
        wara: data.filter(d => (d.status_penghuni || '').toLowerCase().includes('wara')).length,
        purn: data.filter(d => (d.status_penghuni || '').toLowerCase().includes('purn')).length,
        // Kondisi
        baik: data.filter(d => (d.kondisi || '').toLowerCase() === 'baik').length,
        rusakRingan: data.filter(d => (d.kondisi || '').toLowerCase().includes('ringan')).length,
        rusakBerat: data.filter(d => (d.kondisi || '').toLowerCase().includes('berat')).length,
    };

    // --- EDITOR LOGIC ---
    const handleRowClick = (item) => {
        setCurrentItem({ ...item });
        setIsEditorOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = `/api/assets/rumneg/${currentItem.id}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentItem)
            });

            if (response.ok) {
                setIsEditorOpen(false);
                fetchData(); // Refresh data to reflect changes
                alert('Data berhasil diperbarui');
            } else {
                alert('Gagal menyimpan data');
            }
        } catch (error) {
            console.error('Error saving:', error);
            alert('Terjadi kesalahan saat menyimpan');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setCurrentItem({ ...currentItem, [field]: value });
    };

    return (
        <div className="fade-in">
            {/* Header */}
            <div className="page-header" style={{ marginBottom: '24px' }}>
                <div>
                    <h1 className="page-title">Aset Rumah Negara - Lagoa</h1>
                    <p className="page-subtitle">Monitoring dan Data Penghuni Komplek Lagoa</p>
                </div>
            </div>

            {/* SUMMARY BOXES */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>

                {/* Box 1: Total Penghuni */}
                <div className="card" style={{ padding: '20px', borderLeft: '5px solid #3b82f6', background: 'linear-gradient(to right, #eff6ff, white)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>Total Penghuni</div>
                            <div style={{ color: '#1e293b', fontSize: '2rem', fontWeight: '800' }}>{stats.total}</div>
                        </div>
                        <div style={{ fontSize: '2.5rem', opacity: 0.2 }}>👥</div>
                    </div>
                </div>

                {/* Box 2: Detail Status Penghuni */}
                <div className="card" style={{ padding: '16px', borderLeft: '5px solid #8b5cf6' }}>
                    <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>Status Penghuni</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span style={{ color: '#475569' }}>Aktif/Dinas:</span>
                            <span style={{ fontWeight: '700', color: '#8b5cf6' }}>{stats.aktif}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span style={{ color: '#475569' }}>Purnawirawan:</span>
                            <span style={{ fontWeight: '700', color: '#64748b' }}>{stats.purn}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span style={{ color: '#475569' }}>Warakawuri:</span>
                            <span style={{ fontWeight: '700', color: '#ec4899' }}>{stats.wara}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span style={{ color: '#475569' }}>Anak/Yatim:</span>
                            <span style={{ fontWeight: '700', color: '#f59e0b' }}>{stats.anak}</span>
                        </div>
                    </div>
                </div>

                {/* Box 3: Kondisi Bangunan */}
                <div className="card" style={{ padding: '16px', borderLeft: '5px solid #10b981' }}>
                    <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>Kondisi Bangunan</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                            <span style={{ fontSize: '0.85rem', flex: 1 }}>Baik</span>
                            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{stats.baik}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></div>
                            <span style={{ fontSize: '0.85rem', flex: 1 }}>Rusak Ringan</span>
                            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{stats.rusakRingan}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div>
                            <span style={{ fontSize: '0.85rem', flex: 1 }}>Rusak Berat</span>
                            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{stats.rusakBerat}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* TABLE LIST */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', height: '40px' }}>
                            <th style={{ padding: '0 16px', textAlign: 'left', width: '50px', color: '#64748b' }}>No</th>
                            <th style={{ padding: '0 16px', textAlign: 'left', color: '#475569' }}>Nama Penghuni</th>
                            <th style={{ padding: '0 16px', textAlign: 'left', color: '#475569' }}>Alamat</th>
                            <th style={{ padding: '0 16px', textAlign: 'center', width: '100px', color: '#475569' }}>Tipe</th>
                            <th style={{ padding: '0 16px', textAlign: 'center', width: '120px', color: '#475569' }}>Kondisi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && data.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>Memuat data...</td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>Tidak ada data untuk area Lagoa</td></tr>
                        ) : (
                            data.map((row, index) => (
                                <tr
                                    key={row.id}
                                    onClick={() => handleRowClick(row)}
                                    style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', height: '44px', transition: 'background 0.15s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                >
                                    <td style={{ padding: '0 16px', color: '#94a3b8' }}>{index + 1}</td>
                                    <td style={{ padding: '0 16px' }}>
                                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{row.occupant_name || '-'}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{row.occupant_rank} {row.occupant_nrp ? `(${row.occupant_nrp})` : ''}</div>
                                    </td>
                                    <td style={{ padding: '0 16px', color: '#334155' }}>{row.alamat_detail || '-'}</td>
                                    <td style={{ padding: '0 16px', textAlign: 'center', color: '#475569' }}>{row.tipe_rumah || '-'}</td>
                                    <td style={{ padding: '0 16px', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                                            background: row.kondisi?.toLowerCase() === 'baik' ? '#dcfce7' :
                                                row.kondisi?.toLowerCase().includes('rusak') ? '#fee2e2' : '#f1f5f9',
                                            color: row.kondisi?.toLowerCase() === 'baik' ? '#166534' :
                                                row.kondisi?.toLowerCase().includes('rusak') ? '#991b1b' : '#64748b'
                                        }}>
                                            {row.kondisi || '-'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* SIMPLE EDITOR MODAL */}
            {isEditorOpen && currentItem && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }} onClick={() => setIsEditorOpen(false)}>
                    <div className="card" style={{ width: '500px', padding: '24px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Edit Data Penghuni</h2>
                            <button onClick={() => setIsEditorOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
                        </div>

                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '6px', color: '#475569' }}>Nama Penghuni</label>
                                <input
                                    value={currentItem.occupant_name || ''}
                                    onChange={(e) => handleInputChange('occupant_name', e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '6px', color: '#475569' }}>Pangkat / NRP</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        placeholder="Pangkat"
                                        value={currentItem.occupant_rank || ''}
                                        onChange={(e) => handleInputChange('occupant_rank', e.target.value)}
                                        style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                    />
                                    <input
                                        placeholder="NRP"
                                        value={currentItem.occupant_nrp || ''}
                                        onChange={(e) => handleInputChange('occupant_nrp', e.target.value)}
                                        style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '6px', color: '#475569' }}>Status Penghuni</label>
                                <select
                                    value={currentItem.status_penghuni || ''}
                                    onChange={(e) => handleInputChange('status_penghuni', e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                >
                                    <option value="">- Pilih Status -</option>
                                    <option value="Aktif">Aktif / Dinas</option>
                                    <option value="Purnawirawan">Purnawirawan</option>
                                    <option value="Warakawuri">Warakawuri</option>
                                    <option value="Anak Yatim">Anak Yatim / Dewasa</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '6px', color: '#475569' }}>Kondisi Bangunan</label>
                                <select
                                    value={currentItem.kondisi || ''}
                                    onChange={(e) => handleInputChange('kondisi', e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                >
                                    <option value="">- Pilih Kondisi -</option>
                                    <option value="Baik">Baik</option>
                                    <option value="Rusak Ringan">Rusak Ringan</option>
                                    <option value="Rusak Berat">Rusak Berat</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setIsEditorOpen(false)} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#f1f5f9', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>Batal</button>
                                <button type="submit" style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#3b82f6', fontWeight: '600', color: 'white', cursor: 'pointer' }}>Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RumnegLagoa;
