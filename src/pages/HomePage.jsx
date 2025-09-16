import { useMemo, useState, useRef, useEffect } from "react";
import "./styles/HomePage.css";
// import { useNavigate } from "react-router-dom";
import StrengthenPage from "./actions/StrengthenPage";
import DonatePage from "./actions/DonatePage"; 
import ActionList from "./ActionList";
// import { ACTIVITY_META } from "./ActionList";
import { ACTIVITY_META } from "../constants/activities";


/* =============================================================================
   CONSTANTS
   - Categories list + emojis
   - Colors for donut chart
   - Aliases (normalize messy category names)
============================================================================= */
const CATEGORIES = [
  { id: "donate",    name: "Donate & Buy",     emoji: "❤️" },
  { id: "volunteer", name: "Volunteer & Lead", emoji: "🤝" },
  { id: "advocate",  name: "Advocate",         emoji: "📣" },
  { id: "wellness",  name: "Body • Mind",      emoji: "💪" },
  { id: "recycle",   name: "Reuse/Recycle",    emoji: "♻️" },
  { id: "wildlife",  name: "Protect Wildlife", emoji: "🐾" },
];

const CAT_COLORS = {
  donate:    "#4666FF",
  volunteer: "#00C2FF",
  advocate:  "#00D4B3",
  wellness:  "#FFC145",
  recycle:   "#FF6B6B",
  wildlife:  "#9B59B6",
};
const BADGE_TIERS = [
  { name: "Participant", emoji: "🌼", min: 0,   max: 199 },
  { name: "Contributor", emoji: "🌱", min: 200, max: 399 },
  { name: "Eco Hero",    emoji: "🌿", min: 400, max: 599 },
  { name: "Warrior",     emoji: "💪", min: 600, max: 799 },
  { name: "Champion",    emoji: "🌟", min: 800, max: Infinity },
];

// Map DB activity IDs -> ACTIVITY_META keys
const ACTIVITY_MAP = {
  "CAT01_A1": "donate",
  "CAT01_A2": "donate",
  "CAT02_A1": "volunteer",
  "CAT02_A2": "volunteer",
  "CAT03_A1": "advocate",
  "CAT03_A2": "advocate",
  "CAT04_A1": "wellness",
  "CAT04_A2": "wellness",
  "CAT05_A1": "recycle",
  "CAT05_A2": "recycle",
  "CAT06_A1": "wildlife",
  "CAT06_A2": "wildlife",
};

// const bestActivityKey = ACTIVITY_MAP[bestActivityId] || null;
// const bestActivity = bestActivityKey ? ACTIVITY_META[bestActivityKey] : null;

// Normalize labels → category IDs
const N = (s = "") => s.toLowerCase().replace(/[\s·&/.-]+/g, "");
const CAT_ALIASES = new Map([
  ["donate", "donate"], ["donatebuy", "donate"], ["donate&buy", "donate"],
  ["volunteer", "volunteer"], ["volunteerlead","volunteer"], ["volunteer&lead","volunteer"],
  ["advocate","advocate"],
  ["wellness","wellness"], ["bodymind","wellness"], ["body•mind","wellness"], ["body&mind","wellness"],
  ["recycle","recycle"], ["reuserecycle","recycle"], ["reuse/recycle","recycle"],
  ["wildlife","wildlife"], ["protectwildlife","wildlife"],
]);
const toCatId = (label) => CAT_ALIASES.get(N(label)) || null;
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
function getCategoryData(categoryKey) {
  return past.filter(p =>
    p.category?.toLowerCase().includes(categoryKey.toLowerCase())
  );
}

