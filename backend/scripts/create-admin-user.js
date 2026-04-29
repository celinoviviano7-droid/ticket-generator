const bcrypt = require('bcryptjs');
const { run } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

async function createAdminUser() {
  try {
    console.log('🚀 Création de l\'utilisateur administrateur...');

    // Vérifier si l'utilisateur admin existe déjà
    const existingUser = await run('SELECT id FROM users WHERE email = ?', ['admin@anosiravo.com']);
    
    if (existingUser && existingUser.length > 0) {
      console.log('✅ L\'utilisateur administrateur existe déjà');
      return;
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash('admin123', 12);
    
    // Créer l'utilisateur administrateur
    const userUuid = uuidv4();
    await run(`
      INSERT INTO users (uuid, username, email, password_hash, role, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [userUuid, 'Administrateur', 'admin@anosiravo.com', passwordHash, 'admin']);

    console.log('✅ Utilisateur administrateur créé avec succès !');
    console.log('📧 Email: admin@anosiravo.com');
    console.log('🔑 Mot de passe: admin123');
    console.log('👤 Rôle: admin');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur administrateur:', error);
    process.exit(1);
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  createAdminUser();
}

module.exports = { createAdminUser };
