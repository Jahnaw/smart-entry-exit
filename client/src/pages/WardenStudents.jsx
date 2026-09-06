import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getWardenStudents } from "../services/api";
import AdminShell from "../components/AdminShell";
import "../styles/admin.css";

const WardenStudents = () => {
  const { token } = useAuth();

  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getWardenStudents(token);

        setStudents(data.students || []);
        setFilteredStudents(data.students || []);
      } catch (error) {
        console.error("Warden students error:", error);

        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadStudents();
    }
  }, [token]);

  useEffect(() => {
    const searchText = search.trim().toLowerCase();

    const filtered = students.filter((student) => {
      return (
        !searchText ||
        student.name?.toLowerCase().includes(searchText) ||
        student.rollNumber?.toLowerCase().includes(searchText) ||
        student.email?.toLowerCase().includes(searchText)
      );
    });

    setFilteredStudents(filtered);
  }, [search, students]);

  return (
    <AdminShell
      title="Hostel Residents"
      subtitle="Warden Supervision / Resident Student Roster"
      portalType="warden"
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

      {/* RESIDENTS PANEL */}
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div className="admin-panel-title-area">
            <span className="admin-panel-eyebrow">Resident Directory</span>
            <h3 className="admin-panel-title">
              Hostel Students ({filteredStudents.length} of {students.length})
            </h3>
          </div>
        </div>

        <div className="admin-panel-body">
          {/* SEARCH */}
          <div className="admin-filter-bar">
            <div className="admin-search-input-wrapper">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" x2="21" y1="21" y2="16.65" />
              </svg>
              <input
                className="admin-input"
                type="text"
                placeholder="Search resident by name, roll number or email..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            {search && (
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setSearch("")}
              >
                Clear
              </button>
            )}
          </div>

          {loading && (
            <div className="admin-empty-state">
              <p>Loading resident roster...</p>
            </div>
          )}

          {!loading && !error && filteredStudents.length === 0 && (
            <div className="admin-empty-state">
              <p>No residents found matching your query.</p>
            </div>
          )}

          {!loading && !error && filteredStudents.length > 0 && (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Resident Student</th>
                    <th>Roll Number</th>
                    <th>Current Status</th>
                    <th>Email Address</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
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
                        <span className="admin-table-secondary-text">{student.email}</span>
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

export default WardenStudents;
