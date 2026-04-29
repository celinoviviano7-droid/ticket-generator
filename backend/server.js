const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = createServer(app);

// Configuration Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware de sécurité
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || (process.env.NODE_ENV === 'development' ? 5000 : 100),
  message: {
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Ignorer le rate limiting pour certaines routes de développement
    if (process.env.NODE_ENV === 'development') {
      return req.path === '/health' || 
             req.path === '/api/stats/scan-events' ||
             req.path === '/api/tickets/scan'
    }
    return false
  }
});

// Rate limiting plus permissif pour les statistiques
const statsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 500 : 200,
  message: {
    error: 'Trop de requêtes de statistiques, veuillez réessayer plus tard.'
  }
});

app.use('/api/', limiter);
app.use('/api/stats', statsLimiter);

// Logging
app.use(morgan('combined'));

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes API
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/scanner', require('./routes/scanner'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/auth', require('./routes/auth'));

// Route de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Middleware de gestion d'erreurs global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// Configuration Socket.IO
io.on('connection', (socket) => {
  console.log('Client connecté:', socket.id);
  
  socket.on('join-chat', (roomId) => {
    socket.join(roomId);
    console.log(`Client ${socket.id} rejoint le chat ${roomId}`);
  });
  
  socket.on('chat-message', (data) => {
    socket.to(data.roomId).emit('new-message', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Client déconnecté:', socket.id);
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur e-Bracelet Anosiravo démarré sur le port ${PORT}`);
  console.log(`📊 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO activé`);
});

// Gestion d'erreur pour le serveur HTTP
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Le port ${PORT} est déjà utilisé`);
    console.error('💡 Arrêtez les autres processus Node.js ou changez le port');
  } else {
    console.error('❌ Erreur du serveur HTTP:', error);
  }
  process.exit(1);
});

// Gestion d'erreur pour les événements non gérés
process.on('uncaughtException', (error) => {
  console.error('❌ Exception non gérée:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée non gérée:', reason);
  process.exit(1);
});

module.exports = { app, io };



