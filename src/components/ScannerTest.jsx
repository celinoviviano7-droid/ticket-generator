import React, { useState } from 'react'
import './ScannerTest.css'

const ScannerTest = () => {
  const [testBarcode, setTestBarcode] = useState('')
  const [scanResult, setScanResult] = useState(null)
  const [isChecking, setIsChecking] = useState(false)

  // Codes-barres de test (UUIDs fictifs)
  const testBarcodes = [
    'TICKET-001-ABC123',
    'TICKET-002-DEF456',
    'TICKET-003-GHI789',
    'INVALID-CODE-123',
    'TEST-UUID-456'
  ]

  // Vérifier le code-barres dans la vraie base de données
  const checkBarcodeTest = async (barcode) => {
    try {
      setIsChecking(true)
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        setScanResult({
          found: false,
          message: 'Veuillez vous connecter pour vérifier les codes-barres',
          error: 'AUTH_REQUIRED'
        })
        setIsChecking(false)
        return
      }

      console.log('🔍 Vérification du code-barres:', barcode)

      // Récupérer tous les tickets depuis la vraie API
      const response = await fetch('http://localhost:5000/api/tickets/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('📊 Données reçues de l\'API:', data)
        
        if (data.success) {
          const tickets = data.data.tickets || []
          console.log('🎫 Tickets disponibles:', tickets.length)
          
          // Chercher le ticket avec ce code-barres
          const foundTicket = tickets.find(ticket => {
            const match = ticket.barcode === barcode || 
                         ticket.uuid === barcode ||
                         ticket.visitor?.uuid === barcode
            console.log(`🔍 Vérification ticket ${ticket.uuid}:`, match)
            return match
          })

          if (foundTicket) {
            console.log('✅ Ticket trouvé:', foundTicket)
            // Ticket trouvé - afficher les informations
            setScanResult({
              found: true,
              ticket: foundTicket,
              message: '✅ Code-barres trouvé dans la base de données',
              visitor: foundTicket.visitor,
              status: foundTicket.status,
              circuit: foundTicket.visitor?.circuit || 'Non spécifié'
            })
          } else {
            console.log('❌ Aucun ticket trouvé pour:', barcode)
            // Code-barres non trouvé
            setScanResult({
              found: false,
              message: `❌ Code-barres "${barcode}" non trouvé dans la base de données`,
              error: 'NOT_FOUND',
              searchedCode: barcode
            })
          }
        } else {
          console.log('❌ Erreur API:', data)
          setScanResult({
            found: false,
            message: 'Erreur lors de la récupération des données',
            error: 'API_ERROR'
          })
        }
      } else {
        console.log('❌ Erreur HTTP:', response.status)
        setScanResult({
          found: false,
          message: 'Erreur de connexion à la base de données',
          error: 'CONNECTION_ERROR'
        })
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification:', error)
      setScanResult({
        found: false,
        message: 'Erreur lors de la vérification du code-barres',
        error: 'UNKNOWN_ERROR'
      })
    } finally {
      setIsChecking(false)
    }
  }

  const handleTestScan = () => {
    if (testBarcode.trim()) {
      checkBarcodeTest(testBarcode.trim())
    }
  }

  const handleQuickTest = (barcode) => {
    setTestBarcode(barcode)
    checkBarcodeTest(barcode)
  }

  const clearResult = () => {
    setScanResult(null)
    setTestBarcode('')
  }

  return (
    <div className="scanner-test">
      <div className="test-header">
        <h2>🧪 Test du Scanner de Codes-Barres</h2>
        <p>Testez la vérification des codes-barres avec des données simulées</p>
      </div>

      <div className="test-container">
        <div className="test-input-section">
          <h3>Test Manuel</h3>
          <div className="input-group">
            <input
              type="text"
              placeholder="Entrez un code-barres de test"
              value={testBarcode}
              onChange={(e) => setTestBarcode(e.target.value)}
              className="test-input"
            />
            <button onClick={handleTestScan} className="test-scan-button">
              🔍 Tester
            </button>
          </div>
        </div>

        <div className="quick-test-section">
          <h3>Tests Rapides</h3>
          <div className="quick-test-buttons">
            {testBarcodes.map((barcode, index) => (
              <button
                key={index}
                onClick={() => handleQuickTest(barcode)}
                className="quick-test-button"
              >
                {barcode.includes('TICKET-001') ? '🎫 Ticket Actif' :
                 barcode.includes('TICKET-002') ? '🎫 Ticket Utilisé' :
                 barcode.includes('TICKET-003') ? '🎫 Ticket Expiré' :
                 '❌ Code Invalide'}
              </button>
            ))}
          </div>
        </div>

        {/* Affichage du résultat du test */}
        {scanResult && (
          <div className={`scan-result ${scanResult.found ? 'found' : 'not-found'}`}>
            <div className="result-header">
              <h3>Résultat de la Vérification</h3>
              <button onClick={clearResult} className="close-result-button">
                ✕
              </button>
            </div>
            
            <div className="result-content">
              <div className="result-message">
                <span className="result-icon">
                  {scanResult.found ? '✅' : '❌'}
                </span>
                <p className="result-text">{scanResult.message}</p>
              </div>

              {scanResult.found && scanResult.ticket && (
                <div className="ticket-details">
                  <h4>Informations du Ticket</h4>
                  <div className="ticket-info-grid">
                    <div className="info-item">
                      <span className="info-label">UUID:</span>
                      <span className="info-value">{scanResult.ticket.uuid}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Statut:</span>
                      <span className={`status-badge ${scanResult.ticket.status}`}>
                        {scanResult.ticket.status === 'active' ? '🟢 Actif' : 
                         scanResult.ticket.status === 'used' ? '🔵 Utilisé' : 
                         scanResult.ticket.status === 'expired' ? '🟡 Expiré' : 
                         scanResult.ticket.status === 'cancelled' ? '🔴 Annulé' : 
                         scanResult.ticket.status}
                      </span>
                    </div>
                    {scanResult.visitor && (
                      <>
                        <div className="info-item">
                          <span className="info-label">Visiteur:</span>
                          <span className="info-value">
                            {scanResult.visitor.first_name} {scanResult.visitor.last_name}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Email:</span>
                          <span className="info-value">{scanResult.visitor.email}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Pays:</span>
                          <span className="info-value">
                            {scanResult.visitor.country === 'MG' ? '🇲🇬 Madagascar' : 
                             scanResult.visitor.country === 'FR' ? '🇫🇷 France' : 
                             scanResult.visitor.country === 'US' ? '🇺🇸 États-Unis' : 
                             scanResult.visitor.country}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Circuit:</span>
                          <span className="info-value">{scanResult.circuit}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {!scanResult.found && (
                <div className="not-found-info">
                  <div className="searched-code">
                    <strong>Code-barres recherché :</strong> 
                    <span className="code-value">{scanResult.searchedCode || 'N/A'}</span>
                  </div>
                  <p>Ce code-barres n'est pas enregistré dans notre base de données.</p>
                  <p>Vérifiez que :</p>
                  <ul>
                    <li>Le code-barres a été correctement saisi : <code>{scanResult.searchedCode || 'N/A'}</code></li>
                    <li>Le ticket a été créé dans le système</li>
                    <li>Le code-barres n'a pas expiré</li>
                    <li>L'orthographe est correcte</li>
                  </ul>
                </div>
              )}
            </div>

            {isChecking && (
              <div className="checking-overlay">
                <div className="checking-spinner"></div>
                <p>Vérification en cours...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ScannerTest
