const { run, get, close } = require('./config/database');
const Visitor = require('./models/Visitor');

async function testDatabase() {
  try {
    console.log('🧪 Test de la base de données...');
    
    // Test de connexion
    console.log('✅ Connexion à la base de données établie');
    
    // Test de création d'un visiteur
    const testVisitorData = {
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      phone: '+261 34 12 345 67',
      residential_profile: 'residant',
      circuit: 'nord',
      profile: 'adulte',
      amount: 150000,
      registration_date: new Date().toISOString()
    };
    
    console.log('📝 Données de test:', testVisitorData);
    
    const visitor = await Visitor.create(testVisitorData);
    console.log('✅ Visiteur créé avec succès:', visitor.toJSON());
    
    // Test de récupération
    const foundVisitor = await Visitor.findByEmail('test@example.com');
    console.log('✅ Visiteur récupéré:', foundVisitor.toJSON());
    
    // Nettoyer le test
    await foundVisitor.delete();
    console.log('✅ Visiteur de test supprimé');
    
    console.log('🎉 Tous les tests ont réussi !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await close();
  }
}

testDatabase();
