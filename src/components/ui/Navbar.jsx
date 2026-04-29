import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './Navbar.css'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const handleLogout = () => {
    logout()
    closeMenu()
    // Rediriger vers la page d'accueil avec l'état de déconnexion
    window.location.href = '/?logout=true'
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo et titre */}
        <div className="navbar-brand">
          <Link to="/" className="navbar-logo" onClick={closeMenu}>
            <span className="logo-icon">🎫</span>
            <span className="logo-text">e-Bracelet Anosiravo</span>
          </Link>
        </div>

        {/* Bouton hamburger pour mobile */}
        <button 
          className={`navbar-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        {/* Menu de navigation */}
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
                     <ul className="navbar-nav">
             {/* Liens affichés seulement si connecté */}
             {isAuthenticated && (
               <>
                 <li className="navbar-item">
                   <Link 
                     to="/kiosque" 
                     className={`navbar-link ${isActive('/kiosque') ? 'active' : ''}`}
                     onClick={closeMenu}
                   >
                     <span className="nav-icon">🏠</span>
                     <span className="nav-text">Kiosque</span>
                   </Link>
                 </li>
                 
                 <li className="navbar-item">
                   <Link 
                     to="/dashboard" 
                     className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
                     onClick={closeMenu}
                   >
                     <span className="nav-icon">📊</span>
                     <span className="nav-text">Tableau de Bord</span>
                   </Link>
                 </li>
                 
                 <li className="navbar-item">
                   <Link 
                     to="/scanner" 
                     className={`navbar-link ${isActive('/scanner') ? 'active' : ''}`}
                     onClick={closeMenu}
                   >
                     <span className="nav-icon">📱</span>
                     <span className="nav-text">Scanner</span>
                   </Link>
                 </li>
                 
                 <li className="navbar-item">
                   <Link 
                     to="/chat" 
                     className={`navbar-link ${isActive('/chat') ? 'active' : ''}`}
                     onClick={closeMenu}
                   >
                     <span className="nav-icon">💬</span>
                     <span className="nav-text">Chat</span>
                   </Link>
                 </li>
               </>
             )}
            
            {/* Affichage des informations utilisateur et bouton de déconnexion */}
            {isAuthenticated && user ? (
              <>
                <li className="navbar-item user-info">
                  <div className="user-avatar">
                    <span>{user.avatar}</span>
                  </div>
                  <span className="user-name">{user.name}</span>
                </li>
                <li className="navbar-item">
                  <button 
                    className="navbar-link logout-btn"
                    onClick={handleLogout}
                  >
                    <span className="nav-icon">🚪</span>
                    <span className="nav-text">Déconnexion</span>
                  </button>
                </li>
              </>
                         ) : (
               <li className="navbar-item">
                 <Link 
                   to="/" 
                   className="navbar-link login-btn"
                   onClick={closeMenu}
                 >
                   <span className="nav-icon">🔑</span>
                   <span className="nav-text">Connexion</span>
                 </Link>
               </li>
             )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
