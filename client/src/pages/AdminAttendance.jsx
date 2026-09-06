import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllAttendance } from "../services/api";
import AdminShell from "../components/AdminShell";
import "../styles/admin.css";

const AdminAttendance = () => {
  const { token } = useAuth();

  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAllAttendance(token);

        setAttendance(data.attendance || []);
        setFilteredAttendance(data.attendance || []);
      } catch (error) {
        console.error("Load attendance error:", error);

        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadAttendance();
    }
  }, [token]);

  useEffect(() => {
    const searchText = search.trim().toLowerCase();

    const filtered = attendance.filter((record) => {
      const matchesSearch =
        !searchText ||
        record.student?.name?.toLowerCase().includes(searchText) ||
        record.student?.rollNumber?.toLowerCase().includes(searchText) ||
        record.student?.email?.toLowerCase().includes(searchText) ||
        record.gate?.name?.toLowerCase().includes(searchText);

      const matchesAction =
        actionFilter === "ALL" || record.action === actionFilter;

      const matchesDate =
        !dateFilter ||
        new Date(record.timestamp).toISOString().slice(0, 10) === dateFilter;

      return matchesSearch && matchesAction && matchesDate;
    });

    setFilteredAttendance(filtered);
  }, [search, actionFilter, dateFilter, attendance]);

  return (
    <AdminShell
      title="Attendance Logs"
      subtitle="Administration / Campus Entry & Exit Audit Trail"
      portalType="admin"
    >
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

      {/* ATTENDANCE RECORDS PANEL */}
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div className="admin-panel-title-area">
            <span className="admin-panel-eyebrow">Audit Records</span>
            <h3 className="admin-panel-title">
              Gate Activity Logs ({filteredAttendance.length} records)
            </h3>
          </div>
        </div>

        <div className="admin-panel-body">
          {/* FILTERS */}
          <div className="admin-filter-bar">
            <div className="admin-search-input-wrapper">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" x2="21" y1="21" y2="16.65" />
              </svg>
              <input
                className="admin-input"
                type="text"
                placeholder="Search student, roll, email or gate location..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              className="admin-select admin-filter-select"
              value={actionFilter}
              onChange={(event) => setActionFilter(event.target.value)}
            >
              <option value="ALL">All Actions</option>
              <option value="ENTRY">Entry Only</option>
              <option value="EXIT">Exit Only</option>
            </select>

            <input
              className="admin-input admin-filter-date"
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
            />

            {(search || actionFilter !== "ALL" || dateFilter) && (
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => {
                  setSearch("");
                  setActionFilter("ALL");
                  setDateFilter("");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>

          {loading && (
            <div className="admin-empty-state">
              <p>Loading attendance records...</p>
            </div>
          )}

          {!loading && !error && filteredAttendance.length === 0 && (
            <div className="admin-empty-state">
              <p>No attendance records match your filter criteria.</p>
            </div>
          )}

          {!loading && !error && filteredAttendance.length > 0 && (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Action</th>
                    <th>Gate Point</th>
                    <th>GPS Proximity</th>
                    <th>Verification Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.map((record) => (
                    <tr key={record.id}>
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
                        <span className="admin-badge neutral">
                          {record.distanceFromGate !== undefined
                            ? `${Math.round(record.distanceFromGate)}m`
                            : "Verified"}
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
    </AdminShell>
  );
};

export default AdminAttendance;
