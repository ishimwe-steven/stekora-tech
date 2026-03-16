const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const uploadFolder = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

/* =========================
   COURSES
========================= */

// GET /api/courses
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, description FROM courses ORDER BY id ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/courses  (admin)
router.post('/', auth, async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ msg: 'Name is required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO courses (name, description) VALUES (?, ?)',
      [name, description || null]
    );
    const [[course]] = await pool.query(
      'SELECT id, name, description FROM courses WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// PUT /api/courses/:id (admin)
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    await pool.query(
      'UPDATE courses SET name = ?, description = ? WHERE id = ?',
      [name, description || null, id]
    );
    const [[course]] = await pool.query(
      'SELECT id, name, description FROM courses WHERE id = ?',
      [id]
    );
    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE /api/courses/:id (admin)
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM courses WHERE id = ?', [id]);
    res.json({ msg: 'Course deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* =========================
   MODULES
========================= */

// GET /api/courses/:courseId/modules  (with materials summary)
router.get('/:courseId/modules', async (req, res) => {
  const { courseId } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT 
         m.id AS module_id,
         m.title AS module_title,
         COUNT(mat.id) AS materials_count
       FROM modules m
       LEFT JOIN materials mat ON mat.module_id = m.id
       WHERE m.course_id = ?
       GROUP BY m.id
       ORDER BY m.id ASC`,
      [courseId]
    );

    res.json(
      rows.map((r) => ({
        id: r.module_id,
        title: r.module_title,
        materials_count: r.materials_count,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/courses/:courseId/modules  (admin)
router.post('/:courseId/modules', auth, async (req, res) => {
  const { courseId } = req.params;
  const { title } = req.body;
  if (!title) return res.status(400).json({ msg: 'Title is required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO modules (course_id, title) VALUES (?, ?)',
      [courseId, title]
    );
    const [[module]] = await pool.query(
      'SELECT id, course_id, title FROM modules WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json(module);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE /api/courses/modules/:moduleId (admin)
router.delete('/modules/:moduleId', auth, async (req, res) => {
  const { moduleId } = req.params;
  try {
    await pool.query('DELETE FROM modules WHERE id = ?', [moduleId]);
    res.json({ msg: 'Module deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* =========================
   MATERIALS (NOTES & VIDEOS)
========================= */

// POST /api/courses/modules/:moduleId/materials  (admin)
router.post(
  '/modules/:moduleId/materials',
  auth,
  upload.single('file'),
  async (req, res) => {
    const { moduleId } = req.params;
    const { title, type, file_url } = req.body;

    if (!title || !type) {
      return res.status(400).json({ msg: 'Title and type are required' });
    }

    let finalUrl = file_url || null;
    if (req.file) {
      finalUrl = `/uploads/${req.file.filename}`;
    }

    try {
      const [result] = await pool.query(
        'INSERT INTO materials (module_id, title, type, file_url, created_at) VALUES (?,?,?,?, NOW())',
        [moduleId, title, type, finalUrl]
      );
      const [[material]] = await pool.query(
        'SELECT id, module_id, title, type, file_url, created_at FROM materials WHERE id = ?',
        [result.insertId]
      );
      res.status(201).json(material);
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server error' });
    }
  }
);

// GET /api/courses/modules/:moduleId/materials
router.get('/modules/:moduleId/materials', async (req, res) => {
  const { moduleId } = req.params;
  try {
    const [materials] = await pool.query(
      'SELECT id, title, type, file_url, created_at FROM materials WHERE module_id = ? ORDER BY id ASC',
      [moduleId]
    );
    res.json(materials);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;

