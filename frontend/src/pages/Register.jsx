import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await authApi.register({
        username: form.username,
        email: form.email,
        password: form.password,
      });
      login(res.data);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🏭</div>
        <h1 className="auth-title">Inventory System</h1>
        <p className="auth-subtitle">Create your account</p>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-msg">{error}</div>}
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="form-control"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              placeholder="johndoe"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-control"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@example.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-control"
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Min. 6 characters"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              className="form-control"
              type="password"
              value={form.confirmPassword}
              onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
              placeholder="Repeat your password"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '10px', marginTop: 4 }}
            disabled={submitting}
          >
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--gray-500)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
