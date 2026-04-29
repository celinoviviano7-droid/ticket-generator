import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/ui/Button'
import './LoginPage.css'

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

     // Redirection après connexion
   const from = location.state?.from?.pathname || '/kiosque'
  
  // Vérifier s'il y a un message de succès d'enregistrement ou de déconnexion
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
      // Effacer le message après 10 secondes
      setTimeout(() => setSuccessMessage(''), 10000)
    }
    
    // Vérifier si l'utilisateur vient de se déconnecter (via URL ou state)
    if (location.state?.logout || new URLSearchParams(window.location.search).get('logout') === 'true') {
      setSuccessMessage('Vous avez été déconnecté avec succès. Connectez-vous à nouveau.')
      setTimeout(() => setSuccessMessage(''), 5000)
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [location.state])

  const onSubmit = async (data) => {
    setIsLoading(true)
    setError('')

    try {
      // Appel à l'API de connexion
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password
        })
      })

      const result = await response.json()

      if (result.success) {
        // Connexion réussie
        const userData = {
          id: result.data.user.id,
          email: result.data.user.email,
          name: result.data.user.username || 'Administrateur',
          role: result.data.user.role,
          avatar: '👨‍💼'
        }

        // Stocker le token JWT dans le localStorage
        localStorage.setItem('authToken', result.data.token)
        
        // Utiliser le contexte d'authentification pour se connecter
        if (login(userData)) {
          // Rediriger vers la page demandée ou le tableau de bord
          navigate(from, { replace: true })
        } else {
          setError('Erreur lors de la connexion. Veuillez réessayer.')
        }
      } else {
        setError(result.message || 'Email ou mot de passe incorrect')
      }
    } catch (error) {
      console.error('Erreur de connexion:', error)
      setError('Erreur de connexion. Vérifiez que le serveur backend est démarré.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="logo-section">
            <span className="logo-icon">🎫</span>
            <h1>e-Bracelet Anosiravo</h1>
          </div>
                     <p className="login-subtitle">Bienvenue ! Connectez-vous pour accéder à l'application</p>
        </div>

        <div className="login-form-container">
          <form onSubmit={handleSubmit(onSubmit)} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                📧 Adresse Email
              </label>
              <input
                id="email"
                type="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="admin@anosiravo.mg"
                {...register('email', {
                  required: 'L\'email est requis',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Adresse email invalide'
                  }
                })}
              />
              {errors.email && (
                <span className="error-message">{errors.email.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                🔒 Mot de Passe
              </label>
              <input
                id="password"
                type="password"
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder="••••••••"
                {...register('password', {
                  required: 'Le mot de passe est requis',
                  minLength: {
                    value: 6,
                    message: 'Le mot de passe doit contenir au moins 6 caractères'
                  }
                })}
              />
              {errors.password && (
                <span className="error-message">{errors.password.message}</span>
              )}
            </div>

            {error && (
              <div className="error-alert">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            {successMessage && (
              <div className="success-alert">
                <span className="success-icon">✅</span>
                {successMessage}
              </div>
            )}

            <div className="form-actions">
              <Button
                type="submit"
                variant="primary"
                size="large"
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Connexion en cours...
                  </>
                ) : (
                  'Se Connecter'
                )}
              </Button>
            </div>
          </form>

          <div className="login-info">
            <div className="info-card">
              <h3>🔑 Identifiants de Test</h3>
              <p><strong>Email:</strong> admin@anosiravo.mg</p>
              <p><strong>Mot de passe:</strong> admin123</p>
              <p className="info-note">
                ⚠️ Ces identifiants sont uniquement pour les tests. 
                En production, utilisez vos vrais identifiants.
              </p>
            </div>
          </div>
        </div>

        <div className="login-footer">
          <p>© 2024 e-Bracelet Anosiravo. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
