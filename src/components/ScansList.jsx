import React, { useState, useEffect } from 'react'
import './ScansList.css'

const ScansList = () => {
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchScans()
  }, [])

  const fetchScans = async () => {
    try {
      setLoading(true)
      // Récupérer le token depuis le localStorage
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        setError('Token d\'authentification manquant')
        setLoading(false)
        return
      }

      const response = await fetch('http://localhost:5000/api/scanner/history', {
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
        setScans(data.data.scans || [])
      } else {
        setError(data.message || 'Erreur lors de la récupération des scans')
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des scans:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getScanStatus = (scan) => {
    // Pour l'instant, considérons tous les scans comme valides
    // car l'API ne retourne pas explicitement is_valid
    return { label: 'Valide', className: 'status-valid' }
  }

  const getScanType = (scan) => {
    if (scan.scan_type === 'camera') {
      return { label: 'Caméra', icon: '📷', className: 'type-entry' }
    } else if (scan.scan_type === 'manual') {
      return { label: 'Manuel', icon: '✋', className: 'type-exit' }
    } else {
      return { label: 'Autre', icon: '🔍', className: 'type-check' }
    }
  }

  const filteredScans = scans.filter(scan => {
    const matchesSearch = 
      scan.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.scanner_id?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Pour l'instant, filtrer par type de scan au lieu du statut
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'valid' && scan.scan_type === 'camera') ||
      (filterStatus === 'invalid' && scan.scan_type === 'manual')
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="scans-loading">
        <div className="loading-spinner"></div>
        <p>Chargement de l'historique des scans...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="scans-error">
        <div className="error-icon">⚠️</div>
        <h3>Erreur lors du chargement</h3>
        <p>{error}</p>
        <button onClick={fetchScans} className="retry-button">
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="scans-list">
      <div className="scans-header">
        <h2 className="scans-title">Historique des Scans</h2>
        <div className="scans-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Rechercher un scan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">Tous les types</option>
            <option value="valid">Scans caméra</option>
            <option value="invalid">Scans manuels</option>
          </select>
          
          <button onClick={fetchScans} className="refresh-button">
            🔄 Actualiser
          </button>
        </div>
      </div>

      <div className="scans-summary">
        <div className="summary-item">
          <span className="summary-label">Total:</span>
          <span className="summary-value">{scans.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Caméra:</span>
          <span className="summary-value">{scans.filter(s => s.scan_type === 'camera').length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Manuel:</span>
          <span className="summary-value">{scans.filter(s => s.scan_type === 'manual').length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Aujourd'hui:</span>
          <span className="summary-value">
            {scans.filter(s => {
              const today = new Date().toDateString()
              const scanDate = new Date(s.scan_time).toDateString()
              return today === scanDate
            }).length}
          </span>
        </div>
      </div>

      {filteredScans.length === 0 ? (
        <div className="no-scans">
          <div className="no-scans-icon">📱</div>
          <h3>Aucun scan trouvé</h3>
          <p>
            {searchTerm || filterStatus !== 'all' 
              ? 'Aucun scan ne correspond à vos critères de recherche.'
              : 'Aucun scan n\'a encore été effectué.'
            }
          </p>
        </div>
      ) : (
        <div className="scans-table-container">
          <table className="scans-table">
            <thead>
              <tr>
                <th>Code-Barres</th>
                <th>Visiteur</th>
                <th>Type de Scan</th>
                <th>Statut</th>
                <th>Scanner</th>
                <th>Date/Heure</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredScans.map((scan) => {
                const scanStatus = getScanStatus(scan)
                const scanType = getScanType(scan)
                
                return (
                  <tr key={scan.uuid} className="scan-row">
                    <td className="barcode-cell">
                      <div className="barcode-info">
                        <span className="barcode-text">{scan.barcode || 'N/A'}</span>
                        <small className="scan-uuid">UUID: {scan.uuid}</small>
                      </div>
                    </td>
                    <td className="visitor-cell">
                      <div className="visitor-info">
                        <div className="visitor-name">
                          {scan.first_name} {scan.last_name}
                        </div>
                        <div className="visitor-details">
                          <small>{scan.email}</small>
                        </div>
                      </div>
                    </td>
                    <td className="type-cell">
                      <div className={`scan-type ${scanType.className}`}>
                        <span className="type-icon">{scanType.icon}</span>
                        <span className="type-label">{scanType.label}</span>
                      </div>
                    </td>
                    <td className="status-cell">
                      <span className={`status-badge ${scanStatus.className}`}>
                        {scanStatus.label}
                      </span>
                    </td>
                    <td className="scanner-cell">
                      <div className="scanner-info">
                        <span className="scanner-id">{scan.scanner_id || 'Scanner inconnu'}</span>
                        <small className="scanner-location">{scan.location || 'Localisation inconnue'}</small>
                      </div>
                    </td>
                    <td className="date-cell">
                      {formatDate(scan.timestamp)}
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button className="action-btn view-btn" title="Voir les détails">
                          👁️
                        </button>
                        <button className="action-btn export-btn" title="Exporter">
                          📤
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

export default ScansList
