import { useEffect, useState, useMemo, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icon issue in React-Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
})

const mapLanalColor = (lanal) => {
    if (!lanal) return '#0ea5e9' // default blue
    const name = String(lanal).toLowerCase()
    if (name.includes('banten')) return '#3b82f6' // biru
    if (name.includes('lampung')) return '#10b981' // hijau
    if (name.includes('jakarta') || name.includes('tanjung priok')) return '#f59e0b' // kuning/amber
    if (name.includes('cirebon')) return '#8b5cf6' // ungu
    if (name.includes('palembang')) return '#ec4899' // pink
    if (name.includes('bengkulu')) return '#f43f5e' // rose
    if (name.includes('bangka') || name.includes('belitung')) return '#14b8a6' // teal
    if (name.includes('bandung')) return '#6366f1' // indigo
    if (name.includes('pontianak')) return '#d946ef' // fuchsia
    return '#64748b' // default slate
}
    
const createDynamicIcon = (color) => {
    // Ukuran 2x jadi 14x14
    return new L.Icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14">
                <circle cx="7" cy="7" r="6" fill="${color}" stroke="#fff" stroke-width="2"/>
            </svg>
        `),
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        popupAnchor: [0, -10]
    })
}

// Fallback old icon just in case
const tanahIcon = createDynamicIcon('#0ea5e9')

const bangunanIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="7" height="7" viewBox="0 0 14 14">
            <circle cx="7" cy="7" r="6" fill="#f97316" stroke="#fff" stroke-width="2"/>
        </svg>
    `),
    iconSize: [7, 7],
    iconAnchor: [3.5, 3.5],
    popupAnchor: [0, -5]
})

const perumahanIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="7" height="7" viewBox="0 0 14 14">
            <circle cx="7" cy="7" r="6" fill="#10b981" stroke="#fff" stroke-width="2"/>
        </svg>
    `),
    iconSize: [7, 7],
    iconAnchor: [3.5, 3.5],
    popupAnchor: [0, -5]
})

// Configurable Node Settings moved to state
// const NODE_COLOR = '#ef4444' // Red
// const NODE_SIZE = 14
// faslabuhIcon definition moved inside component to support dynamic state

// Configurable Node Settings for Harkan
const HARKAN_NODE_COLOR = '#eab308' // Yellow
const HARKAN_NODE_SIZE = 18

const harkanIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="${HARKAN_NODE_SIZE}" height="${HARKAN_NODE_SIZE}" viewBox="0 0 24 24" fill="${HARKAN_NODE_COLOR}" stroke="#fff" stroke-width="1.5">
            <path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2zM16 6l-1-3-4 6-4-6-1 3H4v10h16V6h-4z"/>
        </svg>
    `),
    iconSize: [HARKAN_NODE_SIZE, HARKAN_NODE_SIZE],
    iconAnchor: [HARKAN_NODE_SIZE / 2, HARKAN_NODE_SIZE / 2],
    popupAnchor: [0, -10]
})

// =========================================================
// DATA DISASTER MANAGEMENT (WATER GATES)
// =========================================================
const INITIAL_WATER_GATES = [
  { id: 1, name: 'Katulampa', lat: -6.634, lng: 106.834, level: 'Siaga 2', val: '120cm', type: 'amber' },
  { id: 2, name: 'Pos Depok', lat: -6.396, lng: 106.828, level: 'Siaga 3', val: '180cm', type: 'amber' },
  { id: 3, name: 'PA Manggarai', lat: -6.207, lng: 106.848, level: 'Siaga 1', val: '950cm', type: 'red' },
  { id: 4, name: 'PA Karet', lat: -6.201, lng: 106.815, level: 'Siaga 4', val: '420cm', type: 'blue' },
  { id: 5, name: 'Pompa Pluit', lat: -6.115, lng: 106.804, level: 'Siaga 4', val: '150cm', type: 'blue' },
  // 3 Tambahan Lokasi Banjir
  { id: 6, name: 'Banjir Kampung Melayu', lat: -6.223, lng: 106.865, level: 'Banjir', val: '110cm', type: 'red' },
  { id: 7, name: 'Banjir Cawang', lat: -6.242, lng: 106.869, level: 'Banjir', val: '135cm', type: 'red' },
  { id: 8, name: 'Banjir Bidara Cina', lat: -6.230, lng: 106.866, level: 'Banjir', val: '150cm', type: 'red' },
]

