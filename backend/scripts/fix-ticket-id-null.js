const { run, all } = require('../config/database');

async function fixTicketIdNull() {
  try {
    console.log('🔧 Correction de la contrainte NOT NULL sur ticket_id...');
    
    // Vérifier la structure actuelle
    console.log('\n📋 Structure actuelle de scan_events:');
    const tableInfo = await all('PRAGMA table_info(scan_events)');
    tableInfo.forEach(col => {
      console.log(`  - ${col.name}: ${col.type} (notnull: ${col.notnull}, pk: ${col.pk})`);
    });
    
    // Modifier la contrainte NOT NULL sur ticket_id
    console.log('\n🔧 Modification de la contrainte NOT NULL...');
    
    // SQLite ne supporte pas ALTER COLUMN pour modifier NOT NULL
    // Nous devons recréer la table
    console.log('📝 Recréation de la table scan_events...');
    
    // Créer une table temporaire avec la nouvelle structure
    await run(`
      CREATE TABLE scan_events_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT NOT NULL,
        ticket_id INTEGER,
        scanner_id TEXT,
        scan_type TEXT NOT NULL,
        scan_data TEXT NOT NULL,
        location TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        scanned_at TEXT DEFAULT CURRENT_TIMESTAMP,
        scanner_device TEXT DEFAULT 'unknown'
      )
    `);
    
    // Copier les données existantes
    console.log('📋 Copie des données existantes...');
    await run(`
      INSERT INTO scan_events_new (
        id, uuid, ticket_id, scanner_id, scan_type, scan_data, location, timestamp, scanned_at, scanner_device
      )
      SELECT id, uuid, ticket_id, scanner_id, scan_type, scan_data, location, timestamp, scanned_at, scanner_device
      FROM scan_events
    `);
    
    // Supprimer l'ancienne table
    console.log('🗑️ Suppression de l\'ancienne table...');
    await run('DROP TABLE scan_events');
    
    // Renommer la nouvelle table
    console.log('🔄 Renommage de la nouvelle table...');
    await run('ALTER TABLE scan_events_new RENAME TO scan_events');
    
    // Vérifier la nouvelle structure
    console.log('\n✅ Nouvelle structure de scan_events:');
    const newTableInfo = await all('PRAGMA table_info(scan_events)');
    newTableInfo.forEach(col => {
      console.log(`  - ${col.name}: ${col.type} (notnull: ${col.notnull}, pk: ${col.pk})`);
    });
    
    console.log('\n🎉 Table scan_events corrigée avec succès !');
    console.log('✅ ticket_id peut maintenant être NULL pour les scans échoués');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    throw error;
  }
}

// Exécuter la correction
if (require.main === module) {
  fixTicketIdNull()
    .then(() => {
      console.log('\n✅ Correction terminée avec succès !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Correction échouée:', error);
      process.exit(1);
    });
}

module.exports = { fixTicketIdNull };
