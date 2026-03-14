// ============================================================
// App.jsx — VERSION AVEC TOASTS
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { ToastProvider } from "./components/Layout/Toast"
import Login from "./components/Auth/Login"
import Register from "./components/Auth/Register"
import Dashboard from "./components/Dashboard/Dashboard"
import ProtectedRoute from "./components/Layout/ProtectedRoute"
import { FriendProvider } from "./context/FriendContext"
import UserProfile from "./components/Profile/UserProfile"
import LandingPage from "./components/Landing/LandingPage"

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <FriendProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </FriendProvider>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App