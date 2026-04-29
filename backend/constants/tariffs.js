// Tarifs des circuits touristiques Anosiravo
const TARIFFS = {
  // Circuit Nord
  'nord': {
    name: 'Circuit Nord',
    description: 'Découverte des sites du nord de Madagascar',
    duration: '3 jours / 2 nuits',
    basePrice: 150000, // en Ariary
    currency: 'MGA',
    includes: [
      'Transport en véhicule climatisé',
      'Hébergement en hôtel 3 étoiles',
      'Repas (petit-déjeuner, déjeuner, dîner)',
      'Guide local francophone',
      'Entrées aux sites touristiques',
      'Assurance voyage'
    ],
    excludes: [
      'Boissons alcoolisées',
      'Pourboires',
      'Dépenses personnelles',
      'Vols internationaux'
    ],
    profiles: {
      'adulte': {
        name: 'Adulte',
        price: 150000,
        description: 'À partir de 12 ans'
      },
      'enfant': {
        name: 'Enfant',
        price: 75000,
        description: 'De 3 à 11 ans'
      },
      'bebe': {
        name: 'Bébé',
        price: 0,
        description: 'Moins de 3 ans'
      }
    }
  },

  // Circuit Sud
  'sud': {
    name: 'Circuit Sud',
    description: 'Exploration des merveilles du sud malgache',
    duration: '5 jours / 4 nuits',
    basePrice: 250000,
    currency: 'MGA',
    includes: [
      'Transport en véhicule 4x4',
      'Hébergement en lodge et hôtel',
      'Tous les repas',
      'Guide spécialisé',
      'Activités culturelles',
      'Assurance complète'
    ],
    excludes: [
      'Boissons',
      'Pourboires',
      'Dépenses personnelles',
      'Vols internationaux'
    ],
    profiles: {
      'adulte': {
        name: 'Adulte',
        price: 250000,
        description: 'À partir de 12 ans'
      },
      'enfant': {
        name: 'Enfant',
        price: 125000,
        description: 'De 3 à 11 ans'
      },
      'bebe': {
        name: 'Bébé',
        price: 0,
        description: 'Moins de 3 ans'
      }
    }
  },

  // Circuit Est
  'est': {
    name: 'Circuit Est',
    description: 'Aventure sur la côte est de Madagascar',
    duration: '4 jours / 3 nuits',
    basePrice: 200000,
    currency: 'MGA',
    includes: [
      'Transport en minibus',
      'Hébergement en hôtel de charme',
      'Repas traditionnels',
      'Guide local',
      'Visites guidées',
      'Assurance de base'
    ],
    excludes: [
      'Boissons',
      'Pourboires',
      'Dépenses personnelles',
      'Vols internationaux'
    ],
    profiles: {
      'adulte': {
        name: 'Adulte',
        price: 200000,
        description: 'À partir de 12 ans'
      },
      'enfant': {
        name: 'Enfant',
        price: 100000,
        description: 'De 3 à 11 ans'
      },
      'bebe': {
        name: 'Bébé',
        price: 0,
        description: 'Moins de 3 ans'
      }
    }
  },

  // Circuit Ouest
  'ouest': {
    name: 'Circuit Ouest',
    description: 'Découverte des trésors de l\'ouest',
    duration: '3 jours / 2 nuits',
    basePrice: 180000,
    currency: 'MGA',
    includes: [
      'Transport en bus confortable',
      'Hébergement en hôtel standard',
      'Repas locaux',
      'Guide accompagnateur',
      'Entrées aux sites',
      'Assurance voyage'
    ],
    excludes: [
      'Boissons',
      'Pourboires',
      'Dépenses personnelles',
      'Vols internationaux'
    ],
    profiles: {
      'adulte': {
        name: 'Adulte',
        price: 180000,
        description: 'À partir de 12 ans'
      },
      'enfant': {
        name: 'Enfant',
        price: 90000,
        description: 'De 3 à 11 ans'
      },
      'bebe': {
        name: 'Bébé',
        price: 0,
        description: 'Moins de 3 ans'
      }
    }
  },

  // Circuit Centre
  'centre': {
    name: 'Circuit Centre',
    description: 'Immersion au cœur de Madagascar',
    duration: '2 jours / 1 nuit',
    basePrice: 120000,
    currency: 'MGA',
    includes: [
      'Transport en taxi-brousse',
      'Hébergement en gîte',
      'Repas traditionnels',
      'Guide local',
      'Visites culturelles',
      'Assurance de base'
    ],
    excludes: [
      'Boissons',
      'Pourboires',
      'Dépenses personnelles',
      'Vols internationaux'
    ],
    profiles: {
      'adulte': {
        name: 'Adulte',
        price: 120000,
        description: 'À partir de 12 ans'
      },
      'enfant': {
        name: 'Enfant',
        price: 60000,
        description: 'De 3 à 11 ans'
      },
      'bebe': {
        name: 'Bébé',
        price: 0,
        description: 'Moins de 3 ans'
      }
    }
  }
};

// Fonction pour obtenir un tarif par circuit et profil
function getTariff(circuit, profile) {
  if (!TARIFFS[circuit]) {
    throw new Error(`Circuit '${circuit}' non trouvé`);
  }
  
  if (!TARIFFS[circuit].profiles[profile]) {
    throw new Error(`Profil '${profile}' non trouvé pour le circuit '${circuit}'`);
  }
  
  return TARIFFS[circuit].profiles[profile];
}

// Fonction pour obtenir tous les circuits
function getAllCircuits() {
  return Object.keys(TARIFFS).map(key => ({
    id: key,
    name: TARIFFS[key].name,
    description: TARIFFS[key].description,
    duration: TARIFFS[key].duration,
    basePrice: TARIFFS[key].basePrice,
    currency: TARIFFS[key].currency
  }));
}

// Fonction pour obtenir tous les profils d'un circuit
function getCircuitProfiles(circuit) {
  if (!TARIFFS[circuit]) {
    throw new Error(`Circuit '${circuit}' non trouvé`);
  }
  
  return TARIFFS[circuit].profiles;
}

// Fonction pour calculer le prix total
function calculateTotalPrice(circuit, profile, quantity = 1) {
  const tariff = getTariff(circuit, profile);
  return tariff.price * quantity;
}

// Fonction pour formater le prix
function formatPrice(price, currency = 'MGA') {
  if (currency === 'MGA') {
    return new Intl.NumberFormat('fr-MG', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0
    }).format(price);
  }
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(price);
}

module.exports = {
  TARIFFS,
  getTariff,
  getAllCircuits,
  getCircuitProfiles,
  calculateTotalPrice,
  formatPrice
};





