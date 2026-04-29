const { run, get, close } = require('./config/database');
const Visitor = require('./models/Visitor');
const Ticket = require('./models/Ticket');

async function testTicketCreation() {
  try {
    console.log('🧪 Test de création de ticket...');
    
    // Test de création d'un visiteur
    const timestamp = Date.now();
    const testVisitorData = {
      first_name: 'Test',
      last_name: 'Ticket',
      email: `test.ticket.${timestamp}@example.com`,
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
    
    // Test de création d'un ticket
    const ticket = await Ticket.createWithVisitor(testVisitorData);
    console.log('✅ Ticket créé avec succès:', ticket.toJSON());
    
    // Nettoyer les tests
    await visitor.delete();
    console.log('✅ Visiteur de test supprimé');
    
    console.log('🎉 Test de création de ticket réussi !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await close();
  }
}

testTicketCreation();
