import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, createUserDoc } from "../../firebase/service";

export default function Register() {
  const [f, setF] = useState({ name:"", email:"", password:"", confirm:"", role:"client", trainerUid:"" });
  const [error,   setError]   = useState("");
  const [busy,    setBusy]    = useState(false);
  const navigate = useNavigate();
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault(); setError(""); setBusy(true);
    if (f.password !== f.confirm)              { setError("Passwords don't match."); setBusy(false); return; }
    if (f.password.length < 6)                { setError("Password min 6 characters."); setBusy(false); return; }
    if (f.role === "client" && !f.trainerUid) { setError("Enter your Trainer UID."); setBusy(false); return; }
    try {
      const cred = await registerUser(f.email, f.password);
      await createUserDoc(cred.user.uid, f.email, f.name, f.role,
        f.role === "client" ? f.trainerUid.trim() : null);
      navigate("/login");
    } catch (err) {
      setError(err.code?.includes("email-already-in-use")
        ? "Email already registered." : "Registration failed.");
    } finally { setBusy(false); }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "1.5rem",
      background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,107,0,0.12) 0%, var(--bg) 65%)",
    }}>
      <div style={{ textAlign: "center", marginBottom: "1.75rem" }} className="fade-in">
        <div style={{
          width: 56, height: 56, borderRadius: 16, background: "var(--orange)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.7rem", margin: "0 auto 0.75rem", boxShadow: "var(--glow)",
        }}>💪</div>
        <h1 style={{ fontSize: "1.5rem" }}>
          TRAINER<span style={{ color: "var(--orange)" }}>SYNC</span>
        </h1>
      </div>

      <div className="card fade-in" style={{ width: "100%", maxWidth: 420, padding: "2rem" }}>
        <h2 style={{ marginBottom: "1.5rem", fontSize: "1.2rem" }}>Create account</h2>

        {error && <div className="alert alert-red" style={{ marginBottom: "1rem" }}>⚠️ {error}</div>}

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
          <div className="form-group">
            <label>Full Name</label>
            <input placeholder="John Doe" value={f.name} onChange={set("name")} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={f.email} onChange={set("email")} required />
          </div>

          {/* Role picker */}
          <div className="form-group">
            <label>I am a…</label>
            <div style={{ display: "flex", gap: "0.6rem" }}>
              {[["client","🏃 Client"],["trainer","🏋️ Trainer"]].map(([r, label]) => (
                <button key={r} type="button"
                  onClick={() => setF(p => ({ ...p, role: r }))}
                  style={{
                    flex: 1, padding: "0.75rem", borderRadius: "var(--r-md)",
                    border: `2px solid ${f.role===r ? "var(--orange)" : "var(--border-2)"}`,
                    background: f.role===r ? "var(--orange-dim)" : "var(--bg-3)",
                    color: f.role===r ? "var(--orange)" : "var(--text-3)",
                    fontWeight: 800, cursor: "pointer", transition: "all 0.2s",
                    fontSize: "0.88rem",
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {f.role === "client" && (
            <div className="form-group">
              <label>Trainer UID</label>
              <div className="alert alert-orange" style={{ marginBottom: "0.4rem", fontSize: "0.8rem" }}>
                💡 Ask your trainer to share their UID from their dashboard.
              </div>
              <input placeholder="Paste trainer's UID" value={f.trainerUid} onChange={set("trainerUid")} />
            </div>
          )}

          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Min 6 characters" value={f.password} onChange={set("password")} required />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" placeholder="Re-enter password" value={f.confirm} onChange={set("confirm")} required />
          </div>

          <button type="submit" className="btn btn-orange btn-full btn-lg"
            style={{ marginTop: "0.5rem" }} disabled={busy}>
            {busy ? "Creating…" : "Create Account →"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.88rem", color: "var(--text-3)" }}>
          Already registered?{" "}
          <Link to="/login" style={{ color: "var(--orange)", fontWeight: 700 }}>Login</Link>
        </div>
      </div>
    </div>
  );
}