import React, { useState, useEffect } from 'react'
import './ScanDiagnostic.css'

const ScanDiagnostic = ({ isScanning, deviceType, scannerRef }) => {
  const [diagnosticData, setDiagnosticData] = useState({
    cameraAccess: false,
    quaggaStatus: 'stopped',
    frameCount: 0,
    lastFrame: null,
    errors: []
  })

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isScanning) {
      // Simuler la collecte de données de diagnostic
      const interval = setInterval(() => {
        setDiagnosticData(prev => ({
          ...prev,
          frameCount: prev.frameCount + 1,
          lastFrame: new Date().toISOString(),
          quaggaStatus: 'running'
        }))
      }, 1000)

      return () => clearInterval(interval)
    } else {
      setDiagnosticData(prev => ({
        ...prev,
        quaggaStatus: 'stopped'
      }))
    }
  }, [isScanning])

  const runDiagnostic = () => {
    const newDiagnostic = {
      cameraAccess: !!navigator.mediaDevices,
      quaggaStatus: isScanning ? 'running' : 'stopped',
      frameCount: diagnosticData.frameCount,
      lastFrame: new Date().toISOString(),
      errors: []
    }

    // Vérifier les erreurs courantes
    if (!navigator.mediaDevices) {
      newDiagnostic.errors.push('❌ API MediaDevices non supportée')
    }
    
    if (!scannerRef.current) {
      newDiagnostic.errors.push('❌ Référence scanner manquante')
    }
    
    if (deviceType === 'android' && !navigator.userAgent.includes('Chrome')) {
      newDiagnostic.errors.push('⚠️ Chrome recommandé sur Android')
    }

    setDiagnosticData(newDiagnostic)
  }

  if (!isVisible) {
    return (
      <button 
        className="diagnostic-toggle"
        onClick={() => setIsVisible(true)}
      >
        🔧 Diagnostic Scan
      </button>
    )
  }

  return (
    <div className="scan-diagnostic">
      <div className="diagnostic-header">
        <h3>🔧 Diagnostic du Scanner</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="close-diagnostic-btn"
        >
          ✕
        </button>
      </div>
      
      <div className="diagnostic-content">
        <div className="diagnostic-section">
          <h4>📱 État de l'Appareil</h4>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Type:</span>
              <span className="status-value">{deviceType}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Navigateur:</span>
              <span className="status-value">
                {navigator.userAgent.includes('Chrome') ? '✅ Chrome' : 
                 navigator.userAgent.includes('Firefox') ? '✅ Firefox' : 
                 navigator.userAgent.includes('Safari') ? '✅ Safari' : 
                 '⚠️ Autre'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">HTTPS:</span>
              <span className="status-value">
                {window.location.protocol === 'https:' ? '✅ Sécurisé' : '⚠️ Local'}
              </span>
            </div>
          </div>
        </div>

        <div className="diagnostic-section">
          <h4>📷 État de la Caméra</h4>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">API Support:</span>
              <span className="status-value">
                {navigator.mediaDevices ? '✅ Moderne' : '❌ Non supportée'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Permissions:</span>
              <span className="status-value">
                {navigator.permissions ? '✅ Gérées' : '⚠️ Basiques'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Référence:</span>
              <span className="status-value">
                {scannerRef.current ? '✅ OK' : '❌ Manquante'}
              </span>
            </div>
          </div>
        </div>

        <div className="diagnostic-section">
          <h4>🔍 État de Quagga</h4>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Statut:</span>
              <span className={`status-value ${diagnosticData.quaggaStatus === 'running' ? 'success' : 'warning'}`}>
                {diagnosticData.quaggaStatus === 'running' ? '🟢 En cours' : '🟡 Arrêté'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Frames:</span>
              <span className="status-value">{diagnosticData.frameCount}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Dernier Frame:</span>
              <span className="status-value">
                {diagnosticData.lastFrame ? new Date(diagnosticData.lastFrame).toLocaleTimeString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {diagnosticData.errors.length > 0 && (
          <div className="diagnostic-section">
            <h4>⚠️ Problèmes Détectés</h4>
            <div className="errors-list">
              {diagnosticData.errors.map((error, index) => (
                <div key={index} className="error-item">
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="diagnostic-actions">
          <button onClick={runDiagnostic} className="run-diagnostic-btn">
            🔄 Actualiser le Diagnostic
          </button>
        </div>
      </div>
    </div>
  )
}

export default ScanDiagnostic
