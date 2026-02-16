const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'api', 'index.js');
const content = fs.readFileSync(filePath, 'utf8');

// Replace lines that start with '\n//' or end with '//...' + '\n'
// Wait, regex for literal `\n` is `\\n`.

// Replace `\n` at start of line (if literal)
let newContent = content.replace(/^\\n\/\/ /gm, '\n// '); // Replace `\n// ` with `// ` (newline presumed)
// Actually, I can just replace `\n` (literal) followed by `/` -> `\n/` (actual newline char).

newContent = newContent.replace(/\\n\/\//g, '\n//');

// Also check end of file or end of block markers
// Step 422: `endMarker` was `// ==================== END FASLABUH ENDPOINTS ====================`
// I added `\n` AFTER it? No, BEFORE it.
// `faslabuhCode + '\\n' + after`. So after code block, `\n` then `after`.
// `after` starts with line `// ... END ...`.
// So `\n// ... END ...`.

// I also added `\n` BEFORE code block? `before + '\\n' + faslabuhCode`.
// `before` ends with `// ... START ...`.
// So `// ... START ...\n`.

// Okay let's fix these specific patterns.
newContent = content.replace(/\/\/ ==================== FASLABUH \(DERMAGA\) ENDPOINTS ====================\\n/g, '// ==================== FASLABUH (DERMAGA) ENDPOINTS ====================\n');
newContent = newContent.replace(/\\n\/\/ ==================== END FASLABUH ENDPOINTS ====================/g, '\n// ==================== END FASLABUH ENDPOINTS ====================');

if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Fixed literal \\n markers.');
} else {
    console.log('Markers OK or already fixed?');
    // Maybe check if any other `\n` exists at start of line
    const other = content.match(/^\\n/gm);
    if (other) console.log(`Found ${other.length} other literal \\n at start of lines.`);
}
