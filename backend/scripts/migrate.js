const { run } = require('../config/database');

async function migrate() {
  try {
    console.log('🚀 Début de la migration...');

    // Créer la table visitors si elle n'existe pas
    await run(`
      CREATE TABLE IF NOT EXISTS visitors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        residential_profile TEXT NOT NULL,
        circuit TEXT NOT NULL,
        profile TEXT NOT NULL,
        amount REAL NOT NULL,
        registration_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Vérifier si la colonne residential_profile existe
    try {
      await run('SELECT residential_profile FROM visitors LIMIT 1');
      console.log('✅ Colonne residential_profile existe déjà');
    } catch (error) {
      // Ajouter la colonne residential_profile
      await run('ALTER TABLE visitors ADD COLUMN residential_profile TEXT DEFAULT "residant"');
      console.log('✅ Colonne residential_profile ajoutée');
    }

    // Vérifier si la colonne registration_date existe
    try {
      await run('SELECT registration_date FROM visitors LIMIT 1');
      console.log('✅ Colonne registration_date existe déjà');
    } catch (error) {
      // Ajouter la colonne registration_date
      await run('ALTER TABLE visitors ADD COLUMN registration_date TEXT');
      console.log('✅ Colonne registration_date ajoutée');
    }

    // Vérifier et supprimer l'ancienne colonne country si elle existe
    try {
      await run('SELECT country FROM visitors LIMIT 1');
      console.log('⚠️  Ancienne colonne country détectée, restructuration complète...');
      
      // Supprimer complètement la table visitors
      await run('DROP TABLE IF EXISTS visitors');
      console.log('✅ Ancienne table visitors supprimée');
      
      // Recréer la table avec la structure correcte
      await run(`
        CREATE TABLE visitors (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          uuid TEXT UNIQUE NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          phone TEXT,
          residential_profile TEXT NOT NULL DEFAULT 'residant',
          circuit TEXT NOT NULL,
          profile TEXT NOT NULL,
          amount REAL NOT NULL,
          registration_date TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Table visitors recréée avec la bonne structure');
      
      // Créer un index sur l'email
      await run('CREATE INDEX idx_visitors_email ON visitors(email)');
      console.log('✅ Index sur email créé');
      
    } catch (error) {
      console.log('✅ Colonne country n\'existe pas ou a déjà été supprimée');
    }

    // Mettre à jour les enregistrements existants
    await run(`
      UPDATE visitors 
      SET residential_profile = 'residant', 
          registration_date = created_at 
      WHERE residential_profile IS NULL OR registration_date IS NULL
    `);
    console.log('✅ Enregistrements existants mis à jour');

    // Créer la table tickets si elle n'existe pas
    await run(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        visitor_id INTEGER NOT NULL,
        barcode TEXT UNIQUE NOT NULL,
        qr_code TEXT,
        status TEXT DEFAULT 'active',
        issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME,
        FOREIGN KEY (visitor_id) REFERENCES visitors (id)
      )
    `);

    // Créer la table scan_events si elle n'existe pas
    await run(`
      CREATE TABLE IF NOT EXISTS scan_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id INTEGER NOT NULL,
        scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        scanner_location TEXT,
        scanner_device TEXT,
        status TEXT DEFAULT 'success',
        FOREIGN KEY (ticket_id) REFERENCES tickets (id)
      )
    `);

    // Créer la table users si elle n'existe pas
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Créer la table statistics si elle n'existe pas
    await run(`
      CREATE TABLE IF NOT EXISTS statistics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        total_visitors INTEGER DEFAULT 0,
        total_revenue REAL DEFAULT 0,
        active_tickets INTEGER DEFAULT 0,
        used_tickets INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Créer la table chat_sessions si elle n'existe pas
    await run(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT UNIQUE NOT NULL,
        visitor_email TEXT,
        messages TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Migration terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  migrate();
}

module.exports = { migrate };