/* =============================================================================
   DONUT PIE COMPONENT
   - Pure SVG chart
   - Used in "Your Contribution Mix"
============================================================================= */
function DonutPie({ data, size = 220, inner = 0.64, unit = "", showThreshold = 0.06 }) {
  const total = Math.max(1, data.reduce((s, d) => s + (Number(d.value) || 0), 0));
  const R = size / 2;
  const r = R * inner;
  const TAU = Math.PI * 2;

  let start = -Math.PI / 2; // start at 12 o’clock
  const slices = [];

  data.forEach((d) => {
    const value = Number(d.value) || 0;
    const frac = value / total;
    if (frac <= 0) return;

    const angle = frac * TAU;
    const end = start + angle;
    const large = angle > Math.PI ? 1 : 0;

    // Arc geometry
    const x0 = R + R * Math.cos(start), y0 = R + R * Math.sin(start);
    const x1 = R + R * Math.cos(end),   y1 = R + R * Math.sin(end);
    const xi  = R + r * Math.cos(end),  yi  = R + r * Math.sin(end);
    const xi0 = R + r * Math.cos(start), yi0 = R + r * Math.sin(start);

    const path = [
      `M ${x0} ${y0}`,
      `A ${R} ${R} 0 ${large} 1 ${x1} ${y1}`,
      `L ${xi} ${yi}`,
      `A ${r} ${r} 0 ${large} 0 ${xi0} ${yi0}`,
      "Z",
    ].join(" ");

    const mid = (start + end) / 2;
    const lr = (R + r) / 2;
    const lx = R + lr * Math.cos(mid);
    const ly = R + lr * Math.sin(mid);

    const pct = Math.round(frac * 100);
    slices.push({
      path,
      color: d.color,
      lx, ly,
      pctText: `${pct}%`,
      valText: unit ? `${value} ${unit}` : String(value),
      show: frac >= showThreshold,
    });

    start = end;
  });

  return (
    <svg className="pie-svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img">
      {slices.length === 0 ? (
        <>
          <circle cx={R} cy={R} r={R} fill="#f2f2f2" />
          <circle cx={R} cy={R} r={r} fill="#fff" />
          <text x={R} y={R} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="#666">
            No data
          </text>
        </>
      ) : (
        <>
          {slices.map((s, i) => (
            <g key={i} className="slice">
              <path d={s.path} fill={s.color} />
              {s.show && (
                <>
                  <text className="label label--pct" x={s.lx} y={s.ly}>{s.pctText}</text>
                  <text className="label label--value" x={s.lx} y={s.ly}>{s.valText}</text>
                </>
              )}
            </g>
          ))}
          {/* White center hole */}
          <circle cx={R} cy={R} r={r - 1} fill="#fff" />
        </>
      )}
    </svg>
  );
}

/* =============================================================================
   MODAL COMPONENT
   - Used for Donate, Daily Challenge, Activities, Wellness, Leaderboard
============================================================================= */
function Modal({ title, open, onClose, children, width = 600 }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
     <div 
  className="modal-card" 
  style={{ maxWidth: `${width}px`, width: "100%" }}   //  force px units + allow scaling
  onClick={(e) => e.stopPropagation()}
>

        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}



