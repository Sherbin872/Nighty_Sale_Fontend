import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase'; // Make sure this path is correct!
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import './Register.css'; // Assuming you have standard CSS

const Register = () => {
  const navigate = useNavigate();

  // Basic Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  // Phone Auth Specific States
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' }); // For success/error alerts

  // Firebase Confirmation Object
  const [confirmationResult, setConfirmationResult] = useState(null);

  // ==========================================
  // 1. INITIALIZE RECAPTCHA ONCE
  // ==========================================
  useEffect(() => {
    // This ensures reCAPTCHA is only created once and prevents the "already rendered" error
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response) => {
          // reCAPTCHA solved automatically
        }
      });
    }

    // Cleanup function when component unmounts
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  // Handle standard input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // If they change the phone number after verifying, reset verification
    if (e.target.name === 'phone' && isPhoneVerified) {
      setIsPhoneVerified(false);
      setOtpSent(false);
    }
  };

  // ==========================================
  // 2. SEND OTP
  // ==========================================
  const handleSendOtp = async () => {
    setMessage({ type: '', text: '' });

    if (formData.phone.length !== 10) {
      setMessage({ type: 'error', text: 'Please enter a valid 10-digit phone number.' });
      return;
    }

    setLoading(true);
    try {
      const phoneNumberWithCode = `+91${formData.phone}`; // Add India country code
      const appVerifier = window.recaptchaVerifier;

      const confirmation = await signInWithPhoneNumber(auth, phoneNumberWithCode, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setMessage({ type: 'success', text: 'OTP sent successfully!' });

    } catch (error) {
      console.error("Error sending OTP:", error);
      setMessage({ type: 'error', text: error.message || 'Failed to send OTP. Try again.' });
      
      // Reset reCAPTCHA so the user can try again
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then(function(widgetId) {
          window.grecaptcha.reset(widgetId);
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 3. VERIFY OTP
  // ==========================================
  const handleVerifyOtp = async () => {
    setMessage({ type: '', text: '' });

    if (otp.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter the 6-digit OTP.' });
      return;
    }

    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      setIsPhoneVerified(true);
      setOtpSent(false); // Hide OTP input
      setMessage({ type: 'success', text: 'Phone number verified successfully! ✓' });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setMessage({ type: 'error', text: 'Invalid OTP. Please check and try again.' });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 4. FINAL FORM SUBMIT
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPhoneVerified) {
      setMessage({ type: 'error', text: 'You must verify your phone number first.' });
      return;
    }

    // HERE: Call your actual backend API to save the user to MongoDB
    console.log("Submitting User Data to Backend:", formData);
    setMessage({ type: 'success', text: 'Account created successfully! Redirecting...' });
    
    // setTimeout(() => navigate('/login'), 2000);
  };

  return (
    <div className="register-page" style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h2>Create Account</h2>
      
      {/* Alert Messages */}
      {message.text && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '15px', 
          borderRadius: '5px',
          backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7',
          color: message.type === 'error' ? '#991b1b' : '#166534'
        }}>
          {message.text}
        </div>
      )}

      {/* FIREBASE RECAPTCHA CONTAINER (Invisible) */}
      <div id="recaptcha-container"></div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Standard Fields */}
        <div>
          <label>Full Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>

        <div>
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>

        <div>
          <label>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>

        {/* Phone Verification Section */}
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
          <label>Phone Number</label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
            <span style={{ padding: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}>+91</span>
            <input 
              type="tel" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              placeholder="10-digit number"
              disabled={isPhoneVerified}
              style={{ flex: 1, padding: '8px' }}
              maxLength="10"
            />
            
            {!isPhoneVerified && !otpSent && (
              <button type="button" onClick={handleSendOtp} disabled={loading} style={{ padding: '8px 15px', cursor: 'pointer' }}>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            )}
          </div>

          {/* OTP Entry Field (Only shows after OTP is sent) */}
          {otpSent && !isPhoneVerified && (
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                style={{ flex: 1, padding: '8px' }}
              />
              <button type="button" onClick={handleVerifyOtp} disabled={loading} style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: '#2563eb', color: 'white', border: 'none' }}>
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          )}

          {/* Success Badge */}
          {isPhoneVerified && (
            <div style={{ marginTop: '10px', color: '#16a34a', fontWeight: 'bold' }}>
              ✓ Phone Number Verified
            </div>
          )}
        </div>

        {/* Final Submit Button */}
        <button 
          type="submit" 
          disabled={!isPhoneVerified || loading}
          style={{ 
            padding: '12px', 
            backgroundColor: isPhoneVerified ? '#10b981' : '#9ca3af', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: isPhoneVerified ? 'pointer' : 'not-allowed',
            marginTop: '10px'
          }}
        >
          Complete Registration
        </button>

      </form>
    </div>
  );
};

export default Register;