const authorizeWarden = (
  req,
  res,
  next
) => {
  if (req.userRole !== "WARDEN") {
    return res.status(403).json({
      success: false,
      message:
        "Warden access required",
    });
  }

  if (!req.wardenId) {
    return res.status(403).json({
      success: false,
      message:
        "Warden identity not found",
    });
  }

  if (!req.hostelId) {
    return res.status(403).json({
      success: false,
      message:
        "Warden hostel not found",
    });
  }

  next();
};

module.exports =
  authorizeWarden;