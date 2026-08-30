import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { getGuardHostels, getGuardHostelStudents } from "../services/api";

const GuardDashboard = () => {
  const { token, student, logout } = useAuth();

  const [hostels, setHostels] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState("");

  const [hostelData, setHostelData] = useState(null);

  const [loadingHostels, setLoadingHostels] = useState(true);

  const [loadingStudents, setLoadingStudents] = useState(false);

  const [error, setError] = useState("");

  // ==========================================
  // Load hostels
  // ==========================================

  useEffect(() => {
    const loadHostels = async () => {
      try {
        setLoadingHostels(true);
        setError("");

        const data = await getGuardHostels(token);

        setHostels(data.hostels || []);
      } catch (error) {
        console.error("Guard hostels error:", error);

        setError(error.message);
      } finally {
        setLoadingHostels(false);
      }
    };

    if (token) {
      loadHostels();
    }
  }, [token]);

  // ==========================================
  // Load students when hostel changes
  // ==========================================

  const handleHostelChange = async (event) => {
    const hostelId = event.target.value;

    setSelectedHostel(hostelId);
    setHostelData(null);

    if (!hostelId) {
      return;
    }

    try {
      setLoadingStudents(true);
      setError("");

      const data = await getGuardHostelStudents(token, hostelId);

      setHostelData(data);
    } catch (error) {
      console.error("Guard hostel students error:", error);

      setError(error.message);
    } finally {
      setLoadingStudents(false);
    }
  };

  return (
    <div className="dashboard-page">
      {/* =========================
          HEADER
      ========================= */}

      <header className="dashboard-header">
        <div>
          <h1>Smart Entry-Exit</h1>

          <p>Guard Dashboard</p>
        </div>

        <button className="logout-button" onClick={logout}>
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        {/* =========================
            WELCOME
        ========================= */}

        <section className="welcome-card">
          <p className="small-text">Welcome</p>

          <h2>{student?.name}</h2>

          <p>Campus Guard</p>
        </section>

        {/* =========================
            HOSTEL SELECTION
        ========================= */}

        <section className="history-card">
          <div className="section-header">
            <p className="small-text">Hostel Search</p>

            <h2>Select Hostel</h2>
          </div>

          <div className="guard-hostel-selector">
            <label htmlFor="hostel">Hostel</label>

            <select
              id="hostel"
              value={selectedHostel}
              onChange={handleHostelChange}
              disabled={loadingHostels}
            >
              <option value="">
                {loadingHostels ? "Loading hostels..." : "Select a hostel"}
              </option>

              {hostels.map((hostel) => (
                <option key={hostel._id} value={hostel._id}>
                  {hostel.name} ({hostel.code})
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* =========================
            ERROR
        ========================= */}

        {error && <div className="error-message">{error}</div>}

        {/* =========================
            LOADING
        ========================= */}

        {loadingStudents && (
          <section className="history-card">
            <p>Loading hostel students...</p>
          </section>
        )}

        {/* =========================
            HOSTEL INFORMATION
        ========================= */}

        {hostelData && !loadingStudents && (
          <>
            <section className="history-card">
              <div className="section-header">
                <p className="small-text">Selected Hostel</p>

                <h2>{hostelData.hostel.name}</h2>

                <p>Code: {hostelData.hostel.code}</p>
              </div>

              {/* =========================
                    STATISTICS
                ========================= */}

              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <p className="small-text">Total Students</p>

                  <h2>{hostelData.statistics.totalStudents}</h2>
                </div>

                <div className="admin-stat-card">
                  <p className="small-text">Students Inside</p>

                  <h2>{hostelData.statistics.studentsInside}</h2>
                </div>

                <div className="admin-stat-card">
                  <p className="small-text">Students Outside</p>

                  <h2>{hostelData.statistics.studentsOutside}</h2>
                </div>
              </div>
            </section>

            {/* =========================
                  STUDENT LIST
              ========================= */}

            <section className="history-card">
              <div className="section-header">
                <p className="small-text">Hostel Students</p>

                <h2>Student Details</h2>
              </div>

              {hostelData.students?.length === 0 && (
                <p className="history-empty">
                  No students found in this hostel.
                </p>
              )}

              {hostelData.students?.length > 0 && (
                <div className="guard-student-table-wrapper">
                  <div className="guard-student-table">
                    <div className="guard-student-header">
                      <div>Student</div>
                      <div>Roll Number</div>
                      <div>Email</div>
                      <div>Phone</div>
                      <div>Status</div>
                    </div>

                    {hostelData.students.map((student) => (
                      <div className="guard-student-row" key={student._id}>
                        <div className="guard-student-name">
                          <strong>{student.name}</strong>
                        </div>

                        <div className="guard-student-roll">
                          {student.rollNumber}
                        </div>

                        <div className="guard-student-email">
                          {student.email}
                        </div>

                        <div className="guard-student-phone">
                          {student.phone || "—"}
                        </div>

                        <div>
                          <span
                            className={`student-status ${student.status?.toLowerCase()}`}
                          >
                            {student.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default GuardDashboard;
