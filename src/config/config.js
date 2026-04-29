// Configuration de l'application e-Bracelet Anosiravo
export const config = {
  // Configuration de l'API
  api: {
    baseURL: 'http://localhost:5000',
    endpoints: {
      auth: {
        login: '/api/auth/login',
        logout: '/api/auth/logout',
        register: '/api/auth/register'
      },
      tickets: '/api/tickets/',
      scanner: {
        history: '/api/scanner/history',
        scan: '/api/scanner/scan'
      }
    },
    timeout: 10000, // 10 secondes
    headers: {
      'Content-Type': 'application/json'
    }
  },

  // Configuration de l'authentification
  auth: {
    tokenKey: 'authToken',
    userKey: 'user',
    isAuthenticatedKey: 'isAuthenticated',
    tokenExpiry: 24 * 60 * 60 * 1000 // 24 heures en millisecondes
  },

  // Configuration des circuits
  circuits: {
    1: { name: 'Circuit Classique', duration: '2h', price: '25€', color: '#3b82f6' },
    2: { name: 'Circuit Premium', duration: '4h', price: '45€', color: '#8b5cf6' },
    3: { name: 'Circuit VIP', duration: '6h', price: '75€', color: '#f59e0b' }
  },

  // Configuration des pays
  countries: {
    'MG': { name: 'Madagascar', flag: '🇲🇬', color: '#10b981' },
    'FR': { name: 'France', flag: '🇫🇷', color: '#3b82f6' },
    'US': { name: 'États-Unis', flag: '🇺🇸', color: '#8b5cf6' },
    'CA': { name: 'Canada', flag: '🇨🇦', color: '#f59e0b' },
    'GB': { name: 'Royaume-Uni', flag: '🇬🇧', color: '#ef4444' }
  },

  // Configuration des statuts
  statuses: {
    'active': { label: 'Actif', color: '#10b981', bgColor: '#dcfce7' },
    'used': { label: 'Utilisé', color: '#3b82f6', bgColor: '#dbeafe' },
    'expired': { label: 'Expiré', color: '#f59e0b', bgColor: '#fef3c7' },
    'cancelled': { label: 'Annulé', color: '#ef4444', bgColor: '#fee2e2' }
  },

  // Configuration des types de scan
  scanTypes: {
    'camera': { label: 'Caméra', icon: '📷', color: '#10b981' },
    'manual': { label: 'Manuel', icon: '✋', color: '#3b82f6' },
    'barcode': { label: 'Code-barres', icon: '📱', color: '#8b5cf6' }
  },

  // Configuration de l'interface
  ui: {
    theme: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s ease'
  },

  // Configuration des messages
  messages: {
    errors: {
      auth: {
        noToken: 'Token d\'authentification manquant',
        invalidToken: 'Token d\'authentification invalide',
        expiredToken: 'Token d\'authentification expiré',
        loginRequired: 'Veuillez vous connecter pour accéder à cette fonctionnalité'
      },
      api: {
        networkError: 'Erreur de connexion au serveur',
        serverError: 'Erreur du serveur',
        notFound: 'Ressource non trouvée',
        unauthorized: 'Accès non autorisé'
      }
    },
    success: {
      login: 'Connexion réussie',
      logout: 'Déconnexion réussie',
      ticketCreated: 'Ticket créé avec succès',
      dataUpdated: 'Données mises à jour avec succès'
    }
  }
}

// Fonctions utilitaires
export const utils = {
  // Vérifier si un token est valide
  isTokenValid: (token) => {
    if (!token) return false
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const now = Date.now() / 1000
      return payload.exp > now
    } catch {
      return false
    }
  },

  // Formater une date
  formatDate: (dateString, options = {}) => {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    return new Date(dateString).toLocaleDateString('fr-FR', { ...defaultOptions, ...options })
  },

  // Générer un ID unique
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  },

  // Valider un email
  validateEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  },

  // Capitaliser la première lettre
  capitalize: (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }
}

export default config




