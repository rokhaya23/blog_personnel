import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { ArticleProvider } from "./context/ArticleContext"
import { CommentProvider } from "./context/CommentContext"
import { ReactionProvider } from "./context/ReactionContext"
import { StatusProvider } from "./context/StatusContext"
import Login from "./components/Auth/Login"
import Register from "./components/Auth/Register"
import Dashboard from "./components/Dashboard/Dashboard"
import ProtectedRoute from "./components/Layout/ProtectedRoute"

function App() {
  return (
    <AuthProvider>
      <StatusProvider>
        <ArticleProvider>
          <CommentProvider>
            <ReactionProvider>
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
            </ReactionProvider>
          </CommentProvider>
        </ArticleProvider>
      </StatusProvider>
    </AuthProvider>
  )
}

export default App