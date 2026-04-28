import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  getTodayPlan, getClientStatus,
  submitClientStatus, getClientStreak,
} from "../../firebase/service";
import { format } from "date-fns";

export default function ClientDashboard() {
  const { profile }     = useAuth();
  const [plan,    setPlan]    = useState(null);
  const [status,  setStatus]  = useState(null);
  const [checked, setChecked] = useState(new Set());
  const [remarks, setRemarks] = useState("");
  const [streak,  setStreak]  = useState({ streak:0, last7:[] });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const [p, s, str] = await Promise.all([
        getTodayPlan(profile.trainerUid),
        getClientStatus(profile.uid),
        getClientStreak(profile.uid),
      ]);
      setPlan(p);
      setStatus(s);
      setStreak(str);
      if (s) {
        setChecked(new Set(s.completedTasks || []));
        setRemarks(s.remarks || "");
      }
      setLoading(false);
    })();
  }, [profile]);

  const toggle = (name) =>
    setChecked(prev => {
      const n = new Set(prev);
      n.has(name) ? n.delete(name) : n.add(name);
      return n;
    });

  const submit = async () => {
    if (!plan) return;
    setSaving(true);
    const planId = `${profile.trainerUid}_${format(new Date(), "yyyy-MM-dd")}`;
    await submitClientStatus(profile.uid, profile.trainerUid, planId, [...checked], remarks);
    setSaved(true); setSaving(false);
    // Refresh streak
    const str = await getClientStreak(profile.uid);
    setStreak(str);
    setTimeout(() => setSaved(false), 3000);
  };

  const allTasks = plan
    ? [...(plan.dietPlan||[]).map(m=>m.meal), ...(plan.exerciseRoutine||[]).map(e=>e.name)]
    : [];
  const done  = checked.size;
  const total = allTasks.length;
  const pct   = total ? Math.round((done/total)*100) : 0;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading your plan…</p>
      </div>
    );
  }

  return (
    <div className="page fade-in">
      {/* Header */}
      <div style={{ marginBottom:"1.5rem" }}>
        <p className="section-title">{format(new Date(), "EEEE, dd MMMM yyyy")}</p>
        <h1>My Plan</h1>
      </div>

      {/* Streak + Progress row */}
      <div className="g2" style={{ marginBottom:"1.5rem" }}>
        {/* Streak */}
        <div className="streak-card">
          <div className="streak-flame">🔥</div>
          <div>
            <div className="streak-num">{streak.streak}</div>
            <div className="streak-label">Day Streak</div>
          </div>
        </div>

        {/* Today progress */}
        <div className="card card-glow" style={{ display:"flex", flexDirection:"column", justifyContent:"center" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.5rem" }}>
            <span style={{ fontSize:"0.78rem", fontWeight:700, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.6px" }}>Today</span>
            <span style={{ fontSize:"1.3rem", fontWeight:900, color:"var(--orange)" }}>{pct}%</span>
          </div>
          <div className="bar-track" style={{ height:10 }}>
            <div className="bar-fill" style={{ width:`${pct}%` }} />
          </div>
          <div style={{ fontSize:"0.75rem", color:"var(--text-3)", marginTop:"0.4rem" }}>
            {done}/{total} tasks done
          </div>
        </div>
      </div>

      {/* Last 7 days streak dots */}
      <div className="card" style={{ marginBottom:"1.5rem" }}>
        <div className="section-header">
          <span className="section-title">Last 7 Days</span>
          <span style={{ fontSize:"0.78rem", color:"var(--text-3)" }}>
            {streak.last7.filter(d=>d.done).length}/7 days
          </span>
        </div>
        <div className="streak-dots">
          {streak.last7.map((d, i) => {
            const isToday = i === 6;
            return (
              <div key={d.date}
                className={`streak-dot ${isToday ? "active" : d.done ? "done" : "empty"}`}
                title={d.date}>
                {d.label[0]}
              </div>
            );
          })}
        </div>
      </div>

      {/* Alerts */}
      {saved   && <div className="alert alert-green" style={{ marginBottom:"1rem" }}>✅ Progress submitted to your trainer!</div>}
      {status && !saved && <div className="alert alert-orange" style={{ marginBottom:"1rem" }}>✏️ Already submitted today — update anytime.</div>}

      {!plan ? (
        <div className="card" style={{ textAlign:"center", padding:"3rem 1.5rem" }}>
          <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>⏳</div>
          <h2>No Plan Yet</h2>
          <p style={{ marginTop:"0.4rem" }}>Your trainer hasn't published today's plan. Check back soon!</p>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
          {/* Diet */}
          <div className="card">
            <div className="section-header">
              <h3>🥗 Diet Plan</h3>
              <span style={{ fontSize:"0.8rem", color:"var(--text-3)" }}>
                {plan.dietPlan.reduce((s,m) => s+(m.calories||0), 0)} kcal
              </span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
              {plan.dietPlan.map(meal => (
                <div key={meal.meal}
                  className={`check-item ${checked.has(meal.meal)?"done":""}`}
                  onClick={() => toggle(meal.meal)}>
                  <div className="check-box">{checked.has(meal.meal)?"✓":""}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:"0.9rem" }}>{meal.meal}</div>
                    <div style={{ fontSize:"0.78rem", color:"var(--text-3)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                      {meal.items?.join(" · ")} · {meal.calories} kcal
                    </div>
                  </div>
                  {checked.has(meal.meal) && (
                    <span className="badge badge-green">Done</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Exercise */}
          <div className="card">
            <h3 style={{ marginBottom:"0.9rem" }}>🏋️ Exercise Routine</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
              {plan.exerciseRoutine.map(ex => (
                <div key={ex.name}
                  className={`check-item ${checked.has(ex.name)?"done":""}`}
                  onClick={() => toggle(ex.name)}>
                  <div className="check-box">{checked.has(ex.name)?"✓":""}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:"0.9rem" }}>{ex.name}</div>
                    <div style={{ fontSize:"0.78rem", color:"var(--text-3)" }}>
                      {ex.sets} sets × {ex.reps} reps
                    </div>
                  </div>
                  {ex.youtube_url && (
                    <a href={ex.youtube_url} target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{
                        fontSize:"1.1rem", padding:"0.3rem 0.5rem",
                        borderRadius:"var(--r-sm)",
                        background:"rgba(255,0,0,0.15)",
                        textDecoration:"none", flexShrink:0,
                      }}>▶️</a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Remarks */}
          <div className="card">
            <h3 style={{ marginBottom:"0.75rem" }}>📝 Remarks to Trainer</h3>
            <textarea
              placeholder="How did you feel? Any difficulties or questions for your trainer…"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
            />
          </div>

          {/* Submit */}
          <button className="btn btn-success btn-full btn-lg" onClick={submit} disabled={saving}>
            {saving ? "Submitting…" : status ? "🔄 Update Submission" : "📤 Submit Progress"}
          </button>
        </div>
      )}
    </div>
  );
}