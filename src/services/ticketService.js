import api, { handleApiError, createApiResponse } from './api'

class TicketService {
  // Créer un nouveau ticket
  async createTicket(visitorData) {
    try {
      const response = await api.post('/tickets', visitorData)
      return createApiResponse(response, 'Ticket créé avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Récupérer tous les tickets
  async getAllTickets(params = {}) {
    try {
      const response = await api.get('/tickets', { params })
      return createApiResponse(response, 'Tickets récupérés avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Récupérer un ticket par ID
  async getTicketById(ticketId) {
    try {
      const response = await api.get(`/tickets/${ticketId}`)
      return createApiResponse(response, 'Ticket récupéré avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Mettre à jour un ticket
  async updateTicket(ticketId, updateData) {
    try {
      const response = await api.put(`/tickets/${ticketId}`, updateData)
      return createApiResponse(response, 'Ticket mis à jour avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Supprimer un ticket
  async deleteTicket(ticketId) {
    try {
      await api.delete(`/tickets/${ticketId}`)
      return createApiResponse(null, 'Ticket supprimé avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Valider un ticket (scan)
  async validateTicket(ticketId, scanData) {
    try {
      const response = await api.post(`/tickets/${ticketId}/validate`, scanData)
      return createApiResponse(response, 'Ticket validé avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Récupérer l'historique des validations d'un ticket
  async getTicketValidationHistory(ticketId) {
    try {
      const response = await api.get(`/tickets/${ticketId}/validations`)
      return createApiResponse(response, 'Historique récupéré avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Rechercher des tickets
  async searchTickets(searchParams) {
    try {
      const response = await api.get('/tickets/search', { params: searchParams })
      return createApiResponse(response, 'Recherche effectuée avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Récupérer les statistiques des tickets
  async getTicketStats(filters = {}) {
    try {
      const response = await api.get('/tickets/stats', { params: filters })
      return createApiResponse(response, 'Statistiques récupérées avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Exporter les tickets
  async exportTickets(format = 'csv', filters = {}) {
    try {
      const response = await api.get('/tickets/export', { 
        params: { format, ...filters },
        responseType: 'blob'
      })
      return createApiResponse(response, 'Export effectué avec succès')
    } catch (error) {
      return handleApiError(error)
    }
  }
}

export default new TicketService()



