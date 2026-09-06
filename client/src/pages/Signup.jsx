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

    // Clear the previous error while the user edits
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const rollNumber = formData.rollNumber.trim();
    const email = formData.email.trim().toLowerCase();

    // Roll number must contain exactly 10 digits
    if (!/^\d{10}$/.test(rollNumber)) {
      setError(
        "Roll number must be exactly 10 digits."
      );
      return;
    }

    // College email must be:
    // rollnumber@mmmut.ac.in
    const expectedEmail =
      `${rollNumber}@mmmut.ac.in`;

    if (email !== expectedEmail) {
      setError(
        `Please use your college email: ${expectedEmail}`
      );
      return;
    }

    if (!formData.hostelId) {
      setError("Please select your hostel.");
      return;
    }

    setLoading(true);

    try {
      await signupStudent({
        ...formData,
        rollNumber,
        email,
      });

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
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>

          <p>
            Register as a student to use
            Smart Entry-Exit.
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">
              Full Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="rollNumber">
              Roll Number
            </label>

            <input
              id="rollNumber"
              name="rollNumber"
              type="text"
              placeholder="Enter 10-digit roll number"
              value={formData.rollNumber}
              onChange={handleChange}
              required
              maxLength={10}
              inputMode="numeric"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              College Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="yourrollnumber@mmmut.ac.in"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">
              Phone Number
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="hostelId">
              Hostel
            </label>

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
                <option
                  key={hostel._id}
                  value={hostel._id}
                >
                  {hostel.name} ({hostel.code})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
            />
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
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;