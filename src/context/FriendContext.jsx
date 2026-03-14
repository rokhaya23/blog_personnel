import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "./AuthContext"

const API = "http://localhost:5000/api"
const FriendContext = createContext(null)

export function FriendProvider({ children }) {
  const { currentUser } = useAuth()

  const [amis,     setAmis]     = useState([])
  const [demandes, setDemandes] = useState([])

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`
  })

  // ════════════════════════════════
  // CHARGER AU DÉMARRAGE
  // On définit les fonctions async DANS le useEffect
  // pour éviter l'erreur set-state-in-effect
  // ════════════════════════════════
  useEffect(() => {
    if (!currentUser) return

    const fetchAmis = async () => {
      try {
        const res = await axios.get(`${API}/friends`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
        setAmis(res.data.amis || [])
      } catch (err) {
        console.error("Erreur chargement amis :", err)
      }
    }

    const fetchDemandes = async () => {
      try {
        const res = await axios.get(`${API}/friends/requests`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
        setDemandes(res.data.demandes || [])
      } catch (err) {
        console.error("Erreur chargement demandes :", err)
      }
    }

    fetchAmis()
    fetchDemandes()

  }, [currentUser])
  // ↑ se relance uniquement quand currentUser change
  // (connexion / déconnexion)

  // ════════════════════════════════
  // RECHARGER MANUELLEMENT
  // Ces fonctions sont appelées après une action
  // ex: après accepter une demande → recharger les amis
  // ════════════════════════════════
  const chargerAmis = async () => {
    try {
      const res = await axios.get(`${API}/friends`, {
        headers: getHeaders()
      })
      setAmis(res.data.amis || [])
    } catch (err) {
      console.error("Erreur chargement amis :", err)
    }
  }

  const chargerDemandes = async () => {
    try {
      const res = await axios.get(`${API}/friends/requests`, {
        headers: getHeaders()
      })
      setDemandes(res.data.demandes || [])
    } catch (err) {
      console.error("Erreur chargement demandes :", err)
    }
  }

  // ════════════════════════════════
  // RECHERCHER UN UTILISATEUR
  // ════════════════════════════════
  const rechercherUsers = async (query) => {
    try {
      const res = await axios.get(`${API}/users/search?q=${query}`, {
        headers: getHeaders()
      })
      return res.data.users || []
    } catch (err) {
      console.error("Erreur recherche :", err)
      return []
    }
  }

  // ════════════════════════════════
  // ENVOYER UNE DEMANDE D'AMI
  // ════════════════════════════════
  const envoyerDemande = async (receiverId) => {
    try {
      await axios.post(
        `${API}/friends/request`,
        { receiver_id: receiverId },
        { headers: getHeaders() }
      )
      return { success: true }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Erreur"
      }
    }
  }

  // ════════════════════════════════
  // ACCEPTER UNE DEMANDE
  // ════════════════════════════════
  const accepterDemande = async (senderId) => {
    try {
      await axios.put(
        `${API}/friends/accept`,
        { sender_id: senderId },
        { headers: getHeaders() }
      )
      // Retirer la demande de la liste localement
      setDemandes(prev => prev.filter(d => d.sender_id !== senderId))
      // Recharger les amis pour avoir le nouveau
      await chargerAmis()
      return { success: true }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Erreur"
      }
    }
  }

  // ════════════════════════════════
  // REFUSER UNE DEMANDE
  // ════════════════════════════════
  const refuserDemande = async (senderId) => {
    try {
      await axios.put(
        `${API}/friends/decline`,
        { sender_id: senderId },
        { headers: getHeaders() }
      )
      setDemandes(prev => prev.filter(d => d.sender_id !== senderId))
      return { success: true }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Erreur"
      }
    }
  }

  // ════════════════════════════════
  // SUPPRIMER UN AMI
  // ════════════════════════════════
  const supprimerAmi = async (amiId) => {
    try {
      await axios.delete(`${API}/friends/${amiId}`, {
        headers: getHeaders()
      })
      setAmis(prev => prev.filter(a => a._id !== amiId))
      return { success: true }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Erreur"
      }
    }
  }

  // ════════════════════════════════
  // BLOQUER UN UTILISATEUR
  // ════════════════════════════════
  const bloquerUser = async (userId) => {
    try {
      await axios.put(
        `${API}/friends/${userId}/block`,
        {},
        { headers: getHeaders() }
      )
      setAmis(prev => prev.filter(a => a._id !== userId))
      return { success: true }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Erreur"
      }
    }
  }

  // ── Ce qu'on partage avec tous les composants enfants ──
  const value = {
    amis,
    demandes,
    chargerAmis,
    chargerDemandes,
    rechercherUsers,
    envoyerDemande,
    accepterDemande,
    refuserDemande,
    supprimerAmi,
    bloquerUser,
  }

  return (
    <FriendContext.Provider value={value}>
      {children}
    </FriendContext.Provider>
  )
}

export function useFriends() {
  const context = useContext(FriendContext)
  if (!context) {
    throw new Error("useFriends doit être utilisé dans un FriendProvider")
  }
  return context
}