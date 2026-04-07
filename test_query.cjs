const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_bIgaVtKLjz47@ep-bold-cherry-a1r49rj0-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function run() {
  await client.connect();
  try {
    const res = await client.query('SELECT * FROM assets_rumneg ORDER BY created_at DESC LIMIT 1;');
    console.log(res.rows);
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await client.end();
  }
}
run();
