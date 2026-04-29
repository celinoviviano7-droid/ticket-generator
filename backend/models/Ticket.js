const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('../config/database');
const Visitor = require('./Visitor');

class Ticket {
  constructor(data = {}) {
    this.id = data.id;
    this.uuid = data.uuid || uuidv4();
    this.visitor_id = data.visitor_id;
    this.barcode = data.barcode;
    this.qr_code = data.qr_code;
    this.status = data.status || 'active';
    this.issued_at = data.issued_at;
    this.expires_at = data.expires_at;
    this.visitor = data.visitor; // Relation avec le visiteur
  }

  // Créer un nouveau ticket
  static async create(ticketData) {
    try {
      const ticket = new Ticket(ticketData);
      const sql = `
        INSERT INTO tickets (
          uuid, visitor_id, barcode, qr_code, status, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        ticket.uuid,
        ticket.visitor_id,
        ticket.barcode,
        ticket.qr_code,
        ticket.status,
        ticket.expires_at
      ];

      const result = await run(sql, params);
      ticket.id = result.id;
      
      return ticket;
    } catch (error) {
      throw new Error(`Erreur lors de la création du ticket: ${error.message}`);
    }
  }

  // Créer un ticket avec un visiteur
  static async createWithVisitor(visitorData, ticketData = {}) {
    try {
      // Créer d'abord le visiteur
      const visitor = await Visitor.create(visitorData);
      
      // Générer un code-barres unique
      const barcode = `ANOS${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      // Créer le ticket
      const ticket = await Ticket.create({
        ...ticketData,
        visitor_id: visitor.id,
        barcode: barcode,
        expires_at: ticketData.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 jours
      });

      // Récupérer le ticket avec les informations du visiteur
      return await Ticket.findByIdWithVisitor(ticket.id);
    } catch (error) {
      throw new Error(`Erreur lors de la création du ticket avec visiteur: ${error.message}`);
    }
  }

  // Récupérer un ticket par ID avec les informations du visiteur
  static async findByIdWithVisitor(id) {
    try {
      const sql = `
        SELECT t.*, v.* 
        FROM tickets t
        JOIN visitors v ON t.visitor_id = v.id
        WHERE t.id = ?
      `;
      
      const row = await get(sql, [id]);
      
      if (!row) {
        return null;
      }
      
      // Séparer les données du ticket et du visiteur
      const ticketData = {
        id: row.id,
        uuid: row.uuid,
        visitor_id: row.visitor_id,
        barcode: row.barcode,
        qr_code: row.qr_code,
        status: row.status,
        issued_at: row.issued_at,
        expires_at: row.expires_at
      };
      
      const visitorData = {
        id: row.visitor_id,
        uuid: row.uuid,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        phone: row.phone,
        residential_profile: row.residential_profile,
        circuit: row.circuit,
        profile: row.profile,
        amount: row.amount,
        registration_date: row.registration_date,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
      
      const ticket = new Ticket(ticketData);
      ticket.visitor = new Visitor(visitorData);
      
      return ticket;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du ticket: ${error.message}`);
    }
  }

  // Récupérer un ticket par UUID
  static async findByUuid(uuid) {
    try {
      const sql = 'SELECT * FROM tickets WHERE uuid = ?';
      const row = await get(sql, [uuid]);
      
      if (!row) {
        return null;
      }
      
      return new Ticket(row);
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du ticket: ${error.message}`);
    }
  }

  // Récupérer un ticket par code-barres
  static async findByBarcode(barcode) {
    try {
      const sql = `
        SELECT t.*, v.* 
        FROM tickets t
        JOIN visitors v ON t.visitor_id = v.id
        WHERE t.barcode = ?
      `;
      
      const row = await get(sql, [barcode]);
      
      if (!row) {
        return null;
      }
      
      // Séparer les données du ticket et du visiteur
      const ticketData = {
        id: row.id,
        uuid: row.uuid,
        visitor_id: row.visitor_id,
        barcode: row.barcode,
        qr_code: row.qr_code,
        status: row.status,
        issued_at: row.issued_at,
        expires_at: row.expires_at
      };
      
      const visitorData = {
        id: row.visitor_id,
        uuid: row.uuid,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        phone: row.phone,
        residential_profile: row.residential_profile,
        circuit: row.circuit,
        profile: row.profile,
        amount: row.amount,
        registration_date: row.registration_date,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
      
      const ticket = new Ticket(ticketData);
      ticket.visitor = new Visitor(visitorData);
      
      return ticket;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du ticket: ${error.message}`);
    }
  }

  // Récupérer tous les tickets avec pagination
  static async findAll(page = 1, limit = 20, filters = {}) {
    try {
      let sql = `
        SELECT t.*, v.first_name, v.last_name, v.email, v.residential_profile, v.circuit, v.profile, v.amount, v.registration_date
        FROM tickets t
        JOIN visitors v ON t.visitor_id = v.id
      `;
      
      let params = [];
      let conditions = [];

      // Filtres
      if (filters.status) {
        conditions.push('t.status = ?');
        params.push(filters.status);
      }
      
      if (filters.circuit) {
        conditions.push('v.circuit = ?');
        params.push(filters.circuit);
      }
      
      if (filters.profile) {
        conditions.push('v.profile = ?');
        params.push(filters.profile);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      // Tri et pagination
      sql += ' ORDER BY t.issued_at DESC LIMIT ? OFFSET ?';
      const offset = (page - 1) * limit;
      params.push(limit, offset);

      const rows = await all(sql, params);
      return rows.map(row => {
        const ticket = new Ticket({
          id: row.id,
          uuid: row.uuid,
          visitor_id: row.visitor_id,
          barcode: row.barcode,
          qr_code: row.qr_code,
          status: row.status,
          issued_at: row.issued_at,
          expires_at: row.expires_at
        });
        
        ticket.visitor = {
          first_name: row.first_name,
          last_name: row.last_name,
          email: row.email,
          residential_profile: row.residential_profile,
          circuit: row.circuit,
          profile: row.profile,
          amount: row.amount,
          registration_date: row.registration_date
        };
        
        return ticket;
      });
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des tickets: ${error.message}`);
    }
  }

  // Compter le nombre total de tickets
  static async count(filters = {}) {
    try {
      let sql = `
        SELECT COUNT(*) as total 
        FROM tickets t
        JOIN visitors v ON t.visitor_id = v.id
      `;
      
      let params = [];
      let conditions = [];

      // Filtres
      if (filters.status) {
        conditions.push('t.status = ?');
        params.push(filters.status);
      }
      
      if (filters.circuit) {
        conditions.push('v.circuit = ?');
        params.push(filters.circuit);
      }
      
      if (filters.profile) {
        conditions.push('v.profile = ?');
        params.push(filters.profile);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      const result = await get(sql, params);
      return result.total;
    } catch (error) {
      throw new Error(`Erreur lors du comptage des tickets: ${error.message}`);
    }
  }

  // Mettre à jour le statut d'un ticket
  async updateStatus(status) {
    try {
      const sql = 'UPDATE tickets SET status = ? WHERE id = ?';
      await run(sql, [status, this.id]);
      
      this.status = status;
      return this;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du statut: ${error.message}`);
    }
  }

  // Vérifier si un ticket est valide
  isValid() {
    if (this.status !== 'active') {
      return false;
    }
    
    if (this.expires_at && new Date(this.expires_at) < new Date()) {
      return false;
    }
    
    return true;
  }

  // Supprimer un ticket
  async delete() {
    try {
      const sql = 'DELETE FROM tickets WHERE id = ?';
      await run(sql, [this.id]);
      return true;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du ticket: ${error.message}`);
    }
  }

  // Récupérer les statistiques des tickets
  static async getStats() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_tickets,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_tickets,
          COUNT(CASE WHEN status = 'used' THEN 1 END) as used_tickets,
          COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_tickets,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_tickets
        FROM tickets
      `;
      
      const stats = await get(sql);
      return stats;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  // Récupérer les tickets par période
  static async getTicketsByPeriod(startDate, endDate) {
    try {
      const sql = `
        SELECT 
          DATE(t.issued_at) as date,
          COUNT(*) as count,
          SUM(v.amount) as revenue
        FROM tickets t
        JOIN visitors v ON t.visitor_id = v.id
        WHERE t.issued_at BETWEEN ? AND ?
        GROUP BY DATE(t.issued_at)
        ORDER BY date
      `;
      
      const rows = await all(sql, [startDate, endDate]);
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des tickets par période: ${error.message}`);
    }
  }

  // Enregistrer un scan de ticket
  static async recordScan(barcode, ticketId, success, deviceType = 'unknown') {
    try {
      // Si ticketId est 0, c'est un scan échoué sans ticket trouvé
      const actualTicketId = ticketId === 0 ? null : ticketId;
      
      const sql = `
        INSERT INTO scan_events (
          uuid, ticket_id, scan_type, scan_data, location, timestamp, scanned_at, scanner_device
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        require('uuid').v4(), // Générer un UUID unique
        actualTicketId, // Peut être null pour les scans échoués
        'camera', // Type de scan
        barcode, // Le code-barres scanné
        'kiosk', // Localisation par défaut
        new Date().toISOString(), // timestamp
        new Date().toISOString(), // scanned_at
        deviceType // scanner_device
      ];

      await run(sql, params);
      console.log(`✅ Scan enregistré: ${barcode} - ${success ? 'Succès' : 'Échec'} - Ticket ID: ${actualTicketId || 'Non trouvé'}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du scan:', error);
      return false;
    }
  }

  // Convertir en objet simple
  toJSON() {
    return {
      id: this.id,
      uuid: this.uuid,
      visitor_id: this.visitor_id,
      barcode: this.barcode,
      qr_code: this.qr_code,
      status: this.status,
      issued_at: this.issued_at,
      expires_at: this.expires_at,
      visitor: this.visitor ? this.visitor.toJSON ? this.visitor.toJSON() : this.visitor : null,
      is_valid: this.isValid()
    };
  }
}

module.exports = Ticket;



