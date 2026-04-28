import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  upsertDailyPlan, getTrainerClients,
  getAllClientStatuses, getClientStatusHistory, deleteClient,
} from "../../firebase/service";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import { format, subDays } from "date-fns";

const COL = ["#ff6b00","#22c55e","#f59e0b","#818cf8","#38bdf8"];

export default function TrainerDashboard() {
  const { profile } = useAuth();
  const [tab, setTab] = useState("plan");
  const [saved, setSaved] = useState(false);

  // Plan
  const [diet, setDiet] = useState([
    { meal:"Breakfast", items:"Oats, Eggs, Banana",          calories:450 },
    { meal:"Lunch",     items:"Rice, Grilled Chicken, Salad", calories:650 },
    { meal:"Dinner",    items:"Chapati, Dal, Vegetables",    calories:500 },
  ]);
  const [exer, setExer] = useState([
    { name:"Push-ups",      sets:3, reps:15, youtube_url:"" },
    { name:"Squats",        sets:4, reps:12, youtube_url:"" },
    { name:"Plank",         sets:3, reps:60, youtube_url:"" },
    { name:"Jumping Jacks", sets:3, reps:30, youtube_url:"" },
  ]);

  // Progress
  const [clients,  setClients]  = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [history,  setHistory]  = useState([]);
  const [busy,     setBusy]     = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const loadProgress = useCallback(async () => {
    if (!profile) return;
    setBusy(true);
    const [c, s, h] = await Promise.all([
      getTrainerClients(profile.uid),
      getAllClientStatuses(profile.uid),
      getClientStatusHistory(profile.uid),
    ]);
    setClients(c); setStatuses(s); setHistory(h);
    setBusy(false);
  }, [profile]);

  useEffect(() => { if (tab === "progress") loadProgress(); }, [tab, loadProgress]);

  // Publish
  const publish = async () => {
    const d = diet.map(m => ({
      meal: m.meal,
      items: m.items.split(",").map(x => x.trim()).filter(Boolean),
      calories: Number(m.calories),
    }));
    const e = exer.map(x => ({ ...x, sets: Number(x.sets), reps: Number(x.reps) }));
    await upsertDailyPlan(profile.uid, d, e);
    setSaved(true); setTimeout(() => setSaved(false), 3000);
  };

  // Delete client
  const handleDelete = async (clientUid) => {
    setDeleting(clientUid);
    await deleteClient(clientUid);
    setConfirmDel(null);
    await loadProgress();
    setDeleting(null);
  };

  // Chart data
  const statusMap = Object.fromEntries(statuses.map(s => [s.clientUid, s]));

  const barData = clients.map(c => ({
    name: c.displayName.split(" ")[0],
    completed: statusMap[c.uid]?.completedTasks?.length || 0,
  }));

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const date  = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
    const label = format(subDays(new Date(), 6 - i), "EEE");
    return {
      label,
      submitted: history.filter(h => h.date === date).length,
    };
  });

  const dietDone = statuses.reduce((a, s) =>
    a + (s.completedTasks?.filter(t => diet.some(d => d.meal === t)).length || 0), 0);
  const exDone = statuses.reduce((a, s) =>
    a + (s.completedTasks?.filter(t => exer.some(e => e.name === t)).length || 0), 0);
  const pending = Math.max(0, (diet.length + exer.length) * clients.length - dietDone - exDone);
  const pieData = [
    { name:"Diet Done",     value: dietDone },
    { name:"Exercise Done", value: exDone   },
    { name:"Pending",       value: pending  },
  ].filter(d => d.value > 0);

  const submitted = statuses.length;
  const rate = clients.length ? Math.round((submitted / clients.length) * 100) : 0;

  return (
    <div className="page fade-in">
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <p className="section-title" style={{ marginBottom: "0.25rem" }}>
          {format(new Date(), "EEEE, dd MMMM yyyy")}
        </p>
        <h1>Dashboard</h1>
        <div className="alert alert-orange" style={{ marginTop: "0.9rem", fontSize: "0.8rem", padding: "0.65rem 0.9rem" }}>
          🔑 Trainer UID —&nbsp;
          <code style={{ background: "rgba(0,0,0,0.3)", padding: "0.1rem 0.45rem", borderRadius: 4, fontSize: "0.78rem", wordBreak: "break-all" }}>
            {profile?.uid}
          </code>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab==="plan"?"active":""}`}     onClick={() => setTab("plan")}>📋 Today's Plan</button>
        <button className={`tab ${tab==="progress"?"active":""}`} onClick={() => setTab("progress")}>📊 Progress</button>
      </div>

      {/* ── PLAN TAB ──────────────────────────────────────────────────────── */}
      {tab === "plan" && (
        <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>
          {saved && <div className="alert alert-green">✅ Plan published! Clients can see it now.</div>}

          {/* Diet */}
          <div className="card">
            <div className="section-header">
              <h3>🥗 Diet Plan</h3>
              <span style={{ fontSize:"0.8rem", color:"var(--text-3)" }}>
                {diet.reduce((a,m) => a + Number(m.calories), 0)} kcal
              </span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
              {diet.map((m, i) => (
                <div key={i} className="diet-row">
                  <input value={m.meal} placeholder="Meal"
                    onChange={e => setDiet(d => d.map((x,j) => j===i ? {...x,meal:e.target.value} : x))}
                    style={{ fontWeight:700, fontSize:"0.85rem" }} />
                  <input value={m.items} placeholder="Foods, comma-separated"
                    onChange={e => setDiet(d => d.map((x,j) => j===i ? {...x,items:e.target.value} : x))}
                    style={{ fontSize:"0.82rem" }} />
                  <input type="number" value={m.calories} placeholder="kcal"
                    onChange={e => setDiet(d => d.map((x,j) => j===i ? {...x,calories:e.target.value} : x))}
                    style={{ fontSize:"0.82rem" }} />
                  <button className="btn-icon"
                    onClick={() => setDiet(d => d.filter((_,j) => j!==i))}>✕</button>
                </div>
              ))}
            </div>
            <button className="btn btn-ghost btn-sm" style={{ marginTop:"0.75rem" }}
              onClick={() => setDiet(d => [...d, { meal:"New Meal", items:"", calories:0 }])}>
              ➕ Add Meal
            </button>
          </div>

          {/* Exercise */}
          <div className="card">
            <h3 style={{ marginBottom:"1rem" }}>🏋️ Exercise Routine</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.6rem" }}>
              {exer.map((ex, i) => (
                <div key={i} style={{ display:"flex", flexDirection:"column", gap:"0.4rem",
                  background:"var(--bg-3)", padding:"0.85rem", borderRadius:"var(--r-md)",
                  border:"1px solid var(--border)" }}>
                  <div className="input-row">
                    <input value={ex.name} placeholder="Exercise"
                      onChange={e => setExer(d => d.map((x,j) => j===i ? {...x,name:e.target.value} : x))}
                      style={{ fontWeight:700, fontSize:"0.85rem" }} />
                    <input type="number" value={ex.sets} placeholder="Sets"
                      onChange={e => setExer(d => d.map((x,j) => j===i ? {...x,sets:e.target.value} : x))}
                      style={{ fontSize:"0.82rem" }} />
                    <input type="number" value={ex.reps} placeholder="Reps"
                      onChange={e => setExer(d => d.map((x,j) => j===i ? {...x,reps:e.target.value} : x))}
                      style={{ fontSize:"0.82rem" }} />
                    <button className="btn-icon"
                      onClick={() => setExer(d => d.filter((_,j) => j!==i))}>✕</button>
                  </div>
                  <input value={ex.youtube_url} placeholder="▶ YouTube link (optional)"
                    onChange={e => setExer(d => d.map((x,j) => j===i ? {...x,youtube_url:e.target.value} : x))}
                    style={{ fontSize:"0.8rem" }} />
                </div>
              ))}
            </div>
            <button className="btn btn-ghost btn-sm" style={{ marginTop:"0.75rem" }}
              onClick={() => setExer(d => [...d, { name:"New Exercise", sets:3, reps:10, youtube_url:"" }])}>
              ➕ Add Exercise
            </button>
          </div>

          {/* Publish */}
          <button className="btn btn-orange btn-full btn-lg pulse" onClick={publish}>
            🚀 Publish Plan to All Clients
          </button>
        </div>
      )}

      {/* ── PROGRESS TAB ──────────────────────────────────────────────────── */}
      {tab === "progress" && (
        <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>
          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <button className="btn btn-ghost btn-sm" onClick={loadProgress} disabled={busy}>
              {busy ? "Loading…" : "🔄 Refresh"}
            </button>
          </div>

          {/* Metrics */}
          <div className="g4">
            {[
              { label:"Clients",    value:clients.length, sub:"total" },
              { label:"Submitted",  value:submitted,      sub:"today" },
              { label:"Pending",    value:clients.length-submitted, sub:"today" },
              { label:"Rate",       value:`${rate}%`,     sub:"completion", orange:true },
            ].map(m => (
              <div key={m.label} className="metric">
                <div className="metric-label">{m.label}</div>
                <div className={`metric-value ${m.orange?"orange":""}`}>{m.value}</div>
                <div className="metric-sub">{m.sub}</div>
              </div>
            ))}
          </div>

          {clients.length === 0 ? (
            <div className="alert alert-orange">
              No clients linked yet. Share your Trainer UID with clients so they can register.
            </div>
          ) : (
            <>
              {/* Charts */}
              <div className="g2">
                <div className="card">
                  <h4 style={{ marginBottom:"1rem" }}>Tasks Completed Today</h4>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={barData} barSize={24}>
                      <XAxis dataKey="name" tick={{ fill:"var(--text-3)", fontSize:11 }} />
                      <YAxis tick={{ fill:"var(--text-3)", fontSize:11 }} />
                      <Tooltip contentStyle={{ background:"var(--bg-3)", border:"1px solid var(--border-2)", borderRadius:8, fontSize:12 }} />
                      <Bar dataKey="completed" fill="#ff6b00" radius={[5,5,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="card">
                  <h4 style={{ marginBottom:"1rem" }}>Diet vs Exercise</h4>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={70} label={false}>
                        {pieData.map((_, i) => <Cell key={i} fill={COL[i]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background:"var(--bg-3)", border:"1px solid var(--border-2)", borderRadius:8, fontSize:12 }} />
                      <Legend iconType="circle" iconSize={8} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Line chart */}
              <div className="card">
                <h4 style={{ marginBottom:"1rem" }}>📈 7-Day Submission Trend</h4>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={last7}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" tick={{ fill:"var(--text-3)", fontSize:11 }} />
                    <YAxis tick={{ fill:"var(--text-3)", fontSize:11 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ background:"var(--bg-3)", border:"1px solid var(--border-2)", borderRadius:8, fontSize:12 }} />
                    <Line type="monotone" dataKey="submitted" stroke="#22c55e" strokeWidth={2.5} dot={{ fill:"#22c55e", r:3 }} name="Submitted" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Client cards */}
              <div>
                <div className="section-header">
                  <span className="section-title">Client Status</span>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
                  {clients.map(c => {
                    const s    = statusMap[c.uid];
                    const done = s?.completedTasks?.length || 0;
                    const tot  = diet.length + exer.length;
                    const pct  = tot ? Math.round((done/tot)*100) : 0;
                    const isConfirming = confirmDel === c.uid;

                    return (
                      <div key={c.uid} className="card">
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"0.5rem" }}>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", flexWrap:"wrap" }}>
                              <span style={{ fontWeight:700, fontSize:"0.95rem" }}>{c.displayName}</span>
                              <span className={`badge ${s ? "badge-green" : "badge-muted"}`}>
                                {s ? "✅ Submitted" : "⏳ Pending"}
                              </span>
                            </div>
                            <div style={{ fontSize:"0.78rem", color:"var(--text-3)", marginTop:"0.15rem" }}>{c.email}</div>
                          </div>

                          {/* Delete button */}
                          {!isConfirming ? (
                            <button className="btn-icon" title="Remove client"
                              onClick={() => setConfirmDel(c.uid)}>🗑️</button>
                          ) : (
                            <div style={{ display:"flex", gap:"0.4rem", alignItems:"center" }}>
                              <span style={{ fontSize:"0.78rem", color:"var(--red)", fontWeight:700 }}>Remove?</span>
                              <button className="btn btn-danger btn-sm"
                                disabled={deleting === c.uid}
                                onClick={() => handleDelete(c.uid)}>
                                {deleting===c.uid ? "…" : "Yes"}
                              </button>
                              <button className="btn btn-ghost btn-sm"
                                onClick={() => setConfirmDel(null)}>No</button>
                            </div>
                          )}
                        </div>

                        {s && (
                          <div style={{ marginTop:"0.9rem" }}>
                            <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.78rem", color:"var(--text-3)", marginBottom:"0.3rem" }}>
                              <span>Progress</span><span>{done}/{tot} tasks · {pct}%</span>
                            </div>
                            <div className="bar-track">
                              <div className="bar-fill" style={{ width:`${pct}%` }} />
                            </div>
                            {s.completedTasks?.length > 0 && (
                              <div style={{ display:"flex", flexWrap:"wrap", gap:"0.35rem", marginTop:"0.6rem" }}>
                                {s.completedTasks.map(t => (
                                  <span key={t} className="badge badge-green">✓ {t}</span>
                                ))}
                              </div>
                            )}
                            {s.remarks && (
                              <div style={{
                                marginTop:"0.7rem", padding:"0.65rem 0.9rem",
                                background:"var(--bg-3)", borderRadius:"var(--r-md)",
                                borderLeft:"3px solid var(--orange)",
                                color:"var(--text-2)", fontSize:"0.85rem", fontStyle:"italic",
                              }}>
                                "{s.remarks}"
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}