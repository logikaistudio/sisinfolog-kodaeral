export const tableOrder = [
  'roles',
  'users',
  'master_asset_folders',
  'assets_tanah',
  'assets_bangunan',
  'assets_kapling',
  'assets_rumneg',
  'assets_pemanfaatan',
  'assets_diskes',
  'faslabuh',
  'master_asset_utama',
  'supplies',
  'master_locations',
  'master_officers',
  'master_units',
  'departments',
  'staff',
  'tasks'
];

export const tableDefinitions = {
  roles: `CREATE TABLE IF NOT EXISTS roles (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    permissions TEXT[],
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
  );`,

  users: `CREATE TABLE IF NOT EXISTS users (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100),
    email      VARCHAR(100) UNIQUE,
    role       VARCHAR(50),
    status     VARCHAR(20) DEFAULT 'Active',
    avatar     TEXT,
    username   VARCHAR(50) UNIQUE,
    password   VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );`,

  master_asset_folders: `CREATE TABLE IF NOT EXISTS master_asset_folders (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
  );`,

  assets_tanah: `CREATE TABLE IF NOT EXISTS assets_tanah (
    id                          SERIAL PRIMARY KEY,
    name                        TEXT,
    code                        VARCHAR(100) UNIQUE,
    category                    VARCHAR(100),
    luas                        NUMERIC,
    status                      VARCHAR(50),
    location                    TEXT,
    coordinates                 VARCHAR(100),
    map_boundary                TEXT,
    area                        VARCHAR(100),
    folder_id                   INTEGER,
    source_file                 TEXT,
    jenis_bmn                   TEXT,
    kode_barang                 VARCHAR(50),
    nup                         VARCHAR(50),
    nama_barang                 TEXT,
    kondisi                     VARCHAR(50),
    luas_tanah_seluruhnya       NUMERIC,
    nilai_perolehan             NUMERIC,
    no_sertifikat               VARCHAR(100),
    alamat_detail               TEXT,
    kecamatan                   VARCHAR(100),
    kabupaten                   VARCHAR(100),
    provinsi                    VARCHAR(100),
    keterangan_bmn              TEXT,
    kode_kota                   VARCHAR(50),
    no_psp                      VARCHAR(100),
    tgl_psp                     TEXT,
    rt_rw                       VARCHAR(50),
    kelurahan_desa              VARCHAR(100),
    tanggal_perolehan           TEXT,
    tgl_sertifikat              TEXT,
    tanah_yg_telah_bersertifikat NUMERIC,
    tanah_yg_belum_bersertifikat NUMERIC,
    standar_satuan              VARCHAR(50),
    occupant_name               VARCHAR(100),
    occupant_rank               VARCHAR(50),
    occupant_nrp                VARCHAR(50),
    occupant_title              VARCHAR(100),
    created_at                  TIMESTAMP DEFAULT NOW(),
    updated_at                  TIMESTAMP DEFAULT NOW()
  );`,

  assets_bangunan: `CREATE TABLE IF NOT EXISTS assets_bangunan (
    id               SERIAL PRIMARY KEY,
    name             VARCHAR(255),
    code             VARCHAR(100) UNIQUE,
    category         VARCHAR(100),
    luas             VARCHAR(50),
    status           VARCHAR(50),
    location         TEXT,
    coordinates      VARCHAR(100),
    map_boundary     TEXT,
    area             VARCHAR(100),
    occupant_name    TEXT,
    occupant_rank    TEXT,
    occupant_nrp     TEXT,
    occupant_title   TEXT,
    status_penghuni  TEXT,
    no_sip           TEXT,
    tgl_sip          TEXT,
    tipe_rumah       TEXT,
    golongan         TEXT,
    tahun_buat       TEXT,
    asal_perolehan   TEXT,
    mendapat_fasdin  TEXT,
    kondisi          TEXT,
    keterangan       TEXT,
    alamat_detail    TEXT,
    nup              TEXT,
    kode_barang      TEXT,
    nama_barang      TEXT,
    luas_tanah       VARCHAR(50),
    folder_id        INTEGER,
    source_file      TEXT,
    created_at       TIMESTAMP DEFAULT NOW(),
    updated_at       TIMESTAMP DEFAULT NOW()
  );`,

  assets_kapling: `CREATE TABLE IF NOT EXISTS assets_kapling (
    id                           SERIAL PRIMARY KEY,
    name                         VARCHAR(255),
    code                         VARCHAR(50) UNIQUE,
    category                     VARCHAR(100),
    luas                         VARCHAR(50),
    status                       VARCHAR(50),
    location                     TEXT,
    coordinates                  VARCHAR(100),
    map_boundary                 TEXT,
    area                         VARCHAR(100),
    folder_id                    INTEGER,
    occupant_name                VARCHAR(100),
    occupant_rank                VARCHAR(50),
    occupant_nrp                 VARCHAR(50),
    occupant_title               VARCHAR(100),
    jenis_bmn                    VARCHAR(100),
    kode_barang                  VARCHAR(50),
    nup                          VARCHAR(50),
    nama_barang                  VARCHAR(255),
    kondisi                      VARCHAR(50),
    luas_tanah_seluruhnya        VARCHAR(50),
    tanah_yg_telah_bersertifikat VARCHAR(50),
    tanah_yg_belum_bersertifikat VARCHAR(50),
    tanggal_perolehan            VARCHAR(50),
    nilai_perolehan              NUMERIC,
    no_sertifikat                VARCHAR(100),
    tgl_sertifikat               VARCHAR(50),
    standar_satuan               VARCHAR(50),
    alamat_detail                TEXT,
    kecamatan                    VARCHAR(100),
    kabupaten                    VARCHAR(100),
    provinsi                     VARCHAR(100),
    keterangan_bmn               TEXT,
    kode_kota                    VARCHAR(50),
    no_psp                       VARCHAR(100),
    tgl_psp                      VARCHAR(50),
    rt_rw                        VARCHAR(50),
    kelurahan_desa               VARCHAR(100),
    created_at                   TIMESTAMP DEFAULT NOW(),
    updated_at                   TIMESTAMP DEFAULT NOW()
  );`,

  assets_rumneg: `CREATE TABLE IF NOT EXISTS assets_rumneg (
    id               SERIAL PRIMARY KEY,
    occupant_name    TEXT,
    occupant_rank    TEXT,
    occupant_nrp     TEXT,
    area             TEXT,
    alamat_detail    TEXT,
    longitude        TEXT,
    latitude         TEXT,
    status_penghuni  TEXT,
    no_sip           TEXT,
    tgl_sip          TEXT,
    no_sip_2         TEXT,
    tgl_sip_2        TEXT,
    no_sip_3         TEXT,
    tgl_sip_3        TEXT,
    tipe_rumah       TEXT,
    golongan         TEXT,
    tahun_buat       TEXT,
    asal_perolehan   TEXT,
    mendapat_fasdin  TEXT,
    kondisi          TEXT,
    keterangan       TEXT,
    created_at       TIMESTAMP DEFAULT NOW(),
    updated_at       TIMESTAMP DEFAULT NOW()
  );`,

  assets_pemanfaatan: `CREATE TABLE IF NOT EXISTS assets_pemanfaatan (
    id                 SERIAL PRIMARY KEY,
    objek              TEXT,
    pemanfaatan        TEXT,
    luas               TEXT,
    bentuk_pemanfaatan TEXT,
    pihak_pks          TEXT,
    no_pks             TEXT,
    tgl_pks            TEXT,
    nilai_kompensasi   TEXT,
    jangka_waktu       TEXT,
    no_persetujuan     TEXT,
    tgl_persetujuan    TEXT,
    no_ntpn            TEXT,
    tgl_ntpn           TEXT,
    longitude          TEXT,
    latitude           TEXT,
    created_at         TIMESTAMP DEFAULT NOW()
  );`,

  assets_diskes: `CREATE TABLE IF NOT EXISTS assets_diskes (
    id               SERIAL PRIMARY KEY,
    name             TEXT,
    type             TEXT,
    location         TEXT,
    capacity         TEXT,
    staff            TEXT,
    status           TEXT,
    description      TEXT,
    longitude        TEXT,
    latitude         TEXT,
    tahun_beroperasi TEXT,
    sarana           JSONB,
    created_at       TIMESTAMP DEFAULT NOW(),
    updated_at       TIMESTAMP DEFAULT NOW()
  );`,

  faslabuh: `CREATE TABLE IF NOT EXISTS faslabuh (
    id                   SERIAL PRIMARY KEY,
    provinsi             TEXT,
    wilayah              TEXT,
    lokasi               TEXT,
    nama_dermaga         TEXT,
    konstruksi           TEXT,
    lon                  NUMERIC,
    lat                  NUMERIC,
    kode_barang          TEXT,
    no_sertifikat        TEXT,
    tgl_sertifikat       TEXT,
    panjang              NUMERIC,
    lebar                NUMERIC,
    luas                 NUMERIC,
    draft_lwl            NUMERIC,
    pasut_hwl_lwl        NUMERIC,
    kondisi              NUMERIC,
    sandar_items         JSONB DEFAULT '[]',
    plat_mst_ton         NUMERIC,
    plat_jenis_ranmor    TEXT,
    plat_berat_max_ton   NUMERIC,
    listrik_jml_titik    NUMERIC,
    listrik_kap_amp      NUMERIC,
    listrik_tegangan_volt NUMERIC,
    listrik_frek_hz      NUMERIC,
    listrik_sumber       TEXT,
    listrik_daya_kva     NUMERIC,
    air_gwt_m3           NUMERIC,
    air_debit_m3_jam     NUMERIC,
    air_sumber           TEXT,
    bbm                  TEXT,
    hydrant              TEXT,
    keterangan           TEXT,
    fotos                JSONB DEFAULT '[]',
    created_at           TIMESTAMP DEFAULT NOW(),
    updated_at           TIMESTAMP DEFAULT NOW()
  );`,

  master_asset_utama: `CREATE TABLE IF NOT EXISTS master_asset_utama (
    id                       SERIAL PRIMARY KEY,
    unique_key               VARCHAR(200) UNIQUE,
    jenis_bmn                TEXT,
    kode_satker              TEXT,
    nama_satker              TEXT,
    kode_barang              TEXT,
    nup                      TEXT,
    nama_barang              TEXT,
    status_bmn               TEXT,
    merk                     TEXT,
    tipe                     TEXT,
    kondisi                  TEXT,
    umur_aset                NUMERIC,
    intra_extra              TEXT,
    henti_guna               TEXT,
    status_sbsn              TEXT,
    status_bmn_idle          TEXT,
    status_kemitraan         TEXT,
    bpybds                   TEXT,
    usulan_barang_hilang     TEXT,
    usulan_barang_rb         TEXT,
    usul_hapus               TEXT,
    hibah_dktp               TEXT,
    konsesi_jasa             TEXT,
    properti_investasi       TEXT,
    jenis_dokumen            TEXT,
    no_dokumen               TEXT,
    no_bpkp                  TEXT,
    no_polisi                TEXT,
    status_sertifikasi       TEXT,
    jenis_sertifikat         TEXT,
    no_sertifikat            TEXT,
    nama_sertifikat          TEXT,
    tanggal_buku_pertama     TEXT,
    tanggal_perolehan        TEXT,
    tanggal_penghapusan      TEXT,
    nilai_perolehan_pertama  NUMERIC,
    nilai_mutasi             NUMERIC,
    nilai_perolehan          NUMERIC,
    nilai_penyusutan         NUMERIC,
    nilai_buku               NUMERIC,
    luas_tanah_seluruhnya    NUMERIC,
    luas_tanah_bangunan      NUMERIC,
    luas_tanah_sarana        NUMERIC,
    luas_tanah_kosong        NUMERIC,
    luas_bangunan            NUMERIC,
    luas_tapak_bangunan      NUMERIC,
    luas_pemanfaatan         NUMERIC,
    jumlah_lantai            NUMERIC,
    jumlah_foto              NUMERIC,
    status_bangunan          TEXT,
    no_psp                   TEXT,
    tanggal_psp              TEXT,
    alamat                   TEXT,
    rt_rw                    TEXT,
    kelurahan_desa           TEXT,
    kecamatan                TEXT,
    kab_kota                 TEXT,
    kode_kab_kota            TEXT,
    provinsi                 TEXT,
    kode_provinsi            TEXT,
    kode_pos                 TEXT,
    sbsk                     TEXT,
    optimalisasi             TEXT,
    penghuni                 TEXT,
    pengguna                 TEXT,
    kode_kpknl               TEXT,
    uraian_kpknl             TEXT,
    uraian_kanwil_djkn       TEXT,
    nama_kl                  TEXT,
    nama_e1                  TEXT,
    nama_korwil              TEXT,
    kode_register            TEXT,
    lokasi_ruang             TEXT,
    jenis_identitas          TEXT,
    no_identitas             TEXT,
    no_stnk                  TEXT,
    nama_pengguna            TEXT,
    status_pmk               TEXT,
    longitude                TEXT,
    latitude                 TEXT,
    lanal                    TEXT,
    photos                   TEXT,
    identifikasi_aset        TEXT,
    created_at               TIMESTAMP DEFAULT NOW(),
    updated_at               TIMESTAMP DEFAULT NOW()
  );`,

  supplies: `CREATE TABLE IF NOT EXISTS supplies (
    id         SERIAL PRIMARY KEY,
    code       VARCHAR(100) UNIQUE,
    name       TEXT NOT NULL,
    category   VARCHAR(100),
    stock      INTEGER DEFAULT 0,
    unit       VARCHAR(50),
    condition  VARCHAR(50),
    location   TEXT,
    notes      TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );`,

  master_locations: `CREATE TABLE IF NOT EXISTS master_locations (
    id         SERIAL PRIMARY KEY,
    code       VARCHAR(100),
    name       TEXT,
    type       VARCHAR(100),
    capacity   TEXT,
    status     VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );`,

  master_officers: `CREATE TABLE IF NOT EXISTS master_officers (
    id         SERIAL PRIMARY KEY,
    nrp        VARCHAR(50),
    name       TEXT,
    position   TEXT,
    phone      VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );`,

  master_units: `CREATE TABLE IF NOT EXISTS master_units (
    id         SERIAL PRIMARY KEY,
    code       VARCHAR(100),
    name       TEXT,
    type       VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );`,

  departments: `CREATE TABLE IF NOT EXISTS departments (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    code        VARCHAR(50),
    description TEXT,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
  );`,

  staff: `CREATE TABLE IF NOT EXISTS staff (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    nrp           VARCHAR(50) UNIQUE,
    rank          VARCHAR(50),
    position      TEXT,
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    email         VARCHAR(100),
    phone         VARCHAR(50),
    status        VARCHAR(20) DEFAULT 'Active',
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
  );`,

  tasks: `CREATE TABLE IF NOT EXISTS tasks (
    id              SERIAL PRIMARY KEY,
    title           TEXT NOT NULL,
    description     TEXT,
    priority        VARCHAR(20) DEFAULT 'Normal',
    status          VARCHAR(30) DEFAULT 'Pending',
    due_date        DATE,
    created_by      INTEGER REFERENCES users(id) ON DELETE SET NULL,
    assigned_to     JSONB,
    assigned_depts  JSONB,
    attachments     JSONB,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
  );`
};

