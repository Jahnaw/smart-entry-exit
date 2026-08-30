import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { getAllStudents } from "../services/api";

const AdminStudents = () => {
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

        const data = await getAllStudents(token);

        setStudents(data.students);
        setFilteredStudents(data.students);
      } catch (error) {
        console.error("Load students error:", error);

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

    if (!searchText) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter(
      (student) =>
        student.name?.toLowerCase().includes(searchText) ||
        student.rollNumber?.toLowerCase().includes(searchText) ||
        student.email?.toLowerCase().includes(searchText),
    );

    setFilteredStudents(filtered);
  }, [search, students]);

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Smart Entry-Exit</h1>
          <p>Student Management</p>
        </div>

        <a href="/admin/dashboard" className="admin-back-link">
          Dashboard
        </a>
      </header>

      <main className="dashboard-content">
        <section className="history-card">
          <div className="section-header">
            <p className="small-text">Student Management</p>

            <h2>Students</h2>
          </div>

          <div className="admin-search">
            <input
              type="text"
              placeholder="Search by name, roll number or email"
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
            <div className="admin-student-table-wrapper">
              <div className="admin-student-table">
                <div className="admin-student-table-header">
                  <div>Student</div>
                  <div>Roll Number</div>
                  <div>Hostel</div>
                  <div>Status</div>
                  <div>Email</div>
                </div>

                {filteredStudents.map((student) => (
                  <div className="admin-student-table-row" key={student._id}>
                    <div className="admin-student-name">
                      <strong>{student.name}</strong>

                      {student.phone && <span>{student.phone}</span>}
                    </div>

                    <div className="admin-student-roll">
                      {student.rollNumber}
                    </div>

                    <div className="admin-student-hostel">
                      {student.hostelId?.name || "Unknown Hostel"}
                    </div>

                    <div>
                      <span
                        className={`student-status ${student.status?.toLowerCase()}`}
                      >
                        {student.status}
                      </span>
                    </div>

                    <div className="admin-student-email">{student.email}</div>
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

export default AdminStudents;
