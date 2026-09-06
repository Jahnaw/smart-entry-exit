import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

import {
  loginStudent,
  registerDevice,
} from "../services/api";

import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();

  const {
    login,
    deviceToken,
    saveDeviceToken,
    logout,
  } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showToast, setShowToast] =
    useState(false);

  const handleGoogleClick = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      // ==========================================
      // 1. Login
      // ==========================================

      const data =
        await loginStudent({
          email,
          password,
        });

      // Save authentication information
      login(data);

      // ==========================================
      // 2. ADMIN
      // ==========================================

      if (
        data.student.role === "ADMIN"
      ) {
        navigate(
          "/admin/dashboard"
        );

        return;
      }

      // ==========================================
      // 3. WARDEN
      // ==========================================
      //
      // Wardens DO NOT use device verification.
      //

      if (
        data.student.role === "WARDEN"
      ) {
        navigate(
          "/warden/dashboard"
        );

        return;
      }

      // ==========================================
      // 4. GUARD
      // ==========================================
      //
      // Guards DO NOT use device verification.
      //

      if (
        data.student.role === "GUARD"
      ) {
        navigate(
          "/guard/dashboard"
        );

        return;
      }

      // ==========================================
      // 5. STUDENT
      // ==========================================
      //
      // Students MUST verify their device.
      //

      if (
        data.student.role === "STUDENT"
      ) {
        try {
          const deviceData =
            await registerDevice(
              data.token,
              deviceToken
            );

          // First-time device registration
          if (
            deviceData.deviceToken
          ) {
            saveDeviceToken(
              deviceData.deviceToken
            );
          }
        } catch (deviceError) {
          // Device verification failed,
          // so don't keep the user logged in.
          logout();

          throw deviceError;
        }

        navigate("/dashboard");

        return;
      }

      // ==========================================
      // 6. Unknown role
      // ==========================================

      logout();

      throw new Error(
        "Invalid account role"
      );
    } catch (error) {
      setError(
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card-wrapper">
        <Link to="/" className="auth-brand">
          <div className="brand-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <span className="brand-name">SmartEntry</span>
        </Link>

        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-pretitle">Start your journey</span>
            <h1 className="auth-title">Sign In to SmartEntry</h1>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group notched">
              <label htmlFor="email">E-mail</label>
              <div className="input-wrapper">
                <input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </span>
              </div>
            </div>

            <div className="form-group notched">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  className="input-icon-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                      <line x1="2" x2="22" y1="2" y2="22"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="auth-divider">
            <span>or sign in with</span>
          </div>

          <div className="social-buttons">
            <button
              type="button"
              className="social-button"
              onClick={handleGoogleClick}
              title="Google Sign In"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27A7.17 7.17 0 0 1 4.9 12c0-.79.14-1.57.38-2.27V6.58H1.25A11.97 11.97 0 0 0 0 12c0 1.92.45 3.74 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15C6.23 6.85 8.88 4.75 12 4.75z"/>
              </svg>
              Google
            </button>
          </div>

          <p className="auth-footer">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>

        {/* Coming Soon Toast */}
        {showToast && (
          <div className="toast-overlay">
            <div className="toast-popup">
              <div className="toast-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <div className="toast-content">
                <h3 className="toast-title">Coming Soon!</h3>
                <p className="toast-message">Google Sign-In is currently under development. Stay tuned!</p>
              </div>
              <button className="toast-close" onClick={() => setShowToast(false)} aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;