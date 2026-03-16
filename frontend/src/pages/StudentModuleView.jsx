import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function StudentModuleView() {
  const { moduleId } = useParams();
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
        const { data } = await api.get(`/students/modules/${moduleId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.msg || 'Failed to load module');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [moduleId, navigate]);

  return (
    <>
      <style>{`
        :root {
          --richblue: #003366;
          --palegray: #f5f5f5;
        }

        .module-page {
          min-height: 100vh;
          background: var(--palegray);
          padding: 2.5rem 1rem;
        }

        .module-container {
          max-width: 60rem;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 1.25rem;
          padding: 2rem;
          box-shadow: 0 10px 25px rgba(0,0,0,0.06);
        }

        .module-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--richblue);
          margin-bottom: 0.5rem;
        }

        .materials-list {
          margin-top: 1.5rem;
          display: grid;
          gap: 1rem;
        }

        .material-card {
          border-radius: 0.9rem;
          border: 1px solid #e5e7eb;
          padding: 1rem 1.2rem;
        }

        .material-title {
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--richblue);
          margin-bottom: 0.35rem;
        }

        .material-type {
          font-size: 0.8rem;
          color: #6b7280;
          margin-bottom: 0.4rem;
        }

        .material-link {
          font-size: 0.85rem;
          color: #2563eb;
          text-decoration: none;
        }

        .material-link:hover {
          text-decoration: underline;
        }
      `}</style>

      <div className="module-page">
        <div className="module-container">
          {loading && <p>Loading module...</p>}
          {error && !loading && <p>{error}</p>}

          {data && (
            <>
              <h1 className="module-title">{data.module.title}</h1>
              <p style={{ fontSize: '0.9rem', color: '#4b5563' }}>
                Below are notes and videos for this module.
              </p>

              <div className="materials-list">
                {data.materials.map((m) => (
                  <div key={m.id} className="material-card">
                    <div className="material-title">{m.title}</div>
                    <div className="material-type">
                      {m.type === 'note' ? 'Note (PDF / document)' : 'Video'}
                    </div>
                    {m.file_url && (
                      <a
                        href={m.file_url}
                        className="material-link"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open resource
                      </a>
                    )}
                  </div>
                ))}
                {data.materials.length === 0 && (
                  <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                    No materials have been uploaded for this module yet.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

