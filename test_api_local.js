
async function testApi() {
    try {
        console.log('Fetching from http://localhost:3001/api/structure/folders ...');
        const res = await fetch('http://localhost:3001/api/structure/folders');
        console.log('Status:', res.status);
        if (!res.ok) {
            console.log('Error Text:', await res.text());
        } else {
            console.log('JSON:', await res.json());
        }
    } catch (e) {
        console.error('Fetch failed:', e);
    }
}
testApi();
