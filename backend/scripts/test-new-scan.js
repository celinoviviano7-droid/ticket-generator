const { run, get } = require('../config/database');
const Visitor = require('../models/Visitor');
const Ticket = require('../models/Ticket');

async function testNewScan() {
  try {
    console.log('🧪 Test de création d\'un nouveau ticket pour scanner...');
    
    // Créer un nouveau visiteur avec un email unique
    const timestamp = Date.now();
    const visitorData = {
      first_name: 'Test Scanner',
      last_name: 'Nouveau',
      email: `test.scanner.nouveau.${timestamp}@example.com`,
      phone: '+261 34 56 78 90',
      residential_profile: 'residant',
      profile: 'adulte',
      circuit: 'sud',
      amount: 200000,
      registration_date: new Date().toISOString()
    };
    
    console.log('📝 Création du visiteur...');
    const visitor = await Visitor.create(visitorData);
    console.log('✅ Visiteur créé:', visitor.id);
    
    // Créer un ticket avec un nouveau code-barres
    const newBarcode = `TEST${timestamp}`;
    const ticketData = {
      visitor_id: visitor.id,
      barcode: newBarcode,
      qr_code: `QR${timestamp}`,
      status: 'active',
      issued_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // +30 jours
    };
    
    console.log('🎫 Création du ticket...');
    const ticket = await Ticket.create(ticketData);
    console.log('✅ Ticket créé:', ticket.id);
    
    console.log('\n🎯 **INFORMATIONS POUR LE TEST :**');
    console.log(`📱 Code-barres à scanner: ${newBarcode}`);
    console.log(`👤 Visiteur: ${visitorData.first_name} ${visitorData.last_name}`);
    console.log(`📧 Email: ${visitorData.email}`);
    console.log(`🎫 Ticket ID: ${ticket.id}`);
    
    console.log('\n📋 **ÉTAPES POUR TESTER :**');
    console.log('1. Allez sur la page Scanner');
    console.log('2. Utilisez "🧪 Test Manuel" avec le code-barres ci-dessus');
    console.log('3. Vérifiez que le scan est enregistré dans le tableau de bord');
    
    return { visitor, ticket, barcode: newBarcode };
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    throw error;
  }
}

// Exécuter le test
if (require.main === module) {
  testNewScan()
    .then(() => {
      console.log('\n✅ Test terminé avec succès !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test échoué:', error);
      process.exit(1);
    });
}

module.exports = { testNewScan };
