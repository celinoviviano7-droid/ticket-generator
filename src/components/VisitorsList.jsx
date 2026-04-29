import React, { useState, useEffect } from 'react'
import './VisitorsList.css'
import config from '../config/config'

const VisitorsList = () => {
  const [visitors, setVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterResidentialProfile, setFilterResidentialProfile] = useState('all')
  const [filterMonth, setFilterMonth] = useState('all')
  const [filterProfile, setFilterProfile] = useState('all')
  const [scanData, setScanData] = useState([])
  const [scanLoading, setScanLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState('')
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!initialized) {
      fetchVisitors()
      // Délai pour éviter de surcharger l'API
      const timer = setTimeout(() => {
        fetchScanData()
        setInitialized(true)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [initialized])

  const fetchVisitors = async () => {
    try {
      setLoading(true)
      // Récupérer le token depuis le localStorage
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        setError('Token d\'authentification manquant')
        setLoading(false)
        return
      }

      const response = await fetch('http://localhost:5000/api/tickets/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Extraire les visiteurs uniques à partir des tickets
        const uniqueVisitors = data.data.tickets.reduce((acc, ticket) => {
          const visitorKey = ticket.visitor.uuid
          if (!acc[visitorKey]) {
            acc[visitorKey] = ticket.visitor
          }
          return acc
        }, {})
        setVisitors(Object.values(uniqueVisitors))
      } else {
        setError(data.message || 'Erreur lors de la récupération des visiteurs')
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des visiteurs:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Récupérer les données de scan
  const fetchScanData = async (force = false) => {
    try {
      // Protection contre les appels trop fréquents (sauf si forcé)
      if (!force && scanLoading) {
        console.log('🔍 fetchScanData ignorée - déjà en cours de chargement')
        return
      }
      
      setScanLoading(true)
      const token = localStorage.getItem('authToken')
      
      console.log('🔍 fetchScanData appelée')
      console.log('🔍 Token disponible:', !!token)
      
      if (!token) {
        console.error('Token d\'authentification manquant pour les données de scan')
        setDebugInfo('❌ Token d\'authentification manquant')
        return
      }

      console.log('🔍 Appel API /api/stats/tickets-with-visitors...')
      
      // Récupérer tous les tickets avec informations des visiteurs
      const response = await fetch(`${config.api.baseURL}/api/stats/tickets-with-visitors`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('🔍 Données reçues:', result)

      if (result.success && result.data && result.data.tickets) {
        // Convertir les tickets en format compatible avec l'affichage des scans
        const scanData = result.data.tickets.map(ticket => ({
          id: ticket.id,
          uuid: ticket.uuid,
          barcode: ticket.barcode,
          ticket_id: ticket.id,
          scanned_at: ticket.issued_at, // Utiliser issued_at comme date de création
          scanner_device: 'ticket_system',
          scan_type: 'ticket_creation',
          location: 'kiosk',
          status: 'success',
          error_message: null,
          first_name: ticket.first_name,
          last_name: ticket.last_name,
          visitor_name: ticket.visitor_name,
          visitor_email: ticket.visitor_email,
          visitor_phone: ticket.visitor_phone,
          residential_profile: ticket.residential_profile,
          profile: ticket.profile,
          circuit: ticket.circuit,
          amount: ticket.amount,
          ticket_uuid: ticket.uuid,
          ticket_status: ticket.status,
          issued_at: ticket.issued_at,
          expires_at: ticket.expires_at,
          ticket_info: ticket.status === 'active' ? 'Ticket actif' : 
                      ticket.status === 'used' ? 'Ticket utilisé' : 
                      ticket.status === 'expired' ? 'Ticket expiré' : 'Statut inconnu'
        }))

        setScanData(scanData)
        setDebugInfo(`✅ ${scanData.length} tickets récupérés avec succès`)
        console.log('🔍 Scan data formatée:', scanData)
      } else {
        console.error('Format de réponse invalide:', result)
        setDebugInfo('❌ Format de réponse invalide')
      }

    } catch (error) {
      console.error('Erreur lors de la récupération des données de scan:', error)
      setDebugInfo(`❌ Erreur: ${error.message}`)
    } finally {
      setScanLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatVisitorName = (scan) => {
    // Si on a un nom complet, l'utiliser
    if (scan.visitor_name) {
      return scan.visitor_name
    }
    
    // Si on a un email, afficher "Visiteur (email)"
    if (scan.visitor_email) {
      return `Visiteur (${scan.visitor_email})`
    }
    
    // Si on a un numéro de téléphone, afficher "Visiteur (téléphone)"
    if (scan.visitor_phone) {
      return `Visiteur (${scan.visitor_phone})`
    }
    
    // Si on a un ticket_id mais pas d'infos visiteur, afficher "Visiteur anonyme"
    if (scan.ticket_id) {
      return 'Visiteur anonyme'
    }
    
    // Sinon, N/A
    return 'N/A'
  }

  const getCountryName = (countryCode) => {
    const countries = {
      'MG': 'Madagascar',
      'FR': 'France',
      'US': 'États-Unis',
      'CA': 'Canada',
      'GB': 'Royaume-Uni'
    }
    return countries[countryCode] || countryCode
  }

  const getCircuitInfo = (circuitId) => {
    const circuits = {
      '1': { name: 'Circuit Classique', duration: '2h', price: '25€' },
      '2': { name: 'Circuit Premium', duration: '4h', price: '45€' },
      '3': { name: 'Circuit VIP', duration: '6h', price: '75€' }
    }
    
    return circuits[circuitId] || { name: 'Circuit inconnu', duration: '', price: '0€' }
  }

  // Générer les options de mois pour le filtre
  const getMonthOptions = () => {
    const months = []
    const currentDate = new Date()
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })
      months.push({ value: monthKey, label: monthLabel })
    }
    
    return months
  }

  // Filtrer les visiteurs selon tous les critères
  const filteredVisitors = visitors.filter(visitor => {
    const matchesSearch = 
      visitor.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.phone?.includes(searchTerm)
    
    const matchesResidentialProfile = filterResidentialProfile === 'all' || visitor.residential_profile === filterResidentialProfile
    
    // Filtre par mois
    let matchesMonth = true
    if (filterMonth !== 'all') {
      const visitorDate = new Date(visitor.registration_date || visitor.created_at)
      const visitorMonthKey = `${visitorDate.getFullYear()}-${String(visitorDate.getMonth() + 1).padStart(2, '0')}`
      matchesMonth = visitorMonthKey === filterMonth
    }
    
    // Filtre par profil
    const matchesProfile = filterProfile === 'all' || visitor.profile === filterProfile
    
    return matchesSearch && matchesResidentialProfile && matchesMonth && matchesProfile
  })

  // Calculer les statistiques par profil
  const getProfileStats = () => {
    const stats = {}
    visitors.forEach(visitor => {
      const profile = visitor.profile || 'Non défini'
      stats[profile] = (stats[profile] || 0) + 1
    })
    return stats
  }

  // Calculer les statistiques par mois
  const getMonthStats = () => {
    const stats = {}
    visitors.forEach(visitor => {
      const date = new Date(visitor.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })
      stats[monthKey] = { label: monthLabel, count: (stats[monthKey]?.count || 0) + 1 }
    })
    return stats
  }

  const profileStats = getProfileStats()
  const monthStats = getMonthStats()

  if (loading) {
    return (
      <div className="visitors-loading">
        <div className="loading-spinner"></div>
        <p>Chargement des visiteurs...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="visitors-error">
        <div className="error-icon">⚠️</div>
        <h3>Erreur lors du chargement</h3>
        <p>{error}</p>
        <button onClick={fetchVisitors} className="retry-button">
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="visitors-list">
      <div className="visitors-header">
        <h2 className="visitors-title">Liste des Visiteurs</h2>
        <div className="visitors-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Rechercher un visiteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <select
            value={filterResidentialProfile}
            onChange={(e) => setFilterResidentialProfile(e.target.value)}
            className="country-filter"
          >
            <option value="all">Tous les profils résidentiels</option>
            <option value="residant">Résidant</option>
            <option value="non-residant">Non résidant</option>
          </select>

          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="month-filter"
          >
            <option value="all">Tous les mois</option>
            {getMonthOptions().map(month => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>

          <select
            value={filterProfile}
            onChange={(e) => setFilterProfile(e.target.value)}
            className="profile-filter"
          >
            <option value="all">Tous les profils</option>
            <option value="adulte">Adulte</option>
            <option value="enfant">Enfant</option>
            <option value="bebe">Bébé</option>
          </select>
          
          <button onClick={fetchVisitors} className="refresh-button">
            🔄 Actualiser
          </button>
        </div>
      </div>

      <div className="visitors-summary">
        <div className="summary-item">
          <span className="summary-label">Total:</span>
          <span className="summary-value">{visitors.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Résidants:</span>
          <span className="summary-value">{visitors.filter(v => v.residential_profile === 'residant').length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Non résidants:</span>
          <span className="summary-value">{visitors.filter(v => v.residential_profile === 'non-residant').length}</span>
        </div>
      </div>

      {/* Statistiques par profil */}
      <div className="profile-stats">
        <h3>📊 Statistiques par Profil</h3>
        <div className="stats-grid">
          {Object.entries(profileStats).map(([profile, count]) => (
            <div key={profile} className="stat-card">
              <div className="stat-label">{profile}</div>
              <div className="stat-value">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistiques par mois */}
      <div className="month-stats">
        <h3>📅 Statistiques par Mois</h3>
        <div className="month-stats-grid">
          {Object.entries(monthStats)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([monthKey, { label, count }]) => (
              <div key={monthKey} className="month-stat-card">
                <div className="month-label">{label}</div>
                <div className="month-value">{count}</div>
              </div>
            ))}
        </div>
      </div>

      {/* Informations de Scan des Codes-Barres */}
      <div className="scan-info-section">
        <div className="scan-header">
          <h3>📱 Informations de Scan des Codes-Barres</h3>
          <button 
            onClick={() => fetchScanData(true)} 
            className="refresh-scan-button"
            disabled={scanLoading}
          >
            {scanLoading ? '🔄' : '🔄'} Actualiser
          </button>
        </div>
        
        {/* Debug info */}
        {debugInfo && (
          <div className="debug-info" style={{
            background: debugInfo.includes('✅') ? '#d4edda' : '#f8d7da',
            color: debugInfo.includes('✅') ? '#155724' : '#721c24',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '15px',
            fontSize: '14px',
            border: `1px solid ${debugInfo.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            🔍 Debug: {debugInfo}
          </div>
        )}

        {/* Bouton de test sans authentification */}
        <div style={{ marginBottom: '15px' }}>
          <button 
            onClick={async () => {
              try {
                console.log('🧪 Test API sans authentification...')
                const response = await fetch('http://localhost:5000/api/stats/scan-events')
                const data = await response.json()
                console.log('🧪 Réponse sans auth:', data)
                setDebugInfo(`🧪 Test sans auth: ${response.status} - ${data.data?.scanEvents?.length || 0} scans`)
              } catch (err) {
                console.error('🧪 Erreur test sans auth:', err)
                setDebugInfo(`🧪 Erreur test: ${err.message}`)
              }
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🧪 Test API sans Auth
          </button>
        </div>

        {scanLoading ? (
          <div className="scan-loading">
            <div className="loading-spinner"></div>
            <span>Chargement des données de scan...</span>
          </div>
        ) : scanData.length > 0 ? (
          <div className="scan-data-container">
            <div className="scan-summary">
              <div className="scan-summary-item">
                <span className="scan-summary-label">Total des scans:</span>
                <span className="scan-summary-value">{scanData.length}</span>
              </div>
              <div className="scan-summary-item">
                <span className="scan-summary-label">Scans réussis:</span>
                <span className="scan-summary-value">
                  {scanData.filter(scan => scan.status === 'success').length}
                </span>
              </div>
              <div className="scan-summary-item">
                <span className="scan-summary-label">Scans échoués:</span>
                <span className="scan-summary-value">
                  {scanData.filter(scan => scan.status === 'failed').length}
                </span>
              </div>
            </div>
            
            <div className="scan-table-container">
              <table className="scan-table">
                <thead>
                  <tr>
                    <th>Code-Barre</th>
                    <th>Visiteur</th>
                    <th>Profil</th>
                    <th>Statut</th>
                    <th>Date de Scan</th>
                    <th>Appareil</th>
                    <th>Détails</th>
                  </tr>
                </thead>
                <tbody>
                  {scanData.slice(0, 20).map((scan, index) => (
                    <tr key={index} className={`scan-row ${scan.status === 'success' ? 'scan-success' : 'scan-failed'}`}>
                      <td className="barcode-cell">
                        <span className="barcode-text">{scan.barcode}</span>
                      </td>
                      <td className="visitor-cell">
                        <div className="visitor-info">
                          <div className="visitor-name">
                            {scan.first_name && scan.last_name 
                              ? `${scan.first_name} ${scan.last_name}`
                              : scan.visitor_name 
                                ? scan.visitor_name
                                : formatVisitorName(scan)
                            }
                          </div>
                          {scan.visitor_email && (
                            <small className="visitor-email">{scan.visitor_email}</small>
                          )}
                          {scan.visitor_phone && (
                            <small className="visitor-phone">{scan.visitor_phone}</small>
                          )}
                        </div>
                      </td>
                      <td className="profile-cell">
                        <div className="visitor-profile-info">
                          {scan.residential_profile && (
                            <span className={`profile-badge ${scan.residential_profile === 'residant' ? 'residant' : 'non-residant'}`}>
                              {scan.residential_profile === 'residant' ? '🇲🇬' : '🌍'}
                            </span>
                          )}
                          {scan.circuit && (
                            <span className="circuit-badge">
                              Circuit {scan.circuit}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="status-cell">
                        <span className={`status-badge ${scan.status === 'success' ? 'success' : 'failed'}`}>
                          {scan.status === 'success' ? '✅ Succès' : '❌ Échec'}
                        </span>
                      </td>
                      <td className="date-cell">
                        {scan.scanned_at ? formatDate(scan.scanned_at) : 'N/A'}
                      </td>
                      <td className="device-cell">
                        {scan.scanner_device || 'N/A'}
                      </td>
                      <td className="details-cell">
                        {scan.status === 'success' ? (
                          <span className="success-details">
                            Ticket valide - {scan.ticket_info || 'Informations disponibles'}
                          </span>
                        ) : (
                          <span className="failed-details">
                            {scan.error_message || 'Code non reconnu'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {scanData.length > 20 && (
                <div className="scan-pagination">
                  <span>Afficher les 20 derniers scans sur {scanData.length} total</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="no-scan-data">
            <div className="no-scan-icon">📱</div>
            <p>Aucune donnée de scan disponible</p>
            <small>Les scans apparaîtront ici après utilisation du scanner</small>
          </div>
        )}
      </div>

      {filteredVisitors.length === 0 ? (
        <div className="no-visitors">
          <div className="no-visitors-icon">👥</div>
          <h3>Aucun visiteur trouvé</h3>
          <p>
            {searchTerm || filterResidentialProfile !== 'all' || filterMonth !== 'all' || filterProfile !== 'all'
              ? 'Aucun visiteur ne correspond à vos critères de recherche.'
              : 'Aucun visiteur n\'a encore été enregistré.'
            }
          </p>
        </div>
      ) : (
        <div className="visitors-table-container">
          <table className="visitors-table">
            <thead>
              <tr>
                <th>Nom Complet</th>
                <th>Contact</th>
                <th>Profil résidentiel</th>
                <th>Profil visiteur</th>
                <th>Circuit</th>
                <th>Date d'enregistrement</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisitors.map((visitor) => {
                const circuitInfo = getCircuitInfo(visitor.circuit)
                return (
                  <tr key={visitor.uuid} className="visitor-row">
                    <td className="name-cell">
                      <div className="visitor-name">
                        <div className="full-name">
                          {visitor.first_name} {visitor.last_name}
                        </div>
                        <small className="visitor-uuid">UUID: {visitor.uuid}</small>
                      </div>
                    </td>
                    <td className="contact-cell">
                      <div className="contact-info">
                        <div className="email">{visitor.email}</div>
                        <div className="phone">{visitor.phone || 'Non renseigné'}</div>
                      </div>
                    </td>
                    <td className="residential-profile-cell">
                      <span className={`residential-profile-badge ${visitor.residential_profile === 'residant' ? 'residant' : 'non-residant'}`}>
                        {visitor.residential_profile === 'residant' ? '🇲🇬 Résidant' : '🌍 Non résidant'}
                      </span>
                    </td>
                    <td className="profile-cell">
                      <span className={`profile-badge profile-${visitor.profile || 'default'}`}>
                        {visitor.profile || 'Non défini'}
                      </span>
                    </td>
                    <td className="circuit-cell">
                      <div className="circuit-info">
                        <div className="circuit-name">{circuitInfo.name}</div>
                        <div className="circuit-details">
                          <small>{circuitInfo.duration} • {circuitInfo.price}</small>
                        </div>
                      </div>
                    </td>
                    <td className="date-cell">
                      {formatDate(visitor.registration_date || visitor.created_at)}
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button className="action-btn view-btn" title="Voir les détails">
                          👁️
                        </button>
                        <button className="action-btn edit-btn" title="Modifier">
                          ✏️
                        </button>
                        <button className="action-btn delete-btn" title="Supprimer">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default VisitorsList
