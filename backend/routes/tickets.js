const express = require('express');
const { body, param, query } = require('express-validator');
const TicketController = require('../controllers/TicketController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation pour la création de ticket
const createTicketValidation = [
  body('first_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
  
  body('last_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  
  body('phone')
    .optional()
    .isLength({ min: 8, max: 20 })
    .withMessage('Le numéro de téléphone doit contenir entre 8 et 20 caractères'),
  
  body('residential_profile')
    .trim()
    .isIn(['residant', 'non-residant'])
    .withMessage('Le profil résidentiel doit être "residant" ou "non-residant"'),
  
  body('profile')
    .trim()
    .isIn(['adulte', 'enfant', 'bebe'])
    .withMessage('Le profil doit être "adulte", "enfant" ou "bebe"'),
  
  body('circuit')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Le circuit doit contenir entre 1 et 100 caractères'),
  
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Le montant doit être un nombre positif'),
  
  body('registration_date')
    .optional()
    .custom((value) => {
      // Accepter les dates ISO, les timestamps et les objets Date
      if (!value) return true;
      
      const date = new Date(value);
      return !isNaN(date.getTime());
    })
    .withMessage('Date d\'enregistrement invalide')
];

// Validation pour la mise à jour du statut
const updateStatusValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de ticket invalide'),
  
  body('status')
    .isIn(['active', 'used', 'expired', 'cancelled'])
    .withMessage('Statut invalide')
];

// Validation pour la pagination
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page invalide'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite invalide (1-100)')
];

// Validation pour la validation de ticket
const validateTicketValidation = [
  body('barcode')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Code-barres requis')
];

// Routes publiques (kiosque)
router.post('/create', createTicketValidation, TicketController.createTicket);
router.post('/validate', validateTicketValidation, TicketController.validateTicket);
router.get('/barcode/:barcode', TicketController.getTicketByBarcode);
router.post('/scan', TicketController.scanTicket); // Nouvelle route optimisée pour le scan

// Route de test publique
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Route de test publique accessible',
    timestamp: new Date().toISOString()
  });
});

// Routes protégées (administration)
router.use(authenticateToken);

router.get('/', paginationValidation, TicketController.getAllTickets);
router.get('/stats', TicketController.getTicketStats);
router.get('/search', TicketController.searchTickets);
router.get('/:id', param('id').isInt({ min: 1 }), TicketController.getTicketById);
router.get('/uuid/:uuid', TicketController.getTicketByUuid);
router.patch('/:id/status', updateStatusValidation, TicketController.updateTicketStatus);
router.delete('/:id', param('id').isInt({ min: 1 }), TicketController.deleteTicket);

module.exports = router;

