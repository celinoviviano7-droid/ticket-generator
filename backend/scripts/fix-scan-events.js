const { run, get, close } = require('../config/database');

async function fixScanEventsTable() {
  try {
    console.log('🔧 Vérification de la table scan_events...');
    
    // Vérifier la structure actuelle
    const columns = await get("PRAGMA table_info(scan_events)");
    console.log('📋 Colonnes existantes:', columns);
    
    // Ajouter les colonnes manquantes une par une
    const requiredColumns = [
      { name: 'scanned_at', type: 'TEXT', default: 'CURRENT_TIMESTAMP' },
      { name: 'scanner_device', type: 'TEXT', default: "'unknown'" },
      { name: 'status', type: 'TEXT', default: "'unknown'" }
    ];
    
    for (const col of requiredColumns) {
      try {
        await run(`
          ALTER TABLE scan_events 
          ADD COLUMN ${col.name} ${col.type} DEFAULT ${col.default}
        `);
        console.log(`✅ Colonne ${col.name} ajoutée`);
      } catch (error) {
        if (error.message.includes('duplicate column name')) {
          console.log(`ℹ️ Colonne ${col.name} existe déjà`);
        } else {
          console.log(`⚠️ Erreur avec ${col.name}:`, error.message);
        }
      }
    }
    
    // Vérifier la structure finale
    const finalColumns = await get("PRAGMA table_info(scan_events)");
    console.log('📋 Structure finale de la table scan_events:');
    console.log(finalColumns);
    
    console.log('🎉 Table scan_events vérifiée !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await close();
  }
}

fixScanEventsTable();
