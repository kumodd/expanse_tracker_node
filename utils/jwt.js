const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error("JWT verify error:", error.message);
    return null;
  }
};

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    console.log("token test",req.headers.authorization)
  

    token = req.headers.authorization.split(' ')[1].trim();
    console.log("token var", token)

  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route error'
    });
  }

  try {
    // Verify token
    const decoded = verifyToken(token);
    console.log("decoded", decoded)
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route due to decoded'
      });
    }

    // Get user from the token
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route from user'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("errrrrror", error)
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route from error ${error}'
    });
  }
};

module.exports = {
  generateToken,
  verifyToken,
  protect
};