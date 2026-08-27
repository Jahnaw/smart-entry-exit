import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const QRScanner = ({ onScanSuccess, onClose }) => {
  const scannerRef = useRef(null);

  const [error, setError] = useState("");
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    const scannerId = "qr-reader";

    const scanner = new Html5Qrcode(scannerId);

    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        setError("");

        await scanner.start(
          {
            facingMode: "environment",
          },
          {
            fps: 10,
            qrbox: {
              width: 250,
              height: 250,
            },
          },
          async (decodedText) => {
            try {
              await scanner.stop();
            } catch (stopError) {
              console.error(
                "Error stopping scanner:",
                stopError
              );
            }

            onScanSuccess(decodedText);
          },
          () => {
            // QR not detected yet.
            // This callback fires repeatedly,
            // so we intentionally don't show an error.
          }
        );

        setStarting(false);
      } catch (error) {
        console.error(
          "Camera start error:",
          error
        );

        setStarting(false);

        setError(
          "Unable to access the camera. Please allow camera permission and try again."
        );
      }
    };

    startScanner();

    return () => {
      const stopScanner = async () => {
        try {
          if (
            scannerRef.current &&
            scannerRef.current.isScanning
          ) {
            await scannerRef.current.stop();
          }
        } catch (error) {
          console.error(
            "Scanner cleanup error:",
            error
          );
        }
      };

      stopScanner();
    };
  }, [onScanSuccess]);

  return (
    <div className="scanner-page">
      <div className="scanner-header">
        <button
          className="back-button"
          onClick={onClose}
        >
          ←
        </button>

        <h1>Scan Gate QR</h1>
      </div>

      <div className="scanner-content">
        <p className="scanner-instruction">
          Point your camera at the QR code displayed
          at the gate.
        </p>

        <div className="scanner-container">
          <div id="qr-reader"></div>

          {starting && (
            <div className="scanner-loading">
              Starting camera...
            </div>
          )}
        </div>

        {error && (
          <div className="error-message scanner-error">
            {error}
          </div>
        )}

        <p className="scanner-hint">
          Make sure the QR code is clearly visible
          and well lit.
        </p>

        <button
          className="cancel-button"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default QRScanner;