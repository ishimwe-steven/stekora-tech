import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('studentToken');
    if (!token) {
      navigate('/login');
      return;
    }

    async function load() {
      try {
        const { data } = await api.get('/students/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setData(data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.msg || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);

  return (
    <>
      <style>{`
        :root {
          --richblue: #003366;
          --palegray: #f5f5f5;
          --sidebar: #0f172a;
        }

        .dashboard-page {
          min-height: 100vh;
          background: var(--palegray);
          display: flex;
        }

        .dashboard-sidebar {
          width: 230px;
          background: var(--sidebar);
          color: #e5e7eb;
          padding: 1.6rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .dashboard-sidebar h2 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
        }

        .dashboard-menu {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          font-size: 0.85rem;
        }

        .dashboard-menu span {
          padding: 0.4rem 0.5rem;
          border-radius: 0.4rem;
          cursor: default;
        }

        .dashboard-menu span.active {
          background: rgba(59,130,246,0.2);
          color: #bfdbfe;
        }

        .dashboard-main {
          flex: 1;
          padding: 2rem 1.5rem;
        }

        .dashboard-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--richblue);
          margin-bottom: 0.75rem;
        }

        .dashboard-sub {
          font-size: 0.9rem;
          color: #4b5563;
          margin-bottom: 1.5rem;
        }

        .course-list {
          display: grid;
          gap: 1rem;
        }

        @media (min-width: 768px) {
          .course-list {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        .course-card {
          background: #ffffff;
          border-radius: 1rem;
          padding: 1.2rem 1.4rem;
          box-shadow: 0 8px 20px rgba(0,0,0,0.04);
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .course-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--richblue);
        }

        .course-status {
          font-size: 0.8rem;
          color: #16a34a;
        }

        .course-meta {
          font-size: 0.78rem;
          color: #6b7280;
        }

        .module-link {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.8rem;
          color: #2563eb;
          text-decoration: none;
        }

        .module-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .dashboard-page {
            flex-direction: column;
          }

          .dashboard-sidebar {
            width: 100%;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
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
          {loading && <p className="dashboard-sub">Loading dashboard...</p>}
          {error && !loading && <p className="dashboard-sub">{error}</p>}

          {data && (
            <>
              <h1 className="dashboard-title">
                Welcome, {data.student.full_name}
              </h1>
              {data.course ? (
                <>
                  <p className="dashboard-sub">
                    Course: <strong>{data.course.name}</strong>
                  </p>
                  <p className="dashboard-sub">
                    Below are your modules and available materials.
                  </p>

                  <div className="course-list">
                    {data.modules.map((m) => (
                      <div key={m.id} className="course-card">
                        <div className="course-name">{m.title}</div>
                        <div className="course-status">
                          Materials: {m.materials.length}
                        </div>
                        <Link
                          to={`/student/course/${data.course.id}/module/${m.id}`}
                          className="module-link"
                        >
                          View notes &amp; videos
                        </Link>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="dashboard-sub">
                  You are not yet enrolled in a course. Go to the Courses page
                  and select a program.
                </p>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}

