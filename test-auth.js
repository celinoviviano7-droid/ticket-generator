// Script de test pour vérifier l'authentification
console.log('🔍 Test de l\'authentification...');

// Test 1: Vérifier la connexion au serveur
async function testServerConnection() {
  try {
    const response = await fetch('http://localhost:5000/health');
    const data = await response.json();
    console.log('✅ Serveur connecté:', data);
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion au serveur:', error);
    return false;
  }
}

// Test 2: Tester la connexion avec les identifiants admin
async function testLogin() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@anosiravo.com',
        password: 'admin123'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Connexion réussie:', {
        user: result.data.user,
        token: result.data.token.substring(0, 50) + '...',
        expiresIn: result.data.expiresIn
      });
      return result.data.token;
    } else {
      console.error('❌ Échec de la connexion:', result.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Erreur lors de la connexion:', error);
    return null;
  }
}

// Test 3: Tester l'API des tickets avec le token
async function testTicketsAPI(token) {
  if (!token) {
    console.log('⚠️ Pas de token, impossible de tester l\'API des tickets');
    return false;
  }

  try {
    const response = await fetch('http://localhost:5000/api/tickets/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API des tickets accessible:', {
        success: data.success,
        ticketsCount: data.data?.tickets?.length || 0
      });
      return true;
    } else {
      console.error('❌ Erreur API des tickets:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'appel API des tickets:', error);
    return false;
  }
}

// Exécuter tous les tests
async function runAllTests() {
  console.log('🚀 Démarrage des tests d\'authentification...\n');
  
  // Test 1: Connexion au serveur
  const serverOk = await testServerConnection();
  if (!serverOk) {
    console.log('❌ Arrêt des tests - serveur inaccessible');
    return;
  }
  
  console.log('');
  
  // Test 2: Connexion utilisateur
  const token = await testLogin();
  
  console.log('');
  
  // Test 3: Test de l'API protégée
  if (token) {
    await testTicketsAPI(token);
  }
  
  console.log('\n🏁 Tests terminés');
}

// Exécuter les tests si le script est appelé directement
if (typeof window === 'undefined') {
  // Node.js
  const fetch = require('node-fetch');
  runAllTests();
} else {
  // Navigateur
  runAllTests();
}
