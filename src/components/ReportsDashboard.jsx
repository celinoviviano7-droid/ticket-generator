import React, { useState, useEffect } from 'react'
import { config } from '../config/config'
import './ReportsDashboard.css'

const ReportsDashboard = () => {
  const [reports, setReports] = useState({
    tickets: [],
    scans: [],
    visitors: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [selectedReport, setSelectedReport] = useState('overview')

  useEffect(() => {
    fetchReportsData()
  }, [selectedPeriod])

  const fetchReportsData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem(config.auth.tokenKey)
      
      if (!token) {
        setError('Veuillez vous connecter pour voir les rapports')
        setLoading(false)
        return
      }

      // Récupérer les données des tickets
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
          
          // Récupérer les données des scans
          const scansResponse = await fetch(`${config.api.baseURL}${config.api.endpoints.scanner.history}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              ...config.api.headers
            }
          })

          let scans = []
          if (scansResponse.ok) {
            const scansData = await scansResponse.json()
            if (scansData.success) {
              scans = scansData.data.scans || []
            }
          }

          setReports({ tickets, scans, visitors: [] })
        }
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des données pour les rapports:', err)
      setError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  // Calculer les statistiques par période
  const getStatsByPeriod = () => {
    const now = new Date()
    let startDate = new Date()
    
    switch (selectedPeriod) {
      case 'today':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    const filteredTickets = reports.tickets.filter(ticket => {
      const ticketDate = new Date(ticket.issued_at)
      return ticketDate >= startDate
    })

    const filteredScans = reports.scans.filter(scan => {
      const scanDate = new Date(scan.timestamp || scan.scan_time)
      return scanDate >= startDate
    })

    return {
      tickets: filteredTickets,
      scans: filteredScans,
      totalRevenue: calculateRevenue(filteredTickets),
      averageTicketsPerDay: calculateAveragePerDay(filteredTickets, startDate, now),
      averageScansPerDay: calculateAveragePerDay(filteredScans, startDate, now)
    }
  }

  const calculateRevenue = (tickets) => {
    const circuitPrices = {
      '1': 25, // Circuit Classique
      '2': 45, // Circuit Premium
      '3': 75  // Circuit VIP
    }
    
    return tickets.reduce((total, ticket) => {
      const circuitId = ticket.visitor?.circuit
      return total + (circuitPrices[circuitId] || 0)
    }, 0)
  }

  const calculateAveragePerDay = (items, startDate, endDate) => {
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
    return daysDiff > 0 ? (items.length / daysDiff).toFixed(1) : 0
  }

  const getCircuitDistribution = () => {
    const distribution = { '1': 0, '2': 0, '3': 0 }
    const total = reports.tickets.length
    
    reports.tickets.forEach(ticket => {
      const circuit = ticket.visitor?.circuit
      if (circuit && distribution.hasOwnProperty(circuit)) {
        distribution[circuit]++
      }
    })

    return Object.entries(distribution).map(([circuit, count]) => ({
      circuit: getCircuitName(circuit),
      count,
      percentage: total > 0 ? ((count / total) * 100).toFixed(1) : 0
    }))
  }

  const getCircuitName = (circuitId) => {
    const circuits = {
      '1': 'Circuit Classique',
      '2': 'Circuit Premium',
      '3': 'Circuit VIP'
    }
    return circuits[circuitId] || 'Circuit inconnu'
  }

  const getStatusDistribution = () => {
    const distribution = {}
    reports.tickets.forEach(ticket => {
      distribution[ticket.status] = (distribution[ticket.status] || 0) + 1
    })
    return distribution
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Date invalide'
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      return 'Erreur de date'
    }
  }

  const exportReport = () => {
    const stats = getStatsByPeriod()
    const reportData = {
      période: selectedPeriod,
      date_génération: new Date().toLocaleString('fr-FR'),
      statistiques: stats,
      répartition_circuits: getCircuitDistribution(),
      répartition_statuts: getStatusDistribution()
    }
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rapport_anosiravo_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="reports-loading">
        <div className="loading-spinner"></div>
        <p>Chargement des rapports...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="reports-error">
        <div className="error-icon">⚠️</div>
        <h3>Erreur lors du chargement</h3>
        <p>{error}</p>
        <button onClick={fetchReportsData} className="retry-button">
          Réessayer
        </button>
      </div>
    )
  }

  const stats = getStatsByPeriod()
  const circuitDistribution = getCircuitDistribution()
  const statusDistribution = getStatusDistribution()

  return (
    <div className="reports-dashboard">
      <div className="reports-header">
        <h2 className="reports-title">Rapports et Statistiques</h2>
        <div className="reports-controls">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="period-selector"
          >
            <option value="today">Aujourd'hui</option>
            <option value="week">7 derniers jours</option>
            <option value="month">30 derniers jours</option>
            <option value="year">12 derniers mois</option>
          </select>
          
          <button onClick={exportReport} className="export-button">
            📊 Exporter le rapport
          </button>
        </div>
      </div>

      <div className="reports-grid">
        {/* Statistiques générales */}
        <div className="report-card stats-overview">
          <h3 className="card-title">📈 Vue d'ensemble</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{stats.tickets.length}</span>
              <span className="stat-label">Tickets émis</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.scans.length}</span>
              <span className="stat-label">Scans effectués</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{formatCurrency(stats.totalRevenue)}</span>
              <span className="stat-label">Revenus générés</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.averageTicketsPerDay}</span>
              <span className="stat-label">Tickets/jour (moy.)</span>
            </div>
          </div>
        </div>

        {/* Répartition des circuits */}
        <div className="report-card circuit-distribution">
          <h3 className="card-title">🎫 Répartition des Circuits</h3>
          <div className="distribution-list">
            {circuitDistribution.map((item, index) => (
              <div key={index} className="distribution-item">
                <div className="distribution-header">
                  <span className="circuit-name">{item.circuit}</span>
                  <span className="circuit-count">{item.count}</span>
                </div>
                <div className="distribution-bar">
                  <div 
                    className="distribution-fill" 
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <span className="circuit-percentage">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition des statuts */}
        <div className="report-card status-distribution">
          <h3 className="card-title">🔄 Répartition des Statuts</h3>
          <div className="status-list">
            {Object.entries(statusDistribution).map(([status, count]) => (
              <div key={status} className="status-item">
                <span className="status-name">{getStatusLabel(status)}</span>
                <span className="status-count">{count}</span>
                <span className="status-percentage">
                  {((count / stats.tickets.length) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activité temporelle */}
        <div className="report-card temporal-activity">
          <h3 className="card-title">⏰ Activité Temporelle</h3>
          <div className="activity-stats">
            <div className="activity-item">
              <span className="activity-label">Période analysée</span>
              <span className="activity-value">
                {selectedPeriod === 'today' ? 'Aujourd\'hui' :
                 selectedPeriod === 'week' ? '7 derniers jours' :
                 selectedPeriod === 'month' ? '30 derniers jours' : '12 derniers mois'}
              </span>
            </div>
            <div className="activity-item">
              <span className="activity-label">Tickets par jour</span>
              <span className="activity-value">{stats.averageTicketsPerDay}</span>
            </div>
            <div className="activity-item">
              <span className="activity-label">Scans par jour</span>
              <span className="activity-value">{stats.averageScansPerDay}</span>
            </div>
            <div className="activity-item">
              <span className="activity-label">Revenus par jour</span>
              <span className="activity-value">
                {formatCurrency(stats.totalRevenue / Math.max(1, (stats.tickets.length / Math.max(1, parseFloat(stats.averageTicketsPerDay)))))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau détaillé des tickets */}
      <div className="report-card detailed-tickets">
        <h3 className="card-title">📋 Détail des Tickets</h3>
        <div className="tickets-table-container">
          <table className="tickets-table">
            <thead>
              <tr>
                <th>Code-Barres</th>
                <th>Visiteur</th>
                <th>Circuit</th>
                <th>Statut</th>
                <th>Date d'émission</th>
                <th>Revenu</th>
              </tr>
            </thead>
            <tbody>
              {stats.tickets.slice(0, 10).map((ticket) => (
                <tr key={ticket.uuid}>
                  <td>{ticket.barcode}</td>
                  <td>
                    {ticket.visitor?.first_name} {ticket.visitor?.last_name}
                  </td>
                  <td>{getCircuitName(ticket.visitor?.circuit)}</td>
                  <td>
                    <span className={`status-badge status-${ticket.status}`}>
                      {getStatusLabel(ticket.status)}
                    </span>
                  </td>
                  <td>{formatDate(ticket.issued_at)}</td>
                  <td>
                    {formatCurrency(
                      (() => {
                        const circuitPrices = { '1': 25, '2': 45, '3': 75 }
                        return circuitPrices[ticket.visitor?.circuit] || 0
                      })()
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {stats.tickets.length > 10 && (
            <div className="table-footer">
              <p>Afficher les {stats.tickets.length - 10} autres tickets...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const getStatusLabel = (status) => {
  const statusLabels = {
    'active': 'Actif',
    'used': 'Utilisé',
    'expired': 'Expiré',
    'cancelled': 'Annulé'
  }
  return statusLabels[status] || status
}

export default ReportsDashboard
