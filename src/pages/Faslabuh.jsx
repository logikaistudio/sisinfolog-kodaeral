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
            // Map Backend Columns -> Frontend State Keys
            // Map Backend Columns -> Frontend State Keys
            const mappedResult = result.map(item => ({
                ...item,
                // Dimensi
                panjang_m: item.panjang ? parseFloat(item.panjang) : null,
                lebar_m: item.lebar ? parseFloat(item.lebar) : null,
                luas_m2: item.luas ? parseFloat(item.luas) : null,
                draft_lwl_m: item.draft_lwl ? parseFloat(item.draft_lwl) : null,
                pasut_hwl_lwl_m: item.pasut_hwl_lwl ? parseFloat(item.pasut_hwl_lwl) : null,
                kondisi_percent: item.kondisi ? parseFloat(item.kondisi) : null,

                // Plat & Ranmor
                kemampuan_plat_lantai_ton: item.plat_mst_ton ? parseFloat(item.plat_mst_ton) : null,
                jenis_ranmor: item.plat_jenis_ranmor,
                berat_ranmor_ton: item.plat_berat_max_ton ? parseFloat(item.plat_berat_max_ton) : null,

                // Listrik
                titik_sambung_listrik: item.listrik_jml_titik ? parseFloat(item.listrik_jml_titik) : null,
                kapasitas_a: item.listrik_kap_amp ? parseFloat(item.listrik_kap_amp) : null,
                tegangan_v: item.listrik_tegangan_volt ? parseFloat(item.listrik_tegangan_volt) : null,
                frek_hz: item.listrik_frek_hz ? parseFloat(item.listrik_frek_hz) : null,
                sumber_listrik: item.listrik_sumber,
                daya_kva: item.listrik_daya_kva ? parseFloat(item.listrik_daya_kva) : null,

                // Air
                kapasitas_air_gwt_m3: item.air_gwt_m3 ? parseFloat(item.air_gwt_m3) : null,
                debit_air_m3_jam: item.air_debit_m3_jam ? parseFloat(item.air_debit_m3_jam) : null,
                sumber_air: item.air_sumber,

                // BBM
                kapasitas_bbm: item.bbm
            }))

            setData(mappedResult)
        } catch (error) {
            console.error('Error fetching faslabuh data:', error)
            alert('❌ Gagal memuat data: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleAddNew = () => {
        setSelectedItem({
            lokasi: '', wilayah: '', alamat: '', lon: 0, lat: 0,
            nama_dermaga: '', konstruksi: '',
            panjang_m: 0, lebar_m: 0, luas_m2: 0,
            draft_lwl_m: 0, pasut_hwl_lwl_m: 0, kondisi_percent: 0,

            displacement_kri: '', berat_sandar_maks_ton: 0, tipe_kapal: '', jumlah_maks: 0,

            kemampuan_plat_lantai_ton: 0, jenis_ranmor: '', berat_ranmor_ton: 0,

            titik_sambung_listrik: 0, kapasitas_a: 0, tegangan_v: 220, frek_hz: 50,
            sumber_listrik: 'PLN', daya_kva: 0,

            kapasitas_air_gwt_m3: 0, debit_air_m3_jam: 0, sumber_air: 'PDAM',

            kapasitas_bbm: '', hydrant: '', keterangan: ''
        })
        setIsEditMode(true)
        setIsModalOpen(true)
    }

    const handleRowClick = (item) => {
        setEditingId(item.id)
        setSelectedItem({ ...item })
        setIsEditMode(false) // Default to read-only view
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

        // Helper: Convert to number or null/0 (flexible)
        // User request: "Not mandatory", so allow null/empty
        const toNum = (val) => {
            if (val === '' || val === null || val === undefined) return null
            // Handle comma as decimal separator (Indonesian format)
            const normalized = typeof val === 'string' ? val.replace(',', '.') : val
            const parsed = parseFloat(normalized)
            return isNaN(parsed) ? null : parsed
        }

        const p = toNum(selectedItem.panjang_m) || 0
        const l = toNum(selectedItem.lebar_m) || 0

        const updated = {
            ...selectedItem,
            luas_m2: p * l,

            panjang_m: toNum(selectedItem.panjang_m),
            lebar_m: toNum(selectedItem.lebar_m),
            draft_lwl_m: toNum(selectedItem.draft_lwl_m),
            pasut_hwl_lwl_m: toNum(selectedItem.pasut_hwl_lwl_m),
            kondisi_percent: toNum(selectedItem.kondisi_percent),

            berat_sandar_maks_ton: toNum(selectedItem.berat_sandar_maks_ton),
            jumlah_maks: toNum(selectedItem.jumlah_maks),

            kemampuan_plat_lantai_ton: toNum(selectedItem.kemampuan_plat_lantai_ton),
            berat_ranmor_ton: toNum(selectedItem.berat_ranmor_ton),

            titik_sambung_listrik: toNum(selectedItem.titik_sambung_listrik),
            kapasitas_a: toNum(selectedItem.kapasitas_a),
            tegangan_v: toNum(selectedItem.tegangan_v),
            frek_hz: toNum(selectedItem.frek_hz),
            daya_kva: toNum(selectedItem.daya_kva),
            kapasitas_air_gwt_m3: toNum(selectedItem.kapasitas_air_gwt_m3),
            debit_air_m3_jam: toNum(selectedItem.debit_air_m3_jam)
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



    const handleExport = () => {
        const excelData = data.map(item => ({
            'Provinsi': item.provinsi,
            'Wilayah': item.wilayah,
            'Alamat': item.alamat,
            'Lokasi': item.lokasi,
            'Nama Dermaga': item.nama_dermaga,
            'Kode Barang': item.kode_barang,
            'No Sertifikat': item.no_sertifikat,
            'Tgl Sertifikat': item.tgl_sertifikat,
            'Longitude': item.lon,
            'Latitude': item.lat,

            'Konstruksi': item.konstruksi,
            'Panjang (m)': item.panjang_m,
            'Lebar (m)': item.lebar_m,
            'Luas (m²)': item.luas_m2,
            'Draft LWL (m)': item.draft_lwl_m,
            'Pasut HWL-LWL (m)': item.pasut_hwl_lwl_m,
            'Kondisi (%)': item.kondisi_percent,

            'Displacement KRI': item.displacement_kri,
            'Berat Sandar Maks (ton)': item.berat_sandar_maks_ton,
            'Tipe Kapal': item.tipe_kapal,
            'Jumlah Maks': item.jumlah_maks,

            'Kemampuan Plat Lantai (ton)': item.kemampuan_plat_lantai_ton,
            'Jenis Ranmor': item.jenis_ranmor,
            'Berat Ranmor (ton)': item.berat_ranmor_ton,

            'Titik Sambung Listrik': item.titik_sambung_listrik,
            'Kapasitas (A)': item.kapasitas_a,
            'Tegangan (V)': item.tegangan_v,
            'Frek (Hz)': item.frek_hz,
            'Sumber Listrik': item.sumber_listrik,
            'Daya (kVA)': item.daya_kva,

            'Kapasitas Air GWT (m³)': item.kapasitas_air_gwt_m3,
            'Debit Air (m³/jam)': item.debit_air_m3_jam,
            'Sumber Air': item.sumber_air,

            'Kapasitas BBM': item.kapasitas_bbm,
            'Hydrant': item.hydrant,
            'Keterangan': item.keterangan
        }))

        const ws = XLSX.utils.json_to_sheet(excelData)

        // Auto-width
        const objectMaxLength = []
        excelData.forEach(row => {
            Object.values(row).forEach((value, i) => {
                let cellValue = value === null ? '' : String(value)
                objectMaxLength[i] = Math.max((objectMaxLength[i] || 10), cellValue.length + 2)
            })
        })
        ws['!cols'] = objectMaxLength.map(w => ({ wch: w }))

        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Faslabuh Data")
        XLSX.writeFile(wb, "Faslabuh_Export.xlsx")
    }

    const handleExportTemplate = () => {
        const templateHeaders = {
            'No': '',
            'No': '',
            'Lokasi': '',
            'Alamat': '',
            'Wilayah': '',
            'Longitude': '',
            'Latitude': '',
            'Nama Dermaga': '',
            'Konstruksi': '',
            'Panjang (m)': '',
            'Lebar (m)': '',
            'Luas (m²)': '',
            'Draft LWL (m)': '',
            'Pasut HWL-LWL (m)': '',
            'Kondisi (%)': '',
            'Displacement KRI': '',
            'Berat Sandar Maks (ton)': '',
            'Tipe Kapal': '',
            'Jumlah Maks': '',
            'Kemampuan Plat Lantai (ton)': '',
            'Jenis Ranmor': '',
            'Berat Ranmor (ton)': '',
            'Titik Sambung Listrik': '',
            'Kapasitas (A)': '',
            'Tegangan (V)': '',
            'Frek (Hz)': '',
            'Daya (kVA)': '',
            'Sumber Listrik': '',
            'Kapasitas Air GWT (m³)': '',
            'Debit Air (m³/jam)': '',
            'Sumber Air': '',
            'Kapasitas BBM': '',
            'Hydrant': '',
            'Keterangan': ''
        }

        const templateData = [templateHeaders] // Only headers
        const ws = XLSX.utils.json_to_sheet(templateData)

        // Set column widths
        ws['!cols'] = Array(33).fill({ wch: 15 })

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

                // Read as Array of Arrays (Row based, Column indexed 0,1,2...)
                const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 })

                if (rawData.length === 0) {
                    alert('❌ File Excel kosong!')
                    return
                }

                // --- DYNAMIC HEADER DETECTION ---
                // Scan first 20 rows to find key columns
                const headerMap = {
                    no: -1,
                    lokasi: -1,
                    alamat: -1,
                    wilayah: -1,
                    longitude: -1,
                    latitude: -1,
                    nama: -1,
                    konstruksi: -1,
                    panjang: -1,
                    lebar: -1,
                    luas: -1,
                    draft: -1,
                    pasut: -1,
                    kondisi: -1,
                    sandarKri: -1,
                    sandarTon: -1,
                    tipeKapal: -1,
                    sandarJml: -1,
                    platTon: -1,
                    ranmorJenis: -1,
                    ranmorTon: -1,
                    listrikTitik: -1,
                    listrikAmp: -1,
                    listrikVolt: -1,
                    listrikHz: -1,
                    listrikDaya: -1,
                    listrikSumber: -1,
                    airGwt: -1,
                    airDebit: -1,
                    airSumber: -1,
                    bbm: -1,
                    hydrant: -1,
                    ket: -1
                }

                // Helper to normalize string for matching (HANDLE NEWLINES!)
                const norm = (val) => String(val || '').toUpperCase().replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim()

                let detectedHeaderRow = 0

                // Scan rows 0-19
                for (let r = 0; r < Math.min(rawData.length, 20); r++) {
                    const row = rawData[r]
                    let matchCount = 0

                    row.forEach((cell, colIdx) => {
                        const txt = norm(cell)

                        // LOCK: Only set if -1 (First match wins from Left to Right, Top to Bottom)

                        if (headerMap.no === -1 && txt === 'NO') { headerMap.no = colIdx; matchCount++ }
                        if (headerMap.lokasi === -1 && txt === 'LOKASI') { headerMap.lokasi = colIdx; matchCount++ }
                        if (headerMap.alamat === -1 && (txt === 'ALAMAT' || txt.includes('ALAMAT'))) { headerMap.alamat = colIdx; matchCount++ }
                        if (headerMap.wilayah === -1 && txt === 'WILAYAH') { headerMap.wilayah = colIdx; matchCount++ }
                        if (headerMap.longitude === -1 && (txt.includes('LONGITUDE') || txt.includes('LON') || txt === 'X')) { headerMap.longitude = colIdx; matchCount++ }
                        if (headerMap.latitude === -1 && (txt.includes('LATITUDE') || txt.includes('LAT') || txt === 'Y')) { headerMap.latitude = colIdx; matchCount++ }
                        if (headerMap.nama === -1 && (txt.includes('NAMA DERMAGA') || txt === 'NAMA')) { headerMap.nama = colIdx; matchCount++ }
                        if (headerMap.konstruksi === -1 && txt.includes('KONSTRUKSI')) { headerMap.konstruksi = colIdx; matchCount++ }

                        if (headerMap.panjang === -1 && (txt.includes('PANJANG') || txt === 'P (M)')) { headerMap.panjang = colIdx; matchCount++ }
                        if (headerMap.lebar === -1 && (txt.includes('LEBAR') || txt === 'L (M)')) { headerMap.lebar = colIdx; matchCount++ }
                        if (headerMap.luas === -1 && (txt.includes('LUAS'))) { headerMap.luas = colIdx; matchCount++ }
                        if (headerMap.draft === -1 && (txt.includes('DRAFT'))) { headerMap.draft = colIdx; matchCount++ }
                        if (headerMap.pasut === -1 && (txt.includes('PASUT'))) { headerMap.pasut = colIdx; matchCount++ }
                        if (headerMap.kondisi === -1 && (txt.includes('KONDISI'))) { headerMap.kondisi = colIdx; matchCount++ }

                        if (headerMap.sandarKri === -1 && (txt.includes('DISPLACEMENT') || txt.includes('DISP'))) { headerMap.sandarKri = colIdx; matchCount++ }
                        if (headerMap.sandarTon === -1 && (txt.includes('BERAT SANDAR') || txt.includes('SANDAR MAKS'))) { headerMap.sandarTon = colIdx; matchCount++ }
                        if (headerMap.tipeKapal === -1 && txt.includes('TIPE KAPAL')) { headerMap.tipeKapal = colIdx; matchCount++ }
                        if (headerMap.sandarJml === -1 && txt.includes('JUMLAH')) { headerMap.sandarJml = colIdx; matchCount++ }

                        if (headerMap.platTon === -1 && (txt.includes('PLAT LANTAI') || txt.includes('KEMAMPUAN PLAT'))) { headerMap.platTon = colIdx; matchCount++ }
                        if (headerMap.ranmorJenis === -1 && txt.includes('JENIS RANMOR')) { headerMap.ranmorJenis = colIdx; matchCount++ }
                        if (headerMap.ranmorTon === -1 && (txt.includes('BERAT RANMOR'))) { headerMap.ranmorTon = colIdx; matchCount++ }

                        if (headerMap.listrikTitik === -1 && txt.includes('TITIK SAMBUNG')) { headerMap.listrikTitik = colIdx; matchCount++ }
                        if (headerMap.listrikAmp === -1 && (txt.includes('KAPASITAS (A)') || txt === 'AMP' || txt === 'AMPERE')) { headerMap.listrikAmp = colIdx; matchCount++ }
                        if (headerMap.listrikVolt === -1 && (txt.includes('TEGANGAN') || txt.includes('VOLT'))) { headerMap.listrikVolt = colIdx; matchCount++ }
                        if (headerMap.listrikHz === -1 && (txt.includes('FREK') || txt.includes('HZ'))) { headerMap.listrikHz = colIdx; matchCount++ }
                        if (headerMap.listrikDaya === -1 && (txt.includes('DAYA') || txt.includes('KVA'))) { headerMap.listrikDaya = colIdx; matchCount++ }
                        if (headerMap.listrikSumber === -1 && txt.includes('SUMBER LISTRIK')) { headerMap.listrikSumber = colIdx; matchCount++ }

                        if (headerMap.airGwt === -1 && (txt.includes('GWT') || (txt.includes('KAPASITAS') && txt.includes('AIR')))) { headerMap.airGwt = colIdx; matchCount++ }
                        if (headerMap.airDebit === -1 && (txt.includes('DEBIT') || (txt.includes('DEBIT') && txt.includes('AIR')))) { headerMap.airDebit = colIdx; matchCount++ }
                        if (headerMap.airSumber === -1 && txt.includes('SUMBER AIR')) { headerMap.airSumber = colIdx; matchCount++ }

                        if (headerMap.bbm === -1 && (txt.includes('BBM') || txt.includes('KAPASITAS BBM'))) { headerMap.bbm = colIdx; matchCount++ }
                        if (headerMap.hydrant === -1 && txt.includes('HYDRANT')) { headerMap.hydrant = colIdx; matchCount++ }
                        if (headerMap.ket === -1 && (txt.includes('KETERANGAN') || txt === 'KET')) { headerMap.ket = colIdx; matchCount++ }
                    })

                    if (matchCount >= 4) detectedHeaderRow = r // Require a bit more confidence
                }

                // Fallback Indices based on typical order if dynamic fails totally (optional but safer)
                if (headerMap.nama === -1) {
                    // Try to guess based on standard template order
                    // No=0, Lokasi=1, Wilayah=2, Lon=3, Lat=4, Nama=5 ...
                    headerMap.no = 0
                    headerMap.lokasi = 1
                    headerMap.alamat = 2
                    headerMap.wilayah = 3
                    headerMap.longitude = 4
                    headerMap.latitude = 5
                    headerMap.nama = 6
                    headerMap.konstruksi = 7
                    headerMap.panjang = 8
                    headerMap.lebar = 9
                    headerMap.luas = 10
                    headerMap.draft = 11
                    headerMap.pasut = 12
                    headerMap.kondisi = 13
                    headerMap.sandarKri = 14
                    headerMap.sandarTon = 15
                    headerMap.tipeKapal = 16
                    headerMap.sandarJml = 17
                    headerMap.platTon = 18
                    headerMap.ranmorJenis = 19
                    headerMap.ranmorTon = 20
                    headerMap.listrikTitik = 21
                    headerMap.listrikAmp = 22
                    headerMap.listrikVolt = 23
                    headerMap.listrikHz = 24
                    headerMap.listrikDaya = 25
                    headerMap.listrikSumber = 26
                    headerMap.airGwt = 27
                    headerMap.airDebit = 28
                    headerMap.airSumber = 29
                    headerMap.bbm = 30
                    headerMap.hydrant = 31
                    headerMap.ket = 32
                }

                console.log('🔍 Detected Column Indices:', headerMap)

                let mappedData = []
                let lastWilayah = ''
                let lastNamaDermaga = ''
                let lastLokasi = ''

                // Start iterating from detected header row + 1
                const startRow = detectedHeaderRow + 1

                mappedData = rawData.slice(startRow).map((row, index) => {
                    const rowNum = index + startRow + 1
                    const idx = headerMap

                    // 0. Explicit Lokasi Column from Header
                    if (idx.lokasi > -1 && row[idx.lokasi]) {
                        const val = String(row[idx.lokasi]).trim()
                        if (val && !val.includes('LOKASI')) lastLokasi = val.replace(/LANTAMAL/i, '').replace(/LANAL/i, '').trim()
                    }

                    // Determine Anchor (Nama)
                    let colAnchor = ''
                    if (idx.nama > -1 && row[idx.nama]) colAnchor = String(row[idx.nama]).trim()
                    else if (row[2]) colAnchor = String(row[2]).trim() // Fallback Col C

                    // 1. Explicit Wilayah Check (Flat Table Support)
                    if (idx.wilayah > -1 && idx.wilayah !== idx.nama && row[idx.wilayah]) {
                        const val = String(row[idx.wilayah]).trim()
                        if (val && !val.includes('WILAYAH') && val.length > 2 && isNaN(Number(val))) {
                            lastWilayah = val
                            lastLokasi = val.replace(/LANTAMAL/i, '').replace(/LANAL/i, '').replace(/MAKO/i, '').trim()
                        }
                    }

                    // 2. Hierarchical Header Check
                    if (colAnchor.includes('LANTAMAL') || colAnchor.includes('LANAL') || colAnchor.includes('MAKO')) {
                        lastWilayah = colAnchor
                        lastLokasi = colAnchor.replace(/LANTAMAL/i, '').replace(/LANAL/i, '').replace(/MAKO/i, '').trim()
                        lastNamaDermaga = ''
                        return null
                    }

                    // Relaxed Row Validation: If it has (Name OR Location) AND isn't just a header repetition
                    // Check if it's likely a header row repetition
                    const txtName = String(row[idx.nama] || '').toUpperCase()
                    if (txtName.includes('NAMA DERMAGA') || txtName === 'NAMA') return null

                    // If it has no name and no known dimensions, checking if it's empty
                    const rawP = row[idx.panjang]
                    const rawL = row[idx.lebar]

                    // If absolutely empty row, skip
                    if (!colAnchor && !rawP && !rawL && !row[idx.lokasi]) return null

                    // Name resolution
                    let displayNama = lastNamaDermaga
                    const valKonstruksi = idx.konstruksi > -1 ? (row[idx.konstruksi] ? String(row[idx.konstruksi]).trim() : '') : ''

                    if (colAnchor) displayNama = colAnchor
                    else if (valKonstruksi.startsWith('-') || valKonstruksi.startsWith('–')) {
                        displayNama = `${lastNamaDermaga} ${valKonstruksi}`
                    }

                    const parseNum = (val) => {
                        if (typeof val === 'number') return val
                        if (!val || val === '-') return 0
                        let clean = String(val).trim()

                        // Handle Indonesian format: "1.200,50" -> "1200.50"
                        if (clean.includes(',') && !clean.includes('.')) {
                            clean = clean.replace(/,/g, '.')
                        } else if (clean.includes(',') && clean.includes('.')) {
                            // Ambiguous, assume dot is thousands, comma is decimal (common in ID)
                            // Remove dots, replace comma with dot
                            clean = clean.replace(/\./g, '').replace(/,/g, '.')
                        }

                        // Remove any other non-numeric chars except dot and minus
                        clean = clean.replace(/[^0-9.-]/g, '')

                        return parseFloat(clean) || 0
                    }

                    return {
                        _rowNumber: rowNum,
                        provinsi: '',
                        wilayah: lastWilayah || 'Unknown',
                        lokasi: lastLokasi || '',
                        alamat: idx.alamat > -1 ? row[idx.alamat] : '',
                        lon: idx.longitude > -1 ? parseNum(row[idx.longitude]) : null,
                        lat: idx.latitude > -1 ? parseNum(row[idx.latitude]) : null,
                        nama_dermaga: displayNama || 'Unnamed Dermaga',
                        konstruksi: !valKonstruksi.startsWith('-') ? valKonstruksi : '',

                        panjang_m: parseNum(row[idx.panjang]),
                        lebar_m: parseNum(row[idx.lebar]),
                        luas_m2: parseNum(row[idx.panjang]) * parseNum(row[idx.lebar]),
                        draft_lwl_m: parseNum(row[idx.draft]),
                        pasut_hwl_lwl_m: parseNum(row[idx.pasut]),
                        kondisi_percent: parseNum(row[idx.kondisi]),

                        displacement_kri: idx.sandarKri > -1 ? row[idx.sandarKri] : '',
                        berat_sandar_maks_ton: idx.sandarTon > -1 ? parseNum(row[idx.sandarTon]) : 0,
                        tipe_kapal: idx.tipeKapal > -1 ? row[idx.tipeKapal] : '',
                        jumlah_maks: idx.sandarJml > -1 ? parseInt(row[idx.sandarJml]) || 0 : 0,

                        kemampuan_plat_lantai_ton: idx.platTon > -1 ? parseNum(row[idx.platTon]) : 0,
                        jenis_ranmor: idx.ranmorJenis > -1 ? row[idx.ranmorJenis] : '',
                        berat_ranmor_ton: idx.ranmorTon > -1 ? parseNum(row[idx.ranmorTon]) : 0,

                        titik_sambung_listrik: idx.listrikTitik > -1 ? parseInt(row[idx.listrikTitik]) || 0 : 0,
                        kapasitas_a: idx.listrikAmp > -1 ? parseNum(row[idx.listrikAmp]) : 0,
                        tegangan_v: idx.listrikVolt > -1 ? parseNum(row[idx.listrikVolt]) : 220,
                        frek_hz: idx.listrikHz > -1 ? parseNum(row[idx.listrikHz]) : 50,
                        daya_kva: idx.listrikDaya > -1 ? parseNum(row[idx.listrikDaya]) : 0,
                        sumber_listrik: idx.listrikSumber > -1 ? row[idx.listrikSumber] : '',

                        kapasitas_air_gwt_m3: idx.airGwt > -1 ? parseNum(row[idx.airGwt]) : 0,
                        debit_air_m3_jam: idx.airDebit > -1 ? parseNum(row[idx.airDebit]) : 0,
                        sumber_air: idx.airSumber > -1 ? row[idx.airSumber] : '',

                        kapasitas_bbm: idx.bbm > -1 ? row[idx.bbm] : '',
                        hydrant: idx.hydrant > -1 ? row[idx.hydrant] : '',
                        keterangan: idx.ket > -1 ? row[idx.ket] : '',

                        // Construct complex objects for preview consistency
                        sandar_items: (idx.tipeKapal > -1 || idx.sandarTon > -1) ? [{
                            tipe: idx.tipeKapal > -1 ? row[idx.tipeKapal] : 'Unknown',
                            ton: idx.sandarTon > -1 ? parseNum(row[idx.sandarTon]) : 0,
                            jumlah: idx.sandarJml > -1 ? (parseInt(row[idx.sandarJml]) || 1) : 1
                        }] : []
                    }

                }).filter(item => item !== null)

                if (mappedData.length === 0) {
                    alert('❌ Tidak ada data valid yang ditemukan! Pastikan format kolom sesuai.')
                    return
                }

                setPreviewData(mappedData)
                setShowPreview(true)
                alert(`✅ File berhasil dibaca (Smart Detect)!\nFound: ${mappedData.length} records.`)
            } catch (error) {
                console.error('Error reading file:', error)
                alert('❌ Gagal membaca file Excel: ' + error.message)
            }
        }
        reader.readAsBinaryString(file)
        e.target.value = '' // Reset input
    }

    // ... code continues ...

    // Later in the render part (Review Table):
    // This replace block targets the mappedData construction primarily, I will use a separate replace for the table rendering to be safe and clean.


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

            if (!response.ok) {
                const errData = await response.json().catch(() => ({ error: response.statusText }));
                throw new Error(errData.error || errData.details || 'Failed to delete');
            }

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

            {/* Summary Cards */}
            {!loading && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '16px',
                    marginBottom: '16px'
                }}>
                    {/* Total Dermaga */}
                    <div style={{
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        borderRadius: '12px',
                        padding: '20px',
                        color: 'white',
                        boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.3)'
                    }}>
                        <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '8px', fontWeight: '500' }}>Total Dermaga</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', fontFamily: FONT_MONO }}>{data.length}</div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '4px' }}>Fasilitas Pelabuhan</div>
                    </div>

                    {/* Total Lanal */}
                    <div style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        borderRadius: '12px',
                        padding: '20px',
                        color: 'white',
                        boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
                    }}>
                        <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '8px', fontWeight: '500' }}>Total Lanal</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', fontFamily: FONT_MONO }}>
                            {new Set(data.map(item => item.lokasi).filter(Boolean)).size}
                        </div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '4px' }}>Lokasi Berbeda</div>
                    </div>

                    {/* Kondisi Rata-rata */}
                    <div style={{
                        background: (() => {
                            const avgKondisi = data.length > 0
                                ? data.reduce((sum, item) => sum + (parseFloat(item.kondisi_persen) || 0), 0) / data.length
                                : 0;
                            return avgKondisi >= 80
                                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                : avgKondisi >= 50
                                    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                    : 'linear-gradient(135deg, #64748b 0%, #475569 100%)';
                        })(),
                        borderRadius: '12px',
                        padding: '20px',
                        color: 'white',
                        boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)'
                    }}>
                        <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '8px', fontWeight: '500' }}>Kondisi Rata-rata</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', fontFamily: FONT_MONO }}>
                            {data.length > 0
                                ? (data.reduce((sum, item) => sum + (parseFloat(item.kondisi_persen) || 0), 0) / data.length).toFixed(1)
                                : 0}%
                        </div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '4px' }}>Seluruh Dermaga</div>
                    </div>
                </div>
            )}

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
                                        <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600', fontSize: '0.75rem', width: '50px' }}>No</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', fontSize: '0.75rem' }}>Lokasi</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', fontSize: '0.75rem' }}>Wilayah</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', fontSize: '0.75rem' }}>Nama Dermaga</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600', fontSize: '0.75rem' }}>Luas (m²)</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600', fontSize: '0.75rem' }}>Kondisi (%)</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', fontSize: '0.75rem' }}>Tipe Kapal</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600', fontSize: '0.75rem' }}>Daya (kVA)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item, index) => {
                                        const fmt = (n) => n != null ? parseFloat(n).toLocaleString('id-ID', { maximumFractionDigits: 2 }) : '-'
                                        return (
                                            <tr
                                                key={item.id}
                                                onClick={() => handleRowClick(item)}
                                                style={{
                                                    background: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                                                    cursor: 'pointer',
                                                    borderBottom: '1px solid #f1f5f9',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#e0f2fe'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? '#ffffff' : '#f8fafc'}
                                            >
                                                <td style={{ padding: '10px 12px', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>{index + 1}</td>
                                                <td style={{ padding: '10px 12px', color: '#334155', fontSize: '0.85rem', fontWeight: '500' }}>{item.lokasi || '-'}</td>
                                                <td style={{ padding: '10px 12px', color: '#334155', fontSize: '0.85rem' }}>{item.wilayah || '-'}</td>
                                                <td style={{ padding: '10px 12px', fontWeight: '600', color: '#003366', fontSize: '0.85rem' }}>{item.nama_dermaga || '-'}</td>
                                                <td style={{ padding: '10px 12px', textAlign: 'right', color: '#334155', fontSize: '0.85rem', fontFamily: FONT_MONO }}>{fmt(item.luas_m2)}</td>
                                                <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: '0.8rem' }}>
                                                    <span style={{
                                                        background: item.kondisi_persen >= 80 ? '#dcfce7' : item.kondisi_persen >= 50 ? '#fef3c7' : '#fee2e2',
                                                        color: item.kondisi_persen >= 80 ? '#166534' : item.kondisi_persen >= 50 ? '#92400e' : '#991b1b',
                                                        padding: '4px 10px',
                                                        borderRadius: '12px',
                                                        fontWeight: '600',
                                                        display: 'inline-block'
                                                    }}>
                                                        {item.kondisi_persen ? `${item.kondisi_persen}%` : '-'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '10px 12px', color: '#334155', fontSize: '0.8rem' }}>{item.tipe_kapal || '-'}</td>
                                                <td style={{ padding: '10px 12px', textAlign: 'right', color: '#334155', fontSize: '0.85rem', fontFamily: FONT_MONO }}>{fmt(item.daya_kva)}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Modal - Modern 2026 No Box */}
                    {isModalOpen && selectedItem && (
                        /* Modal Overlay with Glassmorphism */
                        <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(15, 23, 42, 0.65)',
                            backdropFilter: 'blur(12px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '20px',
                            animation: 'fadeIn 0.2s ease-out'
                        }} onClick={handleCancel}>

                            {/* Modal Card */}
                            <div style={{
                                background: '#ffffff',
                                borderRadius: '24px',
                                maxWidth: '1200px',
                                width: '100%',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column'
                            }} onClick={e => e.stopPropagation()}>

                                {/* Sticky Header */}
                                <div style={{
                                    padding: '24px 32px',
                                    borderBottom: '1px solid #f1f5f9',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    position: 'sticky',
                                    top: 0,
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(16px)',
                                    zIndex: 20
                                }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '40px', height: '40px',
                                                background: isEditMode ? '#dbeafe' : '#f1f5f9',
                                                borderRadius: '12px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '1.2rem'
                                            }}>
                                                {isEditMode ? '✏️' : '⚓'}
                                            </div>
                                            <div>
                                                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.025em' }}>
                                                    {isEditMode ? 'Edit Data Faslabuh' : (selectedItem.nama_dermaga || 'Detail Dermaga')}
                                                </h2>
                                                <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
                                                    {selectedItem.lokasi ? `${selectedItem.lokasi} • ` : ''}{selectedItem.provinsi || 'Data belum lengkap'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        {!isEditMode ? (
                                            <>
                                                <button
                                                    onClick={() => setIsEditMode(true)}
                                                    style={{
                                                        background: '#3b82f6',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '12px',
                                                        padding: '10px 20px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.5)',
                                                        transition: 'all 0.2s',
                                                        display: 'flex', alignItems: 'center', gap: '8px'
                                                    }}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(selectedItem.id)}
                                                    style={{
                                                        background: '#ffffff',
                                                        color: '#ef4444',
                                                        border: '1px solid #fee2e2',
                                                        borderRadius: '12px',
                                                        padding: '10px 20px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        display: 'flex', alignItems: 'center', gap: '8px'
                                                    }}
                                                >
                                                    🗑️ Hapus
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={handleSave} style={{
                                                    background: '#10b981',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    padding: '10px 24px',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.5)',
                                                    display: 'flex', alignItems: 'center', gap: '8px'
                                                }}>
                                                    💾 Simpan Perubahan
                                                </button>
                                                <button onClick={handleCancel} style={{
                                                    background: '#f1f5f9',
                                                    color: '#64748b',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    padding: '10px 20px',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                }}>
                                                    Batal
                                                </button>
                                            </>
                                        )}
                                        <button onClick={handleCancel} style={{
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '50%',
                                            width: '40px',
                                            height: '40px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '18px',
                                            cursor: 'pointer',
                                            color: '#64748b',
                                            marginLeft: '8px'
                                        }}>
                                            ×
                                        </button>
                                    </div>
                                </div>

                                {/* Content - No Boxes, Clean Lines */}
                                <form onSubmit={handleSave} style={{ padding: '24px' }}>

                                    {/* Section 1: Identitas & Lokasi */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', marginBottom: '12px', paddingBottom: '6px', borderBottom: '2px solid #e2e8f0' }}>
                                            Identitas & Lokasi
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Lokasi</label>
                                                {isEditMode ? (
                                                    <input value={selectedItem.lokasi ?? ''} onChange={e => updateField('lokasi', e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_SYSTEM }} />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.9rem', color: '#0f172a', fontWeight: '500' }}>{selectedItem.lokasi || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Wilayah</label>
                                                {isEditMode ? (
                                                    <input value={selectedItem.wilayah ?? ''} onChange={e => updateField('wilayah', e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_SYSTEM }} />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.9rem', color: '#0f172a' }}>{selectedItem.wilayah || '-'}</div>
                                                )}
                                            </div>
                                            <div style={{ gridColumn: 'span 2' }}>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Alamat Lengkap</label>
                                                {isEditMode ? (
                                                    <textarea value={selectedItem.alamat ?? ''} onChange={e => updateField('alamat', e.target.value)} rows="2" style={{ width: '100%', padding: '8px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_SYSTEM, resize: 'vertical' }} placeholder="Jl. Raya Pelabuhan No..." />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#475569', lineHeight: '1.4' }}>{selectedItem.alamat || '-'}</div>
                                                )}
                                            </div>
                                            <div style={{ gridColumn: 'span 2' }}>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Nama Dermaga</label>
                                                {isEditMode ? (
                                                    <input value={selectedItem.nama_dermaga ?? ''} onChange={e => updateField('nama_dermaga', e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_SYSTEM }} />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '1rem', color: '#0f172a', fontWeight: '700' }}>{selectedItem.nama_dermaga || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Longitude</label>
                                                {isEditMode ? (
                                                    <input type="text" placeholder="106.123 or 106°45'E" value={selectedItem.lon ?? ''} onChange={e => updateField('lon', e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_MONO }} />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a', fontFamily: FONT_MONO }}>{selectedItem.lon || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Latitude</label>
                                                {isEditMode ? (
                                                    <input type="text" placeholder="-6.123 or 6°08'S" value={selectedItem.lat ?? ''} onChange={e => updateField('lat', e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_MONO }} />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a', fontFamily: FONT_MONO }}>{selectedItem.lat || '-'}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Dimensi & Konstruksi */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', marginBottom: '12px', paddingBottom: '6px', borderBottom: '2px solid #e2e8f0' }}>
                                            Dimensi & Konstruksi
                                        </h3>
                                        <div style={{ marginBottom: '12px' }}>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Konstruksi</label>
                                            {isEditMode ? (
                                                <input value={selectedItem.konstruksi ?? ''} onChange={e => updateField('konstruksi', e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_SYSTEM }} />
                                            ) : (
                                                <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a' }}>{selectedItem.konstruksi || '-'}</div>
                                            )}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
                                            {[
                                                { label: 'Panjang (m)', field: 'panjang_m' },
                                                { label: 'Lebar (m)', field: 'lebar_m' },
                                                { label: 'Luas (m²)', field: 'luas_m2', readonly: true, value: (parseFloat(selectedItem.panjang_m) || 0) * (parseFloat(selectedItem.lebar_m) || 0) },
                                                { label: 'Draft LWL (m)', field: 'draft_lwl_m' },
                                                { label: 'Pasut HWL-LWL (m)', field: 'pasut_hwl_lwl_m' },
                                                { label: 'Kondisi (%)', field: 'kondisi_percent' }
                                            ].map(({ label, field, readonly, value }) => (
                                                <div key={field}>
                                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>{label}</label>
                                                    {isEditMode && !readonly ? (
                                                        <input type="number" step="any" value={selectedItem[field] ?? ''} onChange={e => updateField(field, e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_MONO }} />
                                                    ) : (
                                                        <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a', fontFamily: FONT_MONO }}>{value !== undefined ? value : selectedItem[field] || '-'}</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Section 3: Kemampuan Sandar & Kapal */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', marginBottom: '12px', paddingBottom: '6px', borderBottom: '2px solid #e2e8f0' }}>
                                            Kemampuan Sandar & Kapal
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Displacement KRI</label>
                                                {isEditMode ? (
                                                    <input value={selectedItem.displacement_kri ?? ''} onChange={e => updateField('displacement_kri', e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_SYSTEM }} />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a' }}>{selectedItem.displacement_kri || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Berat Sandar Maks (ton)</label>
                                                {isEditMode ? (
                                                    <input type="number" step="any" value={selectedItem.berat_sandar_maks_ton ?? ''} onChange={e => updateField('berat_sandar_maks_ton', e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_MONO }} />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a', fontFamily: FONT_MONO }}>{selectedItem.berat_sandar_maks_ton || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Tipe Kapal</label>
                                                {isEditMode ? (
                                                    <input value={selectedItem.tipe_kapal ?? ''} onChange={e => updateField('tipe_kapal', e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_SYSTEM }} />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a' }}>{selectedItem.tipe_kapal || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Jumlah Maks</label>
                                                {isEditMode ? (
                                                    <input type="number" value={selectedItem.jumlah_maks ?? ''} onChange={e => updateField('jumlah_maks', e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_MONO }} />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a', fontFamily: FONT_MONO }}>{selectedItem.jumlah_maks || '-'}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 4: Fasilitas Darat (Plat & Ranmor) */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', marginBottom: '12px', paddingBottom: '6px', borderBottom: '2px solid #e2e8f0' }}>
                                            Fasilitas Darat
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Kemampuan Plat (ton)</label>
                                                {isEditMode ? (
                                                    <input type="number" step="any" value={selectedItem.kemampuan_plat_lantai_ton ?? ''} onChange={e => updateField('kemampuan_plat_lantai_ton', e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_MONO }} />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a', fontFamily: FONT_MONO }}>{selectedItem.kemampuan_plat_lantai_ton || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Jenis Ranmor</label>
                                                {isEditMode ? (
                                                    <input value={selectedItem.jenis_ranmor ?? ''} onChange={e => updateField('jenis_ranmor', e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_SYSTEM }} />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a' }}>{selectedItem.jenis_ranmor || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Berat Ranmor (ton)</label>
                                                {isEditMode ? (
                                                    <input type="number" step="any" value={selectedItem.berat_ranmor_ton ?? ''} onChange={e => updateField('berat_ranmor_ton', e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_MONO }} />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a', fontFamily: FONT_MONO }}>{selectedItem.berat_ranmor_ton || '-'}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 5: Listrik */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', marginBottom: '12px', paddingBottom: '6px', borderBottom: '2px solid #e2e8f0' }}>
                                            Listrik
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Titik Sambung</label>
                                                {isEditMode ? (
                                                    <input type="number" value={selectedItem.titik_sambung_listrik ?? ''} onChange={e => updateField('titik_sambung_listrik', e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_MONO }} />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a', fontFamily: FONT_MONO }}>{selectedItem.titik_sambung_listrik || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Kapasitas (A)</label>
                                                {isEditMode ? (
                                                    <input type="number" value={selectedItem.kapasitas_a ?? ''} onChange={e => updateField('kapasitas_a', e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_MONO }} />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a', fontFamily: FONT_MONO }}>{selectedItem.kapasitas_a || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Tegangan (V)</label>
                                                {isEditMode ? (
                                                    <select value={selectedItem.tegangan_v ?? 220} onChange={e => updateField('tegangan_v', parseInt(e.target.value))} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_MONO }}>
                                                        {OPTIONS.tegangan.map(v => <option key={v} value={v}>{v}</option>)}
                                                    </select>
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a', fontFamily: FONT_MONO }}>{selectedItem.tegangan_v || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Frek (Hz)</label>
                                                {isEditMode ? (
                                                    <select value={selectedItem.frek_hz ?? 50} onChange={e => updateField('frek_hz', parseInt(e.target.value))} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_MONO }}>
                                                        {OPTIONS.frekuensi.map(f => <option key={f} value={f}>{f}</option>)}
                                                    </select>
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a', fontFamily: FONT_MONO }}>{selectedItem.frek_hz || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Sumber</label>
                                                {isEditMode ? (
                                                    <select value={selectedItem.sumber_listrik ?? 'PLN'} onChange={e => updateField('sumber_listrik', e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                                                        {OPTIONS.sumber_listrik.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a' }}>{selectedItem.sumber_listrik || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Daya (kVA)</label>
                                                {isEditMode ? (
                                                    <input type="number" step="any" value={selectedItem.daya_kva ?? ''} onChange={e => updateField('daya_kva', e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_MONO }} />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a', fontFamily: FONT_MONO }}>{selectedItem.daya_kva || '-'}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 6: Air, BBM & Lainnya */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', marginBottom: '12px', paddingBottom: '6px', borderBottom: '2px solid #e2e8f0' }}>
                                            Air, BBM & Kelengkapan
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Air GWT (m³)</label>
                                                {isEditMode ? (
                                                    <input type="number" step="any" value={selectedItem.kapasitas_air_gwt_m3 ?? ''} onChange={e => updateField('kapasitas_air_gwt_m3', e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_MONO }} />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a', fontFamily: FONT_MONO }}>{selectedItem.kapasitas_air_gwt_m3 || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Debit Air (m³/jam)</label>
                                                {isEditMode ? (
                                                    <input type="number" step="any" value={selectedItem.debit_air_m3_jam ?? ''} onChange={e => updateField('debit_air_m3_jam', e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_MONO }} />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a', fontFamily: FONT_MONO }}>{selectedItem.debit_air_m3_jam || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Sumber Air</label>
                                                {isEditMode ? (
                                                    <select value={selectedItem.sumber_air ?? 'PDAM'} onChange={e => updateField('sumber_air', e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                                                        {OPTIONS.sumber_air.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a' }}>{selectedItem.sumber_air || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Kapasitas BBM</label>
                                                {isEditMode ? (
                                                    <input value={selectedItem.kapasitas_bbm ?? ''} onChange={e => updateField('kapasitas_bbm', e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_SYSTEM }} />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a' }}>{selectedItem.kapasitas_bbm || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>Hydrant</label>
                                                {isEditMode ? (
                                                    <input value={selectedItem.hydrant ?? ''} onChange={e => updateField('hydrant', e.target.value)} style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_SYSTEM }} />
                                                ) : (
                                                    <div style={{ padding: '6px 0', fontSize: '0.85rem', color: '#0f172a' }}>{selectedItem.hydrant || '-'}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 7: Keterangan */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', marginBottom: '12px', paddingBottom: '6px', borderBottom: '2px solid #e2e8f0' }}>
                                            Keterangan
                                        </h3>
                                        {isEditMode ? (
                                            <textarea value={selectedItem.keterangan ?? ''} onChange={e => updateField('keterangan', e.target.value)} rows="3" style={{ width: '100%', padding: '8px 10px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: FONT_SYSTEM, resize: 'vertical' }} placeholder="Catatan tambahan..." />
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
            )
            }

            {/* Import Preview Modal */}
            {
                showPreview && (
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
                                                    <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5 }}>No</th>
                                                    <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5, minWidth: '80px' }}>Provinsi</th>
                                                    <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5, minWidth: '80px' }}>Wilayah</th>
                                                    <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5, minWidth: '120px' }}>Nama Dermaga</th>
                                                    <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5, minWidth: '100px' }}>Konstruksi</th>
                                                    <th style={{ padding: '8px 6px', textAlign: 'right', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5 }}>P (m)</th>
                                                    <th style={{ padding: '8px 6px', textAlign: 'right', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5 }}>L (m)</th>
                                                    <th style={{ padding: '8px 6px', textAlign: 'right', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5 }}>Draft</th>
                                                    <th style={{ padding: '8px 6px', textAlign: 'right', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5 }}>Pasut</th>
                                                    <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5 }}>Kondisi</th>
                                                    <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5, minWidth: '100px' }}>Sandar</th>
                                                    <th style={{ padding: '8px 6px', textAlign: 'right', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5 }}>Plat MST</th>
                                                    <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5 }}>Listrik</th>
                                                    <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5 }}>Air</th>
                                                    <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5 }}>BBM</th>
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
                                                        <td style={{ padding: '6px 6px', textAlign: 'center', color: '#64748b', fontSize: '0.7rem' }}>{index + 1}</td>
                                                        <td style={{ padding: '6px 6px', color: '#475569', fontSize: '0.7rem' }}>{item.provinsi || '-'}</td>
                                                        <td style={{ padding: '6px 6px', color: '#64748b', fontSize: '0.65rem' }}>{item.wilayah || '-'}</td>
                                                        <td style={{ padding: '6px 6px', fontWeight: '600', color: '#003366', fontSize: '0.75rem' }}>{item.nama_dermaga || '-'}</td>
                                                        <td style={{ padding: '6px 6px', color: '#334155', fontSize: '0.65rem' }}>{item.konstruksi || '-'}</td>
                                                        <td style={{ padding: '6px 6px', textAlign: 'right', fontFamily: FONT_MONO, fontSize: '0.7rem' }}>{item.panjang_m || 0}</td>
                                                        <td style={{ padding: '6px 6px', textAlign: 'right', fontFamily: FONT_MONO, fontSize: '0.7rem' }}>{item.lebar_m || 0}</td>
                                                        <td style={{ padding: '6px 6px', textAlign: 'right', fontFamily: FONT_MONO, fontSize: '0.7rem' }}>{item.draft_lwl_m || 0}</td>
                                                        <td style={{ padding: '6px 6px', textAlign: 'right', fontFamily: FONT_MONO, fontSize: '0.7rem' }}>{item.pasut_hwl_lwl_m || 0}</td>
                                                        <td style={{ padding: '6px 6px', textAlign: 'center' }}>
                                                            <span style={{
                                                                padding: '2px 6px',
                                                                borderRadius: '4px',
                                                                fontSize: '0.65rem',
                                                                fontWeight: '600',
                                                                background: item.kondisi_percent > 70 ? '#dcfce7' : '#fef3c7',
                                                                color: item.kondisi_percent > 70 ? '#15803d' : '#b45309'
                                                            }}>
                                                                {item.kondisi_percent || 0}%
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '6px 6px', fontSize: '0.65rem', color: '#64748b' }}>
                                                            {item.sandar_items?.length > 0 ? item.sandar_items.map(s => `${s.jumlah}x ${s.tipe} (${s.ton}t)`).join(', ') : '-'}
                                                        </td>
                                                        <td style={{ padding: '6px 6px', textAlign: 'right', fontFamily: FONT_MONO, fontSize: '0.7rem' }}>{item.kemampuan_plat_lantai_ton || item.plat_mst_ton || '-'}</td>
                                                        <td style={{ padding: '6px 6px', textAlign: 'center', fontSize: '0.65rem' }}>
                                                            {item.sumber_listrik || item.listrik_sumber || '-'}{item.daya_kva || item.listrik_daya_kva ? ` (${item.daya_kva || item.listrik_daya_kva}kVA)` : ''}
                                                        </td>
                                                        <td style={{ padding: '6px 6px', textAlign: 'center', fontSize: '0.65rem' }}>
                                                            {item.sumber_air || item.air_sumber || '-'}{item.kapasitas_air_gwt_m3 || item.air_gwt_m3 ? ` (${item.kapasitas_air_gwt_m3 || item.air_gwt_m3}m³)` : ''}
                                                        </td>
                                                        <td style={{ padding: '6px 6px', textAlign: 'center', fontSize: '0.65rem' }}>{item.kapasitas_bbm || item.bbm || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Data Summary */}
                                <div style={{ marginTop: '12px', padding: '12px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.75rem', color: '#475569' }}>
                                    <strong>📊 Ringkasan Data:</strong>
                                    <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                                        <li>Total baris: <strong>{previewData.length}</strong></li>
                                        <li>Dengan Sandar Items: <strong>{previewData.filter(d => d.sandar_items?.length > 0).length}</strong></li>
                                        <li>Dengan Listrik: <strong>{previewData.filter(d => d.listrik_sumber).length}</strong></li>
                                        <li>Dengan Air: <strong>{previewData.filter(d => d.air_sumber).length}</strong></li>
                                        <li>Dengan BBM: <strong>{previewData.filter(d => d.bbm).length}</strong></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    )
}

export default Faslabuh
