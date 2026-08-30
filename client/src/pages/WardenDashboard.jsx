import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { getWardenDashboard } from "../services/api";

const WardenDashboard = () => {
  const { token, student, logout } = useAuth();

  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getWardenDashboard(token);

        setDashboard(data.dashboard);
      } catch (error) {
        console.error("Warden dashboard error:", error);

        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadDashboard();
    }
  }, [token]);

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <div className="dashboard-page">
        <main className="dashboard-content">
          <p>Loading warden dashboard...</p>
        </main>
      </div>
    );
  }

  // ==========================================
  // Error
  // ==========================================

  if (error) {
    return (
      <div className="dashboard-page">
        <main className="dashboard-content">
          <div className="error-message">{error}</div>
        </main>
      </div>
    );
  }

  // ==========================================
  // Dashboard
  // ==========================================

  return (
    <div className="dashboard-page">
      {/* ========================================
          HEADER
      ======================================== */}

      <header className="dashboard-header">
        <div>
          <h1>Smart Entry-Exit</h1>

          <p>Warden Dashboard</p>
        </div>

        <button className="logout-button" onClick={logout}>
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        {/* ======================================
            WELCOME
        ====================================== */}

        <section className="welcome-card">
          <div className="welcome-content">
            <div>
              <p className="small-text">Welcome back</p>

              <h2>{student?.name || dashboard?.warden?.name}</h2>

              <p>
                {dashboard?.hostel?.name
                  ? `Managing ${dashboard.hostel.name}`
                  : "Warden"}
              </p>
            </div>

            <div className="welcome-role">Warden</div>
          </div>
        </section>

        {/* ======================================
            HOSTEL
        ====================================== */}

        <section className="hostel-info-card">
          <div>
            <p className="small-text">Assigned Hostel</p>

            <h2>{dashboard?.hostel?.name}</h2>

            <p className="hostel-code">
              Hostel Code: <strong>{dashboard?.hostel?.code}</strong>
            </p>
          </div>

          <div className="hostel-badge">Assigned</div>
        </section>

        {/* ======================================
            STATISTICS
        ====================================== */}

        <section className="history-card">
          <div className="section-header">
            <div>
              <p className="small-text">Overview</p>

              <h2>Hostel Statistics</h2>
            </div>
          </div>

          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <p className="small-text">Total Students</p>

              <h2>{dashboard?.totalStudents}</h2>
            </div>

            <div className="admin-stat-card">
              <p className="small-text">Students Inside</p>

              <h2>{dashboard?.studentsInside}</h2>
            </div>

            <div className="admin-stat-card">
              <p className="small-text">Students Outside</p>

              <h2>{dashboard?.studentsOutside}</h2>
            </div>
          </div>
        </section>

        <section className="history-card">
          <div className="section-header">
            <div>
              <p className="small-text">Management</p>

              <h2>Hostel Management</h2>
            </div>
          </div>

          <div className="admin-navigation">
            <a href="/warden/students" className="admin-navigation-button">
              View Hostel Students
            </a>

            <a href="/warden/attendance" className="admin-navigation-button">
              View Attendance
            </a>
          </div>
        </section>

        {/* ======================================
            RECENT ACTIVITY
        ====================================== */}

        <section className="history-card">
          <div className="section-header">
            <div>
              <p className="small-text">Live Activity</p>

              <h2>Recent Entry / Exit</h2>
            </div>
          </div>

          {dashboard?.recentActivity?.length === 0 && (
            <p className="history-empty">No attendance activity yet.</p>
          )}

          {dashboard?.recentActivity?.length > 0 && (
            <div className="activity-table-wrapper">
              <div className="activity-table">
                <div className="activity-table-header">
                  <div>Student</div>
                  <div>Status</div>
                  <div>Gate</div>
                  <div>Time</div>
                </div>

                {dashboard.recentActivity.map((record) => (
                  <div className="activity-table-row" key={record._id}>
                    <div className="activity-student">
                      <strong>
                        {record.student?.name || "Unknown Student"}
                      </strong>

                      <span>
                        {record.student?.rollNumber || "Unknown Roll Number"}
                      </span>
                    </div>

                    <div>
                      <span
                        className={`action-badge ${record.action.toLowerCase()}`}
                      >
                        {record.action}
                      </span>
                    </div>

                    <div className="activity-gate">
                      {record.gate?.name || "Unknown Gate"}
                    </div>

                    <div className="activity-time">
                      {new Date(record.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default WardenDashboard;
