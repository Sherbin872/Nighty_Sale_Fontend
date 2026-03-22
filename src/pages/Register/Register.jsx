import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import Alert from '../../components/common/Alert/Alert';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// FIREBASE IMPORTS
import { auth } from '../../firebase'; 
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import axiosInstance from '../../api/axiosConfig';

import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  
  // 1. ADDED ADDRESS FIELDS TO STATE
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    // phone: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
  });
  
  const [errors, setErrors] = useState({});
  const [localError, setLocalError] = useState(''); 
  const [isProcessing, setIsProcessing] = useState(false); 
  
  // --- PHONE OTP STATES (Firebase) ---
  const [isPhoneVerifying, setIsPhoneVerifying] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);

  // --- EMAIL OTP STATES (Backend) ---
  const [isEmailVerifying, setIsEmailVerifying] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  
  const { register, loading, error, success, resetError } = useAuth();

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response) => {}
      });
    }

    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const validateForm = () => {
    const newErrors = {};
    setLocalError(''); 
    
    // Basic Details Validation
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    
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

    // 2. ADDED ADDRESS VALIDATION
    if (!formData.address.trim()) newErrors.address = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    
    if (!formData.pinCode.trim()) {
      newErrors.pinCode = 'PIN code is required';
    } else if (!/^\d{6}$/.test(formData.pinCode.trim())) {
      newErrors.pinCode = 'Enter a valid 6-digit PIN code';
    }
    
    // if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
    //   newErrors.phone = 'Phone number must be 10 digits';
    // } else if (!isPhoneVerified) {
    //   newErrors.phone = 'Please verify your phone number first';
    // }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (localError) setLocalError('');

    if (name === 'phone' && isPhoneVerified) {
      setIsPhoneVerified(false);
    }
  };

  // ... (Firebase Phone OTP handlers remain the same) ...

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    if (validateForm()) {
      setIsProcessing(true); 
      try {
        await axiosInstance.post('/users/send-email-otp', { 
          email: formData.email, 
          name: formData.name 
        });
        
        setIsEmailVerifying(true);
        toast.success(`Verification code sent to ${formData.email}`);
      } catch (err) {
        console.error("Error sending Email OTP:", err);
        const errorMessage = err.response?.data?.message || "";
        
        if (errorMessage.includes("already exists") || errorMessage.toLowerCase().includes("duplicate")) {
          setLocalError("👋 This email is already registered. Please go to Sign In!");
        } else {
          setLocalError(errorMessage || "Failed to send verification email");
        }
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    if (!emailOtp) {
      setLocalError("Please enter the email verification code");
      return;
    }

    setIsProcessing(true);
    try {
      await axiosInstance.post('/users/verify-email-otp', { email: formData.email, otp: emailOtp });
      
      const { confirmPassword, ...userData } = formData;
      // userData now automatically contains address, city, state, and pinCode!
      await register(userData);
      
    } catch (err) {
      setLocalError(err.response?.data?.message || "Invalid Email OTP");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    return () => resetError();
  }, [resetError]);

  if (isEmailVerifying) {
    return (
      <div className="register-page">
        {/* ... existing Email UI code stays exactly the same ... */}
        <div className="register-container">
          <div className="register-header">
            <h1>Verify Email</h1>
            <p>We've sent a code to <strong>{formData.email}</strong></p>
          </div>

          {(localError || error) && (
            <Alert 
              type="error" 
              message={localError || error} 
              onClose={() => { setLocalError(''); resetError(); }} 
            />
          )}

          <form onSubmit={handleCompleteRegistration} className="register-form">
            <Input
              label="Enter Email Verification Code"
              type="text"
              value={emailOtp}
              onChange={(e) => setEmailOtp(e.target.value)}
              placeholder="e.g. 123456"
              required
              disabled={isProcessing || loading}
            />
            
            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              loading={isProcessing || loading}
              disabled={isProcessing || loading}
            >
              {isProcessing || loading ? 'Creating Account...' : 'Complete Registration'}
            </Button>

            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <button 
                type="button" 
                onClick={() => { setIsEmailVerifying(false); setLocalError(''); }}
                style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}
                disabled={isProcessing || loading}
              >
                ← Back to Edit Details
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Join Manavaatti and start shopping</p>
        </div>

        {(localError || error) && (
          <Alert 
            type="error" 
            message={localError || error} 
            onClose={() => { setLocalError(''); resetError(); }} 
            autoClose={false} 
          />
        )}
        
        {success && <Alert type="success" message="Registration successful! Redirecting..." autoClose={true} />}

        <div id="recaptcha-container"></div>

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
            disabled={isProcessing || loading}
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
            disabled={isProcessing || loading}
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
                disabled={isProcessing || loading}
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
                disabled={isProcessing || loading}
              />
            </div>
          </div>

          {/* 3. ADDED ADDRESS UI SECTION */}
          <div className="address-section" style={{ marginTop: '10px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#333' }}>Shipping Details</h3>
            
            <Input
              label="Street Address / Flat No."
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your full address"
              error={errors.address}
              required
              disabled={isProcessing || loading}
            />

            <div className="form-row">
              <div className="form-col">
                <Input
                  label="City / District"
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  error={errors.city}
                  required
                  disabled={isProcessing || loading}
                />
              </div>
              <div className="form-col">
                <Input
                  label="State"
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Enter state"
                  error={errors.state}
                  required
                  disabled={isProcessing || loading}
                />
              </div>
            </div>

            <Input
              label="PIN Code"
              type="text"
              name="pinCode"
              value={formData.pinCode}
              onChange={handleChange}
              placeholder="6-digit PIN code"
              error={errors.pinCode}
              required
              maxLength="6"
              disabled={isProcessing || loading}
            />
          </div>
          {/* END ADDRESS UI SECTION */}

          {/* ... Commented out Phone UI ... */}

          <div className="terms-agreement" style={{ marginTop: '15px' }}>
            <label className="checkbox-label">
              <input type="checkbox" required disabled={isProcessing || loading} />
              <span>
                I agree to the{' '}
                <Link to="/terms" className="link">Terms & Conditions</Link>{' '}
                and{' '}
                <Link to="/privacy" className="link">Privacy Policy</Link>
              </span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            loading={isProcessing || loading}
            disabled={isProcessing || loading}
          >
            {isProcessing ? 'Processing...' : 'Send Email Verification'}
          </Button>
        </form>

        <div className="register-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;