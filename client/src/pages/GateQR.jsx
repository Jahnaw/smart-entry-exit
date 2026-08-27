import { useEffect, useState } from "react";

const GateQR = () => {
  const [qrCode, setQrCode] =
    useState(null);

  const gateId =
    "6a8fda9482e6b2a7f8d8fc4d";

  useEffect(() => {
    const loadQr = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/gates/${gateId}/qr`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        setQrCode(data.qrCode);
      } catch (error) {
        console.error(
          "Failed to load QR:",
          error
        );
      }
    };

    loadQr();
  }, [gateId]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
      }}
    >
      <h1>Main Gate QR</h1>

      {qrCode && (
        <img
          src={qrCode}
          alt="Main Gate QR"
          style={{
            width: "350px",
            height: "350px",
          }}
        />
      )}

      {!qrCode && <p>Loading QR...</p>}
    </div>
  );
};

export default GateQR;