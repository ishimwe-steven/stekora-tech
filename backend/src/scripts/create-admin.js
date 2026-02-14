// Run: node src/scripts/create-admin.js
const bcrypt = require('bcrypt');
const pool = require('../db');

async function createAdmin() {
  const username = 'admin';
  const password = 'password123'; // change this
  const hash = await bcrypt.hash(password, 10);
  await pool.query('INSERT INTO admins (username, password) VALUES (?, ?)', [username, hash]);
  console.log('Admin created:', username);
  process.exit(0);
}

createAdmin().catch(err => { console.error(err); process.exit(1); });
