import { useFriends } from "../../context/FriendContext"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../../context/ThemeContext"

function FriendsList() {
  // On récupère les données et fonctions du contexte
  // Pas besoin de useState ici — les données viennent du contexte
  const { amis, supprimerAmi, bloquerUser } = useFriends()
  const { isDark } = useTheme()
  const navigate = useNavigate()


  const handleSupprimer = async (amiId) => {
    if (!confirm("Supprimer cet ami ?")) return
    const result = await supprimerAmi(amiId)
    if (!result.success) alert(result.message)
  }

  const handleBloquer = async (amiId) => {
    if (!confirm("Bloquer cet utilisateur ? Il ne pourra plus voir tes articles.")) return
    const result = await bloquerUser(amiId)
    if (!result.success) alert(result.message)
  }

  const titleClass = isDark ? "text-white" : "text-slate-800"
  const countClass = isDark ? "text-purple-300/50" : "text-violet-800/55"
  const emptyPrimary = isDark ? "text-purple-200/60" : "text-violet-900/70"
  const emptySecondary = isDark ? "text-purple-300/40" : "text-violet-800/55"
  const cardClass = isDark
    ? "bg-white/5 border-white/10"
    : "bg-white/90 border-violet-200/70 shadow-sm hover:shadow-[0_14px_28px_rgba(76,29,149,0.08)]"
  const avatarClass = isDark
    ? "bg-purple-600/40 text-purple-200"
    : "bg-violet-100 text-violet-800"
  const nameClass = isDark ? "text-white" : "text-slate-800"
  const usernameClass = isDark ? "text-purple-300/60" : "text-violet-900/55"
  const removeButton = isDark
    ? "bg-white/10 hover:bg-white/20 text-purple-200"
    : "bg-white hover:bg-violet-50 text-violet-900 border border-violet-200"
  const blockButton = isDark
    ? "bg-red-500/20 hover:bg-red-500/30 text-red-400"
    : "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"

  return (
    <div>
      <h2 className={`text-2xl font-bold mb-6 ${titleClass}`}>
        Mes amis
        <span className={`text-lg ml-2 ${countClass}`}>({amis.length})</span>
      </h2>

      {amis.length === 0 ? (
        <div className="text-center py-16">
          <p className={`text-lg mb-2 ${emptyPrimary}`}>
            Tu n'as pas encore d'amis
          </p>
          <p className={emptySecondary}>
            Utilise la barre de recherche en haut pour en ajouter !
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {amis.map(ami => (
            <div
              key={ami._id}
              className={`flex justify-between items-center px-4 py-3 border rounded-xl transition ${cardClass}`}
            >
              {/* Avatar + infos */}
              <button
                onClick={() => navigate(`/profile/${ami._id}`)}
                className="flex items-center gap-3 text-left hover:opacity-80 transition flex-1"
              >
                {/* Avatar avec photo si disponible */}
                {ami.avatar ? (
                  <img
                    src={`http://localhost:5000/api/auth/avatar/${ami.avatar}`}
                    alt={ami.full_name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-purple-500 flex-shrink-0"
                  />
                ) : (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${avatarClass}`}>
                    {ami.full_name?.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className={`text-sm font-medium hover:underline ${nameClass}`}>
                    {ami.full_name}
                  </div>
                  <div className={`text-xs flex items-center gap-1 ${usernameClass}`}>
                    @{ami.username}
                    {ami.is_online && (
                      <span className="flex items-center gap-1 text-green-400 ml-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
                        en ligne
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {/* Boutons actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleSupprimer(ami._id)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition ${removeButton}`}
                >
                  Supprimer
                </button>
                <button
                  onClick={() => handleBloquer(ami._id)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition ${blockButton}`}
                >
                  Bloquer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FriendsList
