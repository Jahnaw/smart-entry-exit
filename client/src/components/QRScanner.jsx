import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const QRScanner = ({ onScanSuccess, onClose }) => {
  const scannerRef = useRef(null);
  const mountedRef = useRef(true);
  const stoppedRef = useRef(false);

  const [error, setError] = useState("");
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    const scannerId = "qr-reader";

    const scanner = new Html5Qrcode(scannerId);

    scannerRef.current = scanner;
    mountedRef.current = true;
    stoppedRef.current = false;

    const stopCamera = async () => {
      // Prevent cleanup from running multiple times
      if (stoppedRef.current) {
        return;
      }

      stoppedRef.current = true;

      try {
        // First stop html5-qrcode
        if (scanner.isScanning) {
          await scanner.stop();
        }
      } catch (error) {
        console.error(
          "Error stopping html5-qrcode:",
          error
        );
      }

      // Explicitly stop the actual browser camera stream
      try {
        const readerElement =
          document.getElementById(scannerId);

        if (readerElement) {
          const video =
            readerElement.querySelector("video");

          if (video && video.srcObject) {
            const stream = video.srcObject;

            stream.getTracks().forEach((track) => {
              track.stop();
            });

            video.srcObject = null;
          }
        }
      } catch (error) {
        console.error(
          "Error stopping camera tracks:",
          error
        );
      }

      // Clear html5-qrcode DOM/resources
      try {
        scanner.clear();
      } catch (error) {
        console.error(
          "Scanner clear error:",
          error
        );
      }
    };

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
            // Stop camera immediately after first successful scan
            await stopCamera();

            if (mountedRef.current) {
              onScanSuccess(decodedText);
            }
          },
          () => {
            // QR not detected yet.
          }
        );

        if (mountedRef.current) {
          setStarting(false);
        }
      } catch (error) {
        console.error(
          "Camera start error:",
          error
        );

        if (mountedRef.current) {
          setStarting(false);

          setError(
            "Unable to access the camera. Please allow camera permission and try again."
          );
        }
      }
    };

    startScanner();

    return () => {
      mountedRef.current = false;

      // Explicitly stop camera when QRScanner unmounts
      stopCamera();
    };
  }, [onScanSuccess]);

  const handleClose = async () => {
    // Stop camera BEFORE closing the scanner component
    try {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }

        const readerElement =
          document.getElementById("qr-reader");

        if (readerElement) {
          const video =
            readerElement.querySelector("video");

          if (video && video.srcObject) {
            video.srcObject
              .getTracks()
              .forEach((track) => track.stop());

            video.srcObject = null;
          }
        }

        try {
          scannerRef.current.clear();
        } catch (error) {
          console.error(
            "Scanner clear error:",
            error
          );
        }
      }
    } catch (error) {
      console.error(
        "Camera close error:",
        error
      );
    }

    onClose();
  };

  return (
    <div className="scanner-page">
      <div className="scanner-header">
        <button
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