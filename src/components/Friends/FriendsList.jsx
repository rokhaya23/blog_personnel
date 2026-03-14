import { useFriends } from "../../context/FriendContext"

function FriendsList() {
  // On récupère les données et fonctions du contexte
  // Pas besoin de useState ici — les données viennent du contexte
  const { amis, supprimerAmi, bloquerUser } = useFriends()

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

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">
        Mes amis
        <span className="text-purple-300/50 text-lg ml-2">({amis.length})</span>
      </h2>

      {amis.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-purple-200/60 text-lg mb-2">
            Tu n'as pas encore d'amis
          </p>
          <p className="text-purple-300/40">
            Utilise la barre de recherche en haut pour en ajouter !
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {amis.map(ami => (
            <div
              key={ami._id}
              className="flex justify-between items-center px-4 py-3 bg-white/5 border border-white/10 rounded-xl"
            >
              {/* Avatar + infos */}
              <div className="flex items-center gap-3">
                {/* Cercle avec les initiales */}
                <div className="w-9 h-9 rounded-full bg-purple-600/40 flex items-center justify-center text-sm font-medium text-purple-200 flex-shrink-0">
                  {ami.full_name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    {ami.full_name}
                  </div>
                  <div className="text-xs text-purple-300/60 flex items-center gap-1">
                    @{ami.username}
                    {/* Point vert si en ligne */}
                    {ami.is_online && (
                      <span className="ml-1 flex items-center gap-1 text-green-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
                        en ligne
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Boutons actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleSupprimer(ami._id)}
                  className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 text-purple-200 rounded-lg transition"
                >
                  Supprimer
                </button>
                <button
                  onClick={() => handleBloquer(ami._id)}
                  className="text-xs px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
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