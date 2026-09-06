const QRCode = require("qrcode");

const generateQrCode = async (qrToken) => {
  const frontendUrl =
    process.env.FRONTEND_URL || "http://localhost:5173";

  const qrData = `${frontendUrl}/gate?token=${encodeURIComponent(qrToken)}`;

  return await QRCode.toDataURL(qrData);
};

module.exports = generateQrCode;