/* =============================================================================
   HOME PAGE
   - Layout is 6-column grid (avatar, points, leaderboard, etc.)
============================================================================= */
export default function HomePage() {
  /* ----------------------- STATE ----------------------- */
  const [leaders, setLeaders] = useState([]);         // leaderboard list
  const [totalPoints, setTotalPoints] = useState(0);  // logged-in user’s total points
  const [redeemablePoints, setRedeemablePoints] = useState(0); // user’s redeemable points
  const [past, setPast] = useState([]);     
  const [activeSession, setActiveSession] = useState(null);
          // past activities
  //  Raw activity-level Q-values
const [qValues, setQValues] = useState({});


  
// const navigate = useNavigate();
  /* ----------------------- DATA FETCH ----------------------- */
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;
// Fetch Q-values from backend
//  Fetch raw activity Q-values
fetch("http://localhost:8000/ai/qvalues")
  .then(res => res.json())
  .then(data => {
    if (!data.ok || !data.qvalues) return;
    setQValues(data.qvalues); // e.g. { CAT01_A1: 20, CAT02_A1: 5, ... }
  })
  .catch(err => console.error("Q-values fetch failed:", err));


//  Leaderboard: don’t overwrite my points
fetch("http://localhost:5001/api/leaderboard")
  .then(res => res.json())
  .then(data => {
    setLeaders(data);
  })
  .catch(err => console.error("Leaderboard fetch failed:", err));

//  Profile: source of truth for my points
if (userId) {
  fetch(`http://localhost:5001/profile/${userId}`)
    .then(res => res.json())
    .then(data => {
      setTotalPoints(data.points_total || 0);
      setRedeemablePoints(data.points_redeemable || 0);
    })
    .catch(err => console.error("Profile fetch failed:", err));
}
//  Fetch active session from backend
  fetch(`http://localhost:8000/ai/activity/active?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
      if (data?.ok && data.status === "in_progress") {
        setActiveSession({
          id: data.activity_id,
          session_id: data.session_id,
        });
      } else {
        setActiveSession(null);
      }
    })
    .catch(err => console.error("Active session fetch failed:", err));


    //  Fetch activity logs
 //  Fetch completed activities
fetch(`http://localhost:8000/ai/activity/logs?user_id=${userId}`)
  .then(res => res.json())
  .then(data => {
    if (data.ok && data.activities) {
      setPast(data.activities);   // directly use backend response
    }
  })
  .catch(err => console.error("Activity logs fetch failed:", err));


   
  }, []);
// Best activity (highest Q-value)
const bestActivityId = useMemo(() => {
  if (!qValues || Object.keys(qValues).length === 0) return null;

  const entries = Object.entries(qValues).filter(([_, val]) => val > 0);
  if (entries.length === 0) return null;

  const [id] = entries.sort((a, b) => b[1] - a[1])[0];
  return id;
}, [qValues]);

const bestActivity = bestActivityId ? ACTIVITY_META[bestActivityId] : null;
const handleStartActivity = async () => {
  try {
    const res = await fetch("http://localhost:8000/ai/activity/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: localStorage.getItem("user_id"),
        activity_id: bestActivityId,   // e.g. "CAT01_A1"
        state: "0"                     // required field
      }),
    });

    const data = await res.json();
    console.log("Start response:", data);

    if (data.ok) {
      alert("Activity started!");
    } else {
      alert("Failed to start: " + data.error);
    }
  } catch (err) {
    console.error("Error starting activity:", err);
  }
};
const handleStartDailyChallenge = async () => {
  if (!dailyChallenge) return;

  const userId = localStorage.getItem("user_id");
  if (!userId) {
    alert("User not logged in");
    return;
  }

  try {
    const res = await fetch("http://localhost:8000/ai/activity/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        activity_id: dailyChallenge.id,  // ✅ map to actual activity ID
        state: "0",
      }),
    });

    const data = await res.json();
    if (data.ok) {
      setActiveSession({
        id: dailyChallenge.id,
        session_id: data.session_id,
      });
      setOpen(o => ({ ...o, daily: false })); // close modal after starting
    } else {
      console.error("Start failed:", data.error);
      alert("Could not start activity: " + (data.error || "unknown error"));
    }
  } catch (err) {
    console.error("Error starting daily challenge:", err);
  }
};



// Daily challenge (lowest Q-value)
const lowestQId = useMemo(() => {
  if (!qValues || Object.keys(qValues).length === 0) return null;

  const entries = Object.entries(qValues);
  if (entries.length === 0) return null;

  const [id] = entries.sort((a, b) => a[1] - b[1])[0];
  return id;
}, [qValues]);

const dailyChallengeId = useMemo(() => {
  const entries = Object.entries(qValues);
  if (entries.length === 0) return null;
  return entries.sort((a, b) => a[1] - b[1])[0][0];  // lowest Q
}, [qValues]);

const dailyChallenge = dailyChallengeId ? ACTIVITY_META[dailyChallengeId] : null;



  // SDG contribution stars
  // Count unique SDGs from past activities
