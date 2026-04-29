const express = require('express');
const { get, all } = require('../config/database');

const router = express.Router();

// Récupérer les statistiques générales
router.get('/overview', async (req, res) => {
  try {
    // Statistiques des visiteurs
    const visitorStats = await get(`
      SELECT 
        COUNT(*) as total_visitors,
        COUNT(DISTINCT country) as unique_countries,
        COUNT(DISTINCT circuit) as unique_circuits,
        SUM(amount) as total_revenue
      FROM visitors
    `);

    // Statistiques des tickets
    const ticketStats = await get(`
      SELECT 
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_tickets,
        COUNT(CASE WHEN status = 'used' THEN 1 END) as used_tickets,
        COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_tickets
      FROM tickets
    `);

    // Statistiques des scans
    const scanStats = await get(`
      SELECT 
        COUNT(*) as total_scans,
        COUNT(CASE WHEN scan_type = 'camera' THEN 1 END) as camera_scans,
        COUNT(CASE WHEN scan_type = 'manual' THEN 1 END) as manual_scans
      FROM scan_events
    `);

    // Statistiques par circuit
    const circuitStats = await all(`
      SELECT 
        v.circuit,
        COUNT(*) as visitor_count,
        SUM(v.amount) as revenue,
        COUNT(t.id) as ticket_count
      FROM visitors v
      LEFT JOIN tickets t ON v.id = t.visitor_id
      GROUP BY v.circuit
      ORDER BY visitor_count DESC
    `);

    // Statistiques par pays
    const countryStats = await all(`
      SELECT 
        v.country,
        COUNT(*) as visitor_count,
        SUM(v.amount) as revenue
      FROM visitors v
      GROUP BY v.country
      ORDER BY visitor_count DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        visitors: visitorStats,
        tickets: ticketStats,
        scans: scanStats,
        circuits: circuitStats,
        countries: countryStats,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erreur récupération statistiques générales:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
});

// Récupérer les événements de scan
router.get('/scan-events', async (req, res) => {
  try {
    // Récupérer tous les événements de scan avec les informations des visiteurs et tickets
    const scanEvents = await all(`
      SELECT 
        se.id,
        se.uuid,
        se.ticket_id,
        se.scan_data,
        se.scan_type,
        se.scanned_at,
        se.timestamp,
        se.scanner_device,
        se.location,
        v.first_name,
        v.last_name,
        v.email,
        v.phone,
        v.residential_profile,
        v.profile,
        v.circuit,
        v.amount,
        t.uuid as ticket_uuid,
        t.status as ticket_status,
        t.issued_at,
        t.expires_at
      FROM scan_events se
      LEFT JOIN tickets t ON se.ticket_id = t.id
      LEFT JOIN visitors v ON t.visitor_id = v.id
      ORDER BY se.timestamp DESC, se.scanned_at DESC
      LIMIT 100
    `);

    // Formater les données pour le frontend
    const formattedEvents = scanEvents.map(event => ({
      id: event.id,
      uuid: event.uuid,
      barcode: event.scan_data, // Le code-barres est dans scan_data
      ticket_id: event.ticket_id,
      scanned_at: event.scanned_at || event.timestamp,
      scanner_device: event.scanner_device || 'unknown',
      scan_type: event.scan_type,
      location: event.location,
      status: event.ticket_id ? 'success' : 'failed', // Si ticket_id existe, c'est un succès
      error_message: event.ticket_id ? null : 'Code non reconnu',
      first_name: event.first_name,
      last_name: event.last_name,
      visitor_name: event.first_name && event.last_name 
        ? `${event.first_name} ${event.last_name}` 
        : null,
      visitor_email: event.email,
      visitor_phone: event.phone,
      residential_profile: event.residential_profile,
      profile: event.profile,
      circuit: event.circuit,
      amount: event.amount,
      ticket_uuid: event.ticket_uuid,
      ticket_status: event.ticket_status,
      issued_at: event.issued_at,
      expires_at: event.expires_at,
      ticket_info: event.ticket_status === 'active' ? 'Ticket actif' : 
                  event.ticket_status === 'used' ? 'Ticket utilisé' : 
                  event.ticket_status === 'expired' ? 'Ticket expiré' : 'Statut inconnu'
    }));

    res.json({
      success: true,
      data: {
        scanEvents: formattedEvents,
        total: formattedEvents.length,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erreur récupération événements de scan:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des événements de scan',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
});

// Récupérer les statistiques par période
router.get('/period', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Dates de début et de fin requises'
      });
    }

    // Statistiques quotidiennes
    const dailyStats = await all(`
      SELECT 
        DATE(v.created_at) as date,
        COUNT(v.id) as new_visitors,
        COUNT(t.id) as new_tickets,
        SUM(v.amount) as daily_revenue,
        COUNT(se.id) as daily_scans
      FROM visitors v
      LEFT JOIN tickets t ON v.id = t.visitor_id
      LEFT JOIN scan_events se ON t.id = se.ticket_id
      WHERE v.created_at BETWEEN ? AND ?
      GROUP BY DATE(v.created_at)
      ORDER BY date
    `, [start_date, end_date]);

    // Statistiques par circuit sur la période
    const circuitPeriodStats = await all(`
      SELECT 
        v.circuit,
        COUNT(v.id) as visitor_count,
        SUM(v.amount) as revenue,
        COUNT(t.id) as ticket_count
      FROM visitors v
      LEFT JOIN tickets t ON v.id = t.visitor_id
      WHERE v.created_at BETWEEN ? AND ?
      GROUP BY v.circuit
      ORDER BY visitor_count DESC
    `, [start_date, end_date]);

    res.json({
      success: true,
      data: {
        daily: dailyStats,
        circuits: circuitPeriodStats,
        period: {
          start: start_date,
          end: end_date
        }
      }
    });

  } catch (error) {
    console.error('Erreur récupération statistiques par période:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques par période',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
});

// Récupérer les statistiques des circuits
router.get('/circuits', async (req, res) => {
  try {
    const circuitStats = await all(`
      SELECT 
        v.circuit,
        COUNT(v.id) as total_visitors,
        COUNT(CASE WHEN v.profile = 'adulte' THEN 1 END) as adult_visitors,
        COUNT(CASE WHEN v.profile = 'enfant' THEN 1 END) as child_visitors,
        COUNT(CASE WHEN v.profile = 'bebe' THEN 1 END) as baby_visitors,
        SUM(v.amount) as total_revenue,
        AVG(v.amount) as average_revenue,
        COUNT(t.id) as total_tickets,
        COUNT(CASE WHEN t.status = 'active' THEN 1 END) as active_tickets,
        COUNT(CASE WHEN t.status = 'used' THEN 1 END) as used_tickets
      FROM visitors v
      LEFT JOIN tickets t ON v.id = t.visitor_id
      GROUP BY v.circuit
      ORDER BY total_visitors DESC
    `);

    res.json({
      success: true,
      data: circuitStats
    });

  } catch (error) {
    console.error('Erreur récupération statistiques circuits:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques des circuits',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
});

// Récupérer les statistiques des pays
router.get('/countries', async (req, res) => {
  try {
    const countryStats = await all(`
      SELECT 
        v.country,
        COUNT(v.id) as total_visitors,
        SUM(v.amount) as total_revenue,
        COUNT(DISTINCT v.circuit) as circuits_visited,
        COUNT(t.id) as total_tickets
      FROM visitors v
      LEFT JOIN tickets t ON v.id = t.visitor_id
      GROUP BY v.country
      ORDER BY total_visitors DESC
      LIMIT 20
    `);

    res.json({
      success: true,
      data: countryStats
    });

  } catch (error) {
    console.error('Erreur récupération statistiques pays:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques des pays',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
});

// Récupérer les tendances
router.get('/trends', async (req, res) => {
  try {
    // Tendances des 7 derniers jours
    const weeklyTrends = await all(`
      SELECT 
        DATE(v.created_at) as date,
        COUNT(v.id) as new_visitors,
        SUM(v.amount) as daily_revenue
      FROM visitors v
      WHERE v.created_at >= date('now', '-7 days')
      GROUP BY DATE(v.created_at)
      ORDER BY date
    `);

    // Tendances des 30 derniers jours
    const monthlyTrends = await all(`
      SELECT 
        DATE(v.created_at) as date,
        COUNT(v.id) as new_visitors,
        SUM(v.amount) as daily_revenue
      FROM visitors v
      WHERE v.created_at >= date('now', '-30 days')
      GROUP BY DATE(v.created_at)
      ORDER BY date
    `);

    res.json({
      success: true,
      data: {
        weekly: weeklyTrends,
        monthly: monthlyTrends
      }
    });

  } catch (error) {
    console.error('Erreur récupération tendances:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des tendances',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
});

// Récupérer tous les tickets avec informations des visiteurs
router.get('/tickets-with-visitors', async (req, res) => {
  try {
    // Récupérer tous les tickets avec les informations des visiteurs
    const ticketsWithVisitors = await all(`
      SELECT 
        t.id,
        t.uuid,
        t.barcode,
        t.qr_code,
        t.status,
        t.issued_at,
        t.expires_at,
        v.first_name,
        v.last_name,
        v.email,
        v.phone,
        v.residential_profile,
        v.profile,
        v.circuit,
        v.amount,
        v.created_at as visitor_created_at
      FROM tickets t
      LEFT JOIN visitors v ON t.visitor_id = v.id
      ORDER BY t.issued_at DESC
      LIMIT 200
    `);

    // Formater les données pour le frontend
    const formattedTickets = ticketsWithVisitors.map(ticket => ({
      id: ticket.id,
      uuid: ticket.uuid,
      barcode: ticket.barcode,
      qr_code: ticket.qr_code,
      status: ticket.status,
      issued_at: ticket.issued_at,
      expires_at: ticket.expires_at,
      first_name: ticket.first_name,
      last_name: ticket.last_name,
      visitor_name: ticket.first_name && ticket.last_name 
        ? `${ticket.first_name} ${ticket.last_name}` 
        : 'Visiteur anonyme',
      visitor_email: ticket.email,
      visitor_phone: ticket.phone,
      residential_profile: ticket.residential_profile,
      profile: ticket.profile,
      circuit: ticket.circuit,
      amount: ticket.amount,
      visitor_created_at: ticket.visitor_created_at
    }));

    res.json({
      success: true,
      data: {
        tickets: formattedTickets,
        total: formattedTickets.length,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erreur récupération tickets avec visiteurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des tickets avec visiteurs',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
});

module.exports = router;



