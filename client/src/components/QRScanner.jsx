import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const QRScanner = ({ onScanSuccess, onClose }) => {
  const scannerRef = useRef(null);
  const mountedRef = useRef(false);
  const stoppedRef = useRef(false);
  const scanSuccessRef = useRef(onScanSuccess);

  const [error, setError] = useState("");
  const [starting, setStarting] = useState(true);

  // Always keep the latest callback without
  // restarting the camera.
  useEffect(() => {
    scanSuccessRef.current = onScanSuccess;
  }, [onScanSuccess]);

  useEffect(() => {
    const scannerId = "qr-reader";

    mountedRef.current = true;
    stoppedRef.current = false;

    const scanner = new Html5Qrcode(scannerId);
    scannerRef.current = scanner;

    const stopCamera = async () => {
      if (stoppedRef.current) {
        return;
      }

      stoppedRef.current = true;

      // -----------------------------------------
      // 1. Stop html5-qrcode
      // -----------------------------------------
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
      } catch (error) {
        console.error("Error stopping html5-qrcode:", error);
      }

      // -----------------------------------------
      // 2. Stop actual browser camera tracks
      // -----------------------------------------
      try {
        const readerElement =
          document.getElementById(scannerId);

        if (readerElement) {
          const video =
            readerElement.querySelector("video");

          if (video?.srcObject) {
            const stream = video.srcObject;

            stream.getTracks().forEach((track) => {
              track.stop();
            });

            video.srcObject = null;
          }
        }
      } catch (error) {
        console.error("Error stopping camera tracks:", error);
      }

      // -----------------------------------------
      // 3. Clear html5-qrcode DOM
      // -----------------------------------------
      try {
        scanner.clear();
      } catch (error) {
        console.error("Scanner clear error:", error);
      }

      scannerRef.current = null;
    };

    const startScanner = async () => {
      try {
        setError("");
        setStarting(true);

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
            // Ignore scans after component has closed.
            if (!mountedRef.current) {
              return;
            }

            // Stop camera immediately after successful scan.
            await stopCamera();

            if (mountedRef.current) {
              scanSuccessRef.current(decodedText);
            }
          },
          () => {
            // QR not detected yet.
          }
        );

        // Component may have unmounted while camera was starting.
        if (!mountedRef.current) {
          await stopCamera();
          return;
        }

        setStarting(false);
      } catch (error) {
        console.error("Camera start error:", error);

        if (!mountedRef.current) {
          return;
        }

        setStarting(false);

        setError(
          "Unable to access the camera. Please allow camera permission and try again."
        );
      }
    };

    startScanner();

    // -----------------------------------------
    // React cleanup
    // -----------------------------------------
    return () => {
      mountedRef.current = false;

      stopCamera();
    };
  }, []);

  const handleClose = async () => {
    // Mark scanner as closed immediately.
    mountedRef.current = false;

    const scanner = scannerRef.current;

    if (scanner) {
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
      } catch (error) {
        console.error("Camera stop error:", error);
      }

      // Explicitly stop camera tracks.
      try {
        const readerElement =
          document.getElementById("qr-reader");

        if (readerElement) {
          const video =
            readerElement.querySelector("video");

          if (video?.srcObject) {
            const stream = video.srcObject;

            stream.getTracks().forEach((track) => {
              track.stop();
            });

            video.srcObject = null;
          }
        }
      } catch (error) {
        console.error("Camera track cleanup error:", error);
      }

      try {
        scanner.clear();
      } catch (error) {
        console.error("Scanner clear error:", error);
      }

      scannerRef.current = null;
    }

    onClose();
  };

  return (
    <div className="scanner-page">
      <div className="scanner-header">
        <button
          type="button"
          className="back-button"
          onClick={handleClose}
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
          type="button"
          className="cancel-button"
          onClick={handleClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default QRScanner;