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
      question_order INT DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  try {
    await pool.query('ALTER TABLE module_quizzes DROP INDEX unique_module_quiz');
  } catch (err) {
    if (err.code !== 'ER_CANT_DROP_FIELD_OR_KEY') {
      console.error('Index drop warning:', err.message);
    }
  }

  const [quizColumns] = await pool.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'module_quizzes'
       AND COLUMN_NAME = 'question_order'`
  );

  if (quizColumns.length === 0) {
    await pool.query('ALTER TABLE module_quizzes ADD COLUMN question_order INT DEFAULT 1');
  }

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
    await pool.query(
      "ALTER TABLE courses ADD COLUMN category VARCHAR(80) NULL DEFAULT 'Development'"
    );
  }
}

async function ensureMaterialColumns() {
  const [columns] = await pool.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'materials'
       AND COLUMN_NAME IN ('content')`
  );

  const existing = new Set(columns.map((column) => column.COLUMN_NAME));

  if (!existing.has('content')) {
    await pool.query('ALTER TABLE materials ADD COLUMN content LONGTEXT NULL');
  }
}

/* =========================
   COURSES
========================= */

router.get('/', async (req, res) => {
  try {
    await ensureCourseColumns();

    const [rows] = await pool.query(
      `SELECT 
         c.id,
         c.name,
         c.description,
         c.category,
         c.image_url,
         COUNT(m.id) AS modules_count
       FROM courses c
       LEFT JOIN modules m ON m.course_id = c.id
       GROUP BY c.id
       ORDER BY c.id ASC`
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/', auth, upload.single('image'), async (req, res) => {
  const { name, description, category, modules } = req.body;

  if (!name) return res.status(400).json({ msg: 'Name is required' });

  let moduleList = [];

  try {
    moduleList = JSON.parse(modules || '[]');
  } catch {
    moduleList = [];
  }

  moduleList = moduleList.map((m) => String(m).trim()).filter(Boolean);

  if (moduleList.length === 0) {
    return res.status(400).json({
      msg: 'Please add at least one module before saving this course.',
    });
  }

  const connection = await pool.getConnection();

  try {
    await ensureCourseColumns();
    await connection.beginTransaction();

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await connection.query(
      'INSERT INTO courses (name, description, category, image_url) VALUES (?, ?, ?, ?)',
      [name, description || null, category || 'Development', imageUrl]
    );

    const courseId = result.insertId;

    for (const moduleTitle of moduleList) {
      await connection.query(
        'INSERT INTO modules (course_id, title) VALUES (?, ?)',
        [courseId, moduleTitle]
      );
    }

    await connection.commit();

    const [[course]] = await pool.query(
      `SELECT 
         c.id,
         c.name,
         c.description,
         c.category,
         c.image_url,
         COUNT(m.id) AS modules_count
       FROM courses c
       LEFT JOIN modules m ON m.course_id = c.id
       WHERE c.id = ?
       GROUP BY c.id`,
      [courseId]
    );

    res.status(201).json(course);
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  } finally {
    connection.release();
  }
});

router.put('/:id', auth, upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { name, description, category } = req.body;

  try {
    await ensureCourseColumns();

    const imageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : req.body.image_url || null;

    await pool.query(
      'UPDATE courses SET name = ?, description = ?, category = ?, image_url = COALESCE(?, image_url) WHERE id = ?',
      [name, description || null, category || 'Development', imageUrl, id]
    );

    const [[course]] = await pool.query(
      `SELECT 
         c.id,
         c.name,
         c.description,
         c.category,
         c.image_url,
         COUNT(m.id) AS modules_count
       FROM courses c
       LEFT JOIN modules m ON m.course_id = c.id
       WHERE c.id = ?
       GROUP BY c.id`,
      [id]
    );

    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

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

router.get('/:courseId/modules', async (req, res) => {
  const { courseId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT 
         m.id AS module_id,
         m.title AS module_title,
         COUNT(DISTINCT mat.id) AS materials_count,
         COUNT(DISTINCT q.id) AS assessment_count
       FROM modules m
       LEFT JOIN materials mat ON mat.module_id = m.id
       LEFT JOIN module_quizzes q ON q.module_id = m.id
       WHERE m.course_id = ?
       GROUP BY m.id
       ORDER BY m.id ASC`,
      [courseId]
    );

    res.json(
      rows.map((r) => ({
        id: r.module_id,
        title: r.module_title,
        materials_count: Number(r.materials_count || 0),
        assessment_count: Number(r.assessment_count || 0),
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

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
   MATERIALS / SECTIONS
========================= */

router.post('/modules/:moduleId/materials', auth, upload.single('file'), async (req, res) => {
  const { moduleId } = req.params;
  const { title, type, file_url, content } = req.body;

  if (!title || !type) {
    return res.status(400).json({ msg: 'Title and type are required' });
  }

  if (type === 'section' && !content) {
    return res.status(400).json({ msg: 'Section content is required' });
  }

  let finalUrl = file_url || '';

  if (req.file) {
    finalUrl = `/uploads/${req.file.filename}`;
  }

  try {
    await ensureMaterialColumns();

    const [result] = await pool.query(
      'INSERT INTO materials (module_id, title, type, file_url, content, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [moduleId, title, type, finalUrl, content || null]
    );

    const [[material]] = await pool.query(
      'SELECT id, module_id, title, type, file_url, content, created_at FROM materials WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(material);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/modules/:moduleId/materials', async (req, res) => {
  const { moduleId } = req.params;

  try {
    await ensureMaterialColumns();

    const [materials] = await pool.query(
      'SELECT id, title, type, file_url, content, created_at FROM materials WHERE module_id = ? ORDER BY id ASC',
      [moduleId]
    );

    res.json(materials);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.put('/materials/:materialId', auth, upload.single('file'), async (req, res) => {
  const { materialId } = req.params;
  const { title, type, file_url, content } = req.body;

  if (!title || !type) {
    return res.status(400).json({ msg: 'Title and type are required' });
  }

  if (type === 'section' && !content) {
    return res.status(400).json({ msg: 'Section content is required' });
  }

  try {
    await ensureMaterialColumns();

    const finalUrl = req.file ? `/uploads/${req.file.filename}` : file_url || '';

    await pool.query(
      'UPDATE materials SET title = ?, type = ?, file_url = COALESCE(?, file_url), content = ? WHERE id = ?',
      [title, type, finalUrl, content || null, materialId]
    );

    const [[material]] = await pool.query(
      'SELECT id, module_id, title, type, file_url, content, created_at FROM materials WHERE id = ?',
      [materialId]
    );

    res.json(material);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.delete('/materials/:materialId', auth, async (req, res) => {
  const { materialId } = req.params;

  try {
    await pool.query('DELETE FROM materials WHERE id = ?', [materialId]);
    res.json({ msg: 'Material deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* =========================
   ASSESSMENTS
========================= */

// GET all assessment questions for a module
router.get('/modules/:moduleId/quiz', async (req, res) => {
  const { moduleId } = req.params;

  try {
    await ensureLearningTables();

    const [questions] = await pool.query(
      `SELECT id, module_id, title, question, option_a, option_b, option_c, option_d, correct_option, question_order
       FROM module_quizzes
       WHERE module_id = ?
       ORDER BY question_order ASC, id ASC`,
      [moduleId]
    );

    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Save assessment questions. Admin must send at least 3 questions.
router.post('/modules/:moduleId/quiz', auth, async (req, res) => {
  const { moduleId } = req.params;
  const { title, questions } = req.body;

  if (!Array.isArray(questions) || questions.length < 3) {
    return res.status(400).json({
      msg: 'Assessment must have at least 3 questions.',
    });
  }

  const cleanQuestions = questions.map((q, index) => ({
    title: title || q.title || 'Section Assessment',
    question: String(q.question || '').trim(),
    option_a: String(q.option_a || '').trim(),
    option_b: String(q.option_b || '').trim(),
    option_c: String(q.option_c || '').trim(),
    option_d: String(q.option_d || '').trim(),
    correct_option: String(q.correct_option || '').toUpperCase().trim(),
    question_order: index + 1,
  }));

  const invalid = cleanQuestions.some(
    (q) =>
      !q.question ||
      !q.option_a ||
      !q.option_b ||
      !['A', 'B', 'C', 'D'].includes(q.correct_option)
  );

  if (invalid) {
    return res.status(400).json({
      msg: 'Each question must have a question, option A, option B, and correct answer A/B/C/D.',
    });
  }

  const connection = await pool.getConnection();

  try {
    await ensureLearningTables();

    await connection.beginTransaction();

    await connection.query('DELETE FROM module_quizzes WHERE module_id = ?', [moduleId]);

    for (const q of cleanQuestions) {
      await connection.query(
        `INSERT INTO module_quizzes
         (module_id, title, question, option_a, option_b, option_c, option_d, correct_option, question_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          moduleId,
          q.title,
          q.question,
          q.option_a,
          q.option_b,
          q.option_c || null,
          q.option_d || null,
          q.correct_option,
          q.question_order,
        ]
      );
    }

    await connection.commit();

    const [savedQuestions] = await pool.query(
      `SELECT id, module_id, title, question, option_a, option_b, option_c, option_d, correct_option, question_order
       FROM module_quizzes
       WHERE module_id = ?
       ORDER BY question_order ASC, id ASC`,
      [moduleId]
    );

    res.json({
      msg: 'Assessment saved successfully',
      questions: savedQuestions,
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  } finally {
    connection.release();
  }
});

// Delete one assessment question
router.delete('/quiz/:questionId', auth, async (req, res) => {
  const { questionId } = req.params;

  try {
    await ensureLearningTables();

    await pool.query('DELETE FROM module_quizzes WHERE id = ?', [questionId]);

    res.json({ msg: 'Assessment question deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* =========================
   COMPLETIONS
========================= */

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