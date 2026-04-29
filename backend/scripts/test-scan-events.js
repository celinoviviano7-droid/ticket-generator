const { run, get, all } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

async function createTestScanEvents() {
  try {
    console.log('🔧 Création d\'événements de scan de test...');
    
    // Récupérer un ticket existant pour les tests
    const ticket = await get('SELECT id, barcode FROM tickets LIMIT 1');
    
    if (!ticket) {
      console.log('❌ Aucun ticket trouvé. Créez d\'abord un ticket.');
      return;
    }
    
    console.log('✅ Ticket trouvé:', ticket.barcode);
    
    // Créer plusieurs événements de scan de test
    const testScans = [
      {
        uuid: uuidv4(),
        ticket_id: ticket.id,
        scan_data: ticket.barcode,
        scan_type: 'camera',
        scanned_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
        scanner_device: 'desktop',
        status: 'success',
        location: 'kiosk'
      },
      {
        uuid: uuidv4(),
        ticket_id: ticket.id,
        scan_data: ticket.barcode,
        scan_type: 'camera',
        scanned_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1h ago
        scanner_device: 'mobile',
        status: 'success',
        location: 'entrance'
      },
      {
        uuid: uuidv4(),
        ticket_id: null,
        scan_data: 'INVALID123456',
        scan_type: 'camera',
        scanned_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30min ago
        scanner_device: 'desktop',
        status: 'failed',
        location: 'kiosk'
      },
      {
        uuid: uuidv4(),
        ticket_id: ticket.id,
        scan_data: ticket.barcode,
        scan_type: 'manual',
        scanned_at: new Date().toISOString(), // Maintenant
        scanner_device: 'desktop',
        status: 'success',
        location: 'kiosk'
      }
    ];
    
    // Insérer les événements de test
    for (const scan of testScans) {
      const sql = `
        INSERT INTO scan_events (
          uuid, ticket_id, scan_data, scan_type, scanned_at, scanner_device, status, location
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        scan.uuid,
        scan.ticket_id,
        scan.scan_data,
        scan.scan_type,
        scan.scanned_at,
        scan.scanner_device,
        scan.status,
        scan.location
      ];
      
      await run(sql, params);
      console.log(`✅ Scan de test créé: ${scan.scan_data} - ${scan.status}`);
    }
    
    // Vérifier le nombre d'événements créés
    const count = await get('SELECT COUNT(*) as total FROM scan_events');
    console.log(`📊 Total des événements de scan: ${count.total}`);
    
    // Afficher les événements créés
    const events = await all('SELECT * FROM scan_events ORDER BY scanned_at DESC');
    console.log('📋 Événements de scan créés:');
    events.forEach(event => {
      console.log(`  - ${event.scan_data} (${event.status}) - ${event.scanned_at}`);
    });
    
    console.log('✅ Événements de scan de test créés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des événements de scan:', error);
  }
}

// Exécuter le script
createTestScanEvents();
