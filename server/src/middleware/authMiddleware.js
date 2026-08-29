const jwt = require("jsonwebtoken");

const authenticateStudent = (req, res, next) => {
  try {
    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const token =
      authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // ==========================================
    // Common authentication information
    // ==========================================

    req.userRole = decoded.role;

    // ==========================================
    // Student / Admin
    // ==========================================

    req.studentId =
      decoded.studentId || null;

    // ==========================================
    // Warden
    // ==========================================

    req.wardenId =
      decoded.wardenId || null;

    req.hostelId =
      decoded.hostelId || null;

    next();
  } catch (error) {
    console.error(
      "Authentication error:",
      error
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired token",
    });
  }
};

module.exports =
  authenticateStudent;