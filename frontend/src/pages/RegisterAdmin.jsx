import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function RegisterAdmin() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      // POST to your backend endpoint for admin registration
      await api.post('/auth/register-admin', { username, password });
      alert('Admin registered successfully! You can now log in.');
      navigate('/admin/login');
    } catch (err) {
      console.error(err);
      alert('Registration failed. Check the console for details.');
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

          .register-wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 1rem;
          }

          .register-card {
            background-color: white;
            border-radius: 0.75rem;
            padding: 2rem;
            max-width: 400px;
            width: 100%;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            border: 1px solid var(--richblue);
          }

          .register-card h2 {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            text-align: center;
          }

          .register-card input {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid var(--lightgray);
            border-radius: 0.5rem;
            margin-bottom: 1rem;
            font-size: 1rem;
            color: var(--richblue);
          }

          .register-card input:focus {
            outline: none;
            border-color: var(--richblue);
            box-shadow: 0 0 0 2px rgba(0,51,102,0.2);
          }

          .register-card button {
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

          .register-card button:hover {
            background-color: var(--buttonblue);
          }

          .register-card button:disabled {
            background-color: var(--lightgray);
            cursor: not-allowed;
          }

          .register-footer {
            margin-top: 1rem;
            font-size: 0.85rem;
            color: var(--lightgray);
            text-align: center;
          }

          .register-footer a {
            color: var(--richblue);
            text-decoration: underline;
          }
        `}
      </style>

      <div className="register-wrapper">
        <div className="register-card">
          <h2>Register Admin</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <div className="register-footer">
            Already have an account? <a href="/admin/login">Login here</a>
          </div>
        </div>
      </div>
    </>
  );
}
