import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

import QRScanner from "../components/QRScanner";

import {
  getGateByQrToken,
  verifyLocation,
  markAttendance,
  getAttendanceHistory,
} from "../services/api";

import { getCurrentLocation } from "../services/location";

const Dashboard = () => {
  const { student, logout, token, deviceToken, updateStudentStatus } =
    useAuth();

  const [scannerOpen, setScannerOpen] = useState(false);

  const [scannedGate, setScannedGate] = useState(null);

  const [scanError, setScanError] = useState("");

  const [loadingGate, setLoadingGate] = useState(false);

  const [locationStatus, setLocationStatus] = useState("");

  const [attendanceHistory, setAttendanceHistory] = useState([]);

  const [historyLoading, setHistoryLoading] = useState(true);

  const [historyError, setHistoryError] = useState("");

  useEffect(() => {
    const loadAttendanceHistory = async () => {
      try {
        setHistoryLoading(true);
        setHistoryError("");

        const data = await getAttendanceHistory({
          token,
          deviceToken,
        });

        setAttendanceHistory(data.attendance);
      } catch (error) {
        console.error("Attendance history error:", error);

        setHistoryError(error.message);
      } finally {
        setHistoryLoading(false);
      }
    };

    if (token && deviceToken) {
      loadAttendanceHistory();
    }
  }, [token, deviceToken]);

  const handleScanSuccess = async (decodedText) => {
    try {
      setScannerOpen(false);
      setScanError("");
      setScannedGate(null);
      setLoadingGate(true);
      setLocationStatus("Reading QR code...");

      let qrToken;

      /*
       * NEW QR FORMAT
       *
       * Example:
       * http://localhost:5173/gate?token=abc123
       *
       * or after deployment:
       * https://your-website.com/gate?token=abc123
       */
      try {
        const qrUrl = new URL(decodedText);

        qrToken = qrUrl.searchParams.get("token");

        if (!qrToken) {
          throw new Error("Gate token is missing from the QR code.");
        }
      } catch (urlError) {
        /*
         * BACKWARD COMPATIBILITY
         *
         * Supports old QR codes containing:
         *
         * {
         *   "type": "SMART_ENTRY_EXIT_GATE",
         *   "token": "abc123"
         * }
         */
        try {
          const qrData = JSON.parse(decodedText);

          if (qrData.type !== "SMART_ENTRY_EXIT_GATE") {
            throw new Error(
              "This QR code does not belong to Smart Entry-Exit.",
            );
          }

          if (!qrData.token) {
            throw new Error("Gate token is missing from the QR code.");
          }

          qrToken = qrData.token;
        } catch (jsonError) {
          throw new Error(
            "This is not a valid Smart Entry-Exit QR code.",
          );
        }
      }

      setLocationStatus("Identifying gate...");

      const gateData = await getGateByQrToken(qrToken);

      console.log("GATE FOUND:", gateData);

      setScannedGate(gateData.gate);

      setLocationStatus("Checking your location...");

      console.log("ABOUT TO REQUEST LOCATION");

      const location = await getCurrentLocation();

      console.log("LOCATION RECEIVED:", location);

      setLocationStatus("Verifying that you are near the gate...");

      const locationData = await verifyLocation({
        token,
        deviceToken,
        qrToken,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
      });

      setLocationStatus("Location verified. Marking attendance...");

      const attendanceData = await markAttendance({
        token,
        deviceToken,
        qrToken,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
      });

      updateStudentStatus(attendanceData.currentStatus);

      setAttendanceHistory((currentHistory) =>
        [
          {
            id: attendanceData.attendance.id,

            action: attendanceData.attendance.action,

            gate: attendanceData.attendance.gate,

            timestamp: attendanceData.attendance.timestamp,

            distanceFromGate: attendanceData.attendance.distance,
          },
          ...currentHistory,
        ].slice(0, 50),
      );

      setLocationStatus("");

      setScannedGate({
        ...gateData.gate,
        distance: locationData.distance,
        locationVerified: true,
        attendanceMarked: true,
        action: attendanceData.attendance.action,
        timestamp: attendanceData.attendance.timestamp,
      });
    } catch (error) {
      console.error("QR/location verification error:", error);

      setLocationStatus("");

      setScanError(error.message);
    } finally {
      setLoadingGate(false);
    }
  };

  if (scannerOpen) {
    return (
      <QRScanner
        onScanSuccess={handleScanSuccess}
        onClose={() => setScannerOpen(false)}
      />
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Smart Entry-Exit</h1>

          <p>Student Dashboard</p>
        </div>

        <button className="logout-button" onClick={logout}>
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        <section className="welcome-card">
          <div className="welcome-content">
            <div>
              <p className="small-text">Welcome back</p>

              <h2>{student?.name}</h2>

              <p>Roll Number: {student?.rollNumber}</p>
            </div>

            <div className="welcome-role">Student</div>
          </div>
        </section>

        <div className="student-action-grid">
          <section className="status-card">
            <p className="small-text">Current Campus Status</p>

            <div
              className={`status-indicator ${student?.status?.toLowerCase()}`}
            >
              <span className="status-dot"></span>

              <span>{student?.status}</span>
            </div>

            <p>
              Your status will automatically update when you scan a gate QR
              code.
            </p>
          </section>

          <section className="scan-card">
            <p className="small-text">Quick Action</p>

            <h2>Mark Entry / Exit</h2>

            <p>Scan the QR code displayed at the gate to continue.</p>

            <button
              className="scan-button"
              onClick={() => {
                setScanError("");
                setScannedGate(null);
                setScannerOpen(true);
              }}
            >
              Scan QR Code
            </button>
          </section>
        </div>

        <section className="history-card">
          <div className="section-header">
            <div>
              <p className="small-text">Activity</p>

              <h2>Recent Attendance</h2>
            </div>
          </div>

          {historyLoading && (
            <p className="history-empty">Loading attendance...</p>
          )}

          {historyError && (
            <div className="error-message">{historyError}</div>
          )}

          {!historyLoading &&
            !historyError &&
            attendanceHistory.length === 0 && (
              <p className="history-empty">No attendance records yet.</p>
            )}

          {!historyLoading && attendanceHistory.length > 0 && (
            <div className="student-history-table-wrapper">
              <div className="student-history-table">
                <div className="student-history-header">
                  <div>Date / Time</div>

                  <div>Action</div>

                  <div>Gate</div>

                  <div>Distance</div>
                </div>

                {attendanceHistory.map((record) => (
                  <div className="student-history-row" key={record.id}>
                    <div className="student-history-time">
                      {new Date(record.timestamp).toLocaleString()}
                    </div>

                    <div>
                      <span
                        className={`action-badge ${record.action.toLowerCase()}`}
                      >
                        {record.action}
                      </span>
                    </div>

                    <div className="student-history-gate">
                      {record.gate}
                    </div>

                    <div className="student-history-distance">
                      {record.distanceFromGate}m
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {loadingGate && (
          <section className="result-card">
            <p>{locationStatus}</p>
          </section>
        )}

        {scanError && (
          <section className="result-card">
            <div className="error-message">{scanError}</div>
          </section>
        )}

        {scannedGate && (
          <section className="result-card">
            <p className="small-text">Gate</p>

            <h2>{scannedGate.name}</h2>

            <p>Distance from gate: {scannedGate.distance} meters</p>

            {scannedGate.attendanceMarked && (
              <>
                <div className="success-message">
                  ✓ {scannedGate.action} marked successfully
                </div>

                <p>
                  Time:{" "}
                  {new Date(scannedGate.timestamp).toLocaleString()}
                </p>
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;