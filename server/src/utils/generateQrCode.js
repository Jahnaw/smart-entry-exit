const QRCode = require("qrcode");

const generateQrCode = async (qrToken) => {
  const qrData = JSON.stringify({
    type: "SMART_ENTRY_EXIT_GATE",
    token: qrToken,
  });

  return await QRCode.toDataURL(qrData);
};

module.exports = generateQrCode;