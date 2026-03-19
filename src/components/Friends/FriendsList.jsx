import { useNavigate } from "react-router-dom"
import { useFriends } from "../../context/FriendContext"
import { useTheme } from "../../context/ThemeContext"

function FriendsList() {
  const { amis, supprimerAmi, bloquerUser, bloques, debloquerUser } = useFriends()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const handleSupprimer = async (amiId) => {
    if (!confirm("Supprimer cet ami ?")) return
    const result = await supprimerAmi(amiId)
    if (!result.success) alert(result.message)
  }

  const handleBloquer = async (amiId) => {
    if (!confirm("Bloquer cet utilisateur ?")) return
    const result = await bloquerUser(amiId)
    if (!result.success) alert(result.message)
  }

  const handleDebloquer = async (userId) => {
    if (!confirm("Débloquer cet utilisateur ?")) return
    const result = await debloquerUser(userId)
    if (!result.success) alert(result.message)
  }

  const titleClass     = isDark ? "text-white" : "text-slate-800"
  const countClass     = isDark ? "text-purple-300/50" : "text-violet-800/55"
  const emptyPrimary   = isDark ? "text-purple-200/60" : "text-violet-900/70"
  const emptySecondary = isDark ? "text-purple-300/40" : "text-violet-800/55"
  const cardClass      = isDark ? "bg-white/5 border-white/10" : "bg-white/90 border-violet-200/70 shadow-sm"
  const avatarClass    = isDark ? "bg-purple-600/40 text-purple-200" : "bg-violet-100 text-violet-800"
  const nameClass      = isDark ? "text-white" : "text-slate-800"
  const usernameClass  = isDark ? "text-purple-300/60" : "text-violet-900/55"
  const removeButton   = isDark ? "bg-white/10 hover:bg-white/20 text-purple-200" : "bg-white hover:bg-violet-50 text-violet-900 border border-violet-200"
  const blockButton    = isDark ? "bg-red-500/20 hover:bg-red-500/30 text-red-400" : "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
  const sectionBorder  = isDark ? "border-white/10" : "border-violet-200/70"

  return (
    <div>

      {/* ══ MES AMIS ══ */}
      <h2 className={`text-2xl font-bold mb-6 ${titleClass}`}>
        Mes amis
        <span className={`text-lg ml-2 ${countClass}`}>({amis.length})</span>
      </h2>

      {amis.length === 0 ? (
        <div className="text-center py-12">
          <p className={`text-lg mb-2 ${emptyPrimary}`}>Tu n'as pas encore d'amis</p>
          <p className={emptySecondary}>Utilise la barre de recherche en haut pour en ajouter !</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 mb-10">
          {amis.map(ami => (
            <div key={ami._id} className={`flex justify-between items-center px-4 py-3 border rounded-xl transition ${cardClass}`}>
              <button
                onClick={() => navigate(`/profile/${ami._id}`)}
                className="flex items-center gap-3 text-left hover:opacity-80 transition flex-1"
              >
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
                  <div className={`text-sm font-medium hover:underline ${nameClass}`}>{ami.full_name}</div>
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
              <div className="flex gap-2">
                <button onClick={() => navigate(`/profile/${ami._id}`)} className={`text-xs px-3 py-1.5 rounded-lg transition ${removeButton}`}>Voir profil</button>
                <button onClick={() => handleSupprimer(ami._id)} className={`text-xs px-3 py-1.5 rounded-lg transition ${removeButton}`}>Supprimer</button>
                <button onClick={() => handleBloquer(ami._id)} className={`text-xs px-3 py-1.5 rounded-lg transition ${blockButton}`}>Bloquer</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══ UTILISATEURS BLOQUÉS ══ */}
      {bloques?.length > 0 && (
        <div className={`border-t pt-8 ${sectionBorder}`}>
          <h2 className={`text-xl font-bold mb-1 ${titleClass}`}>
            Utilisateurs bloqués
            <span className={`text-lg ml-2 ${countClass}`}>({bloques.length})</span>
          </h2>
          <p className={`text-sm mb-6 ${emptySecondary}`}>
            Ces utilisateurs ne peuvent plus voir vos articles ni vous contacter.
          </p>

          <div className="flex flex-col gap-3">
            {bloques.map(bloque => (
              <div key={bloque._id} className={`flex justify-between items-center px-4 py-3 border rounded-xl ${isDark ? "bg-red-500/5 border-red-500/20" : "bg-red-50/50 border-red-200/70"}`}>
                <div className="flex items-center gap-3">
                  {bloque.avatar ? (
                    <img
                      src={`http://localhost:5000/api/auth/avatar/${bloque.avatar}`}
                      alt={bloque.full_name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-red-400/50 flex-shrink-0 opacity-70"
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 opacity-70 ${isDark ? "bg-red-500/20 text-red-300" : "bg-red-100 text-red-600"}`}>
                      {bloque.full_name?.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className={`text-sm font-medium ${isDark ? "text-red-300/80" : "text-red-700"}`}>
                      {bloque.full_name}
                    </div>
                    <div className={`text-xs ${isDark ? "text-red-400/60" : "text-red-500/70"}`}>
                      @{bloque.username} · bloqué
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDebloquer(bloque._id)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition ${removeButton}`}
                >
                  Débloquer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FriendsList