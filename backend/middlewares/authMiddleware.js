import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      
      //If the token is correct, it should go directly to next() and exit!
      return next(); 
    } catch (error) {
      console.error("Auth Error:", error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  //This should only work if there is no token.
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Role (${req.user?.role}) is not allowed to access this resource` });
    }
    next();
  };
};

