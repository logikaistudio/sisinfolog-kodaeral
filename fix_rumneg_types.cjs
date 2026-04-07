const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_bIgaVtKLjz47@ep-bold-cherry-a1r49rj0-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function run() {
  await client.connect();
  try {
    const columnsToAlter = [
      'occupant_name',
      'occupant_rank',
      'occupant_nrp',
      'area',
      'longitude',
      'latitude',
      'status_penghuni',
      'no_sip',
      'tgl_sip',
      'tipe_rumah',
      'golongan',
      'tahun_buat',
      'asal_perolehan',
      'mendapat_fasdin',
      'kondisi'
    ];

    for (const col of columnsToAlter) {
      console.log(`Altering ${col}...`);
      await client.query(`ALTER TABLE assets_rumneg ALTER COLUMN ${col} TYPE TEXT;`);
    }
    console.log('Successfully altered columns to TEXT.');
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await client.end();
  }
}
run();
