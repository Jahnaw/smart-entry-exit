import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

import {
  signupStudent,
  getActiveHostels,
} from "../services/api";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    email: "",
    password: "",
    phone: "",
    hostelId: "",
  });

  const [hostels, setHostels] = useState([]);
  const [hostelsLoading, setHostelsLoading] =
    useState(true);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const loadHostels = async () => {
      try {
        setHostelsLoading(true);
        setError("");

        const data = await getActiveHostels();

        setHostels(data.hostels);
      } catch (error) {
        console.error(
          "Load hostels error:",
          error
        );

        setError(error.message);
      } finally {
        setHostelsLoading(false);
      }
    };

    loadHostels();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.hostelId) {
      setError("Please select your hostel.");
      return;
    }

    setLoading(true);

    try {
      await signupStudent(formData);

      navigate("/login");
    } catch (error) {
      console.error(
        "Signup error:",
        error
      );

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card-wrapper wrapper-signup">
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
            <h1 className="auth-title">Sign Up to SmartEntry</h1>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group notched">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
              </div>
            </div>

            <div className="form-group notched">
              <label htmlFor="rollNumber">Roll Number</label>
              <div className="input-wrapper">
                <input
                  id="rollNumber"
                  name="rollNumber"
                  type="text"
                  placeholder="e.g. 21BCS101"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  required
                />
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="14" x="3" y="5" rx="2"/>
                    <line x1="7" x2="11" y1="9" y2="9"/>
                    <line x1="7" x2="13" y1="13" y2="13"/>
                  </svg>
                </span>
              </div>
            </div>

            <div className="form-group notched">
              <label htmlFor="email">E-mail</label>
              <div className="input-wrapper">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleChange}
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
              <label htmlFor="phone">Phone Number</label>
              <div className="input-wrapper">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </span>
              </div>
            </div>

            <div className="form-group notched">
              <label htmlFor="hostelId">Hostel</label>
              <div className="input-wrapper">
                <select
                  id="hostelId"
                  name="hostelId"
                  value={formData.hostelId}
                  onChange={handleChange}
                  required
                  disabled={hostelsLoading}
                >
                  <option value="">
                    {hostelsLoading
                      ? "Loading hostels..."
                      : "Select your hostel"}
                  </option>
                  {hostels.map((hostel) => (
                    <option key={hostel._id} value={hostel._id}>
                      {hostel.name} ({hostel.code})
                    </option>
                  ))}
                </select>
                <span className="select-arrow">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </span>
              </div>
            </div>

            <div className="form-group notched">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
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
              disabled={
                loading ||
                hostelsLoading ||
                hostels.length === 0
              }
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>

          <div className="auth-divider">
            <span>or sign up with</span>
          </div>

          <div className="social-buttons">
            <button
              type="button"
              className="social-button"
              onClick={() => {}}
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
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;