const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const auth = require('../middleware/auth');

/* ======================
   REGISTER ADMIN (ONCE)
====================== */
router.post('/register-admin', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: 'Missing fields' });
  }

  try {
    // Check if admin already exists
    const [existing] = await pool.query(
      'SELECT id FROM admins WHERE username = ?',
      [username]
    );

    if (existing.length > 0) {
      return res.status(409).json({ msg: 'Admin already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert admin
    await pool.query(
      'INSERT INTO admins (username, password, created_at) VALUES (?, ?, NOW())',
      [username, hashedPassword]
    );

    res.status(201).json({ msg: 'Admin registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* ======================
   LOGIN ADMIN
====================== */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: 'Missing fields' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM admins WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password);

    if (!match) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* ======================
   CHANGE ADMIN PASSWORD
   POST /api/auth/change-password
====================== */
router.post('/change-password', auth, async (req, res) => {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ msg: 'Missing fields' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM admins WHERE id = ?', [
      req.admin.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Admin not found' });
    }

    const admin = rows[0];
    const match = await bcrypt.compare(current_password, admin.password);
    if (!match) {
      return res.status(401).json({ msg: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE admins SET password = ? WHERE id = ?', [
      hashed,
      admin.id,
    ]);

    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
