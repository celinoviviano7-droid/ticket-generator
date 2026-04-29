import React, { useState } from 'react'
import './ScanGuide.css'

const ScanGuide = () => {
  const [isVisible, setIsVisible] = useState(true)
  const [currentTip, setCurrentTip] = useState(0)

  const tips = [
    {
      icon: '📱',
      title: 'Position de la Caméra',
      description: 'Maintenez votre appareil à 15-20 cm du code-barres',
      details: 'La distance optimale permet une meilleure détection'
    },
    {
      icon: '🎯',
      title: 'Stabilité',
      description: 'Gardez votre main stable pendant le scan',
      details: 'Évitez les mouvements brusques pour une détection précise'
    },
    {
      icon: '💡',
      title: 'Éclairage',
      description: 'Assurez un éclairage uniforme et suffisant',
      details: 'Évitez les ombres et les reflets sur le code-barres'
    },
    {
      icon: '📐',
      title: 'Alignement',
      description: 'Alignez le code-barres dans le cadre de scan',
      details: 'Le code doit être parallèle aux bords du cadre'
    },
    {
      icon: '🔍',
      title: 'Qualité du Code',
      description: 'Vérifiez que le code-barres n\'est pas endommagé',
      details: 'Codes déchirés ou tachés peuvent causer des erreurs'
    }
  ]

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % tips.length)
  }

  const prevTip = () => {
    setCurrentTip((prev) => (prev - 1 + tips.length) % tips.length)
  }

  if (!isVisible) return null

  return (
    <div className="scan-guide">
      <div className="guide-header">
        <h3>🎯 Guide de Scan</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="close-guide-btn"
        >
          ✕
        </button>
      </div>
      
      <div className="guide-content">
        <div className="tip-display">
          <div className="tip-icon">{tips[currentTip].icon}</div>
          <h4>{tips[currentTip].title}</h4>
          <p className="tip-description">{tips[currentTip].description}</p>
          <p className="tip-details">{tips[currentTip].details}</p>
        </div>
        
        <div className="tip-navigation">
          <button onClick={prevTip} className="nav-btn prev-btn">
            ◀
          </button>
          <div className="tip-indicators">
            {tips.map((_, index) => (
              <span 
                key={index} 
                className={`indicator ${index === currentTip ? 'active' : ''}`}
              />
            ))}
          </div>
          <button onClick={nextTip} className="nav-btn next-btn">
            ▶
          </button>
        </div>
      </div>
      
      <div className="guide-footer">
        <p>💡 Ces conseils améliorent la précision de détection</p>
      </div>
    </div>
  )
}

export default ScanGuide




