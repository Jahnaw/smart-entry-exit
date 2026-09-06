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
import "../styles/dashboard.css";

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

  const getInitials = (name) => {
    if (!name) return "ST";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
    <div className="dashboard-app">
      {/* ========================================================
          1. LEFT SIDEBAR NAVIGATION (Matching Architecture)
          ======================================================== */}
      <aside className="dashboard-sidebar">
        {/* Top Header Banner matching reference's purple/blue header */}
        <div className="sidebar-header-banner">
          <div className="sidebar-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="7" height="7" x="3" y="3" rx="1.5"/>
              <rect width="7" height="7" x="14" y="3" rx="1.5"/>
              <rect width="7" height="7" x="14" y="14" rx="1.5"/>
              <rect width="7" height="7" x="3" y="14" rx="1.5"/>
            </svg>
          </div>
          <h2 className="sidebar-brand-title">SmartEntry</h2>
        </div>

        {/* User Profile Card */}
        <div className="sidebar-user-card">
          <div className="user-avatar-circle">
            {getInitials(student?.name)}
          </div>
          <h3 className="user-display-name">{student?.name || "Student User"}</h3>
          <p className="user-subinfo">Roll: {student?.rollNumber || "N/A"}</p>
          <span className="user-role-badge">Verified Student</span>
        </div>

      </aside>

      {/* ========================================================
          2. MAIN DASHBOARD CONTENT AREA
          ======================================================== */}
      <main className="dashboard-main-area">
        {/* Top Header Bar */}
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">Dashboard</h1>
            <p className="topbar-motto">Campus Entry & Exit Monitoring • Together everyone achieves more</p>
          </div>

          <div className="topbar-actions">
            <div className={`header-status-badge ${student?.status?.toLowerCase() === "inside" ? "inside" : "outside"}`}>
              <span className="pulse-dot"></span>
              {student?.status === "INSIDE" ? "Inside Campus" : "Outside Campus"}
            </div>

            <button className="icon-btn" title="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
              </svg>
              <span className="notif-badge"></span>
            </button>

            <button className="icon-btn" onClick={logout} title="Sign Out">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" x2="9" y1="12" y2="12"/>
              </svg>
            </button>
          </div>
        </header>

        {/* Dashboard Body Container */}
        <div className="dashboard-body-container">
          {/* ========================================================
              3. TOP KPI / METRIC CARDS ROW (4 Cards Architecture)
              ======================================================== */}
          <section className="kpi-cards-grid">
            {/* Current status with embedded scanner action */}
            <div className="kpi-card highlight">
              <div className="kpi-info">
                <span className="kpi-label">CURRENT STATUS</span>
                <span className="kpi-value">{student?.status || "INSIDE"}</span>
                <span className="kpi-subtext">Live campus status</span>
              </div>
              <button
                className="kpi-scan-button"
                title="Scan gate QR"
                onClick={() => {
                  setScanError("");
                  setScannedGate(null);
                  setScannerOpen(true);
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
                  <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
                </svg>
                <span>Scan</span>
              </button>
            </div>
          </section>

          {/* ========================================================
              4. TWO-COLUMN MAIN CONTENT (Matching Architecture)
              ======================================================== */}
          <section className="content-columns-grid">
            {/* Left Main Column (2/3 width) */}
            <div className="left-main-column">
              <div className="content-panel" id="recent-activity-panel">
                {/* Quick Scan Action Banner */}
                <div className="quick-scan-banner">
                  <div className="scan-banner-info">
                    <h3>Mark Campus Entry or Exit</h3>
                    <p>Scan the dynamic QR code displayed at any campus gate to verify location and register entry/exit.</p>
                  </div>
                </div>

                {/* Real-time feedback alerts */}
                {loadingGate && (
                  <div className="status-feedback-banner loading">
                    <span className="pulse-dot"></span>
                    <span>{locationStatus || "Verifying gate location..."}</span>
                  </div>
                )}

                {scanError && (
                  <div className="status-feedback-banner error">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" x2="12" y1="8" y2="12"/>
                      <line x1="12" x2="12.01" y1="16" y2="16"/>
                    </svg>
                    <span>{scanError}</span>
                  </div>
                )}

                {scannedGate && (
                  <div className="status-feedback-banner success">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <div>
                      <strong>{scannedGate.name} ({scannedGate.action})</strong> — Marked successfully! Distance: {scannedGate.distance}m
                    </div>
                  </div>
                )}

                {/* Table Header matching "Last orders" */}
                <div className="panel-header">
                  <h3 className="panel-title">Recent Gate Activity</h3>
                  <span className="panel-filter-label">Last 7 days • Live Log</span>
                </div>

                {/* Data Table */}
                <div className="table-responsive-wrapper">
                  {historyLoading ? (
                    <div className="empty-table-state">Loading attendance records...</div>
                  ) : historyError ? (
                    <div className="empty-table-state" style={{ color: "#EF4444" }}>{historyError}</div>
                  ) : attendanceHistory.length === 0 ? (
                    <div className="empty-table-state">No attendance records found. Scan a gate QR code to record your first entry.</div>
                  ) : (
                    <table className="custom-data-table">
                      <thead>
                        <tr>
                          <th>Date & Time</th>
                          <th>Action</th>
                          <th>Gate</th>
                          <th>Distance</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceHistory.map((record) => (
                          <tr key={record.id}>
                            <td>{new Date(record.timestamp).toLocaleString()}</td>
                            <td>
                              <span className={`table-action-pill ${record.action?.toLowerCase()}`}>
                                {record.action}
                              </span>
                            </td>
                            <td>{record.gate}</td>
                            <td>{record.distanceFromGate}m</td>
                            <td>
                              <span className="table-status-check">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                                Verified
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;