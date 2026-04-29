const express = require('express');
const { body } = require('express-validator');
const { run, get, all } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Validation pour l'enregistrement d'un scan
const scanValidation = [
  body('ticket_id')
    .isInt({ min: 1 })
    .withMessage('ID de ticket invalide'),
  
  body('scan_type')
    .isIn(['camera', 'manual'])
    .withMessage('Type de scan invalide'),
  
  body('scan_data')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Données de scan requises')
];

// Enregistrer un événement de scan
router.post('/scan', scanValidation, async (req, res) => {
  try {
    const { ticket_id, scanner_id, scan_type, scan_data, location } = req.body;
    const scanUuid = uuidv4();

    const sql = `
      INSERT INTO scan_events (
        uuid, ticket_id, scanner_id, scan_type, scan_data, location
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    await run(sql, [scanUuid, ticket_id, scanner_id, scan_type, scan_data, location]);

    res.status(201).json({
      success: true,
      message: 'Scan enregistré avec succès',
      data: {
        scan_id: scanUuid,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erreur enregistrement scan:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'enregistrement du scan',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
});

// Récupérer l'historique des scans
router.get('/history', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const sql = `
      SELECT se.*, t.barcode, v.first_name, v.last_name, v.email
      FROM scan_events se
      JOIN tickets t ON se.ticket_id = t.id
      JOIN visitors v ON t.visitor_id = v.id
      ORDER BY se.timestamp DESC
      LIMIT ? OFFSET ?
    `;

    const scans = await all(sql, [limit, offset]);

    res.json({
      success: true,
      data: {
        scans,
        pagination: {
          page,
          limit,
          hasNext: scans.length === limit
        }
      }
    });

  } catch (error) {
    console.error('Erreur récupération historique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
});

// Récupérer les statistiques de scan
router.get('/stats', async (req, res) => {
  try {
    const sql = `
      SELECT 
        COUNT(*) as total_scans,
        COUNT(CASE WHEN scan_type = 'camera' THEN 1 END) as camera_scans,
        COUNT(CASE WHEN scan_type = 'manual' THEN 1 END) as manual_scans,
        COUNT(DISTINCT ticket_id) as unique_tickets_scanned,
        COUNT(DISTINCT DATE(timestamp)) as days_with_scans
      FROM scan_events
    `;

    const stats = await get(sql);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Erreur récupération stats scanner:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
});

// Récupérer les scans par période
router.get('/period', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Dates de début et de fin requises'
      });
    }

    const sql = `
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) as scan_count,
        COUNT(CASE WHEN scan_type = 'camera' THEN 1 END) as camera_count,
        COUNT(CASE WHEN scan_type = 'manual' THEN 1 END) as manual_count
      FROM scan_events
      WHERE timestamp BETWEEN ? AND ?
      GROUP BY DATE(timestamp)
      ORDER BY date
    `;

    const scans = await all(sql, [start_date, end_date]);

    res.json({
      success: true,
      data: scans
    });

  } catch (error) {
    console.error('Erreur récupération scans par période:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des scans par période',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
});

module.exports = router;





