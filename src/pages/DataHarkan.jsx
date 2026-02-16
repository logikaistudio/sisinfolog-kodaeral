import React, { useState, useRef } from 'react'
import * as XLSX from 'xlsx'

// --- Helper Components ---

const TabButton = ({ id, label, icon, activeTab, onClick }) => (
    <button
        type="button"
        onClick={() => onClick(id)}
        style={{
            padding: '12px 20px',
            position: 'relative',
            color: activeTab === id ? '#0ea5e9' : '#64748b',
            background: activeTab === id ? '#f0f9ff' : 'transparent',
            border: 'none',
            fontSize: '0.95rem',
            marginRight: '8px',
            cursor: 'pointer',
            fontWeight: activeTab === id ? '600' : '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
        }}
    >
        <span>{icon}</span>
        {label}
        {activeTab === id && (
            <div style={{
                position: 'absolute',
                bottom: '-2px',
                left: '10%',
                width: '80%',
                height: '2px',
                background: '#0ea5e9',
                borderRadius: '2px'
            }} />
        )}
    </button>
)

const FormInput = ({ label, name, value, onChange, type = 'text', options = null, readOnly = false }) => (
    <div style={{ marginBottom: '20px' }}>
        <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: '#475569',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
        }}>{label}</label>
        {options ? (
            <div style={{ position: 'relative' }}>
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={readOnly}
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: readOnly ? '1px solid #e2e8f0' : '1px solid #cbd5e1',
                        backgroundColor: readOnly ? '#f1f5f9' : '#fff',
                        fontSize: '0.95rem',
                        color: readOnly ? '#64748b' : '#1e293b',
                        appearance: 'none',
                        cursor: readOnly ? 'not-allowed' : 'pointer',
                        transition: 'border-color 0.2s',
                        outline: 'none'
                    }}
                >
                    {options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
                {!readOnly && (
                    <div style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                        color: '#64748b'
                    }}>▼</div>
                )}
            </div>
        ) : (
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                readOnly={readOnly}
                style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: readOnly ? '1px solid #e2e8f0' : '1px solid #cbd5e1',
                    backgroundColor: readOnly ? '#f1f5f9' : '#fff',
                    fontSize: '0.95rem',
                    color: readOnly ? '#64748b' : '#1e293b',
                    transition: 'all 0.2s',
                    outline: 'none',
                    cursor: readOnly ? 'default' : 'text'
                }}
            />
        )}
    </div>
)

const StatusBadge = ({ label, type }) => {
    let bg = '#f1f5f9'
    let color = '#64748b'

    if (type === 'kondisi') {
        if (label === 'Siap') { bg = '#dcfce7'; color = '#166534' }
        else { bg = '#fee2e2'; color = '#991b1b' }
    } else if (type === 'status') {
        if (label === 'Operasi') { bg = '#dbeafe'; color = '#1e40af' }
        else { bg = '#fef3c7'; color = '#92400e' }
    }

    return (
        <span style={{
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '600',
            backgroundColor: bg,
            color: color,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
        }}>
            {label}
        </span>
    )
}

// --- Main Component ---

