import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'

function DisKes() {
    const [activeTab, setActiveTab] = useState('fasilitas')
    const [loading, setLoading] = useState(false)

    // Facilities State
    const [facilities, setFacilities] = useState([])

    // Editor State
    const [isEditorOpen, setIsEditorOpen] = useState(false)
    const [currentItem, setCurrentItem] = useState(null)
    const [isNewItem, setIsNewItem] = useState(false)
    const [isReadOnly, setIsReadOnly] = useState(false)
    const [importMode, setImportMode] = useState('append') // 'append' | 'replace'
    const [selectedFacility, setSelectedFacility] = useState(null)
    const [isSaranaModalOpen, setIsSaranaModalOpen] = useState(false)
    const [currentSaranaItem, setCurrentSaranaItem] = useState(null)
    const [selectedSaranaIds, setSelectedSaranaIds] = useState([])
    const [isNewSarana, setIsNewSarana] = useState(false)
    const [isSaranaEditable, setIsSaranaEditable] = useState(false)
    const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false)

    // Helper to update facility sarana and persist to backend
    const updateFacilitySarana = async (newSaranaList) => {
        if (!selectedFacility) return

        const updatedFacility = { ...selectedFacility, sarana: newSaranaList }

        // Optimistic update
        setSelectedFacility(updatedFacility)
        setFacilities(prev => prev.map(f => f.id === updatedFacility.id ? updatedFacility : f))

        try {
            const response = await fetch(`/api/assets/diskes/${selectedFacility.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedFacility)
            })
            if (!response.ok) throw new Error('Failed to update')
        } catch (error) {
            console.error('Error updating sarana:', error)
            alert('Gagal menyimpan perubahan ke server')
            fetchFacilities() // Revert on error
        }
    }

    const handleSaranaSubmit = (e) => {
        e.preventDefault()
        let newSaranaList
        if (isNewSarana) {
            newSaranaList = [...(selectedFacility.sarana || []), { ...currentSaranaItem, id: Date.now() }]
        } else {
            newSaranaList = selectedFacility.sarana.map(item =>
                item.id === currentSaranaItem.id ? currentSaranaItem : item
            )
        }
        updateFacilitySarana(newSaranaList)
        setIsSaranaModalOpen(false)
    }

    const openAddSaranaModal = () => {
        setCurrentSaranaItem({
            facilityType: '',
            name: '',
            condition: 'Baik',
            year: '',
            quantity: ''
        })
        setIsNewSarana(true)
        setIsSaranaModalOpen(true)
    }

    const openEditSaranaModal = (item) => {
        setCurrentSaranaItem({ ...item })
        setIsNewSarana(false)
        setIsSaranaModalOpen(true)
    }


    // --- NEW SARANA HANDLERS ---
    const deleteSarana = async (id) => {
        if (!confirm('Hapus item ini?')) return
        const newList = selectedFacility.sarana.filter(i => i.id !== id)
        await updateFacilitySarana(newList)
    }

    const deleteAllSarana = async () => {
        setIsDeleteAllModalOpen(true)
    }

    const confirmDeleteAll = async () => {
        await updateFacilitySarana([])
        setIsDeleteAllModalOpen(false)
    }

    const deleteSelectedSarana = async () => {
        if (selectedSaranaIds.length === 0) return
        if (!confirm(`Hapus ${selectedSaranaIds.length} item terpilih?`)) return
        const newList = selectedFacility.sarana.filter(i => !selectedSaranaIds.includes(i.id))
        await updateFacilitySarana(newList)
        setSelectedSaranaIds([])
    }

    const handleImportToFacility = (e) => {
        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (evt) => {
            try {
                const arrayBuffer = evt.target.result
                const lib = XLSX.read ? XLSX : XLSX.default
                if (!lib || !lib.read) return alert('Library Error')

                const wb = lib.read(arrayBuffer, { type: 'array' })
                const ws = wb.Sheets[wb.SheetNames[0]]
                const data = lib.utils.sheet_to_json(ws, { header: 1 })

                if (!data || data.length < 2) return alert('File kosong')

                const headers = data[0].map(h => String(h).toLowerCase().trim())
                const getIndex = (k) => headers.findIndex(h => k.some(x => h.includes(x)))

                let idx = {
                    facilityType: getIndex(['jenis fasilitas', 'jenis']),
                    name: getIndex(['nama', 'item']),
                    condition: getIndex(['kondisi']),
                    year: getIndex(['tahun']),
                    quantity: getIndex(['jumlah'])
                }

                if (idx.name === -1) idx = { facilityType: 0, name: 1, condition: 2, year: 3, quantity: 4 }

                const newItems = data.slice(1).map((row, i) => ({
                    id: Date.now() + i,
                    facilityType: row[idx.facilityType] || '',
                    name: row[idx.name] || '',
                    condition: row[idx.condition] || 'Baik',
                    year: row[idx.year] || '',
                    quantity: row[idx.quantity] || ''
                })).filter(i => i.name)

                if (newItems.length === 0) return alert('Tidak ada data valid')

                let finalList = []
                if (importMode === 'replace') {
                    if (!confirm('Ganti semua data lama?')) return
                    finalList = newItems
                } else {
                    finalList = [...(selectedFacility.sarana || []), ...newItems]
                }
                updateFacilitySarana(finalList)
                alert(`Sukses import ${newItems.length} item`)
            } catch (err) {
                console.error(err)
                alert('Gagal import')
            }
        }
        reader.readAsArrayBuffer(file)
        e.target.value = null
    }

    // Mock Data for Medical Equipment (Alkes)
    const [equipment] = useState([
        { id: 1, name: 'MRI Scanner 3T', type: 'Diagnostik', location: 'Radiologi', condition: 'Baik', lastMaintenance: '2023-11-15' },
        { id: 2, name: 'Unit Hemodialisa', type: 'Terapi', location: 'Ruang Cuci Darah', condition: 'Baik', lastMaintenance: '2024-01-10' },
        { id: 3, name: 'Ventilator Transport', type: 'Life Support', location: 'IGD', condition: 'Perlu Perbaikan', lastMaintenance: '2023-09-05' },
        { id: 4, name: 'Ambulans VIP', type: 'Transportasi', location: 'Pool Kendaraan', condition: 'Baik', lastMaintenance: '2024-02-01' }
    ])

    // --- FETCH DATA ---
    const fetchFacilities = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/assets/diskes')
            if (!response.ok) throw new Error('Failed to fetch')
            const data = await response.json()
            setFacilities(data)
        } catch (error) {
            console.error('Error loading facilities:', error)
            alert('Gagal memuat data fasilitas')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (activeTab === 'fasilitas') {
            fetchFacilities()
        }
    }, [activeTab])

    // --- CRUD HANDLERS ---
    const handleAddFacility = () => {
        setCurrentItem({
            name: '',
            type: 'Rumah Sakit',
            location: '',
            capacity: '',
            staff: 0,
            status: 'Operasional',
            description: '',
            longitude: '',
            latitude: '',
            tahun_beroperasi: '',
            sarana: []
        })
        setIsNewItem(true)
        setIsReadOnly(false)
        setIsEditorOpen(true)
    }

    const handleRowClick = (item) => {
        // Mock data for existing items if not present
        const mockSarana = [
            { id: 1, facilityType: 'Unit Gawat Darurat', name: 'Ambulans VIP', condition: 'Baik', year: '2021', quantity: '1 Unit' },
            { id: 2, facilityType: 'Rawat Inap', name: 'Tabung Oksigen', condition: 'Baik', year: '2022', quantity: '15 Unit' },
            { id: 3, facilityType: 'Rawat Inap', name: 'Bed Pasien Elektrik', condition: 'Perbaikan Ringan', year: '2020', quantity: '5 Unit' }
        ]
        setCurrentItem({ ...item, sarana: item.sarana || mockSarana })
        setIsNewItem(false)
        setIsReadOnly(true)
        setIsEditorOpen(true)
    }

    // --- SARANA HANDLERS ---
    const handleAddSarana = () => {
        const newSarana = {
            id: Date.now(),
            facilityType: '',
            name: '',
            condition: 'Baik',
            year: '',
            quantity: ''
        }
        setCurrentItem(prev => ({
            ...prev,
            sarana: [...(prev.sarana || []), newSarana]
        }))
    }

    const handleDeleteSarana = (id) => {
        setCurrentItem(prev => ({
            ...prev,
            sarana: prev.sarana.filter(item => item.id !== id)
        }))
    }

    const handleSaranaChange = (id, field, value) => {
        setCurrentItem(prev => ({
            ...prev,
            sarana: prev.sarana.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        }))
    }

    const handleImportSarana = (e) => {
        const file = e.target.files[0]
        if (!file) return

        // DEBUG: Alert start
        // alert(`Memulai import file: ${file.name}. Mode: ${importMode}`)

        const reader = new FileReader()
        reader.onload = (evt) => {
            try {
                const arrayBuffer = evt.target.result
                const lib = XLSX.read ? XLSX : XLSX.default

                if (!lib || !lib.read) {
                    alert('ERROR CRITICAL: Library XLSX tidak dimuat. Mohon refresh halaman.')
                    return
                }

                const wb = lib.read(arrayBuffer, { type: 'array' })
                const wsname = wb.SheetNames[0]
                const ws = wb.Sheets[wsname]
                const data = lib.utils.sheet_to_json(ws, { header: 1 })

                if (!data || data.length < 2) {
                    alert('File Excel kosong atau header tidak ditemukan.')
                    return
                }

                // ... keep existing smart detection ...
                // BUT add alert if 0 items found

                // Copy smart detection logic from previous steps
                const headers = data[0].map(h => String(h).toLowerCase().trim())
                const getIndex = (keywords) => headers.findIndex(h => keywords.some(k => h.includes(k)))
                let idx = {
                    facilityType: getIndex(['jenis fasilitas', 'jenis faslitas', 'fasilitas', 'faslitas', 'ruangan', 'lokasi', 'unit', 'tempat']),
                    name: getIndex(['nama', 'item', 'alat', 'barang', 'objek']),
                    condition: getIndex(['kondisi', 'keadaan']),
                    year: getIndex(['tahun', 'thn', 'pengadaan']),
                    quantity: getIndex(['jumlah', 'qty', 'banyak', 'volume', 'total'])
                }


                if (idx.name === -1) {
                    idx = { facilityType: 0, name: 1, condition: 2, year: 3, quantity: 4 }
                }

                const normalizeCondition = (val) => {
                    if (!val) return 'Baik'
                    const v = String(val).trim().toUpperCase()
                    if (v === 'B') return 'Baik'
                    if (v === 'RR') return 'Perbaikan Ringan'
                    if (v === 'RB') return 'Rusak Berat'
                    return val
                }

                const newItems = data.slice(1).map((row, index) => ({
                    id: Date.now() + index,
                    facilityType: row[idx.facilityType] || '',
                    name: row[idx.name] || '',
                    condition: normalizeCondition(row[idx.condition]),
                    year: row[idx.year] || '',
                    quantity: row[idx.quantity] || ''
                })).filter(item => item.name || item.facilityType)

                if (newItems.length === 0) {
                    alert('Tidak ada data valid yang bisa dibaca. Pastikan format kolom benar.')
                    return
                }

                if (importMode === 'replace') {
                    if (confirm(`KONFIRMASI IMPORT:\nMode: GANTI DATA (Replace)\nJumlah Data Baru: ${newItems.length}\nJumlah Data Lama: ${currentItem?.sarana?.length || 0}\n\nKlik OK untuk MENGHAPUS data lama dan menggantinya.`)) {
                        setCurrentItem(prev => ({ ...prev, sarana: newItems }))
                        alert('Sukses! Data lama telah dihapus dan diganti dengan data baru.')
                    }
                } else if (importMode === 'update') {
                    setCurrentItem(prev => {
                        const existing = [...(prev.sarana || [])]
                        let u = 0, a = 0
                        newItems.forEach(n => {
                            const i = existing.findIndex(e => e.name?.trim().toLowerCase() === n.name?.trim().toLowerCase())
                            if (i >= 0) { existing[i] = { ...existing[i], ...n, id: existing[i].id }; u++ }
                            else { existing.push(n); a++ }
                        })
                        setTimeout(() => alert(`Sukses Update! ${u} data diperbarui, ${a} data baru ditambahkan.`), 100)
                        return { ...prev, sarana: existing }
                    })
                } else {
                    setCurrentItem(prev => ({ ...prev, sarana: [...(prev.sarana || []), ...newItems] }))
                    alert(`Sukses! ${newItems.length} data ditambahkan.`)
                }

            } catch (error) {
                console.error('Error parsing excel:', error)
                alert('Gagal memproses file: ' + error.message)
            }
        }
        reader.readAsArrayBuffer(file)
        e.target.value = null
    }

    const handleDeleteFacility = async (id) => {
        if (!confirm('Yakin ingin menghapus fasilitas ini?')) return

        setLoading(true)
        try {
            const response = await fetch(`/api/assets/diskes/${id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                setIsEditorOpen(false)
                fetchFacilities()
            } else {
                alert('Gagal menghapus data')
            }
        } catch (error) {
            console.error('Error deleting:', error)
            alert('Terjadi kesalahan saat menghapus')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const url = isNewItem ? '/api/assets/diskes' : `/api/assets/diskes/${currentItem.id}`
            const method = isNewItem ? 'POST' : 'PUT'

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentItem)
            })

            if (response.ok) {
                setIsEditorOpen(false)
                fetchFacilities()
            } else {
                alert('Gagal menyimpan data')
            }
        } catch (error) {
            console.error('Error saving:', error)
            alert('Terjadi kesalahan saat menyimpan')
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field, value) => {
        setCurrentItem(prev => ({ ...prev, [field]: value }))
    }

    return (
        <div className="fade-in">

            <div className="page-header">
                <h1 className="page-title">Fasilitas Kesehatan (DisKes)</h1>
                <p className="page-subtitle">Manajemen Fasilitas Kesehatan dan Peralatan Medis Kodaeral 3</p>
            </div>

            <div className="stats-grid" style={{ marginBottom: '24px' }}>
                <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
                    <div className="stat-label">Total Fasilitas</div>
                    <div className="stat-value" style={{ color: '#ef4444' }}>{facilities.length}</div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <div className="stat-label">Total Alkes Utama</div>
                    <div className="stat-value" style={{ color: '#3b82f6' }}>{equipment.length}</div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
                    <div className="stat-label">Total Personel Medis</div>
                    <div className="stat-value" style={{ color: '#10b981' }}>
                        {facilities.reduce((acc, curr) => acc + (parseInt(curr.staff) || 0), 0)}
                    </div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <div className="stat-label">Fasilitas Operasional</div>
                    <div className="stat-value" style={{ color: '#f59e0b' }}>
                        {facilities.filter(f => f.status === 'Operasional').length}
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                <button
                    onClick={() => setActiveTab('fasilitas')}
                    style={{
                        padding: '10px 20px',
                        borderBottom: activeTab === 'fasilitas' ? '2px solid #011F5B' : '2px solid transparent',
                        color: activeTab === 'fasilitas' ? '#011F5B' : '#64748b',
                        fontWeight: activeTab === 'fasilitas' ? '600' : '500',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    Fasilitas Kesehatan
                </button>
                <button
                    onClick={() => setActiveTab('alkes')}
                    style={{
                        padding: '10px 20px',
                        borderBottom: activeTab === 'alkes' ? '2px solid #011F5B' : '2px solid transparent',
                        color: activeTab === 'alkes' ? '#011F5B' : '#64748b',
                        fontWeight: activeTab === 'alkes' ? '600' : '500',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    Alat Kesehatan & Transportasi
                </button>
            </div>

            {/* Content Area */}
            <div className="card">
                {activeTab === 'fasilitas' ? (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                            <button className="btn btn-primary" onClick={handleAddFacility}>
                                + Tambah Fasilitas
                            </button>
                        </div>
                        {loading ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>⏳ Memuat data...</div>
                        ) : (
                            <>
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="table" style={{ fontSize: '0.8rem', width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                                        <thead>
                                            <tr style={{ background: '#f8fafc' }}>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Nama Fasilitas</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Jenis</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Lokasi</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Kapasitas</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Personel</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Status</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {facilities.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                                                        Belum ada data fasilitas. Silakan tambah data baru.
                                                    </td>
                                                </tr>
                                            ) : (
                                                facilities.map(item => (
                                                    <tr
                                                        key={item.id}
                                                        onClick={() => setSelectedFacility(item)}
                                                        style={{
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            borderBottom: '1px solid #f1f5f9',
                                                            background: selectedFacility?.id === item.id ? '#f0f9ff' : 'transparent',
                                                            borderLeft: selectedFacility?.id === item.id ? '4px solid #0ea5e9' : '4px solid transparent'
                                                        }}
                                                        className="hover:bg-slate-50"
                                                    >
                                                        <td style={{ fontWeight: '600', padding: '12px 16px', color: '#1e293b' }}>{item.name}</td>
                                                        <td style={{ padding: '12px 16px', color: '#475569' }}>{item.type}</td>
                                                        <td style={{ padding: '12px 16px', color: '#475569' }}>{item.location}</td>
                                                        <td style={{ padding: '12px 16px', color: '#475569' }}>{item.capacity}</td>
                                                        <td style={{ padding: '12px 16px', color: '#475569' }}>{item.staff}</td>
                                                        <td style={{ padding: '12px 16px' }}>
                                                            <span style={{
                                                                padding: '4px 10px',
                                                                borderRadius: '20px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: '600',
                                                                background: item.status === 'Operasional' ? '#dcfce7' : '#fee2e2',
                                                                color: item.status === 'Operasional' ? '#166534' : '#991b1b',
                                                                display: 'inline-block'
                                                            }}>
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '12px 16px' }}>
                                                            <button
                                                                className="btn btn-xs btn-outline"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleRowClick(item)
                                                                }}
                                                            >
                                                                📝 Edit
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>

                                </div>

                                {/* Detail Table Section */}
                                {selectedFacility && (
                                    <div style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#334155', margin: 0 }}>
                                                    🔍 Detail Fasilitas: {selectedFacility.name}
                                                </h3>
                                                <button
                                                    onClick={() => setIsSaranaEditable(!isSaranaEditable)}
                                                    className="btn btn-xs"
                                                    style={{
                                                        fontSize: '0.7rem',
                                                        background: isSaranaEditable ? '#f59e0b' : '#e2e8f0',
                                                        color: isSaranaEditable ? 'white' : '#64748b',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px'
                                                    }}
                                                >
                                                    {isSaranaEditable ? '✅ Selesai Edit' : '✏️ Edit Mode'}
                                                </button>
                                            </div>
                                            {isSaranaEditable && (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button onClick={openAddSaranaModal} className="btn btn-sm btn-primary" style={{ fontSize: '0.75rem' }}>+ Tambah Item</button>
                                                    <label className="btn btn-sm btn-outline" style={{ fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', background: 'white' }}>
                                                        📂 Import Excel
                                                        <input type="file" accept=".xlsx,.xls" onChange={handleImportToFacility} style={{ display: 'none' }} />
                                                    </label>
                                                    {selectedSaranaIds.length > 0 && (
                                                        <button onClick={deleteSelectedSarana} className="btn btn-sm btn-error" style={{ fontSize: '0.75rem', background: '#ef4444', color: 'white', borderColor: '#ef4444' }}>
                                                            Hapus ({selectedSaranaIds.length})
                                                        </button>
                                                    )}
                                                    <button onClick={deleteAllSarana} className="btn btn-sm btn-error btn-outline" style={{ fontSize: '0.75rem', color: '#ef4444', borderColor: '#ef4444' }}>Hapus Semua</button>
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ overflowX: 'auto', background: '#f8fafc', borderRadius: '8px', padding: '16px', border: '1px solid #cbd5e1' }}>
                                            {!selectedFacility.sarana || selectedFacility.sarana.length === 0 ? (
                                                <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontStyle: 'italic' }}>
                                                    Tidak ada data sarana & prasarana untuk fasilitas ini.
                                                </div>
                                            ) : (
                                                <table className="table" style={{ fontSize: '0.45rem', width: '100%', borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr style={{ background: '#e2e8f0' }}>
                                                            {isSaranaEditable && (
                                                                <th style={{ padding: '4px', textAlign: 'center', width: '30px' }}>
                                                                    <input
                                                                        type="checkbox"
                                                                        onChange={e => {
                                                                            if (e.target.checked) setSelectedSaranaIds(selectedFacility.sarana.map(s => s.id))
                                                                            else setSelectedSaranaIds([])
                                                                        }}
                                                                        checked={selectedFacility.sarana?.length > 0 && selectedSaranaIds.length === selectedFacility.sarana.length}
                                                                    />
                                                                </th>
                                                            )}
                                                            <th style={{ padding: '4px', textAlign: 'center' }}>Jenis Fasilitas</th>
                                                            <th style={{ padding: '4px', textAlign: 'left' }}>Nama Item</th>
                                                            <th style={{ padding: '4px', textAlign: 'center' }}>Kondisi</th>
                                                            <th style={{ padding: '4px', textAlign: 'center' }}>Tahun</th>
                                                            <th style={{ padding: '4px', textAlign: 'center' }}>Jumlah</th>
                                                            {isSaranaEditable && <th style={{ padding: '4px', textAlign: 'center', width: '60px' }}>Aksi</th>}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedFacility.sarana.map((sarana, idx) => (
                                                            <tr key={idx} style={{ borderBottom: '1px solid #cbd5e1' }}>
                                                                {isSaranaEditable && (
                                                                    <td style={{ padding: '4px', textAlign: 'center' }}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedSaranaIds.includes(sarana.id)}
                                                                            onChange={() => {
                                                                                setSelectedSaranaIds(prev => prev.includes(sarana.id) ? prev.filter(id => id !== sarana.id) : [...prev, sarana.id])
                                                                            }}
                                                                        />
                                                                    </td>
                                                                )}
                                                                <td style={{ padding: '4px', textAlign: 'center' }}>{sarana.facilityType}</td>
                                                                <td style={{ padding: '4px', textAlign: 'left', fontWeight: '500' }}>{sarana.name}</td>
                                                                <td style={{ padding: '4px', textAlign: 'center' }}>
                                                                    <span style={{
                                                                        padding: '2px 8px', borderRadius: '8px', fontSize: '0.8rem',
                                                                        fontWeight: '500',
                                                                        background: String(sarana.condition).toLowerCase() === 'baik' ? '#dcfce7' :
                                                                            String(sarana.condition).toLowerCase().includes('rusak berat') ? '#fee2e2' : '#fef9c3',
                                                                        color: String(sarana.condition).toLowerCase() === 'baik' ? '#166534' :
                                                                            String(sarana.condition).toLowerCase().includes('rusak berat') ? '#991b1b' : '#854d0e'
                                                                    }}>
                                                                        {sarana.condition}
                                                                    </span>
                                                                </td>
                                                                <td style={{ padding: '4px', textAlign: 'center' }}>{sarana.year}</td>
                                                                <td style={{ padding: '4px', textAlign: 'center' }}>{sarana.quantity}</td>
                                                                {isSaranaEditable && (
                                                                    <td style={{ padding: '4px', textAlign: 'center' }}>
                                                                        <button onClick={() => openEditSaranaModal(sarana)} title="Edit" style={{ marginRight: '8px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>✏️</button>
                                                                        <button onClick={() => deleteSarana(sarana.id)} title="Hapus" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.8rem' }}>🗑️</button>
                                                                    </td>
                                                                )}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                            <button className="btn btn-warning" style={{ background: '#f59e0b', borderColor: '#f59e0b', color: 'white' }}>Tambah Alkes</button>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table" style={{ fontSize: '0.9rem', width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc' }}>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Nama Alat / Kendaraan</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Jenis</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Lokasi Penempatan</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Kondisi</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Pemeliharaan Terakhir</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {equipment.map(item => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }} className="hover:bg-slate-50">
                                            <td style={{ fontWeight: '600', padding: '12px 16px', color: '#1e293b' }}>{item.name}</td>
                                            <td style={{ padding: '12px 16px', color: '#475569' }}>{item.type}</td>
                                            <td style={{ padding: '12px 16px', color: '#475569' }}>{item.location}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    background: item.condition === 'Baik' ? '#dcfce7' : '#fef9c3',
                                                    color: item.condition === 'Baik' ? '#166534' : '#854d0e',
                                                    display: 'inline-block'
                                                }}>
                                                    {item.condition}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px', color: '#475569' }}>{item.lastMaintenance}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <button className="btn btn-sm btn-outline">Log Perbaikan</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* EDITOR MODAL */}
            {isEditorOpen && currentItem && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }} onClick={() => setIsEditorOpen(false)}>
                    <div className="card" style={{ width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto', padding: '24px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>
                                {isNewItem ? 'Tambah Fasilitas Kesehatan' : (isReadOnly ? 'Detail Fasilitas' : 'Edit Fasilitas')}
                            </h2>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {!isNewItem && isReadOnly && (
                                    <button
                                        onClick={() => setIsReadOnly(false)}
                                        className="btn btn-sm btn-outline"
                                    >
                                        Edit
                                    </button>
                                )}
                                <button onClick={() => setIsEditorOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
                            </div>
                        </div>

                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label className="form-label">Nama Fasilitas</label>
                                <input
                                    className="form-input"
                                    value={currentItem.name || ''}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    required
                                    placeholder="Contoh: RSAL Dr. Mintohardjo"
                                    disabled={isReadOnly}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label className="form-label">Jenis Fasilitas</label>
                                    <select
                                        className="form-input"
                                        value={currentItem.type || 'Rumah Sakit'}
                                        onChange={(e) => handleInputChange('type', e.target.value)}
                                        disabled={isReadOnly}
                                    >
                                        <option value="Rumah Sakit">Rumah Sakit</option>
                                        <option value="Balai Kesehatan">Balai Kesehatan</option>
                                        <option value="Balai Pengobatan">Balai Pengobatan</option>
                                        <option value="Klinik Spesialis">Klinik Spesialis</option>
                                        <option value="Pos Kesehatan">Pos Kesehatan</option>
                                        <option value="Apotek">Apotek</option>
                                        <option value="Lainnya">Lainnya</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Status Operasional</label>
                                    <select
                                        className="form-input"
                                        value={currentItem.status || 'Operasional'}
                                        onChange={(e) => handleInputChange('status', e.target.value)}
                                        disabled={isReadOnly}
                                    >
                                        <option value="Operasional">Operasional</option>
                                        <option value="Renovasi">Renovasi</option>
                                        <option value="Tutup Sementara">Tutup Sementara</option>
                                        <option value="Non-Aktif">Non-Aktif</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Lokasi</label>
                                <input
                                    className="form-input"
                                    value={currentItem.location || ''}
                                    onChange={(e) => handleInputChange('location', e.target.value)}
                                    placeholder="Lokasi / Gedung / Area"
                                    disabled={isReadOnly}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label className="form-label">Longitude (Lon)</label>
                                    <input
                                        className="form-input"
                                        value={currentItem.longitude || ''}
                                        onChange={(e) => handleInputChange('longitude', e.target.value)}
                                        placeholder="Contoh: 106.8..."
                                        disabled={isReadOnly}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Latitude (Lat)</label>
                                    <input
                                        className="form-input"
                                        value={currentItem.latitude || ''}
                                        onChange={(e) => handleInputChange('latitude', e.target.value)}
                                        placeholder="Contoh: -6.12..."
                                        disabled={isReadOnly}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Tahun Beroperasi</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={currentItem.tahun_beroperasi || ''}
                                        onChange={(e) => handleInputChange('tahun_beroperasi', e.target.value)}
                                        placeholder="Contoh: 1995"
                                        disabled={isReadOnly}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label className="form-label">Kapasitas (Bed/Kursi)</label>
                                    <input
                                        className="form-input"
                                        value={currentItem.capacity || ''}
                                        onChange={(e) => handleInputChange('capacity', e.target.value)}
                                        placeholder="Contoh: 50 Bed"
                                        disabled={isReadOnly}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Jumlah Personel</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={currentItem.staff || 0}
                                        onChange={(e) => handleInputChange('staff', e.target.value)}
                                        disabled={isReadOnly}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Keterangan / Deskripsi</label>
                                <textarea
                                    className="form-input"
                                    value={currentItem.description || ''}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    style={{ minHeight: '80px' }}
                                    placeholder="Informasi tambahan mengenai fasilitas..."
                                    disabled={isReadOnly}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                                <div>
                                    {!isNewItem && !isReadOnly && (
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteFacility(currentItem.id)}
                                            style={{ padding: '8px 16px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                                        >
                                            Hapus
                                        </button>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditorOpen(false)}
                                        style={{ padding: '8px 16px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                                    >
                                        {isReadOnly ? 'Tutup' : 'Batal'}
                                    </button>
                                    {!isReadOnly && (
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', opacity: loading ? 0.7 : 1 }}
                                        >
                                            {loading ? 'Menyimpan...' : 'Simpan Fasilitas'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* NEW SARANA MODAL */}
            {isSaranaModalOpen && currentSaranaItem && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
                }} onClick={() => setIsSaranaModalOpen(false)}>
                    <div className="card" style={{ width: '90%', maxWidth: '500px', padding: '24px' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>{isNewSarana ? 'Tambah Item' : 'Edit Item'}</h2>
                        <form onSubmit={handleSaranaSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label className="form-label">Jenis Fasilitas</label>
                                <input className="form-input" required value={currentSaranaItem.facilityType || ''} onChange={e => setCurrentSaranaItem({ ...currentSaranaItem, facilityType: e.target.value })} placeholder="Contoh: IGD, Rawat Inap" />
                            </div>
                            <div>
                                <label className="form-label">Nama Item</label>
                                <input className="form-input" required value={currentSaranaItem.name || ''} onChange={e => setCurrentSaranaItem({ ...currentSaranaItem, name: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label className="form-label">Kondisi</label>
                                    <select className="form-input" value={currentSaranaItem.condition || 'Baik'} onChange={e => setCurrentSaranaItem({ ...currentSaranaItem, condition: e.target.value })}>
                                        <option value="Baik">Baik</option>
                                        <option value="Perbaikan Ringan">Perbaikan Ringan</option>
                                        <option value="Rusak Berat">Rusak Berat</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Tahun</label>
                                    <input className="form-input" type="number" value={currentSaranaItem.year || ''} onChange={e => setCurrentSaranaItem({ ...currentSaranaItem, year: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="form-label">Jumlah</label>
                                <input className="form-input" value={currentSaranaItem.quantity || ''} onChange={e => setCurrentSaranaItem({ ...currentSaranaItem, quantity: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setIsSaranaModalOpen(false)}>Batal</button>
                                <button type="submit" className="btn btn-primary">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE ALL CONFIRMATION MODAL */}
            {isDeleteAllModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200
                }} onClick={() => setIsDeleteAllModalOpen(false)}>
                    <div className="card" style={{ width: '90%', maxWidth: '400px', padding: '24px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: '1.2rem', color: '#dc2626', marginBottom: '12px' }}>⚠️ Hapus Semua?</h3>
                        <p style={{ color: '#475569', marginBottom: '24px' }}>
                            Apakah Anda yakin ingin menghapus <strong>SEMUA</strong> item Sarana & Prasarana untuk fasilitas ini?<br/>
                            Tindakan ini <strong>tidak dapat dibatalkan</strong>.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                            <button onClick={() => setIsDeleteAllModalOpen(false)} className="btn btn-outline">Batal</button>
                            <button onClick={confirmDeleteAll} className="btn btn-error" style={{ background: '#dc2626', color: 'white', border: 'none' }}>Ya, Hapus Semua</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .form-input {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    transition: border-color 0.2s;
                }
                .form-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
                }
                .form-input:disabled {
                    background-color: transparent;
                    border: none;
                    border-bottom: 1px solid #e2e8f0;
                    border-radius: 0;
                    padding-left: 0;
                    padding-right: 0;
                    cursor: text;
                    color: #0f172a;
                    font-weight: 500;
                    -webkit-text-fill-color: #0f172a;
                    opacity: 1;
                }
                .form-label {
                    display: block;
                    font-size: 0.8rem;
                    color: #64748b;
                    margin-bottom: 4px;
                    font-weight: 500;
                }
                .table tr:hover {
                    background-color: #f8fafc;
                }
            `}</style>
        </div >

    )
}

export default DisKes
