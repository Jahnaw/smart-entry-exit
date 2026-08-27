import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { loginStudent, registerDevice } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login, deviceToken, saveDeviceToken, logout } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
  event.preventDefault();

  setError("");
  setLoading(true);

  try {
    const data = await loginStudent({
      email,
      password,
    });

    login(data);

    try {
      const deviceData = await registerDevice(
        data.token,
        deviceToken
      );

      if (deviceData.deviceToken) {
        saveDeviceToken(
          deviceData.deviceToken
        );
      }
    } catch (deviceError) {
      logout();
      throw deviceError;
    }

    navigate("/dashboard");
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Login to manage your campus entry and exit.</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">College Email</label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
