import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAdminDashboard } from "../services/api";
import AdminShell from "../components/AdminShell";
import "../styles/admin.css";

const AdminDashboard = () => {
  const { token, student } = useAuth();

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

  return (
    <AdminShell
      title="Admin Dashboard"
      subtitle="Campus Administration / Overview"
      portalType="admin"
    >
      {/* Welcome Card */}
      <div className="admin-welcome-banner">
        <div className="admin-welcome-text">
          <h2>Welcome back, {student?.name || "Administrator"}</h2>
          <p>Here is what's happening across your campus live monitoring network today.</p>
        </div>
        <div className="admin-welcome-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span>Administrator Access</span>
        </div>
      </div>

      {loading && (
        <div className="admin-panel">
          <div className="admin-empty-state">
            <p>Loading real-time campus data...</p>
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
          {/* KPI Statistics */}
          <div className="admin-kpi-grid">
            <div className="admin-kpi-card">
              <div className="admin-kpi-icon blue">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="admin-kpi-info">
                <span className="admin-kpi-label">Total Students</span>
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
                <span className="admin-kpi-label">Students Inside</span>
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
                <span className="admin-kpi-label">Students Outside</span>
                <div className="admin-kpi-value">{dashboard?.studentsOutside ?? 0}</div>
              </div>
            </div>

            <div className="admin-kpi-card">
              <div className="admin-kpi-icon purple">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18" />
                  <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                </svg>
              </div>
              <div className="admin-kpi-info">
                <span className="admin-kpi-label">Total Gates</span>
                <div className="admin-kpi-value">{dashboard?.totalGates ?? 0}</div>
              </div>
            </div>

            <div className="admin-kpi-card">
              <div className="admin-kpi-icon cyan">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div className="admin-kpi-info">
                <span className="admin-kpi-label">Active Gates</span>
                <div className="admin-kpi-value">{dashboard?.activeGates ?? 0}</div>
              </div>
            </div>
          </div>

          {/* Quick Management Section */}
          <div className="admin-panel">
            <div className="admin-panel-header">
              <div className="admin-panel-title-area">
                <span className="admin-panel-eyebrow">Administration</span>
                <h3 className="admin-panel-title">Campus Operations</h3>
              </div>
            </div>

            <div className="admin-panel-body">
              <div className="admin-nav-grid">
                <Link to="/admin/gates" className="admin-action-card">
                  <div className="admin-action-card-content">
                    <div className="admin-action-card-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 21h18" />
                        <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                      </svg>
                    </div>
                    <div className="admin-action-card-info">
                      <h4>Manage Gates</h4>
                      <p>Create & configure entrance points</p>
                    </div>
                  </div>
                  <div className="admin-action-card-arrow">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </Link>

                <Link to="/admin/students" className="admin-action-card">
                  <div className="admin-action-card-content">
                    <div className="admin-action-card-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                      </svg>
                    </div>
                    <div className="admin-action-card-info">
                      <h4>Student Management</h4>
                      <p>View student directory & status</p>
                    </div>
                  </div>
                  <div className="admin-action-card-arrow">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </Link>

                <Link to="/admin/attendance" className="admin-action-card">
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
                      <p>Audit historical logs & geofence</p>
                    </div>
                  </div>
                  <div className="admin-action-card-arrow">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </Link>

                <Link to="/admin/wardens" className="admin-action-card">
                  <div className="admin-action-card-content">
                    <div className="admin-action-card-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div className="admin-action-card-info">
                      <h4>Warden Management</h4>
                      <p>Assign wardens to hostels</p>
                    </div>
                  </div>
                  <div className="admin-action-card-arrow">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </Link>

                <Link to="/admin/guards" className="admin-action-card">
                  <div className="admin-action-card-content">
                    <div className="admin-action-card-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </div>
                    <div className="admin-action-card-info">
                      <h4>Guard Management</h4>
                      <p>Manage security station guards</p>
                    </div>
                  </div>
                  <div className="admin-action-card-arrow">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </Link>

                <Link to="/admin/gates" className="admin-action-card">
                  <div className="admin-action-card-content">
                    <div className="admin-action-card-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                        <rect width="6" height="6" x="9" y="9" rx="1" />
                      </svg>
                    </div>
                    <div className="admin-action-card-info">
                      <h4>Gate QR Codes</h4>
                      <p>Generate and print physical tokens</p>
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
                <h3 className="admin-panel-title">Recent Gate Activity</h3>
              </div>
            </div>

            <div className="admin-panel-body" style={{ padding: 0 }}>
              {(!dashboard?.recentActivity || dashboard.recentActivity.length === 0) ? (
                <div className="admin-empty-state">
                  <p>No student movement recorded today yet.</p>
                </div>
              ) : (
                <div className="admin-table-wrapper" style={{ border: "none", borderRadius: 0 }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Action</th>
                        <th>Gate Location</th>
                        <th>Timestamp</th>
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
                                record.action === "ENTRY" ? "success" : "primary"
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

export default AdminDashboard;
