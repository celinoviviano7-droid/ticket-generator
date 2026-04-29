const { run, get, all } = require('../config/database');
const Ticket = require('../models/Ticket');

async function testRecordScan() {
  try {
    console.log('🧪 Test direct de la méthode recordScan...');
    
    // Test 1: Enregistrer un scan avec un ticket_id valide
    console.log('\n📝 Test 1: Enregistrement avec ticket_id valide...');
    const result1 = await Ticket.recordScan('TEST123', 16, true, 'test-direct');
    console.log('✅ Résultat Test 1:', result1);
    
    // Test 2: Vérifier que le scan a été enregistré
    console.log('\n🔍 Test 2: Vérification dans la base...');
    const scanEvents = await all('SELECT * FROM scan_events ORDER BY id DESC LIMIT 5');
    console.log('📊 Derniers événements de scan:');
    scanEvents.forEach((event, index) => {
      console.log(`  ${index + 1}. ID: ${event.id}, Barcode: ${event.scan_data}, Ticket ID: ${event.ticket_id}, Device: ${event.scanner_device}`);
    });
    
    // Test 3: Vérifier la structure de la table
    console.log('\n🏗️ Test 3: Structure de la table scan_events...');
    const tableInfo = await all('PRAGMA table_info(scan_events)');
    console.log('📋 Colonnes de la table:');
    tableInfo.forEach(col => {
      console.log(`  - ${col.name}: ${col.type} (notnull: ${col.notnull}, pk: ${col.pk})`);
    });
    
    // Test 4: Vérifier les contraintes
    console.log('\n🔒 Test 4: Contraintes de la table...');
    const constraints = await all('PRAGMA foreign_key_list(scan_events)');
    console.log('🔗 Contraintes de clé étrangère:');
    constraints.forEach(constraint => {
      console.log(`  - ${constraint.from} -> ${constraint.table}.${constraint.to}`);
    });
    
    return { success: true, scanEvents, tableInfo, constraints };
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    throw error;
  }
}

// Exécuter le test
if (require.main === module) {
  testRecordScan()
    .then(() => {
      console.log('\n✅ Test terminé avec succès !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test échoué:', error);
      process.exit(1);
    });
}

module.exports = { testRecordScan };
