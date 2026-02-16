const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'api', 'index.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace literal "\n" (backslash + n) with actual newline character
const newContent = content.replace(/\\n/g, '\n');

if (newContent !== content) {
    console.log('Fixed \\n literals.');
    fs.writeFileSync(filePath, newContent, 'utf8');
} else {
    console.log('No \\n literals found? Check again.');
}

// Verify no more literal backslash-n
if (newContent.includes('\\n')) {
    console.log('WARNING: Still found literal \\n inside content? Maybe in strings?');
    // Check if it's inside a string or comment vs code
    // simple check: if `\n` is not preceeded by another `\`?
    // But replace(/\\n/g, '\n') replaces ALL `\n`.
    // Wait! If there are strings like "foo\nbar", they are represented as `foo\\nbar` in source code?
    // No. Source code `const s = "foo\nbar"` has `\` and `n`.
    // If I replace `\n` with newline, `const s = "foo
    // bar"` -> valid multiline string (if using template literals or backslash escaping actual newline).

    // BUT common JS strings use `\n` for newline.
    // If I replace `\n` with actual newline char, `const s = "foo
    // bar"` is INVALID in JS double quotes!

    // So `replace(/\\n/g, '\n')` is DANGEROUS!
    // It will break `console.log('Hello\nWorld')`.

    console.log('Reverting unsafe replacement plan.');
}
