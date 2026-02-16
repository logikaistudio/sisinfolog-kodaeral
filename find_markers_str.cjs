const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'api', 'index.js');
const content = fs.readFileSync(filePath, 'utf8');

const headMarker = '<<<<<<< HEAD';
const idx = content.indexOf(headMarker);

if (idx !== -1) {
    const linesBefore = content.substring(0, idx).split('\n');
    console.log('Line Number of conflict:', linesBefore.length);
} else {
    console.log('No conflict markers found.');
}
