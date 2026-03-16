const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const studentAuth = require('../middleware/studentAuth');

const router = express.Router();

/* =========================
   STUDENT REGISTRATION
   POST /api/students/register
========================= */
router.post('/register', async (req, res) => {
  const { full_name, email, phone, password, course_id } = req.body;

  if (!full_name || !email || !phone || !password || !course_id) {
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
      [full_name, email, phone, hashedPassword, course_id]
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

    const [[studentRow]] = await pool.query(
      'SELECT id, full_name, email, course_id FROM students WHERE id = ?',
      [id]
    );
    if (!studentRow) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    let course = null;
    if (course_id) {
      const [courseRows] = await pool.query(
        'SELECT id, name, description FROM courses WHERE id = ?',
        [course_id]
      );
      course = courseRows[0] || null;
    }

    // Load modules and materials for this course
    let modules = [];
    if (course) {
      const [rows] = await pool.query(
        `SELECT 
           m.id AS module_id,
           m.title AS module_title,
           mat.id AS material_id,
           mat.title AS material_title,
           mat.type AS material_type,
           mat.file_url AS material_url
         FROM modules m
         LEFT JOIN materials mat ON mat.module_id = m.id
         WHERE m.course_id = ?
         ORDER BY m.id ASC, mat.id ASC`,
        [course.id]
      );

      const map = new Map();
      for (const row of rows) {
        if (!map.has(row.module_id)) {
          map.set(row.module_id, {
            id: row.module_id,
            title: row.module_title,
            materials: [],
          });
        }
        if (row.material_id) {
          map.get(row.module_id).materials.push({
            id: row.material_id,
            title: row.material_title,
            type: row.material_type,
            file_url: row.material_url,
          });
        }
      }
      modules = Array.from(map.values());
    }

    res.json({
      student: {
        id: studentRow.id,
        full_name: studentRow.full_name,
        email: studentRow.email,
      },
      course,
      modules,
    });
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

    res.json({
      module: moduleRow,
      materials,
    });
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

