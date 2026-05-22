import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function UserRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    api.post('/students/register', form)
      .then(() => {
        alert('Registration successful. Please login.');
        navigate('/login');
      })
      .catch((err) => {
        console.error(err);
        alert(err.response?.data?.msg || 'Registration failed');
      })
      .finally(() => setLoading(false));
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
          --auth-bg: #15141b;
          --auth-panel: #f8fafc;
          --auth-line: #9ca3af;
        }

        .auth-page {
          background:
            radial-gradient(circle at 18% 20%, rgba(34, 211, 238, 0.2), transparent 28rem),
            linear-gradient(135deg, #f5f5f5, #e0f2fe 52%, #f8fafc);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 5rem 1rem 2.5rem;
          color: #fff;
          position: relative;
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
          min-height: 520px;
          display: grid;
          grid-template-columns: minmax(0, 0.95fr) minmax(340px, 1fr);
          border: 1px solid rgba(0, 51, 102, 0.75);
          background: var(--auth-panel);
          box-shadow: 0 0 28px rgba(0, 51, 102, 0.18);
          overflow: hidden;
          position: relative;
          isolation: isolate;
          animation: authReveal 0.75s ease both;
        }

        .auth-welcome {
          position: relative;
          padding: 4.25rem 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: linear-gradient(135deg, rgba(0,51,102,0.96), rgba(34,211,238,0.75));
          overflow: hidden;
        }

        .auth-welcome::after {
          content: "";
          position: absolute;
          top: -8%;
          right: -32%;
          width: 74%;
          height: 120%;
          background: var(--auth-panel);
          transform: skewX(-33deg);
          transform-origin: top;
          box-shadow: -14px 0 25px rgba(0, 31, 63, 0.18);
        }

        .auth-welcome-content {
          position: relative;
          z-index: 1;
          max-width: 17rem;
          animation: slideFromLeft 0.75s ease both;
        }

        .auth-welcome h2 {
          margin: 0 0 0.7rem;
          font-size: 2rem;
          letter-spacing: 0;
        }

        .auth-welcome p {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.65;
          color: rgba(255,255,255,0.84);
        }

        .auth-card {
          padding: 2.5rem 3rem;
          animation: slideFromRight 0.75s ease both;
        }

        .auth-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--auth-primary);
          margin-bottom: 0.25rem;
        }

        .auth-sub {
          font-size: 0.85rem;
          color: #475569;
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 0.3rem;
          color: var(--auth-primary);
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 0.75rem 0;
          border-radius: 0;
          border: none;
          border-bottom: 2px solid var(--auth-line);
          font-size: 0.85rem;
          color: #0f172a;
          background: transparent;
          outline: none;
          transition: border-color 0.25s ease;
        }

        .form-group select option {
          color: #111827;
        }

        .form-group input:focus,
        .form-group select:focus {
          border-color: var(--auth-primary);
        }

        .auth-btn {
          margin-top: 1.3rem;
          width: 100%;
          border: none;
          padding: 0.8rem 1.2rem;
          border-radius: 999px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #fff;
          cursor: pointer;
          background: linear-gradient(135deg, var(--auth-primary), #4f46e5);
          box-shadow: 0 8px 18px rgba(0, 51, 102, 0.28);
          transition: transform 0.25s ease, opacity 0.25s ease;
        }

        .auth-btn:hover {
          opacity: 0.96;
          transform: translateY(-1px);
        }

        .auth-footer {
          margin-top: 1rem;
          font-size: 0.8rem;
          color: #64748b;
          text-align: center;
        }

        .auth-footer a {
          color: var(--auth-primary);
          text-decoration: none;
          font-weight: 600;
        }

        @keyframes authReveal {
          from { opacity: 0; transform: translateY(18px) scale(0.98); filter: blur(8px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }

        @keyframes slideFromLeft {
          from { opacity: 0; transform: translateX(-55px); filter: blur(8px); }
          to { opacity: 1; transform: translateX(0); filter: blur(0); }
        }

        @keyframes slideFromRight {
          from { opacity: 0; transform: translateX(55px); filter: blur(8px); }
          to { opacity: 1; transform: translateX(0); filter: blur(0); }
        }

        @media (max-width: 760px) {
          .auth-page {
            align-items: flex-start;
          }

          .auth-shell {
            grid-template-columns: 1fr;
          }

          .auth-welcome {
            min-height: 190px;
            padding: 2.25rem 1.6rem;
          }

          .auth-welcome::after {
            right: -52%;
          }

          .auth-card {
            padding: 2rem 1.6rem;
          }
        }
      `}</style>

      <div className="auth-page">
        <button type="button" className="auth-back" onClick={goBack}>
          Back
        </button>

        <div className="auth-shell">
          <div className="auth-welcome">
            <div className="auth-welcome-content">
              <h2>JOIN US!</h2>
              <p>
                Create your student account and keep your applications,
                courses, and support requests in one place.
              </p>
            </div>
          </div>

          <div className="auth-card">
            <h1 className="auth-title">Create Student Account</h1>
            <p className="auth-sub">
              Register once, then you can join and manage multiple courses from your account.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  required
                  value={form.full_name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group" style={{ marginTop: '0.85rem' }}>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group" style={{ marginTop: '0.85rem' }}>
                <label>Phone</label>
                <input
                  type="text"
                  name="phone"
                  required
                  value={form.phone}
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
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className="auth-footer">
              Already have an account? <Link to="/login">Login</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

