const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes here require admin auth
router.use(auth);

/* =========================
   ADMIN OVERVIEW
   GET /api/admin/overview
========================= */
router.get('/overview', async (req, res) => {
  try {
    const [[studentsCount]] = await pool.query(
      'SELECT COUNT(*) AS total_students FROM students'
    );
    const [[coursesCount]] = await pool.query(
      'SELECT COUNT(*) AS total_courses FROM courses'
    );
    const [[materialsCount]] = await pool.query(
      'SELECT COUNT(*) AS total_materials FROM materials'
    );

    const [recentStudents] = await pool.query(
      `SELECT s.id, s.full_name, s.email, s.created_at, c.name AS course_name
       FROM students s
       LEFT JOIN courses c ON c.id = s.course_id
       ORDER BY s.created_at DESC
       LIMIT 5`
    );

    res.json({
      totals: {
        students: studentsCount.total_students || 0,
        courses: coursesCount.total_courses || 0,
        materials: materialsCount.total_materials || 0,
      },
      recentStudents,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;

