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
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  
  const [errors, setErrors] = useState({});
  const [localError, setLocalError] = useState(''); // NEW: Replaces the error toast
  const [isProcessing, setIsProcessing] = useState(false); // Handles all button loading states
  
  // --- PHONE OTP STATES (Firebase) ---
  const [isPhoneVerifying, setIsPhoneVerifying] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);

  // --- EMAIL OTP STATES (Backend) ---
  const [isEmailVerifying, setIsEmailVerifying] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  
  const { register, loading, error, success, resetError } = useAuth();

  // ==========================================
  // 1. INITIALIZE RECAPTCHA ONCE
  // ==========================================
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
    setLocalError(''); // Clear local errors on new validation
    
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
    
    if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    } else if (!isPhoneVerified) {
      newErrors.phone = 'Please verify your phone number first';
    }
    
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

  // ==========================================
  // FIREBASE PHONE OTP HANDLERS
  // ==========================================
  const handleSendPhoneOtp = async () => {
    setLocalError('');
    if (!/^\d{10}$/.test(formData.phone)) {
      setErrors(prev => ({ ...prev, phone: 'Enter a valid 10-digit phone number' }));
      return;
    }
    
    setIsProcessing(true);
    try {
      setIsPhoneVerifying(true);
      
      const appVerifier = window.recaptchaVerifier;
      const phoneNumberWithCode = `+91${formData.phone}`; 
      
      const confirmation = await signInWithPhoneNumber(auth, phoneNumberWithCode, appVerifier);
      setConfirmationResult(confirmation);
      
      toast.success(`OTP sent to ${formData.phone}`);
    } catch (err) {
      console.error("Firebase Error:", err);
      setIsPhoneVerifying(false);
      
      if (err.code === 'auth/billing-not-enabled') {
        setLocalError("Firebase SMS billing not enabled. Use a test number.");
      } else {
        setLocalError(err.message || "Failed to send Phone OTP");
      }
      
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then(function(widgetId) {
          window.grecaptcha.reset(widgetId);
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    setLocalError('');
    if (phoneOtp.length < 6) { 
      setErrors(prev => ({ ...prev, phoneOtp: 'Please enter a valid 6-digit OTP' }));
      return;
    }
    
    setIsProcessing(true);
    try {
      await confirmationResult.confirm(phoneOtp);
      
      setIsPhoneVerified(true);
      setIsPhoneVerifying(false);
      setErrors(prev => ({ ...prev, phone: '', phoneOtp: '' }));
      toast.success("Phone verified successfully!");
      
    } catch (err) {
      console.error("OTP Verification Error:", err);
      setLocalError('Invalid OTP. Please check and try again.');
      setErrors(prev => ({ ...prev, phoneOtp: 'Invalid OTP' }));
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // BACKEND EMAIL OTP & SUBMIT HANDLERS
  // ==========================================
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
        
        // Friendly duplicate email check sent to the Alert Box
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
      await register(userData);
      
    } catch (err) {
      setLocalError(err.response?.data?.message || "Invalid Email OTP");
    } finally {
      setIsProcessing(false);
    }
  };

  // Clear errors when unmounting
  useEffect(() => {
    return () => resetError();
  }, [resetError]);

  // ==========================================
  // RENDER: EMAIL OTP SCREEN
  // ==========================================
  if (isEmailVerifying) {
    return (
      <div className="register-page">
        <div className="register-container">
          <div className="register-header">
            <h1>Verify Email</h1>
            <p>We've sent a code to <strong>{formData.email}</strong></p>
          </div>

          {/* COMBINED ERROR ALERT */}
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

  // ==========================================
  // RENDER: MAIN REGISTRATION FORM
  // ==========================================
  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Join Nighty Sale and start shopping</p>
        </div>

        {/* COMBINED ERROR ALERT BOX */}
        {(localError || error) && (
          <Alert 
            type="error" 
            message={localError || error} 
            onClose={() => { setLocalError(''); resetError(); }} 
            autoClose={false} 
          />
        )}
        
        {success && <Alert type="success" message="Registration successful! Redirecting..." autoClose={true} />}

        {/* FIREBASE INVISIBLE RECAPTCHA CONTAINER */}
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

          {/* --- PHONE INPUT WITH OTP INLINE --- */}
          <div className="phone-verification-section" style={{ position: 'relative', marginBottom: '15px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <Input
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  error={errors.phone}
                  required
                  disabled={isPhoneVerified || isProcessing || loading}
                />
              </div>
              
              {!isPhoneVerified && !isPhoneVerifying && formData.phone.length === 10 && (
                <div style={{ marginBottom: errors.phone ? '24px' : '0' }}>
                  <Button 
                    className="mybtn" 
                    type="button" 
                    variant="secondary" 
                    onClick={handleSendPhoneOtp}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Sending...' : 'Verify'}
                  </Button>
                </div>
              )}

              {isPhoneVerified && (
                <div style={{ color: '#10b981', fontWeight: 'bold' }}>
                  ✓ Verified
                </div>
              )}
            </div>

            {isPhoneVerifying && !isPhoneVerified && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ flex: 1 }}>
                  <Input
                    label="Enter Phone OTP"
                    type="text"
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    error={errors.phoneOtp}
                    disabled={isProcessing}
                  />
                </div>
                <div style={{ marginBottom: errors.phoneOtp ? '24px' : '0' }}>
                  <Button 
                    type="button" 
                    variant="primary" 
                    onClick={handleVerifyPhoneOtp}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Verifying...' : 'Confirm'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="terms-agreement">
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