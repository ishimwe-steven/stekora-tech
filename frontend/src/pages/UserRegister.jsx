import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function UserRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    course_id: '',
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCourses() {
      try {
        const { data } = await api.get('/courses');
        setCourses(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadCourses();
  }, []);

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
          background: linear-gradient(135deg, #22c55e, #16a34a);
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
          <h1 className="auth-title">Create Student Account</h1>
          <p className="auth-sub">
            Register to track your study applications and access course content.
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
              <label>Course</label>
              <select
                name="course_id"
                required
                value={form.course_id}
                onChange={handleChange}
              >
                <option value="">Select a course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
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
    </>
  );
}

