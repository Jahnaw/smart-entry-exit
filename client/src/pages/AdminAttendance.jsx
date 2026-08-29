import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { getAllAttendance } from "../services/api";

const AdminAttendance = () => {
  const { token } = useAuth();

  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] =
    useState([]);

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

        setAttendance(data.attendance);
        setFilteredAttendance(data.attendance);
      } catch (error) {
        console.error(
          "Load attendance error:",
          error
        );

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
    const searchText = search
      .trim()
      .toLowerCase();

    const filtered = attendance.filter((record) => {
      const matchesSearch =
        !searchText ||
        record.student?.name
          ?.toLowerCase()
          .includes(searchText) ||
        record.student?.rollNumber
          ?.toLowerCase()
          .includes(searchText) ||
        record.student?.email
          ?.toLowerCase()
          .includes(searchText) ||
        record.gate?.name
          ?.toLowerCase()
          .includes(searchText);

      const matchesAction =
        actionFilter === "ALL" ||
        record.action === actionFilter;

      const matchesDate =
        !dateFilter ||
        new Date(record.timestamp)
          .toISOString()
          .slice(0, 10) === dateFilter;

      return (
        matchesSearch &&
        matchesAction &&
        matchesDate
      );
    });

    setFilteredAttendance(filtered);
  }, [
    search,
    actionFilter,
    dateFilter,
    attendance,
  ]);

  return (
    <div className="dashboard-page">

      <header className="dashboard-header">
        <div>
          <h1>Smart Entry-Exit</h1>

          <p>
            Attendance Management
          </p>
        </div>

        <a
          href="/admin/dashboard"
          className="admin-back-link"
        >
          Dashboard
        </a>
      </header>

      <main className="dashboard-content">

        <section className="history-card">

          <div className="section-header">
            <p className="small-text">
              Attendance Management
            </p>

            <h2>
              Entry / Exit Records
            </h2>
          </div>

          {/* FILTERS */}

          <div className="admin-attendance-filters">

            <input
              type="text"
              placeholder="Search student, roll number, email or gate"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            <select
              value={actionFilter}
              onChange={(event) =>
                setActionFilter(
                  event.target.value
                )
              }
            >
              <option value="ALL">
                All Actions
              </option>

              <option value="ENTRY">
                Entry
              </option>

              <option value="EXIT">
                Exit
              </option>
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(event) =>
                setDateFilter(
                  event.target.value
                )
              }
            />

            <button
              type="button"
              className="gate-cancel-button"
              onClick={() => {
                setSearch("");
                setActionFilter("ALL");
                setDateFilter("");
              }}
            >
              Clear Filters
            </button>

          </div>

          {/* LOADING */}

          {loading && (
            <p className="history-empty">
              Loading attendance...
            </p>
          )}

          {/* ERROR */}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* NO RESULTS */}

          {!loading &&
            !error &&
            filteredAttendance.length === 0 && (
              <p className="history-empty">
                No attendance records found.
              </p>
            )}

          {/* ATTENDANCE LIST */}

          {!loading &&
            !error &&
            filteredAttendance.length > 0 && (
              <div className="history-list">

                {filteredAttendance.map(
                  (record) => (

                    <div
                      className="history-item"
                      key={record.id}
                    >

                      <div className="history-action">

                        <span
                          className={`action-badge ${record.action.toLowerCase()}`}
                        >
                          {record.action}
                        </span>

                      </div>

                      <div className="history-details">

                        <h3>
                          {record.student?.name ||
                            "Unknown Student"}
                        </h3>

                        <p>
                          Roll Number:{" "}
                          {record.student
                            ?.rollNumber ||
                            "Unknown"}
                        </p>

                        <p>
                          Email:{" "}
                          {record.student?.email ||
                            "Unknown"}
                        </p>

                        <p>
                          Gate:{" "}
                          {record.gate?.name ||
                            "Unknown Gate"}
                        </p>

                        <p>
                          Distance:{" "}
                          {record.distanceFromGate}m
                        </p>

                        <p>
                          {new Date(
                            record.timestamp
                          ).toLocaleString()}
                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>
            )}

        </section>

      </main>
    </div>
  );
};

export default AdminAttendance;