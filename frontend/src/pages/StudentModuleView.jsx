import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function StudentModuleView() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answer, setAnswer] = useState('');
  const [quizResult, setQuizResult] = useState('');
  const [completeLoading, setCompleteLoading] = useState(false);

  const resolveResourceUrl = (url) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    const base = api.defaults.baseURL.replace(/\/api\/?$/, '');
    return `${base}${url}`;
  };

  const getYoutubeEmbedUrl = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : '';
  };

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

  const markComplete = async () => {
    const token = localStorage.getItem('studentToken');
    setCompleteLoading(true);
    try {
      await api.post(`/students/modules/${moduleId}/complete`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData((current) => ({ ...current, completed: true }));
      alert('Unit marked as complete. Admin will see this notification.');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Failed to mark unit complete');
    } finally {
      setCompleteLoading(false);
    }
  };

  const submitQuiz = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('studentToken');
    try {
      const { data } = await api.post(
        `/students/modules/${moduleId}/quiz/submit`,
        { answer },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuizResult(data.correct ? 'Correct answer. Well done.' : 'That answer is not correct. Try again.');
    } catch (err) {
      console.error(err);
      setQuizResult(err.response?.data?.msg || 'Failed to submit quiz');
    }
  };

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

        .resource-frame,
        .resource-video {
          width: 100%;
          margin-top: 0.8rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.7rem;
          background: #f8fafc;
        }

        .resource-frame {
          min-height: 420px;
        }

        .resource-video {
          max-height: 420px;
        }

        .complete-btn,
        .quiz-btn {
          border: none;
          border-radius: 999px;
          background: var(--richblue);
          color: #ffffff;
          cursor: pointer;
          font-weight: 800;
          padding: 0.75rem 1rem;
          margin-top: 1rem;
        }

        .complete-btn:disabled {
          opacity: 0.65;
          cursor: default;
        }

        .quiz-box {
          margin-top: 1.5rem;
          border: 1px solid #d8dee8;
          border-radius: 0.9rem;
          padding: 1rem 1.2rem;
          background: #f8fbff;
        }

        .quiz-title {
          margin: 0 0 0.6rem;
          color: var(--richblue);
          font-size: 1rem;
          font-weight: 800;
        }

        .quiz-options {
          display: grid;
          gap: 0.55rem;
          margin-top: 0.8rem;
        }

        .quiz-option {
          display: flex;
          gap: 0.55rem;
          align-items: center;
          font-size: 0.9rem;
          color: #334155;
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
              <button
                type="button"
                className="complete-btn"
                disabled={data.completed || completeLoading}
                onClick={markComplete}
              >
                {data.completed ? 'Unit completed' : completeLoading ? 'Saving...' : 'Mark unit complete'}
              </button>

              <div className="materials-list">
                {data.materials.map((m) => {
                  const resourceUrl = resolveResourceUrl(m.file_url);
                  const youtubeUrl = getYoutubeEmbedUrl(resourceUrl);
                  return (
                    <div key={m.id} className="material-card">
                      <div className="material-title">{m.title}</div>
                      <div className="material-type">
                        {m.type === 'note' ? 'Note (PDF / document)' : 'Video'}
                      </div>
                      {resourceUrl && (
                        <>
                          <a
                            href={resourceUrl}
                            className="material-link"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open resource
                          </a>
                          {m.type === 'video' && youtubeUrl && (
                            <iframe
                              className="resource-frame"
                              src={youtubeUrl}
                              title={m.title}
                              allowFullScreen
                            />
                          )}
                          {m.type === 'video' && !youtubeUrl && (
                            <video className="resource-video" src={resourceUrl} controls />
                          )}
                          {m.type === 'note' && resourceUrl.toLowerCase().endsWith('.pdf') && (
                            <iframe className="resource-frame" src={resourceUrl} title={m.title} />
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
                {data.materials.length === 0 && (
                  <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                    No materials have been uploaded for this module yet.
                  </p>
                )}
              </div>

              {data.quiz && (
                <form className="quiz-box" onSubmit={submitQuiz}>
                  <h2 className="quiz-title">{data.quiz.title}</h2>
                  <p style={{ margin: 0, color: '#334155' }}>{data.quiz.question}</p>
                  <div className="quiz-options">
                    {[
                      ['A', data.quiz.option_a],
                      ['B', data.quiz.option_b],
                      ['C', data.quiz.option_c],
                      ['D', data.quiz.option_d],
                    ].filter(([, text]) => text).map(([key, text]) => (
                      <label key={key} className="quiz-option">
                        <input
                          type="radio"
                          name="answer"
                          value={key}
                          checked={answer === key}
                          onChange={(e) => setAnswer(e.target.value)}
                          required
                        />
                        <span>{key}. {text}</span>
                      </label>
                    ))}
                  </div>
                  <button type="submit" className="quiz-btn">Submit quiz</button>
                  {quizResult && (
                    <p style={{ margin: '0.8rem 0 0', color: '#003366', fontWeight: 700 }}>
                      {quizResult}
                    </p>
                  )}
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

