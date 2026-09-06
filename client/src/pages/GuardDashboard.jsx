import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getGuardHostels, getGuardHostelStudents } from "../services/api";
import AdminShell from "../components/AdminShell";
import "../styles/admin.css";

const GuardDashboard = () => {
  const { token, student } = useAuth();

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
    <AdminShell
      title="Guard Checkpoint"
      subtitle="Security Checkpoint / Hostel Resident Verification"
      portalType="guard"
    >
      {/* Welcome Banner */}
      <div className="admin-welcome-banner">
        <div className="admin-welcome-text">
          <h2>Security Station: {student?.name || "Campus Guard"}</h2>
          <p>Verify hostel resident clearance and monitor real-time entry and exit status.</p>
        </div>
        <div className="admin-welcome-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span>Gate Security Active</span>
        </div>
      </div>

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

      {/* HOSTEL SELECTOR PANEL */}
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div className="admin-panel-title-area">
            <span className="admin-panel-eyebrow">Checkpoint Configuration</span>
            <h3 className="admin-panel-title">Select Inspection Hostel</h3>
          </div>
        </div>

        <div className="admin-panel-body">
          <div className="admin-form-group" style={{ maxWidth: "480px" }}>
            <label className="admin-form-label" htmlFor="hostel">
              Choose Hostel Block
            </label>
            <select
              id="hostel"
              className="admin-select"
              value={selectedHostel}
              onChange={handleHostelChange}
              disabled={loadingHostels}
            >
              <option value="">
                {loadingHostels ? "Loading campus hostels..." : "Select a hostel to inspect..."}
              </option>
              {hostels.map((hostel) => (
                <option key={hostel._id} value={hostel._id}>
                  {hostel.name} ({hostel.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* LOADING STUDENTS */}
      {loadingStudents && (
        <div className="admin-panel">
          <div className="admin-empty-state">
            <p>Querying hostel resident database...</p>
          </div>
        </div>
      )}

      {/* HOSTEL DATA DISPLAY */}
      {hostelData && !loadingStudents && (
        <>
          {/* Hostel Banner */}
          <div className="admin-info-banner">
            <div>
              <h3>{hostelData.hostel.name}</h3>
              <p>Hostel Code: <strong>{hostelData.hostel.code}</strong></p>
            </div>
            <span className="admin-info-banner-badge">Active Checkpoint</span>
          </div>

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
                <span className="admin-kpi-label">Registered Residents</span>
                <div className="admin-kpi-value">{hostelData.statistics?.totalStudents ?? 0}</div>
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
                <div className="admin-kpi-value">{hostelData.statistics?.studentsInside ?? 0}</div>
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
                <div className="admin-kpi-value">{hostelData.statistics?.studentsOutside ?? 0}</div>
              </div>
            </div>
          </div>

          {/* STUDENT LIST */}
          <div className="admin-panel">
            <div className="admin-panel-header">
              <div className="admin-panel-title-area">
                <span className="admin-panel-eyebrow">Resident Registry</span>
                <h3 className="admin-panel-title">
                  Students of {hostelData.hostel.name} ({hostelData.students?.length ?? 0})
                </h3>
              </div>
            </div>

            <div className="admin-panel-body" style={{ padding: 0 }}>
              {(!hostelData.students || hostelData.students.length === 0) ? (
                <div className="admin-empty-state">
                  <p>No students assigned to this hostel.</p>
                </div>
              ) : (
                <div className="admin-table-wrapper" style={{ border: "none", borderRadius: 0 }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Roll Number</th>
                        <th>Status</th>
                        <th>Phone</th>
                        <th>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hostelData.students.map((student) => (
                        <tr key={student._id}>
                          <td>
                            <span className="admin-table-primary-text">{student.name}</span>
                          </td>
                          <td>
                            <span style={{ fontFamily: "monospace", fontWeight: "600", fontSize: "13px" }}>
                              {student.rollNumber}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`admin-badge ${
                                student.status === "INSIDE" ? "inside" : "outside"
                              }`}
                            >
                              {student.status || "UNKNOWN"}
                            </span>
                          </td>
                          <td>
                            <span className="admin-table-secondary-text">
                              {student.phone || "—"}
                            </span>
                          </td>
                          <td>
                            <span className="admin-table-secondary-text">
                              {student.email}
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

export default GuardDashboard;
