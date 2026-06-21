import React, { useState } from 'react';
import { Redirect, Link } from 'react-router-dom';
import FormInput from './common/FormInput';
import '../styles/Login.css';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [redirectToHome, setRedirectToHome] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data.token);
        setRedirectToHome(true);
      } else {
        setError(data.message || 'Login failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      setError('Cannot connect to server. Make sure the backend is running.');
      setLoading(false);
    }
  };

  if (redirectToHome) {
    return <Redirect to="/" />;
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <h1 className="login-title">Library Management</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <FormInput
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />

          <FormInput
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />

          {error && <div className="login-error">{error}</div>}

          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'Signing in…' : 'Log In'}
          </button>
        </form>

        <p className="login-footer">
          Don't have an account?{' '}
          <Link to="/signup" className="login-link">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
