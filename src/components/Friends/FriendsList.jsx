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
  const countClass     = isDark ? "text-blue-200/60" : "text-blue-800/60"
  const emptyPrimary   = isDark ? "text-blue-100/70" : "text-blue-900/70"
  const emptySecondary = isDark ? "text-blue-200/50" : "text-blue-800/55"
  const cardClass      = isDark ? "bg-white/5 border-white/10" : "bg-white/90 border-blue-200/70 shadow-sm"
  const avatarClass    = isDark ? "bg-blue-600/40 text-blue-100" : "bg-blue-100 text-blue-800"
  const nameClass      = isDark ? "text-white" : "text-slate-800"
  const usernameClass  = isDark ? "text-blue-200/60" : "text-blue-900/55"
  const removeButton   = isDark ? "bg-blue-700 hover:bg-blue-600 text-white border border-blue-600" : "bg-blue-700 hover:bg-blue-800 text-white border border-blue-800"
  const blockButton    = isDark ? "bg-slate-800 hover:bg-slate-700 text-white border border-slate-600" : "bg-slate-200 text-slate-900 hover:bg-slate-300 border border-slate-400"
  const sectionBorder  = isDark ? "border-white/10" : "border-blue-200/70"

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
          {amis.map(ami => (
            <div key={ami._id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 py-3 border rounded-xl transition ${cardClass}`}>
              <button
                onClick={() => navigate(`/profile/${ami._id}`)}
                className="flex items-center gap-3 text-left hover:opacity-80 transition flex-1"
              >
                {ami.avatar ? (
                  <img
                    src={`http://localhost:5000/api/auth/avatar/${ami.avatar}`}
                    alt={ami.full_name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-blue-500 flex-shrink-0"
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
                      <span className="flex items-center gap-1 text-blue-400 ml-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block"></span>
                        en ligne
                      </span>
                    )}
                  </div>
                </div>
              </button>
              <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
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
              <div key={bloque._id} className={`flex justify-between items-center px-4 py-3 border rounded-xl ${isDark ? "bg-slate-800/30 border-slate-600/40" : "bg-slate-100 border-slate-300"}`}>
                <div className="flex items-center gap-3">
                  {bloque.avatar ? (
                    <img
                      src={`http://localhost:5000/api/auth/avatar/${bloque.avatar}`}
                      alt={bloque.full_name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-blue-300/50 flex-shrink-0 opacity-70"
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 opacity-70 ${isDark ? "bg-slate-700/40 text-blue-200" : "bg-slate-200 text-slate-800"}`}>
                      {bloque.full_name?.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className={`text-sm font-medium ${isDark ? "text-blue-100" : "text-slate-800"}`}>
                      {bloque.full_name}
                    </div>
                    <div className={`text-xs ${isDark ? "text-blue-200/70" : "text-slate-600"}`}>
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
