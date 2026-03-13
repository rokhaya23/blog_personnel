import { createContext, useContext, useState } from "react"

const MOCK_USERS = [
  {
    id: "1",
    fullName: "Lyliane Damado",
    username: "lyliane_d",
    password: "password123",
  },
  {
    id: "2",
    fullName: "Rokhaye Beye",
    username: "rokhaye_b",
    password: "password123",
  },
  {
    id: "3",
    fullName: "Amadou Diallo",
    username: "amadou_d",
    password: "password123",
  },
]

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState(MOCK_USERS)

  const login = (username, password) => {
    const user = users.find(
      (u) => u.username === username && u.password === password
    )

    if (user) {
      setCurrentUser(user)
      return { success: true, user }
    }

    return {
      success: false,
      message: "Nom d'utilisateur ou mot de passe incorrect",
    }
  }

  const register = (fullName, username, password) => {
    const existingUser = users.find((u) => u.username === username)

    if (existingUser) {
      return {
        success: false,
        message: "Ce nom d'utilisateur est deja pris",
      }
    }

    const newUser = {
      id: String(users.length + 1),
      fullName,
      username,
      password,
    }

    setUsers([...users, newUser])
    setCurrentUser(newUser)

    return { success: true, user: newUser }
  }

  const logout = () => {
    setCurrentUser(null)
  }

  const value = {
    currentUser,
    users,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth doit etre utilise dans un AuthProvider")
  }
  return context
}