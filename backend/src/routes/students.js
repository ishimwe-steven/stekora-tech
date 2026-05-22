const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const studentAuth = require('../middleware/studentAuth');

const router = express.Router();

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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS student_courses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      course_id INT NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'in_progress',
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME NULL,
      UNIQUE KEY unique_student_course (student_id, course_id)
    )
  `);
}

async function ensureCourseImageColumn() {
  const [columns] = await pool.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'courses'
       AND COLUMN_NAME = 'image_url'`
  );

  if (columns.length === 0) {
    await pool.query('ALTER TABLE courses ADD COLUMN image_url VARCHAR(500) NULL');
  }
}

async function syncLegacyStudentCourse(studentId, courseId) {
  if (!courseId) return;
  await ensureLearningTables();
  await pool.query(
    `INSERT IGNORE INTO student_courses (student_id, course_id, status, started_at)
     VALUES (?, ?, 'in_progress', NOW())`,
    [studentId, courseId]
  );
}

async function updateCourseProgressStatus(studentId, courseId) {
  const [[progress]] = await pool.query(
    `SELECT COUNT(m.id) AS total_modules,
            COUNT(mc.id) AS completed_modules
     FROM modules m
     LEFT JOIN module_completions mc
       ON mc.module_id = m.id
      AND mc.student_id = ?
     WHERE m.course_id = ?`,
    [studentId, courseId]
  );

  const total = Number(progress.total_modules || 0);
  const completed = Number(progress.completed_modules || 0);
  const done = total > 0 && completed >= total;

  await pool.query(
    `UPDATE student_courses
     SET status = ?, completed_at = CASE WHEN ? THEN COALESCE(completed_at, NOW()) ELSE NULL END
     WHERE student_id = ? AND course_id = ?`,
    [done ? 'completed' : 'in_progress', done, studentId, courseId]
  );
}

