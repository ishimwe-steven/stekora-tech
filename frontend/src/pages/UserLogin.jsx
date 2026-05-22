import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function UserLogin() {
  const navigate = useNavigate();
  const [authView, setAuthView] = useState('login');
  const [mode, setMode] = useState('student');
  const [form, setForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
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

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    try {
      await api.post('/students/register', registerForm);
      alert('Registration successful. Please login.');
      setForm({ email: registerForm.email, password: '' });
      setRegisterForm({ full_name: '', email: '', phone: '', password: '' });
      setAuthView('login');
      setMode('student');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Registration failed');
    } finally {
      setRegisterLoading(false);
    }
  };

  const goBack = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <>
      <style>{`
        :root {
          --auth-primary: #003366;
          --auth-accent: #22d3ee;
          --auth-deep: #001f3f;
          --auth-panel: #f8fafc;
          --auth-line: rgba(255, 255, 255, 0.5);
        }

        .auth-page {
          min-height: 100vh;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 5rem 1rem 2.5rem;
          overflow: hidden;
        }

        .auth-back {
          position: fixed;
          top: 1rem;
          left: 1rem;
          z-index: 10;
          border: 1px solid rgba(0,51,102,0.25);
          background: rgba(255, 255, 255, 0.86);
          color: var(--auth-primary);
          border-radius: 999px;
          padding: 0.55rem 0.95rem;
          font-weight: 700;
          cursor: pointer;
          backdrop-filter: blur(10px);
        }

        .auth-shell {
          width: min(960px, 100%);
          min-height: 560px;
          position: relative;
          overflow: hidden;
          background: var(--auth-deep);
          border: 1px solid rgba(34, 211, 238, 0.58);
          box-shadow: 0 0 30px rgba(0, 51, 102, 0.32), 0 0 18px rgba(34, 211, 238, 0.22);
          isolation: isolate;
          animation: authShellIn 0.7s ease both;
        }

        .auth-shell::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(115deg, transparent 0 38%, rgba(34, 211, 238, 0.08) 38% 39%, transparent 39%),
            radial-gradient(circle at 18% 20%, rgba(34, 211, 238, 0.16), transparent 18rem);
          pointer-events: none;
        }

        .auth-form-box {
          position: absolute;
          top: 0;
          width: 50%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 3rem;
          transition: transform 0.75s ease, opacity 0.75s ease, filter 0.75s ease;
          z-index: 2;
        }

        .auth-form-box.login {
          left: 0;
        }

        .auth-form-box.register {
          right: 0;
          transform: translateX(120%);
          opacity: 0;
          filter: blur(10px);
        }

        .auth-shell.show-register .auth-form-box.login {
          transform: translateX(-120%);
          opacity: 0;
          filter: blur(10px);
        }

        .auth-shell.show-register .auth-form-box.register {
          transform: translateX(0);
          opacity: 1;
          filter: blur(0);
        }

        .auth-card {
          width: 100%;
          color: #ffffff;
        }

        .auth-title {
          margin: 0 0 0.45rem;
          color: #ffffff;
          font-size: 1.8rem;
          font-weight: 800;
          text-align: center;
        }

        .auth-sub {
          margin: 0 0 1.2rem;
          color: rgba(255, 255, 255, 0.72);
          font-size: 0.86rem;
          line-height: 1.5;
          text-align: center;
        }

        .auth-mode-row {
          display: flex;
          gap: 0.55rem;
          margin-bottom: 1rem;
        }

        .auth-mode-btn {
          flex: 1;
          border: 1px solid rgba(34, 211, 238, 0.3);
          border-radius: 999px;
          background: transparent;
          color: rgba(255, 255, 255, 0.82);
          padding: 0.52rem 0.75rem;
          cursor: pointer;
          transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
        }

        .auth-mode-btn.active {
          background: rgba(34, 211, 238, 0.16);
          border-color: rgba(34, 211, 238, 0.72);
          color: #ffffff;
        }

        .form-group {
          position: relative;
        }

        .form-group label {
          display: block;
          color: rgba(255, 255, 255, 0.78);
          font-size: 0.78rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .form-group input {
          width: 100%;
          border: 0;
          border-bottom: 2px solid var(--auth-line);
          border-radius: 0;
          background: transparent;
          color: #ffffff;
          outline: none;
          padding: 0.72rem 2.1rem 0.72rem 0;
          font-size: 0.9rem;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .form-group input:focus {
          border-color: var(--auth-accent);
          box-shadow: 0 10px 16px -16px rgba(34, 211, 238, 0.95);
        }

        .form-group input::placeholder {
          color: rgba(255, 255, 255, 0.44);
        }

        .input-icon {
          position: absolute;
          right: 0.1rem;
          bottom: 0.78rem;
          color: rgba(255, 255, 255, 0.62);
          font-size: 0.95rem;
        }

        .auth-btn {
          width: 100%;
          margin-top: 1.35rem;
          border: 1px solid rgba(34, 211, 238, 0.45);
          border-radius: 999px;
          background: linear-gradient(135deg, var(--auth-primary), var(--auth-accent));
          color: #ffffff;
          box-shadow: 0 8px 20px rgba(34, 211, 238, 0.2), inset 0 -8px 14px rgba(0, 31, 63, 0.22);
          cursor: pointer;
          font-size: 0.92rem;
          font-weight: 800;
          padding: 0.78rem 1rem;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .auth-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 26px rgba(34, 211, 238, 0.28), inset 0 -8px 14px rgba(0, 31, 63, 0.2);
        }

        .auth-footer {
          margin-top: 1rem;
          color: rgba(255, 255, 255, 0.72);
          font-size: 0.8rem;
          text-align: center;
        }

        .auth-link-button {
          border: 0;
          background: transparent;
          color: var(--auth-accent);
          cursor: pointer;
          font-weight: 800;
          padding: 0.15rem 0.2rem;
        }

        .auth-welcome-panel {
          position: absolute;
          top: 0;
          width: 50%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          color: #ffffff;
          background:
            linear-gradient(135deg, rgba(0, 51, 102, 0.94), rgba(34, 211, 238, 0.72)),
            radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.2), transparent 14rem);
          transition: transform 0.75s ease, opacity 0.75s ease, filter 0.75s ease;
          z-index: 1;
        }

        .auth-welcome-panel::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(132deg, transparent 0 46%, rgba(0, 31, 63, 0.78) 46% 100%);
        }

        .auth-welcome-panel.login-side {
          right: 0;
        }

        .auth-welcome-panel.register-side {
          left: 0;
          transform: translateX(-120%);
          opacity: 0;
          filter: blur(10px);
        }

        .auth-shell.show-register .auth-welcome-panel.login-side {
          transform: translateX(120%);
          opacity: 0;
          filter: blur(10px);
        }

        .auth-shell.show-register .auth-welcome-panel.register-side {
          transform: translateX(0);
          opacity: 1;
          filter: blur(0);
        }

        .auth-welcome-content {
          position: relative;
          z-index: 1;
          max-width: 18rem;
          text-align: center;
        }

        .auth-welcome-content h2 {
          margin: 0 0 0.7rem;
          font-size: 2rem;
          line-height: 1.1;
          font-weight: 900;
          letter-spacing: 0;
        }

        .auth-welcome-content p {
          margin: 0;
          color: rgba(255, 255, 255, 0.82);
          font-size: 0.93rem;
          line-height: 1.65;
        }

        @keyframes authShellIn {
          from { opacity: 0; transform: translateY(18px) scale(0.98); filter: blur(8px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }

        @media (max-width: 800px) {
          .auth-page {
            align-items: flex-start;
          }

          .auth-shell {
            min-height: 760px;
          }

          .auth-form-box,
          .auth-welcome-panel {
            width: 100%;
          }

          .auth-form-box {
            height: 70%;
            bottom: 0;
            top: auto;
            padding: 2rem 1.5rem;
          }

          .auth-form-box.login,
          .auth-form-box.register {
            left: 0;
            right: auto;
          }

          .auth-form-box.register {
            transform: translateX(120%);
          }

          .auth-welcome-panel {
            height: 30%;
            top: 0;
            padding: 1.6rem;
          }

          .auth-welcome-panel.login-side,
          .auth-welcome-panel.register-side {
            left: 0;
            right: auto;
          }

          .auth-welcome-panel.register-side {
            transform: translateX(-120%);
          }
        }
      `}</style>

      <div className="auth-page">
        <button type="button" className="auth-back" onClick={goBack}>
          Back
        </button>

        <div className={`auth-shell ${authView === 'register' ? 'show-register' : ''}`}>
          <div className="auth-form-box login">
            <div className="auth-card">
              <h1 className="auth-title">
                {mode === 'student' ? 'Student Login' : 'Admin Login'}
              </h1>
              <p className="auth-sub">
                {mode === 'student'
                  ? 'Access your dashboard, courses, and progress.'
                  : 'Manage courses, modules, materials, and students.'}
              </p>

              <div className="auth-mode-row">
                <button
                  type="button"
                  onClick={() => setMode('student')}
                  className={`auth-mode-btn ${mode === 'student' ? 'active' : ''}`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setMode('admin')}
                  className={`auth-mode-btn ${mode === 'admin' ? 'active' : ''}`}
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
                  <span className="input-icon">●</span>
                </div>

                <div className="form-group" style={{ marginTop: '0.95rem' }}>
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={form.password}
                    onChange={handleChange}
                  />
                  <span className="input-icon">■</span>
                </div>

                <button className="auth-btn" type="submit">
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              <div className="auth-footer">
                Do not have an account?{' '}
                <button
                  type="button"
                  className="auth-link-button"
                  onClick={() => setAuthView('register')}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>

          <div className="auth-form-box register">
            <div className="auth-card">
              <h1 className="auth-title">Create Account</h1>
              <p className="auth-sub">
                Register once, then you can join and manage multiple courses.
              </p>

              <form onSubmit={handleRegisterSubmit}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    required
                    value={registerForm.full_name}
                    onChange={handleRegisterChange}
                  />
                  <span className="input-icon">●</span>
                </div>

                <div className="form-group" style={{ marginTop: '0.85rem' }}>
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                  />
                  <span className="input-icon">◆</span>
                </div>

                <div className="form-group" style={{ marginTop: '0.85rem' }}>
                  <label>Phone</label>
                  <input
                    type="text"
                    name="phone"
                    required
                    value={registerForm.phone}
                    onChange={handleRegisterChange}
                  />
                  <span className="input-icon">◦</span>
                </div>

                <div className="form-group" style={{ marginTop: '0.85rem' }}>
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                  />
                  <span className="input-icon">■</span>
                </div>

                <button className="auth-btn" type="submit">
                  {registerLoading ? 'Creating account...' : 'Register'}
                </button>
              </form>

              <div className="auth-footer">
                Already have an account?{' '}
                <button
                  type="button"
                  className="auth-link-button"
                  onClick={() => setAuthView('login')}
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>

          <div className="auth-welcome-panel login-side">
            <div className="auth-welcome-content">
              <h2>WELCOME BACK!</h2>
              <p>
                We are happy to have you with us again. Continue learning,
                building, and tracking your progress.
              </p>
            </div>
          </div>

          <div className="auth-welcome-panel register-side">
            <div className="auth-welcome-content">
              <h2>WELCOME!</h2>
              <p>
                Create your Stekora Tech account and keep your services,
                courses, and support in one place.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