const sdgCount = useMemo(() => {
  const s = new Set();
  past.forEach(p => p.sdgs.forEach(x => s.add(x)));
  return s.size;
}, [past]);

 const currentBadge = useMemo(() => {
  return BADGE_TIERS.find(t => totalPoints >= t.min && totalPoints <= t.max) || BADGE_TIERS[0];
}, [totalPoints]);

  // Contribution mix (points per category)
  const pointsByCategory = useMemo(() => {
    const byId = new Map();
    past.forEach(p => {
      const id = toCatId(p.category);
      if (!id) return;
      byId.set(id, (byId.get(id) || 0) + (Number(p.points) || 0));
    });
    return CATEGORIES.map(c => ({
      label: c.name,
      color: CAT_COLORS[c.id],
      value: byId.get(c.id) || 0,
    }));
  }, [past]);

  /* ----------------------- AVATAR VIDEO ----------------------- */
  const isNewUser = false; // TODO: wire this to onboarding flag
  const avatarSrc = isNewUser ? "/Avatar_new_user.mp4" : "/Avatar_active_user.mp4";
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const unmuteAndPlay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause(); v.currentTime = 0; v.muted = false;
    setMuted(false);
    v.play().catch(() => {});
  };

  /* ----------------------- MODALS ----------------------- */
const [open, setOpen] = useState({
  donate: false, daily: false, activities: false, wellness: false,
  leaderboard: false, assistance: false   // 👈 add assistance modal
});

