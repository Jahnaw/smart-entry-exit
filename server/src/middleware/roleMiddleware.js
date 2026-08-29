const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(403).json({
        success: false,
        message: "Role information is missing",
      });
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this resource",
      });
    }

    next();
  };
};

module.exports = authorizeRoles;