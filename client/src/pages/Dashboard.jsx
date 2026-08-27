import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { student, logout } = useAuth();

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Smart Entry-Exit</h1>
          <p>Student Dashboard</p>
        </div>

        <button
          className="logout-button"
          onClick={logout}
        >
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        <section className="welcome-card">
          <p className="small-text">
            Welcome back
          </p>

          <h2>{student?.name}</h2>

          <p>
            Roll Number: {student?.rollNumber}
          </p>
        </section>

        <section className="status-card">
          <p className="small-text">
            Current Campus Status
          </p>

          <h2>{student?.status}</h2>

          <p>
            Your status will automatically update
            when you scan a gate QR code.
          </p>
        </section>

        <section className="scan-card">
          <h2>Mark Entry / Exit</h2>

          <p>
            Scan the QR code displayed at the gate
            to record your movement.
          </p>

          <button className="scan-button">
            Scan QR Code
          </button>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;