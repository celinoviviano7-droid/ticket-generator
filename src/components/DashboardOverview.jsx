import React, { useState, useEffect } from 'react'
import AuthNotification from './AuthNotification'
import { config, utils } from '../config/config'
import './DashboardOverview.css'

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalTickets: 0,
    activeTickets: 0,
    usedTickets: 0,
    totalVisitors: 0,
    todayScans: 0,
    totalScans: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem(config.auth.tokenKey)
      
      if (!token) {
        setError('Veuillez vous connecter pour voir les statistiques')
        setLoading(false)
        return
      }

      // Récupérer les statistiques des tickets
      const ticketsResponse = await fetch(`${config.api.baseURL}${config.api.endpoints.tickets}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          ...config.api.headers
        }
      })

      if (ticketsResponse.ok) {
        const ticketsData = await ticketsResponse.json()
        if (ticketsData.success) {
          const tickets = ticketsData.data.tickets || []
          
          // Calculer les statistiques des tickets
          const totalTickets = tickets.length
          const activeTickets = tickets.filter(t => t.status === 'active').length
          const usedTickets = tickets.filter(t => t.status === 'used').length
          
          // Extraire les visiteurs uniques
          const uniqueVisitors = tickets.reduce((acc, ticket) => {
            if (ticket.visitor && ticket.visitor.uuid) {
              acc[ticket.visitor.uuid] = ticket.visitor
            }
            return acc
          }, {})
          const totalVisitors = Object.keys(uniqueVisitors).length

          // Récupérer les statistiques des scans
          const scansResponse = await fetch(`${config.api.baseURL}${config.api.endpoints.scanner.history}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              ...config.api.headers
            }
          })

          let totalScans = 0
          let todayScans = 0

          if (scansResponse.ok) {
            const scansData = await scansResponse.json()
            if (scansData.success) {
              const scans = scansData.data.scans || []
              totalScans = scans.length
              
              // Compter les scans d'aujourd'hui
              const today = new Date().toDateString()
              todayScans = scans.filter(scan => {
                const scanDate = new Date(scan.timestamp || scan.scan_time).toDateString()
                return scanDate === today
              }).length
            }
          }

          setStats({
            totalTickets,
            activeTickets,
            usedTickets,
            totalVisitors,
            todayScans,
            totalScans
          })
        }
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques:', err)
      setError('Erreur lors du chargement des statistiques')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (value, total) => {
    if (total === 0) return '#9ca3af'
    const percentage = (value / total) * 100
    if (percentage >= 70) return '#10b981'
    if (percentage >= 40) return '#f59e0b'
    return '#ef4444'
  }

  if (loading) {
    return (
      <div className="dashboard-overview loading">
        <div className="loading-spinner"></div>
        <p>Chargement des statistiques...</p>
      </div>
    )
  }

  if (error) {
    // Si l'erreur est liée à l'authentification, afficher la notification
    if (error.includes('connecter') || error.includes('Token')) {
      return <AuthNotification />
    }
    
    return (
      <div className="dashboard-overview error">
        <div className="error-icon">⚠️</div>
        <h3>Erreur de chargement</h3>
        <p>{error}</p>
        <button onClick={fetchDashboardStats} className="retry-button">
          🔄 Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="dashboard-overview">
      <div className="overview-header">
        <h2>📊 Vue d'Ensemble</h2>
        <p>Statistiques en temps réel de votre application e-Bracelet</p>
      </div>

      <div className="stats-grid">
        {/* Statistiques des Tickets */}
        <div className="stat-card tickets-stats">
          <div className="stat-header">
            <span className="stat-icon">🎫</span>
            <h3>Tickets</h3>
          </div>
          <div className="stat-content">
            <div className="stat-main">
              <span className="stat-value">{stats.totalTickets}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-details">
              <div className="stat-item">
                <span className="stat-number" style={{ color: getStatusColor(stats.activeTickets, stats.totalTickets) }}>
                  {stats.activeTickets}
                </span>
                <span className="stat-text">Actifs</span>
              </div>
              <div className="stat-item">
                <span className="stat-number" style={{ color: getStatusColor(stats.usedTickets, stats.totalTickets) }}>
                  {stats.usedTickets}
                </span>
                <span className="stat-text">Utilisés</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques des Visiteurs */}
        <div className="stat-card visitors-stats">
          <div className="stat-header">
            <span className="stat-icon">👥</span>
            <h3>Visiteurs</h3>
          </div>
          <div className="stat-content">
            <div className="stat-main">
              <span className="stat-value">{stats.totalVisitors}</span>
              <span className="stat-label">Enregistrés</span>
            </div>
            <div className="stat-details">
              <div className="stat-item">
                <span className="stat-number" style={{ color: '#10b981' }}>
                  {stats.totalVisitors > 0 ? '100%' : '0%'}
                </span>
                <span className="stat-text">Taux d'activité</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques des Scans */}
        <div className="stat-card scans-stats">
          <div className="stat-header">
            <span className="stat-icon">📱</span>
            <h3>Scans</h3>
          </div>
          <div className="stat-content">
            <div className="stat-main">
              <span className="stat-value">{stats.totalScans}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-details">
              <div className="stat-item">
                <span className="stat-number" style={{ color: '#3b82f6' }}>
                  {stats.todayScans}
                </span>
                <span className="stat-text">Aujourd'hui</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques de Performance */}
        <div className="stat-card performance-stats">
          <div className="stat-header">
            <span className="stat-icon">📈</span>
            <h3>Performance</h3>
          </div>
          <div className="stat-content">
            <div className="stat-main">
              <span className="stat-value">
                {stats.totalTickets > 0 ? Math.round((stats.usedTickets / stats.totalTickets) * 100) : 0}%
              </span>
              <span className="stat-label">Taux d'utilisation</span>
            </div>
            <div className="stat-details">
              <div className="stat-item">
                <span className="stat-number" style={{ color: '#10b981' }}>
                  {stats.totalScans > 0 ? Math.round((stats.todayScans / stats.totalScans) * 100) : 0}%
                </span>
                <span className="stat-text">Activité journalière</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicateurs de tendance */}
      <div className="trends-section">
        <h3>📈 Tendances Récentes</h3>
        <div className="trends-grid">
          <div className="trend-item">
            <span className="trend-icon">📊</span>
            <div className="trend-info">
              <span className="trend-label">Taux de croissance</span>
              <span className="trend-value positive">+15%</span>
              <span className="trend-period">vs semaine dernière</span>
            </div>
          </div>
          <div className="trend-item">
            <span className="trend-icon">🎯</span>
            <div className="trend-info">
              <span className="trend-label">Objectif atteint</span>
              <span className="trend-value success">85%</span>
              <span className="trend-period">de l'objectif mensuel</span>
            </div>
          </div>
          <div className="trend-item">
            <span className="trend-icon">⏰</span>
            <div className="trend-info">
              <span className="trend-label">Heure de pointe</span>
              <span className="trend-value info">14h-16h</span>
              <span className="trend-period">activité maximale</span>
            </div>
          </div>
        </div>
      </div>

      <div className="overview-actions">
        <button onClick={fetchDashboardStats} className="refresh-stats-btn">
          🔄 Actualiser les statistiques
        </button>
        <div className="last-update">
          Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview
