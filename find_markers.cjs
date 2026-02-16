const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'api', 'index.js');
let content = fs.readFileSync(filePath, 'utf8');
content = content.replace(/\\r\\n/g, '\\n').replace(/\\r/g, '\\n');
const lines = content.split('\\n');

console.log('Lines:', lines.length);

const startMarker = '// ==================== FASLABUH (DERMAGA) ENDPOINTS ====================';
const endMarker = '// ==================== END FASLABUH ENDPOINTS ====================';
const headMarker = '<<<<<<< HEAD';

const startIdx = lines.findIndex(l => l.includes(startMarker));
const endIdx = lines.findIndex(l => l.includes(endMarker));
const headIdx = lines.findIndex(l => l.includes(headMarker));

console.log('Start Boundary:', startIdx);
console.log('End Boundary:', endIdx);
console.log('Head Marker:', headIdx);
