import pool from '../api/db.js';
(async () => {
  try {
    const res = await pool.query("SELECT id, permissions FROM roles WHERE name = 'Aslog'");
    if (res.rows.length > 0) {
      let perms = res.rows[0].permissions || [];
      // Remove superadmin perms
      perms = perms.filter(p => !['users_manage', 'roles_manage', 'master_data_manage', 'manage_content', 'manage_users', 'all'].includes(p));
      await pool.query('UPDATE roles SET permissions = $1 WHERE id = $2', [perms, res.rows[0].id]);
      console.log('Aslog permissions updated successfully.');
    } else {
      console.log('Role Aslog not found.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
})();
