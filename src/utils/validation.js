// Validation des emails
export const validateEmail = (email) => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
  return emailRegex.test(email)
}

// Validation des numéros de téléphone
export const validatePhone = (phone) => {
  // Accepte les formats internationaux
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// Validation des noms
export const validateName = (name) => {
  return name.length >= 2 && name.length <= 50
}

// Validation des champs requis
export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0
}

// Validation de la longueur minimale
export const validateMinLength = (value, minLength) => {
  return value && value.toString().length >= minLength
}

// Validation de la longueur maximale
export const validateMaxLength = (value, maxLength) => {
  return value && value.toString().length <= maxLength
}

// Validation des dates
export const validateDate = (date) => {
  const inputDate = new Date(date)
  return inputDate instanceof Date && !isNaN(inputDate)
}

// Validation des dates futures
export const validateFutureDate = (date) => {
  const inputDate = new Date(date)
  const now = new Date()
  return inputDate > now
}

// Validation des dates passées
export const validatePastDate = (date) => {
  const inputDate = new Date(date)
  const now = new Date()
  return inputDate < now
}

// Validation des montants
export const validateAmount = (amount) => {
  const amountRegex = /^\d+(\.\d{1,2})?$/
  return amountRegex.test(amount) && parseFloat(amount) > 0
}

// Validation des codes postaux
export const validatePostalCode = (postalCode) => {
  const postalCodeRegex = /^\d{5}$/
  return postalCodeRegex.test(postalCode)
}

// Validation des numéros de sécurité sociale
export const validateSocialSecurityNumber = (ssn) => {
  const ssnRegex = /^\d{15}$/
  return ssnRegex.test(ssn.replace(/\s/g, ''))
}

// Validation des mots de passe
export const validatePassword = (password) => {
  // Au moins 8 caractères, une majuscule, une minuscule, un chiffre
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

// Validation des URLs
export const validateURL = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Validation des numéros de carte bancaire (algorithme de Luhn)
export const validateCreditCard = (cardNumber) => {
  const cleanNumber = cardNumber.replace(/\s/g, '')
  if (!/^\d{13,19}$/.test(cleanNumber)) return false
  
  let sum = 0
  let isEven = false
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i))
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }
  
  return sum % 10 === 0
}

// Validation des numéros de TVA
export const validateVATNumber = (vatNumber) => {
  // Format européen: 2 lettres du pays + 8-12 chiffres
  const vatRegex = /^[A-Z]{2}\d{8,12}$/
  return vatRegex.test(vatNumber.replace(/\s/g, ''))
}

// Validation des numéros de SIRET
export const validateSIRET = (siret) => {
  const cleanSiret = siret.replace(/\s/g, '')
  if (!/^\d{14}$/.test(cleanSiret)) return false
  
  let sum = 0
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(cleanSiret.charAt(i))
    if (i % 2 === 0) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
  }
  
  return sum % 10 === 0
}

// Validation personnalisée avec fonction de callback
export const validateCustom = (value, validator) => {
  if (typeof validator === 'function') {
    return validator(value)
  }
  return true
}

// Validation multiple
export const validateMultiple = (value, validators) => {
  for (const validator of validators) {
    if (!validator(value)) {
      return false
    }
  }
  return true
}

// Obtenir les messages d'erreur de validation
export const getValidationMessage = (fieldName, validationType, params = {}) => {
  const messages = {
    required: `${fieldName} est requis`,
    email: `${fieldName} doit être un email valide`,
    phone: `${fieldName} doit être un numéro de téléphone valide`,
    minLength: `${fieldName} doit contenir au moins ${params.minLength} caractères`,
    maxLength: `${fieldName} doit contenir au maximum ${params.maxLength} caractères`,
    date: `${fieldName} doit être une date valide`,
    futureDate: `${fieldName} doit être une date future`,
    pastDate: `${fieldName} doit être une date passée`,
    amount: `${fieldName} doit être un montant valide`,
    postalCode: `${fieldName} doit être un code postal valide`,
    password: `${fieldName} doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre`,
    url: `${fieldName} doit être une URL valide`,
    creditCard: `${fieldName} doit être un numéro de carte valide`,
    vatNumber: `${fieldName} doit être un numéro de TVA valide`,
    siret: `${fieldName} doit être un numéro SIRET valide`
  }
  
  return messages[validationType] || `${fieldName} est invalide`
}



