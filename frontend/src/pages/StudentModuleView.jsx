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
  const [answer, setAnswer] = useState({});
  const [quizResult, setQuizResult] = useState('');
  const [completeLoading, setCompleteLoading] = useState(false);
  const [subscribedVideos, setSubscribedVideos] = useState({});

  const resolveResourceUrl = (url) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    const base = api.defaults.baseURL.replace(/\/api\/?$/, '');
    return `${base}${url}`;
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return '';
    const patterns = [
      /youtube\.com\/watch\?v=([^&?/]+)/,
      /youtu\.be\/([^&?/]+)/,
      /youtube\.com\/embed\/([^&?/]+)/,
      /youtube\.com\/shorts\/([^&?/]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return `https://www.youtube.com/embed/${match[1]}`;
    }
    return '';
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
        setAnswer({});
        setQuizResult('');
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
  const previousModule = currentIndex > 0 ? courseModules[currentIndex - 1] : null;

  const canCompleteThisSection = sectionNumber === 1 || previousModule?.completed;

  const canOpenSection = (index) => {
    if (index === 0) return true;
    return courseModules[index - 1]?.completed;
  };

  const goNext = () => {
    if (!data?.completed) {
      alert('Please complete this section first before going to the next section.');
      return;
    }

    if (nextModule?.id) {
      navigate(`/student/course/${courseId}/module/${nextModule.id}`);
      return;
    }

    navigate('/student/dashboard');
  };

  const markComplete = async (moveNext = false) => {
    const token = localStorage.getItem('studentToken');

    if (!canCompleteThisSection) {
      alert('Please complete the previous section first.');
      return;
    }

    setCompleteLoading(true);

    try {
      await api.post(`/students/modules/${moduleId}/complete`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setData((current) => ({ ...current, completed: true }));

      if (moveNext) {
        if (nextModule?.id) {
          navigate(`/student/course/${courseId}/module/${nextModule.id}`);
        } else {
          navigate('/student/dashboard');
        }
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
        { answers: answer },
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
          --cyan: #22d3ee;
          --blue: #3b82f6;
          --lesson-bg: #102034;
          --lesson-sidebar: #0b1728;
          --lesson-line: rgba(184, 200, 230, 0.2);
          --lesson-text: #f8fbff;
          --lesson-muted: #a9c2ec;
          --lesson-green: #8df000;
        }

        .module-page {
          min-height: 100vh;
          background: var(--lesson-bg);
          color: var(--lesson-text);
          display: flex;
        }

        .lesson-sidebar {
          width: 280px;
          background: var(--lesson-sidebar);
          border-right: 1px solid var(--lesson-line);
          padding: 1.2rem;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
        }

        .back-dashboard-btn {
          width: 100%;
          background: #1e293b;
          color: #fff;
          border: 1px solid rgba(255,255,255,0.1);
          padding: 0.75rem 1rem;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 700;
          font-size: 0.9rem;
          margin-bottom: 1rem;
          text-align: left;
          transition: all 0.25s ease;
        }

        .back-dashboard-btn:hover {
          background: blue;
          transform: translateY(-2px);
          border-color: #22d3ee;
        }

        .sidebar-title {
          color: #ffffff;
          font-size: 1rem;
          font-weight: 900;
          margin-bottom: 0.3rem;
        }

        .sidebar-course {
          color: var(--lesson-muted);
          font-size: 0.8rem;
          line-height: 1.4;
          margin-bottom: 1.2rem;
        }

        .sidebar-section-list {
          display: grid;
          gap: 0.45rem;
        }

        .sidebar-section {
          display: flex;
          gap: 0.6rem;
          align-items: flex-start;
          color: var(--lesson-muted);
          text-decoration: none;
          border: 1px solid transparent;
          border-radius: 0.45rem;
          padding: 0.65rem;
          transition: 0.2s ease;
          background: transparent;
          text-align: left;
          cursor: pointer;
          width: 100%;
        }

        .sidebar-section:hover {
          background: rgba(255,255,255,0.05);
        }

        .sidebar-section.active {
          background: rgba(34, 211, 238, 0.12);
          border-color: rgba(34, 211, 238, 0.35);
          color: #ffffff;
        }

        .sidebar-section.locked {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .sidebar-number {
          width: 1.5rem;
          height: 1.5rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          border-radius: 999px;
          background: rgba(184, 200, 230, 0.12);
          color: var(--lesson-muted);
          font-size: 0.75rem;
          font-weight: 900;
        }

        .sidebar-section.active .sidebar-number {
          background: var(--cyan);
          color: #001f3f;
        }

        .sidebar-section-title {
          font-size: 0.82rem;
          font-weight: 800;
          line-height: 1.35;
        }

        .module-content {
          flex: 1;
          min-width: 0;
          padding: 2.4rem;
        }

        .module-container {
          max-width: 64rem;
        }

        .section-kicker {
          color: var(--lesson-muted);
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.86rem;
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
          gap: 1.25rem;
          margin: 1.8rem 0 1.5rem;
          max-width: 58rem;
        }

        .material-title {
          color: #ffffff;
          font-weight: 900;
          font-size: 1.25rem;
          margin-bottom: 0.55rem;
        }

        .material-type {
          color: var(--lesson-muted);
          font-size: 0.82rem;
          font-weight: 800;
          text-transform: uppercase;
          margin-bottom: 0.7rem;
        }

        .material-link {
          color: var(--cyan);
          font-size: 0.9rem;
          font-weight: 800;
          text-decoration: none;
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

        .quiz-btn {
          border: none;
          background: var(--cyan);
          color: #001f3f;
          margin-top: 1rem;
        }

        .complete-btn {
          border: none;
          background: var(--lesson-green);
          color: #001f3f;
        }

        .next-btn {
          border: 1px solid #8ea8d0;
          background: transparent;
          color: #ffffff;
        }

        .next-btn:disabled,
        .complete-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
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

        .state-message {
          color: var(--lesson-muted);
        }

        @media (max-width: 900px) {
          .module-page {
            flex-direction: column;
          }

          .lesson-sidebar {
            width: auto;
            height: auto;
            position: static;
            border-right: none;
            border-bottom: 1px solid var(--lesson-line);
          }
        }

        @media (max-width: 720px) {
          .module-content {
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
        <aside className="lesson-sidebar">
          <button
            type="button"
            onClick={() => navigate('/student/dashboard')}
            className="back-dashboard-btn"
          >
            ← Back to Dashboard
          </button>

          <div className="sidebar-title">Course Sections</div>
          <div className="sidebar-course">{courseName || 'Stekora Tech Academy'}</div>

          <div className="sidebar-section-list">
            {courseModules.map((module, index) => {
              const unlocked = canOpenSection(index);

              return (
                <button
                  key={module.id}
                  type="button"
                  className={`sidebar-section ${
                    String(module.id) === String(moduleId) ? 'active' : ''
                  } ${!unlocked ? 'locked' : ''}`}
                  onClick={() => {
                    if (!unlocked) {
                      alert('Please complete the previous section first.');
                      return;
                    }

                    navigate(`/student/course/${courseId}/module/${module.id}`);
                  }}
                >
                  <span className="sidebar-number">{index + 1}</span>
                  <span className="sidebar-section-title">{module.title}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="module-content">
          <div className="module-container">
            {loading && <p className="state-message">Loading module...</p>}
            {error && !loading && <p className="state-message">{error}</p>}

            {data && (
              <>
                <div className="section-kicker">
                  Section {sectionNumber} / {totalSections}
                </div>

                <h1 className="module-title">{data.module.title}</h1>

                {sectionNumber === 1 && (
                  <>
                    <h2 className="module-subtitle">
                      Welcome to Stekora Tech Academy
                    </h2>

                    <p className="lesson-copy">
                      This course gives you a focused learning path with{' '}
                      <span className="lesson-chip">guided materials</span> and practical
                      content. Study each section, open the resources, watch the videos, and
                      complete the section when you are ready.
                    </p>
                  </>
                )}

                <div className="materials-list">
                  {data.materials.map((m) => {
                    const resourceUrl = resolveResourceUrl(m.file_url);
                    const youtubeUrl = getYoutubeEmbedUrl(resourceUrl);
                    const materialType = String(m.type || '').toLowerCase().trim();

                    return (
                      <section key={m.id} className="material-card">
                        <div className="material-title">{m.title}</div>

                        <div className="material-type">
                          {materialType === 'section'
                            ? 'SECTION'
                            : materialType === 'note'
                              ? 'NOTE / DOCUMENT'
                              : 'VIDEO LESSON'}
                        </div>

                        {materialType === 'section' && (
                          <>
                            <div
                              style={{
                                marginTop: '1rem',
                                color: '#c9d7ee',
                                lineHeight: '1.9',
                                fontSize: '1.05rem',
                                whiteSpace: 'pre-wrap',
                              }}
                            >
                              {m.content || 'No section content found'}
                            </div>

                            {youtubeUrl && (
                              <div
                                style={{
                                  marginTop: '1.5rem',
                                  position: 'relative',
                                  borderRadius: '12px',
                                  overflow: 'hidden',
                                  border: '1px solid rgba(255,255,255,0.08)',
                                  background: '#000',
                                }}
                              >
                                <iframe
                                  width="100%"
                                  height="420"
                                  src={youtubeUrl}
                                  title={m.title}
                                  allowFullScreen
                                  style={{
                                    border: 'none',
                                    display: 'block',
                                    filter: subscribedVideos[m.id] ? 'none' : 'blur(5px)',
                                    pointerEvents: subscribedVideos[m.id] ? 'auto' : 'none',
                                  }}
                                />

                                {!subscribedVideos[m.id] && (
                                  <div
                                    style={{
                                      position: 'absolute',
                                      inset: 0,
                                      background: 'rgba(0,0,0,0.65)',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      textAlign: 'center',
                                      padding: '1rem',
                                    }}
                                  >
                                    <p style={{ color: '#fff', fontWeight: 800 }}>
                                      Subscribe first to watch this video
                                    </p>

                                    <a
                                      href="https://youtube.com/@YOURCHANNEL"
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{
                                        background: '#ff0000',
                                        color: '#fff',
                                        padding: '0.75rem 1.2rem',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        fontWeight: 800,
                                        marginBottom: '0.8rem',
                                      }}
                                    >
                                      Subscribe
                                    </a>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        setSubscribedVideos({
                                          ...subscribedVideos,
                                          [m.id]: true,
                                        })
                                      }
                                      style={{
                                        background: '#22c55e',
                                        color: '#fff',
                                        border: 'none',
                                        padding: '0.75rem 1.2rem',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 800,
                                      }}
                                    >
                                      I Have Subscribed
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}

                        {materialType === 'video' && resourceUrl && (
                          <>
                            {youtubeUrl ? (
                              <iframe
                                className="resource-frame"
                                src={youtubeUrl}
                                title={m.title}
                                allowFullScreen
                              />
                            ) : (
                              <video className="resource-video" src={resourceUrl} controls />
                            )}
                          </>
                        )}

                        {materialType === 'note' && resourceUrl && (
                          <>
                            <a
                              href={resourceUrl}
                              className="material-link"
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open resource
                            </a>

                            {resourceUrl.toLowerCase().endsWith('.pdf') && (
                              <iframe
                                className="resource-frame"
                                src={resourceUrl}
                                title={m.title}
                              />
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

                {Array.isArray(data.quiz) && data.quiz.length > 0 && (
  <form className="quiz-box" onSubmit={submitQuiz}>
    <h2 className="quiz-title">Section Assessment</h2>

    {data.quiz.map((q, index) => (
      <div
        key={q.id}
        style={{
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <p
          className="lesson-copy"
          style={{
            marginBottom: '0.8rem',
            color: '#fff',
            fontWeight: 800,
          }}
        >
          {index + 1}. {q.question}
        </p>

        <div className="quiz-options">
          {[
            ['A', q.option_a],
            ['B', q.option_b],
            ['C', q.option_c],
            ['D', q.option_d],
          ]
            .filter(([, text]) => text)
            .map(([key, text]) => (
             <label
  key={key}
  className="quiz-option"
  style={{
    background:
      answer[q.id] === key
        ? 'rgba(34,197,94,0.2)'
        : 'transparent',

    border:
      answer[q.id] === key
        ? '1px solid #22c55e'
        : '1px solid transparent',

    padding: '10px',
    borderRadius: '8px',
    color:
      answer[q.id] === key
        ? '#22c55e'
        : '#cbd5e1',

    fontWeight: answer[q.id] === key ? '800' : '500',
    transition: '0.3s',
  }}
>
                <input
                  type="radio"
                  name={`question-${q.id}`}
                  value={key}
                  checked={answer[q.id] === key}
                  onChange={(e) =>
                    setAnswer({
                      ...answer,
                      [q.id]: e.target.value,
                    })
                  }
                  required
                />

                <span>
                  {key}. {text}
                </span>
              </label>
            ))}
        </div>
      </div>
    ))}

    <button type="submit" className="quiz-btn">
      Submit Assessment
    </button>

    {quizResult && (
      <p
        className="lesson-copy"
        style={{
          marginTop: '1rem',
          fontWeight: 800,
          color: '#fff',
        }}
      >
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

                  <button
                    type="button"
                    className="next-btn"
                    onClick={goNext}
                    disabled={!data?.completed}
                  >
                    Next
                  </button>

                  <button
                    type="button"
                    className="complete-btn"
                    disabled={completeLoading || !canCompleteThisSection}
                    onClick={() => markComplete(true)}
                  >
                    {completeLoading
                      ? 'Saving...'
                      : !canCompleteThisSection
                        ? 'Complete Previous Section First'
                        : data.completed
                          ? 'Completed & Next'
                          : 'Mark Complete & Next'}
                  </button>
                </footer>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}