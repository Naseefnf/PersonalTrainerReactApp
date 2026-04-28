import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, getUserDoc } from "../../firebase/service";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const [email, setEmail]   = useState("");
  const [pass,  setPass]    = useState("");
  const [error, setError]   = useState("");
  const [busy,  setBusy]    = useState(false);
  const { setProfile }      = useAuth();
  const navigate            = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      const cred = await loginUser(email, pass);
      const doc  = await getUserDoc(cred.user.uid);
      setProfile(doc);
      navigate(doc?.role === "trainer" ? "/trainer" : "/client");
    } catch (err) {
      setError("Invalid email or password.");
    } finally { setBusy(false); }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem",
      background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,107,0,0.12) 0%, var(--bg) 65%)",
    }}>
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }} className="fade-in">
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: "var(--orange)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "2rem", margin: "0 auto 1rem",
          boxShadow: "var(--glow)",
        }}>💪</div>
        <h1 style={{ fontSize: "1.7rem" }}>
          TRAINER<span style={{ color: "var(--orange)" }}>SYNC</span>
        </h1>
        <p style={{ marginTop: "0.3rem", fontSize: "0.88rem" }}>
          Your personal fitness command centre
        </p>
      </div>

      <div className="card fade-in" style={{ width: "100%", maxWidth: 400, padding: "2rem" }}>
        <h2 style={{ marginBottom: "1.5rem", fontSize: "1.2rem" }}>Sign in</h2>

        {error && (
          <div className="alert alert-red" style={{ marginBottom: "1.2rem" }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••"
              value={pass} onChange={e => setPass(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-orange btn-full btn-lg"
            style={{ marginTop: "0.5rem" }} disabled={busy}>
            {busy ? "Signing in…" : "Login →"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.88rem", color: "var(--text-3)" }}>
          No account?{" "}
          <Link to="/register" style={{ color: "var(--orange)", fontWeight: 700 }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}