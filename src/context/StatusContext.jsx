import { createContext, useContext, useState } from "react"

const MOCK_STATUSES = {
  "1": { isOnline: false, lastSeen: "2026-03-12T09:00:00" },
  "2": { isOnline: false, lastSeen: "2026-03-12T08:30:00" },
  "3": { isOnline: false, lastSeen: "2026-03-11T22:15:00" },
}

const StatusContext = createContext(null)

export function StatusProvider({ children }) {
  const [statuses, setStatuses] = useState(MOCK_STATUSES)

  const setOnline = (userId) => {
    setStatuses((prev) => ({
      ...prev,
      [userId]: {
        isOnline: true,
        lastSeen: new Date().toISOString(),
      },
    }))
  }

  const setOffline = (userId) => {
    setStatuses((prev) => ({
      ...prev,
      [userId]: {
        isOnline: false,
        lastSeen: new Date().toISOString(),
      },
    }))
  }

  const getStatus = (userId) => {
    return statuses[userId] || { isOnline: false, lastSeen: null }
  }

  const getLastSeenText = (userId) => {
    const status = getStatus(userId)

    if (status.isOnline) return "En ligne"
    if (!status.lastSeen) return "Jamais connecte"

    const now = new Date()
    const lastSeen = new Date(status.lastSeen)
    const diffInSeconds = Math.floor((now - lastSeen) / 1000)

    if (diffInSeconds < 60) return "Vu a l'instant"

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return `Vu il y a ${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""}`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `Vu il y a ${diffInHours} heure${diffInHours > 1 ? "s" : ""}`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return "Vu hier"
    if (diffInDays < 7) return `Vu il y a ${diffInDays} jours`

    return `Vu le ${lastSeen.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
    })}`
  }

  const value = {
    getStatus,
    getLastSeenText,
    setOnline,
    setOffline,
  }

  return (
    <StatusContext.Provider value={value}>
      {children}
    </StatusContext.Provider>
  )
}

export function useStatus() {
  const context = useContext(StatusContext)
  if (!context) {
    throw new Error("useStatus doit etre utilise dans un StatusProvider")
  }
  return context
}