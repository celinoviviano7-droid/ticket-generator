import React, { useState } from 'react'
import Button from '../components/ui/Button'
import './ChatPage.css'

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
      sender: 'support',
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [newMessage, setNewMessage] = useState('')

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        text: newMessage,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      }
      setMessages([...messages, message])
      setNewMessage('')
      
      // Simuler une réponse automatique
      setTimeout(() => {
        const autoReply = {
          id: Date.now() + 1,
          text: "Merci pour votre message. Un membre de notre équipe vous répondra bientôt.",
          sender: 'support',
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        }
        setMessages(prev => [...prev, autoReply])
      }, 1000)
    }
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-header">
          <h1>💬 Support Client</h1>
          <p>Besoin d'aide ? Contactez notre équipe de support</p>
        </div>

        <div className="chat-messages">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${message.sender === 'user' ? 'user-message' : 'support-message'}`}
            >
              <div className="message-content">
                <p>{message.text}</p>
                <span className="message-time">{message.timestamp}</span>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="chat-input-form">
          <div className="chat-input-container">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Tapez votre message..."
              className="chat-input"
            />
            <Button type="submit" variant="primary" size="medium" className="send-button">
              Envoyer
            </Button>
          </div>
        </form>

        <div className="chat-info">
          <div className="info-card">
            <h3>📞 Contact Direct</h3>
            <p><strong>Téléphone:</strong> +261 34 12 345 67</p>
            <p><strong>Email:</strong> support@anosiravo.mg</p>
            <p><strong>Horaires:</strong> 8h - 18h (GMT+3)</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatPage
