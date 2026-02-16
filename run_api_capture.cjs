const { exec } = require('child_process');
const fs = require('fs');

exec('node api/index.js', (error, stdout, stderr) => {
    if (error) {
        console.log('API Failed:', error.message);
        console.log('STDERR:', stderr);
        fs.writeFileSync('api_error.log', stderr);
    } else {
        console.log('API Started successfully (unexpected)');
    }
});
