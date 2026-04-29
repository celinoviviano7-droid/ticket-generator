import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import VisitorForm from '../components/VisitorForm'
import TicketSummary from '../components/TicketSummary'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import './KioskPage.css'

const KioskPage = () => {
  const [showTicket, setShowTicket] = useState(false)
  const [currentTicket, setCurrentTicket] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleVisitorSubmit = async (visitorData) => {
    setLoading(true)
    
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const ticket = {
      id: Date.now(),
      ...visitorData
    }
    
    setCurrentTicket(ticket)
    setShowTicket(true)
    setLoading(false)
  }

  const handlePrintTicket = () => {
    window.print()
  }

  const handleCloseTicket = () => {
    setShowTicket(false)
    setCurrentTicket(null)
  }

  return (
    <div className="kiosk-page">
      <div className="kiosk-hero">
        <div className="container">
          <h1 className="page-title">e-Bracelet Anosiravo</h1>
          <p className="page-subtitle">Kiosque d'enregistrement des visiteurs</p>
        </div>
      </div>

      <main className="page-main">
        <div className="container">
          <div className="kiosk-content">
            <div className="kiosk-info">
              <div className="info-card">
                <div className="info-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  </svg>
                </div>
                <h3>Enregistrement Rapide</h3>
                <p>Créez votre ticket d'accès au parc en quelques minutes</p>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                  </svg>
                </div>
                <h3>Circuits Variés</h3>
                <p>Choisissez parmi nos circuits adaptés à tous les niveaux</p>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4"></path>
                    <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"></path>
                    <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"></path>
                  </svg>
                </div>
                <h3>Accès Sécurisé</h3>
                <p>Votre bracelet électronique vous donne accès aux zones autorisées</p>
              </div>
            </div>

            <div className="kiosk-form-section">
              <VisitorForm onSubmit={handleVisitorSubmit} loading={loading} />
            </div>
          </div>
        </div>
      </main>

      <footer className="page-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-links">
              <Link to="/dashboard" className="footer-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="9" x2="15" y2="9"></line>
                  <line x1="9" y1="12" x2="15" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
                Tableau de bord
              </Link>
              <Link to="/scanner" className="footer-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9h6l1-6 1 6h6"></path>
                  <path d="M3 15h6l1 6 1-6h6"></path>
                </svg>
                Scanner
              </Link>
            </div>
            <p className="footer-text">© 2024 e-Bracelet Anosiravo. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      <Modal
        isOpen={showTicket}
        onClose={handleCloseTicket}
        title="Ticket Généré"
        size="large"
      >
        <TicketSummary
          ticket={currentTicket}
          onPrint={handlePrintTicket}
          onClose={handleCloseTicket}
        />
      </Modal>
    </div>
  )
}

export default KioskPage