export const indexStatements = [
  { name: 'idx_assets_tanah_code', sql: 'CREATE INDEX IF NOT EXISTS idx_assets_tanah_code ON assets_tanah(code);' },
  { name: 'idx_assets_tanah_area', sql: 'CREATE INDEX IF NOT EXISTS idx_assets_tanah_area ON assets_tanah(area);' },
  { name: 'idx_assets_tanah_folder_id', sql: 'CREATE INDEX IF NOT EXISTS idx_assets_tanah_folder_id ON assets_tanah(folder_id);' },
  { name: 'idx_assets_bangunan_folder_id', sql: 'CREATE INDEX IF NOT EXISTS idx_assets_bangunan_folder_id ON assets_bangunan(folder_id);' },
  { name: 'idx_assets_rumneg_area', sql: 'CREATE INDEX IF NOT EXISTS idx_assets_rumneg_area ON assets_rumneg(area);' },
  { name: 'idx_mau_unique_key', sql: 'CREATE INDEX IF NOT EXISTS idx_mau_unique_key ON master_asset_utama(unique_key);' },
  { name: 'idx_mau_kode_barang', sql: 'CREATE INDEX IF NOT EXISTS idx_mau_kode_barang ON master_asset_utama(kode_barang);' },
  { name: 'idx_mau_lanal', sql: 'CREATE INDEX IF NOT EXISTS idx_mau_lanal ON master_asset_utama(lanal);' }
];

