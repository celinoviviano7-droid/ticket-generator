import React, { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import JsBarcode from 'jsbarcode'
import jsPDF from 'jspdf'
import Button from './ui/Button'
import './VisitorForm.css'

const VisitorForm = ({ onSubmit, loading = false }) => {
  const [generatedTicket, setGeneratedTicket] = useState(null)
  const [showTicket, setShowTicket] = useState(false)
  const [userIP, setUserIP] = useState('Chargement...')
  const barcodeRef = useRef(null)
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset 
  } = useForm()

  // Récupérer l'adresse IP de l'utilisateur
  useEffect(() => {
    const fetchIP = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json')
        const data = await response.json()
        setUserIP(data.ip)
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'IP:', error)
        setUserIP('Non disponible')
      }
    }
    
    fetchIP()
  }, [])

  // Générer un code-barres unique
  const generateBarcode = () => {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 10000)
    return `T${timestamp}${random.toString().padStart(4, '0')}`
  }

  // Générer un code-barres avec jsbarcode
  const generateBarcodeImage = (text) => {
    try {
      // Créer un canvas temporaire pour générer le code-barres
      const canvas = document.createElement('canvas')
      JsBarcode(canvas, text, {
        format: "CODE128",
        width: 2,
        height: 80,
        displayValue: true,
        fontSize: 14,
        margin: 10,
        background: "#ffffff",
        lineColor: "#000000"
      })
      
      return canvas.toDataURL('image/png', 1.0)
    } catch (error) {
      console.error('Erreur lors de la génération du code-barres:', error)
      // Fallback: créer un code-barres simple
      return createSimpleBarcode(text)
    }
  }

  // Fonction pour obtenir le montant basé sur le circuit
  const getCircuitAmount = (circuitId) => {
    const circuitPrices = {
      '1': 25, // Circuit Classique
      '2': 45, // Circuit Premium
      '3': 75  // Circuit VIP
    }
    return circuitPrices[circuitId] || 25
  }

  // Fallback: créer un code-barres simple si jsbarcode échoue
  const createSimpleBarcode = (text) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 300
    canvas.height = 100
    
    // Fond blanc
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, 300, 100)
    
    // Code-barres simple (alternance de barres noires et blanches)
    ctx.fillStyle = 'black'
    let x = 20
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i)
      const barWidth = (char % 3) + 1
      ctx.fillRect(x, 20, barWidth, 60)
      x += barWidth + 1
    }
    
    // Ajouter le texte en dessous
    ctx.fillStyle = 'black'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(text, 150, 95)
    
    return canvas.toDataURL('image/png', 1.0)
  }

  const handleFormSubmit = async (data) => {
    console.log('✅ Données du formulaire:', data)
    console.log('❌ Erreurs du formulaire:', errors)
    
    try {
      // Préparer les données pour l'API backend
      const ticketData = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone || '',
        residential_profile: data.residentialProfile,
        profile: data.profile,
        circuit: data.circuit,
        amount: getCircuitAmount(data.circuit), // Calculer le montant basé sur le circuit
        registration_date: new Date().toISOString() // Date d'enregistrement
      }

      console.log('📤 Envoi des données au backend:', ticketData)

      // Appel à l'API backend pour créer le ticket
      const response = await fetch('http://localhost:5000/api/tickets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData)
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ Réponse du backend:', result)

      if (result.success) {
        // Ticket créé avec succès en base de données
        const generatedTicketData = {
          ...ticketData,
          ticketNumber: result.data.barcode,
          barcodeImage: generateBarcodeImage(result.data.barcode),
          registration_date: ticketData.registration_date,
          status: 'active',
          uuid: result.data.ticket.uuid
        }

        // Afficher le ticket généré
        setGeneratedTicket(generatedTicketData)
        setShowTicket(true)

        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          navigate('/', { 
            state: { 
              message: 'Ticket créé avec succès ! Connectez-vous pour accéder au tableau de bord.',
              ticketData: generatedTicketData 
            } 
          })
        }, 3000)

      } else {
        throw new Error(result.message || 'Erreur lors de la création du ticket')
      }

    } catch (error) {
      console.error('❌ Erreur lors de la création du ticket:', error)
      
      // Afficher une erreur à l'utilisateur
      alert(`Erreur lors de la création du ticket: ${error.message}`)
      
      // En cas d'erreur, on peut quand même afficher un ticket local pour la démo
      const ticketNumber = generateBarcode()
      const barcodeImage = generateBarcodeImage(ticketNumber)
      
      const fallbackTicket = {
        ...data,
        ticketNumber,
        barcodeImage,
        registration_date: new Date().toISOString(),
        status: 'active',
        error: 'Ticket créé localement (erreur backend)'
      }
      
      setGeneratedTicket(fallbackTicket)
      setShowTicket(true)
    }
  }

  const closeTicket = () => {
    setShowTicket(false)
    setGeneratedTicket(null)
    reset()
  }

  const printTicket = () => {
    // Attendre que l'image soit chargée avant d'imprimer
    const img = new Image()
    img.onload = () => {
      createPrintWindow()
    }
    img.onerror = () => {
      // Si l'image ne charge pas, créer quand même la fenêtre d'impression
      createPrintWindow()
    }
    img.src = generatedTicket.barcodeImage
  }

  const generatePDFTicket = () => {
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    // Couleurs du thème
    const primaryColor = [44, 62, 80]      // #2c3e50
    const secondaryColor = [102, 126, 234] // #667eea
    const accentColor = [52, 73, 94]       // #34495e
    const textColor = [55, 73, 87]         // #374151
    
    // En-tête simple
    pdf.setFontSize(24)
    pdf.setTextColor(...primaryColor)
    pdf.text('ANOSIRAVO', 105, 30, { align: 'center' })
    
    pdf.setFontSize(18)
    pdf.setTextColor(...accentColor)
    pdf.text('TICKET', 105, 45, { align: 'center' })
    
    // Ligne de séparation
    pdf.setDrawColor(...secondaryColor)
    pdf.setLineWidth(1)
    pdf.line(20, 55, 190, 55)
    
    // Informations essentielles
    const currentDate = new Date()
    const circuitInfo = {
      '1': { name: 'Circuit Classique', duration: '2h', price: '25€' },
      '2': { name: 'Circuit Premium', duration: '4h', price: '45€' },
      '3': { name: 'Circuit VIP', duration: '6h', price: '75€' }
    }
    
    const selectedCircuit = circuitInfo[generatedTicket.circuit] || { name: 'Circuit', duration: '', price: '0€' }
    
    // Grille d'informations simplifiée
    const infoData = [
      { label: 'Nom du visiteur:', value: `${generatedTicket.first_name} ${generatedTicket.last_name}` },
      { label: 'Date:', value: currentDate.toLocaleDateString('fr-FR') },
      { label: 'Heure:', value: currentDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) },
      { label: 'Email:', value: generatedTicket.email },
      { label: 'Profil résidentiel:', value: generatedTicket.residential_profile },
      { label: 'Profil visiteur:', value: generatedTicket.profile },
      { label: 'Circuit:', value: selectedCircuit.name },
      { label: 'Montant:', value: selectedCircuit.price }
    ]
    
    let yPos = 75
    infoData.forEach((info, index) => {
      // Fond alterné pour les lignes
      if (index % 2 === 0) {
        pdf.setFillColor(248, 250, 252)
        pdf.rect(20, yPos - 5, 170, 15, 'F')
      }
      
      pdf.setFontSize(12)
      pdf.setTextColor(...primaryColor)
      pdf.text(info.label, 25, yPos)
      
      pdf.setFontSize(12)
      pdf.setTextColor(...textColor)
      pdf.text(info.value, 80, yPos)
      
      yPos += 20
    })
    
    // Section code-barres
    pdf.setFontSize(16)
    pdf.setTextColor(...primaryColor)
    pdf.text('Code-Barres:', 25, yPos + 10)
    
    // Ajouter l'image du code-barres
    try {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        
        const imgData = canvas.toDataURL('image/png')
        // Code-barres centré
        pdf.addImage(imgData, 'PNG', 60, yPos + 20, 90, 30)
        
        // Note sous le code-barres
        pdf.setFontSize(10)
        pdf.setTextColor(...accentColor)
        pdf.text('Scannez ce code-barres à l\'entrée du parc', 105, yPos + 60, { align: 'center' })
        
        // Pied de page simple
        pdf.setFontSize(12)
        pdf.setTextColor(...primaryColor)
        pdf.text('BONNE VISITE', 105, yPos + 80, { align: 'center' })
        
        // Horodatage
        pdf.setFontSize(9)
        pdf.setTextColor(...accentColor)
        pdf.text(`Généré le: ${currentDate.toLocaleString('fr-FR')}`, 105, yPos + 90, { align: 'center' })
        
        // Sauvegarder le PDF
        pdf.save(`ticket-${generatedTicket.ticketNumber}.pdf`)
      }
      img.src = generatedTicket.barcodeImage
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error)
      // Fallback: créer un PDF sans image
      pdf.setFontSize(10)
      pdf.setTextColor(...accentColor)
      pdf.text('Code-barres non disponible', 105, yPos + 35, { align: 'center' })
      pdf.text('Scannez ce code-barres à l\'entrée du parc', 105, yPos + 60, { align: 'center' })
      
      // Pied de page simple
      pdf.setFontSize(12)
      pdf.setTextColor(...primaryColor)
      pdf.text('BONNE VISITE', 105, yPos + 80, { align: 'center' })
      
      // Horodatage
      pdf.setFontSize(9)
      pdf.setTextColor(...accentColor)
      pdf.text(`Généré le: ${currentDate.toLocaleString('fr-FR')}`, 105, yPos + 90, { align: 'center' })
      
      pdf.save(`ticket-${generatedTicket.ticketNumber}.pdf`)
    }
  }

  const createPrintWindow = () => {
    const printWindow = window.open('', '_blank')
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket Visiteur - ${generatedTicket.ticketNumber}</title>
          <meta charset="UTF-8">
          <style>
            @media print {
              body { margin: 0; }
              .ticket { 
                page-break-inside: avoid;
                margin: 0;
                padding: 20px;
                width: 100%;
                max-width: none;
              }
            }
            
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              background: white;
              color: black;
            }
            
            .ticket { 
              border: 2px solid #000; 
              padding: 20px; 
              max-width: 400px;
              margin: 0 auto;
              background: white;
              page-break-inside: avoid;
            }
            
            .header { 
              text-align: center; 
              border-bottom: 1px solid #ccc; 
              padding-bottom: 10px; 
              margin-bottom: 15px;
            }
            
            .header h2 {
              margin: 0 0 5px 0;
              color: #2c3e50;
              font-size: 18px;
            }
            
            .header h3 {
              margin: 0;
              color: #34495e;
              font-size: 16px;
            }
            
            .info { 
              margin: 15px 0; 
              font-size: 12px;
            }
            
            .info p {
              margin: 5px 0;
              line-height: 1.4;
            }
            
            .barcode { 
              text-align: center; 
              margin: 20px 0;
              padding: 10px;
              border: 1px solid #ddd;
              background: white;
            }
            
            .barcode img {
              max-width: 100%;
              height: auto;
              display: block;
              margin: 0 auto;
              border: none;
            }
            
            .footer { 
              text-align: center; 
              margin-top: 20px; 
              font-size: 11px;
              color: #666;
              border-top: 1px solid #eee;
              padding-top: 15px;
            }
            
            .ticket-number {
              background: #f8f9fa;
              padding: 10px;
              text-align: center;
              border-radius: 5px;
              margin-bottom: 15px;
              font-weight: bold;
              font-size: 14px;
              color: #2c3e50;
            }
            
            .visitor-info {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 15px;
            }
            
            .visitor-info h4 {
              margin: 0 0 10px 0;
              color: #2c3e50;
              font-size: 13px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <h2>🎫 e-Bracelet Anosiravo</h2>
              <h3>Ticket Visiteur</h3>
            </div>
            
            <div class="ticket-number">
              <strong>Numéro de Ticket:</strong><br>
              ${generatedTicket.ticketNumber}
            </div>
            
            <div class="visitor-info">
              <h4>Informations du Visiteur</h4>
              <p><strong>Nom:</strong> ${generatedTicket.first_name} ${generatedTicket.last_name}</p>
              <p><strong>Email:</strong> ${generatedTicket.email}</p>
              <p><strong>Téléphone:</strong> ${generatedTicket.phone}</p>
              <p><strong>Profil résidentiel:</strong> ${generatedTicket.residential_profile}</p>
              <p><strong>Profil visiteur:</strong> ${generatedTicket.profile}</p>
              <p><strong>Circuit:</strong> ${generatedTicket.circuit}</p>
              <p><strong>Date d'entrée:</strong> ${new Date(generatedTicket.registration_date).toLocaleString('fr-FR')}</p>
            </div>
            
            <div class="barcode">
              <img src="${generatedTicket.barcodeImage}" alt="Code-Barres" style="width: 280px; height: 80px;" />
              <p style="margin: 10px 0 0 0; font-size: 11px; color: #666;">
                Scannez ce code-barres à l'entrée du parc
              </p>
            </div>
            
            <div class="footer">
              <p><strong>Présentez ce ticket à l'entrée du parc</strong></p>
              <p>Valide pour une journée</p>
              <p>Généré le: ${new Date().toLocaleString('fr-FR')}</p>
            </div>
          </div>
          
          <script>
            // Attendre que tout soit chargé avant d'imprimer
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `
    
    printWindow.document.write(printContent)
    printWindow.document.close()
    
    // Attendre que le contenu soit chargé avant d'imprimer
    printWindow.onload = function() {
      setTimeout(function() {
        printWindow.print()
      }, 1000)
    }
  }

  return (
    <div className="visitor-form">
      <h2 className="form-title">Enregistrement du Visiteur</h2>
      
      {/* Affichage de l'adresse IP */}
      <div className="ip-display">
        <span className="ip-label">🌐 Votre adresse IP :</span>
        <span className="ip-value">{userIP}</span>
      </div>
      
      <form onSubmit={handleSubmit(handleFormSubmit)} className="form">
        <div className="form-row">
          <div className="input-group">
            <label className="input-label">Prénom *</label>
            <input
              type="text"
              placeholder="Entrez le prénom"
              className={`input-field ${errors.firstName ? 'input-error' : ''}`}
              {...register('firstName', { required: 'Le prénom est requis' })}
            />
            {errors.firstName && (
              <span className="error-message">{errors.firstName.message}</span>
            )}
          </div>
          
          <div className="input-group">
            <label className="input-label">Nom *</label>
            <input
              type="text"
              placeholder="Entrez le nom"
              className={`input-field ${errors.lastName ? 'input-error' : ''}`}
              {...register('lastName', { required: 'Le nom est requis' })}
            />
            {errors.lastName && (
              <span className="error-message">{errors.lastName.message}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="input-group">
            <label className="input-label">Email *</label>
            <input
              type="email"
              placeholder="exemple@email.com"
              className={`input-field ${errors.email ? 'input-error' : ''}`}
              {...register('email', { required: 'L\'email est requis' })}
            />
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
          </div>
          
          <div className="input-group">
            <label className="input-label">Téléphone *</label>
            <input
              type="tel"
              placeholder="+261 34 12 345 67"
              className={`input-field ${errors.phone ? 'input-error' : ''}`}
              {...register('phone', { required: 'Le téléphone est requis' })}
            />
            {errors.phone && (
              <span className="error-message">{errors.phone.message}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="input-group">
            <label className="input-label">Profil résidentiel *</label>
            <select
              className={`input-field ${errors.residentialProfile ? 'input-error' : ''}`}
              {...register('residentialProfile', { required: 'Le profil résidentiel est requis' })}
            >
              <option value="">Sélectionnez un profil</option>
              <option value="residant">Résidant</option>
              <option value="non-residant">Non résidant</option>
            </select>
            {errors.residentialProfile && (
              <span className="error-message">{errors.residentialProfile.message}</span>
            )}
          </div>
          
          <div className="input-group">
            <label className="input-label">Profil visiteur *</label>
            <select
              className={`input-field ${errors.profile ? 'input-error' : ''}`}
              {...register('profile', { required: 'Le profil visiteur est requis' })}
            >
              <option value="">Sélectionnez un profil</option>
              <option value="adulte">Adulte</option>
              <option value="enfant">Enfant</option>
              <option value="bebe">Bébé</option>
            </select>
            {errors.profile && (
              <span className="error-message">{errors.profile.message}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="input-group">
            <label className="input-label">Circuit choisi *</label>
            <select
              className={`input-field ${errors.circuit ? 'input-error' : ''}`}
              {...register('circuit', { required: 'Le circuit est requis' })}
            >
              <option value="">Sélectionnez un circuit</option>
              <option value="1">Circuit Classique - 2h - 25€</option>
              <option value="2">Circuit Premium - 4h - 45€</option>
              <option value="3">Circuit VIP - 6h - 75€</option>
            </select>
            {errors.circuit && (
              <span className="error-message">{errors.circuit.message}</span>
            )}
          </div>
        </div>

        <div className="form-actions">
          <Button
            type="submit"
            variant="primary"
            size="large"
            disabled={loading}
            className="submit-btn"
          >
            {loading ? 'Enregistrement...' : 'Générer le Ticket'}
          </Button>
        </div>
      </form>

      {/* Modal d'affichage du ticket généré */}
      {showTicket && generatedTicket && (
        <div className="ticket-modal">
          <div className="ticket-content">
            <div className="ticket-header">
              <h3>🎫 Ticket Généré avec Succès !</h3>
              <button className="close-btn" onClick={closeTicket}>×</button>
            </div>
            
            <div className="ticket-info">
              <div className="ticket-number">
                <strong>Numéro de Ticket:</strong> {generatedTicket.ticketNumber}
              </div>
              
              <div className="visitor-details">
                <h4>Informations du Visiteur</h4>
                <p><strong>Nom:</strong> {generatedTicket.first_name} {generatedTicket.last_name}</p>
                <p><strong>Email:</strong> {generatedTicket.email}</p>
                <p><strong>Téléphone:</strong> {generatedTicket.phone}</p>
                <p><strong>Profil résidentiel:</strong> {generatedTicket.residential_profile}</p>
                <p><strong>Profil visiteur:</strong> {generatedTicket.profile}</p>
                <p><strong>Circuit:</strong> {generatedTicket.circuit}</p>
                <p><strong>Date d'enregistrement:</strong> {new Date(generatedTicket.registration_date).toLocaleString('fr-FR')}</p>
              </div>
              
              <div className="barcode-section">
                <h4>Code-Barres</h4>
                <div className="barcode">
                  <img src={generatedTicket.barcodeImage} alt="Code-Barres" />
                </div>
                <p className="barcode-note">Scannez ce code-barres à l'entrée du parc</p>
              </div>
            </div>
            
                               <div className="ticket-actions">
                     <Button onClick={generatePDFTicket} variant="secondary" size="medium">
                       📄 Générer PDF
                     </Button>
                     <Button onClick={printTicket} variant="secondary" size="medium">
                       🖨️ Imprimer le Ticket
                     </Button>
                   </div>
                   
                   <div className="ticket-redirect-info">
                     <p className="redirect-message">
                       ⏰ Redirection automatique vers la page de connexion dans 3 secondes...
                     </p>
                     <p className="redirect-note">
                       Connectez-vous pour accéder au tableau de bord et gérer vos tickets
                     </p>
                   </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VisitorForm