const [form, setForm] = useState({ name: "", age: "", email: "", message: "" });
const [sending, setSending] = useState(false);
const [selected, setSelected] = useState("overview");
const renderContent = () => {
  // helper: filter activities by category keyword
  const filterByCategory = (keyword) =>
    past.filter((p) =>
      p.category?.toLowerCase().includes(keyword.toLowerCase())
    );

  // helper: build chart data
  const makeChartData = (rows) =>
    rows.map((r) => ({
      name: r.title.length > 12 ? r.title.slice(0, 12) + "…" : r.title,
      points: r.points,
    }));
  switch (selected) {
    case "overview":
      return (
        <>
          {/* Avatar video */}
          <section className="panel avatar avatar-video">
            <div className="avatar-video-wrap">
              <video
                ref={videoRef}
                src={avatarSrc}
                autoPlay
                muted={muted}
                playsInline
                preload="auto"
                onEnded={(e) => e.currentTarget.pause()}
                className="avatar-video-element"
              />
              {muted && (
                <button className="unmute-btn" onClick={unmuteAndPlay}>
                  🔊 Tap to unmute
                </button>
              )}
            </div>
          </section>

          {/* SDG counter */}
          <section className="panel rating">
            <div className="metric">
              <div className="metric-label">SDGs Contributed</div>
              <div className="metric-num">{sdgCount}</div>
              <div className="metric-badge">
                {currentBadge.emoji} {currentBadge.name}
              </div>
            </div>
          </section>

          {/* Points (total + redeemable) */}
          <section className="points-col">
            <div className="panel points-mini">
              <div className="metric">
                <div className="metric-label">Total Points</div>
                <div className="metric-num">{totalPoints}</div>
              </div>
            </div>
            <div className="panel points-mini">
              <div className="metric">
                <div className="metric-label">Redeemable Points</div>
                <div className="metric-num">{redeemablePoints}</div>
              </div>
            </div>
          </section>

          {/* Sidebar buttons */}
          <div className="orange-col">
            <button
              className="orange-btn"
              onClick={() => setOpen((o) => ({ ...o, donate: true }))}
            >
              Donate
            </button>
            <button
              className="orange-btn"
              onClick={() => setOpen((o) => ({ ...o, daily: true }))}
            >
              Daily Challenge
            </button>
            <button
              className="orange-btn"
              onClick={() => setOpen((o) => ({ ...o, wellness: true }))}
            >
              How Do You Feel Today?
            </button>
          </div>

          {/* Contribution mix */}
          <section className="panel breakdown">
            <h3>Your Contribution Mix</h3>
            <div className="donut-wrap">
              <DonutPie
                data={pointsByCategory}
                size={220}
                inner={0.64}
                unit="pts"
              />
              <div className="legend">
                {CATEGORIES.map((c) => (
                  <div className="legend__item" key={c.id}>
                    <span
                      className="legend__swatch"
                      style={{ background: CAT_COLORS[c.id] }}
                    />
                    <span>{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Current activity + suggestion */}
          <div className="stack-col">
            <section className="panel current">
              <h3>Current Activity</h3>
              {activeSession ? (
                <div className="current-activity-card">
                  <h4>
                    {ACTIVITY_META[activeSession.id]?.title ||
                      activeSession.id}
                  </h4>
                  <div className="status-badge in-progress">In Progress</div>
                </div>
              ) : (
                <p>No activity in progress</p>
              )}
            </section>

            <section className="panel next">
              <h3>AI Avatar suggests next activity</h3>
              {bestActivity ? (
                <p
                  className="suggested-activity"
                  style={{
                    cursor: "pointer",
                    color: "#4666FF",
                    fontWeight: "500",
                  }}
                  onClick={() => setOpen((o) => ({ ...o, aiSuggestion: true }))}
                >
                  {bestActivity.title}
                </p>
              ) : (
                <p>No suggestions available</p>
              )}
            </section>

            <section className="panel activities-btn activity-card">
              <button
                className="orange-btn wide"
                onClick={() => setOpen((o) => ({ ...o, activities: true }))}
              >
                Activities List
              </button>
            </section>
          </div>

          {/* Leaderboard */}
          <section className="panel leaderboard">
            <h3>Leaderboard</h3>
            <ul className="lb">
              {leaders.slice(0, 3).map((r, i) => (
                <li key={i}>
                  <span>{i + 1}.</span>
                  <b>{r.name}</b>
                  <span className="right">{r.points_total}</span>
                </li>
              ))}
            </ul>
            <button
              className="link-btn"
              onClick={() => setOpen((o) => ({ ...o, leaderboard: true }))}
            >
              See full board
            </button>
          </section>

          {/* Assistance Button */}
          <section className="panel assistance-panel">
            <button
              className="orange-btn wide"
              onClick={() => setOpen((o) => ({ ...o, assistance: true }))}
            >
              Need Assistance?
            </button>
          </section>

          {/* Past activities */}
          <section className="panel past">
            <h3>Past Activities List</h3>
            <div className="table">
              <div className="t-head">
                <span>Date</span>
                <span>Activity</span>
                <span>Category</span>
                <span>Points</span>
                <span>SDGs</span>
              </div>
              {past.map((row) => (
                <div className="t-row" key={row.id}>
                  <span>{row.date}</span>
                  <span>{row.title}</span>
                  <span>{row.category_label || "Unknown"}</span>
                  <span>{row.points}</span>
                  <span>
                    {row.sdgs.length > 0 ? row.sdgs.join(", ") : "-"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </>
      );

    case "donate":
case "volunteer":
case "advocate":
case "wellness":
case "recycle":
case "wildlife": {
  const rows = filterByCategory(selected);
  const chartData = makeChartData(rows);
  const total = rows.reduce((s, r) => s + r.points, 0);

  // group by title for donut chart
  const grouped = rows.reduce((acc, r) => {
    acc[r.title] = (acc[r.title] || 0) + r.points;
    return acc;
  }, {});
  const donutData = Object.entries(grouped).map(([label, value], i) => ({
    label,
    value,
    color: Object.values(CAT_COLORS)[i % Object.values(CAT_COLORS).length],
  }));

  const titles = {
    donate: "Donate & Buy",
    volunteer: "Volunteer & Lead",
    advocate: "Advocacy",
    wellness: "Body & Mind",
    recycle: "Reuse & Recycle",
    wildlife: "Protect Wildlife",
  };
  const colors = {
    donate: "#4666FF",
    volunteer: "#00C2FF",
    advocate: "#00D4B3",
    wellness: "#FFC145",
    recycle: "#FF6B6B",
    wildlife: "#9B59B6",
  };

  return (
    <section className="mini-dashboard">
      <h3>{titles[selected]} – Mini Dashboard</h3>

      {/* total points summary */}
      <p><strong>Total Points:</strong> {total}</p>

      {/* charts row */}
      <div className="mini-dashboard-charts">
        {/* Bar chart */}
        <div>
          {rows.length > 0 ? (
            <div style={{ width: "100%", height: 280 }}>
  <div style={{ width: "100%", height: "100%" }}>
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="points" fill={colors[selected]} />
    </BarChart>
  </ResponsiveContainer>
</div>
</div>

          ) : (
            <p>No activities logged yet.</p>
          )}
        </div>

        {/* Donut chart */}
        <div>
          {donutData.length > 0 ? (
            <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
  <DonutPie data={donutData} size={200} unit="pts" />
</div>

          ) : (
            <p>No breakdown data</p>
          )}
        </div>
      </div>

      {/* past activities table */}
      <div className="table" style={{ marginTop: "1rem" }}>
        <div className="t-head">
          <span>Date</span><span>Activity</span><span>Points</span>
        </div>
        {rows.map((row) => (
          <div className="t-row" key={row.id}>
            <span>{row.date}</span>
            <span>{row.title}</span>
            <span>{row.points}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

default:
  return <p>Select a section from the sidebar</p>;
}
};


// ---------------- HANDLER ----------------
const handleSendAssistance = async () => {
  if (!form.name || !form.age || !form.email || !form.message) {
    alert("Please fill in all fields");
    return;
  }
  setSending(true);

  try {
    const res = await fetch("http://localhost:5001/api/send-assistance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.ok) {
      alert("Your query was sent successfully!");
      setForm({ name: "", age: "", email: "", message: "" });
      setOpen(o => ({ ...o, assistance: false }));
    } else {
      alert("Failed: " + data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Error sending query");
  } finally {
    setSending(false);
  }
};

  /* ----------------------- RENDER ----------------------- */
  return (
    <div className="hp-shell">
      {/* ===================== SIDEBAR ===================== */}
      <aside className="home__side">
        <div className="home__brand">
          <div className="home__avatar">🌿</div>
          <div>
            <div className="home__brandtitle">PACE</div>
            <div className="home__brandsub">Your Hub</div>
          </div>
        </div>

        <nav className="home__nav">
          <div className="home__navlabel">Overview</div>
          <button className={`home__navitem ${selected === "overview" ? "is-active" : ""}`}
                  onClick={() => setSelected("overview")}>
            <span className="home__navicon">🏠</span><span>Home</span>
          </button>

          <div className="home__navlabel">Categories</div>
          {CATEGORIES.map(c => (
            <button key={c.id}
              className={`home__navitem ${selected === c.id ? "is-active" : ""}`}
              onClick={() => setSelected(c.id)}>
              <span className="home__navicon">{c.emoji}</span><span>{c.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* ===================== MAIN GRID ===================== */}
      
      <div className="hp-wire hp-wire--six">
  {renderContent()}
</div>


      {/* ===================== MODALS ===================== */}
  


{/* Assistance Modal */}
<Modal
  title="Need Assistance?"
  open={open.assistance}
  onClose={() => setOpen(o => ({ ...o, assistance: false }))}
  width={600}
>
  <form
    className="assist-form"
    onSubmit={async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const payload = Object.fromEntries(formData.entries());

      try {
        const res = await fetch("http://localhost:5001/api/send-assistance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.ok) {
          alert("Your query has been sent successfully!");
          setOpen(o => ({ ...o, assistance: false }));
        } else {
          alert("Failed to send: " + data.error);
        }
      } catch (err) {
        console.error("Error sending assistance:", err);
        alert("An error occurred while sending your query.");
      }
    }}
  >
    <input type="text" name="name" placeholder="Your Name" required />
    <input type="number" name="age" placeholder="Your Age" required />
    <input type="email" name="email" placeholder="Your Email" required />
    <textarea name="message" rows="4" placeholder="Type your message..." required />
    <button type="submit" className="orange-btn">Send</button>
  </form>
</Modal>


<Modal 
  // title="Donate" 
  open={open.donate} 
  onClose={() => setOpen(o => ({...o, donate:false}))}
  width={720}
>
  {/* Pass popup mode so it looks compact */}
  <DonatePage isPopup={true} />
</Modal>

      <Modal 
  title="Daily Challenge" 
  open={open.daily} 
  onClose={() => setOpen(o => ({...o, daily:false}))}
>
  {dailyChallengeId && ACTIVITY_META[dailyChallengeId] ? (
    <>
      <p>Your lowest Q-value activity for today:</p>
      <div className="challenge-card">
        <h4>{ACTIVITY_META[dailyChallengeId].title}</h4>
        <p>{ACTIVITY_META[dailyChallengeId].desc}</p>
        <p><strong>Reward:</strong> {ACTIVITY_META[dailyChallengeId].rewardText}</p>
        <p className="muted">Worth <b>{ACTIVITY_META[dailyChallengeId].points}</b> points on completion.</p>

        <button
          className="pill-btn"
          onClick={() => {
            const userId = localStorage.getItem("user_id");
            if (!userId) {
              alert("No user logged in");
              return;
            }

            // ✅ Use the actual activity_id from dailyChallengeId
            const payload = {
              user_id: userId,
              activity_id: dailyChallengeId,
              state: "0",
            };

            console.log("Starting daily challenge:", payload);

            fetch("http://localhost:8000/ai/activity/start", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
              .then(res => res.json())
              .then(data => {
                if (data.ok) {
                  alert("Daily Challenge Started!");
                  setActiveSession({
                    id: dailyChallengeId,
                    session_id: data.session_id,
                  });
                  setOpen(o => ({...o, daily:false}));
                } else {
                  console.error("Start failed:", data);
                  alert("Failed to start activity");
                }
              })
              .catch(err => {
                console.error("Fetch error:", err);
                alert("Error starting activity");
              });
          }}
        >
          Start Challenge
        </button>
      </div>
    </>
  ) : (
    <p>No daily challenge available</p>
  )}
</Modal>


<Modal 
  title="All Activities" 
  open={open.activities} 
  onClose={() => setOpen(o => ({...o, activities:false}))}
  width={850}   
>
  <ActionList />
</Modal>
<Modal 
  title="Suggested Activity" 
  open={open.aiSuggestion} 
  onClose={() => setOpen(o => ({ ...o, aiSuggestion: false }))} 
  width={500}
>
  {bestActivity ? (
    <>
      <h4>{bestActivity.title}</h4>
      <p>{bestActivity.desc}</p>
      <p><strong>Reward:</strong> {bestActivity.rewardText}</p>
      <p><strong>Points:</strong> {bestActivity.points}</p>

      {/* Start button only inside popup */}
      <button className="pill-btn" onClick={handleStartActivity}>
        Start Activity
      </button>
    </>
  ) : (
    <p>No suggestion available</p>
  )}
</Modal>









     <Modal 
  title="Wellness Check-in" 
  open={open.wellness} 
  onClose={() => setOpen(o => ({...o, wellness:false}))}
  width={720} // optional wider modal
>
  <StrengthenPage isPopup={true} />
</Modal>

      <Modal title="Leaderboard" open={open.leaderboard} onClose={() => setOpen(o => ({...o, leaderboard:false}))}>
        <ol className="full-board">
          {leaders.map((r,i)=><li key={i}><b>{r.name}</b> — {r.points_total} pts</li>)}
        </ol>
      </Modal>
    </div>
  );
}
