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

const Section = ({ bg = "#fff", children }) => (
  <section style={{ background: bg, padding: "72px 48px" }}>
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>{children}</div>
  </section>
)

function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: c.graySoft, color: c.text }}>

      {/* NAVBAR */}
      <nav style={{
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 48px",
        borderBottom: `1px solid ${c.border}`,
        position: "sticky",
        top: 0,
        zIndex: 10,
        boxShadow: c.softShadow,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontWeight: 700, fontSize: "30px", color: c.text }}>DailyBlog</span>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            onClick={() => navigate("/login")}
            style={{ background: "transparent", border: "none", fontSize: "13px", color: c.muted, cursor: "pointer", fontWeight: 500 }}
          >
            Connexion
          </button>
          <button
            onClick={() => navigate("/register")}
            style={{
              padding: "10px 18px",
              background: c.blue,
              border: "none",
              borderRadius: "6px",
              color: "white",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.4px",
              boxShadow: c.shadow
            }}
          >
            Créer votre blog
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        background: c.heroGradient,
        minHeight: "420px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 48px",
      }}>
        <div style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: "40px",
          alignItems: "center"
        }}>
          <div>
            <p style={{ color: "rgba(11,18,32,0.65)", letterSpacing: "1px", fontSize: "12px", textTransform: "uppercase", marginBottom: "12px", fontWeight: 600 }}>
              Blog personnel, simple et clair
            </p>
            <h1 style={{
              fontSize: "44px",
              fontWeight: 800,
              lineHeight: 1.1,
              color: c.blueDark,
              margin: "0 0 18px"
            }}>
              Écrivez, partagez, restez proche de vos amis.
            </h1>
            <p style={{ color: "rgba(11,18,32,0.7)", fontSize: "16px", maxWidth: "540px", lineHeight: 1.6, marginBottom: "24px" }}>
              Une interface nette, uniquement en bleu, gris, blanc et noir. Pas de fioritures : vous publiez, vos proches réagissent, tout simplement.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                onClick={() => navigate("/register")}
                style={{
                  padding: "12px 22px",
                  background: c.blue,
                  color: "white",
                  border: "none",
                  borderRadius: "0px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: c.shadow
                }}
              >
                Démarrer maintenant
              </button>
              <button
                onClick={() => navigate("/login")}
                style={{
                  padding: "12px 18px",
                  background: "white",
                  color: c.text,
                  border: `1px solid ${c.border}`,
                  borderRadius: "6px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Se connecter
              </button>
            </div>
          </div>

          <div style={{
            background: "white",
            borderRadius: "14px",
            padding: "18px",
            boxShadow: c.shadow,
            border: `1px solid ${c.border}`,
            maxWidth: "420px",
            marginLeft: "auto"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px", paddingBottom: "12px", borderBottom: `1px solid ${c.border}` }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: c.blue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "white" }}>RB</div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: c.text }}>Nos aventures au Sénégal</div>
                <div style={{ fontSize: "10px", color: c.muted }}>Vendredi 14 mars 2026 · Public</div>
              </div>
              <div style={{ marginLeft: "auto", width: "7px", height: "7px", borderRadius: "50%", background: c.blue }}></div>
            </div>
            <div style={{ fontSize: "13px", color: c.text, fontWeight: 600, marginBottom: "8px" }}>Escapade à Saint-Louis</div>
            <div style={{ background: c.gray, borderRadius: "10px", height: "64px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px", border: `1px dashed ${c.border}` }}>
              <span style={{ color: c.muted, fontSize: "12px" }}>Image en attente</span>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {["👍 12", "❤️ 5", "💬 4"].map(r => (
                <span key={r} style={{ padding: "4px 10px", background: c.blueSoft, borderRadius: "999px", fontSize: "11px", color: c.blueDark, border: `1px solid ${c.border}` }}>{r}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ÉCRIRE & PUBLIER */}
      <Section bg="#ffffff">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "36px", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "32px", fontWeight: 700, margin: "0 0 14px", color: c.text }}>
              Écrivez et publiez facilement
            </h2>
            <p style={{ fontSize: "15px", color: c.muted, lineHeight: 1.7, maxWidth: "480px" }}>
              Un éditeur net, des boutons simples, aucune couleur superflue. Choisissez public ou privé, activez ou non les commentaires.
            </p>
          </div>
          <div style={{
            background: "white",
            borderRadius: "14px",
            padding: "20px",
            boxShadow: c.softShadow,
            border: `1px solid ${c.border}`,
            maxWidth: "440px",
            marginLeft: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: c.text }}>Nouvel article</span>
              <span style={{ fontSize: "11px", color: c.muted }}>Public</span>
            </div>
            <div style={{ height: "46px", background: c.blueSoft, borderRadius: "6px", border: `1px solid ${c.border}`, marginBottom: "10px" }} />
            <div style={{ height: "70px", background: "#fff", borderRadius: "6px", border: `1px dashed ${c.border}`, marginBottom: "12px" }} />
            <div style={{ display: "flex", gap: "10px" }}>
              <button style={{ flex: 1, padding: "10px", background: c.blue, color: "white", border: "none", borderRadius: "6px", fontWeight: 700, boxShadow: c.softShadow }}>Publier</button>
              <button style={{ flex: 1, padding: "10px", background: "white", color: c.text, border: `1px solid ${c.border}`, borderRadius: "6px", fontWeight: 600 }}>Brouillon</button>
            </div>
          </div>
        </div>
      </Section>

      {/* AMIS */}
      <Section bg={c.gray}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "36px", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "32px", fontWeight: 700, margin: "0 0 14px", color: c.text }}>
              Connectez-vous avec vos amis
            </h2>
            <p style={{ fontSize: "15px", color: c.muted, lineHeight: 1.7, maxWidth: "480px" }}>
              Recherchez, ajoutez, bloquez si besoin. Les indicateurs restent bleus et gris, pour un fil visuel cohérent.
            </p>
          </div>
          <div style={{
            background: "white",
            borderRadius: "14px",
            padding: "18px",
            boxShadow: c.softShadow,
            border: `1px solid ${c.border}`,
            maxWidth: "420px",
            marginLeft: "auto"
          }}>
            {[{ init: "RB", name: "Rokhaya Beye" }, { init: "IB", name: "Ibrahima Beye" }, { init: "AD", name: "Awa Diop" }].map((u, i) => (
              <div key={u.init} style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px",
                borderRadius: "10px",
                border: `1px solid ${c.border}`,
                background: i === 0 ? c.blueSoft : "#fff",
                marginBottom: i === 2 ? 0 : "10px"
              }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: c.blue, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px" }}>{u.init}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: c.text }}>{u.name}</div>
                  <div style={{ fontSize: "11px", color: c.muted }}>En ligne</div>
                </div>
                <button style={{ padding: "8px 12px", background: "white", border: `1px solid ${c.border}`, borderRadius: "0px", fontWeight: 600, color: c.text }}>
                  + Ajouter
                </button>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* RÉACTIONS */}
      <Section bg="#ffffff">
        <div style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: "36px", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "32px", fontWeight: 700, margin: "0 0 14px", color: c.text }}>
              Réagissez et commentez
            </h2>
            <p style={{ fontSize: "15px", color: c.muted, lineHeight: 1.7, maxWidth: "480px" }}>
              Les réactions restent lisibles : fond blanc, puces bleu clair, texte gris. Les rectangles sont courts pour éviter l'effet « bandeau ».
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ background: c.blueSoft, border: `1px solid ${c.border}`, borderRadius: "12px", padding: "14px", boxShadow: c.softShadow }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: c.text, marginBottom: "6px" }}>Les tendances tech en 2026</div>
              <div style={{ fontSize: "12px", color: c.muted, marginBottom: "10px", lineHeight: 1.5 }}>L'IA continue de transformer notre quotidien...</div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {["👍 12", "❤️ 8", "😮 3", "💬 4"].map(r => (
                  <span key={r} style={{ padding: "5px 10px", background: "white", borderRadius: "999px", border: `1px solid ${c.border}`, fontSize: "12px", color: c.text }}>{r}</span>
                ))}
              </div>
            </div>
            <div style={{ background: "white", border: `1px solid ${c.border}`, borderRadius: "12px", padding: "12px", marginLeft: "22px", boxShadow: c.softShadow }}>
              <div style={{ fontSize: "10px", color: c.muted, marginBottom: "4px" }}>Ibrahima Beye</div>
              <div style={{ fontSize: "12px", color: c.text }}>Super article, très instructif !</div>
            </div>
            <div style={{ background: "white", border: `1px solid ${c.border}`, borderRadius: "12px", padding: "12px", marginLeft: "44px", boxShadow: c.softShadow }}>
              <div style={{ fontSize: "10px", color: c.muted, marginBottom: "4px" }}>Rokhaya Beye · auteur</div>
              <div style={{ fontSize: "12px", color: c.text }}>Merci beaucoup 😊</div>
            </div>
          </div>
        </div>
      </Section>

      {/* FIL D'ACTUALITÉ */}
      <Section bg={c.gray}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "36px", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "32px", fontWeight: 700, margin: "0 0 14px", color: c.text }}>
              Découvrez le fil de vos amis
            </h2>
            <p style={{ fontSize: "15px", color: c.muted, lineHeight: 1.7, maxWidth: "480px" }}>
              Les cartes sont compactes et faciles à lire. Tout reste dans la même palette bleu/gris pour éviter les ruptures visuelles.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "420px", marginLeft: "auto" }}>
            {[
              { init: "RB", titre: "Les tendances tech en 2026", time: "il y a 1h" },
              { init: "IB", titre: "Recette du thiéboudienne", time: "il y a 3h" },
              { init: "AD", titre: "Mon expérience à l'ISI", time: "il y a 5h" },
            ].map((item, i) => (
              <div key={item.init} style={{
                background: "white",
                border: `1px solid ${c.border}`,
                borderRadius: "12px",
                padding: "12px",
                boxShadow: c.softShadow,
                opacity: 1 - i * 0.12
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <div style={{ width: "26px", height: "26px", borderRadius: "8px", background: c.blue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: "white" }}>{item.init}</div>
                  <div style={{ fontSize: "10px", color: c.muted }}>{item.time} · Public</div>
                </div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: c.text }}>{item.titre}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA FINAL */}
      <section style={{
        background: c.ctaGradient,
        padding: "72px 48px",
        color: "white",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "34px", fontWeight: 800, lineHeight: 1.3, margin: "0 0 12px" }}>
            Rejoignez une plateforme lisible et cohérente
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "15px", lineHeight: 1.7, marginBottom: "26px" }}>
            Vous écrivez, vos amis réagissent, tout reste simple.
          </p>
          <button
            onClick={() => navigate("/register")}
            style={{
              padding: "13px 30px",
              background: "#ffffff",
              color: c.blueDark,
              border: "none",
              borderRadius: "12px",
              fontWeight: 800,
              letterSpacing: "0.6px",
              cursor: "pointer",
              boxShadow: c.shadow
            }}
          >
            Créer votre blog
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: c.blueDark, padding: "18px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#cbd5e1" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "26px", height: "26px", borderRadius: "6px", background: c.blue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "white" }}>B</div>
          <span style={{ fontSize: "12px" }}>MonBlog © 2026</span>
        </div>
        <span style={{ fontSize: "11px" }}>Projet ISI DSIA — Blog Personnel · React + Flask</span>
      </footer>
    </div>
  )
}

export default LandingPage
