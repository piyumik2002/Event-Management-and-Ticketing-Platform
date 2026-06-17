export const admin = (req, res, next) => {
  // We use this middleware after authMiddleware.
  // Since authMiddleware has already run, req.user should be available.
  
  if (req.user && req.user.role === 'admin') {
    // If the logged-in user's role is 'admin', allow them to proceed.
    next();
  } else {
    // If the user is not an admin, return an unauthorized error.
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};