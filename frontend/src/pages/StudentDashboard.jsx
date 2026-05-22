import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmCourse, setConfirmCourse] = useState(null);
  const [startingCourse, setStartingCourse] = useState(false);

  const resolveImageUrl = (url) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    const base = api.defaults.baseURL.replace(/\/api\/?$/, '');
    return `${base}${url}`;
  };

  async function loadDashboard() {
    const token = localStorage.getItem('studentToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.get('/students/dashboard');
      setData(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, [navigate]);

  const startCourse = async () => {
    if (!confirmCourse) return;
    try {
      setStartingCourse(true);
      await api.post(`/students/courses/${confirmCourse.id}/start`);
      setConfirmCourse(null);
      await loadDashboard();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Failed to start course');
    } finally {
      setStartingCourse(false);
    }
  };

  const firstOpenModule = (course) =>
    course.modules.find((module) => !module.completed) || course.modules[0];

  return (
    <>
      <style>{`
        :root {
          --richblue: #003366;
          --palegray: #f5f5f5;
          --sidebar: #1f2f45;
          --line: #d8dee8;
          --cyan: #22d3ee;
          --text-dark: #07152c;
          --text-muted: #64748b;
        }

        .dashboard-page {
          min-height: 100vh;
          background: var(--palegray);
          display: flex;
        }

        .dashboard-sidebar {
          width: 240px;
          background: var(--sidebar);
          color: #ffffff;
          padding: 0;
          display: flex;
          flex-direction: column;
          border-right: 1px solid rgba(255,255,255,0.08);
        }

        .dashboard-sidebar h2 {
          font-size: 1rem;
          font-weight: 800;
          margin: 0;
          padding: 1.45rem 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.12);
        }

        .dashboard-menu {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          font-size: 0.85rem;
          padding: 1rem 0.7rem;
        }

        .dashboard-menu span {
          padding: 0.62rem 0.6rem;
          border-radius: 0.35rem;
          cursor: default;
          font-weight: 600;
        }

        .dashboard-menu span.active {
          background: rgba(255,255,255,0.14);
          color: #ffffff;
        }

        .dashboard-main {
          flex: 1;
          min-width: 0;
        }

        .dashboard-topbar {
          height: 62px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.7rem;
          background: #ffffff;
          border-bottom: 1px solid var(--line);
        }

        .dashboard-content {
          padding: 1.7rem;
        }

        .dashboard-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--richblue);
          margin: 0 0 0.75rem;
        }

        .dashboard-sub {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin: 0 0 1.5rem;
        }

        .dashboard-panel {
          background: #ffffff;
          border: 1px solid var(--line);
          border-radius: 0.5rem;
          padding: 1.5rem;
          margin-bottom: 1.3rem;
        }

        .course-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }

        .course-card {
          background: #ffffff;
          border-radius: 0.5rem;
          border: 1px solid var(--line);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          min-height: 100%;
        }

        .course-image {
          width: 100%;
          aspect-ratio: 16 / 9;
          object-fit: cover;
          background: #e8eef6;
        }

        .course-card-body {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          flex: 1;
        }

        .course-name {
          font-size: 1rem;
          font-weight: 800;
          color: var(--richblue);
        }

        .course-description {
          color: var(--text-muted);
          font-size: 0.83rem;
          line-height: 1.5;
          margin: 0;
        }

        .course-status {
          font-size: 0.78rem;
          color: #0f766e;
          font-weight: 800;
        }

        .course-progress {
          height: 0.45rem;
          background: #e5e7eb;
          border-radius: 999px;
          overflow: hidden;
        }

        .course-progress span {
          display: block;
          height: 100%;
          background: var(--cyan);
        }

        .course-action,
        .module-link {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          align-self: flex-start;
          margin-top: auto;
          font-size: 0.8rem;
          color: #ffffff;
          background: var(--richblue);
          text-decoration: none;
          border: none;
          border-radius: 999px;
          padding: 0.55rem 0.9rem;
          font-weight: 800;
          cursor: pointer;
        }

        .course-action:hover,
        .module-link:hover {
          background: var(--cyan);
          color: #001f3f;
        }

        .module-list {
          display: grid;
          gap: 0.45rem;
          margin-top: 0.35rem;
        }

        .module-row {
          display: flex;
          justify-content: space-between;
          gap: 0.7rem;
          color: #334155;
          font-size: 0.8rem;
          border-top: 1px solid #edf1f7;
          padding-top: 0.45rem;
        }

        .confirm-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(7, 21, 44, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          z-index: 50;
        }

        .confirm-modal {
          width: min(420px, 100%);
          background: #ffffff;
          border-radius: 0.5rem;
          padding: 1.25rem;
          border: 1px solid var(--line);
        }

        .confirm-modal h2 {
          margin: 0 0 0.5rem;
          color: var(--richblue);
          font-size: 1.1rem;
        }

        .confirm-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.65rem;
          margin-top: 1rem;
        }

        .confirm-actions button {
          border-radius: 999px;
          padding: 0.6rem 0.9rem;
          font-weight: 800;
          cursor: pointer;
        }

        .confirm-cancel {
          border: 1px solid var(--line);
          background: #ffffff;
          color: var(--text-dark);
        }

        .confirm-start {
          border: none;
          background: var(--richblue);
          color: #ffffff;
        }

        @media (max-width: 768px) {
          .dashboard-page {
            flex-direction: column;
          }

          .dashboard-sidebar {
            width: 100%;
          }

          .dashboard-topbar,
          .dashboard-content {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }
      `}</style>

      <div className="dashboard-page">
        <aside className="dashboard-sidebar">
          <h2>Student Account</h2>
          <div className="dashboard-menu">
            <span className="active">My Courses</span>
            <span>Profile</span>
            <span>Support</span>
            <span
              onClick={() => {
                localStorage.removeItem('studentToken');
                localStorage.removeItem('studentName');
                localStorage.removeItem('studentCourseName');
                navigate('/login');
              }}
              style={{ cursor: 'pointer' }}
            >
              Logout
            </span>
          </div>
        </aside>

        <main className="dashboard-main">
          <header className="dashboard-topbar">
            <div style={{ color: 'var(--text-dark)', fontWeight: 800 }}>My Courses</div>
            <div style={{ color: '#475569', fontSize: '0.8rem' }}>Student Account</div>
          </header>

          <div className="dashboard-content">
            {loading && <p className="dashboard-sub">Loading dashboard...</p>}
            {error && !loading && <p className="dashboard-sub">{error}</p>}

            {data && (
              <>
                <div className="dashboard-panel">
                  <h1 className="dashboard-title">Welcome, {data.student.full_name}</h1>
                  <p className="dashboard-sub">
                    Choose a course, confirm when you are ready to begin, then keep learning until every unit is done.
                  </p>
                </div>

                <div className="course-list">
                  {(data.courses || []).map((course) => {
                    const progress =
                      course.modules_count > 0
                        ? Math.round((course.completed_modules / course.modules_count) * 100)
                        : 0;
                    const openModule = firstOpenModule(course);

                    return (
                      <article key={course.id} className="course-card">
                        {course.image_url ? (
                          <img className="course-image" src={resolveImageUrl(course.image_url)} alt="" />
                        ) : (
                          <div className="course-image" />
                        )}
                        <div className="course-card-body">
                          <div className="course-name">{course.name}</div>
                          <p className="course-description">
                            {course.description || 'A practical Stekora Tech course with guided learning units.'}
                          </p>
                          <div className="course-status">
                            {course.status === 'completed'
                              ? 'Completed'
                              : course.status === 'in_progress'
                                ? 'In progress'
                                : 'Not started'}
                          </div>
                          <div className="course-progress" aria-hidden="true">
                            <span style={{ width: `${progress}%` }} />
                          </div>
                          <div className="course-description">
                            {course.completed_modules} of {course.modules_count} units completed
                          </div>

                          {course.status === 'not_started' && (
                            <button
                              type="button"
                              className="course-action"
                              onClick={() => setConfirmCourse(course)}
                            >
                              Start
                            </button>
                          )}

                          {course.status !== 'not_started' && (
                            <>
                              <div className="module-list">
                                {course.modules.slice(0, 3).map((module) => (
                                  <div key={module.id} className="module-row">
                                    <span>{module.title}</span>
                                    <span>{module.completed ? 'Done' : `${module.materials_count} materials`}</span>
                                  </div>
                                ))}
                              </div>
                              {openModule && (
                                <Link
                                  to={`/student/course/${course.id}/module/${openModule.id}`}
                                  className="module-link"
                                >
                                  {course.status === 'completed' ? 'Review' : 'Continue'}
                                </Link>
                              )}
                            </>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {confirmCourse && (
        <div className="confirm-backdrop" role="presentation" onClick={() => setConfirmCourse(null)}>
          <div className="confirm-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h2>Start this course?</h2>
            <p className="dashboard-sub" style={{ marginBottom: 0 }}>
              Do you want to start {confirmCourse.name}? It will be marked in progress on your account.
            </p>
            <div className="confirm-actions">
              <button type="button" className="confirm-cancel" onClick={() => setConfirmCourse(null)}>
                Cancel
              </button>
              <button type="button" className="confirm-start" onClick={startCourse} disabled={startingCourse}>
                {startingCourse ? 'Starting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
