import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function StudentModuleView() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [courseModules, setCourseModules] = useState([]);
  const [courseName, setCourseName] = useState('');
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
        setLoading(true);
        const [moduleResponse, dashboardResponse] = await Promise.all([
          api.get(`/students/modules/${moduleId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get('/students/dashboard', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const course = dashboardResponse.data.courses?.find(
          (item) => String(item.id) === String(courseId)
        );

        setData(moduleResponse.data);
        setCourseModules(course?.modules || []);
        setCourseName(course?.name || '');
        setError('');
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.msg || 'Failed to load module');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [courseId, moduleId, navigate]);

  const currentIndex = useMemo(
    () => courseModules.findIndex((module) => String(module.id) === String(moduleId)),
    [courseModules, moduleId]
  );
  const sectionNumber = currentIndex >= 0 ? currentIndex + 1 : 1;
  const totalSections = courseModules.length || 1;
  const nextModule = currentIndex >= 0 ? courseModules[currentIndex + 1] : null;

  const goNext = () => {
    if (nextModule) {
      navigate(`/student/course/${courseId}/module/${nextModule.id}`);
      return;
    }
    navigate('/student/dashboard');
  };

  const markComplete = async (moveNext = false) => {
    const token = localStorage.getItem('studentToken');
    setCompleteLoading(true);
    try {
      await api.post(`/students/modules/${moduleId}/complete`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData((current) => ({ ...current, completed: true }));
      if (moveNext) {
        goNext();
      }
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
      setQuizResult(
        data.correct
          ? `Correct answer. Grade: ${data.score}%.`
          : `That answer is not correct. Grade: ${data.score}%. Try again.`
      );
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
          --cyan: #22d3ee;
          --blue: #3b82f6;
          --lesson-bg: #102034;
          --lesson-panel: #142842;
          --lesson-line: rgba(184, 200, 230, 0.2);
          --lesson-text: #f8fbff;
          --lesson-muted: #a9c2ec;
        }

        .module-page {
          min-height: 100vh;
          background: var(--lesson-bg);
          color: var(--lesson-text);
          padding: 2.4rem;
        }

        .module-container {
          max-width: 64rem;
        }

        .section-kicker {
          color: var(--lesson-muted);
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.86rem;
          letter-spacing: 0;
          margin-bottom: 0.65rem;
        }

        .module-title {
          margin: 0;
          color: #ffffff;
          font-size: clamp(2rem, 4vw, 2.8rem);
          line-height: 1;
          font-weight: 900;
        }

        .module-subtitle {
          margin: 1.7rem 0 0.7rem;
          color: #ffffff;
          font-size: clamp(1.55rem, 3vw, 2rem);
          line-height: 1.1;
          font-weight: 900;
        }

        .lesson-copy {
          max-width: 58rem;
          color: var(--lesson-muted);
          font-size: 1.08rem;
          line-height: 1.6;
          margin: 0 0 1.3rem;
        }

        .lesson-chip {
          display: inline-block;
          background: rgba(59, 130, 246, 0.16);
          color: #6ea8ff;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          padding: 0 0.35rem;
        }

        .materials-list {
          display: grid;
          gap: 1rem;
          margin: 1.8rem 0 1.5rem;
        }

        .material-card {
          background: rgba(20, 40, 66, 0.86);
          border: 1px solid var(--lesson-line);
          border-radius: 0.5rem;
          padding: 1rem;
        }

        .material-title {
          color: #ffffff;
          font-weight: 900;
          font-size: 1rem;
          margin-bottom: 0.3rem;
        }

        .material-type {
          color: var(--lesson-muted);
          font-size: 0.82rem;
          font-weight: 800;
          text-transform: uppercase;
          margin-bottom: 0.55rem;
        }

        .material-link {
          color: var(--cyan);
          font-size: 0.9rem;
          font-weight: 800;
          text-decoration: none;
        }

        .material-link:hover {
          text-decoration: underline;
        }

        .resource-frame,
        .resource-video {
          width: 100%;
          margin-top: 0.85rem;
          border: 1px solid var(--lesson-line);
          border-radius: 0.45rem;
          background: #07152c;
        }

        .resource-frame {
          min-height: 420px;
        }

        .resource-video {
          max-height: 420px;
        }

        .lesson-note {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          max-width: 58rem;
          margin: 1.8rem 0 3.2rem;
          background: rgba(59, 130, 246, 0.15);
          color: #ffffff;
          border-radius: 0.25rem;
          padding: 0.85rem 1rem;
          font-size: 0.95rem;
          font-weight: 800;
        }

        .lesson-note span {
          width: 1.25rem;
          height: 1.25rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          border-radius: 999px;
          background: var(--blue);
          color: #ffffff;
          font-size: 0.78rem;
        }

        .quiz-box {
          max-width: 58rem;
          margin-top: 1.5rem;
          border: 1px solid var(--lesson-line);
          border-radius: 0.5rem;
          padding: 1rem;
          background: rgba(20, 40, 66, 0.78);
        }

        .quiz-title {
          margin: 0 0 0.6rem;
          color: #ffffff;
          font-size: 1rem;
          font-weight: 900;
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
          color: var(--lesson-muted);
          font-size: 0.95rem;
        }

        .quiz-btn,
        .next-btn,
        .complete-btn {
          min-height: 2.65rem;
          border-radius: 0.28rem;
          cursor: pointer;
          font-weight: 900;
          padding: 0.7rem 1.25rem;
        }

        .quiz-btn,
        .complete-btn {
          border: none;
          background: var(--cyan);
          color: #001f3f;
        }

        .next-btn {
          border: 1px solid #8ea8d0;
          background: transparent;
          color: #ffffff;
        }

        .complete-btn:disabled {
          opacity: 0.65;
          cursor: default;
        }

        .lesson-footer {
          max-width: 58rem;
          border-top: 1px solid var(--lesson-line);
          padding-top: 1rem;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 1rem;
        }

        .lesson-footer-section {
          margin-right: auto;
          color: var(--lesson-muted);
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.86rem;
        }

        .xp-pill {
          border-radius: 999px;
          background: rgba(184, 200, 230, 0.12);
          color: var(--lesson-muted);
          padding: 0.65rem 0.85rem;
          font-size: 0.9rem;
          font-weight: 800;
        }

        .state-message {
          color: var(--lesson-muted);
        }

        @media (max-width: 720px) {
          .module-page {
            padding: 1.3rem 1rem;
          }

          .lesson-footer {
            align-items: stretch;
            flex-direction: column;
          }

          .lesson-footer-section {
            margin-right: 0;
          }

          .next-btn,
          .complete-btn {
            width: 100%;
          }
        }
      `}</style>

      <div className="module-page">
        <main className="module-container">
          {loading && <p className="state-message">Loading module...</p>}
          {error && !loading && <p className="state-message">{error}</p>}

          {data && (
            <>
              <div className="section-kicker">
                Section {sectionNumber} / {totalSections}
              </div>
              <h1 className="module-title">{data.module.title}</h1>
              <h2 className="module-subtitle">
                Welcome to {courseName || 'Stekora Tech Academy'}
              </h2>
              <p className="lesson-copy">
                This section gives you a focused learning path with{' '}
                <span className="lesson-chip">guided materials</span> and practice content from
                your course. Open each resource, study the notes or videos, then complete the
                section when you are ready to continue.
              </p>
              <p className="lesson-copy">
                You can move through the module step by step. When a quiz is available, submit your
                answer to receive a small grade for this module.
              </p>

              <div className="materials-list">
                {data.materials.map((m) => {
                  const resourceUrl = resolveResourceUrl(m.file_url);
                  const youtubeUrl = getYoutubeEmbedUrl(resourceUrl);
                  return (
                    <section key={m.id} className="material-card">
                      <div className="material-title">{m.title}</div>
                      <div className="material-type">
                        {m.type === 'note' ? 'Note / document' : 'Video lesson'}
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
                    </section>
                  );
                })}
                {data.materials.length === 0 && (
                  <p className="lesson-copy">
                    No materials have been uploaded for this section yet.
                  </p>
                )}
              </div>

              {data.quiz && (
                <form className="quiz-box" onSubmit={submitQuiz}>
                  <h2 className="quiz-title">{data.quiz.title}</h2>
                  <p className="lesson-copy" style={{ marginBottom: 0 }}>
                    {data.quiz.question}
                  </p>
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
                    <p className="lesson-copy" style={{ marginTop: '0.85rem', fontWeight: 800 }}>
                      {quizResult}
                    </p>
                  )}
                </form>
              )}

              <div className="lesson-note">
                <span>i</span>
                Click on the "Mark Complete & Next" button below to proceed to the next section.
              </div>

              <footer className="lesson-footer">
                <div className="lesson-footer-section">
                  Section {sectionNumber} / {totalSections}
                </div>
                <div className="xp-pill">+10</div>
                <button type="button" className="next-btn" onClick={goNext}>
                  Next
                </button>
                <button
                  type="button"
                  className="complete-btn"
                  disabled={completeLoading}
                  onClick={() => markComplete(true)}
                >
                  {completeLoading
                    ? 'Saving...'
                    : data.completed
                      ? 'Completed & Next'
                      : 'Mark Complete & Next'}
                </button>
              </footer>
            </>
          )}
        </main>
      </div>
    </>
  );
}
