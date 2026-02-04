import { useState, useRef, useEffect } from 'react'
import * as XLSX from 'xlsx'

// Font system modern
const FONT_SYSTEM = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
const FONT_MONO = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'

// Dropdown options
const OPTIONS = {
    provinsi: [
        'Aceh',
        'Sumatera Utara',
        'Sumatera Barat',
        'Riau',
        'Kepulauan Riau',
        'Jambi',
        'Sumatera Selatan',
        'Bangka Belitung',
        'Bengkulu',
        'Lampung',
        'DKI Jakarta',
        'Banten',
        'Jawa Barat',
        'Jawa Tengah',
        'DI Yogyakarta',
        'Jawa Timur',
        'Bali',
        'Nusa Tenggara Barat',
        'Nusa Tenggara Timur',
        'Kalimantan Barat',
        'Kalimantan Tengah',
        'Kalimantan Selatan',
        'Kalimantan Timur',
        'Kalimantan Utara',
        'Sulawesi Utara',
        'Sulawesi Tengah',
        'Sulawesi Selatan',
        'Sulawesi Tenggara',
        'Gorontalo',
        'Sulawesi Barat',
        'Maluku',
        'Maluku Utara',
        'Papua',
        'Papua Barat'
    ],
    frekuensi: [50, 60],
    tegangan: [220, 380, 440],
    sumber_listrik: ['PLN', 'Genset', 'Tenaga Surya', 'PLN & Genset', 'Hybrid'],
    sumber_air: ['PDAM', 'Sumur Bor', 'Tangki', 'Desalinasi', 'Lainnya'],
    bbm: ['Solar', 'Pertamax', 'Solar & Pertamax', 'Tidak Ada', 'Lainnya']
}

