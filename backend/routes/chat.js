const express = require('express');
const { body } = require('express-validator');
const { run, get, all } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Validation pour la création d'une session de chat
const createChatSessionValidation = [
  body('visitor_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de visiteur invalide'),

  body('session_data')
    .optional()
    .isString()
    .withMessage('Données de session invalides')
];

// Créer une nouvelle session de chat
router.post('/session', createChatSessionValidation, async (req, res) => {
  try {
    const { visitor_id, session_data } = req.body;
    const sessionUuid = uuidv4();

    const sql = `
      INSERT INTO chat_sessions (
        uuid, visitor_id, session_data, status
      ) VALUES (?, ?, ?, ?)
    `;

    await run(sql, [sessionUuid, visitor_id, session_data || '{}', 'active']);

    res.status(201).json({
      success: true,
      message: 'Session de chat créée avec succès',
      data: {
        session_id: sessionUuid,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erreur création session chat:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la session de chat',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
});

// Récupérer une session de chat par UUID
router.get('/session/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;

    const sql = `
      SELECT cs.*, v.first_name, v.last_name, v.email
      FROM chat_sessions cs
      LEFT JOIN visitors v ON cs.visitor_id = v.id
      WHERE cs.uuid = ?
    `;

    const session = await get(sql, [uuid]);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session de chat non trouvée'
      });
    }

    res.json({
      success: true,
      data: session
    });

  } catch (error) {
    console.error('Erreur récupération session chat:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la session de chat',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
});

// Mettre à jour le statut d'une session de chat
router.patch('/session/:uuid/status', async (req, res) => {
  try {
    const { uuid } = req.params;
    const { status } = req.body;

    if (!['active', 'closed', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    const sql = `
      UPDATE chat_sessions 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE uuid = ?
    `;

    await run(sql, [status, uuid]);

    res.json({
      success: true,
      message: 'Statut de la session mis à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur mise à jour statut session:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
});

// Récupérer toutes les sessions de chat
router.get('/sessions', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const sql = `
      SELECT cs.*, v.first_name, v.last_name, v.email
      FROM chat_sessions cs
      LEFT JOIN visitors v ON cs.visitor_id = v.id
      ORDER BY cs.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const sessions = await all(sql, [limit, offset]);

    res.json({
      success: true,
      data: {
        sessions,
        pagination: {
          page,
          limit,
          hasNext: sessions.length === limit
        }
      }
    });

  } catch (error) {
    console.error('Erreur récupération sessions chat:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des sessions de chat',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
});

// Récupérer les statistiques du chat
router.get('/stats', async (req, res) => {
  try {
    const sql = `
      SELECT
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_sessions,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_sessions,
        COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived_sessions,
        COUNT(DISTINCT visitor_id) as unique_visitors
      FROM chat_sessions
    `;

    const stats = await get(sql);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Erreur récupération stats chat:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
});

module.exports = router;





