import { useNavigate } from "react-router-dom"

function LandingPage() {
  const navigate = useNavigate()
  const c = {
    primary: "#2563eb",
    primaryDark: "#1d4ed8",
    deep: "#0f172a",
    border: "#e2e8f0",
    heroGradient: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 45%, #2563eb 100%)",
    sectionGradient: "linear-gradient(140deg, #0f172a 0%, #1d4ed8 55%, #2563eb 100%)",
    altGradient: "linear-gradient(140deg, #0b1f3d 0%, #1e3a8a 60%, #2563eb 100%)",
    footerGradient: "linear-gradient(160deg, #0f172a 0%, #1e3a8a 60%, #0b1f3d 100%)",
    glow: "0 24px 60px rgba(15,23,42,0.35)",
    softGlow: "0 18px 40px rgba(15,23,42,0.25)",
  }

  return (
    <div style={{ fontFamily: "sans-serif" }}>

      {/* ══════════════════════════════
          NAVBAR
      ══════════════════════════════ */}
      <nav style={{
        background: "white", display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "16px 48px",
        borderBottom: `1px solid ${c.border}`, position: "sticky", top: 0, zIndex: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "34px", height: "34px", borderRadius: "8px",
            background: c.primary, display: "flex", alignItems: "center",
            justifyContent: "center", fontWeight: 800, fontSize: "16px", color: "white"
          }}>B</div>
          <span style={{ fontWeight: 700, fontSize: "17px", color: c.deep }}>MonBlog</span>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <button
            onClick={() => navigate("/login")}
            style={{ background: "transparent", border: "none", fontSize: "13px", color: "#4b5563", cursor: "pointer", fontWeight: 500 }}
          >
            CONNEXION
          </button>
          <button
            onClick={() => navigate("/register")}
            style={{
              padding: "10px 20px", background: c.primary, border: "none",
              borderRadius: "6px", color: "white", fontSize: "13px",
              fontWeight: 700, cursor: "pointer", letterSpacing: "0.5px", textTransform: "uppercase",
              boxShadow: c.softGlow
            }}
          >
            CRÉER VOTRE BLOG
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════ */}
      <section style={{
        background: c.heroGradient, minHeight: "600px", display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "60px 48px", position: "relative", overflow: "hidden"
      }}>
        {/* Décorations fond */}
        <div style={{ position: "absolute", top: "30px", left: "60px", opacity: 0.12 }}>
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="35" fill="none" stroke="white" strokeWidth="3"/>
            <circle cx="40" cy="40" r="18" fill="none" stroke="white" strokeWidth="2"/>
          </svg>
        </div>
        <div style={{ position: "absolute", bottom: "80px", left: "80px", opacity: 0.1 }}>
          <svg width="60" height="60" viewBox="0 0 60 60">
            <polygon points="30,5 55,50 5,50" fill="none" stroke="white" strokeWidth="3"/>
          </svg>
        </div>
        <div style={{ position: "absolute", bottom: "50px", right: "100px", opacity: 0.08 }}>
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="35" fill="white"/>
          </svg>
        </div>

        <h1 style={{
          fontSize: "46px", fontWeight: 700, color: "white",
          lineHeight: 1.2, maxWidth: "700px", marginBottom: "16px", position: "relative", zIndex: 1
        }}>
          Parlez de ce qui vous passionne,<br/>à votre manière
        </h1>
        <p style={{ color: "rgba(226,232,240,0.82)", fontSize: "17px", marginBottom: "36px", position: "relative", zIndex: 1 }}>
          Créez un blog unique et de qualité.
        </p>
        <button
          onClick={() => navigate("/register")}
          style={{
            padding: "16px 40px", background: c.primary, border: "none",
            borderRadius: "6px", color: "white", fontSize: "14px", fontWeight: 700,
            cursor: "pointer", letterSpacing: "0.8px", textTransform: "uppercase",
            position: "relative", zIndex: 1
          }}
        >
          CRÉER VOTRE BLOG
        </button>

        {/* Aperçu blog flottant */}
        <div style={{
          marginTop: "48px", background: "white", borderRadius: "14px",
          padding: "20px", maxWidth: "460px", width: "100%",
          position: "relative", zIndex: 1, boxShadow: c.glow
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px", paddingBottom: "12px", borderBottom: `1px solid ${c.border}` }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: c.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "white" }}>RB</div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#1f2937" }}>Nos aventures au Sénégal</div>
              <div style={{ fontSize: "10px", color: "#64748b" }}>Vendredi 14 mars 2026 · Public</div>
            </div>
            <div style={{ marginLeft: "auto", width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e" }}></div>
          </div>
          <div style={{ fontSize: "13px", color: "#374151", fontWeight: 600, marginBottom: "8px" }}>Escapade à Saint-Louis</div>
          <div style={{ background: "#f9fafb", borderRadius: "8px", height: "72px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
            <svg width="40" height="36" viewBox="0 0 40 36">
              <rect width="40" height="36" rx="5" fill="#f3f4f6"/>
              <circle cx="13" cy="13" r="4" fill="#d1d5db"/>
              <path d="M0 28 L10 18 L18 24 L26 14 L40 28Z" fill="#e5e7eb"/>
            </svg>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {["👍 12", "❤️ 5", "💬 4 commentaires"].map(r => (
              <span key={r} style={{ padding: "3px 10px", background: "#f3f4f6", borderRadius: "999px", fontSize: "11px", color: "#374151" }}>{r}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          SECTION 2 — Écrire et publier
      ══════════════════════════════ */}
      <section style={{ background: c.sectionGradient, minHeight: "520px", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "60px", maxWidth: "1000px", width: "100%" }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: "36px", fontWeight: 700, color: "white", lineHeight: 1.25, marginBottom: "18px" }}>
              Écrivez et publiez facilement
            </h2>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.7)", lineHeight: 1.8, maxWidth: "420px" }}>
              Rédigez vos articles, choisissez de les publier en public ou de les garder privés. Activez ou désactivez les commentaires selon vos préférences.
            </p>
          </div>
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <svg width="320" height="230" viewBox="0 0 320 230">
              <rect x="20" y="10" width="280" height="210" rx="12" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
              <rect x="20" y="10" width="280" height="34" rx="12" fill="rgba(255,255,255,0.18)"/>
              <rect x="20" y="34" width="280" height="6" fill="rgba(255,255,255,0.18)"/>
              <circle cx="38" cy="27" r="5" fill="rgba(255,255,255,0.45)"/>
              <circle cx="54" cy="27" r="5" fill="rgba(255,255,255,0.45)"/>
              <circle cx="70" cy="27" r="5" fill="rgba(255,255,255,0.45)"/>
              <rect x="36" y="56" width="180" height="12" rx="3" fill="rgba(255,255,255,0.55)"/>
              <rect x="36" y="78" width="248" height="7" rx="2" fill="rgba(255,255,255,0.25)"/>
              <rect x="36" y="91" width="200" height="7" rx="2" fill="rgba(255,255,255,0.25)"/>
              <rect x="36" y="104" width="220" height="7" rx="2" fill="rgba(255,255,255,0.25)"/>
              <rect x="36" y="117" width="170" height="7" rx="2" fill="rgba(255,255,255,0.25)"/>
              <rect x="36" y="140" width="110" height="28" rx="6" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
              <text x="91" y="159" fontSize="11" fill="rgba(255,255,255,0.9)" textAnchor="middle">Public ✓</text>
              <rect x="156" y="140" width="110" height="28" rx="6" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
              <text x="211" y="159" fontSize="11" fill="rgba(255,255,255,0.4)" textAnchor="middle">Privé</text>
              <rect x="36" y="180" width="100" height="28" rx="6" fill="rgba(255,255,255,0.9)"/>
              <text x="86" y="199" fontSize="12" fontWeight="700" fill={c.primaryDark} textAnchor="middle">Publier</text>
            </svg>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          SECTION 3 — Amis
      ══════════════════════════════ */}
      <section style={{ background: c.altGradient, minHeight: "520px", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 48px" }}>
        <div style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center", gap: "60px", maxWidth: "1000px", width: "100%" }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: "36px", fontWeight: 700, color: "white", lineHeight: 1.25, marginBottom: "18px" }}>
              Connectez-vous avec vos amis
            </h2>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.7)", lineHeight: 1.8, maxWidth: "420px" }}>
              Recherchez des utilisateurs, envoyez des demandes d'amis et suivez leurs publications. Bloquez ceux que vous ne souhaitez plus voir.
            </p>
          </div>
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <svg width="300" height="250" viewBox="0 0 300 250">
              <rect width="300" height="250" rx="14" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
              <ellipse cx="75" cy="120" rx="55" ry="65" fill="rgba(255,255,255,0.07)"/>
              <ellipse cx="155" cy="95" rx="50" ry="58" fill="rgba(255,255,255,0.07)"/>
              <ellipse cx="235" cy="105" rx="42" ry="52" fill="rgba(255,255,255,0.07)"/>
              <line x1="88" y1="75" x2="158" y2="58" stroke="rgba(167,139,250,0.45)" strokeWidth="1.5" strokeDasharray="5,3"/>
              <line x1="158" y1="58" x2="238" y2="82" stroke="rgba(167,139,250,0.45)" strokeWidth="1.5" strokeDasharray="5,3"/>
              <line x1="88" y1="75" x2="55" y2="155" stroke="rgba(167,139,250,0.35)" strokeWidth="1.5" strokeDasharray="5,3"/>
              {[
                { cx: 88, cy: 75, label: "RB" },
                { cx: 158, cy: 58, label: "IB" },
                { cx: 238, cy: 82, label: "AD" },
                { cx: 55, cy: 155, label: "LY" },
              ].map(u => (
                <g key={u.label}>
                  <circle cx={u.cx} cy={u.cy} r="16" fill="white"/>
                  <text x={u.cx} y={u.cy + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill={c.deep}>{u.label}</text>
                  <circle cx={u.cx} cy={u.cy + 20} r="8" fill={c.primary}/>
                  <text x={u.cx} y={u.cy + 24} textAnchor="middle" fontSize="8" fontWeight="700" fill="white">B</text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          SECTION 4 — Réactions
      ══════════════════════════════ */}
      <section style={{ background: c.sectionGradient, minHeight: "520px", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "60px", maxWidth: "1000px", width: "100%" }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: "36px", fontWeight: 700, color: "white", lineHeight: 1.25, marginBottom: "18px" }}>
              Réagissez et commentez
            </h2>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.7)", lineHeight: 1.8, maxWidth: "420px" }}>
              Exprimez-vous sur les articles de vos amis avec des réactions emoji. Répondez aux commentaires et créez de vraies discussions.
            </p>
          </div>
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "280px" }}>
              <div style={{ background: "rgba(255,255,255,0.1)", border: "0.5px solid rgba(255,255,255,0.2)", borderRadius: "12px", padding: "16px" }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "white", marginBottom: "6px" }}>Les tendances tech en 2026</div>
                <div style={{ fontSize: "11px", color: "rgba(221,214,254,0.65)", marginBottom: "12px", lineHeight: 1.5 }}>L'IA continue de transformer notre quotidien...</div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {["👍 12", "❤️ 8", "😮 3", "💬 4"].map(r => (
                    <span key={r} style={{ padding: "4px 10px", background: "rgba(255,255,255,0.15)", borderRadius: "999px", fontSize: "12px", color: "white" }}>{r}</span>
                  ))}
                </div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.07)", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "12px", marginLeft: "20px" }}>
                <div style={{ fontSize: "10px", color: "rgba(221,214,254,0.5)", marginBottom: "4px" }}>Ibrahima Beye</div>
                <div style={{ fontSize: "12px", color: "white" }}>Super article, très instructif !</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px", marginLeft: "40px" }}>
                <div style={{ fontSize: "10px", color: "rgba(221,214,254,0.5)", marginBottom: "4px" }}>Rokhaya Beye · auteur</div>
                <div style={{ fontSize: "12px", color: "white" }}>Merci beaucoup 😊</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          SECTION 5 — Fil d'actualité
      ══════════════════════════════ */}
      <section style={{ background: c.heroGradient, minHeight: "520px", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 48px" }}>
        <div style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center", gap: "60px", maxWidth: "1000px", width: "100%" }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: "36px", fontWeight: 700, color: "white", lineHeight: 1.25, marginBottom: "18px" }}>
              Découvrez le fil de vos amis
            </h2>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.7)", lineHeight: 1.8, maxWidth: "420px" }}>
              Retrouvez tous les articles publics de vos amis sur votre tableau de bord. Réagissez, commentez et échangez en temps réel.
            </p>
          </div>
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "280px" }}>
              {[
                { init: "RB", titre: "Les tendances tech en 2026", time: "il y a 1h" },
                { init: "IB", titre: "Recette du thiéboudienne", time: "il y a 3h" },
                { init: "AD", titre: "Mon expérience à l'ISI", time: "il y a 5h" },
              ].map((item, i) => (
                <div key={item.init} style={{
                  background: `rgba(255,255,255,${0.1 - i * 0.025})`,
                  border: `0.5px solid rgba(255,255,255,${0.2 - i * 0.04})`,
                  borderRadius: "12px", padding: "14px",
                  opacity: 1 - i * 0.15
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: c.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: "white" }}>{item.init}</div>
                    <div style={{ fontSize: "10px", color: "rgba(221,214,254,0.65)" }}>{item.time} · Public</div>
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "white" }}>{item.titre}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          SECTION CTA FINAL
      ══════════════════════════════ */}
      <section style={{ background: c.footerGradient, minHeight: "440px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "60px 48px", position: "relative", overflow: "hidden" }}>
        {/* Carte monde en fond */}
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.06 }} viewBox="0 0 1000 440" preserveAspectRatio="xMidYMid slice">
          <ellipse cx="200" cy="200" rx="170" ry="180" fill="white"/>
          <ellipse cx="500" cy="160" rx="155" ry="165" fill="white"/>
          <ellipse cx="780" cy="190" rx="140" ry="155" fill="white"/>
          <ellipse cx="680" cy="340" rx="90" ry="95" fill="white"/>
        </svg>

        {/* Pins utilisateurs */}
        {[
          { top: "50px", left: "12%", label: "RB" },
          { top: "35px", left: "38%", label: "IB" },
          { top: "55px", right: "18%", label: "AD" },
          { top: "90px", left: "24%", label: "LY" },
        ].map(p => (
          <div key={p.label} style={{ position: "absolute", top: p.top, left: p.left, right: p.right, zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: c.deep }}>{p.label}</div>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: c.primary }}></div>
          </div>
        ))}

        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: "36px", fontWeight: 700, color: "white", lineHeight: 1.3, maxWidth: "580px", margin: "0 auto 14px" }}>
            Rejoignez notre communauté de blogueurs
          </h2>
          <p style={{ color: "rgba(221,214,254,0.65)", fontSize: "15px", maxWidth: "480px", margin: "0 auto 32px", lineHeight: 1.75 }}>
            Que ce soit pour partager votre expertise, vos aventures ou vos idées, MonBlog est la plateforme qu'il vous faut.
          </p>
          <button
            onClick={() => navigate("/register")}
            style={{ padding: "15px 36px", background: c.primaryDark, border: "none", borderRadius: "6px", color: "white", fontSize: "13px", fontWeight: 700, cursor: "pointer", letterSpacing: "0.8px", textTransform: "uppercase", boxShadow: c.softGlow }}
          >
            CRÉER VOTRE BLOG
          </button>
        </div>
      </section>

      {/* ══════════════════════════════
          FOOTER
      ══════════════════════════════ */}
      <footer style={{ background: c.deep, padding: "18px 48px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "26px", height: "26px", borderRadius: "6px", background: c.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "white" }}>B</div>
          <span style={{ color: "rgba(148,163,184,0.6)", fontSize: "12px" }}>MonBlog © 2026</span>
        </div>
        <span style={{ color: "rgba(148,163,184,0.65)", fontSize: "11px" }}>Projet ISI DSIA — Blog Personnel · React + Flask</span>
      </footer>

    </div>
  )
}

export default LandingPage
