const { run, get } = require('../config/database');
const Visitor = require('../models/Visitor');
const Ticket = require('../models/Ticket');

async function createTestTicket() {
  try {
    console.log('🧪 Création d\'un ticket de test pour le scanner...');
    
    // Créer un visiteur de test
    const visitorData = {
      first_name: 'Jean',
      last_name: 'Test',
      email: `test.scanner.${Date.now()}@anosiravo.com`,
      phone: '+261 34 12 34 56',
      residential_profile: 'resident',
      profile: 'adult',
      circuit: '1',
      amount: 25.0,
      registration_date: new Date().toISOString()
    };
    
    console.log('👤 Création du visiteur...');
    const visitor = await Visitor.create(visitorData);
    console.log(`✅ Visiteur créé avec l'ID: ${visitor.id}`);
    
    // Créer un ticket avec un code-barres spécifique
    const ticketData = {
      visitor_id: visitor.id,
      barcode: 'TEST123456789', // Code-barres facile à scanner
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 jours
    };
    
    console.log('🎫 Création du ticket...');
    const ticket = await Ticket.create(ticketData);
    console.log(`✅ Ticket créé avec l'ID: ${ticket.id}`);
    
    // Récupérer le ticket complet avec les infos du visiteur
    const fullTicket = await Ticket.findByIdWithVisitor(ticket.id);
    
    console.log('\n🎉 Ticket de test créé avec succès !');
    console.log('📊 Informations du ticket:');
    console.log(`  - Code-barres: ${fullTicket.barcode}`);
    console.log(`  - Visiteur: ${fullTicket.visitor.first_name} ${fullTicket.visitor.last_name}`);
    console.log(`  - Email: ${fullTicket.visitor.email}`);
    console.log(`  - Circuit: ${fullTicket.visitor.circuit}`);
    console.log(`  - Montant: ${fullTicket.visitor.amount}€`);
    
    console.log('\n🔍 Maintenant testez le scanner avec ce code-barres:');
    console.log(`   Code: ${fullTicket.barcode}`);
    
    return fullTicket;
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du ticket de test:', error);
    throw error;
  }
}

// Exécuter la création
if (require.main === module) {
  createTestTicket()
    .then(() => {
      console.log('\n✅ Ticket de test créé avec succès !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Création échouée:', error);
      process.exit(1);
    });
}

module.exports = { createTestTicket };
