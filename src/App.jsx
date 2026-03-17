// ============================================================
// App.jsx — VERSION AVEC ADMIN SÉPARÉ
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { ToastProvider } from "./components/Layout/Toast"
import { FriendProvider } from "./context/FriendContext"
import Login from "./components/Auth/Login"
import Register from "./components/Auth/Register"
import Dashboard from "./components/Dashboard/Dashboard"
import ProtectedRoute from "./components/Layout/ProtectedRoute"
import UserProfile from "./components/Profile/UserProfile"
import LandingPage from "./components/Landing/LandingPage"
import AdminPage from "./components/Admin/AdminPage"

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <FriendProvider>
          <BrowserRouter>
            <Routes>
              {/* Pages publiques */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Admin — route séparée avec son propre login */}
              <Route path="/admin/monitoring" element={<AdminPage />} />

              {/* Pages protégées (utilisateurs connectés) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:userId"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />

              {/* Redirection par défaut */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </FriendProvider>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App