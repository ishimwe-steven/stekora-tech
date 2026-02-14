import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', data.token);
      navigate('/admin');
    } catch (err) {
      alert('Login failed. Check username/password.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>
        {`
          :root {
            --richblue: #003366;
            --palegray: #f5f5f5;
            --lightgray: #9ca3af;
            --buttonblue: #0055cc;
          }

          body, html {
            margin: 0;
            padding: 0;
            font-family: 'Inter', sans-serif;
            background-color: var(--palegray);
            color: var(--richblue);
          }

          .login-wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 1rem;
          }

          .login-card {
            background-color: white;
            border-radius: 0.75rem;
            padding: 2rem;
            max-width: 400px;
            width: 100%;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            border: 1px solid var(--richblue);
          }

          .login-card h2 {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            text-align: center;
          }

          .login-card input {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid var(--lightgray);
            border-radius: 0.5rem;
            margin-bottom: 1rem;
            font-size: 1rem;
            color: var(--richblue);
          }

          .login-card input:focus {
            outline: none;
            border-color: var(--richblue);
            box-shadow: 0 0 0 2px rgba(0,51,102,0.2);
          }

          .login-card button {
            width: 100%;
            background-color: var(--richblue);
            color: white;
            font-weight: 600;
            padding: 0.75rem;
            border: none;
            border-radius: 0.5rem;
            cursor: pointer;
            transition: background 0.2s;
          }

          .login-card button:hover {
            background-color: var(--buttonblue);
          }

          .login-card button:disabled {
            background-color: var(--lightgray);
            cursor: not-allowed;
          }

          .login-footer {
            margin-top: 1rem;
            font-size: 0.85rem;
            color: var(--lightgray);
            text-align: center;
          }

          .login-footer a {
            color: var(--richblue);
            text-decoration: underline;
          }
        `}
      </style>

      <div className="login-wrapper">
        <div className="login-card">
          <h2>Admin Login</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className="login-footer">
            Forgot password? <a href="/admin/forgot">Click here</a>
          </div>
        </div>
      </div>
    </>
  );
}
