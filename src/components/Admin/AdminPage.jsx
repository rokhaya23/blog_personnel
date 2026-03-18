import { useNavigate } from "react-router-dom"
import AdminLogin from "./AdminLogin"
import AdminMonitoring from "./AdminMonitoring"
import { useAuth } from "../../context/AuthContext"

function AdminPage() {
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()

  if (!currentUser) {
    return <AdminLogin />
  }

  if (!currentUser.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/20 text-center">
          <span className="text-4xl mb-4 block">🔒</span>
          <h1 className="text-2xl font-bold text-white mb-3">Acces refuse</h1>
          <p className="text-purple-200/80 text-sm mb-6">
            Votre compte est connecte, mais il ne dispose pas des droits administrateur.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
            >
              Retour au dashboard
            </button>
            <button
              onClick={async () => { await logout(); navigate("/admin/monitoring", { replace: true }) }}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-purple-200 font-semibold rounded-lg transition"
            >
              Se deconnecter
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <AdminMonitoring />
}

export default AdminPage
