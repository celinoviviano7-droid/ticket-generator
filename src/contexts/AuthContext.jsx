import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Vérifier l'authentification au chargement de l'application
    checkAuthStatus()
  }, [])

  const checkAuthStatus = () => {
    try {
      const storedUser = localStorage.getItem('user')
      const storedAuth = localStorage.getItem('isAuthenticated')

      if (storedUser && storedAuth === 'true') {
        setUser(JSON.parse(storedUser))
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const login = (userData) => {
    try {
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('isAuthenticated', 'true')
      setUser(userData)
      setIsAuthenticated(true)
      return true
    } catch (error) {
      console.error('Erreur lors de la connexion:', error)
      return false
    }
  }

  const logout = () => {
    try {
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('authToken') // Supprimer aussi le token JWT
      setUser(null)
      setIsAuthenticated(false)
      return true
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      return false
    }
  }

  const updateUser = (userData) => {
    try {
      const updatedUser = { ...user, ...userData }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      return true
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error)
      return false
    }
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
    checkAuthStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}


