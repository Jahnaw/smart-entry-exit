const crypto = require("crypto");

const generateQrToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

module.exports = generateQrToken;