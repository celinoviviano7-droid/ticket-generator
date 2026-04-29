const Ticket = require('../models/Ticket');
const Visitor = require('../models/Visitor');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

class TicketController {
  // Créer un nouveau ticket avec visiteur
  static async createTicket(req, res) {
    try {
      // Validation des données
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors.array()
        });
      }

      const {
        first_name,
        last_name,
        email,
        phone,
        residential_profile,
        circuit,
        profile,
        amount,
        registration_date
      } = req.body;

      // Vérifier si l'email existe déjà
      const existingVisitor = await Visitor.findByEmail(email);
      if (existingVisitor) {
        return res.status(409).json({
          success: false,
          message: 'Un visiteur avec cet email existe déjà'
        });
      }

      // Créer d'abord le visiteur
      const visitor = await Visitor.create({
        first_name,
        last_name,
        email,
        phone,
        residential_profile,
        circuit,
        profile,
        amount: parseFloat(amount),
        registration_date: registration_date || new Date().toISOString()
      });

      // Générer un code-barres unique
      const barcode = `ANOS${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      // Créer le ticket
      const ticket = await Ticket.create({
        visitor_id: visitor.id,
        barcode: barcode,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 jours
      });

      // Récupérer le ticket avec les informations du visiteur
      const fullTicket = await Ticket.findByIdWithVisitor(ticket.id);

      res.status(201).json({
        success: true,
        message: 'Ticket créé avec succès',
        data: {
          ticket: fullTicket.toJSON(),
          barcode: fullTicket.barcode,
          qr_code: fullTicket.qr_code
        }
      });

    } catch (error) {
      console.error('Erreur création ticket:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du ticket',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
      });
    }
  }

  // Récupérer un ticket par ID
  static async getTicketById(req, res) {
    try {
      const { id } = req.params;
      
      const ticket = await Ticket.findByIdWithVisitor(parseInt(id));
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket non trouvé'
        });
      }

      res.json({
        success: true,
        data: ticket.toJSON()
      });

    } catch (error) {
      console.error('Erreur récupération ticket:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du ticket',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
      });
    }
  }

  // Récupérer un ticket par UUID
  static async getTicketByUuid(req, res) {
    try {
      const { uuid } = req.params;
      
      const ticket = await Ticket.findByUuid(uuid);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket non trouvé'
        });
      }

      res.json({
        success: true,
        data: ticket.toJSON()
      });

    } catch (error) {
      console.error('Erreur récupération ticket:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du ticket',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
      });
    }
  }

  // Récupérer un ticket par code-barres
  static async getTicketByBarcode(req, res) {
    try {
      const { barcode } = req.params;
      
      const ticket = await Ticket.findByBarcode(barcode);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket non trouvé'
        });
      }

      res.json({
        success: true,
        data: ticket.toJSON()
      });

    } catch (error) {
      console.error('Erreur récupération ticket:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du ticket',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
      });
    }
  }

  // Récupérer tous les tickets avec pagination
  static async getAllTickets(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const filters = {};

      // Filtres
      if (req.query.status) filters.status = req.query.status;
      if (req.query.circuit) filters.circuit = req.query.circuit;
      if (req.query.profile) filters.profile = req.query.profile;

      // Validation des paramètres
      if (page < 1 || limit < 1 || limit > 100) {
        return res.status(400).json({
          success: false,
          message: 'Paramètres de pagination invalides'
        });
      }

      const [tickets, total] = await Promise.all([
        Ticket.findAll(page, limit, filters),
        Ticket.count(filters)
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: {
          tickets: tickets.map(ticket => ticket.toJSON()),
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Erreur récupération tickets:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des tickets',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
      });
    }
  }

  // Mettre à jour le statut d'un ticket
  static async updateTicketStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validation du statut
      const validStatuses = ['active', 'used', 'expired', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Statut invalide',
          validStatuses
        });
      }

      const ticket = await Ticket.findByIdWithVisitor(parseInt(id));
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket non trouvé'
        });
      }

      // Mettre à jour le statut
      await ticket.updateStatus(status);

      res.json({
        success: true,
        message: 'Statut du ticket mis à jour avec succès',
        data: ticket.toJSON()
      });

    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du statut',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
      });
    }
  }

  // Supprimer un ticket
  static async deleteTicket(req, res) {
    try {
      const { id } = req.params;
      
      const ticket = await Ticket.findByIdWithVisitor(parseInt(id));
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket non trouvé'
        });
      }

      await ticket.delete();

      res.json({
        success: true,
        message: 'Ticket supprimé avec succès'
      });

    } catch (error) {
      console.error('Erreur suppression ticket:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du ticket',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
      });
    }
  }

  // Valider un ticket (scan)
  static async validateTicket(req, res) {
    try {
      const { barcode } = req.body;
      
      if (!barcode) {
        return res.status(400).json({
          success: false,
          message: 'Code-barres requis'
        });
      }

      const ticket = await Ticket.findByBarcode(barcode);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket non trouvé'
        });
      }

      // Vérifier si le ticket est valide
      if (!ticket.isValid()) {
        return res.status(400).json({
          success: false,
          message: 'Ticket invalide ou expiré',
          data: {
            ticket: ticket.toJSON(),
            reason: ticket.status === 'expired' ? 'Ticket expiré' : 'Ticket non actif'
          }
        });
      }

      // Marquer le ticket comme utilisé
      await ticket.updateStatus('used');

      res.json({
        success: true,
        message: 'Ticket validé avec succès',
        data: {
          ticket: ticket.toJSON(),
          validation_time: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Erreur validation ticket:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la validation du ticket',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
      });
    }
  }

  // Scanner un ticket (optimisé pour le scan en temps réel)
  static async scanTicket(req, res) {
    try {
      const { barcode } = req.body;
      
      if (!barcode) {
        return res.status(400).json({
          success: false,
          message: 'Code-barres requis'
        });
      }

      // Recherche rapide du ticket par code-barres
      const ticket = await Ticket.findByBarcode(barcode);
      
      if (!ticket) {
        // Enregistrer le scan échoué avec un ticket_id temporaire
        // On utilise 0 pour indiquer qu'aucun ticket n'a été trouvé
        await Ticket.recordScan(barcode, 0, false, req.body.device_type || 'unknown');
        
        return res.status(404).json({
          success: false,
          message: 'Code-barres non trouvé',
          data: {
            found: false,
            barcode: barcode,
            scan_time: new Date().toISOString()
          }
        });
      }

      // Vérifier si le ticket est valide
      if (!ticket.isValid()) {
        // Enregistrer le scan échoué
        await Ticket.recordScan(barcode, ticket.id, false, req.body.device_type || 'unknown');
        
        return res.status(400).json({
          success: false,
          message: 'Ticket invalide ou expiré',
          data: {
            found: true,
            ticket: ticket.toJSON(),
            reason: ticket.status === 'expired' ? 'Ticket expiré' : 'Ticket non actif',
            scan_time: new Date().toISOString()
          }
        });
      }

      // Enregistrer le scan réussi
      await Ticket.recordScan(barcode, ticket.id, true, req.body.device_type || 'unknown');

      res.json({
        success: true,
        message: '✅ Code-barres trouvé et valide',
        data: {
          found: true,
          ticket: ticket.toJSON(),
          visitor: ticket.visitor,
          status: ticket.status,
          circuit: ticket.visitor?.circuit || 'Non spécifié',
          scan_time: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Erreur scan ticket:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du scan du ticket',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
      });
    }
  }

  // Récupérer les statistiques des tickets
  static async getTicketStats(req, res) {
    try {
      const stats = await Ticket.getStats();

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Erreur récupération stats:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
      });
    }
  }

  // Rechercher des tickets
  static async searchTickets(req, res) {
    try {
      const { q, page = 1, limit = 20 } = req.query;
      
      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Terme de recherche requis (minimum 2 caractères)'
        });
      }

      // Recherche dans les tickets et visiteurs
      const searchTerm = `%${q.trim()}%`;
      
      // Cette fonctionnalité nécessiterait une implémentation plus avancée
      // avec une recherche full-text ou des requêtes complexes
      // Pour l'instant, on retourne une erreur
      
      res.status(501).json({
        success: false,
        message: 'Recherche de tickets non encore implémentée'
      });

    } catch (error) {
      console.error('Erreur recherche tickets:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la recherche',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
      });
    }
  }
}

module.exports = TicketController;



