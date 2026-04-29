const jwt = require('jsonwebtoken');
const { get } = require('../config/database');

// Middleware d'authentification JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'accès requis'
      });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'anosiravo-default-secret-key-2024');
    
    // Vérifier si l'utilisateur existe toujours en base
    const sql = 'SELECT id, uuid, username, email, role, is_active FROM users WHERE id = ? AND is_active = 1';
    const user = await get(sql, [decoded.userId]);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé ou désactivé'
      });
    }

    // Ajouter les informations utilisateur à la requête
    req.user = {
      id: user.id,
      uuid: user.uuid,
      username: user.username,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide'
      });
    }

    console.error('Erreur authentification:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'authentification'
    });
  }
};

// Middleware pour vérifier le rôle administrateur
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé. Rôle administrateur requis.'
    });
  }
  next();
};

// Middleware pour vérifier les permissions
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }
    next();
  };
};

// Middleware optionnel d'authentification (pour les routes qui peuvent être publiques ou privées)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const sql = 'SELECT id, uuid, username, email, role, is_active FROM users WHERE id = ? AND is_active = 1';
      const user = await get(sql, [decoded.userId]);
      
      if (user) {
        req.user = {
          id: user.id,
          uuid: user.uuid,
          username: user.username,
          email: user.email,
          role: user.role
        };
      }
    }
    
    next();
  } catch (error) {
    // En cas d'erreur, on continue sans authentification
    next();
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireRole,
  optionalAuth
};