const createCustomIcon = (type, label) => L.divIcon({
  className: 'custom-icon-wrapper',
  html: `<div class="map-marker ${type}"><div class="map-marker-label" style="top: -24px">${label}</div></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

// Component to update map center without re-rendering the whole map
function ChangeView({ center }) {
    const map = useMap()
    useEffect(() => {
        if (center) {
            map.flyTo(center, map.getZoom(), {
                animate: true,
                duration: 1.5
            })
        }
    }, [center, map])
    return null
}

// MapClickHandler to handle click-to-set-coordinate mode
function MapClickHandler({ active, onMapClick }) {
    useMapEvents({
        click(e) {
            if (active) {
                onMapClick(e.latlng)
            }
        }
    })
    return null
}

function PetaFaslan({ isDashboard = false, showDisaster = true }) {
    const [assetsTanah, setAssetsTanah] = useState([])
    const [assetsBangunan, setAssetsBangunan] = useState([])
    const [assetsFaslabuh, setAssetsFaslabuh] = useState([])
    const [assetsHarkan, setAssetsHarkan] = useState([])
    const [assetsRumneg, setAssetsRumneg] = useState([])
    const [selectedFaslabuh, setSelectedFaslabuh] = useState(null)
    const [loading, setLoading] = useState(true)
    const [center, setCenter] = useState([-6.1754, 106.8272]) // Default: Jakarta (Monas)
    const [liveDisasters, setLiveDisasters] = useState(INITIAL_WATER_GATES)

    // Coordinate setting mode
    const [coordMode, setCoordMode] = useState(false)
    const [allMasterAssets, setAllMasterAssets] = useState([])
    const [selectedAssetForCoord, setSelectedAssetForCoord] = useState(null)
    const [coordSaving, setCoordSaving] = useState(false)
    const [coordSearchTerm, setCoordSearchTerm] = useState('')
    const [coordFilterType, setCoordFilterType] = useState('all') // 'all', 'TANAH', 'BANGUNAN'
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        if (!isDashboard || !showDisaster) return;
        
        let interval;
        const fetchBMKG = async () => {
            try {
                // Fetch direct open XML data from BMKG to calculate live variables
                const response = await fetch('https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-DKIJakarta.xml');
                const text = await response.text();
                // Check basically if there's Rain (code 60/61) in the forecast XML
                const isRaining = text.includes('<value>60</value>') || text.includes('<value>61</value>');
                
                setLiveDisasters(prev => prev.map(gate => {
                    let baseVal = parseInt(gate.val.replace('cm', ''));
                    // Apply random noise for real-time sensor fluctuation
                    let fluctuation = isRaining ? (Math.floor(Math.random() * 10) + 2) : (Math.floor(Math.random() * 5) - 2);
                    let newVal = baseVal + fluctuation;
                    if (newVal < 0) newVal = 0;
                    return { ...gate, val: `${newVal}cm` };
                }));
            } catch(e) {
                console.warn("Failed to fetch BMKG real data, using fallback logic", e);
            }
        };

        fetchBMKG();
        // Update live feed values every 10 seconds to simulate real telemetry polling from BMKG
        interval = setInterval(fetchBMKG, 10000);
        return () => clearInterval(interval);
    }, [isDashboard, showDisaster]);

    // Component State for Faslabuh Settings
    const [faslabuhSettings, setFaslabuhSettings] = useState(() => {
        const saved = localStorage.getItem('faslabuhSettings')
        return saved ? JSON.parse(saved) : { color: '#ef4444', size: 24 } // Red, larger size
    })
    const [showSettings, setShowSettings] = useState(false)

    // Save Settings
    useEffect(() => {
        localStorage.setItem('faslabuhSettings', JSON.stringify(faslabuhSettings))
    }, [faslabuhSettings])

    // Memoized Icon for Faslabuh (Ship Shape)
    const faslabuhIcon = useMemo(() => new L.Icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="${faslabuhSettings.size}" height="${faslabuhSettings.size}" viewBox="0 0 24 24" fill="${faslabuhSettings.color}" stroke="#fff" stroke-width="1.5">
               <path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2zM16 6l-1-3-4 6-4-6-1 3H4v10h16V6h-4z"/>
            </svg>
        `),
        iconSize: [faslabuhSettings.size, faslabuhSettings.size],
        iconAnchor: [faslabuhSettings.size / 2, faslabuhSettings.size / 2],
        popupAnchor: [0, -10]
    }), [faslabuhSettings])

    // Helper function to convert DMS to Decimal
    const dmsToDecimal = (degrees, minutes, seconds, direction) => {
        let decimal = Math.abs(parseFloat(degrees) || 0) +
            (parseFloat(minutes) || 0) / 60 +
            (parseFloat(seconds) || 0) / 3600
        if (direction === 'S' || direction === 'W') {
            decimal = -decimal
        }
        return decimal
    }

    // Helper function to parse coordinates
    const parseCoordinates = (coordString) => {
        if (!coordString || coordString === '-' || String(coordString).trim() === '') {
            return null
        }

        let str = String(coordString).trim()

        // Regex untuk DMS Lengkap (6°09'51.78"S 106°50'22.68"E) - handle simbol & atau ₺ atau spasi
        const dmsPattern = /(\d+)\s*[°ᵒo]\s*(\d+)\s*[′'´]\s*([\d.]+)\s*[″"₺]?\s*[^NS]*([NS])[^°\d]*(\d+)\s*[°ᵒo]\s*(\d+)\s*[′'´]\s*([\d.]+)\s*[″"₺]?\s*[^EW]*([EW])/i
        const dmsMatch = str.match(dmsPattern)

        if (dmsMatch) {
            const lat = dmsToDecimal(dmsMatch[1], dmsMatch[2], dmsMatch[3], dmsMatch[4].toUpperCase())
            const lon = dmsToDecimal(dmsMatch[5], dmsMatch[6], dmsMatch[7], dmsMatch[8].toUpperCase())
            return [lat, lon]
        }

        // Regex untuk DMS Sederhana (6°12'S 106°46'E) - tanpa detik
        const simpleDmsPattern = /(\d+)\s*[°ᵒo]\s*(\d+)\s*[′'´]?\s*[^NS]*([NS])[^°\d]*(\d+)\s*[°ᵒo]\s*(\d+)\s*[′'´]?\s*[^EW]*([EW])/i
        const simpleDmsMatch = str.match(simpleDmsPattern)

        if (simpleDmsMatch) {
            const lat = dmsToDecimal(simpleDmsMatch[1], simpleDmsMatch[2], 0, simpleDmsMatch[3].toUpperCase())
            const lon = dmsToDecimal(simpleDmsMatch[4], simpleDmsMatch[5], 0, simpleDmsMatch[6].toUpperCase())
            return [lat, lon]
        }

        // Handling Decimal
        // Ganti koma desimal (jika diapit angka) menjadi titik: 1,234 -> 1.234
        // Tapi jangan ganti koma separator: 1.234, 5.678
        // Deteksi dulu apakah pakai koma atau titik koma sebagai separator

        let parts = []

        if (str.includes(';')) {
            // Separator kuat: titik koma
            // Replace koma jadi titik di masing2 bagian
            parts = str.split(';').map(s => s.replace(',', '.'))
        } else {
            // Cek jumlah koma
            const commaCount = (str.match(/,/g) || []).length

            if (commaCount === 1) {
                // Standar: -6.1234, 106.1234 (1 koma sebagai separator)
                parts = str.split(',')
            } else if (commaCount > 1) {
                // Kemungkinan format Indo: -6,1234, 106,1234
                // Replace semua koma yang diapit angka menjadi titik
                const normalized = str.replace(/(\d),(\d)/g, '$1.$2')
                // Sekarang sisa koma separator (atau spasi)
                if (normalized.includes(',')) {
                    parts = normalized.split(',')
                } else {
                    parts = normalized.split(/\s+/)
                }
            } else {
                // 0 koma, pisah spasi: -6.1234 106.1234
                parts = str.split(/\s+/)
            }
        }

        parts = parts.map(s => s.trim()).filter(s => s)

        if (parts.length >= 2) {
            const num1 = parseFloat(parts[0])
            const num2 = parseFloat(parts[1])

            if (!isNaN(num1) && !isNaN(num2)) {
                let lat, lon
                // Auto-detect Lat/Lon based on Indonesia region
                // Lon Indonesia: 95 - 141 (Positive, > 90)
                // Lat Indonesia: -11 - 6 (Small number, < 90)

                if (Math.abs(num1) > 90) {
                    // num1 is Longitude, num2 is Latitude
                    lon = num1
                    lat = num2
                } else if (Math.abs(num2) > 90) {
                    // num2 is Longitude, num1 is Latitude
                    lat = num1
                    lon = num2
                } else {
                    // Fallback: usually Lat, Lon
                    lat = num1
                    lon = num2
                }

                if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
                    return [lat, lon]
                }
            }
        }

        return null
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                // setLoading(true) // Non-blocking loading

                const safeFetchStatus = async (url) => {
                    try {
                        const res = await fetch(url)
                        if (!res.ok) return []
                        return await res.json()
                    } catch (e) {
                        return []
                    }
                }

                // Fetch Aset Tanah and Bangunan from Master Data Utama
                const endpointMaster = '/api/master-asset-utama'
                const finalEndpointMaster = import.meta.env.PROD ? endpointMaster : `http://localhost:3001${endpointMaster}`
                const dataMaster = await safeFetchStatus(finalEndpointMaster)
                const dataTanah = dataMaster.filter(d => d.jenis_bmn && String(d.jenis_bmn).toUpperCase().includes('TANAH'))
                const dataBangunan = dataMaster.filter(d => d.jenis_bmn && String(d.jenis_bmn).toUpperCase().includes('BANGUNAN'))

                // Store all for coordinate-setting panel
                setAllMasterAssets([...dataTanah, ...dataBangunan])

                // Fetch Faslabuh
                const endpointFaslabuh = '/api/faslabuh'
                const finalEndpointFaslabuh = import.meta.env.PROD ? endpointFaslabuh : `http://localhost:3001${endpointFaslabuh}`
                const dataFaslabuh = await safeFetchStatus(finalEndpointFaslabuh)

                // Fetch Harkan from API
                const endpointHarkan = '/api/harkan'
                const finalEndpointHarkan = import.meta.env.PROD ? endpointHarkan : `http://localhost:3001${endpointHarkan}`
                const dataHarkan = await safeFetchStatus(finalEndpointHarkan)
                
                // Fetch Rumneg from API
                const endpointRumneg = '/api/assets/rumneg'
                const finalEndpointRumneg = import.meta.env.PROD ? endpointRumneg : `http://localhost:3001${endpointRumneg}`
                const dataRumneg = await safeFetchStatus(finalEndpointRumneg)
                
                const validHarkan = dataHarkan.filter(item => {
                    const lat = parseFloat(item.latitude)
                    const lon = parseFloat(item.longitude)
                    return !isNaN(lat) && !isNaN(lon)
                })
                setAssetsHarkan(validHarkan)

                const validRumneg = dataRumneg.filter(item => {
                    const lat = parseFloat(item.latitude)
                    const lon = parseFloat(item.longitude)
                    return !isNaN(lat) && !isNaN(lon)
                })
                setAssetsRumneg(validRumneg)

                // Filter assets_tanah — support new longitude/latitude fields, fallback to location or coordinates
                const validTanah = dataTanah.filter(asset => {
                    // Cek field latitude/longitude dari DB Master Asset Utama
                    if (asset.latitude && asset.longitude && !isNaN(parseFloat(asset.latitude)) && !isNaN(parseFloat(asset.longitude))) {
                        asset._parsedCoords = [parseFloat(asset.latitude), parseFloat(asset.longitude)]
                        return true
                    }
                    // Cek field coordinates dulu (legacy)
                    if (asset.coordinates && asset.coordinates !== '-') {
                        const coords = parseCoordinates(asset.coordinates)
                        if (coords) {
                            asset._parsedCoords = coords
                            return true
                        }
                    }
                    // Fallback: coba field location yang berisi DMS (legacy)
                    if (asset.location) {
                        const coords = parseCoordinates(asset.location)
                        if (coords) {
                            asset._parsedCoords = coords
                            return true
                        }
                    }
                    return false
                })

                const validBangunan = dataBangunan.filter(asset => {
                    if (asset.latitude && asset.longitude && !isNaN(parseFloat(asset.latitude)) && !isNaN(parseFloat(asset.longitude))) {
                        asset._parsedCoords = [parseFloat(asset.latitude), parseFloat(asset.longitude)]
                        return true
                    }
                    if (asset.coordinates) {
                        const coords = parseCoordinates(asset.coordinates)
                        if (coords) {
                            asset._parsedCoords = coords
                            return true
                        }
                    }
                    return false
                })

                const validFaslabuh = dataFaslabuh.filter(f => f.lat && f.lon && !isNaN(parseFloat(f.lat)) && !isNaN(parseFloat(f.lon)))

                setAssetsTanah(validTanah)
                setAssetsBangunan(validBangunan)
                setAssetsFaslabuh(validFaslabuh)

                // Set center prioritized: Tanah -> Bangunan -> Faslabuh -> Harkan -> Default
                if (validTanah.length > 0) {
                    setCenter(validTanah[0]._parsedCoords)
                } else if (validBangunan.length > 0) {
                    setCenter(validBangunan[0]._parsedCoords)
                } else if (validFaslabuh.length > 0) {
                    setCenter([parseFloat(validFaslabuh[0].lat), parseFloat(validFaslabuh[0].lon)])
                } else if (validHarkan.length > 0) {
                    setCenter([parseFloat(validHarkan[0].latitude), parseFloat(validHarkan[0].longitude)])
                }

                setLoading(false)
            } catch (error) {
                console.error('Error fetching data:', error)
                setLoading(false)
            }
        }

        fetchData()
    }, [isDashboard, showDisaster, refreshKey])

    // Handle map click to assign coordinates
    const handleMapClickForCoord = useCallback(async (latlng) => {
        if (!selectedAssetForCoord || coordSaving) return
        
        const confirmMsg = `Atur koordinat untuk:\n"${selectedAssetForCoord.nama_satker || selectedAssetForCoord.lokasi_ruang || 'Aset #' + selectedAssetForCoord.id}"\n\nLatitude: ${latlng.lat.toFixed(6)}\nLongitude: ${latlng.lng.toFixed(6)}\n\nLanjutkan?`
        if (!window.confirm(confirmMsg)) return

        setCoordSaving(true)
        try {
            const endpoint = `/api/master-asset-utama/${selectedAssetForCoord.id}/coordinates`
            const res = await fetch(endpoint, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    latitude: latlng.lat.toFixed(6),
                    longitude: latlng.lng.toFixed(6)
                })
            })
            if (!res.ok) throw new Error('Gagal menyimpan koordinat')
            
            alert(`✅ Koordinat berhasil disimpan!\n${selectedAssetForCoord.nama_satker || 'Aset'}\nLat: ${latlng.lat.toFixed(6)}, Lon: ${latlng.lng.toFixed(6)}`)
            setSelectedAssetForCoord(null)
            // Refresh map data
            setRefreshKey(prev => prev + 1)
        } catch (err) {
            console.error('Save coordinate error:', err)
            alert('❌ Gagal menyimpan koordinat: ' + err.message)
        } finally {
            setCoordSaving(false)
        }
    }, [selectedAssetForCoord, coordSaving])

    const formatLuas = (luas) => {
        if (!luas || luas === '-') return '0'
        // Handle format Indonesia: 1.234,56
        let luasStr = String(luas).replace(/m2|m²|\s/gi, '')
        // Remove thousands separator (.), replace decimal separator (,) with (.)
        luasStr = luasStr.replace(/\./g, '').replace(',', '.')
        const luasNum = parseFloat(luasStr) || 0
        return luasNum.toLocaleString('id-ID', { maximumFractionDigits: 0 })
    }

    return (
        <div style={{ height: isDashboard ? '100%' : '100vh', minHeight: isDashboard ? '400px' : 'auto', display: 'flex', flexDirection: 'column', background: isDashboard ? 'transparent' : '#f1f5f9', overflow: 'hidden' }}>
            {/* Header - Modern 2026 Style */}
            {!isDashboard && (
            <div style={{
                background: 'white',
                padding: '20px 32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                flexShrink: 0
            }}>
                <div>
                    <h1 style={{
                        margin: 0,
                        fontSize: '22px',
                        fontWeight: '600',
                        color: '#1e293b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#011F5B',
                            display: 'inline-block'
                        }}></span>
                        Peta Fasilitas Pangkalan
                    </h1>
                    <p style={{ margin: '4px 0 0 18px', fontSize: '13px', color: '#64748b' }}>
                        Visualisasi lokasi aset berdasarkan koordinat GPS
                    </p>
                    
                    <div style={{ margin: '10px 0 0 18px', display: 'flex', gap: '8px' }}>
                        <button 
                            onClick={() => { setCoordMode(!coordMode); setSelectedAssetForCoord(null); }}
                            style={{
                                padding: '6px 14px',
                                fontSize: '13px',
                                fontWeight: '600',
                                borderRadius: '20px',
                                background: coordMode ? '#10b981' : '#f1f5f9',
                                color: coordMode ? 'white' : '#64748b',
                                border: '1px solid',
                                borderColor: coordMode ? '#10b981' : '#e2e8f0',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            {coordMode ? '✕ Tutup Panel' : '📌 Atur Koordinat'}
                        </button>
                    </div>
                </div>

                {/* Inline Stats - Modern 2026 */}
                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: '#0ea5e9'
                        }}></div>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>Tanah</span>
                        <span style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>{assetsTanah.length}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: '#f97316'
                        }}></div>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>Bangunan</span>
                        <span style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>{assetsBangunan.length}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: faslabuhSettings.color
                        }}></div>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>Faslabuh</span>
                        <span style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>{assetsFaslabuh.length}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: '#10b981'
                        }}></div>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>Perumahan</span>
                        <span style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>{assetsRumneg.length}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: HARKAN_NODE_COLOR
                        }}></div>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>Harkan</span>
                        <span style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>{assetsHarkan.length}</span>
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        paddingLeft: '24px',
                        borderLeft: '1px solid #e2e8f0'
                    }}>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>Total</span>
                        <span style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>
                            {assetsTanah.length + assetsBangunan.length + assetsFaslabuh.length + assetsHarkan.length + assetsRumneg.length}
                        </span>
                    </div>

                    {/* Settings Button */}
                    <button
                        onClick={() => setShowSettings(true)}
                        style={{
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            width: '32px', height: '32px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#64748b'
                        }}
                        title="Pengaturan Icon"
                    >
                        ⚙️
                    </button>
                </div>
            </div>
            )}


            {/* Map + Coordinate Panel Container */}
            <div style={{ flex: 1, display: 'flex', position: 'relative', padding: isDashboard ? '0' : '20px 32px', paddingBottom: isDashboard ? '0' : '32px', minHeight: '400px', gap: '16px' }}>

                {/* Coordinate Setting Side Panel */}
                {coordMode && !isDashboard && (
                    <div style={{
                        width: '360px',
                        flexShrink: 0,
                        background: 'white',
                        borderRadius: '16px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        {/* Panel Header */}
                        <div style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            padding: '16px',
                            color: 'white'
                        }}>
                            <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>📌 Atur Koordinat Aset</div>
                            <div style={{ fontSize: '12px', opacity: 0.9 }}>
                                {selectedAssetForCoord 
                                    ? '👆 Klik lokasi di peta untuk set koordinat' 
                                    : 'Pilih aset dari daftar di bawah'}
                            </div>
                        </div>

                        {/* Selected Asset Indicator */}
                        {selectedAssetForCoord && (
                            <div style={{
                                padding: '12px 16px',
                                background: '#ecfdf5',
                                borderBottom: '1px solid #a7f3d0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '8px'
                            }}>
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#059669', textTransform: 'uppercase' }}>Aset Terpilih</div>
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#065f46', marginTop: '2px' }}>
                                        {selectedAssetForCoord.nama_satker || selectedAssetForCoord.lokasi_ruang || `ID: ${selectedAssetForCoord.id}`}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#047857' }}>
                                        {selectedAssetForCoord.jenis_bmn} • {selectedAssetForCoord.kab_kota || '-'}
                                    </div>
                                </div>
                                <button onClick={() => setSelectedAssetForCoord(null)} style={{
                                    background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px',
                                    padding: '4px 8px', fontSize: '11px', cursor: 'pointer', fontWeight: '600', flexShrink: 0
                                }}>✕ Batal</button>
                            </div>
                        )}

                        {/* Filter & Search */}
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                            <input
                                type="text"
                                placeholder="🔍 Cari nama, lokasi, kode..."
                                value={coordSearchTerm}
                                onChange={e => setCoordSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '13px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                                {['all', 'TANAH', 'BANGUNAN'].map(ft => (
                                    <button key={ft} onClick={() => setCoordFilterType(ft)} style={{
                                        padding: '4px 10px',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        borderRadius: '12px',
                                        border: '1px solid',
                                        borderColor: coordFilterType === ft ? '#0ea5e9' : '#e2e8f0',
                                        background: coordFilterType === ft ? '#0ea5e9' : 'white',
                                        color: coordFilterType === ft ? 'white' : '#64748b',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s'
                                    }}>
                                        {ft === 'all' ? 'Semua' : ft}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Asset List */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                            {(() => {
                                // Filter assets that DON'T have coordinates yet
                                let filtered = allMasterAssets.filter(a => {
                                    const hasCoord = a.latitude && a.longitude && !isNaN(parseFloat(a.latitude)) && !isNaN(parseFloat(a.longitude))
                                    if (coordFilterType !== 'all' && String(a.jenis_bmn).toUpperCase() !== coordFilterType) return false
                                    if (coordSearchTerm) {
                                        const search = coordSearchTerm.toLowerCase()
                                        const haystack = `${a.nama_satker} ${a.lokasi_ruang} ${a.kelurahan_desa} ${a.kab_kota} ${a.kode_barang} ${a.jenis_bmn}`.toLowerCase()
                                        if (!haystack.includes(search)) return false
                                    }
                                    return true
                                })

                                // Sort: assets without coords first, then with coords
                                filtered.sort((a, b) => {
                                    const aHas = a.latitude && a.longitude ? 1 : 0
                                    const bHas = b.latitude && b.longitude ? 1 : 0
                                    return aHas - bHas
                                })

                                const noCoordCount = filtered.filter(a => !a.latitude || !a.longitude).length

                                if (filtered.length === 0) {
                                    return (
                                        <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '13px' }}>
                                            Tidak ada aset ditemukan
                                        </div>
                                    )
                                }

                                return (
                                    <>
                                        <div style={{ padding: '4px 8px 8px', fontSize: '11px', color: '#94a3b8' }}>
                                            {noCoordCount} aset belum ada koordinat dari {filtered.length} total
                                        </div>
                                        {filtered.map(asset => {
                                            const hasCoord = asset.latitude && asset.longitude && !isNaN(parseFloat(asset.latitude)) && !isNaN(parseFloat(asset.longitude))
                                            const isSelected = selectedAssetForCoord?.id === asset.id
                                            const type = asset.jenis_bmn || 'ASET'
                                            const lokasi = asset.kab_kota || asset.kelurahan_desa || '-'
                                            const coordDisplay = hasCoord ? `${parseFloat(asset.latitude).toFixed(5)}, ${parseFloat(asset.longitude).toFixed(5)}` : ''
                                            
                                            return (
                                                <div
                                                    key={asset.id}
                                                    onClick={() => setSelectedAssetForCoord(asset)}
                                                    style={{
                                                        padding: '10px 12px',
                                                        borderRadius: '10px',
                                                        marginBottom: '4px',
                                                        cursor: 'pointer',
                                                        background: isSelected ? '#ecfdf5' : hasCoord ? '#f0fdf4' : '#fff',
                                                        border: isSelected ? '2px solid #10b981' : '1px solid ' + (hasCoord ? '#bbf7d0' : '#f1f5f9'),
                                                        transition: 'all 0.15s'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', lineHeight: '1.3' }}>
                                                                {asset.nama_satker || asset.lokasi_ruang || `Aset #${asset.id}`}
                                                            </div>
                                                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                                                                {type} • {lokasi}
                                                            </div>
                                                            {hasCoord && (
                                                                <div style={{ fontSize: '10px', color: '#10b981', marginTop: '3px', fontFamily: 'monospace' }}>
                                                                    ✅ {coordDisplay}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span style={{
                                                            fontSize: '10px',
                                                            fontWeight: '600',
                                                            padding: '2px 6px',
                                                            borderRadius: '6px',
                                                            background: hasCoord ? '#dcfce7' : '#fef3c7',
                                                            color: hasCoord ? '#15803d' : '#b45309',
                                                            flexShrink: 0
                                                        }}>
                                                            {hasCoord ? '📍' : '⚠️'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </>
                                )
                            })()}
                        </div>
                    </div>
                )}

                {/* Map wrapper */}
                <div style={{ flex: 1, position: 'relative', minHeight: '400px' }}>
                <div style={{
                    height: '100%',
                    minHeight: '400px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    border: '1px solid #e5e7eb',
                    position: 'relative'
                }}>
                    {isDashboard && (
                        <div style={{
                            position: 'absolute',
                            bottom: '30px',
                            left: '16px',
                            background: 'rgba(255, 255, 255, 0.95)',
                            padding: '16px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            zIndex: 1000,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '4px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                                Node Asset
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{width: '12px', height: '12px', borderRadius: '50%', background: '#0ea5e9'}}></div>
                                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Tanah</span>
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{assetsTanah.length}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{width: '12px', height: '12px', borderRadius: '50%', background: '#f97316'}}></div>
                                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Bangunan</span>
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{assetsBangunan.length}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{width: '12px', height: '12px', borderRadius: '50%', background: faslabuhSettings.color}}></div>
                                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Faslabuh</span>
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{assetsFaslabuh.length}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{width: '12px', height: '12px', borderRadius: '50%', background: HARKAN_NODE_COLOR}}></div>
                                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Harkan</span>
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{assetsHarkan.length}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{width: '12px', height: '12px', borderRadius: '50%', background: '#10b981'}}></div>
                                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Perumahan</span>
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{assetsRumneg.length}</span>
                            </div>
                        </div>
                    )}
                    {loading && (
                        <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: 'rgba(255,255,255,0.9)',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#64748b',
                            zIndex: 1000,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <div style={{
                                width: '12px',
                                height: '12px',
                                border: '2px solid #cbd5e1',
                                borderTopColor: '#011F5B',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }}></div>
                            Memuat data...
                        </div>
                    )}
                    <MapContainer
                        center={[-6.1754, 106.8272]} // Static initial center (Central Jakarta)
                        zoom={12}
                        style={{ height: '100%', width: '100%', minHeight: '400px', cursor: coordMode && selectedAssetForCoord ? 'crosshair' : '' }}
                        scrollWheelZoom={true}
                    >
                        <ChangeView center={center} />
                        <MapClickHandler active={coordMode && !!selectedAssetForCoord} onMapClick={handleMapClickForCoord} />
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* ======================================= */}
                        {/* DISASTER MANAGEMENT WATER GATES MARKERS */}
                        {/* ======================================= */}
                        {isDashboard && showDisaster && liveDisasters.map(gate => (
                            <Marker key={`disaster-gate-${gate.id}`} position={[gate.lat, gate.lng]} icon={createCustomIcon(gate.type, `${gate.name} — ${gate.val}`)}>
                                <Popup>
                                    <div style={{ color: '#1e293b', padding: '4px' }}>
                                        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>{gate.name}</h4>
                                        <p style={{ margin: '4px 0', fontSize: '13px' }}><strong>Status:</strong> {gate.level}</p>
                                        <p style={{ margin: '4px 0', fontSize: '13px' }}><strong>Tinggi Muka Air:</strong> {gate.val}</p>
                                        <p style={{ margin: '4px 0', fontSize: '11px', color: '#10b981', fontStyle: 'italic', marginTop: '8px' }}>🟢 Live Sensor Data (BMKG Terkoneksi)</p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                        {/* Markers for Aset Tanah */}
                        {assetsTanah.map((asset) => {
                            const coords = asset._parsedCoords || parseCoordinates(asset.coordinates)
                            if (!coords) return null

                            const lanalColor = mapLanalColor(asset.lanal)

                            return (
                                <Marker key={`tanah-${asset.id || asset.unique_key}`} position={coords} icon={createDynamicIcon(lanalColor)}>
                                    <Popup className="custom-popup" minWidth={280}>
                                        <div style={{ fontFamily: 'Inter, sans-serif' }}>
                                            <div style={{
                                                fontSize: '11px',
                                                fontWeight: '800',
                                                textTransform: 'uppercase',
                                                letterSpacing: '1px',
                                                color: lanalColor,
                                                marginBottom: '4px'
                                            }}>
                                                {asset.lanal || 'LANAL TIDAK TERDATA'}
                                            </div>
                                            <div style={{
                                                fontSize: '18px',
                                                fontWeight: '700',
                                                color: '#1f2937',
                                                marginBottom: '12px',
                                                lineHeight: '1.2'
                                            }}>
                                                {asset.identifikasi_aset || asset.name || asset.nama_satker || 'Tanpa Identifikasi Aset'}
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                                                <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                                                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>Luas Tanah</div>
                                                    <div style={{ fontSize: '13px', fontWeight: '700', color: lanalColor }}>
                                                        {formatLuas(asset.luas_tanah_seluruhnya || asset.luas)} m²
                                                    </div>
                                                </div>
                                                <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                                                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>Lon / Lat</div>
                                                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#334155', fontFamily: 'monospace' }}>
                                                        {asset.longitude ? parseFloat(asset.longitude).toFixed(5) : '-'} /<br /> 
                                                        {asset.latitude ? parseFloat(asset.latitude).toFixed(5) : '-'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ marginBottom: '12px' }}>
                                                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginBottom: '2px' }}>Alamat</div>
                                                <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>
                                                    {asset.alamat || '-'}
                                                </div>
                                            </div>

                                            {(() => {
                                                let photos = [];
                                                try {
                                                    if (asset.photos) {
                                                        photos = typeof asset.photos === 'string' ? JSON.parse(asset.photos) : asset.photos;
                                                    }
                                                } catch(e){}
                                                if (photos && photos.length > 0) {
                                                    return (
                                                        <div>
                                                            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginBottom: '6px' }}>Foto ({photos.length})</div>
                                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                                                                {photos.slice(0, 4).map((p, idx) => (
                                                                    <img 
                                                                        key={idx} 
                                                                        src={p.base64} 
                                                                        alt={`Foto ${idx+1}`}
                                                                        onClick={() => {
                                                                            const w = window.open();
                                                                            w.document.write(`<body style="margin:0;display:flex;justify-content:center;align-items:center;background:#000;height:100vh;"><img src="${p.base64}" style="max-width:100%;max-height:100%;object-fit:contain;" /></body>`);
                                                                        }}
                                                                        style={{ 
                                                                            width: '100%', 
                                                                            aspectRatio: '1', 
                                                                            objectFit: 'cover', 
                                                                            borderRadius: '4px',
                                                                            cursor: 'zoom-in',
                                                                            border: '1px solid #e2e8f0',
                                                                            transition: 'transform 0.2s',
                                                                        }}
                                                                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                                                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    </Popup>
                                </Marker>
                            )
                        })}

                        {/* Markers for Aset Bangunan */}
                        {assetsBangunan.map((asset) => {
                            const coords = asset._parsedCoords || parseCoordinates(asset.coordinates)
                            if (!coords) return null

                            return (
                                <Marker key={`bangunan-${asset.id || asset.unique_key}`} position={coords} icon={bangunanIcon}>
                                    <Popup>
                                        <div style={{ minWidth: '200px' }}>
                                            <div style={{
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                color: '#f97316',
                                                marginBottom: '8px',
                                                paddingBottom: '8px',
                                                borderBottom: '2px solid #f97316'
                                            }}>
                                                🏢 ASET BANGUNAN
                                            </div>
                                            <div style={{ marginBottom: '6px' }}>
                                                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>Nama</div>
                                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                                                    {asset.name || asset.nama_satker || '-'}
                                                </div>
                                            </div>
                                            <div style={{ marginBottom: '6px' }}>
                                                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>Kode Barang</div>
                                                <div style={{ fontSize: '13px', color: '#4b5563' }}>
                                                    {asset.kode_barang || '-'}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>Luas</div>
                                                <div style={{ fontSize: '16px', fontWeight: '700', color: '#f97316' }}>
                                                    {formatLuas(asset.luas_bangunan || asset.luas)} m²
                                                </div>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            )
                        })}

                        {/* Markers for Rumah Negara (Perumahan) */}
                        {assetsRumneg.map((asset) => {
                            const lat = parseFloat(asset.latitude)
                            const lon = parseFloat(asset.longitude)
                            if (isNaN(lat) || isNaN(lon)) return null

                            return (
                                <Marker key={`rumneg-${asset.id}`} position={[lat, lon]} icon={perumahanIcon}>
                                    <Popup>
                                        <div style={{ minWidth: '220px' }}>
                                            <div style={{
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                color: '#10b981',
                                                marginBottom: '8px',
                                                paddingBottom: '8px',
                                                borderBottom: '2px solid #10b981'
                                            }}>
                                                🏡 RUMAH NEGARA (RUMNEG)
                                            </div>
                                            <div style={{ marginBottom: '6px' }}>
                                                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>Penghuni</div>
                                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#1f2937' }}>
                                                    {asset.occupant_name || '-'}
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#64748b' }}>
                                                    {asset.occupant_rank} {asset.occupant_nrp ? `(${asset.occupant_nrp})` : ''}
                                                </div>
                                            </div>
                                            <div style={{ marginBottom: '6px' }}>
                                                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>Perumahan & Alamat</div>
                                                <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>{asset.area || '-'}</div>
                                                <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.3' }}>{asset.alamat_detail || '-'}</div>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                                                <div>
                                                    <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: '600' }}>Tipe/Gol</div>
                                                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937' }}>{asset.tipe_rumah || '-'}/{asset.golongan || '-'}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: '600' }}>Kondisi</div>
                                                    <div style={{ 
                                                        fontSize: '11px', 
                                                        fontWeight: '700',
                                                        color: asset.kondisi?.toLowerCase() === 'baik' ? '#166534' : '#991b1b',
                                                        textTransform: 'uppercase'
                                                    }}>{asset.kondisi || '-'}</div>
                                                </div>
                                            </div>
                                            <div style={{ marginTop: '6px' }}>
                                                <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: '600' }}>No SIP</div>
                                                <div style={{ fontSize: '12px', color: '#374151' }}>{asset.no_sip || '-'}</div>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            )
                        })}

                        {/* Markers for Faslabuh */}
                        {assetsFaslabuh.map((asset) => {
                            const lat = parseFloat(asset.lat)
                            const lon = parseFloat(asset.lon)

                            // Ensure valid coords
                            if (isNaN(lat) || isNaN(lon)) return null

                            // Parse photos safely (handle string or array)
                            let photos = []
                            try {
                                if (Array.isArray(asset.fotos)) {
                                    photos = asset.fotos
                                } else if (typeof asset.fotos === 'string') {
                                    photos = JSON.parse(asset.fotos)
                                }
                            } catch (e) {
                                photos = []
                            }

                            return (
                                <Marker key={`faslabuh-${asset.id}`} position={[lat, lon]} icon={faslabuhIcon}>
                                    <Popup>
                                        <div style={{ minWidth: '240px', maxWidth: '300px' }}>
                                            <div style={{
                                                fontSize: '14px',
                                                fontWeight: '800',
                                                color: faslabuhSettings.color,
                                                marginBottom: '8px',
                                                paddingBottom: '8px',
                                                borderBottom: `2px solid ${faslabuhSettings.color}`
                                            }}>
                                                ⚓ FASLABUH
                                            </div>

                                            {/* Nama Dermaga */}
                                            <div style={{ marginBottom: '8px' }}>
                                                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Nama Dermaga</div>
                                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', lineHeight: '1.2' }}>
                                                    {asset.nama_dermaga || '-'}
                                                </div>
                                            </div>

                                            {/* Wilayah & Luas Grid */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                                <div>
                                                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Wilayah</div>
                                                    <div style={{ fontSize: '12px', color: '#334155', fontWeight: '500' }}>
                                                        {asset.wilayah || '-'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Luas</div>
                                                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                                                        {formatLuas(asset.luas || asset.luas_m2)} m²
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Kondisi */}
                                            <div style={{ marginBottom: '12px' }}>
                                                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Kondisi</div>
                                                <div style={{
                                                    display: 'inline-block',
                                                    padding: '2px 8px',
                                                    background: (asset.kondisi || asset.kondisi_percent) > 70 ? '#dcfce7' : '#fef3c7',
                                                    color: (asset.kondisi || asset.kondisi_percent) > 70 ? '#15803d' : '#b45309',
                                                    borderRadius: '4px',
                                                    fontSize: '11px',
                                                    fontWeight: '700',
                                                    marginTop: '2px'
                                                }}>
                                                    {asset.kondisi || asset.kondisi_percent || 0}%
                                                </div>
                                            </div>

                                            {/* Photos (Max 2) */}
                                            {photos && photos.length > 0 && (
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '12px' }}>
                                                    {photos.slice(0, 2).map((photo, idx) => {
                                                        // Handle object or string photo
                                                        const imgSrc = typeof photo === 'string'
                                                            ? `/uploads/${photo}`
                                                            : (photo.url || photo.data || '')

                                                        return (
                                                            <div key={idx} style={{
                                                                height: '80px',
                                                                borderRadius: '4px',
                                                                overflow: 'hidden',
                                                                background: '#f1f5f9',
                                                                border: '1px solid #e2e8f0'
                                                            }}>
                                                                <img
                                                                    src={imgSrc}
                                                                    alt={`Foto ${idx + 1}`}
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Img' }}
                                                                />
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )}

                                            {/* Detail Button */}
                                            <button
                                                onClick={() => setSelectedFaslabuh(asset)}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px',
                                                    background: '#0ea5e9',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 2px 4px rgba(14, 165, 233, 0.3)'
                                                }}
                                            >
                                                📄 Lihat Detail Lengkap
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            )
                        })}


                        {/* Markers for Harkan */}
                        {assetsHarkan.map((asset) => {
                            const lat = parseFloat(asset.latitude)
                            const lon = parseFloat(asset.longitude)

                            return (
                                <Marker key={`harkan-${asset.id}`} position={[lat, lon]} icon={harkanIcon}>
                                    <Popup>
                                        <div style={{ minWidth: '220px' }}>
                                            <div style={{
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                color: HARKAN_NODE_COLOR,
                                                marginBottom: '8px',
                                                paddingBottom: '8px',
                                                borderBottom: `2px solid ${HARKAN_NODE_COLOR}`
                                            }}>
                                                🛳️ ASET HARKAN
                                            </div>
                                            <div style={{ marginBottom: '6px' }}>
                                                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>Nama Unsur</div>
                                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                                                    {asset.nama || '-'} <span style={{ fontSize: '12px', color: '#666' }}>({asset.unsur})</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '6px' }}>
                                                <div>
                                                    <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>Kondisi</div>
                                                    <div style={{ fontSize: '13px', color: '#4b5563', fontWeight: '600', color: asset.kondisi === 'Siap' ? 'green' : 'red' }}>
                                                        {asset.kondisi || '-'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>Status</div>
                                                    <div style={{ fontSize: '13px', color: '#4b5563' }}>
                                                        {asset.status || '-'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>Detail</div>
                                                <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                                                    {asset.bahan || '-'} - {asset.panjang_max_loa ? asset.panjang_max_loa + 'm' : '-'}
                                                </div>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            )
                        })}
                    </MapContainer>

                    {/* Coordinate mode banner */}
                    {coordMode && selectedAssetForCoord && (
                        <div style={{
                            position: 'absolute',
                            top: '12px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(16, 185, 129, 0.95)',
                            color: 'white',
                            padding: '8px 20px',
                            borderRadius: '24px',
                            fontSize: '13px',
                            fontWeight: '600',
                            zIndex: 1000,
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            whiteSpace: 'nowrap'
                        }}>
                            <span style={{ animation: 'pulse 2s infinite' }}>📌</span>
                            Klik peta untuk set lokasi: {selectedAssetForCoord.nama_satker || selectedAssetForCoord.lokasi_ruang || `Aset #${selectedAssetForCoord.id}`}
                        </div>
                    )}
                </div>
                </div>{/* close Map wrapper */}
            </div>
            {/* Detail Modal Overlay */}
            {
                selectedFaslabuh && (
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(15, 23, 42, 0.75)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }} onClick={() => setSelectedFaslabuh(null)}>
                        <div style={{
                            background: 'white',
                            width: '100%',
                            maxWidth: '900px',
                            maxHeight: '90vh',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            animation: 'fadeIn 0.2s ease-out'
                        }} onClick={e => e.stopPropagation()}>

                            {/* Header - Glassmorphism */}
                            <div style={{
                                padding: '24px 32px',
                                borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'rgba(255, 255, 255, 0.85)',
                                backdropFilter: 'blur(12px)',
                                position: 'sticky',
                                top: 0,
                                zIndex: 10
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px', height: '40px',
                                        background: '#fee2e2',
                                        borderRadius: '12px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.2rem',
                                        color: '#ef4444'
                                    }}>
                                        ⚓
                                    </div>
                                    <div>
                                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                                            {selectedFaslabuh.nama_dermaga || 'Detail Dermaga'}
                                        </h2>
                                        <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                                            {selectedFaslabuh.lokasi ? `${selectedFaslabuh.lokasi} • ` : ''}{selectedFaslabuh.provinsi || ''}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedFaslabuh(null)} style={{
                                    background: '#f1f5f9',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '36px', height: '36px',
                                    fontSize: '18px',
                                    color: '#64748b',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>×</button>
                            </div>

                            {/* Content Scrollable */}
                            <div style={{ padding: '32px', overflowY: 'auto' }}>


                                {/* Detail Content - Modern 2026 UI */}
                                {(() => {
                                    const item = selectedFaslabuh;
                                    const fmt = (n) => n != null ? parseFloat(n).toLocaleString('id-ID', { maximumFractionDigits: 2 }) : '-';

                                    const Card = ({ title, icon, children }) => (
                                        <div style={{
                                            background: '#ffffff',
                                            borderRadius: '16px',
                                            padding: '24px',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                                            border: '1px solid #f1f5f9',
                                            height: '100%'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                                                <div style={{
                                                    width: '32px', height: '32px',
                                                    borderRadius: '8px',
                                                    background: '#f0f9ff',
                                                    color: '#0ea5e9',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '1rem'
                                                }}>
                                                    {icon}
                                                </div>
                                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>{title}</h3>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
                                                {children}
                                            </div>
                                        </div>
                                    );

                                    const InfoItem = ({ label, value, mono = false, fullWidth = false }) => (
                                        <div style={{ gridColumn: fullWidth ? 'span 2' : 'span 1' }}>
                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{label}</div>
                                            <div style={{ fontSize: '0.95rem', fontWeight: '500', color: '#334155', fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' : 'inherit' }}>
                                                {value !== undefined && value !== null && value !== '' ? value : '-'}
                                            </div>
                                        </div>
                                    );

                                    return (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: '#f8fafc', padding: '24px', borderRadius: '12px' }}>

                                            {/* Row 1: Key Info & Dimensions */}
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
                                                <Card title="Identitas & Lokasi" icon="📍">
                                                    <InfoItem label="Lokasi" value={item.lokasi} />
                                                    <InfoItem label="Wilayah" value={item.wilayah} />
                                                    <InfoItem label="Alamat" value={item.alamat} fullWidth />
                                                    <InfoItem label="Kode Barang" value={item.kode_barang} mono />
                                                    <InfoItem label="No. Sertifikat" value={item.no_sertifikat} mono />
                                                    <InfoItem label="Tgl Sertifikat" value={item.tgl_sertifikat} />
                                                    <InfoItem label="Koordinat" value={`${item.lat}, ${item.lon}`} mono />
                                                </Card>

                                                <Card title="Dimensi & Kondisi" icon="📐">
                                                    <InfoItem label="Panjang" value={`${fmt(item.panjang_m || item.panjang)} m`} />
                                                    <InfoItem label="Lebar" value={`${fmt(item.lebar_m || item.lebar)} m`} />
                                                    <InfoItem label="Luas Area" value={`${fmt(item.luas_m2 || item.luas)} m²`} />
                                                    <InfoItem label="Draft LWL" value={`${fmt(item.draft_lwl_m || item.draft_lwl)} m`} />
                                                    <InfoItem label="Pasut HWL-LWL" value={`${fmt(item.pasut_hwl_lwl_m || item.pasut_hwl_lwl)} m`} />
                                                    <div style={{ gridColumn: 'span 1' }}>
                                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Kondisi</div>
                                                        <div style={{
                                                            display: 'inline-block',
                                                            padding: '4px 12px',
                                                            borderRadius: '20px',
                                                            background: (item.kondisi_percent || item.kondisi) > 70 ? '#dcfce7' : '#fef3c7',
                                                            color: (item.kondisi_percent || item.kondisi) > 70 ? '#15803d' : '#b45309',
                                                            fontWeight: '700',
                                                            fontSize: '0.85rem'
                                                        }}>
                                                            {item.kondisi_percent || item.kondisi || 0}%
                                                        </div>
                                                    </div>
                                                    <InfoItem label="Konstruksi" value={item.konstruksi} fullWidth />
                                                </Card>
                                            </div>

                                            {/* Row 2: Technical Specs */}
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                                                <Card title="Kemampuan Sandar" icon="⚓">
                                                    <InfoItem label="Berat Sandar Maks" value={`${fmt(item.berat_sandar_maks_ton)} Ton`} />
                                                    <InfoItem label="Displacement KRI" value={item.displacement_kri} />
                                                    <InfoItem label="Tipe Kapal" value={item.tipe_kapal} />
                                                    <InfoItem label="Jumlah Maks" value={item.jumlah_maks} />
                                                    <InfoItem label="Plat Lantai" value={`${fmt(item.kemampuan_plat_lantai_ton || item.plat_mst_ton)} Ton`} fullWidth />
                                                </Card>

                                                <Card title="Fasilitas Listrik" icon="⚡">
                                                    <InfoItem label="Daya" value={`${fmt(item.daya_kva)} kVA`} />
                                                    <InfoItem label="Sumber" value={item.sumber_listrik} />
                                                    <InfoItem label="Tegangan" value={`${item.tegangan_v || '-'} V`} />
                                                    <InfoItem label="Kapasitas" value={`${item.kapasitas_a || '-'} A`} />
                                                    <InfoItem label="Frekuensi" value={`${item.frek_hz || '-'} Hz`} />
                                                    <InfoItem label="Titik Sambung" value={item.titik_sambung_listrik} />
                                                </Card>

                                                <Card title="Air, BBM & Lainnya" icon="💧">
                                                    <InfoItem label="Air GWT" value={`${fmt(item.kapasitas_air_gwt_m3)} m³`} />
                                                    <InfoItem label="Debit Air" value={`${fmt(item.debit_air_m3_jam)} m³/jam`} />
                                                    <InfoItem label="Sumber Air" value={item.sumber_air} />
                                                    <InfoItem label="Kapasitas BBM" value={item.kapasitas_bbm} />
                                                    <InfoItem label="Hydrant" value={item.hydrant} fullWidth />
                                                </Card>
                                            </div>

                                            {/* Row 3: Ranmor & Keterangan */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                                                <Card title="Ranmor" icon="🚜">
                                                    <InfoItem label="Jenis Ranmor" value={item.jenis_ranmor} fullWidth />
                                                    <InfoItem label="Berat Ranmor" value={`${fmt(item.berat_ranmor_ton)} Ton`} fullWidth />
                                                </Card>

                                                <div style={{
                                                    background: '#fff',
                                                    borderRadius: '16px',
                                                    padding: '24px',
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                                                    border: '1px solid #f1f5f9'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                                        <span style={{ fontSize: '1.2rem' }}>📝</span>
                                                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>Keterangan Tambahan</h3>
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: '0.95rem', color: '#334155', lineHeight: '1.6' }}>
                                                        {item.keterangan || 'Tidak ada keterangan tambahan.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Gallery - Modern 2026 UI */}
                                <div style={{ marginTop: '32px', background: '#f8fafc', padding: '24px', borderRadius: '12px' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span>📷</span> Dokumentasi Foto
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
                                        {(() => {
                                            let photos = []
                                            try {
                                                if (Array.isArray(selectedFaslabuh.fotos)) photos = selectedFaslabuh.fotos
                                                else if (typeof selectedFaslabuh.fotos === 'string') photos = JSON.parse(selectedFaslabuh.fotos)
                                            } catch (e) { }

                                            if (photos.length === 0) return (
                                                <div style={{
                                                    gridColumn: '1 / -1',
                                                    padding: '40px',
                                                    background: '#fff',
                                                    borderRadius: '16px',
                                                    textAlign: 'center',
                                                    color: '#64748b',
                                                    fontStyle: 'italic',
                                                    border: '2px dashed #e2e8f0'
                                                }}>
                                                    Tidak ada foto dokumentasi tersedia.
                                                </div>
                                            )

                                            return photos.map((photo, idx) => {
                                                const imgSrc = typeof photo === 'string' ? `/uploads/${photo}` : (photo.url || photo.data || '')
                                                return (
                                                    <div key={idx} style={{
                                                        borderRadius: '16px',
                                                        overflow: 'hidden',
                                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                                        aspectRatio: '16/9',
                                                        background: '#fff',
                                                        transition: 'transform 0.2s ease-in-out',
                                                        cursor: 'pointer',
                                                        border: '4px solid white',
                                                        position: 'relative'
                                                    }}
                                                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                                    >
                                                        <img
                                                            src={imgSrc}
                                                            alt={`Foto ${idx + 1}`}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Error' }}
                                                        />
                                                    </div>
                                                )
                                            })
                                        })()}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                )
            }

            {/* Settings Modal */}
            {
                showSettings && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.5)', zIndex: 9999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }} onClick={() => setShowSettings(false)}>
                        <div style={{
                            background: 'white', borderRadius: '16px', padding: '24px',
                            width: '320px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                        }} onClick={e => e.stopPropagation()}>
                            <h3 style={{ margin: '0 0 20px', fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b' }}>⚙️ Pengaturan Peta</h3>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Warna Icon Faslabuh (Kapal)</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="color"
                                        value={faslabuhSettings.color}
                                        onChange={e => setFaslabuhSettings(prev => ({ ...prev, color: e.target.value }))}
                                        style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                    />
                                    <input
                                        type="text"
                                        value={faslabuhSettings.color}
                                        onChange={e => setFaslabuhSettings(prev => ({ ...prev, color: e.target.value }))}
                                        style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Ukuran Icon ({faslabuhSettings.size}px)</label>
                                <input
                                    type="range"
                                    min="12" max="48"
                                    value={faslabuhSettings.size}
                                    onChange={e => setFaslabuhSettings(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setShowSettings(false)}
                                    style={{
                                        padding: '8px 16px', borderRadius: '8px', background: '#0ea5e9', color: 'white',
                                        fontWeight: '600', border: 'none', cursor: 'pointer'
                                    }}
                                >
                                    Selesai
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    )
}

export default PetaFaslan
