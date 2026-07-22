import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import FormInput from '../common/FormInput';
import RadioGroup from '../common/RadioGroup';
import { getUser } from '../../utils/auth';
import '../../styles/Signup.css';

const ROLE_OPTIONS = [
  { value: 'member', label: 'Member', description: 'Browse, borrow and manage your books' },
  { value: 'admin', label: 'Admin', description: 'Full access to catalog and member management' },
];

class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'member',
      loading: false,
      error: '',
      success: '',
      redirectTo: null,
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value, error: '', success: '' });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, password, role } = this.state;
    this.setState({ loading: true, error: '', success: '' });

    try {
      const response = await fetch('http://localhost:5001/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password, role }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data.token);
        this.setState({ success: 'Account created successfully! Redirecting…', loading: false });
        const user = getUser();
        const redirectTo = user && user.role === 'admin' ? '/dashboard' : '/member-dashboard';
        setTimeout(() => this.setState({ redirectTo }), 1500);
      } else {
        this.setState({ error: data.message || 'Signup failed. Please try again.', loading: false });
      }
    } catch (err) {
      this.setState({ error: 'Cannot connect to server. Make sure the backend is running.', loading: false });
    }
  };

  render() {
    const { firstName, lastName, email, password, role, loading, error, success, redirectTo } = this.state;

    if (redirectTo) {
      return <Redirect to={redirectTo} />;
    }

    return (
      <div className="signup-page">
        <div className="signup-card">
          <div className="signup-logo">
            <h1 className="signup-title">Library Management</h1>
            <p className="signup-subtitle">Create your account to get started</p>
          </div>

          <form onSubmit={this.handleSubmit} className="signup-form">
            <div className="signup-row">
              <FormInput
                label="First Name"
                name="firstName"
                value={firstName}
                onChange={this.handleChange}
                placeholder="Enter first name"
                required
                wrapperClassName="form-field-group"
              />
              <FormInput
                label="Last Name"
                name="lastName"
                value={lastName}
                onChange={this.handleChange}
                placeholder="Enter last name"
                required
                wrapperClassName="form-field-group"
              />
            </div>

            <FormInput
              label="Email Address"
              type="email"
              name="email"
              value={email}
              onChange={this.handleChange}
              placeholder="Enter your email"
              required
            />

            <FormInput
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={this.handleChange}
              placeholder="Create a password"
              required
            />

            <RadioGroup
              label="Select Role"
              name="role"
              value={role}
              onChange={this.handleChange}
              options={ROLE_OPTIONS}
            />

            {error && <div className="signup-error">{error}</div>}
            {success && <div className="signup-success">{success}</div>}

            <button type="submit" disabled={loading} className="signup-button">
              {loading ? 'Creating Account…' : 'Sign Up'}
            </button>
          </form>

          <p className="signup-login-link">
            Already have an account?{' '}
            <Link to="/login" className="signup-link">Log in</Link>
          </p>
        </div>
      </div>
    );
  }
}

export default Signup;
