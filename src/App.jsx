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

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <FriendProvider>
          <BrowserRouter>
            <Routes>
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
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </FriendProvider>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App