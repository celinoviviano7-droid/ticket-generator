const { run, close } = require('../config/database');

async function fixTable() {
  try {
    console.log('🔧 Correction de la table visitors...');
    
    // Supprimer complètement la table visitors
    await run('DROP TABLE IF EXISTS visitors');
    console.log('✅ Ancienne table visitors supprimée');
    
    // Recréer la table avec la bonne structure
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
    console.log('✅ Nouvelle table visitors créée avec la bonne structure');
    
    // Créer un index sur l'email
    await run('CREATE INDEX idx_visitors_email ON visitors(email)');
    console.log('✅ Index sur email créé');
    
    console.log('🎉 Table visitors corrigée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  } finally {
    await close();
  }
}

// Exécuter la correction si le script est appelé directement
if (require.main === module) {
  fixTable();
}

module.exports = { fixTable };
