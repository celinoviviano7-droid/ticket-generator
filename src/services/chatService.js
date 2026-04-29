import api, { handleApiError, createApiResponse } from './api'

class ChatService {
  // Démarrer une session de chat
  async startChatSession(visitorInfo) {
    try {
      const response = await api.post('/chat/sessions', visitorInfo)
      return createApiResponse(response, 'Session de chat démarrée avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Envoyer un message
  async sendMessage(sessionId, message) {
    try {
      const response = await api.post(`/chat/sessions/${sessionId}/messages`, message)
      return createApiResponse(response, 'Message envoyé avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Récupérer l'historique des messages d'une session
  async getChatHistory(sessionId, params = {}) {
    try {
      const response = await api.get(`/chat/sessions/${sessionId}/messages`, { params })
      return createApiResponse(response, 'Historique récupéré avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Récupérer toutes les sessions de chat
  async getAllChatSessions(filters = {}) {
    try {
      const response = await api.get('/chat/sessions', { params: filters })
      return createApiResponse(response, 'Sessions récupérées avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Fermer une session de chat
  async closeChatSession(sessionId, reason = '') {
    try {
      const response = await api.put(`/chat/sessions/${sessionId}/close`, { reason })
      return createApiResponse(response, 'Session fermée avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Transférer une session à un autre agent
  async transferChatSession(sessionId, agentId, reason = '') {
    try {
      const response = await api.put(`/chat/sessions/${sessionId}/transfer`, { 
        agentId, 
        reason 
      })
      return createApiResponse(response, 'Session transférée avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Ajouter une note à une session
  async addChatNote(sessionId, note) {
    try {
      const response = await api.post(`/chat/sessions/${sessionId}/notes`, note)
      return createApiResponse(response, 'Note ajoutée avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Récupérer les notes d'une session
  async getChatNotes(sessionId) {
    try {
      const response = await api.get(`/chat/sessions/${sessionId}/notes`)
      return createApiResponse(response, 'Notes récupérées avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Marquer un message comme lu
  async markMessageAsRead(sessionId, messageId) {
    try {
      const response = await api.put(`/chat/sessions/${sessionId}/messages/${messageId}/read`)
      return createApiResponse(response, 'Message marqué comme lu')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Récupérer les statistiques du chat
  async getChatStats(filters = {}) {
    try {
      const response = await api.get('/chat/stats', { params: filters })
      return createApiResponse(response, 'Statistiques récupérées avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Récupérer les questions fréquentes
  async getFrequentlyAskedQuestions() {
    try {
      const response = await api.get('/chat/faq')
      return createApiResponse(response, 'FAQ récupérée avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Rechercher dans l'historique des chats
  async searchChatHistory(searchParams) {
    try {
      const response = await api.get('/chat/search', { params: searchParams })
      return createApiResponse(response, 'Recherche effectuée avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Exporter l'historique des chats
  async exportChatHistory(format = 'csv', filters = {}) {
    try {
      const response = await api.get('/chat/export', { 
        params: { format, ...filters },
        responseType: 'blob'
      })
      return createApiResponse(response, 'Export effectué avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Obtenir le statut de l'agent
  async getAgentStatus() {
    try {
      const response = await api.get('/chat/agent/status')
      return createApiResponse(response, 'Statut récupéré avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Mettre à jour le statut de l'agent
  async updateAgentStatus(status) {
    try {
      const response = await api.put('/chat/agent/status', { status })
      return createApiResponse(response, 'Statut mis à jour avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }
}

export default new ChatService()



