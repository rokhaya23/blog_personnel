import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { ThemeProvider, useTheme } from "./context/ThemeContext"
import { ToastProvider } from "./components/Layout/Toast"
import { FriendProvider } from "./context/FriendContext"
import Login from "./components/Auth/Login"
import Register from "./components/Auth/Register"
import Dashboard from "./components/Dashboard/Dashboard"
import ProtectedRoute from "./components/Layout/ProtectedRoute"
import UserProfile from "./components/Profile/UserProfile"
import LandingPage from "./components/Landing/LandingPage"
import AdminPage from "./components/Admin/AdminPage"

// Composant qui applique la classe de thème sur le body
function ThemeWrapper({ children }) {
  const { theme } = useTheme()
  // On applique la classe directement sur le div racine
  return (
    <div className={`theme-${theme}`}>
      {children}
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <FriendProvider>
            <ThemeWrapper>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/admin/monitoring" element={<AdminPage />} />
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
            </ThemeWrapper>
          </FriendProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App