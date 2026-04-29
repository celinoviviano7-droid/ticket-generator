import React, { useState, useEffect } from 'react'
import './TicketsList.css'

const TicketsList = () => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
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
        setTickets(data.data.tickets || [])
      } else {
        setError(data.message || 'Erreur lors de la récupération des tickets')
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des tickets:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    // Vérifier si la date est valide
    if (!dateString) {
      return 'Date non disponible'
    }
    
    try {
      const date = new Date(dateString)
      
      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        return 'Date invalide'
      }
      
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error, 'Date reçue:', dateString)
      return 'Erreur de date'
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { label: 'Actif', className: 'status-active' },
      'used': { label: 'Utilisé', className: 'status-used' },
      'expired': { label: 'Expiré', className: 'status-expired' },
      'cancelled': { label: 'Annulé', className: 'status-cancelled' }
    }
    
    const config = statusConfig[status] || { label: status, className: 'status-unknown' }
    
    return (
      <span className={`status-badge ${config.className}`}>
        {config.label}
      </span>
    )
  }

  const getCircuitInfo = (circuitId) => {
    const circuits = {
      '1': { name: 'Circuit Classique', duration: '2h', price: '25€' },
      '2': { name: 'Circuit Premium', duration: '4h', price: '45€' },
      '3': { name: 'Circuit VIP', duration: '6h', price: '75€' }
    }
    
    return circuits[circuitId] || { name: 'Circuit inconnu', duration: '', price: '0€' }
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.visitor?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.visitor?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.visitor?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="tickets-loading">
        <div className="loading-spinner"></div>
        <p>Chargement des tickets...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="tickets-error">
        <div className="error-icon">⚠️</div>
        <h3>Erreur lors du chargement</h3>
        <p>{error}</p>
        <button onClick={fetchTickets} className="retry-button">
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="tickets-list">
      <div className="tickets-header">
        <h2 className="tickets-title">Liste des Tickets</h2>
        <div className="tickets-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Rechercher un ticket..."
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
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="used">Utilisés</option>
            <option value="expired">Expirés</option>
            <option value="cancelled">Annulés</option>
          </select>
          
          <button onClick={fetchTickets} className="refresh-button">
            🔄 Actualiser
          </button>
        </div>
      </div>

      <div className="tickets-summary">
        <div className="summary-item">
          <span className="summary-label">Total:</span>
          <span className="summary-value">{tickets.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Actifs:</span>
          <span className="summary-value">{tickets.filter(t => t.status === 'active').length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Utilisés:</span>
          <span className="summary-value">{tickets.filter(t => t.status === 'used').length}</span>
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="no-tickets">
          <div className="no-tickets-icon">🎫</div>
          <h3>Aucun ticket trouvé</h3>
          <p>
            {searchTerm || filterStatus !== 'all' 
              ? 'Aucun ticket ne correspond à vos critères de recherche.'
              : 'Aucun ticket n\'a encore été créé.'
            }
          </p>
        </div>
      ) : (
        <div className="tickets-table-container">
          <table className="tickets-table">
            <thead>
              <tr>
                <th>Code-Barres</th>
                <th>Visiteur</th>
                <th>Circuit</th>
                <th>Statut</th>
                <th>Date de création</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => {
                const circuitInfo = getCircuitInfo(ticket.visitor?.circuit)
                return (
                  <tr key={ticket.uuid} className="ticket-row">
                    <td className="barcode-cell">
                      <div className="barcode-info">
                        <span className="barcode-text">{ticket.barcode}</span>
                        <small className="barcode-uuid">UUID: {ticket.uuid}</small>
                      </div>
                    </td>
                    <td className="visitor-cell">
                      <div className="visitor-info">
                        <div className="visitor-name">
                          {ticket.visitor?.first_name} {ticket.visitor?.last_name}
                        </div>
                        <div className="visitor-details">
                          <small>{ticket.visitor?.email}</small>
                          <small>{ticket.visitor?.phone}</small>
                        </div>
                      </div>
                    </td>
                    <td className="circuit-cell">
                      <div className="circuit-info">
                        <div className="circuit-name">{circuitInfo.name}</div>
                        <div className="circuit-details">
                          <small>{circuitInfo.duration} • {circuitInfo.price}</small>
                        </div>
                      </div>
                    </td>
                    <td className="status-cell">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="date-cell">
                      {formatDate(ticket.issued_at)}
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

export default TicketsList
