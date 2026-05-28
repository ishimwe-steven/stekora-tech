import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

export default function FinalExamPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadExam();
  }, [courseId]);

  async function loadExam() {
    try {
      setLoading(true);
      const token = localStorage.getItem('studentToken');

      const res = await api.get(`/final-exam/courses/${courseId}/take`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setQuestions(res.data.questions || []);
      setMessage('');
    } catch (err) {
      setQuestions([]);
      setMessageType('error');
      setMessage(err?.response?.data?.msg || 'Failed to load final exam');
    } finally {
      setLoading(false);
    }
  }

  async function submitExam(e) {
    e.preventDefault();

    if (submitting) return;

    const confirmSubmit = window.confirm(
      'Are you sure you want to submit this final exam? You can only submit once unless admin allows a re-exam.'
    );

    if (!confirmSubmit) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('studentToken');

      const res = await api.post(
        `/final-exam/courses/${courseId}/submit`,
        { answers },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessageType('success');
      setMessage(res.data.msg || 'Final exam submitted successfully.');
      setQuestions([]);
      setAnswers({});
    } catch (err) {
      setMessageType('error');
      setMessage(err?.response?.data?.msg || 'Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#071224',
          color: '#fff',
          padding: '2rem',
        }}
      >
        Loading final exam...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#071224',
        color: '#fff',
        padding: '2rem',
      }}
    >
      <button
        type="button"
        onClick={() => navigate('/student/dashboard')}
        style={{
          background: '#1e293b',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.12)',
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          cursor: 'pointer',
          fontWeight: 800,
          marginBottom: '1.5rem',
        }}
      >
        ← Back to Dashboard
      </button>

      <h1
        style={{
          fontSize: '2rem',
          fontWeight: '900',
          marginBottom: '0.5rem',
        }}
      >
        Final Examination
      </h1>

      <p
        style={{
          color: '#94a3b8',
          marginBottom: '2rem',
          maxWidth: '760px',
          lineHeight: 1.7,
        }}
      >
        Answer all questions carefully. After submission, your exam will be sent to
        admin for review. You cannot retake the exam unless admin allows re-exam.
      </p>

      {message && (
        <div
          style={{
            background: messageType === 'error' ? '#3b1118' : '#132238',
            border:
              messageType === 'error'
                ? '1px solid rgba(248,113,113,0.35)'
                : '1px solid rgba(34,197,94,0.3)',
            padding: '1rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            color: messageType === 'error' ? '#fecaca' : '#22c55e',
            fontWeight: '700',
            maxWidth: '760px',
          }}
        >
          {message}
        </div>
      )}

      {questions.length === 0 ? (
        <div
          style={{
            background: '#0f1c31',
            padding: '1.5rem',
            borderRadius: '15px',
            maxWidth: '760px',
            color: '#cbd5e1',
          }}
        >
          No exam questions available to answer now.
        </div>
      ) : (
        <form onSubmit={submitExam}>
          {questions.map((q, index) => (
            <div
              key={q.id}
              style={{
                background: '#0f1c31',
                padding: '1.5rem',
                borderRadius: '15px',
                marginBottom: '1.5rem',
                maxWidth: '900px',
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  background: q.question_type === 'open' ? '#7c3aed' : '#0ea5e9',
                  color: '#fff',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  marginBottom: '0.8rem',
                  textTransform: 'uppercase',
                }}
              >
                {q.question_type === 'open' ? 'Open Question' : 'MCQ'} · {q.marks} mark
                {Number(q.marks) > 1 ? 's' : ''}
              </div>

              <h3
                style={{
                  marginBottom: '1rem',
                  fontWeight: '800',
                  lineHeight: 1.5,
                }}
              >
                {index + 1}. {q.question}
              </h3>

              {q.question_type === 'mcq' ? (
                <div>
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
                        style={{
                          display: 'block',
                          marginBottom: '10px',
                          padding: '12px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          color: answers[q.id] === key ? '#22c55e' : '#e5e7eb',
                          fontWeight: answers[q.id] === key ? 900 : 600,
                          background:
                            answers[q.id] === key
                              ? 'rgba(34,197,94,0.2)'
                              : '#132238',
                          border:
                            answers[q.id] === key
                              ? '1px solid #22c55e'
                              : '1px solid transparent',
                        }}
                      >
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          value={key}
                          checked={answers[q.id] === key}
                          onChange={(e) =>
                            setAnswers({
                              ...answers,
                              [q.id]: e.target.value,
                            })
                          }
                          required
                        />

                        <span style={{ marginLeft: '10px' }}>
                          {key}. {text}
                        </span>
                      </label>
                    ))}
                </div>
              ) : (
                <textarea
                  required
                  placeholder="Write your answer here..."
                  value={answers[q.id] || ''}
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      [q.id]: e.target.value,
                    })
                  }
                  style={{
                    width: '100%',
                    minHeight: '170px',
                    borderRadius: '10px',
                    padding: '1rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    outline: 'none',
                    background: '#132238',
                    color: '#fff',
                    resize: 'vertical',
                    lineHeight: 1.7,
                  }}
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            style={{
              background: submitting ? '#64748b' : '#22c55e',
              color: '#000',
              border: 'none',
              padding: '14px 24px',
              borderRadius: '10px',
              fontWeight: '900',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Final Exam'}
          </button>
        </form>
      )}
    </div>
  );
}