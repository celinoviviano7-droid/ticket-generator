// Tarifs des circuits du parc Anosiravo
export const CIRCUIT_TARIFFS = {
  CLASSIC: {
    id: 1,
    name: 'Circuit Classique',
    description: 'Découverte des principales attractions du parc',
    duration: '2h',
    price: 25,
    currency: 'EUR',
    features: [
      'Accès aux zones principales',
      'Guide audio inclus',
      'Documentation du parc',
      'Accès aux toilettes'
    ],
    restrictions: [
      'Pas d\'accès aux zones VIP',
      'Pas d\'accès aux activités spéciales'
    ],
    maxVisitors: 50,
    available: true
  },
  
  PREMIUM: {
    id: 2,
    name: 'Circuit Premium',
    description: 'Expérience enrichie avec accès étendu',
    duration: '4h',
    price: 45,
    currency: 'EUR',
    features: [
      'Accès aux zones principales',
      'Accès aux zones intermédiaires',
      'Guide personnel inclus',
      'Documentation complète',
      'Accès aux toilettes',
      'Rafraîchissements inclus',
      'Accès aux activités spéciales'
    ],
    restrictions: [
      'Pas d\'accès aux zones VIP',
      'Réservation recommandée'
    ],
    maxVisitors: 30,
    available: true
  },
  
  VIP: {
    id: 3,
    name: 'Circuit VIP',
    description: 'Expérience exclusive et personnalisée',
    duration: '6h',
    price: 75,
    currency: 'EUR',
    features: [
      'Accès à toutes les zones',
      'Guide personnel dédié',
      'Documentation premium',
      'Accès aux toilettes VIP',
      'Rafraîchissements illimités',
      'Accès à toutes les activités',
      'Parking réservé',
      'Souvenir personnalisé'
    ],
    restrictions: [
      'Réservation obligatoire 24h à l\'avance',
      'Groupe limité à 10 personnes'
    ],
    maxVisitors: 10,
    available: true
  }
}

// Tarifs spéciaux
export const SPECIAL_TARIFFS = {
  CHILD: {
    discount: 0.5, // 50% de réduction
    description: 'Enfants de 3 à 12 ans',
    minAge: 3,
    maxAge: 12
  },
  
  SENIOR: {
    discount: 0.25, // 25% de réduction
    description: 'Seniors de 65 ans et plus',
    minAge: 65
  },
  
  STUDENT: {
    discount: 0.3, // 30% de réduction
    description: 'Étudiants avec justificatif',
    requiresProof: true
  },
  
  GROUP: {
    discount: 0.2, // 20% de réduction
    description: 'Groupes de 10 personnes et plus',
    minPeople: 10
  },
  
  FAMILY: {
    discount: 0.15, // 15% de réduction
    description: 'Familles de 4 personnes et plus',
    minPeople: 4
  }
}

// Tarifs saisonniers
export const SEASONAL_TARIFFS = {
  HIGH_SEASON: {
    period: 'Juin à Août',
    multiplier: 1.2, // 20% de majoration
    description: 'Haute saison'
  },
  
  LOW_SEASON: {
    period: 'Novembre à Mars',
    multiplier: 0.8, // 20% de réduction
    description: 'Basse saison'
  },
  
  MID_SEASON: {
    period: 'Avril, Mai, Septembre, Octobre',
    multiplier: 1.0, // Prix normal
    description: 'Moyenne saison'
  }
}

// Méthodes de calcul des tarifs
export const calculatePrice = (circuitId, visitorType = null, season = 'MID_SEASON', groupSize = 1) => {
  const circuit = CIRCUIT_TARIFFS[Object.keys(CIRCUIT_TARIFFS).find(key => CIRCUIT_TARIFFS[key].id === circuitId)]
  if (!circuit) return null
  
  let basePrice = circuit.price
  
  // Application des tarifs saisonniers
  const seasonalMultiplier = SEASONAL_TARIFFS[season]?.multiplier || 1.0
  basePrice *= seasonalMultiplier
  
  // Application des réductions spéciales
  if (visitorType && SPECIAL_TARIFFS[visitorType]) {
    const specialTariff = SPECIAL_TARIFFS[visitorType]
    
    // Vérification des conditions pour les réductions de groupe
    if (visitorType === 'GROUP' && groupSize >= specialTariff.minPeople) {
      basePrice *= (1 - specialTariff.discount)
    } else if (visitorType === 'FAMILY' && groupSize >= specialTariff.minPeople) {
      basePrice *= (1 - specialTariff.discount)
    } else if (visitorType !== 'GROUP' && visitorType !== 'FAMILY') {
      basePrice *= (1 - specialTariff.discount)
    }
  }
  
  return Math.round(basePrice * 100) / 100 // Arrondi à 2 décimales
}

// Obtenir tous les circuits disponibles
export const getAvailableCircuits = () => {
  return Object.values(CIRCUIT_TARIFFS).filter(circuit => circuit.available)
}

// Obtenir un circuit par ID
export const getCircuitById = (id) => {
  return Object.values(CIRCUIT_TARIFFS).find(circuit => circuit.id === id)
}

// Obtenir les tarifs spéciaux applicables
export const getApplicableSpecialTariffs = (visitorAge, groupSize, isStudent = false) => {
  const applicable = []
  
  if (visitorAge >= 3 && visitorAge <= 12) {
    applicable.push('CHILD')
  }
  
  if (visitorAge >= 65) {
    applicable.push('SENIOR')
  }
  
  if (isStudent) {
    applicable.push('STUDENT')
  }
  
  if (groupSize >= 10) {
    applicable.push('GROUP')
  }
  
  if (groupSize >= 4) {
    applicable.push('FAMILY')
  }
  
  return applicable
}

// Formatage des prix
export const formatPrice = (price, currency = 'EUR') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency
  }).format(price)
}

// Validation des tarifs
export const validateTariff = (circuitId, visitorType, season, groupSize) => {
  const circuit = getCircuitById(circuitId)
  if (!circuit) return { valid: false, error: 'Circuit invalide' }
  
  if (!circuit.available) return { valid: false, error: 'Circuit non disponible' }
  
  if (visitorType && !SPECIAL_TARIFFS[visitorType]) {
    return { valid: false, error: 'Type de visiteur invalide' }
  }
  
  if (season && !SEASONAL_TARIFFS[season]) {
    return { valid: false, error: 'Saison invalide' }
  }
  
  if (groupSize < 1) {
    return { valid: false, error: 'Taille de groupe invalide' }
  }
  
  return { valid: true }
}






