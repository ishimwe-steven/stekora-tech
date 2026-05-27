import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

  const allCourses = data?.courses || [];

  const studentName =
    data?.student?.name ||
    data?.student?.full_name ||
    data?.student?.names ||
    data?.student?.username ||
    localStorage.getItem('studentName') ||
    'Student';

  const courseGrade = (course) =>
    course.modules_count > 0
      ? Math.round((course.completed_modules / course.modules_count) * 100)
      : 0;

  const nextModuleFor = (course) =>
    course.modules?.find((module) => !module.completed) || course.modules?.[0];

  const hasModules = (course) =>
    Number(course.modules_count) > 0 || (course.modules && course.modules.length > 0);

  const startCourse = async () => {
    if (!confirmCourse) return;

    const firstModule = nextModuleFor(confirmCourse);

    try {
      setStartingCourse(true);
      await api.post(`/students/courses/${confirmCourse.id}/start`);
      setConfirmCourse(null);

      if (firstModule) {
        navigate(`/student/course/${confirmCourse.id}/module/${firstModule.id}`);
        return;
      }

      await loadDashboard();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Failed to start course');
    } finally {
      setStartingCourse(false);
    }
  };

  return (
    <>
      <style>{`
        :root {
          --richblue: #003366;
          --palegray: #f5f5f5;
          --sidebar: #1f2f45;
          --line: #d8dee8;
          --cyan: #22d3ee;
          --blue: #3b82f6;
          --green: #16a34a;
          --orange: #f59e0b;
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

        .student-welcome {
          color: var(--text-dark);
          font-weight: 900;
        }

        .student-name {
          color: var(--richblue);
          font-weight: 900;
        }

        .dashboard-content {
          padding: 1.7rem;
        }

        .dashboard-sub {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin: 0 0 1.5rem;
        }

        .courses-title {
          margin: 0 0 1.35rem;
          color: var(--richblue);
          font-size: 1.45rem;
          font-weight: 900;
        }

        .student-courses-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1rem;
        }

        .student-course-card {
          min-height: 20.3rem;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border-radius: 0.5rem;
          background: #17263a;
          border: 1px solid rgba(0, 51, 102, 0.12);
          box-shadow: 0 10px 24px rgba(0, 51, 102, 0.08);
        }

        .student-course-media {
          position: relative;
          height: 9.7rem;
          background:
            linear-gradient(135deg, rgba(0, 51, 102, 0.18), rgba(0, 31, 63, 0.78)),
            #10233a;
          overflow: hidden;
        }

        .student-course-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.78;
        }

        .student-course-badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
          border-radius: 0.25rem;
          background: var(--cyan);
          color: #001f3f;
          font-size: 0.78rem;
          font-weight: 900;
          padding: 0.36rem 0.5rem;
        }

        .student-course-body {
          flex: 1;
          padding: 1rem 1rem 1.15rem;
        }

        .student-course-meta {
          display: flex;
          gap: 0.65rem;
          flex-wrap: wrap;
          color: #b8c8e6;
          font-size: 0.74rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .student-course-name {
          margin: 0.55rem 0 0;
          color: #ffffff;
          font-size: 1.12rem;
          line-height: 1.2;
          font-weight: 900;
        }

        .student-course-footer {
          min-height: 4.2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.7rem;
          padding: 0.85rem 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          color: #b8c8e6;
        }

        .student-course-progress {
          flex: 1;
          height: 0.38rem;
          border-radius: 999px;
          background: rgba(184, 200, 230, 0.25);
          overflow: hidden;
        }

        .student-course-progress span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: var(--cyan);
        }

        .student-course-grade {
          min-width: 2.3rem;
          font-weight: 900;
          color: #b8c8e6;
          font-size: 0.72rem;
        }

        .student-course-start,
        .student-course-continue,
        .student-course-waiting {
          border: none;
          border-radius: 999px;
          color: #ffffff;
          cursor: pointer;
          font-size: 0.72rem;
          font-weight: 900;
          padding: 0.45rem 0.75rem;
          text-decoration: none;
          white-space: nowrap;
        }

        .student-course-start {
          background: var(--blue);
        }

        .student-course-continue {
          background: var(--green);
        }

        .student-course-waiting {
          background: var(--orange);
          cursor: not-allowed;
          color: #111827;
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

          .student-courses-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (min-width: 769px) and (max-width: 1180px) {
          .student-courses-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>

      <div className="dashboard-page">
        <aside className="dashboard-sidebar">
          <h2>Student Account</h2>

          <div className="dashboard-menu">
            <span className="active">All Courses</span>
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
            <div className="student-welcome">
              Welcome, <span className="student-name">{studentName}</span>
            </div>
            <div style={{ color: '#475569', fontSize: '0.8rem' }}>
              Student Account
            </div>
          </header>

          <div className="dashboard-content">
            {loading && <p className="dashboard-sub">Loading dashboard...</p>}
            {error && !loading && <p className="dashboard-sub">{error}</p>}

            {data && (
              <section className="courses-section">
                <h1 className="courses-title">All Courses</h1>

                <div className="student-courses-grid">
                  {allCourses.map((course) => {
                    const grade = courseGrade(course);
                    const nextModule = nextModuleFor(course);
                    const modulesAvailable = hasModules(course);

                    const statusLabel =
                      !modulesAvailable
                        ? 'Waiting'
                        : course.status === 'completed'
                          ? 'Completed'
                          : course.status === 'in_progress'
                            ? 'In Progress'
                            : 'Not Started';

                    return (
                      <article key={course.id} className="student-course-card">
                        <div className="student-course-media">
                          {course.image_url && (
                            <img src={resolveImageUrl(course.image_url)} alt={course.name} />
                          )}

                          <span className="student-course-badge">
                            {statusLabel}
                          </span>
                        </div>

                        <div className="student-course-body">
                          <div className="student-course-meta">
                            <span>{course.category || 'Course'}</span>
                            <span>{course.modules_count || 0} modules</span>
                          </div>

                          <h2 className="student-course-name">{course.name}</h2>
                        </div>

                        <div className="student-course-footer">
                          <div className="student-course-progress" aria-hidden="true">
                            <span style={{ width: `${grade}%` }} />
                          </div>

                          <span className="student-course-grade">{grade}%</span>

                          {!modulesAvailable ? (
                            <button
                              type="button"
                              className="student-course-waiting"
                              disabled
                              title="Wait admin to upload the module"
                            >
                              Waiting
                            </button>
                          ) : course.status === 'not_started' ? (
                            <button
                              type="button"
                              className="student-course-start"
                              onClick={() => setConfirmCourse(course)}
                            >
                              Start
                            </button>
                          ) : (
                            nextModule && (
                              <Link
                                to={`/student/course/${course.id}/module/${nextModule.id}`}
                                className="student-course-continue"
                              >
                                Continue
                              </Link>
                            )
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>

                {allCourses.length === 0 && (
                  <p className="dashboard-sub">No courses have been posted yet.</p>
                )}
              </section>
            )}
          </div>
        </main>
      </div>

      {confirmCourse && (
        <div
          className="confirm-backdrop"
          role="presentation"
          onClick={() => setConfirmCourse(null)}
        >
          <div
            className="confirm-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Start this course?</h2>

            <p className="dashboard-sub" style={{ marginBottom: 0 }}>
              Do you want to start {confirmCourse.name}? It will be marked in progress on your account.
            </p>

            <div className="confirm-actions">
              <button
                type="button"
                className="confirm-cancel"
                onClick={() => setConfirmCourse(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-start"
                onClick={startCourse}
                disabled={startingCourse}
              >
                {startingCourse ? 'Starting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}