/* =========================
   STUDENT REGISTRATION
   POST /api/students/register
========================= */
router.post('/register', async (req, res) => {
  const { full_name, email, phone, password, course_id } = req.body;

  if (!full_name || !email || !phone || !password) {
    return res.status(400).json({ msg: 'Missing required fields' });
  }

  try {
    const [existing] = await pool.query(
      'SELECT id FROM students WHERE email = ?',
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ msg: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO students (full_name, email, phone, password, course_id, status, created_at) VALUES (?,?,?,?,?, "active", NOW())',
      [full_name, email, phone, hashedPassword, course_id || null]
    );

    res.status(201).json({ msg: 'Student registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* =========================
   STUDENT LOGIN
   POST /api/students/login
========================= */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Missing email or password' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM students WHERE email = ? AND status != "blocked"',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    const student = rows[0];
    const match = await bcrypt.compare(password, student.password);
    if (!match) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    const tokenPayload = {
      id: student.id,
      full_name: student.full_name,
      email: student.email,
      course_id: student.course_id,
      role: 'student',
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: '8h',
    });

    // fetch course name
    let course = null;
    if (student.course_id) {
      const [courses] = await pool.query(
        'SELECT id, name FROM courses WHERE id = ?',
        [student.course_id]
      );
      course = courses[0] || null;
    }

    res.json({
      token,
      student: {
        id: student.id,
        full_name: student.full_name,
        email: student.email,
        course,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* =========================
   STUDENT DASHBOARD DATA
   GET /api/students/dashboard
========================= */
router.get('/dashboard', studentAuth, async (req, res) => {
  try {
    const { id, course_id } = req.student;
    await ensureCourseImageColumn();
    await ensureLearningTables();
    await syncLegacyStudentCourse(id, course_id);

    const [[studentRow]] = await pool.query(
      'SELECT id, full_name, email, course_id FROM students WHERE id = ?',
      [id]
    );
    if (!studentRow) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    const [courseRows] = await pool.query(
      `SELECT c.id, c.name, c.description, c.image_url,
              sc.status, sc.started_at, sc.completed_at,
              COUNT(DISTINCT m.id) AS modules_count,
              COUNT(DISTINCT mc.id) AS completed_modules
       FROM courses c
       LEFT JOIN student_courses sc
         ON sc.course_id = c.id
        AND sc.student_id = ?
       LEFT JOIN modules m ON m.course_id = c.id
       LEFT JOIN module_completions mc
         ON mc.module_id = m.id
        AND mc.student_id = ?
       GROUP BY c.id, c.name, c.description, c.image_url, sc.id, sc.status, sc.started_at, sc.completed_at
       ORDER BY c.id ASC`,
      [id, id]
    );

    const startedCourseIds = courseRows
      .filter((item) => item.status)
      .map((item) => item.id);

    const modulesByCourse = new Map();
    if (startedCourseIds.length > 0) {
      const [rows] = await pool.query(
        `SELECT m.course_id,
                m.id AS module_id,
                m.title AS module_title,
                mc.id AS completion_id,
                COUNT(mat.id) AS materials_count
         FROM modules m
         LEFT JOIN materials mat ON mat.module_id = m.id
         LEFT JOIN module_completions mc
           ON mc.module_id = m.id
          AND mc.student_id = ?
         WHERE m.course_id IN (?)
         GROUP BY m.course_id, m.id, m.title, mc.id
         ORDER BY m.course_id ASC, m.id ASC`,
        [id, startedCourseIds]
      );

      for (const row of rows) {
        if (!modulesByCourse.has(row.course_id)) {
          modulesByCourse.set(row.course_id, []);
        }
        modulesByCourse.get(row.course_id).push({
          id: row.module_id,
          title: row.module_title,
          materials_count: Number(row.materials_count || 0),
          completed: Boolean(row.completion_id),
        });
      }
    }

    const courses = courseRows.map((item) => ({
      ...item,
      status: item.status || 'not_started',
      modules_count: Number(item.modules_count || 0),
      completed_modules: Number(item.completed_modules || 0),
      modules: modulesByCourse.get(item.id) || [],
    }));
    const course = courses.find((item) => item.status !== 'not_started') || null;
    const modules = course ? course.modules : [];

    res.json({
      student: {
        id: studentRow.id,
        full_name: studentRow.full_name,
        email: studentRow.email,
      },
      course,
      modules,
      courses,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/courses/:courseId/start', studentAuth, async (req, res) => {
  const { courseId } = req.params;

  try {
    await ensureLearningTables();
    const [[course]] = await pool.query(
      'SELECT id, name FROM courses WHERE id = ?',
      [courseId]
    );
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    await pool.query(
      `INSERT INTO student_courses (student_id, course_id, status, started_at)
       VALUES (?, ?, 'in_progress', NOW())
       ON DUPLICATE KEY UPDATE status = IF(status = 'completed', status, 'in_progress')`,
      [req.student.id, courseId]
    );

    res.json({ msg: 'Course started' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* =========================
   VIEW SINGLE MODULE MATERIALS
   GET /api/students/modules/:moduleId
========================= */
router.get('/modules/:moduleId', studentAuth, async (req, res) => {
  const { moduleId } = req.params;

  try {
    const [[moduleRow]] = await pool.query(
      'SELECT id, title, course_id FROM modules WHERE id = ?',
      [moduleId]
    );
    if (!moduleRow) {
      return res.status(404).json({ msg: 'Module not found' });
    }

    const [materials] = await pool.query(
      'SELECT id, title, type, file_url, created_at FROM materials WHERE module_id = ? ORDER BY id ASC',
      [moduleRow.id]
    );

    await ensureLearningTables();
    const [[completion]] = await pool.query(
      'SELECT id, created_at FROM module_completions WHERE student_id = ? AND module_id = ?',
      [req.student.id, moduleRow.id]
    );
    const [[quiz]] = await pool.query(
      `SELECT id, module_id, title, question, option_a, option_b, option_c, option_d
       FROM module_quizzes
       WHERE module_id = ?`,
      [moduleRow.id]
    );

    res.json({
      module: moduleRow,
      materials,
      completed: Boolean(completion),
      completion,
      quiz: quiz || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/modules/:moduleId/complete', studentAuth, async (req, res) => {
  const { moduleId } = req.params;

  try {
    await ensureLearningTables();
    const [[moduleRow]] = await pool.query(
      'SELECT id, course_id FROM modules WHERE id = ?',
      [moduleId]
    );
    if (!moduleRow) {
      return res.status(404).json({ msg: 'Module not found' });
    }

    await pool.query(
      'INSERT IGNORE INTO module_completions (student_id, module_id, created_at) VALUES (?, ?, NOW())',
      [req.student.id, moduleId]
    );
    await syncLegacyStudentCourse(req.student.id, moduleRow.course_id);
    await updateCourseProgressStatus(req.student.id, moduleRow.course_id);

    res.json({ msg: 'Unit marked as complete' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/modules/:moduleId/quiz/submit', studentAuth, async (req, res) => {
  const { moduleId } = req.params;
  const { answer } = req.body;

  try {
    await ensureLearningTables();
    const [[quiz]] = await pool.query(
      'SELECT correct_option FROM module_quizzes WHERE module_id = ?',
      [moduleId]
    );
    if (!quiz) {
      return res.status(404).json({ msg: 'No quiz found for this unit' });
    }

    const correct = String(answer || '').toUpperCase() === String(quiz.correct_option || '').toUpperCase();
    res.json({ correct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* =========================
   ADMIN STUDENT MANAGEMENT
   (Requires admin auth middleware, mounted separately)
   GET /api/students (list)
   PATCH /api/students/:id/status
========================= */
router.get('/', async (req, res) => {
  // this route is intended to be used with admin auth in index.js
  try {
    const [rows] = await pool.query(
      `SELECT s.id, s.full_name, s.email, s.phone, s.status,
              c.name AS course_name
       FROM students s
       LEFT JOIN courses c ON c.id = s.course_id
       ORDER BY s.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'blocked'].includes(status)) {
    return res.status(400).json({ msg: 'Invalid status' });
  }

  try {
    await pool.query('UPDATE students SET status = ? WHERE id = ?', [
      status,
      id,
    ]);
    res.json({ msg: 'Status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;

