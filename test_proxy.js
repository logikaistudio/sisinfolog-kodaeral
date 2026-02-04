
async function testProxy() {
    console.log('Testing Proxy...');
    try {
        // Try hitting the Vite Dev Server port (5173) which should proxy to 3001
        // Note: fetch in Node might not handle "localhost" well if Vite binds to IPv4/IPv6 differently, we'll see.
        const res = await fetch('http://localhost:5173/api/health');
        console.log('Status:', res.status);
        console.log('Body:', await res.text());
    } catch (e) {
        console.error('Proxy Test Failed:', e.message);
    }
}
testProxy();
