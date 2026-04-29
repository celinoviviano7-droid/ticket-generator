// Formatage des dates
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) return 'Date invalide'
  
  return dateObj.toLocaleDateString('fr-FR', { ...defaultOptions, ...options })
}

// Formatage des dates avec heure
export const formatDateTime = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }
  
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) return 'Date invalide'
  
  return dateObj.toLocaleString('fr-FR', { ...defaultOptions, ...options })
}

// Formatage des dates relatives
export const formatRelativeDate = (date) => {
  const now = new Date()
  const dateObj = new Date(date)
  const diffTime = Math.abs(now - dateObj)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Aujourd\'hui'
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `Il y a ${diffDays} jours`
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`
  if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`
  
  return `Il y a ${Math.floor(diffDays / 365)} ans`
}

// Formatage des montants
export const formatCurrency = (amount, currency = 'EUR', locale = 'fr-FR') => {
  if (typeof amount !== 'number' || isNaN(amount)) return '0,00 €'
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

// Formatage des pourcentages
export const formatPercentage = (value, decimals = 2) => {
  if (typeof value !== 'number' || isNaN(value)) return '0%'
  
  return `${value.toFixed(decimals)}%`
}

// Formatage des nombres
export const formatNumber = (number, locale = 'fr-FR', options = {}) => {
  if (typeof number !== 'number' || isNaN(number)) return '0'
  
  const defaultOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }
  
  return new Intl.NumberFormat(locale, { ...defaultOptions, ...options }).format(number)
}

// Formatage des numéros de téléphone
export const formatPhoneNumber = (phone, country = 'FR') => {
  if (!phone) return ''
  
  const cleanPhone = phone.replace(/\D/g, '')
  
  if (country === 'FR') {
    if (cleanPhone.length === 10) {
      return cleanPhone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
    }
    if (cleanPhone.length === 11 && cleanPhone.startsWith('33')) {
      const frenchNumber = cleanPhone.substring(2)
      return frenchNumber.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
    }
  }
  
  return phone
}

// Formatage des numéros de carte bancaire
export const formatCreditCard = (cardNumber) => {
  if (!cardNumber) return ''
  
  const cleanNumber = cardNumber.replace(/\D/g, '')
  const groups = cleanNumber.match(/.{1,4}/g)
  
  return groups ? groups.join(' ') : cleanNumber
}

// Formatage des codes postaux
export const formatPostalCode = (postalCode) => {
  if (!postalCode) return ''
  
  const cleanCode = postalCode.replace(/\D/g, '')
  if (cleanCode.length === 5) {
    return cleanCode
  }
  
  return postalCode
}

// Formatage des numéros de sécurité sociale
export const formatSocialSecurityNumber = (ssn) => {
  if (!ssn) return ''
  
  const cleanSSN = ssn.replace(/\D/g, '')
  if (cleanSSN.length === 15) {
    return cleanSSN.replace(/(\d{1})(\d{5})(\d{4})(\d{3})(\d{2})/, '$1 $2 $3 $4 $5')
  }
  
  return ssn
}

// Formatage des tailles de fichiers
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Formatage des durées
export const formatDuration = (seconds) => {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  return `${hours}h ${minutes}m`
}

// Formatage des noms
export const formatName = (firstName, lastName) => {
  if (!firstName && !lastName) return ''
  
  const formattedFirstName = firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase() : ''
  const formattedLastName = lastName ? lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase() : ''
  
  return [formattedFirstName, formattedLastName].filter(Boolean).join(' ')
}

// Formatage des adresses
export const formatAddress = (address) => {
  if (!address) return ''
  
  const parts = [
    address.street,
    address.postalCode,
    address.city,
    address.country
  ].filter(Boolean)
  
  return parts.join(', ')
}

// Formatage des URLs
export const formatURL = (url) => {
  if (!url) return ''
  
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }
  
  return url
}

// Formatage des emails
export const formatEmail = (email) => {
  if (!email) return ''
  
  return email.toLowerCase().trim()
}

// Formatage des textes (première lettre en majuscule)
export const formatText = (text) => {
  if (!text) return ''
  
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

// Formatage des listes
export const formatList = (items, separator = ', ', conjunction = ' et ') => {
  if (!Array.isArray(items) || items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return items.join(conjunction)
  
  const lastItem = items.pop()
  return items.join(separator) + conjunction + lastItem
}

// Formatage des numéros de série
export const formatSerialNumber = (serialNumber, format = 'XXXX-XXXX-XXXX') => {
  if (!serialNumber) return ''
  
  const cleanSerial = serialNumber.replace(/\D/g, '')
  let result = format
  
  for (let i = 0; i < cleanSerial.length && result.includes('X'); i++) {
    result = result.replace('X', cleanSerial[i])
  }
  
  return result.replace(/X/g, '0')
}
