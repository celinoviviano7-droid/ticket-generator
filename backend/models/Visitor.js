const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('../config/database');

class Visitor {
  constructor(data = {}) {
    this.id = data.id;
    this.uuid = data.uuid || uuidv4();
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.email = data.email;
    this.phone = data.phone;
    this.residential_profile = data.residential_profile;
    this.circuit = data.circuit;
    this.profile = data.profile;
    this.amount = data.amount;
    this.registration_date = data.registration_date;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Créer un nouveau visiteur
  static async create(visitorData) {
    try {
      const visitor = new Visitor(visitorData);
      const sql = `
        INSERT INTO visitors (
          uuid, first_name, last_name, email, phone, 
          residential_profile, circuit, profile, amount, registration_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        visitor.uuid,
        visitor.first_name,
        visitor.last_name,
        visitor.email,
        visitor.phone,
        visitor.residential_profile,
        visitor.circuit,
        visitor.profile,
        visitor.amount,
        visitor.registration_date
      ];

      const result = await run(sql, params);
      visitor.id = result.id;
      
      return visitor;
    } catch (error) {
      throw new Error(`Erreur lors de la création du visiteur: ${error.message}`);
    }
  }

  // Récupérer un visiteur par ID
  static async findById(id) {
    try {
      const sql = 'SELECT * FROM visitors WHERE id = ?';
      const row = await get(sql, [id]);
      
      if (!row) {
        return null;
      }
      
      return new Visitor(row);
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du visiteur: ${error.message}`);
    }
  }

  // Récupérer un visiteur par UUID
  static async findByUuid(uuid) {
    try {
      const sql = 'SELECT * FROM visitors WHERE uuid = ?';
      const row = await get(sql, [uuid]);
      
      if (!row) {
        return null;
      }
      
      return new Visitor(row);
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du visiteur: ${error.message}`);
    }
  }

  // Récupérer un visiteur par email
  static async findByEmail(email) {
    try {
      const sql = 'SELECT * FROM visitors WHERE email = ?';
      const row = await get(sql, [email]);
      
      if (!row) {
        return null;
      }
      
      return new Visitor(row);
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du visiteur: ${error.message}`);
    }
  }

  // Récupérer tous les visiteurs avec pagination
  static async findAll(page = 1, limit = 20, filters = {}) {
    try {
      let sql = 'SELECT * FROM visitors';
      let params = [];
      let conditions = [];

      // Filtres
      if (filters.residential_profile) {
        conditions.push('residential_profile = ?');
        params.push(filters.residential_profile);
      }
      
      if (filters.circuit) {
        conditions.push('circuit = ?');
        params.push(filters.circuit);
      }
      
      if (filters.profile) {
        conditions.push('profile = ?');
        params.push(filters.profile);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      // Tri et pagination
      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      const offset = (page - 1) * limit;
      params.push(limit, offset);

      const rows = await all(sql, params);
      return rows.map(row => new Visitor(row));
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des visiteurs: ${error.message}`);
    }
  }

  // Compter le nombre total de visiteurs
  static async count(filters = {}) {
    try {
      let sql = 'SELECT COUNT(*) as total FROM visitors';
      let params = [];
      let conditions = [];

      // Filtres
      if (filters.residential_profile) {
        conditions.push('residential_profile = ?');
        params.push(filters.residential_profile);
      }
      
      if (filters.circuit) {
        conditions.push('circuit = ?');
        params.push(filters.circuit);
      }
      
      if (filters.profile) {
        conditions.push('profile = ?');
        params.push(filters.profile);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      const result = await get(sql, params);
      return result.total;
    } catch (error) {
      throw new Error(`Erreur lors du comptage des visiteurs: ${error.message}`);
    }
  }

  // Mettre à jour un visiteur
  async update(updateData) {
    try {
      const sql = `
        UPDATE visitors SET 
          first_name = ?, last_name = ?, email = ?, phone = ?,
          residential_profile = ?, circuit = ?, profile = ?, amount = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      const params = [
        updateData.first_name || this.first_name,
        updateData.last_name || this.last_name,
        updateData.email || this.email,
        updateData.phone || this.phone,
        updateData.residential_profile || this.residential_profile,
        updateData.circuit || this.circuit,
        updateData.profile || this.profile,
        updateData.amount || this.amount,
        this.id
      ];

      await run(sql, params);
      
      // Mettre à jour l'instance locale
      Object.assign(this, updateData);
      this.updated_at = new Date().toISOString();
      
      return this;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du visiteur: ${error.message}`);
    }
  }

  // Supprimer un visiteur
  async delete() {
    try {
      const sql = 'DELETE FROM visitors WHERE id = ?';
      await run(sql, [this.id]);
      return true;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du visiteur: ${error.message}`);
    }
  }

  // Récupérer les statistiques des visiteurs
  static async getStats() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_visitors,
          SUM(amount) as total_revenue,
          COUNT(DISTINCT residential_profile) as unique_residential_profiles,
          COUNT(DISTINCT circuit) as unique_circuits,
          COUNT(DISTINCT profile) as unique_profiles
        FROM visitors
      `;
      
      const stats = await get(sql);
      return stats;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  // Récupérer les visiteurs par période
  static async getVisitorsByPeriod(startDate, endDate) {
    try {
      const sql = `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count,
          SUM(amount) as revenue
        FROM visitors 
        WHERE created_at BETWEEN ? AND ?
        GROUP BY DATE(created_at)
        ORDER BY date
      `;
      
      const rows = await all(sql, [startDate, endDate]);
      return rows;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des visiteurs par période: ${error.message}`);
    }
  }

  // Convertir en objet simple
  toJSON() {
    return {
      id: this.id,
      uuid: this.uuid,
      first_name: this.first_name,
      last_name: this.last_name,
      email: this.email,
      phone: this.phone,
      residential_profile: this.residential_profile,
      circuit: this.circuit,
      profile: this.profile,
      amount: this.amount,
      registration_date: this.registration_date,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Visitor;



