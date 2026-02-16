const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'api', 'index.js');
const content = fs.readFileSync(filePath, 'utf8');

let openBraces = 0;
let openParens = 0;
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let char of line) {
        if (char === '{') openBraces++;
        if (char === '}') openBraces--;
        if (char === '(') openParens++;
        if (char === ')') openParens--;
    }
}

console.log(`Open Braces: ${openBraces}`);
console.log(`Open Parens: ${openParens}`);

if (openBraces !== 0 || openParens !== 0) {
    console.log('UNBALANCED BRACES/PARENS DETECTED!');
} else {
    console.log('Braces/Parens are balanced.');
}
