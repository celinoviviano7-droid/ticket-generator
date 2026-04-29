# 🚀 Backend e-Bracelet Anosiravo

Backend complet pour l'application e-Bracelet Anosiravo, système de gestion de tickets touristiques avec authentification et API REST.

## 📋 Table des Matières

- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [API Endpoints](#-api-endpoints)
- [Base de Données](#-base-de-données)
- [Authentification](#-authentification)
- [Déploiement](#-déploiement)

## ✨ Fonctionnalités

### 🔐 **Authentification & Sécurité**
- Système de connexion JWT
- Gestion des rôles utilisateur
- Middleware d'authentification
- Rate limiting et protection CORS

### 🎫 **Gestion des Tickets**
- Création automatique de tickets
- Génération de codes-barres uniques
- Validation et scan de tickets
- Gestion des statuts (actif, utilisé, expiré, annulé)

### 👥 **Gestion des Visiteurs**
- Enregistrement des visiteurs
- Profils multiples (adulte, enfant, bébé)
- Circuits touristiques avec tarifs
- Historique des visites

### 📊 **Statistiques & Rapports**
- Tableau de bord en temps réel
- Statistiques des circuits
- Rapports de revenus
- Analyse des tendances

### 🔍 **Scanner & Validation**
- API de validation des tickets
- Historique des scans
- Gestion des événements de scan
- Support multi-appareils

### 💬 **Chat & Support**
- Sessions de chat en temps réel
- Support WebSocket
- Historique des conversations
- Intégration LLM (optionnel)

## 🏗️ Architecture

```
backend/
├── config/           # Configuration base de données
├── controllers/      # Contrôleurs métier
├── middleware/       # Middleware (auth, validation)
├── models/          # Modèles de données
├── routes/          # Définition des routes API
├── services/        # Services métier
├── constants/       # Constantes partagées
├── scripts/         # Scripts de migration
├── utils/           # Utilitaires
├── server.js        # Point d'entrée principal
└── package.json     # Dépendances
```

## 🚀 Installation

### Prérequis
- Node.js >= 16.0.0
- npm ou yarn
- SQLite3

### Étapes d'installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd backend
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer l'environnement**
```bash
cp env.example .env
# Éditer .env avec vos configurations
```

4. **Initialiser la base de données**
```bash
npm run migrate
```

5. **Démarrer le serveur**
```bash
# Développement
npm run dev

# Production
npm start
```

## ⚙️ Configuration

### Variables d'environnement

```env
# Serveur
PORT=5000
NODE_ENV=development

# Base de données
DB_PATH=./database/anosiravo.db

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Sécurité
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 🔌 API Endpoints

### 🔓 **Routes Publiques (Kiosque)**

#### **Création de Ticket**
```http
POST /api/tickets/create
Content-Type: application/json

{
  "first_name": "Jean",
  "last_name": "Dupont",
  "email": "jean.dupont@example.com",
  "phone": "+261 34 12 345 67",
  "country": "France",
  "circuit": "nord",
  "profile": "adulte",
  "amount": 150000
}
```

#### **Validation de Ticket**
```http
POST /api/tickets/validate
Content-Type: application/json

{
  "barcode": "ANOS123456789ABCDEF"
}
```

#### **Consultation par Code-barres**
```http
GET /api/tickets/barcode/:barcode
```

### 🔒 **Routes Protégées (Administration)**

#### **Liste des Tickets**
```http
GET /api/tickets?page=1&limit=20&status=active
Authorization: Bearer <JWT_TOKEN>
```

#### **Statistiques**
```http
GET /api/tickets/stats
Authorization: Bearer <JWT_TOKEN>
```

#### **Mise à jour de Statut**
```http
PATCH /api/tickets/:id/status
Authorization: Bearer <JWT_TOKEN>

{
  "status": "used"
}
```

## 🗄️ Base de Données

### Tables Principales

#### **visitors**
- Informations des visiteurs
- Profils et circuits choisis
- Historique des visites

#### **tickets**
- Tickets générés
- Codes-barres uniques
- Statuts et validations

#### **scan_events**
- Historique des scans
- Données de validation
- Informations de localisation

#### **users**
- Utilisateurs administrateurs
- Rôles et permissions
- Sessions de connexion

#### **statistics**
- Statistiques quotidiennes
- Métriques de performance
- Rapports de revenus

## 🔐 Authentification

### Connexion
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@anosiravo.mg",
  "password": "admin123"
}
```

### Utilisation du Token
```http
Authorization: Bearer <JWT_TOKEN>
```

### Rôles Disponibles
- **admin** : Accès complet
- **user** : Accès limité
- **viewer** : Lecture seule

## 📊 Modèles de Données

### Visitor
```javascript
{
  id: 1,
  uuid: "uuid-v4",
  first_name: "Jean",
  last_name: "Dupont",
  email: "jean.dupont@example.com",
  phone: "+261 34 12 345 67",
  country: "France",
  circuit: "nord",
  profile: "adulte",
  amount: 150000,
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z"
}
```

### Ticket
```javascript
{
  id: 1,
  uuid: "uuid-v4",
  visitor_id: 1,
  barcode: "ANOS123456789ABCDEF",
  qr_code: "data:image/png;base64,...",
  status: "active",
  issued_at: "2024-01-01T00:00:00.000Z",
  expires_at: "2024-02-01T00:00:00.000Z",
  visitor: { /* Données du visiteur */ }
}
```

## 🚀 Déploiement

### Production
```bash
# Build
npm run build

# Démarrage
npm start

# Variables d'environnement
NODE_ENV=production
PORT=5000
JWT_SECRET=<secret-production>
```

### Docker (optionnel)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests avec couverture
npm run test:coverage

# Tests d'intégration
npm run test:integration
```

## 📝 Logs

### Niveaux de Log
- **ERROR** : Erreurs critiques
- **WARN** : Avertissements
- **INFO** : Informations générales
- **DEBUG** : Détails de débogage

### Format des Logs
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "level": "INFO",
  "message": "Ticket créé avec succès",
  "ticket_id": 123,
  "visitor_email": "jean.dupont@example.com"
}
```

## 🔧 Maintenance

### Sauvegarde
```bash
# Sauvegarde de la base
cp database/anosiravo.db backup/anosiravo_$(date +%Y%m%d).db
```

### Mise à jour
```bash
# Mise à jour des dépendances
npm update

# Vérification de sécurité
npm audit

# Correction automatique
npm audit fix
```

## 📞 Support

### Contact
- **Email** : support@anosiravo.mg
- **Documentation** : [docs.anosiravo.mg](https://docs.anosiravo.mg)
- **Issues** : [GitHub Issues](https://github.com/anosiravo/e-bracelet/issues)

### Développement
- **API Documentation** : `/api/docs` (Swagger)
- **Health Check** : `/health`
- **Metrics** : `/metrics` (Prometheus)

---

## 🎯 Roadmap

### Phase 1 ✅
- [x] API de base
- [x] Authentification JWT
- [x] Gestion des tickets
- [x] Base de données SQLite

### Phase 2 🚧
- [ ] Intégration LLM
- [ ] Notifications push
- [ ] API mobile
- [ ] Cache Redis

### Phase 3 📋
- [ ] Microservices
- [ ] Kubernetes
- [ ] Monitoring avancé
- [ ] IA/ML

---

**Développé avec ❤️ par l'équipe Anosiravo**





