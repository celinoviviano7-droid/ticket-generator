const { run, get, close } = require('./config/database');
const Visitor = require('./models/Visitor');
const Ticket = require('./models/Ticket');

async function testSpecificScan() {
  try {
    console.log('🧪 Test de scan avec code spécifique...');
    
    // Créer un visiteur de test
    const timestamp = Date.now();
    const testVisitorData = {
      first_name: 'Test',
      last_name: 'ScanSpécifique',
      email: `test.scan.specifique.${timestamp}@example.com`,
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
    
    // Créer un ticket avec le code-barres détecté
    const barcode = '352798955423218161832938';
    console.log('🎫 Code-barres spécifique:', barcode);
    
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
      console.log('👤 Informations du visiteur:', foundTicket.visitor);
      console.log('🎫 Statut du ticket:', foundTicket.status);
      console.log('✅ Ticket valide:', foundTicket.isValid());
    } else {
      console.log('❌ Ticket non trouvé par scan');
    }
    
    console.log('🎉 Test de scan spécifique réussi !');
    console.log('💡 Maintenant testez le scan depuis le frontend avec le code:', barcode);
    
    // Ne pas supprimer pour pouvoir tester le scan
    console.log('📝 Ticket conservé pour test de scan frontend');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await close();
  }
}

testSpecificScan();
