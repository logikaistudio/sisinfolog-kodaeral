import { useState, useRef, useEffect } from 'react'
import * as XLSX_Module from 'xlsx/xlsx.mjs'

// Fallback logic
const XLSX = XLSX_Module && XLSX_Module.read ? XLSX_Module : window.XLSX

const FONT_SYSTEM = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

function Faslabuh() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedItem, setSelectedItem] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const fileInputRef = useRef(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/faslabuh')
            if (!response.ok) throw new Error('Failed to fetch')
            const result = await response.json()
            setData(result)
        } catch (error) {
            console.error('Error:', error)
            alert('❌ Gagal memuat data')
        } finally {
            setLoading(false)
        }
    }

    const handleAddNew = () => {
        setSelectedItem({
            lantamal: '', lanal_faslan: '', lokasi_dermaga: '', nama_dermaga: '', jenis_dermaga: '',
            panjang_m: 0, lebar_m: 0, kedalaman_m: 0, luas_m2: 0, konstruksi: '', tahun_pembangunan: null,
            kapasitas_kapal: '', tonase_max: 0, jumlah_tambat: 0, panjang_tambat_m: 0,
            kondisi_dermaga: 'Baik', kondisi_lantai: 'Baik', kondisi_dinding: 'Baik', kondisi_fender: 'Baik',
            bollard: 0, fender: 0, tangga_kapal: 0, lampu_dermaga: 0,
            air_bersih: false, listrik: false, bbm: false, crane: false,
            elevasi_m: 0, draft_m: 0, lebar_apron_m: 0, panjang_apron_m: 0,
            fungsi_dermaga: '', keterangan: '', status_operasional: 'Aktif',
            longitude: null, latitude: null
        })
        setIsEditMode(true)
        setIsModalOpen(true)
    }

    const handleRowClick = (item) => {
        setSelectedItem({ ...item })
        setIsEditMode(false)
        setIsModalOpen(true)
    }

    const handleEdit = () => {
        setIsEditMode(true)
    }

    const handleSave = async (e) => {
        e.preventDefault()
        try {
            const isNew = !selectedItem.id
            const url = isNew ? '/api/faslabuh' : `/api/faslabuh/${selectedItem.id}`
            const method = isNew ? 'POST' : 'PUT'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedItem)
            })

            if (!response.ok) throw new Error('Failed to save')
            alert('✅ Data berhasil disimpan!')
            setIsModalOpen(false)
            fetchData()
        } catch (error) {
            console.error('Error:', error)
            alert('❌ Gagal menyimpan: ' + error.message)
        }
    }

    const handleDelete = async () => {
        if (!confirm('⚠️ Yakin ingin menghapus?')) return
        try {
            const response = await fetch(`/api/faslabuh/${selectedItem.id}`, { method: 'DELETE' })
            if (!response.ok) throw new Error('Failed to delete')
            alert('✅ Data berhasil dihapus!')
            setIsModalOpen(false)
            fetchData()
        } catch (error) {
            alert('❌ Gagal menghapus: ' + error.message)
        }
    }

    const handleExportTemplate = () => {
        window.open('/Template_Import_Faslabuh.xlsx', '_blank')
    }

    const handleImport = (e) => {
        console.log('Import started')
        const file = e.target.files[0]
        if (!file) {
            console.log('No file selected')
            return
        }

        console.log('File selected:', file.name)

        // Check local XLSX availability if needed, but assuming import works
        if (typeof XLSX === 'undefined') {
            console.error('XLSX library is undefined!')
            alert('Library Excel tidak dimuat. Silakan refresh halaman.')
            return
        }

        const reader = new FileReader()

        reader.onerror = (err) => {
            console.error('FileReader error:', err)
            alert('Gagal membaca file')
        }

        reader.onload = async (event) => {
            console.log('File read success, parsing...')
            try {
                const data = new Uint8Array(event.target.result)
                const wb = XLSX.read(data, { type: 'array' })

                if (!wb.SheetNames.length) {
                    throw new Error('Excel file is empty')
                }

                const ws = wb.Sheets[wb.SheetNames[0]]
                const jsonData = XLSX.utils.sheet_to_json(ws)
                console.log('Parsed rows:', jsonData.length)

                if (jsonData.length === 0) {
                    alert('File Excel kosong atau tidak ada data.')
                    return
                }

                // Helper to find value case-insensitive and with aliases
                const getValue = (row, keys) => {
                    const rowKeys = Object.keys(row)
                    for (const key of keys) {
                        // Exact match
                        if (row[key] !== undefined) return row[key]

                        // Case insensitive match
                        const foundKey = rowKeys.find(k => k.trim().toLowerCase() === key.toLowerCase())
                        if (foundKey) return row[foundKey]
                    }
                    // Try partial match for complex keys if not found
                    for (const key of keys) {
                        const foundKey = rowKeys.find(k => k.toLowerCase().includes(key.toLowerCase()))
                        if (foundKey) return row[foundKey]
                    }
                    return undefined
                }

                // State for merged cells (fill down)
                let lastLantamal = ''
                let lastFaslan = ''

                // Map Excel to database fields
                const mappedData = jsonData.map((row, i) => {
                    if (i === 0) console.log('First row sample:', row)

                    // Handle merged cells (fill down)
                    const rawLantamal = getValue(row, ['LOKASI', 'Lantamal'])
                    if (rawLantamal) lastLantamal = rawLantamal

                    const rawFaslan = getValue(row, ['WILAYAH', 'Lanal', 'Faslan', 'Satker'])
                    if (rawFaslan) lastFaslan = rawFaslan

                    return {
                        lantamal: lastLantamal || '',
                        lanal_faslan: lastFaslan || '',
                        lokasi_dermaga: getValue(row, ['Alamat', 'Lokasi Dermaga']) || '',
                        nama_dermaga: getValue(row, ['NAMA DERMAGA', 'Nama Dermaga', 'Nama']) || 'Tanpa Nama',
                        jenis_dermaga: getValue(row, ['Jenis Dermaga', 'Jenis']) || '',
                        panjang_m: parseFloat(getValue(row, ['Panjang', 'Panjang (m)'])) || 0,
                        lebar_m: parseFloat(getValue(row, ['Lebar', 'Lebar (m)'])) || 0,
                        kedalaman_m: parseFloat(getValue(row, ['Kedalaman (m)', 'Kedalaman'])) || 0,
                        luas_m2: parseFloat(getValue(row, ['Luas (m²)', 'Luas'])) || 0,
                        konstruksi: getValue(row, ['KONSTRUKSI, TYPE, BENTUK & TIANG PANCANG DERMAGA', 'Konstruksi']) || '',
                        tahun_pembangunan: parseInt(getValue(row, ['Tahun Pembangunan', 'Tahun'])) || null,
                        kapasitas_kapal: getValue(row, ['Tipe Kapal', 'Kapasitas Kapal']) || '',
                        tonase_max: parseFloat(getValue(row, ['Berat Sandar Maks', 'Tonase Max'])) || 0,
                        jumlah_tambat: parseInt(getValue(row, ['Jumlah Tambat'])) || 0,
                        panjang_tambat_m: parseFloat(getValue(row, ['Panjang Tambat (m)', 'Panjang Tambat'])) || 0,
                        kondisi_dermaga: getValue(row, ['KONDISI (%)', 'Kondisi']) || 'Baik',
                        kondisi_lantai: getValue(row, ['Kondisi Lantai']) || 'Baik',
                        kondisi_dinding: getValue(row, ['Kondisi Dinding']) || 'Baik',
                        kondisi_fender: getValue(row, ['Kondisi Fender']) || 'Baik',
                        bollard: parseInt(getValue(row, ['Bollard (unit)', 'Bollard'])) || 0,
                        fender: parseInt(getValue(row, ['Jumlah Fender', 'Fender'])) || 0,
                        tangga_kapal: parseInt(getValue(row, ['Tangga Kapal (unit)', 'Tangga Kapal'])) || 0,
                        lampu_dermaga: parseInt(getValue(row, ['Lampu Dermaga (unit)', 'Lampu Dermaga', 'Lampu'])) || 0,
                        air_bersih: String(getValue(row, ['SUMBER', 'Air Bersih'])).match(/PDAM|Sumur|Ya|Ada/i) !== null,
                        listrik: String(getValue(row, ['SUMBER', 'Listrik', 'Daya'])).match(/PLN|Genset|Ya|Ada/i) !== null,
                        bbm: String(getValue(row, ['BBM', 'Kap BBM'])).match(/Ya|Ada|[0-9]/i) !== null,
                        crane: String(getValue(row, ['Crane'])).match(/ya|ada/i) !== null,
                        elevasi_m: parseFloat(getValue(row, ['Elevasi (m)', 'Elevasi'])) || 0,
                        draft_m: parseFloat(getValue(row, ['DRAFT pada LWS (m)', 'Draft'])) || 0,
                        lebar_apron_m: parseFloat(getValue(row, ['Lebar Apron (m)', 'Lebar Apron'])) || 0,
                        panjang_apron_m: parseFloat(getValue(row, ['Panjang Apron (m)', 'Panjang Apron'])) || 0,
                        fungsi_dermaga: getValue(row, ['Fungsi Dermaga', 'Fungsi']) || '',
                        keterangan: getValue(row, ['Keterangan', 'Ket']) || '',
                        status_operasional: getValue(row, ['Status Operasional', 'Status']) || 'Aktif',
                        longitude: parseFloat(getValue(row, ['Longitude', 'Long'])) || null,
                        latitude: parseFloat(getValue(row, ['Latitude', 'Lat'])) || null
                    }
                })

                console.log('Sending to API...')
                // Bulk insert
                const response = await fetch('/api/faslabuh/bulk-import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: mappedData })
                })

                const result = await response.json()

                if (!response.ok) {
                    throw new Error(result.error || 'Import failed')
                }

                console.log('Import result:', result)

                let message = `Proses Selesai.\nTotal: ${result.total}\nBerhasil: ${result.inserted}\nUpdate: ${result.updated}\nGagal: ${result.failed}`

                if (result.failed > 0) {
                    if (result.errors && result.errors.length > 0) {
                        const sampleErr = result.errors[0]
                        message += `\n\nContoh Error (Baris ${sampleErr.row}, ${sampleErr.nama_dermaga}):\n${sampleErr.error}`
                        console.error('Detail Error Import:', result.errors)
                    }
                    alert('⚠️ ' + message)
                } else {
                    alert('✅ ' + message)
                }

                fetchData()
            } catch (error) {
                console.error('Import process error:', error)
                alert('❌ Import gagal: ' + error.message)
            } finally {
                e.target.value = '' // Reset input
            }
        }

        reader.readAsArrayBuffer(file)
    }

    const updateField = (field, value) => {
        setSelectedItem(prev => ({ ...prev, [field]: value }))
    }

    return (
        <div style={{ fontFamily: FONT_SYSTEM }}>
            <div style={{ marginBottom: '20px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>Faslabuh</h1>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>Fasilitas Pelabuhan & Dermaga</p>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <button onClick={handleAddNew} style={{ background: '#003366', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer' }}>
                    + Tambah
                </button>
                <input ref={fileInputRef} type="file" style={{ display: 'none' }} accept=".xlsx" onChange={handleImport} />
                <button onClick={() => fileInputRef.current?.click()} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer' }}>
                    📂 Import Excel
                </button>
                <button onClick={handleExportTemplate} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer' }}>
                    📋 Download Template
                </button>
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#64748b', padding: '6px 0' }}>
                    Total: <strong>{data.length}</strong> Dermaga
                </span>
            </div>

            {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>⏳ Memuat data...</div>
            ) : (
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 250px)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                            <thead>
                                <tr style={{ background: '#003366', color: 'white' }}>
                                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 10 }}>Lantamal</th>
                                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 10 }}>Lanal/Faslan</th>
                                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 10 }}>Nama Dermaga</th>
                                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 10 }}>Lokasi</th>
                                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 10 }}>Konstruksi</th>
                                    <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 10 }}>Panjang (m)</th>
                                    <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 10 }}>Lebar (m)</th>
                                    <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 10 }}>Kondisi</th>
                                    <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 10 }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        onClick={() => handleRowClick(item)}
                                        style={{ background: index % 2 === 0 ? '#ffffff' : '#f8fafc', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#e0f2fe'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? '#ffffff' : '#f8fafc'}
                                    >
                                        <td style={{ padding: '6px 10px', color: '#475569' }}>{item.lantamal}</td>
                                        <td style={{ padding: '6px 10px', color: '#475569' }}>{item.lanal_faslan}</td>
                                        <td style={{ padding: '6px 10px', fontWeight: '600', color: '#003366' }}>{item.nama_dermaga}</td>
                                        <td style={{ padding: '6px 10px', color: '#334155' }}>{item.lokasi_dermaga}</td>
                                        <td style={{ padding: '6px 10px', color: '#334155' }}>{item.konstruksi}</td>
                                        <td style={{ padding: '6px 10px', textAlign: 'right' }}>{item.panjang_m}</td>
                                        <td style={{ padding: '6px 10px', textAlign: 'right' }}>{item.lebar_m}</td>
                                        <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600',
                                                background: item.kondisi_dermaga === 'Baik' ? '#dcfce7' : item.kondisi_dermaga === 'Rusak Ringan' ? '#fef3c7' : '#fee2e2',
                                                color: item.kondisi_dermaga === 'Baik' ? '#15803d' : item.kondisi_dermaga === 'Rusak Ringan' ? '#b45309' : '#dc2626'
                                            }}>
                                                {item.kondisi_dermaga}
                                            </span>
                                        </td>
                                        <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600',
                                                background: item.status_operasional === 'Aktif' ? '#dbeafe' : '#f3f4f6',
                                                color: item.status_operasional === 'Aktif' ? '#1e40af' : '#6b7280'
                                            }}>
                                                {item.status_operasional}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Detail */}
            {isModalOpen && selectedItem && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setIsModalOpen(false)}>
                    <div style={{ background: 'white', borderRadius: '12px', maxWidth: '900px', width: '100%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)', padding: '24px', color: 'white', borderBottom: '2px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>📋 Detail Dermaga</h2>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>Informasi lengkap fasilitas dermaga</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', width: '36px', height: '36px', borderRadius: '8px', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                            <form onSubmit={handleSave}>
                                {/* A. Informasi Lokasi */}
                                <div style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1e40af', marginBottom: '12px', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>📍 Informasi Lokasi</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Lantamal</label>
                                            <input type="text" value={selectedItem.lantamal || ''} onChange={(e) => updateField('lantamal', e.target.value)} disabled={!isEditMode} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Lanal/Faslan</label>
                                            <input type="text" value={selectedItem.lanal_faslan || ''} onChange={(e) => updateField('lanal_faslan', e.target.value)} disabled={!isEditMode} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }} />
                                        </div>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Lokasi Dermaga ⭐</label>
                                            <textarea value={selectedItem.lokasi_dermaga || ''} onChange={(e) => updateField('lokasi_dermaga', e.target.value)} disabled={!isEditMode} rows={2} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', resize: 'vertical' }} />
                                        </div>
                                    </div>
                                </div>

                                {/* B. Identifikasi */}
                                <div style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1e40af', marginBottom: '12px', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>🏷️ Identifikasi Dermaga</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Nama Dermaga ⭐</label>
                                            <input type="text" value={selectedItem.nama_dermaga || ''} onChange={(e) => updateField('nama_dermaga', e.target.value)} disabled={!isEditMode} required style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Jenis Dermaga</label>
                                            <input type="text" value={selectedItem.jenis_dermaga || ''} onChange={(e) => updateField('jenis_dermaga', e.target.value)} disabled={!isEditMode} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }} />
                                        </div>
                                    </div>
                                </div>

                                {/* C. Spesifikasi Teknis */}
                                <div style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1e40af', marginBottom: '12px', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>📐 Spesifikasi Teknis</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Panjang (m)</label>
                                            <input type="number" step="0.01" value={selectedItem.panjang_m || 0} onChange={(e) => updateField('panjang_m', parseFloat(e.target.value))} disabled={!isEditMode} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Lebar (m)</label>
                                            <input type="number" step="0.01" value={selectedItem.lebar_m || 0} onChange={(e) => updateField('lebar_m', parseFloat(e.target.value))} disabled={!isEditMode} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Kedalaman (m)</label>
                                            <input type="number" step="0.01" value={selectedItem.kedalaman_m || 0} onChange={(e) => updateField('kedalaman_m', parseFloat(e.target.value))} disabled={!isEditMode} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Luas (m²)</label>
                                            <input type="number" step="0.01" value={selectedItem.luas_m2 || 0} onChange={(e) => updateField('luas_m2', parseFloat(e.target.value))} disabled={!isEditMode} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Konstruksi</label>
                                            <input type="text" value={selectedItem.konstruksi || ''} onChange={(e) => updateField('konstruksi', e.target.value)} disabled={!isEditMode} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Tahun Pembangunan</label>
                                            <input type="number" value={selectedItem.tahun_pembangunan || ''} onChange={(e) => updateField('tahun_pembangunan', parseInt(e.target.value))} disabled={!isEditMode} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }} />
                                        </div>
                                    </div>
                                </div>

                                {/* D. Kondisi */}
                                <div style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1e40af', marginBottom: '12px', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>🔧 Kondisi Fisik</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                        {['kondisi_dermaga', 'kondisi_lantai', 'kondisi_dinding', 'kondisi_fender'].map(field => (
                                            <div key={field}>
                                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>{field.replace('kondisi_', '').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} {field === 'kondisi_dermaga' ? '⭐' : ''}</label>
                                                <select value={selectedItem[field] || 'Baik'} onChange={(e) => updateField(field, e.target.value)} disabled={!isEditMode} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}>
                                                    <option>Baik</option>
                                                    <option>Rusak Ringan</option>
                                                    <option>Rusak Berat</option>
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* E. Koordinat */}
                                <div style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1e40af', marginBottom: '12px', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>📍 Koordinat Lokasi <span style={{ fontSize: '11px', fontWeight: '400', color: '#6b7280' }}>(Opsional - untuk peta)</span></h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>🌐 Longitude</label>
                                            <input type="number" step="any" placeholder="Contoh: 106.8456" value={selectedItem.longitude || ''} onChange={(e) => updateField('longitude', parseFloat(e.target.value))} disabled={!isEditMode} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>🌐 Latitude</label>
                                            <input type="number" step="any" placeholder="Contoh: -6.2088" value={selectedItem.latitude || ''} onChange={(e) => updateField('latitude', parseFloat(e.target.value))} disabled={!isEditMode} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                                    {!isEditMode ? (
                                        <>
                                            <button type="button" onClick={handleEdit} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>✏️ Edit</button>
                                            {selectedItem.id && <button type="button" onClick={handleDelete} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>🗑️ Hapus</button>}
                                            <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Tutup</button>
                                        </>
                                    ) : (
                                        <>
                                            <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>💾 Simpan</button>
                                            <button type="button" onClick={() => { setIsEditMode(false); setIsModalOpen(false) }} style={{ background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Batal</button>
                                        </>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Faslabuh
