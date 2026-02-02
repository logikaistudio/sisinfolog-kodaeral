import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { read, utils, writeFile } from 'xlsx'

function Faslan({ type }) {
    const [data, setData] = useState([])
    const [title, setTitle] = useState('')
    const [selectedAsset, setSelectedAsset] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const fileInputRef = useRef(null)

    // Data loading logic
    const fetchData = async () => {
        try {
            const endpoint = type === 'tanah' ? '/api/assets/tanah' : '/api/assets/bangunan'
            const finalEndpoint = import.meta.env.PROD ? endpoint : `http://localhost:3001${endpoint}`

            const response = await fetch(finalEndpoint)
            const result = await response.json()
            setData(result)
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }

    useEffect(() => {
        fetchData()

        if (type === 'tanah') {
            setTitle('Fasilitas Pangkalan - Aset Tanah')
        } else {
            setTitle('Fasilitas Pangkalan - Aset Bangunan')
        }
    }, [type])

    const handleImportClick = () => {
        fileInputRef.current.click()
    }

    const handleDownloadTemplate = () => {
        const headers = [
            'LOKASI KAVLING', 'NAMA BLOK', 'NO_BLOK', 'NAMA DEPAN', 'NAMA BELAKANG',
            'PANGKAT', 'NRP/NIP', 'JABATAN', 'LUAS(M)', 'STATUS ASET',
            'FUNGSI BANGUNAN', 'AREA', 'LOKASI KOORDINAT', 'PETA BATAS KAWASAN'
        ];

        const sampleData = [{
            'LOKASI KAVLING': 'PANGKALAN JATI', 'NAMA BLOK': 'A', 'NO_BLOK': '1',
            'NAMA DEPAN': 'BUDI', 'NAMA BELAKANG': 'SANTOSO', 'PANGKAT': 'KOLONEL',
            'NRP/NIP': '12345/P', 'JABATAN': 'KADIS', 'LUAS(M)': '250',
            'STATUS ASET': 'Pinjam Pakai', 'FUNGSI BANGUNAN': 'Rumah Negara',
            'AREA': 'Jakarta Selatan', 'LOKASI KOORDINAT': '-6.123, 106.123',
            'PETA BATAS KAWASAN': 'Batas Utara: Jalan A'
        }];

        const ws = utils.json_to_sheet(sampleData, { header: headers });
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Template Import");
        writeFile(wb, "Template_Import_Aset.xls", { bookType: 'xls' });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        try {
            const data = await file.arrayBuffer()
            const workbook = read(data)
            const worksheet = workbook.Sheets[workbook.SheetNames[0]]
            const jsonData = utils.sheet_to_json(worksheet)

            const formattedData = jsonData.map((row) => {
                let name = row['LOKASI KAVLING'] || row['Nama Bangunan/Komplek Bangunan'] || row['Nama Bangunan'] || 'Tanpa Nama';
                let address = row['Alamat'] || '-';
                if (row['NAMA BLOK'] || row['NO_BLOK']) {
                    const blok = row['NAMA BLOK'] ? `Blok ${row['NAMA BLOK']}` : '';
                    const no = row['NO_BLOK'] ? `No. ${row['NO_BLOK']}` : '';
                    address = `${blok} ${no}`.trim();
                }
                let occupantName = '-';
                if (row['NAMA DEPAN'] || row['NAMA BELAKANG']) {
                    occupantName = `${row['NAMA DEPAN'] || ''} ${row['NAMA BELAKANG'] || ''}`.trim();
                }
                let luas = row['LUAS(M)'] || row['Luas (m2)'] || row['Luas'] || '0';
                if (!String(luas).includes('m²')) luas = `${luas} m²`;

                return {
                    code: `IMP-${Math.floor(Math.random() * 10000)}`,
                    name: name,
                    category: row['Fungsi Bangunan'] || 'Rumah Negara',
                    location: address,
                    status: row['Status Aset'] || 'Pinjam Pakai',
                    coordinates: row['LOKASI KOORDINAT'] || row['Lokasi Koordinat'] || '-',
                    luas: luas,
                    map_boundary: row['Peta Batas Kawasan'] || '-',
                    area: row['AREA'] || row['Area'] || 'Jakarta Selatan',
                    occupant_name: occupantName,
                    occupant_rank: row['PANGKAT'] || '-',
                    occupant_nrp: row['NRP/NIP'] || '-',
                    occupant_title: row['JABATAN'] || '-'
                };
            })

            const endpoint = import.meta.env.PROD ? '/api/assets/tanah' : 'http://localhost:3001/api/assets/tanah'
            for (const item of formattedData) {
                await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item)
                })
            }

            fetchData()
            alert(`Berhasil mengimport ${formattedData.length} data ke database!`)
        } catch (error) {
            console.error('Error importing file:', error)
            alert('Gagal mengimport file. Pastikan format sesuai.')
        }
        e.target.value = null
    }

    // --- Modal Logic ---
    const openModal = (asset) => {
        setSelectedAsset(asset)
        setIsEditing(false)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedAsset(null)
    }

    const handleDelete = async () => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
        try {
            const endpoint = import.meta.env.PROD ? `/api/assets/tanah/${selectedAsset.id}` : `http://localhost:3001/api/assets/tanah/${selectedAsset.id}`;
            await fetch(endpoint, { method: 'DELETE' });
            alert('Data berhasil dihapus');
            closeModal();
            fetchData();
        } catch (error) {
            console.error('Error deleting asset:', error);
            alert('Gagal menghapus data');
        }
    }

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const endpoint = import.meta.env.PROD ? `/api/assets/tanah/${selectedAsset.id}` : `http://localhost:3001/api/assets/tanah/${selectedAsset.id}`;
            await fetch(endpoint, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedAsset)
            });
            alert('Data berhasil diupdate');
            setIsEditing(false);
            fetchData();
        } catch (error) {
            console.error('Error updating asset:', error);
            alert('Gagal mengupdate data');
        }
    }

    const stats = type === 'tanah' ? [
        { label: 'Total Aset Tanah', value: data.length.toString(), color: 'var(--navy-primary)' },
        { label: 'Luas Total', value: '9,000 m²', color: 'var(--success)' },
        { label: 'Pinjam Pakai', value: data.filter(i => i.status === 'Pinjam Pakai').length.toString(), color: 'var(--info)' },
        { label: 'Tanah Cadangan', value: '1', color: 'var(--warning)' }
    ] : []

    return (
        <div>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls" style={{ display: 'none' }} />

            {/* Page Header */}
            <div className="page-header">
                <h1 className="page-title">{title}</h1>
                <p className="page-subtitle">Manajemen data aset {type} di lingkungan Kodaeral 3 Jakarta</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
                        <div className="stat-label">{stat.label}</div>
                        <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mb-lg">
                <div className="flex gap-md">
                    <button className="btn btn-primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Tambah {type === 'tanah' ? 'Tanah' : 'Bangunan'}
                    </button>
                    {type === 'tanah' && (
                        <>
                            <button className="btn btn-outline" onClick={handleImportClick}>Import Excel</button>
                            <button className="btn btn-outline" onClick={handleDownloadTemplate}>Template (.xls)</button>
                        </>
                    )}
                    <button className="btn btn-outline">Export Data</button>
                </div>
            </div>

            {/* Assets Table */}
            <div className="card">
                <div className="table-container">
                    <table className="table table-compact" style={{ fontSize: '0.85rem' }}>
                        <thead>
                            <tr>
                                <th>Kode</th>
                                <th>{type === 'tanah' ? 'Nama Bangunan/Komplek' : 'Nama Aset'}</th>
                                <th>{type === 'tanah' ? 'Fungsi Bangunan' : 'Kategori'}</th>
                                {type === 'tanah' && <th>Penghuni</th>}
                                <th>{type === 'tanah' ? 'Alamat' : 'Lokasi'}</th>
                                {type === 'tanah' && <th>Area</th>}
                                {type === 'tanah' && <th>Koordinat</th>}
                                <th>Luas</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((asset) => (
                                <tr key={asset.id} onClick={() => openModal(asset)} style={{ cursor: 'pointer' }} className="hover:bg-gray-50">
                                    <td><strong>{asset.code}</strong></td>
                                    <td>{asset.name}</td>
                                    <td>{asset.category}</td>
                                    {type === 'tanah' && (
                                        <td>
                                            {asset.occupant_name && asset.occupant_name !== '-' ? (
                                                <div>
                                                    <div className="font-medium">{asset.occupant_name}</div>
                                                    <div style={{ fontSize: '10px', color: '#666' }}>{asset.occupant_rank}</div>
                                                </div>
                                            ) : '-'}
                                        </td>
                                    )}
                                    <td>{asset.location}</td>
                                    {type === 'tanah' && <td>{asset.area || '-'}</td>}
                                    {type === 'tanah' && <td style={{ fontSize: '10px', fontFamily: 'monospace' }}>{asset.coordinates || '-'}</td>}
                                    <td>{asset.luas}</td>
                                    <td>
                                        <span className={`badge ${asset.status === 'Aktif' || asset.status === 'Baik' ? 'badge-success' : 'badge-warning'}`}>
                                            {asset.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail/Edit Modal */}
            {isModalOpen && selectedAsset && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h2 className="text-xl font-bold">{isEditing ? 'Edit Data Aset' : 'Detail Aset Tanah'}</h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleUpdate} className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700">Kode</label><input type="text" className="form-input w-full" value={selectedAsset.code} onChange={e => setSelectedAsset({ ...selectedAsset, code: e.target.value })} /></div>
                                <div><label className="block text-sm font-medium text-gray-700">Nama Bangunan/Komplek</label><input type="text" className="form-input w-full" value={selectedAsset.name} onChange={e => setSelectedAsset({ ...selectedAsset, name: e.target.value })} /></div>
                                <div><label className="block text-sm font-medium text-gray-700">Fungsi Bangunan</label><input type="text" className="form-input w-full" value={selectedAsset.category} onChange={e => setSelectedAsset({ ...selectedAsset, category: e.target.value })} /></div>
                                <div><label className="block text-sm font-medium text-gray-700">Status</label><input type="text" className="form-input w-full" value={selectedAsset.status} onChange={e => setSelectedAsset({ ...selectedAsset, status: e.target.value })} /></div>

                                <div className="col-span-2 mt-2 font-semibold text-gray-800 border-b pb-1">Data Penghuni</div>
                                <div><label className="block text-sm font-medium text-gray-700">Nama Penghuni</label><input type="text" className="form-input w-full" value={selectedAsset.occupant_name} onChange={e => setSelectedAsset({ ...selectedAsset, occupant_name: e.target.value })} /></div>
                                <div><label className="block text-sm font-medium text-gray-700">Pangkat</label><input type="text" className="form-input w-full" value={selectedAsset.occupant_rank} onChange={e => setSelectedAsset({ ...selectedAsset, occupant_rank: e.target.value })} /></div>
                                <div><label className="block text-sm font-medium text-gray-700">NRP</label><input type="text" className="form-input w-full" value={selectedAsset.occupant_nrp} onChange={e => setSelectedAsset({ ...selectedAsset, occupant_nrp: e.target.value })} /></div>
                                <div><label className="block text-sm font-medium text-gray-700">Jabatan</label><input type="text" className="form-input w-full" value={selectedAsset.occupant_title} onChange={e => setSelectedAsset({ ...selectedAsset, occupant_title: e.target.value })} /></div>

                                <div className="col-span-2 mt-2 font-semibold text-gray-800 border-b pb-1">Lokasi & Fisik</div>
                                <div><label className="block text-sm font-medium text-gray-700">Alamat</label><input type="text" className="form-input w-full" value={selectedAsset.location} onChange={e => setSelectedAsset({ ...selectedAsset, location: e.target.value })} /></div>
                                <div><label className="block text-sm font-medium text-gray-700">Area</label><input type="text" className="form-input w-full" value={selectedAsset.area} onChange={e => setSelectedAsset({ ...selectedAsset, area: e.target.value })} /></div>
                                <div><label className="block text-sm font-medium text-gray-700">Luas</label><input type="text" className="form-input w-full" value={selectedAsset.luas} onChange={e => setSelectedAsset({ ...selectedAsset, luas: e.target.value })} /></div>
                                <div><label className="block text-sm font-medium text-gray-700">Koordinat</label><input type="text" className="form-input w-full" value={selectedAsset.coordinates} onChange={e => setSelectedAsset({ ...selectedAsset, coordinates: e.target.value })} /></div>

                                <div className="col-span-2 flex justify-end gap-2 mt-4">
                                    <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline">Batal</button>
                                    <button type="submit" className="btn btn-primary">Simpan Perubahan</button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><span className="text-xs text-gray-500 block">Kode Aset</span><span className="font-semibold">{selectedAsset.code}</span></div>
                                    <div><span className="text-xs text-gray-500 block">Nama Bangunan/Komplek</span><span className="font-semibold">{selectedAsset.name}</span></div>
                                    <div><span className="text-xs text-gray-500 block">Fungsi</span><span className="font-semibold">{selectedAsset.category}</span></div>
                                    <div><span className="text-xs text-gray-500 block">Status</span><span className={`badge ${selectedAsset.status === 'Aktif' ? 'badge-success' : 'badge-warning'}`}>{selectedAsset.status}</span></div>
                                </div>

                                <div className="border-t pt-2">
                                    <h3 className="font-bold text-gray-700 mb-2">Penghuni</h3>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>Nama: <strong>{selectedAsset.occupant_name}</strong></div>
                                        <div>Pangkat: <strong>{selectedAsset.occupant_rank}</strong></div>
                                        <div>NRP: <strong>{selectedAsset.occupant_nrp}</strong></div>
                                        <div>Jabatan: <strong>{selectedAsset.occupant_title}</strong></div>
                                    </div>
                                </div>

                                <div className="border-t pt-2">
                                    <h3 className="font-bold text-gray-700 mb-2">Lokasi & Fisik</h3>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>Alamat: <strong>{selectedAsset.location}</strong></div>
                                        <div>Area: <strong>{selectedAsset.area}</strong></div>
                                        <div>Luas Tanah: <strong>{selectedAsset.luas}</strong></div>
                                        <div>Koordinat: <code className="bg-gray-100 px-1 rounded">{selectedAsset.coordinates}</code></div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                                    <button onClick={handleDelete} className="text-red-600 hover:text-red-800 text-sm font-semibold flex items-center gap-1">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                                        Hapus Data
                                    </button>
                                    <div className="flex gap-2">
                                        <button onClick={closeModal} className="btn btn-outline">Tutup</button>
                                        <button onClick={() => setIsEditing(true)} className="btn btn-primary">Edit Data</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

Faslan.propTypes = {
    type: PropTypes.string.isRequired
}

export default Faslan
