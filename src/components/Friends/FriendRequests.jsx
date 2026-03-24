import { useNavigate } from "react-router-dom"
import { useFriends } from "../../context/FriendContext"
import { useTheme } from "../../context/ThemeContext"

function FriendRequests() {
  const { demandes, accepterDemande, refuserDemande } = useFriends()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const handleAccepter = async (senderId) => {
    const result = await accepterDemande(senderId)
    if (!result.success) alert(result.message)
  }

  const handleRefuser = async (senderId) => {
    const result = await refuserDemande(senderId)
    if (!result.success) alert(result.message)
  }

  const titleClass = isDark ? "text-white" : "text-slate-800"
  const countClass = isDark ? "text-purple-300/50" : "text-violet-800/55"
  const emptyPrimary = isDark ? "text-purple-200/60" : "text-violet-900/70"
  const emptySecondary = isDark ? "text-purple-300/40" : "text-violet-800/55"
  const cardClass = isDark
    ? "bg-white/5 border-white/10"
    : "bg-white/90 border-violet-200/70 shadow-sm hover:shadow-[0_14px_28px_rgba(29,78,216,0.08)]"
  const avatarClass = isDark
    ? "bg-purple-600/40 text-purple-200"
    : "bg-violet-100 text-violet-800"
  const nameClass = isDark ? "text-white" : "text-slate-800"
  const usernameClass = isDark ? "text-purple-300/60" : "text-violet-900/55"
  const acceptButton = isDark
    ? "bg-slate-800 hover:bg-slate-700 text-white"
    : "bg-slate-900 hover:bg-slate-800 text-white"
  const rejectButton = isDark
    ? "bg-white/10 hover:bg-white/20 text-red-400"
    : "bg-white hover:bg-red-50 text-red-600 border border-red-200"

  return (
    <div>
      <h2 className={`text-2xl font-bold mb-6 ${titleClass}`}>
        Demandes reçues
        <span className={`text-lg ml-2 ${countClass}`}>({demandes.length})</span>
      </h2>

      {demandes.length === 0 ? (
        <div className="text-center py-16">
          <p className={`text-lg mb-2 ${emptyPrimary}`}>Aucune demande en attente</p>
          <p className={emptySecondary}>Les demandes d'amis apparaîtront ici</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {demandes.map(demande => (
            <div
              key={demande.sender_id}
              className={`flex justify-between items-center px-4 py-3 border rounded-xl transition ${cardClass}`}
            >
              {/* Infos — cliquable pour voir le profil */}
              <button
                onClick={() => navigate(`/profile/${demande.sender_id}`)}
                className="flex items-center gap-3 text-left hover:opacity-80 transition"
              >
                {demande.avatar ? (
                  <img
                    src={`http://localhost:5000/api/auth/avatar/${demande.avatar}`}
                    alt={demande.full_name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-purple-500 flex-shrink-0"
                  />
                ) : (
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${avatarClass}`}>
                    {demande.full_name?.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className={`text-sm font-medium hover:underline ${nameClass}`}>
                    {demande.full_name}
                  </div>
                  <div className={`text-xs ${usernameClass}`}>
                    @{demande.username} · veut vous ajouter
                  </div>
                </div>
              </button>

              {/* Boutons Accepter / Refuser */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleAccepter(demande.sender_id)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition ${acceptButton}`}
                >
                  Accepter
                </button>
                <button
                  onClick={() => handleRefuser(demande.sender_id)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition ${rejectButton}`}
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
