import React from 'react'
import { useNavigate } from 'react-router-dom'
import './AuthNotification.css'

const AuthNotification = () => {
  const navigate = useNavigate()

  const handleLogin = () => {
    navigate('/')
  }

  return (
    <div className="auth-notification">
      <div className="auth-notification-content">
        <div className="auth-icon">🔐</div>
        <h2>Authentification Requise</h2>
        <p>
          Vous devez vous connecter pour accéder au tableau de bord et voir les données de votre application e-Bracelet.
        </p>
        <div className="auth-actions">
          <button onClick={handleLogin} className="login-btn">
            🔑 Se Connecter
          </button>
        </div>
        <div className="auth-info">
          <p><strong>Identifiants de test :</strong></p>
          <p>Email: <code>admin@anosiravo.mg</code></p>
          <p>Mot de passe: <code>admin123</code></p>
        </div>
      </div>
    </div>
  )
}

export default AuthNotification




