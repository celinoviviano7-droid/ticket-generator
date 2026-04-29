import React, { useState, useEffect } from 'react'
import { config } from '../config/config'
import './DashboardCharts.css'

const DashboardCharts = () => {
  const [chartData, setChartData] = useState({
    tickets: [],
    scans: [],
    visitors: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchChartData()
  }, [])

  const fetchChartData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem(config.auth.tokenKey)
      
      if (!token) {
        setError('Veuillez vous connecter pour voir les graphiques')
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

          setChartData({ tickets, scans, visitors: [] })
        }
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des données pour les graphiques:', err)
      setError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  // Préparer les données pour le graphique des tickets par jour
  const getTicketsByDayData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()

    const ticketsByDay = last7Days.map(date => {
      const count = chartData.tickets.filter(ticket => 
        ticket.issued_at?.startsWith(date) || ticket.created_at?.startsWith(date)
      ).length
      return count
    })

    return {
      labels: last7Days.map(date => new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })),
      data: ticketsByDay
    }
  }

  // Préparer les données pour le graphique des scans par heure
  const getScansByHourData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)
    
    const scansByHour = hours.map(hour => {
      const count = chartData.scans.filter(scan => {
        const scanTime = new Date(scan.timestamp || scan.scan_time)
        const scanHour = scanTime.getHours()
        return scanHour === parseInt(hour.split(':')[0])
      }).length
      return count
    })

    return {
      labels: hours,
      data: scansByHour
    }
  }

  // Préparer les données pour le graphique des circuits
  const getCircuitsData = () => {
    const circuitStats = chartData.tickets.reduce((acc, ticket) => {
      const circuitId = ticket.visitor?.circuit || '1'
      const circuitName = config.circuits[circuitId]?.name || 'Circuit inconnu'
      
      if (!acc[circuitName]) {
        acc[circuitName] = 0
      }
      acc[circuitName]++
      return acc
    }, {})

    return Object.entries(circuitStats).map(([name, count]) => ({
      name,
      count,
      percentage: chartData.tickets.length > 0 ? Math.round((count / chartData.tickets.length) * 100) : 0
    }))
  }

  // Préparer les données pour le graphique des pays
  const getCountriesData = () => {
    const countryStats = chartData.tickets.reduce((acc, ticket) => {
      const country = ticket.visitor?.country || 'MG'
      const countryName = config.countries[country]?.name || 'Autre'
      
      if (!acc[countryName]) {
        acc[countryName] = 0
      }
      acc[countryName]++
      return acc
    }, {})

    return Object.entries(countryStats).map(([name, count]) => ({
      name,
      count,
      percentage: chartData.tickets.length > 0 ? Math.round((count / chartData.tickets.length) * 100) : 0
    }))
  }

  if (loading) {
    return (
      <div className="dashboard-charts loading">
        <div className="loading-spinner"></div>
        <p>Chargement des graphiques...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-charts error">
        <div className="error-icon">⚠️</div>
        <h3>Erreur de chargement</h3>
        <p>{error}</p>
        <button onClick={fetchChartData} className="retry-button">
          🔄 Réessayer
        </button>
      </div>
    )
  }

  const ticketsData = getTicketsByDayData()
  const scansData = getScansByHourData()
  const circuitsData = getCircuitsData()
  const countriesData = getCountriesData()

  return (
    <div className="dashboard-charts">
      <div className="charts-header">
        <h2>📈 Graphiques et Tendances</h2>
        <p>Visualisation des données de votre application e-Bracelet</p>
      </div>

      <div className="charts-grid">
        {/* Graphique des tickets par jour */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>🎫 Évolution des Tickets (7 derniers jours)</h3>
            <p>Nombre de tickets créés par jour</p>
          </div>
          <div className="chart-container">
            <div className="css-chart">
              <div className="chart-bars">
                {ticketsData.data.map((value, index) => (
                  <div key={index} className="chart-bar">
                    <div 
                      className="bar-fill" 
                      style={{ 
                        height: `${Math.max(value * 20, 10)}px`,
                        backgroundColor: value > 0 ? '#10b981' : '#e5e7eb'
                      }}
                    ></div>
                    <span className="bar-label">{ticketsData.labels[index]}</span>
                    <span className="bar-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Graphique des scans par heure */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>📱 Activité des Scans (24h)</h3>
            <p>Répartition des scans par heure</p>
          </div>
          <div className="chart-container">
            <div className="css-chart">
              <div className="chart-bars horizontal">
                {scansData.data.map((value, index) => (
                  <div key={index} className="chart-bar horizontal">
                    <span className="bar-label">{scansData.labels[index]}</span>
                    <div className="bar-container">
                      <div 
                        className="bar-fill horizontal" 
                        style={{ 
                          width: `${Math.max(value * 10, 5)}px`,
                          backgroundColor: value > 0 ? '#3b82f6' : '#e5e7eb'
                        }}
                      ></div>
                      <span className="bar-value">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Graphique des circuits */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>🗺️ Répartition par Circuit</h3>
            <p>Nombre de visiteurs par circuit</p>
          </div>
          <div className="chart-container">
            <div className="css-chart">
              <div className="chart-donut">
                {circuitsData.map((item, index) => (
                  <div key={index} className="donut-segment">
                    <div className="donut-label">
                      <span className="segment-name">{item.name}</span>
                      <span className="segment-count">{item.count}</span>
                      <span className="segment-percentage">({item.percentage}%)</span>
                    </div>
                    <div 
                      className="segment-bar" 
                      style={{ 
                        width: `${item.percentage}%`,
                        backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'][index % 5]
                      }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Graphique des pays */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>🌍 Répartition par Pays</h3>
            <p>Origine géographique des visiteurs</p>
          </div>
          <div className="chart-container">
            <div className="css-chart">
              <div className="chart-donut">
                {countriesData.map((item, index) => (
                  <div key={index} className="donut-segment">
                    <div className="donut-label">
                      <span className="segment-name">{item.name}</span>
                      <span className="segment-count">{item.count}</span>
                      <span className="segment-percentage">({item.percentage}%)</span>
                    </div>
                    <div 
                      className="segment-bar" 
                      style={{ 
                        width: `${item.percentage}%`,
                        backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'][index % 5]
                      }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="charts-actions">
        <button onClick={fetchChartData} className="refresh-charts-btn">
          🔄 Actualiser les graphiques
        </button>
        <div className="last-update">
          Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}
        </div>
      </div>
    </div>
  )
}

export default DashboardCharts
