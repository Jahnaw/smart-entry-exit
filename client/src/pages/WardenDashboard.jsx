import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getWardenDashboard } from "../services/api";
import AdminShell from "../components/AdminShell";
import "../styles/admin.css";

const WardenDashboard = () => {
  const { token, student } = useAuth();

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

  const hostelName = dashboard?.hostel?.name;
  const hostelCode = dashboard?.hostel?.code;

  return (
    <AdminShell
      title="Warden Dashboard"
      subtitle={hostelName ? `Hostel Management / ${hostelName}` : "Hostel Management"}
      portalType="warden"
      hostelInfo={hostelName ? `${hostelName} (${hostelCode})` : undefined}
    >
      {/* Welcome Banner */}
      <div className="admin-welcome-banner">
        <div className="admin-welcome-text">
          <h2>Welcome, {student?.name || dashboard?.warden?.name || "Warden"}</h2>
          <p>
            {hostelName
              ? `Currently supervising resident activities for ${hostelName}.`
              : "Welcome to the hostel warden supervision portal."}
          </p>
        </div>
        <div className="admin-welcome-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18" />
            <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
          </svg>
          <span>{hostelName ? `Hostel: ${hostelCode}` : "Warden Station"}</span>
        </div>
      </div>

      {loading && (
        <div className="admin-panel">
          <div className="admin-empty-state">
            <p>Loading hostel dashboard...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="admin-alert-error">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12" y1="16" y2="16.01" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Hostel Info Banner */}
          {dashboard?.hostel && (
            <div className="admin-info-banner">
              <div>
                <h3>{dashboard.hostel.name}</h3>
                <p>Official Designation Code: <strong>{dashboard.hostel.code}</strong></p>
              </div>
              <span className="admin-info-banner-badge">Active Assignment</span>
            </div>
          )}

          {/* KPI Statistics */}
          <div className="admin-kpi-grid">
            <div className="admin-kpi-card">
              <div className="admin-kpi-icon blue">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
              <div className="admin-kpi-info">
                <span className="admin-kpi-label">Hostel Residents</span>
                <div className="admin-kpi-value">{dashboard?.totalStudents ?? 0}</div>
              </div>
            </div>

            <div className="admin-kpi-card">
              <div className="admin-kpi-icon green">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" x2="3" y1="12" y2="12" />
                </svg>
              </div>
              <div className="admin-kpi-info">
                <span className="admin-kpi-label">Currently Inside</span>
                <div className="admin-kpi-value">{dashboard?.studentsInside ?? 0}</div>
              </div>
            </div>

            <div className="admin-kpi-card">
              <div className="admin-kpi-icon amber">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" x2="9" y1="12" y2="12" />
                </svg>
              </div>
              <div className="admin-kpi-info">
                <span className="admin-kpi-label">Currently Outside</span>
                <div className="admin-kpi-value">{dashboard?.studentsOutside ?? 0}</div>
              </div>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="admin-panel">
            <div className="admin-panel-header">
              <div className="admin-panel-title-area">
                <span className="admin-panel-eyebrow">Hostel Administration</span>
                <h3 className="admin-panel-title">Quick Actions</h3>
              </div>
            </div>

            <div className="admin-panel-body">
              <div className="admin-nav-grid">
                <Link to="/warden/students" className="admin-action-card">
                  <div className="admin-action-card-content">
                    <div className="admin-action-card-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <div className="admin-action-card-info">
                      <h4>Hostel Residents</h4>
                      <p>View registered student directory</p>
                    </div>
                  </div>
                  <div className="admin-action-card-arrow">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </Link>

                <Link to="/warden/attendance" className="admin-action-card">
                  <div className="admin-action-card-content">
                    <div className="admin-action-card-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="4" rx="2" />
                        <path d="M3 10h18" />
                        <path d="m9 16 2 2 4-4" />
                      </svg>
                    </div>
                    <div className="admin-action-card-info">
                      <h4>Attendance Logs</h4>
                      <p>Inspect gate scan history</p>
                    </div>
                  </div>
                  <div className="admin-action-card-arrow">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Live Recent Activity */}
          <div className="admin-panel">
            <div className="admin-panel-header">
              <div className="admin-panel-title-area">
                <span className="admin-panel-eyebrow">Real-Time Monitor</span>
                <h3 className="admin-panel-title">Recent Movement for {hostelName || "Hostel"}</h3>
              </div>
            </div>

            <div className="admin-panel-body" style={{ padding: 0 }}>
              {(!dashboard?.recentActivity || dashboard.recentActivity.length === 0) ? (
                <div className="admin-empty-state">
                  <p>No recent attendance activity for this hostel.</p>
                </div>
              ) : (
                <div className="admin-table-wrapper" style={{ border: "none", borderRadius: 0 }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Resident Student</th>
                        <th>Action</th>
                        <th>Gate Point</th>
                        <th>Scan Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.recentActivity.map((record) => (
                        <tr key={record._id}>
                          <td>
                            <span className="admin-table-primary-text">
                              {record.student?.name || "Unknown Student"}
                            </span>
                            <span className="admin-table-secondary-text">
                              Roll: {record.student?.rollNumber || "N/A"}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`admin-badge ${
                                record.action === "ENTRY" ? "entry" : "exit"
                              }`}
                            >
                              {record.action}
                            </span>
                          </td>
                          <td>
                            <span className="admin-table-primary-text">
                              {record.gate?.name || "Campus Gate"}
                            </span>
                          </td>
                          <td>
                            <span className="admin-table-secondary-text">
                              {new Date(record.timestamp).toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
};

export default WardenDashboard;
