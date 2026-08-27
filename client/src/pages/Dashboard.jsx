import { useState } from "react";

import { useAuth } from "../context/AuthContext";

import QRScanner from "../components/QRScanner";

import { getGateByQrToken } from "../services/api";

const Dashboard = () => {
  const { student, logout } = useAuth();

  const [scannerOpen, setScannerOpen] =
    useState(false);

  const [scannedGate, setScannedGate] =
    useState(null);

  const [scanError, setScanError] =
    useState("");

  const [loadingGate, setLoadingGate] =
    useState(false);

  const handleScanSuccess = async (decodedText) => {
    try {
      setScannerOpen(false);
      setScanError("");
      setScannedGate(null);
      setLoadingGate(true);

      let qrData;

      try {
        qrData = JSON.parse(decodedText);
      } catch (error) {
        throw new Error(
          "This is not a valid Smart Entry-Exit QR code."
        );
      }

      if (
        qrData.type !==
        "SMART_ENTRY_EXIT_GATE"
      ) {
        throw new Error(
          "This QR code does not belong to Smart Entry-Exit."
        );
      }

      if (!qrData.token) {
        throw new Error(
          "Gate token is missing from the QR code."
        );
      }

      const data = await getGateByQrToken(
        qrData.token
      );

      setScannedGate(data.gate);
    } catch (error) {
      console.error(
        "QR processing error:",
        error
      );

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
            to continue.
          </p>

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

        {loadingGate && (
          <section className="result-card">
            <p>Identifying gate...</p>
          </section>
        )}

        {scanError && (
          <section className="result-card">
            <div className="error-message">
              {scanError}
            </div>
          </section>
        )}

        {scannedGate && (
          <section className="result-card">
            <p className="small-text">
              Gate Identified
            </p>

            <h2>{scannedGate.name}</h2>

            <p>
              Gate radius:{" "}
              {scannedGate.radius} meters
            </p>

            <p>
              Location:{" "}
              {scannedGate.latitude},{" "}
              {scannedGate.longitude}
            </p>

            <div className="success-message">
              QR code verified successfully.
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;