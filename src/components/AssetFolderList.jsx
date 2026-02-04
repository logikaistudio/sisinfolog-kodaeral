import PropTypes from 'prop-types';
import { useState } from 'react';

function AssetFolderList({ folders, onCreate, onEdit, onDelete, onSelect }) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingFolder, setEditingFolder] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingFolder) {
            onEdit(editingFolder.id, formData);
        } else {
            onCreate(formData);
        }
        resetForm();
    };

    const resetForm = () => {
        setFormData({ name: '', description: '' });
        setIsCreating(false);
        setEditingFolder(null);
    };

    const handleStartEdit = (e, folder) => {
        e.stopPropagation();
        setEditingFolder(folder);
        setFormData({ name: folder.name, description: folder.description || '' });
        setIsCreating(true);
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        if (confirm('Yakin ingin menghapus folder ini? Data aset di dalamnya tidak akan terhapus, tetapi akan menjadi tanpa folder.')) {
            onDelete(id);
        }
    };

    return (
        <div className="fade-in">
            <div className="flex justify-between items-center mb-xl">
                <div>
                    <h2 className="page-title">Folder Aset</h2>
                    <p className="page-subtitle">Kelompokkan aset berdasarkan folder untuk manajemen yang lebih rapi</p>
                </div>
                <button
                    className="btn btn-primary btn-lg"
                    style={{ borderRadius: '50px', paddingLeft: '24px', paddingRight: '24px' }}
                    onClick={() => setIsCreating(true)}
                >
                    <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>+</span> Tambah Folder
                </button>
            </div>

            {/* Folder Grid */}
            <div className="grid-folders">
                {folders.map(folder => (
                    <div
                        key={folder.id}
                        className="folder-card"
                        onClick={() => onSelect(folder)}
                    >
                        {/* Header Icons */}
                        <div className="flex justify-between items-start">
                            <div className="folder-icon">
                                📁
                            </div>
                            <div className="flex gap-sm">
                                <button
                                    className="action-icon-btn"
                                    title="Edit Folder"
                                    onClick={(e) => handleStartEdit(e, folder)}
                                >
                                    ✏️
                                </button>
                                <button
                                    className="action-icon-btn"
                                    title="Hapus Folder"
                                    style={{ color: 'var(--error)' }}
                                    onClick={(e) => handleDelete(e, folder.id)}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div>
                            <h3 className="folder-title">{folder.name}</h3>
                            <p className="folder-desc">
                                {folder.description || 'Tidak ada deskripsi'}
                            </p>
                        </div>

                        {/* Footer Stats */}
                        <div className="folder-stats">
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                📅 {new Date(folder.created_at).toLocaleDateString('id-ID', { year: '2-digit', month: 'short', day: 'numeric' })}
                            </span>
                            <span className="badge-pill">
                                {folder.item_count || 0} Item
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {folders.length === 0 && !isCreating && (
                <div className="empty-state-modern mt-xl">
                    <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>📂</div>
                    <h3 style={{ color: 'var(--gray-600)', marginBottom: '0.5rem' }}>Belum ada folder</h3>
                    <p style={{ color: 'var(--gray-500)' }}>Buat folder baru untuk mulai mengelompokkan aset Anda secara terstruktur.</p>
                </div>
            )}

            {/* Modern Modal */}
            {isCreating && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-lg">
                            <h3 className="card-title">
                                {editingFolder ? 'Edit Folder' : 'Buat Folder Baru'}
                            </h3>
                            <button onClick={resetForm} className="action-icon-btn" style={{ fontSize: '1.2rem' }}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-lg">
                                <label className="form-label">Nama Folder</label>
                                <input
                                    type="text"
                                    className="input-modern"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Contoh: Aset Tanah Jakarta Utara"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="mb-xl">
                                <label className="form-label">Deskripsi (Opsional)</label>
                                <textarea
                                    className="input-modern"
                                    style={{ minHeight: '100px', resize: 'vertical' }}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Keterangan mengenai isi folder ini..."
                                />
                            </div>
                            <div className="flex justify-between gap-md" style={{ marginTop: '32px' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={resetForm}
                                    style={{ flex: 1 }}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-modern-primary"
                                    style={{ flex: 1, justifyContent: 'center' }}
                                >
                                    {editingFolder ? 'Simpan Perubahan' : 'Buat Folder'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

AssetFolderList.propTypes = {
    folders: PropTypes.array.isRequired,
    onCreate: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired
};

export default AssetFolderList;
