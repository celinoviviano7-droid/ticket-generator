import React from 'react'
import Button from './ui/Button'
import './TicketSummary.css'

const TicketSummary = ({ ticket, onPrint, onClose }) => {
  if (!ticket) return null

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCircuitInfo = (circuitId) => {
    const circuits = {
      1: { name: 'Circuit Classique', duration: '2h', price: '25€' },
      2: { name: 'Circuit Premium', duration: '4h', price: '45€' },
      3: { name: 'Circuit VIP', duration: '6h', price: '75€' }
    }
    return circuits[circuitId] || { name: 'Circuit inconnu', duration: 'N/A', price: 'N/A' }
  }

  const circuit = getCircuitInfo(ticket.circuit)

  return (
    <div className="ticket-summary">
      <div className="ticket-header">
        <div className="ticket-logo">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4"></path>
            <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"></path>
            <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"></path>
            <path d="M12 3c0 1-1 2-2 2s-2 1-2 2 1 2 2 2 2 1 2 2 1-2 2-2 2-1 2-2-1-2-2-2-2-1-2-2z"></path>
          </svg>
        </div>
        <h2 className="ticket-title">e-Bracelet Anosiravo</h2>
        <p className="ticket-subtitle">Parc National</p>
      </div>

      <div className="ticket-content">
        <div className="ticket-section">
          <h3 className="section-title">Informations du Visiteur</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Nom complet:</span>
              <span className="info-value">{ticket.firstName} {ticket.lastName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{ticket.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Téléphone:</span>
              <span className="info-value">{ticket.phone}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Pays:</span>
              <span className="info-value">{ticket.country}</span>
            </div>
          </div>
        </div>

        <div className="ticket-section">
          <h3 className="section-title">Détails du Circuit</h3>
          <div className="circuit-info">
            <div className="circuit-name">{circuit.name}</div>
            <div className="circuit-details">
              <span className="circuit-duration">Durée: {circuit.duration}</span>
              <span className="circuit-price">Prix: {circuit.price}</span>
            </div>
          </div>
        </div>

        <div className="ticket-section">
          <h3 className="section-title">Informations du Ticket</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Numéro de ticket:</span>
              <span className="info-value ticket-number">#{ticket.id || 'TEMP-' + Date.now()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Date d'entrée:</span>
              <span className="info-value">{formatDate(ticket.entryDate)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Statut:</span>
              <span className="info-value status-active">Actif</span>
            </div>
          </div>
        </div>
      </div>

      <div className="ticket-footer">
        <div className="qr-placeholder">
          <div className="qr-code">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <path d="M9 9h.01"></path>
              <path d="M15 9h.01"></path>
              <path d="M9 15h.01"></path>
              <path d="M15 15h.01"></path>
            </svg>
          </div>
          <p className="qr-text">Code QR pour accès</p>
        </div>
      </div>

      <div className="ticket-actions">
        <Button onClick={onPrint} variant="primary" size="medium">
          Imprimer le ticket
        </Button>
        <Button onClick={onClose} variant="secondary" size="medium">
          Fermer
        </Button>
      </div>
    </div>
  )
}

export default TicketSummary



