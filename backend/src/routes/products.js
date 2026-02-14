const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadFolder = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server error' }); }
});

router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const [result] = await pool.query('INSERT INTO products (name, description, price, image) VALUES (?,?,?,?)', [name, description, price, image]);
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server error' }); }
});

router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price } = req.body;
    const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ msg: 'Not found' });

    let imagePath = existing[0].image;
    if (req.file) {
      // delete old file if exists
      if (existing[0].image) {
        const oldPath = path.join(__dirname, '..', '..', existing[0].image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      imagePath = `/uploads/${req.file.filename}`;
    }

    await pool.query('UPDATE products SET name=?, description=?, price=?, image=? WHERE id=?', [name, description, price, imagePath, id]);
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server error' }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ msg: 'Not found' });
    if (rows[0].image) {
      const imgPath = path.join(__dirname, '..', '..', rows[0].image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ msg: 'Deleted' });
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server error' }); }
});

module.exports = router;
