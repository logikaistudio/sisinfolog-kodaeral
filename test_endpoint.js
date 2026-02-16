(async () => {
    try {
        console.log('Testing DELETE endpoint directly on backend port 3001...');
        const response = await fetch('http://localhost:3001/api/faslabuh/delete-all', {
            method: 'DELETE'
        });
        const text = await response.text();
        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log(`Body: ${text}`);
    } catch (err) {
        console.error('Fetch error:', err);
    }
})();
