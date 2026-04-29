const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Création du dossier database s'il n'existe pas
const dbDir = path.join(__dirname, '..', 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Chemin de la base de données
const dbPath = path.join(dbDir, 'anosiravo.db');

// Création de la connexion à la base de données
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erreur de connexion à la base de données:', err.message);
  } else {
    console.log('✅ Connexion à la base de données SQLite établie');
    console.log(`📁 Base de données: ${dbPath}`);
    
    // Activation des contraintes de clés étrangères
    db.run('PRAGMA foreign_keys = ON');
    
    // Création des tables si elles n'existent pas
    createTables();
  }
});

// Fonction de création des tables
function createTables() {
  // Table des visiteurs
  db.run(`
    CREATE TABLE IF NOT EXISTS visitors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      country TEXT NOT NULL,
      circuit TEXT NOT NULL,
      profile TEXT NOT NULL,
      amount REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Erreur création table visitors:', err.message);
    } else {
      console.log('✅ Table visitors créée/vérifiée');
    }
  });

  // Table des tickets
  db.run(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE NOT NULL,
      visitor_id INTEGER NOT NULL,
      barcode TEXT UNIQUE NOT NULL,
      qr_code TEXT,
      status TEXT DEFAULT 'active',
      issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      FOREIGN KEY (visitor_id) REFERENCES visitors (id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('❌ Erreur création table tickets:', err.message);
    } else {
      console.log('✅ Table tickets créée/vérifiée');
    }
  });

  // Table des événements de scan
  db.run(`
    CREATE TABLE IF NOT EXISTS scan_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE NOT NULL,
      ticket_id INTEGER NOT NULL,
      scanner_id TEXT,
      scan_type TEXT NOT NULL,
      scan_data TEXT NOT NULL,
      location TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('❌ Erreur création table scan_events:', err.message);
    } else {
      console.log('✅ Table scan_events créée/vérifiée');
    }
  });

  // Table des sessions de chat
  db.run(`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE NOT NULL,
      visitor_id INTEGER,
      session_data TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (visitor_id) REFERENCES visitors (id) ON DELETE SET NULL
    )
  `, (err) => {
    if (err) {
      console.error('❌ Erreur création table chat_sessions:', err.message);
    } else {
      console.log('✅ Table chat_sessions créée/vérifiée');
    }
  });

  // Table des utilisateurs administrateurs
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      is_active BOOLEAN DEFAULT 1,
      last_login DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Erreur création table users:', err.message);
    } else {
      console.log('✅ Table users créée/vérifiée');
    }
  });

  // Table des statistiques
  db.run(`
    CREATE TABLE IF NOT EXISTS statistics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATE UNIQUE NOT NULL,
      total_visitors INTEGER DEFAULT 0,
      total_tickets INTEGER DEFAULT 0,
      total_scans INTEGER DEFAULT 0,
      revenue REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Erreur création table statistics:', err.message);
    } else {
      console.log('✅ Table statistics créée/vérifiée');
    }
  });
}

// Fonction pour exécuter des requêtes avec promesses
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

// Fonction pour récupérer une seule ligne
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Fonction pour récupérer plusieurs lignes
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Fonction pour fermer la base de données
function close() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

module.exports = {
  db,
  run,
  get,
  all,
  close,
  createTables
};





