const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'api', 'index.js');
const content = fs.readFileSync(filePath, 'utf8');

let backticks = 0;
let doubleQuotes = 0;
let singleQuotes = 0;

for (let char of content) {
    if (char === '`') backticks++;
    // Simple naive check, ignores escaped quotes inside strings
}

console.log(`Backticks: ${backticks}`);
console.log(`DoubleQuotes: ${doubleQuotes} (naive)`);
console.log(`SingleQuotes: ${singleQuotes} (naive)`);

if (backticks % 2 !== 0) {
    console.log('UNBALANCED BACKTICKS! (Odd count)');
} else {
    console.log('Backticks balanced (even count).');
}

// Find first unclosed string or unexpected token logic is hard manually.
// Try to locate bad characters.
const badChars = content.match(/[^\x20-\x7E\s]/g);
if (badChars && badChars.length > 0) {
    console.log(`Found ${badChars.length} non-ASCII characters!`);
    // Print verify...
    console.log('Sample bad chars:', badChars.slice(0, 10).map(c => c.charCodeAt(0)));
} else {
    console.log('No non-ASCII characters found.');
}
