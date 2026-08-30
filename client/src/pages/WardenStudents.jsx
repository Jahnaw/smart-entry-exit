import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getWardenStudents } from "../services/api";

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
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Smart Entry-Exit</h1>

          <p>Hostel Students</p>
        </div>

        <Link to="/warden/dashboard" className="admin-back-link">
          Dashboard
        </Link>
      </header>

      <main className="dashboard-content">
        <section className="history-card">
          <div className="section-header">
            <div>
              <p className="small-text">Student Management</p>

              <h2>Hostel Students</h2>
            </div>
          </div>

          <div className="admin-attendance-filters">
            <input
              type="text"
              placeholder="Search name, roll number or email"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {loading && <p className="history-empty">Loading students...</p>}

          {error && <div className="error-message">{error}</div>}

          {!loading && !error && filteredStudents.length === 0 && (
            <p className="history-empty">No students found.</p>
          )}

          {!loading && !error && filteredStudents.length > 0 && (
            <div className="student-management-table-wrapper">
              <div className="student-management-table">
                <div className="student-management-header">
                  <div>Student</div>
                  <div>Roll Number</div>
                  <div>Status</div>
                  <div>Email</div>
                </div>

                {filteredStudents.map((student) => (
                  <div className="student-management-row" key={student._id}>
                    <div className="student-management-name">
                      <strong>{student.name}</strong>
                    </div>

                    <div className="student-management-roll">
                      {student.rollNumber}
                    </div>

                    <div>
                      <span
                        className={`action-badge ${
                          student.status === "INSIDE" ? "entry" : "exit"
                        }`}
                      >
                        {student.status}
                      </span>
                    </div>

                    <div className="student-management-email">
                      {student.email}
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

export default WardenStudents;
