const { run, get } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

async function fixUsersTable() {
  try {
    console.log('🔧 Vérification et correction de la table users...');

    // Vérifier la structure actuelle de la table
    try {
      await run('SELECT uuid FROM users LIMIT 1');
      console.log('✅ Champ uuid existe déjà');
    } catch (error) {
      console.log('➕ Ajout du champ uuid...');
      await run('ALTER TABLE users ADD COLUMN uuid TEXT UNIQUE NOT NULL');
      console.log('✅ Champ uuid ajouté');
    }

    try {
      await run('SELECT is_active FROM users LIMIT 1');
      console.log('✅ Champ is_active existe déjà');
    } catch (error) {
      console.log('➕ Ajout du champ is_active...');
      await run('ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1');
      console.log('✅ Champ is_active ajouté');
    }

    // Mettre à jour les utilisateurs existants avec des UUID et is_active = 1
    const existingUsers = await get('SELECT id FROM users');
    if (existingUsers && existingUsers.length > 0) {
      console.log(`🔄 Mise à jour de ${existingUsers.length} utilisateur(s) existant(s)...`);
      
      for (const user of existingUsers) {
        const newUuid = uuidv4();
        await run('UPDATE users SET uuid = ?, is_active = 1 WHERE id = ?', [newUuid, user.id]);
      }
      console.log('✅ Utilisateurs existants mis à jour');
    }

    console.log('✅ Structure de la table users corrigée !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction de la table users:', error);
    process.exit(1);
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  fixUsersTable();
}

module.exports = { fixUsersTable };
