import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Afficher un loader pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Vérification de l'authentification...</p>
      </div>
    )
  }

  // Si l'authentification est requise et que l'utilisateur n'est pas connecté
  if (requireAuth && !isAuthenticated) {
    // Rediriger vers la page d'accueil (page de connexion) en sauvegardant la page demandée
    return <Navigate to="/" state={{ from: location }} replace />
  }

  // Si l'utilisateur est connecté et essaie d'accéder à la page de connexion
  if (!requireAuth && isAuthenticated) {
    // Rediriger vers le kiosque (page principale après connexion)
    return <Navigate to="/kiosque" replace />
  }

  // Afficher le contenu protégé
  return children
}

export default ProtectedRoute