export const seedStatements = {
  roles: `INSERT INTO roles (name, description, permissions) VALUES
    ('Super Admin', 'Full access to all system features', ARRAY['all']),
    ('Admin', 'Administrative access', ARRAY['manage_users','manage_content']),
    ('User', 'Standard user access', ARRAY['read_content'])
  ON CONFLICT (name) DO NOTHING;`,

  users: `INSERT INTO users (name, email, role, status, username, password) VALUES
    ('Administrator', 'admin@kodaeral.com', 'Super Admin', 'Active', 'kodaeral', 'kodaeral')
  ON CONFLICT (username) DO NOTHING;`,

  departments: `INSERT INTO departments (name, code) VALUES
    ('Sekretariat', 'SET'),
    ('Asisten Logistik', 'ASLOG'),
    ('Asisten Personel', 'ASPERS'),
    ('Asisten Operasi', 'ASOPS'),
    ('Asisten Sumber Daya', 'ASDA'),
    ('Fasilitasi Pangkalan', 'FASSING'),
    ('Keuangan', 'KEU'),
    ('Hukum', 'KUM'),
    ('Satuan Kesehatan', 'SATKES'),
    ('Satuan Intelijen', 'SATINTEL')
  ON CONFLICT (name) DO NOTHING;`
};

export function getCreateTableSql(tableName) {
  return tableDefinitions[tableName];
}

export async function ensureTable(client, tableName) {
  const sql = getCreateTableSql(tableName);
  if (!sql) {
    throw new Error(`Table definition not found for '${tableName}'`);
  }
  await client.query(sql);
}

export async function ensureAllTables(client) {
  for (const tableName of tableOrder) {
    await ensureTable(client, tableName);
  }

  for (const index of indexStatements) {
    await client.query(index.sql);
  }

  for (const seedKey of Object.keys(seedStatements)) {
    await client.query(seedStatements[seedKey]);
  }
}
