import { useState, useEffect } from 'prop-types';
import PropTypes from 'prop-types';

/**
 * AssetSelector Component
 * Reusable component untuk memilih Master Asset BMN
 * Digunakan di semua modul untuk link asset ke modul tertentu
 */
function AssetSelector({
    onSelect,
    selectedAsset = null,
    filter = {},
    placeholder = "Pilih Asset BMN...",
    disabled = false
}) {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        fetchAssets();
    }, [filter]);

    const fetchAssets = async () => {
        setLoading(true);
        try {
            // Build query params from filter
            const params = new URLSearchParams(filter);
            const response = await fetch(`http://localhost:3001/api/assets/tanah?${params}`);
            const data = await response.json();
            setAssets(data);
        } catch (error) {
            console.error('Error fetching assets:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAssets = assets.filter(asset => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            asset.code?.toLowerCase().includes(search) ||
            asset.name?.toLowerCase().includes(search) ||
            asset.nup?.toLowerCase().includes(search) ||
            asset.category?.toLowerCase().includes(search)
        );
    });

    const handleSelect = (asset) => {
        onSelect(asset);
        setShowDropdown(false);
        setSearchTerm('');
    };

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            {/* Selected Asset Display or Search Input */}
            {selectedAsset ? (
                <div style={{
                    padding: '12px',
                    border: '2px solid #003366',
                    borderRadius: '8px',
                    background: '#f0f9ff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <div style={{ fontWeight: '600', color: '#003366', marginBottom: '4px' }}>
                            {selectedAsset.code} - {selectedAsset.name}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                            {selectedAsset.category} • NUP: {selectedAsset.nup}
                        </div>
                    </div>
                    {!disabled && (
                        <button
                            onClick={() => onSelect(null)}
                            style={{
                                padding: '6px 12px',
                                background: '#dc2626',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                            }}
                        >
                            ✕ Hapus
                        </button>
                    )}
                </div>
            ) : (
                <div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        placeholder={placeholder}
                        disabled={disabled}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#003366';
                            setShowDropdown(true);
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#cbd5e1';
                            // Delay to allow click on dropdown
                            setTimeout(() => setShowDropdown(false), 200);
                        }}
                    />

                    {/* Dropdown List */}
                    {showDropdown && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '4px',
                            maxHeight: '300px',
                            overflowY: 'auto',
                            background: 'white',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            zIndex: 1000
                        }}>
                            {loading ? (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                                    Loading assets...
                                </div>
                            ) : filteredAssets.length === 0 ? (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                                    {searchTerm ? 'Tidak ada asset yang sesuai' : 'Tidak ada asset tersedia'}
                                </div>
                            ) : (
                                filteredAssets.map((asset) => (
                                    <div
                                        key={asset.id}
                                        onClick={() => handleSelect(asset)}
                                        style={{
                                            padding: '12px',
                                            borderBottom: '1px solid #e2e8f0',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                                        onMouseLeave={(e) => e.target.style.background = 'white'}
                                    >
                                        <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                                            {asset.code} - {asset.name}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                            {asset.category} • NUP: {asset.nup || 'N/A'}
                                            {asset.location && ` • ${asset.location}`}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Helper Text */}
            {!selectedAsset && (
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>
                    💡 Ketik kode asset, nama, atau NUP untuk mencari
                </div>
            )}
        </div>
    );
}

AssetSelector.propTypes = {
    onSelect: PropTypes.func.isRequired,
    selectedAsset: PropTypes.object,
    filter: PropTypes.object,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool
};

export default AssetSelector;
