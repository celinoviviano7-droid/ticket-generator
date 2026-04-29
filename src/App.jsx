import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/ui/Navbar'
import LoginPage from './pages/LoginPage'
import KioskPage from './pages/KioskPage'
import DashboardPage from './pages/DashboardPage'
import ScannerPage from './pages/ScannerPage'
import ChatPage from './pages/ChatPage'
import BackgroundCarousel from './components/BackgroundCarousel';
import './App.css'

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BackgroundCarousel />
        <Navbar />
        <div className="app-content">
                     <Routes>
             {/* Page de connexion comme page d'accueil */}
             <Route path="/" element={
               <ProtectedRoute requireAuth={false}>
                 <LoginPage />
               </ProtectedRoute>
             } />
             
             {/* Page kiosque accessible après connexion */}
             <Route path="/kiosque" element={
               <ProtectedRoute>
                 <KioskPage />
               </ProtectedRoute>
             } />
             
             {/* Pages protégées nécessitant une authentification */}
             <Route path="/dashboard" element={
               <ProtectedRoute>
                 <DashboardPage />
               </ProtectedRoute>
             } />
             <Route path="/scanner" element={
               <ProtectedRoute>
                 <ScannerPage />
               </ProtectedRoute>
             } />
             <Route path="/chat" element={
               <ProtectedRoute>
                 <ChatPage />
               </ProtectedRoute>
             } />
           </Routes>
        </div>
        <Toaster position="top-right" />
      </div>
    </AuthProvider>
  )
}

export default App
