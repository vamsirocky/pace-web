// src/pages/org/OrgDashboard.jsx
import { useEffect, useState } from "react";
import "./styles/OrgDashboard.css";

const RAW = import.meta?.env?.VITE_API_URL || "http://127.0.0.1:8000/ai";
const API_ROOT = RAW.replace(/\/ai\/?$/, "");

function apiUrl(path, params) {
  const url = new URL(path, API_ROOT);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

async function safeGet(path, fallback) {
  try {
    const res = await fetch(path, { credentials: "include" });
    const ct = res.headers.get("content-type") || "";
    const body = ct.includes("application/json") ? await res.json() : await res.text();
    if (!res.ok) {
      const msg = typeof body === "object" && body?.error ? body.error : String(body);
      throw new Error(msg);
    }
    return body;
  } catch (e) {
    console.error("GET", path, "failed:", e);
    return fallback;
  }
}

// ---- Catalog ----
const CATEGORIES = [
  { id: "donate",    name: "Donate & Buy",     emoji: "❤️" },
  { id: "volunteer", name: "Volunteer & Lead", emoji: "🤝" },
  { id: "advocate",  name: "Advocate",         emoji: "📣" },
  { id: "wellness",  name: "Body • Mind",      emoji: "💪" },
  { id: "recycle",   name: "Reuse/Recycle",    emoji: "♻️" },
  { id: "wildlife",  name: "Protect Wildlife", emoji: "🐾" },
];

const ACTIONS_BY_CAT = {
  donate:    [{ id: "CAT01_A1", label: "Note Sharing Day" }, { id: "CAT01_A2", label: "Buy eco product" }],
  volunteer: [{ id: "CAT02_A1", label: "One-Tap Survey" },   { id: "CAT02_A2", label: "Lead a drive" }],
  advocate:  [{ id: "CAT03_A1", label: "Selfie Spot" },      { id: "CAT03_A2", label: "Startup Pitch" }],
  wellness:  [{ id: "CAT04_A1", label: "Stairs Challenge" }, { id: "CAT04_A2", label: "Gym Power-Up" }],
  recycle:   [{ id: "CAT05_A1", label: "Refill & Reuse" },   { id: "CAT05_A2", label: "Reusable Mug" }],
  wildlife:  [{ id: "CAT06_A1", label: "Meatless Monday" },  { id: "CAT06_A2", label: "Report a sighting" }],
};

const CAT_BY_PREFIX = {
  CAT01_: "donate",
  CAT02_: "volunteer",
  CAT03_: "advocate",
  CAT04_: "wellness",
  CAT05_: "recycle",
  CAT06_: "wildlife",
};

// Colors per category (keeps legend consistent with slices)
const CAT_COLORS = {
  donate:    "#4666FF",
  volunteer: "#00C2FF",
  advocate:  "#00D4B3",
  wellness:  "#FFC145",
  recycle:   "#FF6B6B",
  wildlife:  "#9B59B6",
};

function labelForAction(id) {
  for (const arr of Object.values(ACTIONS_BY_CAT)) {
    const hit = arr.find(a => a.id === id);
    if (hit) return hit.label;
  }
  return id;
}
function categoryFromAction(id) {
  const p = Object.keys(CAT_BY_PREFIX).find(k => id?.startsWith(k));
  return p ? CAT_BY_PREFIX[p] : "unknown";
}
function sparkPath(trend, w = 180, h = 56) {
  if (!trend?.length) return "";
  const vals = trend.map(t => Number(t.count ?? t));
  const max = Math.max(...vals), min = Math.min(...vals);
  const span = Math.max(1, max - min);
  const stepX = w / Math.max(1, vals.length - 1);
  const pts = vals.map((v, i) => {
    const x = Math.round(i * stepX);
    const y = Math.round(h - ((v - min) / span) * h);
    return `${x},${y}`;
  });
  return `M${pts[0]} L${pts.slice(1).join(" ")}`;
}

/* ---------------- Animated donut pie (percent by default, value on hover) --- */
function DonutPie({ data, size = 220, inner = 0.64, unit = "", showThreshold = 0.06 }) {
  // data: [{ value, color, label }]
  const total = Math.max(1, data.reduce((s, d) => s + (Number(d.value) || 0), 0));
  const R = size / 2;
  const r = R * inner;
  const TAU = Math.PI * 2;

  let start = -Math.PI / 2; // 12 o'clock
  const slices = [];

  data.forEach((d) => {
    const value = Number(d.value) || 0;
    const frac = value / total;
    if (frac <= 0) return;

    const angle = frac * TAU;
    const end = start + angle;
    const large = angle > Math.PI ? 1 : 0;

    // points around arcs
    const x0 = R + R * Math.cos(start), y0 = R + R * Math.sin(start);
    const x1 = R + R * Math.cos(end),   y1 = R + R * Math.sin(end);
    const xi = R + r * Math.cos(end),   yi = R + r * Math.sin(end);
    const xi0 = R + r * Math.cos(start), yi0 = R + r * Math.sin(start);

    const path = [
      `M ${x0} ${y0}`,
      `A ${R} ${R} 0 ${large} 1 ${x1} ${y1}`,
      `L ${xi} ${yi}`,
      `A ${r} ${r} 0 ${large} 0 ${xi0} ${yi0}`,
      "Z",
    ].join(" ");

    // mid label
    const mid = (start + end) / 2;
    const lr = (R + r) / 2;
    const lx = R + lr * Math.cos(mid);
    const ly = R + lr * Math.sin(mid);

    const pct = Math.round(frac * 100);
    slices.push({
      path,
      color: d.color,
      pctText: `${pct}%`,
      valText: unit ? `${value} ${unit}` : String(value),
      lx, ly,
      show: frac >= showThreshold,
    });

    start = end;
  });

  const empty = slices.length === 0;

  return (
    <svg className="pie-svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Donut chart">
      {empty ? (
        <>
          <circle cx={R} cy={R} r={R} fill="#f2f2f2" />
          <circle cx={R} cy={R} r={r} fill="#fff" />
          <text x={R} y={R} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="#666">No data</text>
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
          {/* tidy inner punch */}
          <circle cx={R} cy={R} r={r - 1} fill="#fff" />
        </>
      )}
    </svg>
  );
}
/* ------------------------------------------------------------------------- */

export default function OrgDashboard() {
  const [selected, setSelected] = useState("all"); // "all" or category id
  const [range, setRange] = useState({ days: 30, bucket: "day" });

  // top KPIs (rate removed)
  const [metrics, setMetrics] = useState({ participants: 0, completions: 0, pointsTotal: 0 });

  // existing activity cards
  const [rows, setRows] = useState([]);
  const [recent, setRecent] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  // NEW: category pies + category mini trends
  const [catSummary, setCatSummary] = useState([]); // [{category, users, completions, points}]
  const [catTrends, setCatTrends]   = useState([]); // [{id,label,trend:[prev,curr]}]

  // download SDG report (moved into KPI row)
  async function downloadReport() {
    const params = new URLSearchParams({
      company: "Organization",
      days: String(range.days),
      ...(selected !== "all" ? { category: selected } : {}),
    });
    const url = apiUrl(`/org/report/sdg.docx?${params.toString()}`);
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) {
      const txt = await res.text();
      alert(`Failed to generate report:\n${txt}`);
      return;
    }
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `SDG_Report_${Date.now()}.docx`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const m = await safeGet(
        apiUrl("/org/metrics", { days: range.days, bucket: range.bucket, ...(selected !== "all" ? { category: selected } : {}) }),
        { participants: 0, completions: 0, pointsTotal: 0 }
      );

      const a = await safeGet(
        apiUrl("/org/actions", { days: range.days, bucket: range.bucket, ...(selected !== "all" ? { category: selected } : {}), limit: selected === "all" ? 12 : 6 }),
        []
      );

      const r = await safeGet(
        apiUrl("/org/recent", { limit: 20, ...(selected !== "all" ? { category: selected } : {}) }),
        []
      );

      // NEW category endpoints (always for the same time window; not filtered by selected on purpose)
      const cs = await safeGet(apiUrl("/org/categories/summary", { days: range.days }), []);
      const ct = await safeGet(apiUrl("/org/categories/trends", { bucket: range.bucket }), []);

      if (cancelled) return;

      setMetrics({
        participants: Number(m.participants ?? 0),
        completions: Number(m.completions ?? 0),
        pointsTotal: Number(m.pointsTotal ?? m.points_total ?? 0),
      });

      const arrA = Array.isArray(a) ? a : [];
      const shaped = arrA.map((x) => ({
        id: x.id,
        label: labelForAction(x.id),
        completions: Number(x.completions ?? 0),
        trend: Array.isArray(x.trend) ? x.trend : [],
      }));
      setRows(selected === "all" ? shaped.sort((p, q) => (q.completions - p.completions)).slice(0, 6) : shaped);

      const arrR = Array.isArray(r) ? r : [];
      setRecent(arrR.map((it) => ({ ...it, category: it.category ?? categoryFromAction(it.action) })));

      setCatSummary(Array.isArray(cs) ? cs : []);
      setCatTrends(Array.isArray(ct) ? ct : []);

      if ((!Array.isArray(a) || !Array.isArray(r)) && !errorMsg) {
        setErrorMsg("Some data failed to load. Check server logs for details.");
      }
    }

    run();
    return () => { cancelled = true; };
  }, [selected, range.days, range.bucket]); // eslint-disable-line react-hooks/exhaustive-deps

  const title = selected === "all"
    ? "All Categories (Overview)"
    : (CATEGORIES.find((c) => c.id === selected)?.name || "Category");

  // pies: compute vectors in category order
  const usersVector  = CATEGORIES.map(c => Number(catSummary.find(x => x.category === c.id)?.users  || 0));
  const pointsVector = CATEGORIES.map(c => Number(catSummary.find(x => x.category === c.id)?.points || 0));

  return (
    <div className="orgdash">
      <aside className="orgdash__side">
        <div className="orgdash__brand">
          <div className="orgdash__avatar">🏢</div>
          <div>
            <div className="orgdash__brandtitle">Organization</div>
            <div className="orgdash__brandsub">Admin Console</div>
          </div>
        </div>

        <nav className="orgdash__nav">
          <button
            className={`orgdash__navitem ${selected === "all" ? "is-active" : ""}`}
            onClick={() => setSelected("all")}
          >
            <span className="orgdash__navicon">📊</span>
            <span>Overview</span>
          </button>

          <div className="orgdash__navlabel">Categories</div>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              className={`orgdash__navitem ${selected === c.id ? "is-active" : ""}`}
              onClick={() => setSelected(c.id)}
            >
              <span className="orgdash__navicon">{c.emoji}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="orgdash__main">
        <header className="orgdash__header">
          <h1 className="orgdash__title">{title}</h1>
          <div className="orgdash__filters">
            <select
              className="orgdash__select"
              value={`${range.bucket}:${range.days}`}
              onChange={(e) => {
                const [bkt, d] = e.target.value.split(":");
                setRange({ bucket: bkt, days: Number(d) });
              }}
            >
              <option value="day:7">Last 7 days (daily)</option>
              <option value="day:30">Last 30 days (daily)</option>
              <option value="week:90">Last 90 days (weekly)</option>
              <option value="month:365">Last 12 months (monthly)</option>
            </select>
          </div>
        </header>

        {!!errorMsg && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card__head"><div className="card__title">Heads up</div></div>
            <div style={{ padding: "8px 16px" }}>{errorMsg}</div>
          </div>
        )}

        {/* KPI row — donut removed; SDG button sits in its place */}
        <section className="orgdash__grid orgdash__grid--kpis">
          <div className="kpi">
            <div className="kpi__label">No. of Participants</div>
            <div className="kpi__value">{Number(metrics.participants || 0).toLocaleString()}</div>
          </div>
          <div className="kpi">
            <div className="kpi__label">No. Of Completed Activities</div>
            <div className="kpi__value">{Number(metrics.completions || 0).toLocaleString()}</div>
          </div>
          <div className="kpi">
            <div className="kpi__label">Total Points Awarded</div>
            <div className="kpi__value">{Math.round(Number(metrics.pointsTotal || 0)).toLocaleString()}</div>
          </div>
          <div className="kpi kpi--action">
            <button className="btn btn--primary" onClick={downloadReport}>⬇️ Download SDG Report</button>
          </div>
        </section>

        {/* NEW: Category Overview row */}
        <section className="orgdash__grid orgdash__grid--charts">
          <div className="card">
            <div className="card__head">
              <div className="card__title">Category Overview</div>
              <div className="card__sub">Share of users & points</div>
            </div>

            <div className="pies">
              <div className="pieblock">
                <div className="pieblock__title">Users by category</div>
                <DonutPie
                  data={CATEGORIES.map((c) => {
                    const row = (catSummary || []).find((x) => x.category === c.id) || { users: 0 };
                    return { value: row.users, color: CAT_COLORS[c.id], label: c.name };
                  })}
                  size={220}
                  inner={0.64}
                  unit=""   /* raw count on hover */
                />
              </div>
              <div className="pieblock">
                <div className="pieblock__title">Points by category</div>
                <DonutPie
                  data={CATEGORIES.map((c) => {
                    const row = (catSummary || []).find((x) => x.category === c.id) || { points: 0 };
                    return { value: Math.round(row.points || 0), color: CAT_COLORS[c.id], label: c.name };
                  })}
                  size={220}
                  inner={0.64}
                  unit="pts" /* shows “### pts” on hover */
                />
              </div>

              <div className="legend">
                {CATEGORIES.map((c) => (
                  <div className="legend__item" key={c.id}>
                    <span className="legend__swatch" style={{ background: CAT_COLORS[c.id] }} />
                    <span>{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card__head">
              <div className="card__title">Category Mini Trends</div>
              <div className="card__sub">Last 2 buckets</div>
            </div>
            <div className="sparks">
              {CATEGORIES.map((c) => {
                const row = catTrends.find(t => t.id === c.id) || { trend: [0, 0] };
                return (
                  <div className="sparks__item" key={c.id}>
                    <div className="sparks__label">{c.name}</div>
                    <svg className="sparks__svg" viewBox="0 0 180 56" preserveAspectRatio="none">
                      <path d={sparkPath(row.trend)} />
                    </svg>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* EXISTING: By Activity + Activity Mini Trends row (shifted down) */}
        <section className="orgdash__grid orgdash__grid--charts">
          <div className="card">
            <div className="card__head">
              <div className="card__title">By Activity</div>
              <div className="card__sub">Top {selected === "all" ? "6" : rows.length} by completions</div>
            </div>
            <div className="bars">
              {(() => {
                const max = Math.max(1, ...rows.map(r => r.completions || 0));
                return rows.map((r) => (
                  <div className="bars__row" key={r.id}>
                    <div className="bars__label">{r.label}</div>
                    <div className="bars__barwrap">
                      <div
                        className="bars__bar"
                        style={{ width: `${Math.round((r.completions / max) * 100)}%` }}
                        title={`${r.completions} completions`}
                      />
                    </div>
                    <div className="bars__value">{r.completions}</div>
                  </div>
                ));
              })()}
            </div>
          </div>

          <div className="card">
            <div className="card__head">
              <div className="card__title">Mini Trends</div>
              <div className="card__sub">Last {rows[0]?.trend?.length || 0} buckets</div>
            </div>
            <div className="sparks">
              {rows.map((r) => (
                <div className="sparks__item" key={r.id}>
                  <div className="sparks__label">{r.label}</div>
                  <svg className="sparks__svg" viewBox="0 0 180 56" preserveAspectRatio="none">
                    <path d={sparkPath(r.trend)} />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent table unchanged */}
        <section className="card">
          <div className="card__head">
            <div className="card__title">Recent Verified Activity</div>
            <div className="card__sub">Most recent 20 scans</div>
          </div>
          <div className="table">
            <div className="table__row table__row--head">
              <div>Time</div>
              <div>User</div>
              <div>Category</div>
              <div>Activity</div>
              <div className="t-right">Points</div>
            </div>
            {(Array.isArray(recent) ? recent : []).map((r, i) => (
              (selected === "all" || r.category === selected) && (
                <div className="table__row" key={i}>
                  <div>{r.ts}</div>
                  <div>{r.user}</div>
                  <div>{CATEGORIES.find(c => c.id === r.category)?.name || r.category}</div>
                  <div>{labelForAction(r.action)}</div>
                  <div className="t-right">{Math.round(Number(r.points || 0))}</div>
                </div>
              )
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