// Mapping Wilayah/Kota berdasarkan Provinsi
const WILAYAH_BY_PROVINSI = {
    'Aceh': ['Banda Aceh', 'Sabang', 'Lhokseumawe', 'Langsa', 'Subulussalam', 'Aceh Besar', 'Aceh Barat', 'Aceh Selatan', 'Aceh Timur', 'Aceh Utara', 'Aceh Tengah', 'Aceh Tenggara', 'Aceh Barat Daya', 'Aceh Jaya', 'Aceh Singkil', 'Aceh Tamiang', 'Bener Meriah', 'Bireuen', 'Gayo Lues', 'Nagan Raya', 'Pidie', 'Pidie Jaya', 'Simeulue'],
    'Sumatera Utara': ['Medan', 'Binjai', 'Pematangsiantar', 'Tanjungbalai', 'Tebing Tinggi', 'Padang Sidempuan', 'Gunungsitoli', 'Asahan', 'Batubara', 'Dairi', 'Deli Serdang', 'Humbang Hasundutan', 'Karo', 'Labuhanbatu', 'Labuhanbatu Selatan', 'Labuhanbatu Utara', 'Langkat', 'Mandailing Natal', 'Nias', 'Nias Barat', 'Nias Selatan', 'Nias Utara', 'Padang Lawas', 'Padang Lawas Utara', 'Pakpak Bharat', 'Samosir', 'Serdang Bedagai', 'Simalungun', 'Tapanuli Selatan', 'Tapanuli Tengah', 'Tapanuli Utara', 'Toba Samosir'],
    'Sumatera Barat': ['Padang', 'Bukittinggi', 'Padang Panjang', 'Pariaman', 'Payakumbuh', 'Sawahlunto', 'Solok', 'Agam', 'Dharmasraya', 'Kepulauan Mentawai', 'Lima Puluh Kota', 'Padang Pariaman', 'Pasaman', 'Pasaman Barat', 'Pesisir Selatan', 'Sijunjung', 'Solok', 'Solok Selatan', 'Tanah Datar'],
    'Riau': ['Pekanbaru', 'Dumai', 'Bengkalis', 'Indragiri Hilir', 'Indragiri Hulu', 'Kampar', 'Kepulauan Meranti', 'Kuantan Singingi', 'Pelalawan', 'Rokan Hilir', 'Rokan Hulu', 'Siak'],
    'Kepulauan Riau': ['Batam', 'Tanjung Pinang', 'Bintan', 'Karimun', 'Kepulauan Anambas', 'Lingga', 'Natuna'],
    'Jambi': ['Jambi', 'Sungai Penuh', 'Batang Hari', 'Bungo', 'Kerinci', 'Merangin', 'Muaro Jambi', 'Sarolangun', 'Tanjung Jabung Barat', 'Tanjung Jabung Timur', 'Tebo'],
    'Sumatera Selatan': ['Palembang', 'Lubuklinggau', 'Pagar Alam', 'Prabumulih', 'Banyuasin', 'Empat Lawang', 'Lahat', 'Muara Enim', 'Musi Banyuasin', 'Musi Rawas', 'Musi Rawas Utara', 'Ogan Ilir', 'Ogan Komering Ilir', 'Ogan Komering Ulu', 'Ogan Komering Ulu Selatan', 'Ogan Komering Ulu Timur', 'Penukal Abab Lematang Ilir'],
    'Bangka Belitung': ['Pangkal Pinang', 'Bangka', 'Bangka Barat', 'Bangka Selatan', 'Bangka Tengah', 'Belitung', 'Belitung Timur'],
    'Bengkulu': ['Bengkulu', 'Bengkulu Selatan', 'Bengkulu Tengah', 'Bengkulu Utara', 'Kaur', 'Kepahiang', 'Lebong', 'Mukomuko', 'Rejang Lebong', 'Seluma'],
    'Lampung': ['Bandar Lampung', 'Metro', 'Lampung Barat', 'Lampung Selatan', 'Lampung Tengah', 'Lampung Timur', 'Lampung Utara', 'Mesuji', 'Pesawaran', 'Pesisir Barat', 'Pringsewu', 'Tanggamus', 'Tulang Bawang', 'Tulang Bawang Barat', 'Way Kanan'],
    'DKI Jakarta': ['Jakarta Pusat', 'Jakarta Utara', 'Jakarta Barat', 'Jakarta Selatan', 'Jakarta Timur', 'Kepulauan Seribu'],
    'Banten': ['Serang', 'Tangerang', 'Cilegon', 'Tangerang Selatan', 'Lebak', 'Pandeglang', 'Serang', 'Tangerang'],
    'Jawa Barat': ['Bandung', 'Bekasi', 'Bogor', 'Cimahi', 'Cirebon', 'Depok', 'Sukabumi', 'Tasikmalaya', 'Banjar', 'Bandung', 'Bandung Barat', 'Bekasi', 'Bogor', 'Ciamis', 'Cianjur', 'Cirebon', 'Garut', 'Indramayu', 'Karawang', 'Kuningan', 'Majalengka', 'Pangandaran', 'Purwakarta', 'Subang', 'Sukabumi', 'Sumedang', 'Tasikmalaya'],
    'Jawa Tengah': ['Semarang', 'Magelang', 'Pekalongan', 'Salatiga', 'Surakarta', 'Tegal', 'Banjarnegara', 'Banyumas', 'Batang', 'Blora', 'Boyolali', 'Brebes', 'Cilacap', 'Demak', 'Grobogan', 'Jepara', 'Karanganyar', 'Kebumen', 'Kendal', 'Klaten', 'Kudus', 'Magelang', 'Pati', 'Pekalongan', 'Pemalang', 'Purbalingga', 'Purworejo', 'Rembang', 'Semarang', 'Sragen', 'Sukoharjo', 'Tegal', 'Temanggung', 'Wonogiri', 'Wonosobo'],
    'DI Yogyakarta': ['Yogyakarta', 'Bantul', 'Gunung Kidul', 'Kulon Progo', 'Sleman'],
    'Jawa Timur': ['Surabaya', 'Batu', 'Blitar', 'Kediri', 'Madiun', 'Malang', 'Mojokerto', 'Pasuruan', 'Probolinggo', 'Bangkalan', 'Banyuwangi', 'Blitar', 'Bojonegoro', 'Bondowoso', 'Gresik', 'Jember', 'Jombang', 'Kediri', 'Lamongan', 'Lumajang', 'Madiun', 'Magetan', 'Malang', 'Mojokerto', 'Nganjuk', 'Ngawi', 'Pacitan', 'Pamekasan', 'Pasuruan', 'Ponorogo', 'Probolinggo', 'Sampang', 'Sidoarjo', 'Situbondo', 'Sumenep', 'Trenggalek', 'Tuban', 'Tulungagung'],
    'Bali': ['Denpasar', 'Badung', 'Bangli', 'Buleleng', 'Gianyar', 'Jembrana', 'Karangasem', 'Klungkung', 'Tabanan'],
    'Nusa Tenggara Barat': ['Mataram', 'Bima', 'Bima', 'Dompu', 'Lombok Barat', 'Lombok Tengah', 'Lombok Timur', 'Lombok Utara', 'Sumbawa', 'Sumbawa Barat'],
    'Nusa Tenggara Timur': ['Kupang', 'Alor', 'Belu', 'Ende', 'Flores Timur', 'Kupang', 'Lembata', 'Malaka', 'Manggarai', 'Manggarai Barat', 'Manggarai Timur', 'Nagekeo', 'Ngada', 'Rote Ndao', 'Sabu Raijua', 'Sikka', 'Sumba Barat', 'Sumba Barat Daya', 'Sumba Tengah', 'Sumba Timur', 'Timor Tengah Selatan', 'Timor Tengah Utara'],
    'Kalimantan Barat': ['Pontianak', 'Singkawang', 'Bengkayang', 'Kapuas Hulu', 'Kayong Utara', 'Ketapang', 'Kubu Raya', 'Landak', 'Melawi', 'Mempawah', 'Sambas', 'Sanggau', 'Sekadau', 'Sintang'],
    'Kalimantan Tengah': ['Palangka Raya', 'Barito Selatan', 'Barito Timur', 'Barito Utara', 'Gunung Mas', 'Kapuas', 'Katingan', 'Kotawaringin Barat', 'Kotawaringin Timur', 'Lamandau', 'Murung Raya', 'Pulang Pisau', 'Seruyan', 'Sukamara'],
    'Kalimantan Selatan': ['Banjarmasin', 'Banjarbaru', 'Balangan', 'Banjar', 'Barito Kuala', 'Hulu Sungai Selatan', 'Hulu Sungai Tengah', 'Hulu Sungai Utara', 'Kotabaru', 'Tabalong', 'Tanah Bumbu', 'Tanah Laut', 'Tapin'],
    'Kalimantan Timur': ['Samarinda', 'Balikpapan', 'Bontang', 'Berau', 'Kutai Barat', 'Kutai Kartanegara', 'Kutai Timur', 'Mahakam Ulu', 'Paser', 'Penajam Paser Utara'],
    'Kalimantan Utara': ['Tarakan', 'Bulungan', 'Malinau', 'Nunukan', 'Tana Tidung'],
    'Sulawesi Utara': ['Manado', 'Bitung', 'Kotamobagu', 'Tomohon', 'Bolaang Mongondow', 'Bolaang Mongondow Selatan', 'Bolaang Mongondow Timur', 'Bolaang Mongondow Utara', 'Kepulauan Sangihe', 'Kepulauan Siau Tagulandang Biaro', 'Kepulauan Talaud', 'Minahasa', 'Minahasa Selatan', 'Minahasa Tenggara', 'Minahasa Utara'],
    'Sulawesi Tengah': ['Palu', 'Banggai', 'Banggai Kepulauan', 'Banggai Laut', 'Buol', 'Donggala', 'Morowali', 'Morowali Utara', 'Parigi Moutong', 'Poso', 'Sigi', 'Tojo Una-Una', 'Toli-Toli'],
    'Sulawesi Selatan': ['Makassar', 'Palopo', 'Parepare', 'Bantaeng', 'Barru', 'Bone', 'Bulukumba', 'Enrekang', 'Gowa', 'Jeneponto', 'Kepulauan Selayar', 'Luwu', 'Luwu Timur', 'Luwu Utara', 'Maros', 'Pangkajene dan Kepulauan', 'Pinrang', 'Sidenreng Rappang', 'Sinjai', 'Soppeng', 'Takalar', 'Tana Toraja', 'Toraja Utara', 'Wajo'],
    'Sulawesi Tenggara': ['Kendari', 'Bau-Bau', 'Bombana', 'Buton', 'Buton Selatan', 'Buton Tengah', 'Buton Utara', 'Kolaka', 'Kolaka Timur', 'Kolaka Utara', 'Konawe', 'Konawe Kepulauan', 'Konawe Selatan', 'Konawe Utara', 'Muna', 'Muna Barat', 'Wakatobi'],
    'Gorontalo': ['Gorontalo', 'Boalemo', 'Bone Bolango', 'Gorontalo', 'Gorontalo Utara', 'Pohuwato'],
    'Sulawesi Barat': ['Mamuju', 'Majene', 'Mamasa', 'Mamuju', 'Mamuju Tengah', 'Mamuju Utara', 'Polewali Mandar'],
    'Maluku': ['Ambon', 'Tual', 'Buru', 'Buru Selatan', 'Kepulauan Aru', 'Maluku Barat Daya', 'Maluku Tengah', 'Maluku Tenggara', 'Maluku Tenggara Barat', 'Seram Bagian Barat', 'Seram Bagian Timur'],
    'Maluku Utara': ['Ternate', 'Tidore Kepulauan', 'Halmahera Barat', 'Halmahera Selatan', 'Halmahera Tengah', 'Halmahera Timur', 'Halmahera Utara', 'Kepulauan Sula', 'Pulau Morotai', 'Pulau Taliabu'],
    'Papua': ['Jayapura', 'Asmat', 'Biak Numfor', 'Boven Digoel', 'Deiyai', 'Dogiyai', 'Intan Jaya', 'Jayapura', 'Jayawijaya', 'Keerom', 'Kepulauan Yapen', 'Lanny Jaya', 'Mamberamo Raya', 'Mamberamo Tengah', 'Mappi', 'Merauke', 'Mimika', 'Nabire', 'Nduga', 'Paniai', 'Pegunungan Bintang', 'Puncak', 'Puncak Jaya', 'Sarmi', 'Supiori', 'Tolikara', 'Waropen', 'Yahukimo', 'Yalimo'],
    'Papua Barat': ['Manokwari', 'Sorong', 'Fakfak', 'Kaimana', 'Manokwari', 'Manokwari Selatan', 'Maybrat', 'Pegunungan Arfak', 'Raja Ampat', 'Sorong', 'Sorong Selatan', 'Tambrauw', 'Teluk Bintuni', 'Teluk Wondama']
}

