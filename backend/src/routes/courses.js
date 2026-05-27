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

async function ensureLearningTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS module_quizzes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      module_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      question TEXT NOT NULL,
      option_a VARCHAR(255) NOT NULL,
      option_b VARCHAR(255) NOT NULL,
      option_c VARCHAR(255),
      option_d VARCHAR(255),
      correct_option VARCHAR(1) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_module_quiz (module_id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS module_completions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      module_id INT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_student_module (student_id, module_id)
    )
  `);
}

async function ensureCourseColumns() {
  const [columns] = await pool.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'courses'
       AND COLUMN_NAME IN ('image_url', 'category')`
  );
  const existing = new Set(columns.map((column) => column.COLUMN_NAME));

  if (!existing.has('image_url')) {
    await pool.query('ALTER TABLE courses ADD COLUMN image_url VARCHAR(500) NULL');
  }

  if (!existing.has('category')) {
    await pool.query("ALTER TABLE courses ADD COLUMN category VARCHAR(80) NULL DEFAULT 'Development'");
  }
}

/* =========================
   COURSES
========================= */

// GET /api/courses
router.get('/', async (req, res) => {
  try {
    await ensureCourseColumns();
    const [rows] = await pool.query(
      'SELECT id, name, description, category, image_url FROM courses ORDER BY id ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/courses  (admin)
router.post('/', auth, upload.single('image'), async (req, res) => {
  const { name, description, category } = req.body;
  if (!name) return res.status(400).json({ msg: 'Name is required' });

  try {
    await ensureCourseColumns();
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const [result] = await pool.query(
      'INSERT INTO courses (name, description, category, image_url) VALUES (?, ?, ?, ?)',
      [name, description || null, category || 'Development', imageUrl]
    );
    const [[course]] = await pool.query(
      'SELECT id, name, description, category, image_url FROM courses WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// PUT /api/courses/:id (admin)
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { name, description, category } = req.body;

  try {
    await ensureCourseColumns();
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image_url || null;
    await pool.query(
      'UPDATE courses SET name = ?, description = ?, category = ?, image_url = COALESCE(?, image_url) WHERE id = ?',
      [name, description || null, category || 'Development', imageUrl, id]
    );
    const [[course]] = await pool.query(
      'SELECT id, name, description, category, image_url FROM courses WHERE id = ?',
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

// GET /api/courses/modules/:moduleId/quiz
router.get('/modules/:moduleId/quiz', async (req, res) => {
  const { moduleId } = req.params;
  try {
    await ensureLearningTables();
    const [[quiz]] = await pool.query(
      `SELECT id, module_id, title, question, option_a, option_b, option_c, option_d, correct_option
       FROM module_quizzes
       WHERE module_id = ?`,
      [moduleId]
    );
    res.json(quiz || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/courses/modules/:moduleId/quiz (admin)
router.post('/modules/:moduleId/quiz', auth, async (req, res) => {
  const { moduleId } = req.params;
  const {
    title,
    question,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_option,
  } = req.body;

  if (!title || !question || !option_a || !option_b || !correct_option) {
    return res.status(400).json({ msg: 'Quiz title, question, two options, and answer are required' });
  }

  try {
    await ensureLearningTables();
    await pool.query(
      `INSERT INTO module_quizzes
       (module_id, title, question, option_a, option_b, option_c, option_d, correct_option)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         title = VALUES(title),
         question = VALUES(question),
         option_a = VALUES(option_a),
         option_b = VALUES(option_b),
         option_c = VALUES(option_c),
         option_d = VALUES(option_d),
         correct_option = VALUES(correct_option)`,
      [moduleId, title, question, option_a, option_b, option_c || null, option_d || null, correct_option]
    );

    const [[quiz]] = await pool.query(
      'SELECT * FROM module_quizzes WHERE module_id = ?',
      [moduleId]
    );
    res.json(quiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/courses/completions (admin notifications)
router.get('/completions', auth, async (req, res) => {
  try {
    await ensureLearningTables();
    const [rows] = await pool.query(
      `SELECT mc.id, mc.created_at,
              s.full_name AS student_name,
              s.email AS student_email,
              m.title AS module_title,
              c.name AS course_name
       FROM module_completions mc
       JOIN students s ON s.id = mc.student_id
       JOIN modules m ON m.id = mc.module_id
       LEFT JOIN courses c ON c.id = m.course_id
       ORDER BY mc.created_at DESC
       LIMIT 50`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;

