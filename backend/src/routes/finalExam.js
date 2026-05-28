const express = require('express');
const crypto = require('crypto');
const pool = require('../db');
const auth = require('../middleware/auth');
const studentAuth = require('../middleware/studentAuth');

const router = express.Router();

function makeCertificateCode() {
  return `STK-${new Date().getFullYear()}-${crypto
    .randomBytes(4)
    .toString('hex')
    .toUpperCase()}`;
}

async function ensureFinalExamColumns() {
  const [submissionColumns] = await pool.query(`
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'final_exam_submissions'
      AND COLUMN_NAME = 'retake_allowed'
  `);

  if (submissionColumns.length === 0) {
    await pool.query(`
      ALTER TABLE final_exam_submissions
      ADD COLUMN retake_allowed TINYINT(1) NOT NULL DEFAULT 0
    `);
  }

  const [certificateColumns] = await pool.query(`
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'student_certificates'
      AND COLUMN_NAME = 'assigned_by_admin'
  `);

  if (certificateColumns.length === 0) {
    await pool.query(`
      ALTER TABLE student_certificates
      ADD COLUMN assigned_by_admin TINYINT(1) NOT NULL DEFAULT 1
    `);
  }
}

/* ADMIN: Save final exam questions */
router.post('/courses/:courseId/questions', auth, async (req, res) => {
  const { courseId } = req.params;
  const { questions } = req.body;

  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ msg: 'Please add exam questions.' });
  }

  const clean = questions.map((q, index) => ({
    question_type: q.question_type || 'mcq',
    question: String(q.question || '').trim(),
    option_a: q.option_a || null,
    option_b: q.option_b || null,
    option_c: q.option_c || null,
    option_d: q.option_d || null,
    correct_option:
      q.question_type === 'mcq'
        ? String(q.correct_option || '').toUpperCase()
        : null,
    marks: Number(q.marks || 1),
    question_order: index + 1,
  }));

  const invalid = clean.some((q) => {
    if (!q.question) return true;
    if (q.question_type === 'mcq') {
      return (
        !q.option_a ||
        !q.option_b ||
        !['A', 'B', 'C', 'D'].includes(q.correct_option)
      );
    }
    return false;
  });

  if (invalid) {
    return res.status(400).json({
      msg: 'MCQ needs question, option A, option B, and correct answer.',
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      'DELETE FROM final_exam_questions WHERE course_id = ?',
      [courseId]
    );

    for (const q of clean) {
      await connection.query(
        `INSERT INTO final_exam_questions
         (course_id, question_type, question, option_a, option_b, option_c, option_d, correct_option, marks, question_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          courseId,
          q.question_type,
          q.question,
          q.option_a,
          q.option_b,
          q.option_c,
          q.option_d,
          q.correct_option,
          q.marks,
          q.question_order,
        ]
      );
    }

    await connection.commit();
    res.json({ msg: 'Final exam saved successfully.' });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  } finally {
    connection.release();
  }
});

/* ADMIN: Get final exam questions */
router.get('/courses/:courseId/questions', auth, async (req, res) => {
  const { courseId } = req.params;

  try {
    const [questions] = await pool.query(
      `SELECT *
       FROM final_exam_questions
       WHERE course_id = ?
       ORDER BY question_order ASC, id ASC`,
      [courseId]
    );

    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* STUDENT: Get final exam */
router.get('/courses/:courseId/take', studentAuth, async (req, res) => {
  const { courseId } = req.params;

  try {
    await ensureFinalExamColumns();

    const [[progress]] = await pool.query(
      `SELECT COUNT(m.id) AS total_modules,
              COUNT(mc.id) AS completed_modules
       FROM modules m
       LEFT JOIN module_completions mc
         ON mc.module_id = m.id
        AND mc.student_id = ?
       WHERE m.course_id = ?`,
      [req.student.id, courseId]
    );

    if (Number(progress.total_modules) === 0) {
      return res.status(400).json({ msg: 'This course has no sections.' });
    }

    if (Number(progress.completed_modules) < Number(progress.total_modules)) {
      return res.status(403).json({
        msg: 'Complete all course sections before taking the final exam.',
      });
    }

    const [[existingSubmission]] = await pool.query(
      `SELECT id, status, retake_allowed
       FROM final_exam_submissions
       WHERE student_id = ? AND course_id = ?
       ORDER BY submitted_at DESC
       LIMIT 1`,
      [req.student.id, courseId]
    );

    if (existingSubmission && Number(existingSubmission.retake_allowed) !== 1) {
      return res.status(403).json({
        msg:
          existingSubmission.status === 'approved'
            ? 'You already passed this final exam.'
            : 'You already submitted this final exam. Wait for admin review or re-exam permission.',
      });
    }

    const [questions] = await pool.query(
      `SELECT id, question_type, question, option_a, option_b, option_c, option_d, marks, question_order
       FROM final_exam_questions
       WHERE course_id = ?
       ORDER BY question_order ASC, id ASC`,
      [courseId]
    );

    if (questions.length === 0) {
      return res.status(400).json({ msg: 'Final exam is not ready yet.' });
    }

    res.json({ questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* STUDENT: Submit final exam */
router.post('/courses/:courseId/submit', studentAuth, async (req, res) => {
  const { courseId } = req.params;
  const { answers } = req.body;

  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ msg: 'Please answer the exam questions.' });
  }

  const connection = await pool.getConnection();

  try {
    await ensureFinalExamColumns();

    const [[existingSubmission]] = await connection.query(
      `SELECT id, status, retake_allowed
       FROM final_exam_submissions
       WHERE student_id = ? AND course_id = ?
       ORDER BY submitted_at DESC
       LIMIT 1`,
      [req.student.id, courseId]
    );

    if (existingSubmission && Number(existingSubmission.retake_allowed) !== 1) {
      return res.status(403).json({
        msg: 'You already submitted this final exam. Wait for admin review or re-exam permission.',
      });
    }

    const [questions] = await connection.query(
      `SELECT *
       FROM final_exam_questions
       WHERE course_id = ?
       ORDER BY question_order ASC, id ASC`,
      [courseId]
    );

    if (questions.length === 0) {
      return res.status(400).json({ msg: 'Final exam is not ready yet.' });
    }

    let autoScore = 0;
    let hasOpenQuestion = false;

    await connection.beginTransaction();

    await connection.query(
      `UPDATE final_exam_submissions
       SET retake_allowed = 0
       WHERE student_id = ? AND course_id = ?`,
      [req.student.id, courseId]
    );

    const [submissionResult] = await connection.query(
      `INSERT INTO final_exam_submissions
       (student_id, course_id, status, auto_score, manual_score, total_score, submitted_at, retake_allowed)
       VALUES (?, ?, 'pending_review', 0, 0, 0, NOW(), 0)`,
      [req.student.id, courseId]
    );

    const submissionId = submissionResult.insertId;

    for (const q of questions) {
      const answerValue = answers[q.id];

      if (q.question_type === 'mcq') {
        const selected = String(answerValue || '').toUpperCase();
        const correct =
          selected === String(q.correct_option || '').toUpperCase();
        const marksAwarded = correct ? Number(q.marks || 1) : 0;

        autoScore += marksAwarded;

        await connection.query(
          `INSERT INTO final_exam_answers
           (submission_id, question_id, selected_option, answer_text, is_correct, marks_awarded)
           VALUES (?, ?, ?, NULL, ?, ?)`,
          [submissionId, q.id, selected || null, correct ? 1 : 0, marksAwarded]
        );
      } else {
        hasOpenQuestion = true;

        await connection.query(
          `INSERT INTO final_exam_answers
           (submission_id, question_id, selected_option, answer_text, is_correct, marks_awarded)
           VALUES (?, ?, NULL, ?, NULL, 0)`,
          [submissionId, q.id, String(answerValue || '').trim()]
        );
      }
    }

    await connection.query(
      `UPDATE final_exam_submissions
       SET auto_score = ?, total_score = ?
       WHERE id = ?`,
      [autoScore, autoScore, submissionId]
    );

    await connection.commit();

    res.json({
      msg: hasOpenQuestion
        ? 'Exam submitted. Your open questions are waiting for admin review.'
        : 'Exam submitted. Waiting for admin approval.',
      submission_id: submissionId,
      status: 'pending_review',
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  } finally {
    connection.release();
  }
});

/* ADMIN: submissions waiting review */
router.get('/submissions', auth, async (req, res) => {
  try {
    await ensureFinalExamColumns();

    const [rows] = await pool.query(
      `SELECT fs.*,
              s.full_name AS student_name,
              s.email AS student_email,
              c.name AS course_name,
              sc.id AS certificate_id,
              sc.certificate_code
       FROM final_exam_submissions fs
       JOIN students s ON s.id = fs.student_id
       JOIN courses c ON c.id = fs.course_id
       LEFT JOIN student_certificates sc ON sc.submission_id = fs.id
       ORDER BY fs.submitted_at DESC`
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* ADMIN: read one submission with answers */
router.get('/submissions/:submissionId', auth, async (req, res) => {
  const { submissionId } = req.params;

  try {
    const [[submission]] = await pool.query(
      `SELECT fs.*,
              s.full_name AS student_name,
              s.email AS student_email,
              c.name AS course_name,
              sc.id AS certificate_id,
              sc.certificate_code
       FROM final_exam_submissions fs
       JOIN students s ON s.id = fs.student_id
       JOIN courses c ON c.id = fs.course_id
       LEFT JOIN student_certificates sc ON sc.submission_id = fs.id
       WHERE fs.id = ?`,
      [submissionId]
    );

    if (!submission) {
      return res.status(404).json({ msg: 'Submission not found' });
    }

    const [answers] = await pool.query(
      `SELECT fea.*,
              q.question_type,
              q.question,
              q.option_a,
              q.option_b,
              q.option_c,
              q.option_d,
              q.correct_option,
              q.marks
       FROM final_exam_answers fea
       JOIN final_exam_questions q ON q.id = fea.question_id
       WHERE fea.submission_id = ?
       ORDER BY q.question_order ASC, q.id ASC`,
      [submissionId]
    );

    res.json({ submission, answers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* ADMIN: review submission only - NO automatic certificate */
router.post('/submissions/:submissionId/review', auth, async (req, res) => {
  const { submissionId } = req.params;
  const { manual_scores, admin_comment } = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [[submission]] = await connection.query(
      'SELECT * FROM final_exam_submissions WHERE id = ?',
      [submissionId]
    );

    if (!submission) {
      await connection.rollback();
      return res.status(404).json({ msg: 'Submission not found' });
    }

    const [answers] = await connection.query(
      `SELECT fea.id AS answer_id, fea.marks_awarded, q.question_type, q.marks
       FROM final_exam_answers fea
       JOIN final_exam_questions q ON q.id = fea.question_id
       WHERE fea.submission_id = ?`,
      [submissionId]
    );

    let manualScore = 0;
    let maxScore = 0;

    for (const a of answers) {
      maxScore += Number(a.marks || 1);

      if (a.question_type === 'open') {
        const score = Number(manual_scores?.[a.answer_id] || 0);
        const safeScore = Math.min(score, Number(a.marks || 1));
        manualScore += safeScore;

        await connection.query(
          'UPDATE final_exam_answers SET marks_awarded = ? WHERE id = ?',
          [safeScore, a.answer_id]
        );
      }
    }

    const autoScore = Number(submission.auto_score || 0);
    const totalScoreMarks = autoScore + manualScore;
    const percentScore =
      maxScore > 0 ? Math.round((totalScoreMarks / maxScore) * 100) : 0;
    const passed = percentScore >= 80;

    await connection.query(
      `UPDATE final_exam_submissions
       SET manual_score = ?, total_score = ?, status = ?, reviewed_at = NOW(), reviewed_by = ?, admin_comment = ?, retake_allowed = 0
       WHERE id = ?`,
      [
        manualScore,
        percentScore,
        passed ? 'approved' : 'rejected',
        req.admin.id || null,
        admin_comment || null,
        submissionId,
      ]
    );

    await connection.commit();

    res.json({
      msg: passed
        ? 'Exam reviewed. Student is competent. You can now assign certificate.'
        : 'Exam reviewed. Student failed. You can allow re-exam.',
      passed,
      score: percentScore,
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  } finally {
    connection.release();
  }
});

/* ADMIN: allow re-exam only for failed student */
router.post('/submissions/:submissionId/allow-retake', auth, async (req, res) => {
  const { submissionId } = req.params;

  try {
    await ensureFinalExamColumns();

    const [[submission]] = await pool.query(
      `SELECT * FROM final_exam_submissions WHERE id = ?`,
      [submissionId]
    );

    if (!submission) {
      return res.status(404).json({ msg: 'Submission not found' });
    }

    if (submission.status !== 'rejected') {
      return res.status(400).json({
        msg: 'Re-exam can only be allowed for failed students.',
      });
    }

    await pool.query(
      `UPDATE final_exam_submissions
       SET retake_allowed = 1
       WHERE id = ?`,
      [submissionId]
    );

    res.json({ msg: 'Re-exam allowed for this student.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* ADMIN: assign certificate manually */
router.post(
  '/submissions/:submissionId/assign-certificate',
  auth,
  async (req, res) => {
    const { submissionId } = req.params;
    const connection = await pool.getConnection();

    try {
      await ensureFinalExamColumns();
      await connection.beginTransaction();

      const [[submission]] = await connection.query(
        `SELECT * FROM final_exam_submissions WHERE id = ?`,
        [submissionId]
      );

      if (!submission) {
        await connection.rollback();
        return res.status(404).json({ msg: 'Submission not found' });
      }

      if (submission.status !== 'approved' || Number(submission.total_score) < 80) {
        await connection.rollback();
        return res.status(400).json({
          msg: 'Certificate can only be assigned to competent students.',
        });
      }

      const certificateCode = makeCertificateCode();

      await connection.query(
        `INSERT INTO student_certificates
         (student_id, course_id, submission_id, certificate_code, status, issued_at, assigned_by_admin)
         VALUES (?, ?, ?, ?, 'verified', NOW(), 1)
         ON DUPLICATE KEY UPDATE
           submission_id = VALUES(submission_id),
           certificate_code = VALUES(certificate_code),
           status = 'verified',
           issued_at = NOW(),
           assigned_by_admin = 1`,
        [
          submission.student_id,
          submission.course_id,
          submissionId,
          certificateCode,
        ]
      );

      const [[certificate]] = await connection.query(
        `SELECT * FROM student_certificates WHERE student_id = ? AND course_id = ?`,
        [submission.student_id, submission.course_id]
      );

      await connection.commit();

      res.json({
        msg: 'Certificate assigned successfully.',
        certificate,
      });
    } catch (err) {
      await connection.rollback();
      console.error(err);
      res.status(500).json({ msg: 'Server error' });
    } finally {
      connection.release();
    }
  }
);

/* STUDENT: my certificates */
router.get('/certificates/my', studentAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sc.*, c.name AS course_name, s.full_name AS student_name
       FROM student_certificates sc
       JOIN courses c ON c.id = sc.course_id
       JOIN students s ON s.id = sc.student_id
       WHERE sc.student_id = ?
       ORDER BY sc.issued_at DESC`,
      [req.student.id]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

/* PUBLIC: verify certificate by QR code */
router.get('/certificates/verify/:certificateCode', async (req, res) => {
  const { certificateCode } = req.params;

  try {
    const [[cert]] = await pool.query(
      `SELECT sc.certificate_code,
              sc.status,
              sc.issued_at,
              c.name AS course_name,
              s.full_name AS student_name
       FROM student_certificates sc
       JOIN courses c ON c.id = sc.course_id
       JOIN students s ON s.id = sc.student_id
       WHERE sc.certificate_code = ?`,
      [certificateCode]
    );

    if (!cert) {
      return res.status(404).json({ msg: 'Certificate not found' });
    }

    res.json({
      ...cert,
      company_name: 'Stekora Tech Academy',
      verified: cert.status === 'verified',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;