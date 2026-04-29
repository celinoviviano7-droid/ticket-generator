import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import DashboardOverview from '../components/DashboardOverview'
import DashboardCharts from '../components/DashboardCharts'
import TicketsList from '../components/TicketsList'
import VisitorsList from '../components/VisitorsList'
import ScansList from '../components/ScansList'
import ReportsDashboard from '../components/ReportsDashboard'
import './DashboardPage.css'

const DashboardPage = () => {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('overview')

  const navigationItems = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: 'overview' },
    { id: 'charts', label: 'Graphiques', icon: 'charts' },
    { id: 'visitors', label: 'Visiteurs', icon: 'visitors' },
    { id: 'tickets', label: 'Tickets', icon: 'tickets' },
    { id: 'scans', label: 'Scans', icon: 'scans' },
    { id: 'reports', label: 'Rapports', icon: 'reports' },
    { id: 'settings', label: 'Paramètres', icon: 'settings' }
  ]

  const getIcon = (iconName) => {
    const icons = {
      overview: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="9" x2="15" y2="9"></line>
          <line x1="9" y1="12" x2="15" y2="12"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
      ),
      visitors: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      tickets: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
        </svg>
      ),
      charts: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18"></path>
          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
        </svg>
      ),
      scans: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9h6l1-6 1 6h6"></path>
          <path d="M3 15h6l1 6 1-6h6"></path>
        </svg>
      ),
      reports: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14,2 14,8 20,8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10,9 9,9 8,9"></polyline>
        </svg>
      ),
      settings: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      )
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />
      case 'charts':
        return <DashboardCharts />
      case 'visitors':
        return <VisitorsList />
      case 'tickets':
        return <TicketsList />
      case 'scans':
        return <ScansList />
      case 'reports':
        return <ReportsDashboard />
      case 'settings':
        return <div className="tab-content">Paramètres de l'application</div>
      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero">
        <div className="container">
          <h1 className="page-title">Tableau de Bord</h1>
          <p className="page-subtitle">Gestion de l'application e-Bracelet Anosiravo</p>
        </div>
      </div>

      <div className="dashboard-container">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <ul className="nav-list">
              {navigationItems.map((item) => (
                <li key={item.id} className="nav-item">
                  <button
                    className={`nav-button ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <span className="nav-icon">{getIcon(item.icon)}</span>
                    <span className="nav-label">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="sidebar-footer">
            <Link to="/" className="sidebar-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9,22 9,12 15,12 15,22"></polyline>
              </svg>
              Retour au Kiosque
            </Link>
          </div>
        </aside>

        <main className="dashboard-main">
          <div className="main-content">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardPage
