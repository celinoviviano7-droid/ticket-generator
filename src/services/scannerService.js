import api, { handleApiError, createApiResponse } from './api'

class ScannerService {
  // Démarrer le scanner
  async startScanner(scannerConfig) {
    try {
      const response = await api.post('/scanner/start', scannerConfig)
      return createApiResponse(response, 'Scanner démarré avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Arrêter le scanner
  async stopScanner() {
    try {
      const response = await api.post('/scanner/stop')
      return createApiResponse(response, 'Scanner arrêté avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Obtenir le statut du scanner
  async getScannerStatus() {
    try {
      const response = await api.get('/scanner/status')
      return createApiResponse(response, 'Statut récupéré avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Effectuer un scan
  async performScan(scanData) {
    try {
      const response = await api.post('/scanner/scan', scanData)
      return createApiResponse(response, 'Scan effectué avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Valider un bracelet
  async validateBracelet(braceletId, validationData) {
    try {
      const response = await api.post(`/scanner/bracelets/${braceletId}/validate`, validationData)
      return createApiResponse(response, 'Bracelet validé avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Récupérer l'historique des scans
  async getScanHistory(filters = {}) {
    try {
      const response = await api.get('/scanner/history', { params: filters })
      return createApiResponse(response, 'Historique récupéré avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Récupérer les statistiques de scan
  async getScanStats(filters = {}) {
    try {
      const response = await api.get('/scanner/stats', { params: filters })
      return createApiResponse(response, 'Statistiques récupérées avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Configurer le scanner
  async configureScanner(config) {
    try {
      const response = await api.put('/scanner/config', config)
      return createApiResponse(response, 'Configuration mise à jour avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Obtenir la configuration du scanner
  async getScannerConfig() {
    try {
      const response = await api.get('/scanner/config')
      return createApiResponse(response, 'Configuration récupérée avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Tester la connexion du scanner
  async testScannerConnection() {
    try {
      const response = await api.get('/scanner/test')
      return createApiResponse(response, 'Test de connexion réussi')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Récupérer les alertes du scanner
  async getScannerAlerts() {
    try {
      const response = await api.get('/scanner/alerts')
      return createApiResponse(response, 'Alertes récupérées avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Marquer une alerte comme résolue
  async resolveAlert(alertId) {
    try {
      const response = await api.put(`/scanner/alerts/${alertId}/resolve`)
      return createApiResponse(response, 'Alerte marquée comme résolue')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Exporter l'historique des scans
  async exportScanHistory(format = 'csv', filters = {}) {
    try {
      const response = await api.get('/scanner/export', { 
        params: { format, ...filters },
        responseType: 'blob'
      })
      return createApiResponse(response, 'Export effectué avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }
}

export default new ScannerService()



