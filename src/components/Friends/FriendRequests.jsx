import { useNavigate } from "react-router-dom"
import { useFriends } from "../../context/FriendContext"

function FriendRequests() {
  const { demandes, accepterDemande, refuserDemande } = useFriends()
  const navigate = useNavigate()

  const handleAccepter = async (senderId) => {
    const result = await accepterDemande(senderId)
    if (!result.success) alert(result.message)
  }

  const handleRefuser = async (senderId) => {
    const result = await refuserDemande(senderId)
    if (!result.success) alert(result.message)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">
        Demandes reçues
        <span className="text-purple-300/50 text-lg ml-2">({demandes.length})</span>
      </h2>

      {demandes.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-purple-200/60 text-lg mb-2">Aucune demande en attente</p>
          <p className="text-purple-300/40">Les demandes d'amis apparaîtront ici</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {demandes.map(demande => (
            <div
              key={demande.sender_id}
              className="flex justify-between items-center px-4 py-3 bg-white/5 border border-white/10 rounded-xl"
            >
              {/* Infos — cliquable pour voir le profil */}
              <button
                onClick={() => navigate(`/profile/${demande.sender_id}`)}
                className="flex items-center gap-3 text-left hover:opacity-80 transition"
              >
                <div className="w-9 h-9 rounded-full bg-purple-600/40 flex items-center justify-center text-sm font-medium text-purple-200 flex-shrink-0">
                  {demande.full_name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium text-white hover:underline">
                    {demande.full_name}
                  </div>
                  <div className="text-xs text-purple-300/60">
                    @{demande.username} · veut vous ajouter
                  </div>
                </div>
              </button>

              {/* Boutons Accepter / Refuser */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleAccepter(demande.sender_id)}
                  className="text-xs px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                >
                  Accepter
                </button>
                <button
                  onClick={() => handleRefuser(demande.sender_id)}
                  className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 text-red-400 rounded-lg transition"
                >
                  Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FriendRequests