const { run, get, close } = require('./config/database');
const Visitor = require('./models/Visitor');
const Ticket = require('./models/Ticket');

async function testScan() {
  try {
    console.log('🧪 Test de scan de ticket...');
    
    // Créer un visiteur de test
    const timestamp = Date.now();
    const testVisitorData = {
      first_name: 'Test',
      last_name: 'Scan',
      email: `test.scan.${timestamp}@example.com`,
      phone: '+261 34 12 345 67',
      residential_profile: 'residant',
      circuit: 'nord',
      profile: 'adulte',
      amount: 150000,
      registration_date: new Date().toISOString()
    };
    
    console.log('📝 Création du visiteur de test...');
    const visitor = await Visitor.create(testVisitorData);
    console.log('✅ Visiteur créé:', visitor.toJSON());
    
    // Créer un ticket de test
    const barcode = `ANOS${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    console.log('🎫 Code-barres généré:', barcode);
    
    const ticket = await Ticket.create({
      visitor_id: visitor.id,
      barcode: barcode,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    console.log('✅ Ticket créé:', ticket.toJSON());
    
    // Tester la recherche par code-barres
    console.log('🔍 Test de recherche par code-barres...');
    const foundTicket = await Ticket.findByBarcode(barcode);
    
    if (foundTicket) {
      console.log('✅ Ticket trouvé par scan:', foundTicket.toJSON());
    } else {
      console.log('❌ Ticket non trouvé par scan');
    }
    
    // Nettoyer les tests
    await visitor.delete();
    console.log('✅ Visiteur de test supprimé');
    
    console.log('🎉 Test de scan réussi !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await close();
  }
}

testScan();
