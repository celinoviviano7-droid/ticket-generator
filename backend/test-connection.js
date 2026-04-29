const http = require('http');

function testConnection() {
  console.log('🔍 Test de connexion au serveur...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Serveur répond - Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📊 Réponse:', data);
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erreur de connexion:', error.message);
  });

  req.setTimeout(5000, () => {
    console.error('⏰ Timeout - Le serveur ne répond pas');
    req.destroy();
  });

  req.end();
}

// Tester la connexion
testConnection();
