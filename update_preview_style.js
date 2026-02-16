import fs from 'fs';

const path = 'src/pages/Faslabuh.jsx';
let content = fs.readFileSync(path, 'utf8');

// Header Replacement
const oldHeader = `<tr style={{ background: '#003366', color: 'white' }}>
                                                <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5 }}>No</th>
                                                <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5 }}>Provinsi</th>
                                                <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5 }}>Nama Dermaga</th>
                                                <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5 }}>Lokasi</th>
                                                <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5 }}>Konstruksi</th>
                                                <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5 }}>P x L (m)</th>
                                                <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5 }}>Draft (m)</th>
                                                <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5 }}>Kondisi</th>
                                                <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#003366', zIndex: 5 }}>Sandar</th>
                                            </tr>`;

const newHeader = `<tr style={{ background: '#eff6ff', color: '#1e3a8a' }}>
                                                <th style={{ padding: '12px 8px', border: '1px solid #bfdbfe', textAlign: 'center', fontWeight: '600', position: 'sticky', top: 0, background: '#eff6ff', zIndex: 5, letterSpacing: '0.05em' }}>NO</th>
                                                <th style={{ padding: '12px 8px', border: '1px solid #bfdbfe', textAlign: 'left', fontWeight: '600', position: 'sticky', top: 0, background: '#eff6ff', zIndex: 5, letterSpacing: '0.05em' }}>PROVINSI</th>
                                                <th style={{ padding: '12px 8px', border: '1px solid #bfdbfe', textAlign: 'left', fontWeight: '600', position: 'sticky', top: 0, background: '#eff6ff', zIndex: 5, letterSpacing: '0.05em' }}>NAMA DERMAGA</th>
                                                <th style={{ padding: '12px 8px', border: '1px solid #bfdbfe', textAlign: 'left', fontWeight: '600', position: 'sticky', top: 0, background: '#eff6ff', zIndex: 5, letterSpacing: '0.05em' }}>LOKASI</th>
                                                <th style={{ padding: '12px 8px', border: '1px solid #bfdbfe', textAlign: 'left', fontWeight: '600', position: 'sticky', top: 0, background: '#eff6ff', zIndex: 5, letterSpacing: '0.05em' }}>KONSTRUKSI</th>
                                                <th style={{ padding: '12px 8px', border: '1px solid #bfdbfe', textAlign: 'center', fontWeight: '600', position: 'sticky', top: 0, background: '#eff6ff', zIndex: 5, letterSpacing: '0.05em' }}>P x L (m)</th>
                                                <th style={{ padding: '12px 8px', border: '1px solid #bfdbfe', textAlign: 'center', fontWeight: '600', position: 'sticky', top: 0, background: '#eff6ff', zIndex: 5, letterSpacing: '0.05em' }}>DRAFT (m)</th>
                                                <th style={{ padding: '12px 8px', border: '1px solid #bfdbfe', textAlign: 'center', fontWeight: '600', position: 'sticky', top: 0, background: '#eff6ff', zIndex: 5, letterSpacing: '0.05em' }}>KONDISI</th>
                                                <th style={{ padding: '12px 8px', border: '1px solid #bfdbfe', textAlign: 'left', fontWeight: '600', position: 'sticky', top: 0, background: '#eff6ff', zIndex: 5, letterSpacing: '0.05em' }}>SANDAR</th>
                                            </tr>`;

// Check if oldHeader exists
if (content.indexOf(oldHeader) !== -1) {
    content = content.replace(oldHeader, newHeader);
    console.log('Header updated successfully.');
} else {
    console.error('Old header not found. Skipping header update.');
    // Try to normalize whitespace for search or just warn
}


// Body Replacement
// We will replace the mapping function inside tbody
const oldBodyStart = `{previewData.map((item, index) => (
                                                <tr
                                                    key={index}
                                                    style={{
                                                        background: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                                                        borderBottom: '1px solid #f1f5f9'
                                                    }}
                                                >`;
// Note: relying on exact string match for multi-line is risky.
// Let's use specific markers.

const startMarker = `<tbody>`;
const endMarker = `</tbody>`;

const startIdx = content.lastIndexOf(startMarker); // Use lastIndexOf because there are two tables, we want the second one (preview)
const endIdx = content.indexOf(endMarker, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    const newBodyContent = `<tbody>
                                            {previewData.map((item, index) => (
                                                <tr
                                                    key={index}
                                                    style={{
                                                        background: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                                                        borderBottom: '1px solid #e2e8f0'
                                                    }}
                                                >
                                                    <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0', color: '#64748b', textAlign: 'center' }}>{index + 1}</td>
                                                    <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0', color: '#334155' }}>{item.provinsi || '-'}</td>
                                                    <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0', fontWeight: '600', color: '#0369a1' }}>{item.nama_dermaga || '-'}</td>
                                                    <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0', color: '#475569' }}>{item.lokasi || '-'}</td>
                                                    <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0', fontSize: '0.7rem', color: '#334155' }}>{item.konstruksi || '-'}</td>
                                                    <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0', textAlign: 'right', fontFamily: FONT_MONO }}>{item.panjang} x {item.lebar}</td>
                                                    <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0', textAlign: 'right', fontFamily: FONT_MONO }}>{item.draft_lwl}</td>
                                                    <td style={{ padding: '12px 8px', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>
                                                        <span style={{
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.7rem',
                                                            fontWeight: '600',
                                                            background: item.kondisi > 70 ? '#dcfce7' : '#fef3c7',
                                                            color: item.kondisi > 70 ? '#15803d' : '#b45309',
                                                            border: item.kondisi > 70 ? '1px solid #bbf7d0' : '1px solid #fde68a'
                                                        }}>
                                                            {item.kondisi}%
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '12px 8px', fontSize: '0.7rem', color: '#64748b' }}>
                                                        {item.sandar_items?.map(s => \`\${s.jumlah} \${s.tipe}\`).join(', ') || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>`;

    // We only want to replace the SECOND tbody (the preview one).
    // The main table is earlier in the file.
    // Let's verify startIdx is indeed the second one.

    const firstTbody = content.indexOf('<tbody>');
    if (startIdx === firstTbody) {
        console.warn("Warning: Found the first tbody. We want the second one.");
        // We know preview table is near the end.
    }

    // Perform replacement
    const pre = content.substring(0, startIdx);
    const post = content.substring(endIdx + endMarker.length);
    content = pre + newBodyContent + post;
    console.log('Body updated successfully.');

} else {
    console.error('Could not find tbody markers for preview table');
}

fs.writeFileSync(path, content);