function DataHarkan() {
    // Defines the data structure
    const initialFormState = {
        // Data General
        unsur: 'KRI',
        nama: '',
        bahan: '',
        panjang_max_loa: '',
        panjang: '',
        panjang_lwl: '',
        lebar_max: '',
        lebar_garis_air: '',
        tinggi_max: '',
        draft_max: '',
        dwt: '',
        merk_mesin: '',
        type_mesin: '',

        // Lokasi
        latitude: '',
        longitude: '',

        // Spesifikasi Items
        bb: '',
        tahun_pembuatan: '',
        tahun_operasi: '',
        status_kelaikan: 'Laik',

        // Arrays for dynamic fields
        sertifikasi: [], // { nama, nomor, berlaku, catatan }
        // Changed structure: [{ nama_group, items: [{ nama_item }] }]
        pesawat: [],

        kondisi: 'Siap',
        status: 'Operasi',
        status_pemeliharaan: '',
        persentasi: '',
        permasalahan_teknis: '',
        tds: '',
        keterangan: '',

        // Files
        fotos: [] // { name, url, type }
    }

    const [items, setItems] = useState(() => {
        const stored = localStorage.getItem('dataHarkan')
        return stored ? JSON.parse(stored) : [
            {
                id: 1,
                // ...initialFormState, // Spread default first
                unsur: 'KRI',
                nama: 'KRI Teluk Banten',
                bahan: 'Baja',
                panjang_max_loa: 100,
                kondisi: 'Siap',
                status: 'Operasi',
                persentasi: 85,
                latitude: '-6.120000',
                longitude: '106.870000',
                sertifikasi: [
                    { nama: 'Sertifikat Kelaikan', nomor: '123/KL/2025', berlaku: '2026-12-31', catatan: 'Perlu perpanjangan' }
                ],
                pesawat: [
                    {
                        nama_group: 'Mesin Utama',
                        items: [
                            { nama_item: 'Piston Ring' },
                            { nama_item: 'Cylinder Head' }
                        ]
                    },
                    {
                        nama_group: 'Generator',
                        items: [
                            { nama_item: 'AVR' }
                        ]
                    }
                ],
                fotos: []
            }
        ]
    })

    // Persist to localStorage whenever items change
    React.useEffect(() => {
        localStorage.setItem('dataHarkan', JSON.stringify(items))
    }, [items])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentItem, setCurrentItem] = useState(null)
    const [activeTab, setActiveTab] = useState('general')
    const [formData, setFormData] = useState(initialFormState)
    const [isEditing, setIsEditing] = useState(false) // New state for edit mode

    const fileInputRef = useRef(null)
    const photoInputRef = useRef(null)

    // --- Actions ---

    const handleOpenModal = (item = null) => {
        if (item) {
            // Merge item with initial state to ensure arrays exist
            // Ensure deep clone or careful merge for nested arrays if needed, but simple spread usually ok for 1-level
            // For nested 'pesawat', we need to make sure we don't mutate reference if we edit deeply
            // Ideally: JSON.parse(JSON.stringify(item)) for deep clone
            const deepClone = JSON.parse(JSON.stringify(item));
            setFormData({ ...initialFormState, ...deepClone })
            setCurrentItem(item)
            setIsEditing(false) // Default to read-only for existing items
        } else {
            setFormData(initialFormState)
            setCurrentItem(null)
            setIsEditing(true) // Default to edit mode for new items
        }
        setIsModalOpen(true)
        setActiveTab('general')
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setCurrentItem(null)
        setIsEditing(false)
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Dynamic List Handlers
    const addSertifikat = () => {
        setFormData(prev => ({
            ...prev,
            sertifikasi: [...(prev.sertifikasi || []), { nama: '', nomor: '', berlaku: '', catatan: '' }]
        }))
    }

    const updateSertifikat = (index, field, value) => {
        const newSert = [...formData.sertifikasi]
        newSert[index][field] = value
        setFormData(prev => ({ ...prev, sertifikasi: newSert }))
    }

    const removeSertifikat = (index) => {
        const newSert = [...formData.sertifikasi]
        newSert.splice(index, 1)
        setFormData(prev => ({ ...prev, sertifikasi: newSert }))
    }

    // --- Nested Pesawat Handlers ---

    // Add a new "Group" (Nama Pesawat)
    const addPesawatGroup = () => {
        setFormData(prev => ({
            ...prev,
            pesawat: [...(prev.pesawat || []), { nama_group: '', items: [{ nama_item: '' }] }]
        }))
    }

    // Update the Group Name
    const updatePesawatGroup = (groupIndex, value) => {
        const newPes = JSON.parse(JSON.stringify(formData.pesawat)); // Deep clone to be safe
        newPes[groupIndex].nama_group = value;
        setFormData(prev => ({ ...prev, pesawat: newPes }))
    }

    // Remove a Group
    const removePesawatGroup = (groupIndex) => {
        const newPes = JSON.parse(JSON.stringify(formData.pesawat));
        newPes.splice(groupIndex, 1);
        setFormData(prev => ({ ...prev, pesawat: newPes }))
    }

    // Add an Item to a Group
    const addPesawatItem = (groupIndex) => {
        const newPes = JSON.parse(JSON.stringify(formData.pesawat));
        newPes[groupIndex].items.push({ nama_item: '' });
        setFormData(prev => ({ ...prev, pesawat: newPes }))
    }

    // Update an Item in a Group
    const updatePesawatItem = (groupIndex, itemIndex, value) => {
        const newPes = JSON.parse(JSON.stringify(formData.pesawat));
        newPes[groupIndex].items[itemIndex].nama_item = value;
        setFormData(prev => ({ ...prev, pesawat: newPes }))
    }

    // Remove an Item from a Group
    const removePesawatItem = (groupIndex, itemIndex) => {
        const newPes = JSON.parse(JSON.stringify(formData.pesawat));
        newPes[groupIndex].items.splice(itemIndex, 1);
        setFormData(prev => ({ ...prev, pesawat: newPes }))
    }


    // Photo Upload Handler
    const handlePhotoUpload = (e) => {
        const files = Array.from(e.target.files)
        if (files.length + formData.fotos.length > 4) {
            alert('Maksimal upload 4 foto')
            return
        }

        const newPhotos = files.map(file => ({
            name: file.name,
            type: file.type,
            url: URL.createObjectURL(file) // Preview only
        }))

        setFormData(prev => ({ ...prev, fotos: [...(prev.fotos || []), ...newPhotos] }))
    }

    const removePhoto = (index) => {
        const newPhotos = [...formData.fotos]
        newPhotos.splice(index, 1)
        setFormData(prev => ({ ...prev, fotos: newPhotos }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (currentItem) {
            setItems(prev => prev.map(item => item.id === currentItem.id ? { ...formData, id: item.id } : item))
        } else {
            setItems(prev => [...prev, { ...formData, id: Date.now() }])
        }
        handleCloseModal()
    }

    const handleDelete = () => {
        if (currentItem && window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            setItems(prev => prev.filter(item => item.id !== currentItem.id))
            handleCloseModal()
        }
    }

    // --- Import / Export Logic ---
    const getExportData = () => {
        return items.map((item, index) => ({
            'No': index + 1,
            'Unsur': item.unsur,
            'Nama': item.nama,
            'Bahan': item.bahan,
            'Kondisi': item.kondisi,
            'Status': item.status,
            'Latitude': item.latitude,
            'Longitude': item.longitude,
            'Sertifikat Count': item.sertifikasi?.length || 0,
            'Pesawat Group Count': item.pesawat?.length || 0
        }))
    }

    const handleExport = () => {
        const data = getExportData()
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Data Harkan")
        XLSX.writeFile(wb, "Data_Harkan_Export.xlsx")
    }

    const handleImportTrigger = () => {
        fileInputRef.current.click()
    }

    const handleFileChange = (e) => {
        alert('Import functionality for simple fields is active. Complex arrays require JSON import.')
    }

    return (
        <div className="fade-in" style={{ paddingBottom: '40px' }}>
            <div className="page-header" style={{ marginBottom: '32px' }}>
                <h1 className="page-title" style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b' }}>Data Harkan</h1>
                <p className="page-subtitle" style={{ color: '#64748b' }}>Manajemen Data Pemeliharaan dan Perbaikan Pangkalan</p>
            </div>

            {/* Main Content Card */}
            <div style={{
                background: '#fff',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                padding: '24px',
                border: '1px solid #f1f5f9'
            }}>
                {/* Toolbar */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}>
                    <div className="search-box" style={{ flex: 1, minWidth: '300px' }}>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem' }}>🔍</span>
                            <input
                                type="text"
                                placeholder="Cari data..."
                                style={{
                                    width: '100%',
                                    padding: '12px 12px 12px 40px',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    background: '#f8fafc',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    transition: 'all 0.2s'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept=".xlsx, .xls" />
                        <button onClick={handleImportTrigger} style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><span>📥</span> Import</button>
                        <button onClick={handleExport} style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><span>📤</span> Export</button>
                        <button onClick={() => handleOpenModal()} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#0ea5e9', color: '#fff', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.4)' }}><span>➕</span> Tambah Data</button>
                    </div>
                </div>

                {/* Table */}
                <div className="table-container" style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                                <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>No</th>
                                <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>Unsur</th>
                                <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>Nama</th>
                                <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>Bahan</th>
                                <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>Dimensi (m)</th>
                                <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>Kondisi</th>
                                <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length > 0 ? (
                                items.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        onClick={() => handleOpenModal(item)}
                                        style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s', cursor: 'pointer' }}
                                        className="hover:bg-slate-50"
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                    >
                                        <td style={{ padding: '16px', color: '#64748b' }}>{index + 1}</td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', background: '#f0f9ff', color: '#0ea5e9' }}>
                                                {item.unsur}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', fontWeight: '600', color: '#334155' }}>
                                            {item.nama}
                                        </td>
                                        <td style={{ padding: '16px', color: '#64748b' }}>{item.bahan}</td>
                                        <td style={{ padding: '16px', color: '#64748b' }}>{item.panjang_max_loa}</td>
                                        <td style={{ padding: '16px' }}><StatusBadge label={item.kondisi} type="kondisi" /></td>
                                        <td style={{ padding: '16px' }}><StatusBadge label={item.status} type="status" /></td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Belum ada data tersedia.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
                }} onClick={handleCloseModal}>
                    <div style={{
                        background: 'white', borderRadius: '24px', width: '900px', maxWidth: '100%', maxHeight: '90vh',
                        display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    }} onClick={e => e.stopPropagation()}>

                        {/* Header */}
                        <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>
                                    {currentItem ? (isEditing ? 'Edit Data Harkan' : 'Detail Data Harkan') : 'Tambah Data Harkan'}
                                </h2>
                                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                                    {isEditing ? 'Lengkapi informasi data pemeliharaan' : 'Informasi detail data pemeliharaan'}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {!isEditing && currentItem && (
                                    <button onClick={() => setIsEditing(true)} style={{ background: '#f0f9ff', color: '#0ea5e9', border: '1px solid #0ea5e9', borderRadius: '12px', padding: '8px 16px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}>
                                        ✎ Edit
                                    </button>
                                )}
                                <button onClick={handleCloseModal} style={{ background: '#f8fafc', border: 'none', borderRadius: '12px', width: '40px', height: '40px', fontSize: '1.2rem', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', padding: '12px 32px 0', borderBottom: '1px solid #f1f5f9', background: '#fff' }}>
                            <TabButton id="general" label="Data General" icon="📋" activeTab={activeTab} onClick={setActiveTab} />
                            <TabButton id="spesifikasi" label="Spesifikasi" icon="⚙️" activeTab={activeTab} onClick={setActiveTab} />
                            <TabButton id="files" label="Dokumentasi" icon="📁" activeTab={activeTab} onClick={setActiveTab} />
                        </div>

                        {/* Form Content */}
                        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '32px', background: '#f8fafc' }}>

                            {/* DATA GENERAL TAB */}
                            {activeTab === 'general' && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                                    <div style={{ gridColumn: '1 / -1', background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                        <h4 style={{ margin: '0 0 20px 0', fontSize: '1rem', color: '#1e293b' }}>Identitas Utama</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                            <FormInput label="Unsur" name="unsur" value={formData.unsur} onChange={handleInputChange} readOnly={!isEditing} options={['KRI', 'KAL', 'PAT', 'Sea Rider', 'RBB', 'RHIB', 'Tongkang']} />
                                            <FormInput label="Nama" name="nama" value={formData.nama} onChange={handleInputChange} readOnly={!isEditing} />
                                            <FormInput label="Bahan / Material" name="bahan" value={formData.bahan} onChange={handleInputChange} readOnly={!isEditing} />
                                        </div>
                                    </div>
                                    <div style={{ gridColumn: '1 / -1', background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                        <h4 style={{ margin: '0 0 20px 0', fontSize: '1rem', color: '#1e293b' }}>Lokasi Koordinat</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                            <FormInput label="Latitude" name="latitude" value={formData.latitude} onChange={handleInputChange} readOnly={!isEditing} />
                                            <FormInput label="Longitude" name="longitude" value={formData.longitude} onChange={handleInputChange} readOnly={!isEditing} />
                                        </div>
                                    </div>
                                    <div style={{ gridColumn: '1 / -1', background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                        <h4 style={{ margin: '0 0 20px 0', fontSize: '1rem', color: '#1e293b' }}>Dimensi & Ukuran</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                                            <FormInput label="Panjang LOA (m)" name="panjang_max_loa" type="number" value={formData.panjang_max_loa} onChange={handleInputChange} readOnly={!isEditing} />
                                            <FormInput label="Panjang (m)" name="panjang" type="number" value={formData.panjang} onChange={handleInputChange} readOnly={!isEditing} />
                                            <FormInput label="Panjang LWL (m)" name="panjang_lwl" type="number" value={formData.panjang_lwl} onChange={handleInputChange} readOnly={!isEditing} />
                                            <FormInput label="Lebar Max (m)" name="lebar_max" type="number" value={formData.lebar_max} onChange={handleInputChange} readOnly={!isEditing} />
                                            <FormInput label="Lebar Garis Air (m)" name="lebar_garis_air" type="number" value={formData.lebar_garis_air} onChange={handleInputChange} readOnly={!isEditing} />
                                            <FormInput label="Tinggi Max (m)" name="tinggi_max" type="number" value={formData.tinggi_max} onChange={handleInputChange} readOnly={!isEditing} />
                                            <FormInput label="Draft Max (m)" name="draft_max" type="number" value={formData.draft_max} onChange={handleInputChange} readOnly={!isEditing} />
                                            <FormInput label="DWT (ton)" name="dwt" type="number" value={formData.dwt} onChange={handleInputChange} readOnly={!isEditing} />
                                        </div>
                                    </div>
                                    <div style={{ gridColumn: '1 / -1', background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                        <h4 style={{ margin: '0 0 20px 0', fontSize: '1rem', color: '#1e293b' }}>Data Mesin</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                            <FormInput label="Merk Mesin" name="merk_mesin" value={formData.merk_mesin} onChange={handleInputChange} readOnly={!isEditing} />
                                            <FormInput label="Type Mesin" name="type_mesin" value={formData.type_mesin} onChange={handleInputChange} readOnly={!isEditing} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SPESIFIKASI TAB */}
                            {activeTab === 'spesifikasi' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                                    {/* Basic Specs */}
                                    <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                        <h4 style={{ margin: '0 0 20px 0', fontSize: '1rem', color: '#1e293b' }}>Operasional & Kelaikan</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                                            <FormInput label="Bahan Bakar" name="bb" value={formData.bb} onChange={handleInputChange} readOnly={!isEditing} />
                                            <FormInput label="Thn Pembuatan" name="tahun_pembuatan" type="number" value={formData.tahun_pembuatan} onChange={handleInputChange} readOnly={!isEditing} />
                                            <FormInput label="Thn Operasi" name="tahun_operasi" type="number" value={formData.tahun_operasi} onChange={handleInputChange} readOnly={!isEditing} />
                                            <FormInput label="Status Kelaikan" name="status_kelaikan" value={formData.status_kelaikan} onChange={handleInputChange} readOnly={!isEditing} options={['Laik', 'Tidak Laik']} />
                                        </div>
                                    </div>

                                    {/* Dynamic Sertifikasi */}
                                    <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <h4 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>Daftar Sertifikasi</h4>
                                            {isEditing && (
                                                <button type="button" onClick={addSertifikat} style={{ background: '#0ea5e9', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>+ Tambah Sertifikat</button>
                                            )}
                                        </div>

                                        {formData.sertifikasi && formData.sertifikasi.map((sert, index) => (
                                            <div key={index} style={{ marginBottom: '16px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <span style={{ fontWeight: '600', color: '#64748b' }}>#{index + 1}</span>
                                                    {isEditing && (
                                                        <button type="button" onClick={() => removeSertifikat(index)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Hapus</button>
                                                    )}
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                                    <input type="text" placeholder="Nama Sertifikat" value={sert.nama} onChange={(e) => updateSertifikat(index, 'nama', e.target.value)} readOnly={!isEditing} style={{ padding: '8px', borderRadius: '6px', border: isEditing ? '1px solid #cbd5e1' : '1px solid #e2e8f0', background: isEditing ? '#fff' : '#f1f5f9' }} />
                                                    <input type="text" placeholder="Nomor" value={sert.nomor} onChange={(e) => updateSertifikat(index, 'nomor', e.target.value)} readOnly={!isEditing} style={{ padding: '8px', borderRadius: '6px', border: isEditing ? '1px solid #cbd5e1' : '1px solid #e2e8f0', background: isEditing ? '#fff' : '#f1f5f9' }} />
                                                    <input type="date" value={sert.berlaku} onChange={(e) => updateSertifikat(index, 'berlaku', e.target.value)} readOnly={!isEditing} style={{ padding: '8px', borderRadius: '6px', border: isEditing ? '1px solid #cbd5e1' : '1px solid #e2e8f0', background: isEditing ? '#fff' : '#f1f5f9' }} />
                                                </div>
                                                <input type="text" placeholder="Catatan Sertifikat..." value={sert.catatan} onChange={(e) => updateSertifikat(index, 'catatan', e.target.value)} readOnly={!isEditing} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: isEditing ? '1px solid #cbd5e1' : '1px solid #e2e8f0', background: isEditing ? '#fff' : '#f1f5f9' }} />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Dynamic Pesawat/Peralatan With Groups */}
                                    <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <h4 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>Daftar Pesawat / Peralatan</h4>
                                            {isEditing && (
                                                <button type="button" onClick={addPesawatGroup} style={{ background: '#0ea5e9', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>+ Tambah Nama Pesawat</button>
                                            )}
                                        </div>

                                        {formData.pesawat && formData.pesawat.map((group, groupIndex) => (
                                            <div key={groupIndex} style={{ marginBottom: '24px', padding: '20px', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                                    <input
                                                        type="text"
                                                        placeholder="Nama Pesawat (ex: Mesin Utama)"
                                                        value={group.nama_group}
                                                        onChange={(e) => updatePesawatGroup(groupIndex, e.target.value)}
                                                        readOnly={!isEditing}
                                                        style={{
                                                            flex: 1, padding: '10px 14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem',
                                                            border: isEditing ? '1px solid #38bdf8' : '1px solid transparent',
                                                            background: isEditing ? '#fff' : 'transparent', color: '#0369a1'
                                                        }}
                                                    />
                                                    {isEditing && (
                                                        <button type="button" onClick={() => removePesawatGroup(groupIndex)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Hapus Grup</button>
                                                    )}
                                                </div>

                                                <div style={{ paddingLeft: '16px', borderLeft: '2px solid #e0f2fe' }}>
                                                    {group.items.map((item, itemIndex) => (
                                                        <div key={itemIndex} style={{ display: 'flex', gap: '12px', marginBottom: '8px', alignItems: 'center' }}>
                                                            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>•</span>
                                                            <input
                                                                type="text"
                                                                placeholder="Item Detail (ex: Piston)"
                                                                value={item.nama_item}
                                                                onChange={(e) => updatePesawatItem(groupIndex, itemIndex, e.target.value)}
                                                                readOnly={!isEditing}
                                                                style={{
                                                                    flex: 1, padding: '8px', borderRadius: '6px',
                                                                    border: isEditing ? '1px solid #cbd5e1' : '1px solid #e2e8f0',
                                                                    background: isEditing ? '#fff' : '#f8fafc'
                                                                }}
                                                            />
                                                            {isEditing && (
                                                                <button type="button" onClick={() => removePesawatItem(groupIndex, itemIndex)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {isEditing && (
                                                        <button
                                                            type="button"
                                                            onClick={() => addPesawatItem(groupIndex)}
                                                            style={{
                                                                marginTop: '8px', background: 'none', border: 'none', color: '#0ea5e9',
                                                                cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px'
                                                            }}
                                                        >
                                                            + Tambah Item
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Tech Issues */}
                                    <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                        <h4 style={{ margin: '0 0 20px 0', fontSize: '1rem', color: '#1e293b' }}>Info Teknis & Kondisi</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '16px' }}>
                                            <FormInput label="Kondisi" name="kondisi" value={formData.kondisi} onChange={handleInputChange} readOnly={!isEditing} options={['Siap', 'Tidak Siap']} />
                                            <FormInput label="Status" name="status" value={formData.status} onChange={handleInputChange} readOnly={!isEditing} options={['Pangkalan', 'Operasi']} />
                                            <FormInput label="Persentasi (%)" name="persentasi" type="number" value={formData.persentasi} onChange={handleInputChange} readOnly={!isEditing} />
                                            <FormInput label="TDS" name="tds" value={formData.tds} onChange={handleInputChange} readOnly={!isEditing} />
                                        </div>
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#475569', textTransform: 'uppercase' }}>Permasalahan Teknis</label>
                                            <textarea name="permasalahan_teknis" value={formData.permasalahan_teknis} onChange={handleInputChange} readOnly={!isEditing} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: isEditing ? '1px solid #e2e8f0' : '1px solid #e2e8f0', background: isEditing ? '#fff' : '#f1f5f9', minHeight: '80px', fontFamily: 'inherit' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#475569', textTransform: 'uppercase' }}>Keterangan Tambahan</label>
                                            <textarea name="keterangan" value={formData.keterangan} onChange={handleInputChange} readOnly={!isEditing} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: isEditing ? '1px solid #e2e8f0' : '1px solid #e2e8f0', background: isEditing ? '#fff' : '#f1f5f9', minHeight: '80px', fontFamily: 'inherit' }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* FILES TAB */}
                            {activeTab === 'files' && (
                                <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                    {isEditing && (
                                        <div style={{ border: '2px dashed #cbd5e1', borderRadius: '16px', padding: '40px', marginBottom: '24px', background: '#f8fafc' }}>
                                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📷</div>
                                            <h3 style={{ margin: '0 0 8px', color: '#1e293b' }}>Upload Foto Dokumentasi</h3>
                                            <p style={{ margin: '0 0 24px', color: '#64748b' }}>Format: PNG, JPEG, PDF (Max 4 File)</p>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/png, image/jpeg, application/pdf"
                                                ref={photoInputRef}
                                                style={{ display: 'none' }}
                                                onChange={handlePhotoUpload}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => photoInputRef.current.click()}
                                                style={{ background: '#0ea5e9', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                                            >
                                                Pilih File
                                            </button>
                                        </div>
                                    )}

                                    {formData.fotos && formData.fotos.length > 0 ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
                                            {formData.fotos.map((file, index) => (
                                                <div key={index} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', aspectRatio: '1' }}>
                                                    {file.type.includes('image') ? (
                                                        <img src={file.url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', color: '#64748b' }}>PDF</div>
                                                    )}
                                                    {isEditing && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removePhoto(index)}
                                                            style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
                                                        >
                                                            ×
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        !isEditing && <div style={{ color: '#94a3b8', padding: '24px' }}>Tidak ada dokumentasi.</div>
                                    )}
                                </div>
                            )}

                            {/* Footer Actions */}
                            <div style={{
                                marginTop: '32px', padding: '24px', background: '#fff', borderTop: '1px solid #f1f5f9',
                                display: 'flex', justifyContent: 'space-between', gap: '16px',
                                margin: '0 -32px -32px -32px',
                                borderRadius: '0 0 24px 24px'
                            }}>
                                <div>
                                    {isEditing && currentItem && (
                                        <button type="button" onClick={handleDelete} style={{
                                            padding: '12px 24px', borderRadius: '12px', border: '1px solid #fee2e2',
                                            background: '#fff', cursor: 'pointer', fontWeight: '600', color: '#ef4444'
                                        }}>Hapus Data</button>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button type="button" onClick={handleCloseModal} style={{
                                        padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0',
                                        background: '#fff', cursor: 'pointer', fontWeight: '600', color: '#64748b'
                                    }}>Tutup</button>
                                    {isEditing && (
                                        <button type="submit" style={{
                                            padding: '12px 24px', borderRadius: '12px', border: 'none',
                                            background: '#0ea5e9', cursor: 'pointer', fontWeight: '600', color: '#fff',
                                            boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.4)'
                                        }}>Simpan Data</button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DataHarkan
