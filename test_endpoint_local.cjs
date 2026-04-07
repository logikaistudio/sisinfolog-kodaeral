const http = require('http');

http.get('http://localhost:3001/api/assets/rumneg', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('3001 GET /api/assets/rumneg status:', res.statusCode, data.substring(0, 100)));
}).on('error', err => console.log('3001 error:', err.message));

http.get('http://localhost:5173/api/assets/rumneg', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('5173 GET /api/assets/rumneg status:', res.statusCode, data.substring(0, 100)));
}).on('error', err => console.log('5173 error:', err.message));
