const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/sisinfolog'
});

async function test() {
  const res = await pool.query(`SELECT identifikasi_aset, lanal, photos FROM master_asset_utama WHERE identifikasi_aset = 'Rumah Dinas Danlantamal'`);
  const row = res.rows[0];
  if(row) {
      console.log('identifikasi_aset:', row.identifikasi_aset);
      console.log('lanal:', row.lanal);
      if(row.photos) {
          const p = JSON.parse(row.photos);
          console.log('photos count:', p.length);
          if (p.length > 0) {
              console.log('photo 0 base64 prefix:', p[0].base64 ? p[0].base64.substring(0, 50) : 'NO BASE64');
          }
      } else {
          console.log('photos: NULL');
      }
  } else {
      console.log('Not Found');
  }
  pool.end();
}
test();