function Faslabuh() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedItem, setSelectedItem] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const fileInputRef = useRef(null)

    // Import states
    const [importMode, setImportMode] = useState('upsert')
    const [previewData, setPreviewData] = useState([])
    const [showPreview, setShowPreview] = useState(false)
    const [importing, setImporting] = useState(false)
    const [importProgress, setImportProgress] = useState(0)

    // Fetch data from API
    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/faslabuh')
            if (!response.ok) throw new Error('Failed to fetch data')
            const result = await response.json()

            // Parse JSON fields
            const parsedData = result.map(item => ({
                ...item,
                sandar_items: typeof item.sandar_items === 'string' ? JSON.parse(item.sandar_items) : item.sandar_items || [],
                fotos: typeof item.fotos === 'string' ? JSON.parse(item.fotos) : item.fotos || []
            }))

            setData(parsedData)
        } catch (error) {
            console.error('Error fetching faslabuh data:', error)
            alert('❌ Gagal memuat data: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleAddNew = () => {
        setSelectedItem({
            provinsi: '', wilayah: '', lokasi: '', nama_dermaga: '', konstruksi: '',
            lon: 0, lat: 0,
            kode_barang: '', no_sertifikat: '', tgl_sertifikat: '',
            panjang: 0, lebar: 0, luas: 0,
            draft_lwl: 0, pasut_hwl_lwl: 0, kondisi: 0,
            sandar_items: [{ tipe: '', ton: 0, jumlah: 0 }],
            plat_mst_ton: 0, plat_jenis_ranmor: '', plat_berat_max_ton: 0,
            listrik_jml_titik: 0, listrik_kap_amp: 0, listrik_tegangan_volt: 220,
            listrik_frek_hz: 50, listrik_sumber: 'PLN', listrik_daya_kva: 0,
            air_gwt_m3: 0, air_debit_m3_jam: 0, air_sumber: 'PDAM',
            bbm: 'Solar', hydrant: '', keterangan: '', fotos: []
        })
        setIsEditMode(true)
        setIsModalOpen(true)
    }

    const handleRowClick = (item) => {
        if (editingId === item.id) return
        setEditingId(item.id)
        setSelectedItem({ ...item })
        setIsEditMode(true)
        setIsModalOpen(true)
    }

    const handleViewDetail = (item) => {
        setSelectedItem({ ...item })
        setIsEditMode(false)
        setIsModalOpen(true)
    }

    const handleDelete = async (id) => {
        if (!confirm('⚠️ Yakin ingin menghapus data ini?')) return

        try {
            const response = await fetch(`/api/faslabuh/${id}`, {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Failed to delete')

            alert('✅ Data berhasil dihapus!')
            setIsModalOpen(false)
            setEditingId(null)
            fetchData() // Refresh data
        } catch (error) {
            console.error('Error deleting:', error)
            alert('❌ Gagal menghapus data: ' + error.message)
        }
    }

    const handleSave = async (e) => {
        e.preventDefault()

        const updated = {
            ...selectedItem,
            luas: selectedItem.panjang * selectedItem.lebar
        }

        try {
            const isNew = !updated.id
            const url = isNew ? '/api/faslabuh' : `/api/faslabuh/${updated.id}`
            const method = isNew ? 'POST' : 'PUT'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
            })

            if (!response.ok) throw new Error('Failed to save')

            alert('✅ Data berhasil disimpan!')
            setIsEditMode(false)
            setIsModalOpen(false)
            setEditingId(null)
            fetchData() // Refresh data
        } catch (error) {
            console.error('Error saving:', error)
            alert('❌ Gagal menyimpan data: ' + error.message)
        }
    }

    const handleCancel = () => {
        setIsEditMode(false)
        setIsModalOpen(false)
        setEditingId(null)
        setSelectedItem(null)
    }

    // Sandar items management
    const addSandarItem = () => {
        setSelectedItem(prev => ({
            ...prev,
            sandar_items: [...prev.sandar_items, { tipe: '', ton: 0, jumlah: 0 }]
        }))
    }

    const removeSandarItem = (index) => {
        setSelectedItem(prev => ({
            ...prev,
            sandar_items: prev.sandar_items.filter((_, i) => i !== index)
        }))
    }

    const updateSandarItem = (index, field, value) => {
        setSelectedItem(prev => ({
            ...prev,
            sandar_items: prev.sandar_items.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }))
    }

    const handleExport = () => {
        const excelData = data.map(item => ({
            'Provinsi': item.provinsi,
            'Lokasi': item.lokasi,
            'Nama Dermaga': item.nama_dermaga,
            'Konstruksi': item.konstruksi,
            'Longitude': item.lon,
            'Latitude': item.lat,
            'Panjang (m)': item.panjang,
            'Lebar (m)': item.lebar,
            'Luas (m²)': item.luas,
            'Draft LWL (m)': item.draft_lwl,
            'Pasut HWL-LWL (m)': item.pasut_hwl_lwl,
            'Kondisi (%)': item.kondisi,
            'Sandar Items': JSON.stringify(item.sandar_items),
            'Plat MST (ton)': item.plat_mst_ton,
            'Plat Jenis Ranmor': item.plat_jenis_ranmor,
            'Plat Berat Max (ton)': item.plat_berat_max_ton,
            'Listrik Jml Titik': item.listrik_jml_titik,
            'Listrik Kap (Amp)': item.listrik_kap_amp,
            'Listrik Tegangan (Volt)': item.listrik_tegangan_volt,
            'Listrik Frek (Hz)': item.listrik_frek_hz,
            'Listrik Sumber': item.listrik_sumber,
            'Listrik Daya (kVA)': item.listrik_daya_kva,
            'Air GWT (m³)': item.air_gwt_m3,
            'Air Debit (m³/jam)': item.air_debit_m3_jam,
            'Air Sumber': item.air_sumber,
            'BBM': item.bbm,
            'Hydrant': item.hydrant,
            'Keterangan': item.keterangan
        }))

        const ws = XLSX.utils.json_to_sheet(excelData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Faslabuh")
        XLSX.writeFile(wb, "Data_Faslabuh.xlsx")
    }

    const handleExportTemplate = () => {
        // Create template with headers only (empty data)
        const templateHeaders = {
            'Provinsi': '',
            'Wilayah': '',
            'Lokasi': '',
            'Nama Dermaga': '',
            'Konstruksi': '',
            'Kode Barang': '',
            'No Sertifikat': '',
            'Tgl Sertifikat': '',
            'Longitude': '',
            'Latitude': '',
            'Panjang (m)': '',
            'Lebar (m)': '',
            'Draft LWL (m)': '',
            'Pasut HWL-LWL (m)': '',
            'Kondisi (%)': '',
            'Sandar Tipe 1': '',
            'Sandar Ton 1': '',
            'Sandar Jumlah 1': '',
            'Sandar Tipe 2': '',
            'Sandar Ton 2': '',
            'Sandar Jumlah 2': '',
            'Sandar Tipe 3': '',
            'Sandar Ton 3': '',
            'Sandar Jumlah 3': '',
            'Sandar Tipe 4': '',
            'Sandar Ton 4': '',
            'Sandar Jumlah 4': '',
            'Sandar Tipe 5': '',
            'Sandar Ton 5': '',
            'Sandar Jumlah 5': '',
            'Plat MST (ton)': '',
            'Plat Jenis Ranmor': '',
            'Plat Berat Max (ton)': '',
            'Listrik Jml Titik': '',
            'Listrik Kap (Amp)': '',
            'Listrik Tegangan (Volt)': '',
            'Listrik Frek (Hz)': '',
            'Listrik Sumber': '',
            'Listrik Daya (kVA)': '',
            'Air GWT (m³)': '',
            'Air Debit (m³/jam)': '',
            'Air Sumber': '',
            'BBM': '',
            'Hydrant': '',
            'Keterangan': ''
        }

        // Create 3 example rows for guidance
        const templateData = [
            templateHeaders,
            {
                'Provinsi': 'DKI Jakarta',
                'Wilayah': 'Jakarta Utara',
                'Lokasi': 'Tanjung Priok',
                'Nama Dermaga': 'Dermaga Contoh 1',
                'Konstruksi': 'Beton Bertulang',
                'Kode Barang': '03.01.01.01.001',
                'No Sertifikat': 'SHM-12345/2020',
                'Tgl Sertifikat': '2020-05-15',
                'Longitude': '106.8839',
                'Latitude': '-6.1085',
                'Panjang (m)': '150',
                'Lebar (m)': '20',
                'Draft LWL (m)': '8.5',
                'Pasut HWL-LWL (m)': '1.5',
                'Kondisi (%)': '90',
                'Sandar Tipe 1': 'Fregat',
                'Sandar Ton 1': '5000',
                'Sandar Jumlah 1': '2',
                'Sandar Tipe 2': 'Korvet',
                'Sandar Ton 2': '2500',
                'Sandar Jumlah 2': '3',
                'Sandar Tipe 3': 'Kapal Patroli',
                'Sandar Ton 3': '1000',
                'Sandar Jumlah 3': '4',
                'Sandar Tipe 4': '',
                'Sandar Ton 4': '',
                'Sandar Jumlah 4': '',
                'Sandar Tipe 5': '',
                'Sandar Ton 5': '',
                'Sandar Jumlah 5': '',
                'Plat MST (ton)': '45',
                'Plat Jenis Ranmor': 'Truck',
                'Plat Berat Max (ton)': '25',
                'Listrik Jml Titik': '4',
                'Listrik Kap (Amp)': '200',
                'Listrik Tegangan (Volt)': '380',
                'Listrik Frek (Hz)': '50',
                'Listrik Sumber': 'PLN & Genset',
                'Listrik Daya (kVA)': '500',
                'Air GWT (m³)': '100',
                'Air Debit (m³/jam)': '50',
                'Air Sumber': 'PDAM',
                'BBM': 'Solar & Pertamax',
                'Hydrant': 'Ada - 2 Unit',
                'Keterangan': 'Kondisi baik'
            },
            templateHeaders // Empty row for user input
        ]

        const ws = XLSX.utils.json_to_sheet(templateData)

        // Set column widths
        ws['!cols'] = [
            { wch: 15 }, { wch: 20 }, { wch: 25 }, { wch: 20 }, { wch: 18 },
            { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
            { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 15 },
            { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 15 },
            { wch: 15 }, { wch: 20 }, { wch: 18 }, { wch: 15 }, { wch: 15 },
            { wch: 18 }, { wch: 12 }, { wch: 18 }, { wch: 15 }, { wch: 15 },
            { wch: 18 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 30 }
        ]

        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Template Faslabuh")
        XLSX.writeFile(wb, "Template_Faslabuh.xlsx")

        alert('✅ Template berhasil didownload!\n\nPetunjuk:\n- Baris 1: Header (jangan diubah)\n- Baris 2: Contoh data\n- Baris 3+: Isi data Anda')
    }

    const handleFileUpload = (e) => {
        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const wb = XLSX.read(event.target.result, { type: 'binary' })
                const wsname = wb.SheetNames[0]
                const ws = wb.Sheets[wsname]
                const jsonData = XLSX.utils.sheet_to_json(ws)

                if (jsonData.length === 0) {
                    alert('❌ File Excel kosong!')
                    return
                }

                // Map Excel columns to database fields
                const mappedData = jsonData.map((row, index) => ({
                    _rowNumber: index + 2, // Excel row (header is 1)
                    provinsi: row['Provinsi'] || '',
                    wilayah: row['Wilayah'] || '',
                    lokasi: row['Lokasi'] || '',
                    nama_dermaga: row['Nama Dermaga'] || '',
                    konstruksi: row['Konstruksi'] || '',
                    kode_barang: row['Kode Barang'] || '',
                    no_sertifikat: row['No Sertifikat'] || '',
                    tgl_sertifikat: row['Tgl Sertifikat'] || '',
                    lon: parseFloat(row['Longitude']) || 0,
                    lat: parseFloat(row['Latitude']) || 0,
                    panjang: parseFloat(row['Panjang (m)']) || 0,
                    lebar: parseFloat(row['Lebar (m)']) || 0,
                    draft_lwl: parseFloat(row['Draft LWL (m)']) || 0,
                    pasut_hwl_lwl: parseFloat(row['Pasut HWL-LWL (m)']) || 0,
                    kondisi: parseInt(row['Kondisi (%)']) || 0,
                    // Sandar items - parse from multiple columns
                    sandar_items: [],
                    plat_mst_ton: parseFloat(row['Plat MST (ton)']) || 0,
                    plat_jenis_ranmor: row['Plat Jenis Ranmor'] || '',
                    plat_berat_max_ton: parseFloat(row['Plat Berat Max (ton)']) || 0,
                    listrik_jml_titik: parseInt(row['Listrik Jml Titik']) || 0,
                    listrik_kap_amp: parseFloat(row['Listrik Kap (Amp)']) || 0,
                    listrik_tegangan_volt: parseInt(row['Listrik Tegangan (Volt)']) || 220,
                    listrik_frek_hz: parseInt(row['Listrik Frek (Hz)']) || 50,
                    listrik_sumber: row['Listrik Sumber'] || 'PLN',
                    listrik_daya_kva: parseFloat(row['Listrik Daya (kVA)']) || 0,
                    air_gwt_m3: parseFloat(row['Air GWT (m³)']) || 0,
                    air_debit_m3_jam: parseFloat(row['Air Debit (m³/jam)']) || 0,
                    air_sumber: row['Air Sumber'] || 'PDAM',
                    bbm: row['BBM'] || 'Solar',
                    hydrant: row['Hydrant'] || '',
                    keterangan: row['Keterangan'] || ''
                }))

                // Parse sandar items from columns
                mappedData.forEach(item => {
                    const sandarItems = []
                    for (let i = 1; i <= 5; i++) {
                        const tipe = jsonData[item._rowNumber - 2][`Sandar Tipe ${i}`]
                        const ton = jsonData[item._rowNumber - 2][`Sandar Ton ${i}`]
                        const jumlah = jsonData[item._rowNumber - 2][`Sandar Jumlah ${i}`]

                        if (tipe && ton && jumlah) {
                            sandarItems.push({
                                tipe: String(tipe),
                                ton: parseFloat(ton) || 0,
                                jumlah: parseInt(jumlah) || 0
                            })
                        }
                    }
                    item.sandar_items = sandarItems
                })

                setPreviewData(mappedData)
                setShowPreview(true)
                alert(`✅ File berhasil dibaca!\n\nTotal: ${mappedData.length} baris data\n\nSilakan preview dan pilih mode import.`)
            } catch (error) {
                console.error('Error reading file:', error)
                alert('❌ Gagal membaca file Excel: ' + error.message)
            }
        }
        reader.readAsBinaryString(file)
        e.target.value = '' // Reset input
    }

    const handleImportToDatabase = async () => {
        if (previewData.length === 0) {
            alert('❌ Tidak ada data untuk diimport!')
            return
        }

        const modeText = {
            'upsert': 'Upsert (Tambah & Update)',
            'insert-only': 'Insert Only (Hanya Tambah Baru)',
            'update-only': 'Update Only (Hanya Update Existing)'
        }

        if (!confirm(`⚠️ Import ${previewData.length} data dengan mode: ${modeText[importMode]}?\n\nProses ini tidak bisa dibatalkan!`)) {
            return
        }

        setImporting(true)
        setImportProgress(0)

        try {
            const response = await fetch('/api/faslabuh/bulk-import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    data: previewData,
                    mode: importMode
                })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.details || error.error || 'Import failed')
            }

            const result = await response.json()

            let message = `✅ Import Selesai!\n\n`
            message += `📊 Total: ${result.total}\n`
            message += `✅ Berhasil ditambah: ${result.inserted}\n`
            message += `🔄 Berhasil diupdate: ${result.updated}\n`
            message += `❌ Gagal: ${result.failed}\n`

            if (result.errors && result.errors.length > 0) {
                message += `\n⚠️ Error Details:\n`
                result.errors.slice(0, 5).forEach(err => {
                    message += `- Baris ${err.row}: ${err.error}\n`
                })
                if (result.errors.length > 5) {
                    message += `... dan ${result.errors.length - 5} error lainnya\n`
                }
            }

            alert(message)
            setShowPreview(false)
            setPreviewData([])
            fetchData() // Refresh data
        } catch (error) {
            console.error('Import error:', error)
            alert('❌ Import gagal: ' + error.message)
        } finally {
            setImporting(false)
            setImportProgress(0)
        }
    }

    const handleDeleteAll = async () => {
        if (!confirm('⚠️ PERINGATAN!\n\nHapus SEMUA data faslabuh?\n\nProses ini TIDAK BISA dibatalkan!')) {
            return
        }

        if (!confirm('⚠️ KONFIRMASI TERAKHIR!\n\nAnda yakin ingin menghapus SEMUA data?')) {
            return
        }

        try {
            const response = await fetch('/api/faslabuh/delete-all', {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Failed to delete')

            alert('✅ Semua data berhasil dihapus!')
            fetchData()
        } catch (error) {
            console.error('Error:', error)
            alert('❌ Gagal menghapus data: ' + error.message)
        }
    }

    const updateField = (field, value) => {
        // Reset wilayah saat provinsi berubah
        if (field === 'provinsi') {
            setSelectedItem(prev => ({ ...prev, [field]: value, wilayah: '' }))
        } else {
            setSelectedItem(prev => ({ ...prev, [field]: value }))
        }
    }

    return (
        <div className="fade-in" style={{ fontFamily: FONT_SYSTEM }}>
            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>Faslabuh</h1>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>Fasilitas Pelabuhan & Dermaga</p>
            </div>

            {/* Actions Bar */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                background: '#f8fafc',
                borderRadius: '6px',
                marginBottom: '12px',
                border: '1px solid #e2e8f0'
            }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleAddNew} style={{
                        background: '#003366',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        fontFamily: FONT_SYSTEM
                    }}>
                        + Tambah
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept=".xlsx, .xls"
                        onChange={handleFileUpload}
                    />
                    <button onClick={() => fileInputRef.current?.click()} style={{
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        fontFamily: FONT_SYSTEM
                    }}>
                        📂 Import Excel
                    </button>
                    <button onClick={handleExport} style={{
                        background: 'white',
                        color: '#475569',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        fontFamily: FONT_SYSTEM
                    }}>
                        📤 Export
                    </button>
                    <button onClick={handleExportTemplate} style={{
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        fontFamily: FONT_SYSTEM
                    }}>
                        📋 Export Template
                    </button>
                    <button onClick={handleDeleteAll} style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        fontFamily: FONT_SYSTEM
                    }}>
                        🗑️ Delete All
                    </button>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Total: <strong>{data.length}</strong> Dermaga
                </span>
            </div>

            {/* Loading State */}
            {loading ? (
                <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: '#64748b',
                    fontSize: '0.9rem'
                }}>
                    ⏳ Memuat data...
                </div>
            ) : (
                <>
                    {/* Table - Compact Modern 2026 */}
                    <div style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            overflowX: 'auto',
                            overflowY: 'auto',
                            maxHeight: 'calc(100vh - 250px)'
                        }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '0.75rem'
                            }}>
                                <thead>
                                    <tr style={{ background: '#003366', color: 'white' }}>
                                        <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 10 }}>Provinsi</th>
                                        <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 10 }}>Nama Dermaga</th>
                                        <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 10 }}>Lokasi</th>
                                        <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 10 }}>Kode Barang</th>
                                        <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 10 }}>No Sertifikat</th>
                                        <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 10 }}>Konstruksi</th>
                                        <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 10 }}>P x L (m)</th>
                                        <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 10 }}>Draft (m)</th>
                                        <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 10 }}>Sandar</th>
                                        <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 10 }}>Listrik (kVA)</th>
                                        <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 10 }}>Air (m³)</th>
                                        <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 10 }}>Kondisi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item, index) => {
                                        const isEditing = editingId === item.id
                                        return (
                                            <tr
                                                key={item.id}
                                                onClick={() => handleRowClick(item)}
                                                style={{
                                                    background: isEditing ? '#fef3c7' : (index % 2 === 0 ? '#ffffff' : '#f8fafc'),
                                                    cursor: 'pointer',
                                                    borderBottom: '1px solid #f1f5f9'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isEditing) e.currentTarget.style.background = '#e0f2fe'
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isEditing) e.currentTarget.style.background = index % 2 === 0 ? '#ffffff' : '#f8fafc'
                                                }}
                                            >
                                                <td style={{ padding: '6px 10px', color: '#475569' }}>{item.provinsi}</td>
                                                <td style={{ padding: '6px 10px', fontWeight: '600', color: '#003366' }}>{item.nama_dermaga}</td>
                                                <td style={{ padding: '6px 10px', color: '#334155' }}>{item.lokasi}</td>
                                                <td style={{ padding: '6px 10px', fontFamily: FONT_MONO, fontSize: '0.7rem', color: '#64748b' }}>{item.kode_barang || '-'}</td>
                                                <td style={{ padding: '6px 10px', fontFamily: FONT_MONO, fontSize: '0.7rem', color: '#64748b' }}>{item.no_sertifikat || '-'}</td>
                                                <td style={{ padding: '6px 10px', color: '#334155' }}>{item.konstruksi}</td>
                                                <td style={{ padding: '6px 10px', textAlign: 'right', fontFamily: FONT_MONO }}>{item.panjang} x {item.lebar}</td>
                                                <td style={{ padding: '6px 10px', textAlign: 'right', fontFamily: FONT_MONO }}>{item.draft_lwl}</td>
                                                <td style={{ padding: '6px 10px', fontSize: '0.7rem', color: '#64748b' }}>
                                                    {item.sandar_items?.map(s => `${s.jumlah} ${s.tipe}`).join(', ') || '-'}
                                                </td>
                                                <td style={{ padding: '6px 10px', textAlign: 'right', fontFamily: FONT_MONO }}>{item.listrik_daya_kva}</td>
                                                <td style={{ padding: '6px 10px', textAlign: 'right', fontFamily: FONT_MONO }}>{item.air_gwt_m3}</td>
                                                <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                                                    <span style={{
                                                        padding: '2px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '0.7rem',
                                                        fontWeight: '600',
                                                        background: item.kondisi > 70 ? '#dcfce7' : '#fef3c7',
                                                        color: item.kondisi > 70 ? '#15803d' : '#b45309'
                                                    }}>
                                                        {item.kondisi}%
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Modal - Modern 2026 No Box */}
                    {isModalOpen && selectedItem && (
                        <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '20px'
                        }} onClick={handleCancel}>
                            <div style={{
                                background: 'white',
                                borderRadius: '12px',
                                maxWidth: '1200px',
                                width: '100%',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                            }} onClick={e => e.stopPropagation()}>

                                {/* Header */}
                                <div style={{
                                    padding: '20px 24px',
                                    borderBottom: '1px solid #e2e8f0',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    position: 'sticky',
                                    top: 0,
                                    background: 'white',
                                    zIndex: 10
                                }}>
                                    <div>
                                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
                                            {isEditMode ? '✏️ Edit Data Faslabuh' : selectedItem.nama_dermaga}
                                        </h2>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                                            {selectedItem.lokasi} • {selectedItem.provinsi}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        {isEditMode && (
                                            <>
                                                <button onClick={handleSave} style={{
                                                    background: '#10b981',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    padding: '6px 14px',
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer',
                                                    fontFamily: FONT_SYSTEM
                                                }}>
                                                    💾 Simpan
                                                </button>
                                                <button onClick={handleCancel} style={{
                                                    background: '#6b7280',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    padding: '6px 14px',
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer',
                                                    fontFamily: FONT_SYSTEM
                                                }}>
                                                    ✕ Batal
                                                </button>
                                                <button onClick={() => handleDelete(selectedItem.id)} style={{
                                                    background: '#ef4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    padding: '6px 14px',
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer',
                                                    fontFamily: FONT_SYSTEM
                                                }}>
                                                    🗑️ Hapus
                                                </button>
                                            </>
                                        )}
                                        <button onClick={handleCancel} style={{
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '24px',
                                            cursor: 'pointer',
                                            color: '#94a3b8'
                                        }}>
                                            ×
                                        </button>
                                    </div>
                                </div>

                                {/* Content - No Boxes, Clean Lines */}
                                <form onSubmit={handleSave} style={{ padding: '24px' }}>

                                    {/* Section 1: Identitas */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', marginBottom: '12px', paddingBottom: '6px', borderBottom: '2px solid #e2e8f0' }}>
                                            Identitas & Lokasi
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Provinsi</label>
                                                {isEditMode ? (
                                                    <select
                                                        value={selectedItem.provinsi}
                                                        onChange={e => updateField('provinsi', e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '6px 10px',
                                                            fontSize: '0.8rem',
                                                            border: '1px solid #cbd5e1',
                                                            borderRadius: '4px',
                                                            fontFamily: FONT_SYSTEM,
                                                            backgroundColor: 'white',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <option value="">-- Pilih Provinsi --</option>
                                                        {OPTIONS.provinsi.map(prov => (
                                                            <option key={prov} value={prov}>{prov}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a' }}>{selectedItem.provinsi || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Wilayah/Kota</label>
                                                {isEditMode ? (
                                                    <select
                                                        value={selectedItem.wilayah || ''}
                                                        onChange={e => updateField('wilayah', e.target.value)}
                                                        disabled={!selectedItem.provinsi}
                                                        style={{
                                                            width: '100%',
                                                            padding: '6px 10px',
                                                            fontSize: '0.8rem',
                                                            border: '1px solid #cbd5e1',
                                                            borderRadius: '4px',
                                                            fontFamily: FONT_SYSTEM,
                                                            backgroundColor: selectedItem.provinsi ? 'white' : '#f1f5f9',
                                                            cursor: selectedItem.provinsi ? 'pointer' : 'not-allowed',
                                                            color: selectedItem.provinsi ? '#0f172a' : '#94a3b8'
                                                        }}
                                                    >
                                                        <option value="">
                                                            {selectedItem.provinsi ? '-- Pilih Wilayah/Kota --' : '-- Pilih Provinsi Dulu --'}
                                                        </option>
                                                        {selectedItem.provinsi && WILAYAH_BY_PROVINSI[selectedItem.provinsi]?.map(wilayah => (
                                                            <option key={wilayah} value={wilayah}>{wilayah}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a' }}>{selectedItem.wilayah || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Lokasi</label>
                                                {isEditMode ? (
                                                    <input value={selectedItem.lokasi} onChange={e => updateField('lokasi', e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_SYSTEM }} />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a' }}>{selectedItem.lokasi || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Nama Dermaga</label>
                                                {isEditMode ? (
                                                    <input value={selectedItem.nama_dermaga} onChange={e => updateField('nama_dermaga', e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_SYSTEM }} />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a', fontWeight: '600' }}>{selectedItem.nama_dermaga || '-'}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginTop: '12px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Konstruksi</label>
                                                {isEditMode ? (
                                                    <input value={selectedItem.konstruksi} onChange={e => updateField('konstruksi', e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_SYSTEM }} />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a' }}>{selectedItem.konstruksi || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Longitude</label>
                                                {isEditMode ? (
                                                    <input type="number" step="any" value={selectedItem.lon} onChange={e => updateField('lon', parseFloat(e.target.value))} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_MONO }} />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a', fontFamily: FONT_MONO }}>{selectedItem.lon || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Latitude</label>
                                                {isEditMode ? (
                                                    <input type="number" step="any" value={selectedItem.lat} onChange={e => updateField('lat', parseFloat(e.target.value))} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_MONO }} />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a', fontFamily: FONT_MONO }}>{selectedItem.lat || '-'}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Pendaftaran Aset */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', marginBottom: '12px', paddingBottom: '6px', borderBottom: '2px solid #e2e8f0' }}>
                                            Pendaftaran Aset (Master Data)
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: '12px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Kode Barang</label>
                                                {isEditMode ? (
                                                    <input value={selectedItem.kode_barang} onChange={e => updateField('kode_barang', e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_MONO }} placeholder="03.01.01.01.001" />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a', fontFamily: FONT_MONO }}>{selectedItem.kode_barang || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>No Sertifikat</label>
                                                {isEditMode ? (
                                                    <input value={selectedItem.no_sertifikat} onChange={e => updateField('no_sertifikat', e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_MONO }} placeholder="SHM-12345/2020" />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a', fontFamily: FONT_MONO }}>{selectedItem.no_sertifikat || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Tgl Sertifikat</label>
                                                {isEditMode ? (
                                                    <input type="date" value={selectedItem.tgl_sertifikat} onChange={e => updateField('tgl_sertifikat', e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_MONO }} />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a', fontFamily: FONT_MONO }}>{selectedItem.tgl_sertifikat || '-'}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 3: Dimensi */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', marginBottom: '12px', paddingBottom: '6px', borderBottom: '2px solid #e2e8f0' }}>
                                            Dimensi & Kondisi
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
                                            {[
                                                { label: 'Panjang (m)', field: 'panjang', type: 'number' },
                                                { label: 'Lebar (m)', field: 'lebar', type: 'number' },
                                                { label: 'Luas (m²)', field: 'luas', type: 'number', readonly: true, value: selectedItem.panjang * selectedItem.lebar },
                                                { label: 'Draft LWL (m)', field: 'draft_lwl', type: 'number' },
                                                { label: 'Pasut HWL-LWL (m)', field: 'pasut_hwl_lwl', type: 'number' },
                                                { label: 'Kondisi (%)', field: 'kondisi', type: 'number' }
                                            ].map(({ label, field, type, readonly, value }) => (
                                                <div key={field}>
                                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>{label}</label>
                                                    {isEditMode && !readonly ? (
                                                        <input type={type} step="any" value={selectedItem[field]} onChange={e => updateField(field, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_MONO }} />
                                                    ) : (
                                                        <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a', fontFamily: FONT_MONO }}>{value !== undefined ? value : selectedItem[field] || '-'}</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Section 3: Kemampuan Sandar - Multiple Items */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', margin: 0, paddingBottom: '6px', borderBottom: '2px solid #e2e8f0', flex: 1 }}>
                                                Kemampuan Sandar Maksimum
                                            </h3>
                                            {isEditMode && (
                                                <button type="button" onClick={addSandarItem} style={{
                                                    background: '#3b82f6',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    padding: '4px 10px',
                                                    fontSize: '0.75rem',
                                                    cursor: 'pointer',
                                                    marginLeft: '12px'
                                                }}>
                                                    + Tambah Item
                                                </button>
                                            )}
                                        </div>
                                        {(selectedItem.sandar_items || []).map((item, idx) => (
                                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '12px', marginBottom: '8px', padding: '8px', background: '#f8fafc', borderRadius: '4px' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Tipe KRI</label>
                                                    {isEditMode ? (
                                                        <input value={item.tipe} onChange={e => updateSandarItem(idx, 'tipe', e.target.value)} style={{ width: '100%', padding: '5px 8px', fontSize: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Fregat, Korvet, dll" />
                                                    ) : (
                                                        <div style={{ padding: '5px 0', fontSize: '0.8rem', color: '#0f172a' }}>{item.tipe || '-'}</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Ton</label>
                                                    {isEditMode ? (
                                                        <input type="number" value={item.ton} onChange={e => updateSandarItem(idx, 'ton', parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '5px 8px', fontSize: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_MONO }} />
                                                    ) : (
                                                        <div style={{ padding: '5px 0', fontSize: '0.8rem', color: '#0f172a', fontFamily: FONT_MONO }}>{item.ton || '-'}</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Jumlah</label>
                                                    {isEditMode ? (
                                                        <input type="number" value={item.jumlah} onChange={e => updateSandarItem(idx, 'jumlah', parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '5px 8px', fontSize: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_MONO }} />
                                                    ) : (
                                                        <div style={{ padding: '5px 0', fontSize: '0.8rem', color: '#0f172a', fontFamily: FONT_MONO }}>{item.jumlah || '-'}</div>
                                                    )}
                                                </div>
                                                {isEditMode && (
                                                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                                        <button type="button" onClick={() => removeSandarItem(idx)} style={{
                                                            background: '#ef4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            padding: '5px 10px',
                                                            fontSize: '0.75rem',
                                                            cursor: 'pointer'
                                                        }}>
                                                            ✕
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Section 4: Plat Lantai */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', marginBottom: '12px', paddingBottom: '6px', borderBottom: '2px solid #e2e8f0' }}>
                                            Kemampuan Plat Lantai
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '12px' }}>
                                            {[
                                                { label: 'MST (ton)', field: 'plat_mst_ton', type: 'number' },
                                                { label: 'Jenis Ranmor', field: 'plat_jenis_ranmor', type: 'text' },
                                                { label: 'Berat Max (ton)', field: 'plat_berat_max_ton', type: 'number' }
                                            ].map(({ label, field, type }) => (
                                                <div key={field}>
                                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>{label}</label>
                                                    {isEditMode ? (
                                                        <input type={type} step="any" value={selectedItem[field]} onChange={e => updateField(field, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: type === 'number' ? FONT_MONO : FONT_SYSTEM }} />
                                                    ) : (
                                                        <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a', fontFamily: type === 'number' ? FONT_MONO : FONT_SYSTEM }}>{selectedItem[field] || '-'}</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Section 5: Listrik */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', marginBottom: '12px', paddingBottom: '6px', borderBottom: '2px solid #e2e8f0' }}>
                                            Dukungan Listrik Aliran Darat
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Jml Titik</label>
                                                {isEditMode ? (
                                                    <input type="number" value={selectedItem.listrik_jml_titik} onChange={e => updateField('listrik_jml_titik', parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_MONO }} />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a', fontFamily: FONT_MONO }}>{selectedItem.listrik_jml_titik || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Kap (Amp)</label>
                                                {isEditMode ? (
                                                    <input type="number" value={selectedItem.listrik_kap_amp} onChange={e => updateField('listrik_kap_amp', parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_MONO }} />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a', fontFamily: FONT_MONO }}>{selectedItem.listrik_kap_amp || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Tegangan (V)</label>
                                                {isEditMode ? (
                                                    <select value={selectedItem.listrik_tegangan_volt} onChange={e => updateField('listrik_tegangan_volt', parseInt(e.target.value))} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_MONO }}>
                                                        {OPTIONS.tegangan.map(v => <option key={v} value={v}>{v}</option>)}
                                                    </select>
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a', fontFamily: FONT_MONO }}>{selectedItem.listrik_tegangan_volt || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Frek (Hz)</label>
                                                {isEditMode ? (
                                                    <select value={selectedItem.listrik_frek_hz} onChange={e => updateField('listrik_frek_hz', parseInt(e.target.value))} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_MONO }}>
                                                        {OPTIONS.frekuensi.map(f => <option key={f} value={f}>{f}</option>)}
                                                    </select>
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a', fontFamily: FONT_MONO }}>{selectedItem.listrik_frek_hz || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Sumber</label>
                                                {isEditMode ? (
                                                    <select value={selectedItem.listrik_sumber} onChange={e => updateField('listrik_sumber', e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                                                        {OPTIONS.sumber_listrik.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a' }}>{selectedItem.listrik_sumber || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Daya (kVA)</label>
                                                {isEditMode ? (
                                                    <input type="number" step="any" value={selectedItem.listrik_daya_kva} onChange={e => updateField('listrik_daya_kva', parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_MONO }} />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a', fontFamily: FONT_MONO }}>{selectedItem.listrik_daya_kva || '-'}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 6: Air Tawar */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', marginBottom: '12px', paddingBottom: '6px', borderBottom: '2px solid #e2e8f0' }}>
                                            Dukungan Air Tawar
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '12px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>GWT (m³)</label>
                                                {isEditMode ? (
                                                    <input type="number" step="any" value={selectedItem.air_gwt_m3} onChange={e => updateField('air_gwt_m3', parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_MONO }} />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a', fontFamily: FONT_MONO }}>{selectedItem.air_gwt_m3 || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Debit (m³/jam)</label>
                                                {isEditMode ? (
                                                    <input type="number" step="any" value={selectedItem.air_debit_m3_jam} onChange={e => updateField('air_debit_m3_jam', parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_MONO }} />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a', fontFamily: FONT_MONO }}>{selectedItem.air_debit_m3_jam || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Sumber</label>
                                                {isEditMode ? (
                                                    <select value={selectedItem.air_sumber} onChange={e => updateField('air_sumber', e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                                                        {OPTIONS.sumber_air.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a' }}>{selectedItem.air_sumber || '-'}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 7: BBM & Hydrant */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', marginBottom: '12px', paddingBottom: '6px', borderBottom: '2px solid #e2e8f0' }}>
                                            BBM & Hydrant
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>BBM</label>
                                                {isEditMode ? (
                                                    <select value={selectedItem.bbm} onChange={e => updateField('bbm', e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                                                        {OPTIONS.bbm.map(b => <option key={b} value={b}>{b}</option>)}
                                                    </select>
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a' }}>{selectedItem.bbm || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Hydrant</label>
                                                {isEditMode ? (
                                                    <input value={selectedItem.hydrant} onChange={e => updateField('hydrant', e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Ada/Tidak, Jumlah" />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a' }}>{selectedItem.hydrant || '-'}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 8: Keterangan */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', marginBottom: '12px', paddingBottom: '6px', borderBottom: '2px solid #e2e8f0' }}>
                                            Keterangan
                                        </h3>
                                        {isEditMode ? (
                                            <textarea value={selectedItem.keterangan} onChange={e => updateField('keterangan', e.target.value)} rows="3" style={{ width: '100%', padding: '8px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_SYSTEM, resize: 'vertical' }} placeholder="Catatan tambahan..." />
                                        ) : (
                                            <div style={{ padding: '8px 0', fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>{selectedItem.keterangan || '-'}</div>
                                        )}
                                    </div>

                                    {/* Section 9: Dokumentasi Foto */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', marginBottom: '12px', paddingBottom: '6px', borderBottom: '2px solid #e2e8f0' }}>
                                            Dokumentasi Foto (Max 4 - JPG/PDF)
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                            {[0, 1, 2, 3].map(idx => {
                                                const foto = selectedItem.fotos?.[idx]
                                                return (
                                                    <div key={idx} style={{
                                                        aspectRatio: '4/3',
                                                        border: '2px dashed #cbd5e1',
                                                        borderRadius: '8px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: foto ? '#f1f5f9' : '#f8fafc',
                                                        position: 'relative',
                                                        overflow: 'hidden'
                                                    }}>
                                                        {foto ? (
                                                            <>
                                                                {/* Preview */}
                                                                {foto.type === 'application/pdf' ? (
                                                                    <div style={{ textAlign: 'center', padding: '10px' }}>
                                                                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📄</div>
                                                                        <div style={{ fontSize: '0.7rem', color: '#64748b', wordBreak: 'break-word' }}>
                                                                            {foto.name}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <img
                                                                        src={foto.url}
                                                                        alt={`Foto ${idx + 1}`}
                                                                        style={{
                                                                            width: '100%',
                                                                            height: '100%',
                                                                            objectFit: 'cover'
                                                                        }}
                                                                    />
                                                                )}
                                                                {/* Delete button in edit mode */}
                                                                {isEditMode && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const newFotos = [...(selectedItem.fotos || [])]
                                                                            newFotos.splice(idx, 1)
                                                                            updateField('fotos', newFotos)
                                                                        }}
                                                                        style={{
                                                                            position: 'absolute',
                                                                            top: '4px',
                                                                            right: '4px',
                                                                            background: '#ef4444',
                                                                            color: 'white',
                                                                            border: 'none',
                                                                            borderRadius: '4px',
                                                                            padding: '4px 8px',
                                                                            fontSize: '0.7rem',
                                                                            cursor: 'pointer',
                                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                                        }}
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <>
                                                                {isEditMode ? (
                                                                    <label style={{
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        cursor: 'pointer',
                                                                        color: '#94a3b8'
                                                                    }}>
                                                                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>📷</div>
                                                                        <div style={{ fontSize: '0.7rem' }}>Upload Foto {idx + 1}</div>
                                                                        <div style={{ fontSize: '0.65rem', marginTop: '2px' }}>JPG/PDF</div>
                                                                        <input
                                                                            type="file"
                                                                            accept="image/jpeg,image/jpg,application/pdf"
                                                                            style={{ display: 'none' }}
                                                                            onChange={(e) => {
                                                                                const file = e.target.files[0]
                                                                                if (file) {
                                                                                    const reader = new FileReader()
                                                                                    reader.onload = (event) => {
                                                                                        const newFotos = [...(selectedItem.fotos || [])]
                                                                                        newFotos[idx] = {
                                                                                            name: file.name,
                                                                                            type: file.type,
                                                                                            url: event.target.result
                                                                                        }
                                                                                        updateField('fotos', newFotos)
                                                                                    }
                                                                                    reader.readAsDataURL(file)
                                                                                }
                                                                            }}
                                                                        />
                                                                    </label>
                                                                ) : (
                                                                    <div style={{ textAlign: 'center', color: '#cbd5e1' }}>
                                                                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>📷</div>
                                                                        <div style={{ fontSize: '0.7rem' }}>Foto {idx + 1}</div>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                </form>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Import Preview Modal */}
            {showPreview && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }} onClick={() => setShowPreview(false)}>
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        maxWidth: '1400px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }} onClick={e => e.stopPropagation()}>

                        {/* Header */}
                        <div style={{
                            padding: '20px 24px',
                            borderBottom: '1px solid #e2e8f0',
                            position: 'sticky',
                            top: 0,
                            background: 'white',
                            zIndex: 10
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
                                        👁️ Preview Import Data Faslabuh
                                    </h2>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                                        Total: <strong>{previewData.length}</strong> baris data
                                    </p>
                                </div>
                                <button onClick={() => setShowPreview(false)} style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#94a3b8'
                                }}>
                                    ×
                                </button>
                            </div>

                            {/* Mode Selection */}
                            <div style={{ marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                                    Mode Import:
                                </label>
                                <select
                                    value={importMode}
                                    onChange={(e) => setImportMode(e.target.value)}
                                    style={{
                                        padding: '6px 12px',
                                        fontSize: '0.8rem',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '4px',
                                        fontFamily: FONT_SYSTEM
                                    }}
                                >
                                    <option value="upsert">✅ Upsert (Tambah & Update Otomatis)</option>
                                    <option value="insert-only">➕ Insert Only (Hanya Tambah Baru)</option>
                                    <option value="update-only">🔄 Update Only (Hanya Update Existing)</option>
                                </select>
                                <button
                                    onClick={handleImportToDatabase}
                                    disabled={importing}
                                    style={{
                                        background: importing ? '#94a3b8' : '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '6px 16px',
                                        fontSize: '0.85rem',
                                        cursor: importing ? 'not-allowed' : 'pointer',
                                        fontFamily: FONT_SYSTEM,
                                        fontWeight: '600'
                                    }}
                                >
                                    {importing ? '⏳ Importing...' : '🚀 Import ke Database'}
                                </button>
                            </div>
                        </div>

                        {/* Preview Table */}
                        <div style={{ padding: '16px 24px' }}>
                            <div style={{
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    overflowX: 'auto',
                                    maxHeight: '500px',
                                    overflowY: 'auto'
                                }}>
                                    <table style={{
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                        fontSize: '0.75rem'
                                    }}>
                                        <thead>
                                            <tr style={{ background: '#003366', color: 'white' }}>
                                                <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5 }}>No</th>
                                                <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5 }}>Provinsi</th>
                                                <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5 }}>Nama Dermaga</th>
                                                <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5 }}>Lokasi</th>
                                                <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5 }}>Konstruksi</th>
                                                <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5 }}>P x L (m)</th>
                                                <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5 }}>Draft (m)</th>
                                                <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5 }}>Kondisi</th>
                                                <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5 }}>Sandar</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewData.map((item, index) => (
                                                <tr
                                                    key={index}
                                                    style={{
                                                        background: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                                                        borderBottom: '1px solid #f1f5f9'
                                                    }}
                                                >
                                                    <td style={{ padding: '6px 10px', color: '#64748b' }}>{index + 1}</td>
                                                    <td style={{ padding: '6px 10px', color: '#475569' }}>{item.provinsi || '-'}</td>
                                                    <td style={{ padding: '6px 10px', fontWeight: '600', color: '#003366' }}>{item.nama_dermaga || '-'}</td>
                                                    <td style={{ padding: '6px 10px', color: '#334155' }}>{item.lokasi || '-'}</td>
                                                    <td style={{ padding: '6px 10px', color: '#334155' }}>{item.konstruksi || '-'}</td>
                                                    <td style={{ padding: '6px 10px', textAlign: 'right', fontFamily: FONT_MONO }}>{item.panjang} x {item.lebar}</td>
                                                    <td style={{ padding: '6px 10px', textAlign: 'right', fontFamily: FONT_MONO }}>{item.draft_lwl}</td>
                                                    <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                                                        <span style={{
                                                            padding: '2px 8px',
                                                            borderRadius: '4px',
                                                            fontSize: '0.7rem',
                                                            fontWeight: '600',
                                                            background: item.kondisi > 70 ? '#dcfce7' : '#fef3c7',
                                                            color: item.kondisi > 70 ? '#15803d' : '#b45309'
                                                        }}>
                                                            {item.kondisi}%
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '6px 10px', fontSize: '0.7rem', color: '#64748b' }}>
                                                        {item.sandar_items?.map(s => `${s.jumlah} ${s.tipe}`).join(', ') || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Faslabuh
