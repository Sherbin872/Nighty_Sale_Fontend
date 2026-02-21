// src/pages/Register/Register.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import Alert from '../../components/common/Alert/Alert';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  
  const [errors, setErrors] = useState({});
  
  const { register, loading, error, success, resetError } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = formData;
      await register(userData);
    }
  };

  useEffect(() => {
    return () => resetError();
  }, [resetError]);

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Join Nighty Sale and start shopping</p>
        </div>

        {error && (
          <Alert
            type="error"
            message={error}
            onClose={resetError}
            autoClose={true}
          />
        )}

        {success && (
          <Alert
            type="success"
            message="Registration successful! Redirecting..."
            autoClose={true}
          />
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <Input
            label="Full Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            error={errors.name}
            required
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            error={errors.email}
            required
          />

          <div className="form-row">
            <div className="form-col">
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create password"
                error={errors.password}
                required
              />
            </div>
            <div className="form-col">
              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                error={errors.confirmPassword}
                required
              />
            </div>
          </div>

          <Input
            label="Phone Number"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            error={errors.phone}
          />

          <div className="terms-agreement">
            <label className="checkbox-label">
              <input type="checkbox" required />
              <span>
                I agree to the{' '}
                <Link to="/terms" className="link">
                  Terms & Conditions
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="link">
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            Create Account
          </Button>
        </form>

        <div className="register-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;