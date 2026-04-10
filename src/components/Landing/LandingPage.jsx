import { useNavigate } from "react-router-dom"

const c = {
  blue: "#1d4ed8",
  blueDark: "#0b1d3a",
  blueSoft: "#e8f0ff",
  gray: "#f1f4f9",
  graySoft: "#eef2f6",
  text: "#0b1220",
  muted: "#4b5563",
  border: "#d7deea",
  shadow: "0 12px 28px rgba(11,29,58,0.12)",
  softShadow: "0 8px 18px rgba(11,29,58,0.08)",
  heroGradient: "linear-gradient(150deg, #f8fbff 0%, #dfe9ff 55%, #1d4ed8 100%)",
  ctaGradient: "linear-gradient(145deg, #0b1d3a 0%, #1d4ed8 70%)",
}

function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="font-sans min-h-screen" style={{ background: c.graySoft, color: c.text }}>

      {/* ══ NAVBAR ══ */}
      <nav className="bg-white sticky top-0 z-10 flex items-center justify-between px-4 md:px-12 py-4"
        style={{ borderBottom: `1px solid ${c.border}`, boxShadow: c.softShadow }}>
        <span className="font-bold text-2xl" style={{ color: c.text }}>DailyBlog</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/login")}
            className="text-sm font-medium px-3 py-2 hidden sm:block"
            style={{ color: c.muted }}
          >
            Connexion
          </button>
          <button
            onClick={() => navigate("/register")}
            className="text-sm font-bold px-4 py-2 rounded-lg text-white"
            style={{ background: c.blue, boxShadow: c.softShadow }}
          >
            Créer mon blog
          </button>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section className="flex items-center justify-center px-4 md:px-12 py-12 md:py-16"
        style={{ background: c.heroGradient, minHeight: "420px" }}>
        <div className="max-w-5xl w-full mx-auto flex flex-col md:flex-row items-center gap-10">

          {/* Texte */}
          <div className="flex-1 text-center md:text-left">
            <p className="text-xs uppercase tracking-widest font-semibold mb-3"
              style={{ color: "rgba(11,18,32,0.55)" }}>
              Blog personnel, simple et clair
            </p>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4"
              style={{ color: c.blueDark }}>
              Écrivez, partagez,<br className="hidden md:block"/> restez proche de vos amis.
            </h1>
            <p className="text-sm md:text-base leading-relaxed mb-6 max-w-md mx-auto md:mx-0"
              style={{ color: "rgba(11,18,32,0.65)" }}>
              Vous publiez, vos proches réagissent, tout simplement.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <button onClick={() => navigate("/register")}
                className="px-6 py-3 text-sm font-bold text-white rounded-lg"
                style={{ background: c.blue, boxShadow: c.shadow }}>
                Démarrer maintenant
              </button>
              <button onClick={() => navigate("/login")}
                className="px-6 py-3 text-sm font-semibold rounded-lg bg-white"
                style={{ color: c.text, border: `1px solid ${c.border}` }}>
                Se connecter
              </button>
            </div>
          </div>

          {/* Carte aperçu */}
          <div className="w-full max-w-sm flex-shrink-0 bg-white rounded-2xl p-4"
            style={{ boxShadow: c.shadow, border: `1px solid ${c.border}` }}>
            <div className="flex items-center gap-3 pb-3 mb-3"
              style={{ borderBottom: `1px solid ${c.border}` }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: c.blue }}>RB</div>
              <div>
                <div className="text-xs font-semibold" style={{ color: c.text }}>Nos aventures au Sénégal</div>
                <div className="text-xs" style={{ color: c.muted }}>14 mars 2026 · Public</div>
              </div>
              <div className="ml-auto w-2 h-2 rounded-full" style={{ background: c.blue }}></div>
            </div>
            <div className="text-sm font-semibold mb-2" style={{ color: c.text }}>Escapade à Saint-Louis</div>
            <div className="rounded-lg h-14 flex items-center justify-center mb-3"
              style={{ background: c.gray, border: `1px dashed ${c.border}` }}>
              <span className="text-xs" style={{ color: c.muted }}>Image en attente</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {["👍 12", "❤️ 5", "💬 4"].map(r => (
                <span key={r} className="px-3 py-1 rounded-full text-xs"
                  style={{ background: c.blueSoft, color: c.blueDark, border: `1px solid ${c.border}` }}>
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ SECTIONS FEATURES ══ */}
      {[
        {
          bg: "#ffffff",
          reverse: false,
          titre: "Écrivez et publiez facilement",
          desc: "Un éditeur net, des boutons simples. Choisissez public ou privé, activez ou non les commentaires.",
          illus: (
            <div className="w-full max-w-sm bg-white rounded-2xl p-5"
              style={{ boxShadow: c.softShadow, border: `1px solid ${c.border}` }}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold" style={{ color: c.text }}>Nouvel article</span>
                <span className="text-xs" style={{ color: c.muted }}>Public</span>
              </div>
              <div className="h-10 rounded-lg mb-2" style={{ background: c.blueSoft, border: `1px solid ${c.border}` }}/>
              <div className="h-16 rounded-lg mb-3" style={{ background: "#fff", border: `1px dashed ${c.border}` }}/>
              <div className="flex gap-2">
                <button className="flex-1 py-2 text-sm font-bold text-white rounded-lg"
                  style={{ background: c.blue, boxShadow: c.softShadow }}>Publier</button>
                <button className="flex-1 py-2 text-sm font-semibold rounded-lg bg-white"
                  style={{ color: c.text, border: `1px solid ${c.border}` }}>Brouillon</button>
              </div>
            </div>
          )
        },
        {
          bg: c.gray,
          reverse: true,
          titre: "Connectez-vous avec vos amis",
          desc: "Recherchez, ajoutez, bloquez si besoin.",
          illus: (
            <div className="w-full max-w-sm bg-white rounded-2xl p-4"
              style={{ boxShadow: c.softShadow, border: `1px solid ${c.border}` }}>
              {[
                { init: "RB", name: "Rokhaya Beye" },
                { init: "PL", name: "Princesse Lyliane" },
                { init: "AD", name: "Awa Diop" }
              ].map((u, i) => (
                <div key={u.init} className={`flex items-center gap-3 p-3 rounded-xl ${i < 2 ? "mb-2" : ""}`}
                  style={{ background: i === 0 ? c.blueSoft : "#fff", border: `1px solid ${c.border}` }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: c.blue }}>{u.init}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: c.text }}>{u.name}</div>
                    <div className="text-xs" style={{ color: c.muted }}>En ligne</div>
                  </div>
                  <button className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white flex-shrink-0"
                    style={{ border: `1px solid ${c.border}`, color: c.text }}>
                    + Ajouter
                  </button>
                </div>
              ))}
            </div>
          )
        },
        {
          bg: "#ffffff",
          reverse: false,
          titre: "Réagissez et commentez",
          desc: "Répondez aux commentaires en temps réel.",
          illus: (
            <div className="w-full max-w-sm flex flex-col gap-3">
              <div className="rounded-xl p-4" style={{ background: c.blueSoft, border: `1px solid ${c.border}`, boxShadow: c.softShadow }}>
                <div className="text-sm font-semibold mb-2" style={{ color: c.text }}>Les tendances tech en 2026</div>
                <div className="text-xs mb-3 leading-relaxed" style={{ color: c.muted }}>L'IA continue de transformer notre quotidien...</div>
                <div className="flex gap-2 flex-wrap">
                  {["👍 12", "❤️ 8", "😮 3", "💬 4"].map(r => (
                    <span key={r} className="px-2 py-1 rounded-full text-xs bg-white"
                      style={{ border: `1px solid ${c.border}`, color: c.text }}>{r}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl p-3 ml-4 bg-white" style={{ border: `1px solid ${c.border}` }}>
                <div className="text-xs mb-1" style={{ color: c.muted }}>Princesse Lyliane</div>
                <div className="text-sm" style={{ color: c.text }}>Super article !</div>
              </div>
            </div>
          )
        },
        {
          bg: c.gray,
          reverse: true,
          titre: "Découvrez le fil de vos amis",
          desc: "Un flux pour suivre les publications de vos proches.",
          illus: (
            <div className="w-full max-w-sm flex flex-col gap-3">
              {[
                { init: "RB", titre: "Les tendances tech en 2026", time: "il y a 1h" },
                { init: "IB", titre: "Recette du thiéboudienne", time: "il y a 3h" },
                { init: "AD", titre: "Mon expérience à l'ISI", time: "il y a 5h" },
              ].map((item, i) => (
                <div key={item.init} className="bg-white rounded-xl p-3"
                  style={{ border: `1px solid ${c.border}`, boxShadow: c.softShadow, opacity: 1 - i * 0.12 }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: c.blue }}>{item.init}</div>
                    <span className="text-xs" style={{ color: c.muted }}>{item.time} · Public</span>
                  </div>
                  <div className="text-sm font-semibold" style={{ color: c.text }}>{item.titre}</div>
                </div>
              ))}
            </div>
          )
        }
      ].map((section, i) => (
        <section key={i} className="px-4 md:px-12 py-12 md:py-16" style={{ background: section.bg }}>
          <div className={`max-w-5xl mx-auto flex flex-col ${section.reverse ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-10`}>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: c.text }}>{section.titre}</h2>
              <p className="text-sm md:text-base leading-relaxed" style={{ color: c.muted }}>{section.desc}</p>
            </div>
            <div className="flex-1 flex justify-center w-full">{section.illus}</div>
          </div>
        </section>
      ))}

      {/* ══ CTA FINAL ══ */}
      <section className="px-4 md:px-12 py-16 text-center text-white"
        style={{ background: c.ctaGradient }}>
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-4">
            Rejoignez une plateforme lisible et cohérente
          </h2>
          <p className="text-sm md:text-base mb-8 leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
            Vous écrivez, vos amis réagissent, tout reste simple.
          </p>
          <button onClick={() => navigate("/register")}
            className="px-8 py-3 text-sm font-bold rounded-xl bg-white"
            style={{ color: c.blueDark, boxShadow: c.shadow }}>
            Créer votre blog
          </button>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="px-4 md:px-12 py-5 flex flex-col md:flex-row items-center justify-between gap-2"
        style={{ background: c.blueDark }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white"
            style={{ background: c.blue }}>B</div>
          <span className="text-xs" style={{ color: "#cbd5e1" }}>MonBlog 2026</span>
        </div>
        <span className="text-xs" style={{ color: "#94a3b8" }}>ISI DSIA</span>
      </footer>

    </div>
  )
}

export default LandingPage