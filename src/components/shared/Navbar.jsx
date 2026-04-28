import { useAuth } from "../../hooks/useAuth";
import { logoutUser } from "../../firebase/service";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const { profile } = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  const isTrainer = profile?.role === "trainer";

  return (
    <>
      {/* ── Top bar (desktop) ───────────────────────────────────────────── */}
      <header style={{
        background: "#0d0d0d",
        borderBottom: "1px solid #1e1e1e",
        padding: "0 1.5rem",
        height: "58px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 200,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{
            width: 32, height: 32,
            background: "var(--orange)",
            borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1rem", fontWeight: 900,
          }}>💪</div>
          <span style={{ fontWeight: 900, fontSize: "1rem", letterSpacing: "-0.3px" }}>
            TRAINER<span style={{ color: "var(--orange)" }}>SYNC</span>
          </span>
        </div>

        {/* Right */}
        {profile && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              width: 34, height: 34,
              borderRadius: "50%",
              background: "var(--orange)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: "0.85rem", color: "#fff",
            }}>
              {profile.displayName?.[0]?.toUpperCase()}
            </div>
            <div style={{ display: "none" }} className="desktop-name">
              <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{profile.displayName}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>
                {isTrainer ? "Trainer" : "Client"}
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </header>

      {/* ── Mobile bottom nav ───────────────────────────────────────────── */}
      {profile && (
        <nav style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          background: "#0d0d0d",
          borderTop: "1px solid #1e1e1e",
          display: "flex",
          zIndex: 200,
          padding: "0.5rem 0 calc(0.5rem + env(safe-area-inset-bottom))",
        }}>
          {isTrainer ? (
            <>
              <NavTab label="Plan"     icon="📋" active={location.hash !== "#progress"} onClick={() => { navigate("/trainer"); window.location.hash = ""; }} />
              <NavTab label="Progress" icon="📊" active={location.hash === "#progress"} onClick={() => { navigate("/trainer"); window.location.hash = "progress"; }} />
            </>
          ) : (
            <>
              <NavTab label="Today"    icon="🏃" active={true} onClick={() => navigate("/client")} />
            </>
          )}
          <NavTab label="Logout" icon="🚪" active={false} onClick={handleLogout} />
        </nav>
      )}
    </>
  );
}

function NavTab({ label, icon, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: 1,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: "2px",
      border: "none",
      background: "transparent",
      color: active ? "var(--orange)" : "var(--text-3)",
      fontSize: "0.65rem",
      fontWeight: 700,
      cursor: "pointer",
      padding: "0.4rem 0",
      transition: "color 0.15s",
      letterSpacing: "0.3px",
      textTransform: "uppercase",
      WebkitTapHighlightColor: "transparent",
    }}>
      <span style={{ fontSize: "1.2rem" }}>{icon}</span>
      {label}
    </button>
  );
}