# 🎫 e-Bracelet Anosiravo - Application de Gestion de Tickets Touristiques

## 📋 Description

L'application **e-Bracelet Anosiravo** est une solution complète de gestion de tickets touristiques pour les circuits de visite. Elle permet de créer, gérer et scanner des tickets avec codes-barres, tout en offrant un tableau de bord complet pour le suivi des visiteurs et des statistiques.

## 🚀 Fonctionnalités Principales

### 🔐 Authentification
- Système de connexion sécurisé avec JWT
- Gestion des rôles utilisateur (admin, utilisateur)
- Protection des routes sensibles

### 🎫 Gestion des Tickets
- Création de tickets avec codes-barres uniques
- Attribution automatique d'UUID
- Gestion des statuts (actif, utilisé, expiré, annulé)
- Génération de PDF pour impression

### 👥 Gestion des Visiteurs
- Enregistrement des informations personnelles
- Support multi-pays avec drapeaux
- Historique des visites par circuit

### 📱 Scanner de Codes-Barres
- Scan en temps réel via caméra
- Support des appareils mobiles
- Historique des scans avec horodatage
- Validation automatique des tickets

### 📊 Tableau de Bord
- Vue d'ensemble des statistiques
- Graphiques de performance
- Filtres et recherche avancée
- Export des données

## 🛠️ Technologies Utilisées

### Frontend
- **React 18** - Interface utilisateur moderne
- **Vite** - Build tool rapide
- **React Router** - Navigation entre pages
- **React Hook Form** - Gestion des formulaires
- **CSS Modules** - Styles modulaires et responsifs

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **SQLite3** - Base de données légère
- **JWT** - Authentification sécurisée
- **bcryptjs** - Hashage des mots de passe

### Bibliothèques Spécialisées
- **jsbarcode** - Génération de codes-barres
- **jspdf** - Création de PDF
- **Quagga** - Scanner de codes-barres
- **Socket.io** - Communication temps réel

## 📦 Installation et Configuration

### Prérequis
- Node.js 16+ 
- npm ou yarn
- Navigateur moderne avec support WebRTC

### 1. Cloner le Repository
```bash
git clone <repository-url>
cd e-bracelet-anosiravo
```

### 2. Installer les Dépendances
```bash
# Installer les dépendances du backend
cd backend
npm install

# Installer les dépendances du frontend
cd ../frontend
npm install
```

### 3. Configuration de la Base de Données
```bash
cd backend
npm run migrate
npm run seed
```

### 4. Démarrer l'Application
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🔧 Configuration

### Variables d'Environnement
Créez un fichier `.env` dans le dossier `backend` :

```env
# Configuration du serveur
PORT=5000
NODE_ENV=development

# Configuration de la base de données
DB_PATH=./database/anosiravo.db

# Configuration JWT
JWT_SECRET=votre_secret_jwt_super_securise
JWT_EXPIRES_IN=24h

# Configuration de sécurité
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=100
```

### Configuration de l'API
Modifiez `src/config/config.js` pour changer les URLs de l'API :

```javascript
export const config = {
  api: {
    baseURL: 'http://localhost:5000', // Changez selon votre environnement
    // ... autres configurations
  }
}
```

## 🎯 Utilisation

### 1. Connexion
- Ouvrez l'application dans votre navigateur
- Connectez-vous avec les identifiants par défaut :
  - **Email** : `admin@anosiravo.mg`
  - **Mot de passe** : `admin123`

### 2. Création de Tickets
- Allez dans la section "Kiosque"
- Remplissez le formulaire avec les informations du visiteur
- Sélectionnez le circuit souhaité
- Générez et imprimez le ticket

### 3. Scanner des Tickets
- Utilisez la section "Scanner" avec votre caméra
- Pointez vers le code-barres du ticket
- L'application valide automatiquement le ticket

### 4. Tableau de Bord
- Consultez les statistiques en temps réel
- Filtrez les données par date, statut, circuit
- Exportez les rapports selon vos besoins

## 📱 Support Mobile

L'application est entièrement responsive et optimisée pour :
- **Smartphones Android** - Scanner de codes-barres natif
- **Tablettes** - Interface adaptée aux écrans tactiles
- **Ordinateurs** - Gestion complète via navigateur

## 🔒 Sécurité

- **JWT** avec expiration automatique
- **Validation** des données côté serveur
- **Rate limiting** pour prévenir les abus
- **CORS** configuré pour la production
- **Helmet** pour la sécurité des en-têtes HTTP

## 📊 Structure de la Base de Données

### Tables Principales
- **users** - Utilisateurs de l'application
- **visitors** - Informations des visiteurs
- **tickets** - Tickets générés
- **scans** - Historique des scans
- **circuits** - Circuits touristiques disponibles

## 🚀 Déploiement

### Production
```bash
# Build du frontend
cd frontend
npm run build

# Démarrer le backend en production
cd backend
NODE_ENV=production npm start
```

### Docker (Optionnel)
```bash
docker-compose up -d
```

## 🐛 Dépannage

### Problèmes Courants

#### 1. Erreur "Token d'authentification manquant"
- Vérifiez que vous êtes connecté
- Effacez le cache du navigateur
- Vérifiez que le backend fonctionne

#### 2. Caméra non accessible
- Autorisez l'accès à la caméra dans le navigateur
- Vérifiez que votre appareil supporte WebRTC
- Testez sur HTTPS en production

#### 3. Erreur de base de données
- Vérifiez que SQLite est installé
- Relancez les migrations : `npm run migrate`
- Vérifiez les permissions du dossier database

### Logs et Debug
```bash
# Backend
cd backend
npm run dev  # Mode développement avec logs détaillés

# Frontend
cd frontend
npm run dev  # Mode développement avec hot reload
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Contactez l'équipe de développement
- Consultez la documentation technique

## 🔮 Roadmap

### Version 2.0
- [ ] Support multi-langues
- [ ] API REST complète
- [ ] Intégration avec systèmes de paiement
- [ ] Application mobile native

### Version 1.1
- [ ] Notifications push
- [ ] Rapports avancés
- [ ] Intégration avec calendriers
- [ ] Support des QR codes

---

**Développé avec ❤️ pour l'industrie touristique malgache**


