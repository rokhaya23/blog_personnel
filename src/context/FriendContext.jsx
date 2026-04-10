import { createContext, useContext, useState, useEffect, useCallback } from "react"
import api from "../services/api"
import { useAuth } from "./AuthContext"

const FriendContext = createContext(null)

export function FriendProvider({ children }) {
  const { currentUser } = useAuth()

  const [amis,     setAmis]     = useState([])
  const [demandes, setDemandes] = useState([])
  const [bloques, setBloques] = useState([])
  const [pendingSent, setPendingSent] = useState([])


  // ════════════════════════════════
  // RECHARGER MANUELLEMENT
  // ════════════════════════════════
  const chargerAmis = useCallback(async () => {
    if (!currentUser) {
      setAmis([])
      return
    }
    try {
      const res = await api.get("/friends")
      setAmis(res.data.amis || [])
    } catch (err) {
      console.error("Erreur chargement amis :", err)
    }
  }, [currentUser])

  const chargerDemandes = useCallback(async () => {
    if (!currentUser) {
      setDemandes([])
      return
    }
    try {
      const res = await api.get("/friends/requests")
      setDemandes(res.data.demandes || [])
    } catch (err) {
      console.error("Erreur chargement demandes :", err)
    }
  }, [currentUser])

  const chargerPendingSent = useCallback(async () => {
    if (!currentUser) {
      setPendingSent([])
      return
    }
    try {
      const res = await api.get("/friends/pending-sent")
      setPendingSent(res.data.pending || [])
    } catch (err) {
      console.error("Erreur chargement demandes envoyées :", err)
    }
  }, [currentUser])

  // ════════════════════════════════
  // CHARGER AU DÉMARRAGE
  // ════════════════════════════════

  const chargerBloques = useCallback(async () => {
  if (!currentUser) {
    setBloques([])
    return
  }
  try {
    const res = await api.get("/friends/blocked")
    setBloques(res.data.bloques || [])
  } catch (err) {
    console.error("Erreur chargement bloqués :", err)
  }
  }, [currentUser])


  useEffect(() => {
    if (!currentUser) {
      setAmis([])
      setDemandes([])
      setBloques([])
      setPendingSent([])
      return
    }

    chargerAmis()
    chargerDemandes()
    chargerBloques()
    chargerPendingSent()
  }, [currentUser, chargerAmis, chargerDemandes, chargerBloques, chargerPendingSent])

  // ════════════════════════════════
  // RECHERCHER UN UTILISATEUR
  // ════════════════════════════════
  const rechercherUsers = useCallback(async (query) => {
    try {
      const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`)
      return res.data.users || []
    } catch (err) {
      console.error("Erreur recherche :", err)
      return []
    }
  }, [])

  // ════════════════════════════════
  // ENVOYER UNE DEMANDE D'AMI
  // ════════════════════════════════
  const envoyerDemande = useCallback(async (receiverId) => {
    try {
      await api.post("/friends/request", { receiver_id: receiverId })
      await chargerPendingSent()
      return { success: true }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Erreur"
      }
    }
  }, [chargerPendingSent])

  // ════════════════════════════════
  // ACCEPTER UNE DEMANDE
  // ════════════════════════════════
  const accepterDemande = useCallback(async (senderId) => {
    try {
      await api.put("/friends/accept", { sender_id: senderId })
      setDemandes(prev => prev.filter(d => d.sender_id !== senderId))
      await chargerAmis()
      await chargerPendingSent()
      return { success: true }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Erreur"
      }
    }
  }, [chargerAmis, chargerPendingSent])

  // ════════════════════════════════
  // REFUSER UNE DEMANDE
  // ════════════════════════════════
  const refuserDemande = useCallback(async (senderId) => {
    try {
      await api.put("/friends/decline", { sender_id: senderId })
      setDemandes(prev => prev.filter(d => d.sender_id !== senderId))
      await chargerPendingSent()
      return { success: true }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Erreur"
      }
    }
  }, [chargerPendingSent])

  // ════════════════════════════════
  // SUPPRIMER UN AMI
  // ════════════════════════════════
  const supprimerAmi = useCallback(async (amiId) => {
    try {
      await api.delete(`/friends/${amiId}`)
      setAmis(prev => prev.filter(a => a._id !== amiId))
      return { success: true }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Erreur"
      }
    }
  }, [])

  // ════════════════════════════════
  // BLOQUER UN UTILISATEUR
  // ════════════════════════════════
  const bloquerUser = useCallback(async (userId) => {
    try {
      await api.put(`/friends/${userId}/block`)
      setAmis(prev => prev.filter(a => a._id !== userId))
      await chargerBloques()
      return { success: true }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Erreur"
      }
    }
  }, [chargerBloques])

  const debloquerUser = useCallback(async (userId) => {
  try {
    await api.delete(`/friends/${userId}/block`)
    // Retirer de la liste des bloqués localement
    setBloques(prev => prev.filter(b => b._id !== userId))
    return { success: true }
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || "Erreur"
    }
  }
}, [])

  // ════════════════════════════════
  // ANNULER UNE DEMANDE ENVOYÉE
  // ════════════════════════════════
  const annulerDemande = useCallback(async (receiverId) => {
    try {
      await api.delete(`/friends/request/${receiverId}`)
      setPendingSent(prev => prev.filter(p => p.receiver_id !== receiverId))
      return { success: true }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Erreur"
      }
    }
  }, [])

  const value = {
    amis,
    demandes,
    bloques,
    pendingSent,
    chargerAmis,
    chargerDemandes,
    chargerBloques,
    chargerPendingSent,
    rechercherUsers,
    envoyerDemande,
    accepterDemande,
    refuserDemande,
    supprimerAmi,
    bloquerUser,
    debloquerUser,
    annulerDemande,
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
