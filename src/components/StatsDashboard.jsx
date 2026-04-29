import React from 'react'
import './StatsDashboard.css'

const StatsDashboard = ({ stats }) => {
  const defaultStats = {
    totalVisitors: 1247,
    todayVisitors: 89,
    activeTickets: 156,
    revenue: 45680
  }

  const data = stats || defaultStats

  const formatNumber = (num) => {
    return num.toLocaleString('fr-FR')
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  return (
    <div className="stats-dashboard">
      <h2 className="dashboard-title">Tableau de Bord</h2>
      
      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{formatNumber(data.totalVisitors)}</h3>
            <p className="stat-label">Total Visiteurs</p>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{formatNumber(data.todayVisitors)}</h3>
            <p className="stat-label">Visiteurs Aujourd'hui</p>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{formatNumber(data.activeTickets)}</h3>
            <p className="stat-label">Tickets Actifs</p>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{formatCurrency(data.revenue)}</h3>
            <p className="stat-label">Revenus Totaux</p>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h3 className="chart-title">Activité Récente</h3>
          <div className="chart-placeholder">
            <svg width="120" height="80" viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 60 L30 40 L50 50 L70 20 L90 30 L110 10" stroke="#667eea" strokeWidth="3" fill="none"/>
              <circle cx="10" cy="60" r="3" fill="#667eea"/>
              <circle cx="30" cy="40" r="3" fill="#667eea"/>
              <circle cx="50" cy="50" r="3" fill="#667eea"/>
              <circle cx="70" cy="20" r="3" fill="#667eea"/>
              <circle cx="90" cy="30" r="3" fill="#667eea"/>
              <circle cx="110" cy="10" r="3" fill="#667eea"/>
            </svg>
            <p>Graphique d'activité des visiteurs</p>
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Répartition des Circuits</h3>
          <div className="chart-placeholder">
            <div className="pie-chart">
              <div className="pie-slice slice-1"></div>
              <div className="pie-slice slice-2"></div>
              <div className="pie-slice slice-3"></div>
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-color color-1"></span>
                <span>Circuit Classique (45%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-color color-2"></span>
                <span>Circuit Premium (35%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-color color-3"></span>
                <span>Circuit VIP (20%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsDashboard



