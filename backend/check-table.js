const { run, get, all, close } = require('./config/database');

async function checkTableStructure() {
  try {
    console.log('🔍 Vérification de la structure de la table visitors...');
    
    // Vérifier la structure de la table
    const tableInfo = await all("PRAGMA table_info(visitors)");
    console.log('📋 Structure de la table visitors:');
    tableInfo.forEach(column => {
      console.log(`  - ${column.name} (${column.type}) ${column.notnull ? 'NOT NULL' : 'NULL'} ${column.pk ? 'PRIMARY KEY' : ''}`);
    });
    
    // Vérifier le contenu
    const count = await get('SELECT COUNT(*) as total FROM visitors');
    console.log(`\n📊 Nombre total de visiteurs: ${count.total}`);
    
    if (count.total > 0) {
      const sample = await get('SELECT * FROM visitors LIMIT 1');
      console.log('\n📝 Exemple de données:');
      console.log(sample);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await close();
  }
}

checkTableStructure();
