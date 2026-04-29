import axios from 'axios'

// Configuration de base d'axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur pour gérer les réponses et erreurs
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Une erreur est survenue'
    
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    })
  }
)

// Méthodes utilitaires
export const handleApiError = (error) => {
  console.error('API Error:', error)
  return {
    success: false,
    message: error.message || 'Une erreur est survenue',
    status: error.status
  }
}

export const createApiResponse = (data, message = 'Succès') => {
  return {
    success: true,
    data,
    message
  }
}

export default api



