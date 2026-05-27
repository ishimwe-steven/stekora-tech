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

async function ensureProductsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT NULL,
      price DECIMAL(10,2) NOT NULL DEFAULT 0,
      old_price DECIMAL(10,2) NULL,
      discount_percent INT NULL,
      details TEXT NULL,
      image VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const requiredColumns = [
    ['old_price', 'DECIMAL(10,2) NULL'],
    ['discount_percent', 'INT NULL'],
    ['details', 'TEXT NULL'],
  ];

  for (const [columnName, definition] of requiredColumns) {
    const [columns] = await pool.query(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'products'
         AND COLUMN_NAME = ?`,
      [columnName]
    );

    if (columns.length === 0) {
      await pool.query(`ALTER TABLE products ADD COLUMN ${columnName} ${definition}`);
    }
  }
}

function getProductPayload(req) {
  const name = (req.body.name || '').trim();
  const description = req.body.description || null;
  const price = Number(req.body.price);
  const oldPriceRaw = req.body.old_price;
  const discountRaw = req.body.discount_percent;
  const oldPrice =
    oldPriceRaw === undefined || oldPriceRaw === '' ? null : Number(oldPriceRaw);
  const discountPercent =
    discountRaw === undefined || discountRaw === '' ? null : Number(discountRaw);
  const details = req.body.details || null;

  if (!name) {
    return { error: 'Product name is required' };
  }

  if (!Number.isFinite(price) || price < 0) {
    return { error: 'Product price must be a valid number' };
  }

  if (oldPrice !== null && (!Number.isFinite(oldPrice) || oldPrice < 0)) {
    return { error: 'Old price must be a valid number' };
  }

  if (
    discountPercent !== null &&
    (!Number.isInteger(discountPercent) || discountPercent < 0 || discountPercent > 100)
  ) {
    return { error: 'Discount percent must be between 0 and 100' };
  }

  return { name, description, price, oldPrice, discountPercent, details };
}

router.get('/', async (req, res) => {
  try {
    await ensureProductsTable();
    const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server error' }); }
});

router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    await ensureProductsTable();
    const payload = getProductPayload(req);
    if (payload.error) return res.status(400).json({ msg: payload.error });

    const { name, description, price, oldPrice, discountPercent, details } = payload;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const [result] = await pool.query(
      `INSERT INTO products
       (name, description, price, old_price, discount_percent, details, image)
       VALUES (?,?,?,?,?,?,?)`,
      [name, description, price, oldPrice, discountPercent, details, image]
    );
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server error' }); }
});

router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    await ensureProductsTable();
    const { id } = req.params;
    const payload = getProductPayload(req);
    if (payload.error) return res.status(400).json({ msg: payload.error });

    const { name, description, price, oldPrice, discountPercent, details } = payload;
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

    await pool.query(
      `UPDATE products
       SET name=?, description=?, price=?, old_price=?, discount_percent=?, details=?, image=?
       WHERE id=?`,
      [name, description, price, oldPrice, discountPercent, details, imagePath, id]
    );
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server error' }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await ensureProductsTable();
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
