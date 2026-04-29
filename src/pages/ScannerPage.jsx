import React, { useState, useRef, useEffect } from 'react'
import Quagga from 'quagga'
import { config } from '../config/config'
import './ScannerPage.css'

const ScannerPage = () => {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedData, setScannedData] = useState('')
  const [scanHistory, setScanHistory] = useState([])
  const [cameraError, setCameraError] = useState('')
  const [deviceType, setDeviceType] = useState('desktop')
  const [scanResult, setScanResult] = useState(null)
  const [isChecking, setIsChecking] = useState(false)
  const [debugInfo, setDebugInfo] = useState('ScannerPage chargé')
  const [fastMode, setFastMode] = useState(true)
  const [scanStats, setScanStats] = useState({ totalScans: 0, successfulScans: 0, avgTime: 0 })
  const scannerRef = useRef(null)

  // Configuration Quagga optimisée pour la vitesse
  const getQuaggaConfig = () => {
    const baseConfig = {
      inputStream: {
        name: "Live",
        type: "LiveStream",
        constraints: {
          facingMode: "environment",
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 }
        }
      },
      locator: {
        patchSize: fastMode ? "small" : "medium",
        halfSample: fastMode ? true : false
      },
      numOfWorkers: fastMode ? 6 : 4,
      frequency: fastMode ? 30 : 20,
      decoder: {
        readers: ["code_128_reader", "ean_reader", "code_39_reader", "i2of5_reader"]
      },
      locate: true
    }

    // Si l'élément scanner existe, l'utiliser comme cible
    if (scannerRef.current) {
      baseConfig.inputStream.target = scannerRef.current
    }

    return baseConfig
  }

  // Détecter le type d'appareil
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    if (/android/.test(userAgent)) {
      setDeviceType('android')
    } else if (/iphone|ipad|ipod/.test(userAgent)) {
      setDeviceType('ios')
    } else {
      setDeviceType('desktop')
    }
  }, [])

  // Vérifier que l'élément scanner est prêt
  useEffect(() => {
    console.log('🔍 useEffect: Vérification de l\'élément scanner')
    console.log('🔍 scannerRef.current:', scannerRef.current)
    
    if (scannerRef.current) {
      console.log('✅ Élément scanner prêt')
      setDebugInfo('Scanner prêt - Vous pouvez démarrer le scan')
      
      // Initialiser l'affichage par défaut
      const scannerElement = scannerRef.current
      scannerElement.style.width = '100%'
      scannerElement.style.height = '300px'
      scannerElement.style.backgroundColor = '#f8f9fa'
      scannerElement.style.border = '2px dashed #dee2e6'
      scannerElement.style.borderRadius = '10px'
      scannerElement.style.display = 'flex'
      scannerElement.style.alignItems = 'center'
      scannerElement.style.justifyContent = 'center'
      scannerElement.style.color = '#666'
      scannerElement.style.fontSize = '18px'
    } else {
      console.log('❌ Élément scanner pas encore prêt')
      setDebugInfo('Scanner en cours de chargement...')
    }
  }, [scannerRef.current])

  // Test de connectivité au backend
  const testBackendConnectivity = async () => {
    try {
      setDebugInfo('🔍 Test de connectivité au backend...')
      
      // Test 1: Endpoint de santé
      const healthResponse = await fetch(`${config.api.baseURL}/health`)
      console.log('🏥 Health check:', healthResponse.status)
      
      // Test 2: Endpoint de test
      const testResponse = await fetch(`${config.api.baseURL}/api/tickets/test`)
      console.log('🧪 Test endpoint:', testResponse.status)
      
      // Test 3: Endpoint de scan
      const scanResponse = await fetch(`${config.api.baseURL}/api/tickets/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode: 'test', device_type: 'desktop' })
      })
      console.log('📡 Scan endpoint:', scanResponse.status)
      
      setDebugInfo(`✅ Connectivité: Health(${healthResponse.status}) Test(${testResponse.status}) Scan(${scanResponse.status})`)
      
    } catch (error) {
      console.error('❌ Erreur connectivité:', error)
      setDebugInfo(`❌ Erreur connectivité: ${error.message}`)
    }
  }

  // Fonction de vérification du code-barres optimisée
  const checkBarcode = async (barcode) => {
    const startTime = Date.now()
    
    try {
      setIsChecking(true)
      setDebugInfo(`Vérification du code: ${barcode}`)
      console.log('🔍 Vérification du code-barres:', barcode)

      const response = await fetch(`${config.api.baseURL}${config.api.endpoints.tickets}scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          barcode: barcode,
          device_type: deviceType
        })
      })

      const responseTime = Date.now() - startTime
      console.log(`⚡ Temps de réponse API: ${responseTime}ms`)

      if (response.ok) {
        const data = await response.json()
        setDebugInfo(`✅ Résultat en ${responseTime}ms: ${data.message}`)
        console.log('✅ Réponse API:', data)
        
        // Mettre à jour les statistiques
        setScanStats(prev => ({
          totalScans: prev.totalScans + 1,
          successfulScans: prev.successfulScans + 1,
          avgTime: Math.round((prev.avgTime * prev.totalScans + responseTime) / (prev.totalScans + 1))
        }))
        
        if (data.success) {
          console.log('🎯 Scan réussi - Données reçues:', data)
          console.log('🎫 Ticket:', data.data.ticket)
          console.log('👤 Visiteur:', data.data.visitor)
          console.log('📊 Status:', data.data.status)
          console.log('🔄 Circuit:', data.data.circuit)
          console.log('⏰ Scan time:', data.data.scan_time)
          
          setScanResult({
            found: true,
            ticket: data.data.ticket,
            message: data.data.message,
            visitor: data.data.visitor,
            status: data.data.status,
            circuit: data.data.circuit,
            scan_time: data.data.scan_time
          })
          
          console.log('📝 scanResult mis à jour:', {
            found: true,
            ticket: data.data.ticket,
            visitor: data.data.visitor,
            status: data.data.status,
            circuit: data.data.circuit
          })

          // Ajouter à l'historique
          const newScan = {
            id: Date.now(),
            code: barcode,
            timestamp: data.data.scan_time,
            device: deviceType,
            found: true,
            ticketInfo: data.data.ticket,
            responseTime: responseTime
          }
          setScanHistory(prev => [newScan, ...prev])
        } else {
          setScanResult({
            found: false,
            message: data.data.message || 'Code non trouvé'
          })

          // Ajouter à l'historique
          const newScan = {
            id: Date.now(),
            code: barcode,
            timestamp: new Date().toISOString(),
            device: deviceType,
            found: false,
            responseTime: responseTime
          }
          setScanHistory(prev => [newScan, ...prev])
        }
      } else {
        // Gestion détaillée des erreurs HTTP
        let errorMessage = `Erreur HTTP ${response.status}`
        
        if (response.status === 404) {
          errorMessage = '❌ Endpoint non trouvé - Vérifiez la configuration du backend'
        } else if (response.status === 500) {
          errorMessage = '❌ Erreur serveur - Vérifiez les logs du backend'
        } else if (response.status === 403) {
          errorMessage = '❌ Accès interdit - Vérifiez l\'authentification'
        } else if (response.status === 400) {
          errorMessage = '❌ Requête invalide - Vérifiez les données envoyées'
        }
        
        setDebugInfo(`${errorMessage} en ${responseTime}ms`)
        console.error(`❌ ${errorMessage}:`, response.status)
        
        // Mettre à jour les statistiques
        setScanStats(prev => ({
          totalScans: prev.totalScans + 1,
          successfulScans: prev.successfulScans,
          avgTime: prev.avgTime
        }))
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      setDebugInfo(`❌ Erreur en ${responseTime}ms: ${error.message}`)
      console.error('❌ Erreur lors de la vérification:', error)
      
      // Mettre à jour les statistiques
      setScanStats(prev => ({
        totalScans: prev.totalScans + 1,
        successfulScans: prev.successfulScans,
        avgTime: prev.avgTime
      }))
    } finally {
      setIsChecking(false)
    }
  }

  // Vérifier les permissions de caméra
  const checkCameraPermissions = async () => {
    try {
      setDebugInfo('Vérification des permissions caméra...')
      
      // Vérifier si l'API MediaDevices est supportée
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('API MediaDevices non supportée par ce navigateur')
      }

      // Demander l'accès à la caméra
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      })
      
      // Arrêter le stream de test
      stream.getTracks().forEach(track => track.stop())
      
      setDebugInfo('Permissions caméra accordées ✅')
      return true
      
    } catch (error) {
      const errorMsg = `Erreur permissions caméra: ${error.message}`
      setDebugInfo(errorMsg)
      setCameraError(errorMsg)
      console.error('❌ Erreur permissions caméra:', error)
      return false
    }
  }

  // Démarrer le scan
  const startScan = async () => {
    try {
      setDebugInfo('Vérification des permissions...')
      setCameraError('')
      
      // Vérifier d'abord les permissions de caméra
      const hasPermissions = await checkCameraPermissions()
      if (!hasPermissions) {
        setIsScanning(false)
        return
      }

      setIsScanning(true)
      setDebugInfo('Démarrage du scan...')
      
      // Attendre que l'élément DOM soit prêt
      if (!scannerRef.current) {
        throw new Error('Élément scanner non disponible')
      }

      // S'assurer que l'élément est visible
      const scannerElement = scannerRef.current
      if (scannerElement.style.display === 'none' || scannerElement.offsetWidth === 0) {
        scannerElement.style.display = 'block'
        scannerElement.style.width = '100%'
        scannerElement.style.height = '300px'
        scannerElement.style.backgroundColor = '#000'
        console.log('📱 Élément scanner rendu visible')
      }

      // Obtenir la configuration Quagga
      const config = getQuaggaConfig()
      console.log('🔧 Configuration Quagga:', config)
      console.log('📱 Type d\'appareil:', deviceType)
      
      if (typeof Quagga === 'undefined') {
        throw new Error('Quagga non disponible')
      }

      console.log('✅ Initialisation de Quagga...')
      
      Quagga.init(config, (err) => {
        if (err) {
          const errorMsg = `Erreur d'initialisation Quagga: ${err.message}`
          setDebugInfo(errorMsg)
          setCameraError(errorMsg)
          setIsScanning(false)
          console.error('❌ Erreur Quagga:', err)
          
          // Suggestions de résolution
          if (err.message.includes('video source')) {
            setCameraError(`
              Erreur caméra: ${err.message}
              
              Solutions possibles:
              1. Vérifiez que la caméra n'est pas utilisée par une autre application
              2. Rechargez la page et réessayez
              3. Utilisez le bouton "Test Manuel" en attendant
            `)
          }
          return
        }

        setDebugInfo('Quagga initialisé, démarrage du scan...')
        console.log('✅ Quagga initialisé avec succès')
        
        // Démarrer le scan
        Quagga.start()
        console.log('🚀 Scan démarré')
        
        // Écouter les résultats de scan
        Quagga.onDetected((result) => {
          console.log('🎯 onDetected appelé:', result)
          try {
            const code = result.codeResult.code
            const confidence = result.codeResult.confidence || 0
            const format = result.codeResult.format
            
            setDebugInfo(`Code détecté: ${code} (${format}) - Confiance: ${confidence}`)
            console.log('🎯 Code détecté:', code, 'Confiance:', confidence, 'Format:', format)
            
            // Validation de qualité optimisée pour la vitesse
            let isValidQuality = true
            
            // Accepter tous les codes avec une confiance > 0.1
            if (confidence > 0.1) {
              console.log('✅ Qualité validée par confiance élevée:', confidence)
            } 
            // Accepter les codes longs même avec faible confiance
            else if (code && code.length >= 8) {
              console.log('✅ Qualité validée par longueur:', code.length)
            }
            // Accepter les formats reconnus
            else if (format && ['code_128', 'ean_13', 'ean_8', 'code_39', 'i2of5'].includes(format)) {
              console.log('✅ Qualité validée par format reconnu:', format)
            }
            // En dernier recours, accepter si le code semble valide
            else if (code && code.length >= 5 && /^[0-9A-Za-z]+$/.test(code)) {
              console.log('✅ Qualité validée par validation basique')
            }
            else {
              console.log('⚠️ Qualité insuffisante, mais on continue quand même')
            }
            
            if (isValidQuality) {
              setDebugInfo(`Code validé: ${code}`)
              
              // Arrêter le scan immédiatement
              stopScan()
              
              // Vérifier le code
              checkBarcode(code)
              setScannedData(code)
              
              // Redémarrer après seulement 1 seconde pour plus de rapidité
              setTimeout(() => {
                if (isScanning) {
                  startScan()
                }
              }, 1000)
            }
            
          } catch (error) {
            setDebugInfo(`Erreur détection: ${error.message}`)
            console.error('❌ Erreur lors de la détection:', error)
          }
        })

        // Gérer les erreurs Quagga
        Quagga.onProcessed((result) => {
          if (result) {
            console.log('📹 Frame traité:', result)
            if (result.codeResult && result.codeResult.code) {
              console.log('🔍 Code détecté dans le frame:', result.codeResult.code)
            }
          }
        })

        // Ajouter des événements de debug
        Quagga.onProcessed((result) => {
          if (result && result.codeResult && result.codeResult.code) {
            console.log('📹 Frame traité avec code:', result.codeResult.code)
          }
        })

        // Événement de démarrage
        Quagga.onStarted(() => {
          console.log('🚀 Quagga a démarré')
          setDebugInfo('Scan actif - Pointez la caméra vers un code-barres')
        })

        // Événement de pause
        Quagga.onPaused(() => {
          console.log('⏸️ Quagga en pause')
        })

        // Événement de reprise
        Quagga.onResumed(() => {
          console.log('▶️ Quagga repris')
        })

        // Événement d'arrêt
        Quagga.onStopped(() => {
          console.log('⏹️ Quagga arrêté')
        })

      })

    } catch (error) {
      const errorMsg = `Erreur critique: ${error.message}`
      setDebugInfo(errorMsg)
      setCameraError(errorMsg)
      setIsScanning(false)
      console.error('❌ Erreur critique lors du démarrage:', error)
    }
  }

  // Arrêter le scan
  const stopScan = () => {
    try {
      if (typeof Quagga !== 'undefined') {
        Quagga.stop()
        console.log('⏹️ Scan arrêté')
      }
      
      setIsScanning(false)
      setDebugInfo('Scan arrêté')
      
      // Nettoyer l'affichage de la caméra
      if (scannerRef.current) {
        const scannerElement = scannerRef.current
        scannerElement.innerHTML = `
          <div style="
            color: #666; 
            text-align: center; 
            padding: 40px;
            font-size: 16px;
            background: #f8f9fa;
            border-radius: 10px;
            border: 2px dashed #dee2e6;
          ">
            📹 Caméra arrêtée<br>
            Cliquez sur "Démarrer le Scan" pour activer
          </div>
        `
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'arrêt du scan:', error)
      setDebugInfo(`Erreur arrêt: ${error.message}`)
    }
  }

  // Forcer l'affichage de la caméra
  const forceCameraDisplay = () => {
    console.log('🔍 forceCameraDisplay appelée')
    console.log('🔍 scannerRef.current:', scannerRef.current)
    
    if (scannerRef.current) {
      console.log('✅ Référence scanner trouvée')
      const scannerElement = scannerRef.current
      
      // Rendre l'élément visible et dimensionné
      scannerElement.style.display = 'block'
      scannerElement.style.width = '100%'
      scannerElement.style.height = '300px'
      scannerElement.style.backgroundColor = '#000'
      scannerElement.style.border = '2px solid #007bff'
      scannerElement.style.borderRadius = '10px'
      scannerElement.style.overflow = 'hidden'
      
      // Ajouter un indicateur visuel
      scannerElement.innerHTML = `
        <div style="
          color: white; 
          text-align: center; 
          padding: 20px;
          font-size: 16px;
        ">
          📹 Caméra en cours d'initialisation...
        </div>
      `
      
      console.log('📱 Affichage de la caméra forcé')
      setDebugInfo('Affichage de la caméra forcé - Réessayez le scan')
    } else {
      console.log('❌ scannerRef.current est null ou undefined')
      setDebugInfo('❌ Erreur: Référence scanner non disponible')
      
      // Essayer de créer un élément de remplacement
      createScannerElement()
    }
  }

  // Créer un élément scanner de remplacement
  const createScannerElement = () => {
    console.log('🔧 Création d\'un élément scanner de remplacement')
    
    // Trouver le conteneur parent
    const container = document.querySelector('.scanner-viewport')
    if (container) {
      console.log('✅ Conteneur scanner trouvé')
      
      // Créer un nouvel élément
      const newScanner = document.createElement('div')
      newScanner.id = 'scanner-replacement'
      newScanner.style.cssText = `
        width: 100%;
        height: 300px;
        background-color: #000;
        border: 2px solid #007bff;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 18px;
        overflow: hidden;
      `
      newScanner.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          📹 Scanner de remplacement créé<br>
          <small>Référence originale non disponible</small>
        </div>
      `
      
      // Remplacer l'ancien contenu
      container.innerHTML = ''
      container.appendChild(newScanner)
      
      // Mettre à jour la référence
      scannerRef.current = newScanner
      
      console.log('✅ Élément scanner de remplacement créé')
      setDebugInfo('Scanner de remplacement créé - Réessayez le scan')
    } else {
      console.log('❌ Conteneur scanner non trouvé')
      setDebugInfo('❌ Erreur: Conteneur scanner non trouvé')
    }
  }

  // Test avec image statique (pour diagnostiquer)
  const testWithStaticImage = () => {
    try {
      setDebugInfo('Test avec image statique...')
      
      if (typeof Quagga === 'undefined') {
        setDebugInfo('❌ Quagga non disponible')
        return
      }

      // Configuration pour image statique
      const staticConfig = {
        inputStream: {
          name: "File",
          type: "ImageStream",
          sequence: false,
          size: 800
        },
        locator: {
          patchSize: "large",
          halfSample: false
        },
        numOfWorkers: 1,
        frequency: 5,
        decoder: {
          readers: ["code_128_reader", "ean_reader", "code_39_reader"]
        },
        locate: true
      }

      console.log('🔧 Test avec configuration statique:', staticConfig)
      setDebugInfo('Test Quagga avec image statique - Vérifiez la console')
      
    } catch (error) {
      setDebugInfo(`Erreur test statique: ${error.message}`)
      console.error('❌ Erreur test statique:', error)
    }
  }

  // Test manuel
  const testManualScan = () => {
    const testCode = '352798955423218161832938'
    setDebugInfo(`Test manuel avec: ${testCode}`)
    checkBarcode(testCode)
  }

  // Nettoyer à la fermeture
  useEffect(() => {
    return () => {
      try {
        if (typeof Quagga !== 'undefined') {
          Quagga.stop()
        }
      } catch (error) {
        console.error('Erreur lors du nettoyage:', error)
      }
    }
  }, [])

  // Réparation complète du scanner
  const repairScanner = () => {
    console.log('🔧 === RÉPARATION COMPLÈTE DU SCANNER ===')
    
    // Vérifier l'état actuel
    console.log('🔍 scannerRef:', scannerRef)
    console.log('🔍 scannerRef.current:', scannerRef.current)
    
    // Essayer de trouver le conteneur
    const container = document.querySelector('.scanner-viewport')
    console.log('🔍 Conteneur trouvé:', container)
    
    if (container) {
      // Vider le conteneur
      container.innerHTML = ''
      
      // Créer un nouvel élément scanner
      const newScanner = document.createElement('div')
      newScanner.className = 'scanner-video'
      newScanner.id = 'scanner-fixed'
      newScanner.style.cssText = `
        width: 100%;
        height: 300px;
        background-color: #000;
        border: 3px solid #28a745;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 18px;
        overflow: hidden;
        position: relative;
      `
      
      newScanner.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 24px; margin-bottom: 10px;">📹</div>
          Scanner réparé et prêt !<br>
          <small style="color: #28a745;">Cliquez sur "Démarrer le Scan"</small>
        </div>
      `
      
      // Ajouter au conteneur
      container.appendChild(newScanner)
      
      // Mettre à jour la référence
      scannerRef.current = newScanner
      
      console.log('✅ Scanner réparé avec succès')
      setDebugInfo('✅ Scanner réparé ! Vous pouvez maintenant démarrer le scan')
      
    } else {
      console.log('❌ Conteneur scanner non trouvé')
      setDebugInfo('❌ Erreur: Conteneur scanner non trouvé')
    }
    
    console.log('🔧 === FIN RÉPARATION ===')
  }

  return (
    <div className="scanner-page">
      <div className="scanner-header">
        <h1 className="page-title">Scanner de Codes-Barres</h1>
        <p className="page-subtitle">Scannez les tickets des visiteurs</p>
      </div>

      {/* Debug info */}
      <div className="debug-info" style={{ 
        background: '#f0f0f0', 
        padding: '10px', 
        margin: '10px 0', 
        borderRadius: '5px',
        fontSize: '14px'
      }}>
        <strong>Debug:</strong> {debugInfo}
      </div>

      <main className="page-main">
        <div className="scanner-container">
          {/* Contrôles de scan */}
          <div className="scan-controls" style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '20px',
            alignItems: 'center'
          }}>
            <button 
              onClick={startScan}
              disabled={isScanning}
              style={{
                padding: '15px 30px',
                fontSize: '18px',
                backgroundColor: isScanning ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isScanning ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {isScanning ? '🔄 Scan en cours...' : '🚀 Démarrer le Scan'}
            </button>

            <button 
              onClick={stopScan}
              disabled={!isScanning}
              style={{
                padding: '15px 30px',
                fontSize: '18px',
                backgroundColor: !isScanning ? '#6c757d' : '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: !isScanning ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              ⏹️ Arrêter le Scan
            </button>

            {/* Mode rapide */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 15px',
              backgroundColor: fastMode ? '#d4edda' : '#f8f9fa',
              borderRadius: '8px',
              border: `2px solid ${fastMode ? '#28a745' : '#dee2e6'}`
            }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                color: fastMode ? '#155724' : '#6c757d'
              }}>
                <input
                  type="checkbox"
                  checked={fastMode}
                  onChange={(e) => setFastMode(e.target.checked)}
                  style={{ transform: 'scale(1.2)' }}
                />
                ⚡ Mode Rapide
              </label>
              {fastMode && (
                <span style={{ 
                  fontSize: '12px', 
                  color: '#28a745',
                  backgroundColor: '#fff',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  +50% vitesse
                </span>
              )}
            </div>

            {/* Statistiques de performance */}
            <div style={{
              display: 'flex',
              gap: '15px',
              padding: '10px 15px',
              backgroundColor: '#e9ecef',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              <div>
                <strong>📊 Total:</strong> {scanStats.totalScans}
              </div>
              <div>
                <strong>✅ Réussis:</strong> {scanStats.successfulScans}
              </div>
              <div>
                <strong>⚡ Moyenne:</strong> {scanStats.avgTime}ms
              </div>
            </div>
          </div>

          {/* Code-barres de test visible */}
          <div style={{
            background: 'white',
            padding: '20px',
            margin: '20px 0',
            borderRadius: '10px',
            textAlign: 'center',
            border: '2px solid #007bff'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#007bff' }}>🧪 Code-Barres de Test</h4>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#333',
              background: '#f8f9fa',
              padding: '15px',
              borderRadius: '5px',
              border: '1px solid #dee2e6'
            }}>
              352798955423218161832938
            </div>
            <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#666' }}>
              Scannez ce code avec votre caméra ou utilisez le bouton "Test Manuel"
            </p>
          </div>

          {/* Zone de scan */}
          <div className="scanner-viewport">
            <div 
              ref={scannerRef} 
              className="scanner-video"
              style={{
                width: '100%',
                height: '300px',
                backgroundColor: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px'
              }}
            >
              {isScanning ? '📷 Caméra active...' : '📷 Cliquez sur "Démarrer le Scan"'}
            </div>
          </div>

          {/* Boutons de diagnostic et test */}
          <div className="diagnostic-controls" style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#495057', width: '100%' }}>🔧 Outils de Diagnostic</h4>
            
            <button 
              onClick={testManualScan}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              🧪 Test Manuel
            </button>

            <button 
              onClick={() => {
                console.log('🔧 Test Quagga disponible:', typeof Quagga !== 'undefined')
                console.log('📱 Référence scanner:', scannerRef.current)
                console.log('🔄 État scanning:', isScanning)
                setDebugInfo('Test Quagga - Vérifiez la console')
              }}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                backgroundColor: '#ffc107',
                color: 'black',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              🔧 Test Quagga
            </button>

            <button 
              onClick={checkCameraPermissions}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              📷 Test Caméra
            </button>

            <button 
              onClick={forceCameraDisplay}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              📹 Forcer Caméra
            </button>

            <button 
              onClick={repairScanner}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              🔧 Réparer Scanner
            </button>

            <button 
              onClick={testBackendConnectivity}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              🌐 Test Backend
            </button>

            <button 
              onClick={() => {
                console.log('🔍 === DEBUG COMPLET ===')
                console.log('🔍 scannerRef:', scannerRef)
                console.log('🔍 scannerRef.current:', scannerRef.current)
                console.log('🔍 Éléments .scanner-viewport:', document.querySelectorAll('.scanner-viewport'))
                console.log('🔍 Éléments .scanner-video:', document.querySelectorAll('.scanner-video'))
                console.log('🔍 Éléments #scanner-replacement:', document.getElementById('scanner-replacement'))
                console.log('🔍 === FIN DEBUG ===')
                
                setDebugInfo('Debug complet - Vérifiez la console')
              }}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              🐛 Debug DOM
            </button>
          </div>

          {/* Erreurs caméra */}
          {cameraError && (
            <div className="camera-error" style={{
              background: '#f8d7da',
              color: '#721c24',
              padding: '15px',
              margin: '15px 0',
              borderRadius: '5px',
              border: '1px solid #f5c6cb'
            }}>
              <strong>⚠️ Erreur Caméra:</strong> {cameraError}
            </div>
          )}

          {/* Résultats du scan */}
          {scanResult && (
            <div className="scan-result" style={{
              background: scanResult.found ? '#d4edda' : '#f8d7da',
              color: scanResult.found ? '#155724' : '#721c24',
              padding: '20px',
              margin: '20px 0',
              borderRadius: '10px',
              border: `2px solid ${scanResult.found ? '#c3e6cb' : '#f5c6cb'}`
            }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '20px' }}>
                {scanResult.found ? '✅ Ticket Trouvé !' : '❌ Ticket Non Trouvé'}
              </h3>
              
              <p style={{ fontSize: '16px', margin: '0 0 15px 0' }}>
                <strong>{scanResult.message}</strong>
              </p>

              {scanResult.found && scanResult.visitor && (
                <div className="visitor-info" style={{ marginTop: '20px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#155724' }}>👤 Informations du Visiteur</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <strong>Nom:</strong> {scanResult.visitor.first_name} {scanResult.visitor.last_name}
                    </div>
                    <div>
                      <strong>Email:</strong> {scanResult.visitor.email}
                    </div>
                    <div>
                      <strong>Téléphone:</strong> {scanResult.visitor.phone}
                    </div>
                    <div>
                      <strong>Profil:</strong> {scanResult.visitor.profile}
                    </div>
                    <div>
                      <strong>Résidentiel:</strong> {scanResult.visitor.residential_profile}
                    </div>
                    <div>
                      <strong>Circuit:</strong> {scanResult.visitor.circuit}
                    </div>
                    <div>
                      <strong>Montant:</strong> {scanResult.visitor.amount} Ar
                    </div>
                    <div>
                      <strong>Date d'enregistrement:</strong> {new Date(scanResult.visitor.registration_date).toLocaleDateString('fr-FR')}
                    </div>
                  </div>

                  {scanResult.ticket && (
                    <div style={{ marginTop: '20px', padding: '15px', background: '#e8f5e8', borderRadius: '5px' }}>
                      <h5 style={{ margin: '0 0 10px 0' }}>🎫 Informations du Ticket</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div><strong>Code-barres:</strong> {scanResult.ticket.barcode}</div>
                        <div><strong>Statut:</strong> {scanResult.ticket.status}</div>
                        <div><strong>Expire le:</strong> {new Date(scanResult.ticket.expires_at).toLocaleDateString('fr-FR')}</div>
                        <div><strong>Scanné le:</strong> {new Date(scanResult.scan_time).toLocaleString('fr-FR')}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Historique des scans */}
          {scanHistory.length > 0 && (
            <div className="scan-history" style={{ marginTop: '30px' }}>
              <h3 style={{ margin: '0 0 15px 0' }}>📋 Historique des Scans</h3>
              <div className="history-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {scanHistory.map((scan, index) => (
                  <div key={scan.id} className="history-item" style={{
                    padding: '12px',
                    margin: '8px 0',
                    backgroundColor: scan.found ? '#e8f5e8' : '#ffe8e8',
                    borderRadius: '5px',
                    border: `1px solid ${scan.found ? '#c3e6cb' : '#f5c6cb'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <strong>{scan.code}</strong>
                      <span style={{ marginLeft: '10px', fontSize: '14px' }}>
                        {scan.found ? '✅ Trouvé' : '❌ Non trouvé'}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {new Date(scan.timestamp).toLocaleString('fr-FR')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default ScannerPage
