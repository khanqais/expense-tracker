const jwt = require('jsonwebtoken');

const authUser = async (req, res, next) => {
  try {
    const token = req.headers.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Access denied. No token provided." 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    const userId = decoded.id || decoded.userId || decoded._id || decoded.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token: No user ID found" 
      });
    }

    req.user = decoded; // Store the full decoded user (including role)
    if (!req.body) req.body = {};
    req.body.userId = userId;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token" 
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: "Token expired" 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: "Authentication failed" 
      });
    }
  }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role (${req.user?.role}) is not allowed to access this resource`
            });
        }
        next();
    };
};

module.exports = { authUser, authorizeRoles };
