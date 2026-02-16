const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'api', 'index.js');
const backupPath = path.join(__dirname, 'api', 'index.js.bak');

try {
    const stats = fs.statSync(filePath);
    console.log('Current File Size:', stats.size);
} catch (e) {
    console.log('Current File Missing');
}

try {
    const statsBak = fs.statSync(backupPath);
    console.log('Backup File Size:', statsBak.size);
} catch (e) {
    console.log('Backup File Missing');
}
