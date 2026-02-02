import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
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

// Custom dot icons for different asset types - small circles
const tanahIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14">
            <circle cx="7" cy="7" r="6" fill="#0ea5e9" stroke="#fff" stroke-width="2"/>
        </svg>
    `),
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10]
})

const bangunanIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14">
            <circle cx="7" cy="7" r="6" fill="#f97316" stroke="#fff" stroke-width="2"/>
        </svg>
    `),
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10]
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

function PetaFaslan() {
    const [assetsTanah, setAssetsTanah] = useState([])
    const [assetsBangunan, setAssetsBangunan] = useState([])
    const [loading, setLoading] = useState(true)
    const [center, setCenter] = useState([-6.1754, 106.8272]) // Default: Jakarta (Monas)

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
        if (!coordString || coordString === '-' || coordString.trim() === '') {
            return null
        }

        const str = coordString.toString().trim()

        // Try DMS format with various symbols
        // Format: "6 ᵒ 12 ′ 39.28 ₺ S 106 ᵒ 46 ′ 44.87 ₺ E"
        const dmsPattern = /(\d+)\s*[°ᵒo]\s*(\d+)\s*[′'´]\s*([\d.]+)\s*[″"₺]?\s*([NS])\s*(\d+)\s*[°ᵒo]\s*(\d+)\s*[′'´]\s*([\d.]+)\s*[″"₺]?\s*([EW])/i
        const dmsMatch = str.match(dmsPattern)

        if (dmsMatch) {
            const lat = dmsToDecimal(dmsMatch[1], dmsMatch[2], dmsMatch[3], dmsMatch[4].toUpperCase())
            const lon = dmsToDecimal(dmsMatch[5], dmsMatch[6], dmsMatch[7], dmsMatch[8].toUpperCase())
            return [lat, lon]
        }

        // Try simple DMS without seconds: "6°12'S 106°46'E"
        const simpleDmsPattern = /(\d+)\s*[°ᵒo]\s*(\d+)\s*[′'´]?\s*([NS])\s*(\d+)\s*[°ᵒo]\s*(\d+)\s*[′'´]?\s*([EW])/i
        const simpleDmsMatch = str.match(simpleDmsPattern)

        if (simpleDmsMatch) {
            const lat = dmsToDecimal(simpleDmsMatch[1], simpleDmsMatch[2], 0, simpleDmsMatch[3].toUpperCase())
            const lon = dmsToDecimal(simpleDmsMatch[4], simpleDmsMatch[5], 0, simpleDmsMatch[6].toUpperCase())
            return [lat, lon]
        }

        // Decimal format: "-6.2088, 106.8456" or "106.8456, -6.2088"
        const parts = str.split(',').map(s => s.trim()).filter(s => s)

        if (parts.length >= 2) {
            const num1 = parseFloat(parts[0])
            const num2 = parseFloat(parts[1])

            if (!isNaN(num1) && !isNaN(num2)) {
                let lat, lon
                // Determine which is lat and lon based on value
                if (Math.abs(num1) >= 100) {
                    lat = num2
                    lon = num1
                } else if (Math.abs(num2) >= 100) {
                    lat = num1
                    lon = num2
                } else {
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

                // Fetch aset tanah
                const endpointTanah = '/api/assets/tanah'
                const finalEndpointTanah = import.meta.env.PROD ? endpointTanah : `http://localhost:3001${endpointTanah}`
                const resTanah = await fetch(finalEndpointTanah)
                const dataTanah = await resTanah.json()

                // Fetch aset bangunan
                const endpointBangunan = '/api/assets/bangunan'
                const finalEndpointBangunan = import.meta.env.PROD ? endpointBangunan : `http://localhost:3001${endpointBangunan}`
                const resBangunan = await fetch(finalEndpointBangunan)
                const dataBangunan = await resBangunan.json()

                // Filter assets with valid coordinates
                const validTanah = dataTanah.filter(asset => {
                    const coords = parseCoordinates(asset.coordinates)
                    return coords !== null
                })

                const validBangunan = dataBangunan.filter(asset => {
                    const coords = parseCoordinates(asset.coordinates)
                    return coords !== null
                })

                setAssetsTanah(validTanah)
                setAssetsBangunan(validBangunan)

                // Set center to first valid coordinate
                if (validTanah.length > 0) {
                    const firstCoords = parseCoordinates(validTanah[0].coordinates)
                    if (firstCoords) {
                        setCenter(firstCoords)
                    }
                } else if (validBangunan.length > 0) {
                    const firstCoords = parseCoordinates(validBangunan[0].coordinates)
                    if (firstCoords) {
                        setCenter(firstCoords)
                    }
                }

                setLoading(false)
            } catch (error) {
                console.error('Error fetching data:', error)
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const formatLuas = (luas) => {
        if (!luas || luas === '-') return '0'
        const luasStr = String(luas).replace(/[^0-9.]/g, '')
        const luasNum = parseFloat(luasStr) || 0
        return luasNum.toLocaleString('id-ID', { maximumFractionDigits: 0 })
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f1f5f9', overflow: 'hidden' }}>
            {/* Header - Modern 2026 Style */}
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
                </div>

                {/* Inline Stats - Modern 2026 */}
                <div style={{ display: 'flex', gap: '24px' }}>
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
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        paddingLeft: '24px',
                        borderLeft: '1px solid #e2e8f0'
                    }}>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>Total</span>
                        <span style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>
                            {assetsTanah.length + assetsBangunan.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div style={{ flex: 1, position: 'relative', padding: '20px 32px', paddingBottom: '32px', minHeight: '400px' }}>
                <div style={{
                    height: '100%',
                    minHeight: '400px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    border: '1px solid #e5e7eb',
                    position: 'relative'
                }}>
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
                        style={{ height: '100%', width: '100%', minHeight: '400px' }}
                        scrollWheelZoom={true}
                    >
                        <ChangeView center={center} />
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* Markers for Aset Tanah */}
                        {assetsTanah.map((asset) => {
                            const coords = parseCoordinates(asset.coordinates)
                            if (!coords) return null

                            return (
                                <Marker key={`tanah-${asset.id}`} position={coords} icon={tanahIcon}>
                                    <Popup>
                                        <div style={{ minWidth: '200px' }}>
                                            <div style={{
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                color: '#0ea5e9',
                                                marginBottom: '8px',
                                                paddingBottom: '8px',
                                                borderBottom: '2px solid #0ea5e9'
                                            }}>
                                                📍 ASET TANAH
                                            </div>
                                            <div style={{ marginBottom: '6px' }}>
                                                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>Nama</div>
                                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                                                    {asset.name || '-'}
                                                </div>
                                            </div>
                                            <div style={{ marginBottom: '6px' }}>
                                                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>Jenis</div>
                                                <div style={{ fontSize: '13px', color: '#4b5563' }}>
                                                    {asset.category || '-'}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>Luas</div>
                                                <div style={{ fontSize: '16px', fontWeight: '700', color: '#0ea5e9' }}>
                                                    {formatLuas(asset.luas)} m²
                                                </div>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            )
                        })}

                        {/* Markers for Aset Bangunan */}
                        {assetsBangunan.map((asset) => {
                            const coords = parseCoordinates(asset.coordinates)
                            if (!coords) return null

                            return (
                                <Marker key={`bangunan-${asset.id}`} position={coords} icon={bangunanIcon}>
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
                                                    {asset.name || '-'}
                                                </div>
                                            </div>
                                            <div style={{ marginBottom: '6px' }}>
                                                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>Jenis</div>
                                                <div style={{ fontSize: '13px', color: '#4b5563' }}>
                                                    {asset.category || '-'}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>Luas</div>
                                                <div style={{ fontSize: '16px', fontWeight: '700', color: '#f97316' }}>
                                                    {formatLuas(asset.luas)} m²
                                                </div>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            )
                        })}
                    </MapContainer>
                </div>
            </div>
        </div>
    )
}

export default PetaFaslan
