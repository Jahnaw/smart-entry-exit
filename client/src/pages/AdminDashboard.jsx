import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { getAdminDashboard } from "../services/api";

const AdminDashboard = () => {
  const { token, student, logout } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAdminDashboard(token);

        setDashboard(data.dashboard);
      } catch (error) {
        console.error("Admin dashboard error:", error);

        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadDashboard();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="dashboard-page">
        <main className="dashboard-content">
          <p>Loading admin dashboard...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <main className="dashboard-content">
          <div className="error-message">{error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* =========================
          HEADER
      ========================= */}

      <header className="dashboard-header">
        <div>
          <h1>Smart Entry-Exit</h1>
          <p>Admin Dashboard</p>
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

          <p>Administrator</p>
        </section>

        {/* =========================
            CAMPUS STATISTICS
        ========================= */}

        <section className="history-card">
          <div className="section-header">
            <div>
              <p className="small-text">Overview</p>

              <h2>Campus Statistics</h2>
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

            <div className="admin-stat-card">
              <p className="small-text">Total Gates</p>

              <h2>{dashboard?.totalGates}</h2>
            </div>

            <div className="admin-stat-card">
              <p className="small-text">Active Gates</p>

              <h2>{dashboard?.activeGates}</h2>
            </div>
          </div>
        </section>

        {/* =========================
            ADMINISTRATION
        ========================= */}

        <section className="history-card">
          <div className="section-header">
            <div>
              <p className="small-text">Administration</p>

              <h2>Manage Campus</h2>
            </div>
          </div>

          <div className="admin-navigation">
            <a href="/admin/gates" className="admin-navigation-button">
              Manage Gates
            </a>

            <a href="/admin/students" className="admin-navigation-button">
              Student Management
            </a>

            <a href="/admin/attendance" className="admin-navigation-button">
              Attendance Management
            </a>

            <a href="/admin/wardens" className="admin-navigation-button">
              Warden Management
            </a>

            <a href="/admin/guards" className="admin-navigation-button">
              Guard Management
            </a>

            <a href="/admin/gates" className="admin-navigation-button">
              Generate / View Gate QR
            </a>
          </div>
        </section>

        {/* =========================
            RECENT ACTIVITY
        ========================= */}

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
            <div className="history-list">
              {dashboard.recentActivity.map((record) => (
                <div className="history-item" key={record._id}>
                  <div className="history-action">
                    <span
                      className={`action-badge ${record.action.toLowerCase()}`}
                    >
                      {record.action}
                    </span>
                  </div>

                  <div className="history-details">
                    <h3>{record.student?.name || "Unknown Student"}</h3>

                    <p>{record.student?.rollNumber || "Unknown Roll Number"}</p>

                    <p>Gate: {record.gate?.name || "Unknown Gate"}</p>

                    <p>{new Date(record.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
