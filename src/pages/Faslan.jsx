import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { read, utils, writeFile } from 'xlsx'

function Faslan({ type }) {
    const [data, setData] = useState([])
    const [title, setTitle] = useState('')
    const fileInputRef = useRef(null)

    // Data loading logic
    useEffect(() => {
        const fetchData = async () => {
            try {
                const endpoint = type === 'tanah' ? 'http://localhost:3001/api/assets/tanah' : 'http://localhost:3001/api/assets/bangunan'
                const response = await fetch(endpoint)
                const result = await response.json()
                setData(result)
            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }

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
        // Define headers matching the import logic
        const headers = [
            'LOKASI KAVLING',
            'NAMA BLOK',
            'NO_BLOK',
            'NAMA DEPAN',
            'NAMA BELAKANG',
            'PANGKAT',
            'NRP/NIP',
            'JABATAN',
            'LUAS(M)',
            'STATUS ASET',
            'FUNGSI BANGUNAN',
            'AREA',
            'LOKASI KOORDINAT',
            'PETA BATAS KAWASAN'
        ];

        // Create dummy data row
        const sampleData = [
            {
                'LOKASI KAVLING': 'PANGKALAN JATI',
                'NAMA BLOK': 'A',
                'NO_BLOK': '1',
                'NAMA DEPAN': 'BUDI',
                'NAMA BELAKANG': 'SANTOSO',
                'PANGKAT': 'KOLONEL',
                'NRP/NIP': '12345/P',
                'JABATAN': 'KADIS',
                'LUAS(M)': '250',
                'STATUS ASET': 'Pinjam Pakai',
                'FUNGSI BANGUNAN': 'Rumah Negara',
                'AREA': 'Jakarta Selatan',
                'LOKASI KOORDINAT': '-6.123, 106.123',
                'PETA BATAS KAWASAN': 'Batas Utara: Jalan A'
            }
        ];

        // Create worksheet
        const ws = utils.json_to_sheet(sampleData, { header: headers });
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Template Import");

        // Download file
        writeFile(wb, "Template_Import_Aset.xlsx");
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
                // Determine Name based on columns present - Supporting "DATABASE KAVLING PINJAM PAKAI"
                let name = row['Nama Bangunan/Komplek Bangunan'] || row['Nama Bangunan'] || 'Tanpa Nama';
                if (row['LOKASI KAVLING']) {
                    const blok = row['NAMA BLOK'] ? ` Blok ${row['NAMA BLOK']}` : '';
                    const no = row['NO_BLOK'] ? ` No ${row['NO_BLOK']}` : '';
                    name = `${row['LOKASI KAVLING']}${blok}${no}`;
                }

                // Determine Occupant Name
                let occupantName = '-';
                if (row['NAMA DEPAN'] || row['NAMA BELAKANG']) {
                    const depan = row['NAMA DEPAN'] || '';
                    const belakang = row['NAMA BELAKANG'] || '';
                    occupantName = `${depan} ${belakang}`.trim();
                }

                return {
                    code: `IMP-${Math.floor(Math.random() * 10000)}`,
                    name: name,
                    category: row['Fungsi Bangunan'] || 'Rumah Negara', // Default assumption for this dataset
                    location: row['Alamat'] || row['LOKASI KAVLING'] || '-',
                    status: row['Status Aset'] || 'Pinjam Pakai', // Default assumption
                    coordinates: row['Lokasi Koordinat'] || '-',
                    luas: row['Luas (m2)'] || row['LUAS(M)'] || row['Luas'] || '0 m²',
                    map_boundary: row['Peta Batas Kawasan'] || '-',
                    area: row['Area'] || 'Jakarta Selatan', // Defaulting as Pangkalan Jati often in Jaksel

                    // New Fields
                    occupant_name: occupantName,
                    occupant_rank: row['PANGKAT'] || '-',
                    occupant_nrp: row['NRP/NIP'] || '-',
                    occupant_title: row['JABATAN'] || '-'
                };
            })

            // Post to backend
            const endpoint = 'http://localhost:3001/api/assets/tanah'

            for (const item of formattedData) {
                await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(item)
                })
            }

            // Refresh data
            const response = await fetch(endpoint)
            const result = await response.json()
            setData(result)

            alert(`Berhasil mengimport ${formattedData.length} data ke database!`)
        } catch (error) {
            console.error('Error importing file:', error)
            alert('Gagal mengimport file. Pastikan format sesuai.')
        }

        // Reset input
        e.target.value = null
    }

    const stats = type === 'tanah' ? [
        { label: 'Total Aset Tanah', value: data.length.toString(), color: 'var(--navy-primary)' },
        { label: 'Luas Total', value: '9,000 m²', color: 'var(--success)' },
        { label: 'Pinjam Pakai', value: data.filter(i => i.status === 'Pinjam Pakai').length.toString(), color: 'var(--info)' },
        { label: 'Tanah Cadangan', value: '1', color: 'var(--warning)' }
    ] : [
        { label: 'Total Bangunan', value: data.length.toString(), color: 'var(--navy-primary)' },
        { label: 'Kondisi Baik', value: '3', color: 'var(--success)' },
        { label: 'Perlu Rehab', value: '1', color: 'var(--warning)' },
        { label: 'Rusak Berat', value: '0', color: 'var(--error)' }
    ]

    return (
        <div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xlsx, .xls"
                style={{ display: 'none' }}
            />

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
                            <button className="btn btn-outline" onClick={handleImportClick}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                Import Excel
                            </button>
                            <button className="btn btn-outline" onClick={handleDownloadTemplate} title="Download Template Excel">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                Template
                            </button>
                        </>
                    )}

                    <button className="btn btn-outline">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                        </svg>
                        Export Data
                    </button>
                </div>
                <div className="flex gap-sm">
                    <input
                        type="text"
                        className="form-input"
                        placeholder={`Cari aset ${type}...`}
                        style={{ width: '250px' }}
                    />
                </div>
            </div>

            {/* Assets Table */}
            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Kode</th>
                                <th>{type === 'tanah' ? 'Nama Bangunan/Komplek' : 'Nama Aset'}</th>
                                <th>{type === 'tanah' ? 'Fungsi Bangunan' : 'Kategori'}</th>
                                {type === 'tanah' && <th>Penghuni</th>}
                                <th>{type === 'tanah' ? 'Alamat' : 'Lokasi'}</th>
                                {type === 'tanah' && <th>Area</th>}
                                <th>Luas</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((asset) => (
                                <tr key={asset.id}>
                                    <td><strong>{asset.code}</strong></td>
                                    <td>
                                        {asset.name}
                                        {asset.occupant_rank && asset.occupant_rank !== '-' && (
                                            <div style={{ fontSize: '11px', color: '#666' }}>
                                                Blok: {asset.name.split('Blok')[1] || '-'}
                                            </div>
                                        )}
                                    </td>
                                    <td>{asset.category}</td>
                                    {type === 'tanah' && (
                                        <td>
                                            {asset.occupant_name && asset.occupant_name !== '-' ? (
                                                <div>
                                                    <div className="font-medium">{asset.occupant_name}</div>
                                                    <div style={{ fontSize: '11px', color: '#666' }}>
                                                        {asset.occupant_rank} - {asset.occupant_nrp}
                                                    </div>
                                                </div>
                                            ) : '-'}
                                        </td>
                                    )}
                                    <td>{type === 'tanah' ? asset.location : asset.location}</td>
                                    {type === 'tanah' && <td>{asset.area || '-'}</td>}
                                    <td>{asset.luas}</td>
                                    <td>
                                        <span className={`badge ${asset.status === 'Aktif' || asset.status === 'Baik' ? 'badge-success' :
                                            asset.status === 'Siap Bangun' ? 'badge-info' :
                                                'badge-warning'
                                            }`}>
                                            {asset.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-sm">
                                            <button className="btn btn-sm btn-outline">Edit</button>
                                            <button className="btn btn-sm btn-secondary">Detail</button>
                                        </div>
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

Faslan.propTypes = {
    type: PropTypes.string.isRequired
}

export default Faslan
