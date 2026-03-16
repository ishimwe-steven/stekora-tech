import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function UserLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('student'); // 'student' or 'admin'

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'student') {
        const { data } = await api.post('/students/login', form);
        localStorage.setItem('studentToken', data.token);
        if (data.student) {
          localStorage.setItem('studentName', data.student.full_name);
          if (data.student.course) {
            localStorage.setItem('studentCourseName', data.student.course.name);
          }
        }
        alert('Logged in successfully.');
        navigate('/student/dashboard');
      } else {
        const { data } = await api.post('/auth/login', {
          username: form.email,
          password: form.password,
        });
        localStorage.setItem('token', data.token);
        alert('Admin logged in.');
        navigate('/admin');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const selectedCourse = localStorage.getItem('selectedCourse');

  return (
    <>
      <style>{`
        :root {
          --richblue: #003366;
          --palegray: #f5f5f5;
          --lightgray: #9ca3af;
        }

        .auth-page {
          background: var(--palegray);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 1rem;
        }

        .auth-card {
          width: 100%;
          max-width: 26rem;
          background: #ffffff;
          border-radius: 1.25rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          padding: 2.2rem;
        }

        .auth-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--richblue);
          margin-bottom: 0.25rem;
        }

        .auth-sub {
          font-size: 0.85rem;
          color: #4b5563;
          margin-bottom: 1.5rem;
        }

        .auth-badge {
          display: inline-block;
          font-size: 0.7rem;
          padding: 0.25rem 0.6rem;
          border-radius: 999px;
          background: #e0f2fe;
          color: #0369a1;
          margin-bottom: 0.5rem;
        }

        .form-group label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 0.3rem;
          color: var(--richblue);
        }

        .form-group input {
          width: 100%;
          padding: 0.65rem 0.75rem;
          border-radius: 0.6rem;
          border: 1px solid var(--lightgray);
          font-size: 0.85rem;
          outline: none;
        }

        .form-group input:focus {
          border-color: var(--richblue);
        }

        .auth-btn {
          margin-top: 1.3rem;
          width: 100%;
          border: none;
          padding: 0.8rem 1.2rem;
          border-radius: 0.7rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: #fff;
          cursor: pointer;
          background: linear-gradient(135deg, #4f46e5, #5a67d8);
        }

        .auth-btn:hover {
          opacity: 0.95;
        }

        .auth-footer {
          margin-top: 1rem;
          font-size: 0.8rem;
          color: #6b7280;
          text-align: center;
        }

        .auth-footer a {
          color: #4f46e5;
          text-decoration: none;
          font-weight: 600;
        }
      `}</style>

      <div className="auth-page">
        <div className="auth-card">
          {selectedCourse && (
            <div className="auth-badge">
              Applying for: {selectedCourse}
            </div>
          )}
          <h1 className="auth-title">
            {mode === 'student' ? 'Student Login' : 'Admin Login'}
          </h1>
          <p className="auth-sub">
            {mode === 'student'
              ? 'Login to continue your application and access your study dashboard.'
              : 'Login to manage courses, modules, materials and students.'}
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={() => setMode('student')}
              style={{
                flex: 1,
                padding: '0.4rem 0.6rem',
                borderRadius: '999px',
                border: mode === 'student' ? '1px solid #6366f1' : '1px solid #e5e7eb',
                background: mode === 'student' ? '#EEF2FF' : '#fff',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setMode('admin')}
              style={{
                flex: 1,
                padding: '0.4rem 0.6rem',
                borderRadius: '999px',
                border: mode === 'admin' ? '1px solid #6366f1' : '1px solid #e5e7eb',
                background: mode === 'admin' ? '#EEF2FF' : '#fff',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{mode === 'student' ? 'Email' : 'Username'}</label>
              <input
                type={mode === 'student' ? 'email' : 'text'}
                name="email"
                required
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ marginTop: '0.85rem' }}>
              <label>Password</label>
              <input
                type="password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <button className="auth-btn" type="submit">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="auth-footer">
            New here? <Link to="/register">Create an account</Link>
          </div>
        </div>
      </div>
    </>
  );
}

