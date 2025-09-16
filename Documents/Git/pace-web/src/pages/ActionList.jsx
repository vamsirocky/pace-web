// src/pages/ActionList.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { FaHeart, FaHandsHelping, FaBullhorn, FaDumbbell, FaRecycle, FaPaw } from "react-icons/fa";
import "./styles/ActionList.css";
import ActivityModal from "../components/ActivityModal";
import { ACTIVITY_META, ID_MAP } from "../constants/activities";

const ACTIONS = [
  { id: "donate",    title: "Donate & Buy", icon: <FaHeart />,        acts: ["Note Sharing Day", "Buy eco product"] },
  { id: "volunteer", title: "Volunteer & Lead", icon: <FaHandsHelping />, acts: ["One-Tap Survey", "Lead a drive"] },
  { id: "advocate",  title: "Advocate & Empower", icon: <FaBullhorn />,     acts: ["Smoke-Free Selfie Spot", "Sustainable Startup Pitch"] },
  { id: "wellness",  title: "Strengthen Body-Mind-Spirit", icon: <FaDumbbell />, acts: ["Stairs for Sustainability", "Power-Up Gym Challenge"] },
  { id: "recycle",   title: "Reuse, Reduce, Recycle", icon: <FaRecycle />,      acts: ["Refill & Reuse Challenge", "Reusable Mug Campaign"] },
  { id: "wildlife",  title: "Protect Wildlife", icon: <FaPaw />,          acts: ["Meatless Monday Meals", "Report a sighting"] },
];

// const ID_MAP = {
//   donate:   ["CAT01_A1", "CAT01_A2"],
//   volunteer:["CAT02_A1", "CAT02_A2"],
//   advocate: ["CAT03_A1", "CAT03_A2"],
//   wellness: ["CAT04_A1", "CAT04_A2"],
//   recycle:  ["CAT05_A1", "CAT05_A2"],
//   wildlife: ["CAT06_A1", "CAT06_A2"],
// };
const ACTION_KEYS = Object.keys(ID_MAP);

// export const ACTIVITY_META = {
//   CAT01_A1: { title: "Note Sharing Day", desc: "Submit course notes to shared repo. QR confirms participation.", rewardText: "Stationery pack", points: 15 },
//   CAT01_A2: { title: "Buy eco product", desc: "Purchase eco-friendly product. Upload receipt in app after scan.", rewardText: "5% shop coupon", points: 10 },
//   CAT02_A1: { title: "One-Tap Survey", desc: "Complete one-question sustainability poll.", rewardText: "Snack coupon", points: 5 },
//   CAT02_A2: { title: "Lead a drive", desc: "Organize a donation or cleanliness drive.", rewardText: "Organizer badge", points: 15 },
//   CAT03_A1: { title: "Smoke-Free Selfie Spot", desc: "Take a selfie at ‘I Didn’t Smoke’ booth.", rewardText: "Prize draw entry", points: 10 },
//   CAT03_A2: { title: "Sustainable Startup Pitch", desc: "Pitch an idea for a sustainability-focused service.", rewardText: "Innovation badge", points: 25 },
//   CAT04_A1: { title: "Stairs for Sustainability", desc: "Take stairs instead of elevator. QR on each landing.", rewardText: "Free smoothie voucher", points: 10 },
//   CAT04_A2: { title: "Power-Up Gym Challenge", desc: "Use energy-generating gym equipment.", rewardText: "Cafeteria meal", points: 10 },
//   CAT05_A1: { title: "Refill & Reuse Challenge", desc: "Refill bottle at campus station instead of buying plastic.", rewardText: "Sticker set", points: 8 },
//   CAT05_A2: { title: "Reusable Mug Campaign", desc: "Bring reusable mug to café.", rewardText: "Discount token", points: 10 },
//   CAT06_A1: { title: "Meatless Monday Meals", desc: "Choose vegetarian/vegan meal on Mondays.", rewardText: "Free dessert", points: 12 },
//   CAT06_A2: { title: "Report a sighting", desc: "Report wildlife responsibly in the app.", rewardText: "Explorer badge", points: 10 },
// };

const BASE_URL = "http://localhost:8000/ai";
const APP_DEEP_LINK_BASE = "https://your.app/scan";

// function toCategory(activityId) { return activityId.split("_")[0]; }

export default function ActionList() {
  const activityOrder = useMemo(() => {
    const arr = [];
    ACTIONS.forEach((a, row) =>
      a.acts.forEach((label, col) =>
        arr.push({ key: `${a.id}-${col}`, row, col, label, actionId: a.id })
      )
    );
    return arr;
  }, []);

  const refs = useRef(activityOrder.map(() => null));
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [started, setStarted] = useState(false);
  const [activeSession, setActiveSession] = useState(null);

const userId = localStorage.getItem("user_id");

  // 🟢 On mount, check if user already has an active session
  useEffect(() => {
    async function fetchActive() {
      try {
        const res = await fetch(`${BASE_URL}/activity/active?user_id=${userId}`);
        const data = await res.json();
        if (data?.ok && data.status === "in_progress") {
          setActiveSession({
            session_id: data.session_id,
            activity_id: data.activity_id,
          });
          setStarted(true);
          pollStatus(data.session_id, data.activity_id);
        }
      } catch (err) {
        console.error("[AI] fetchActive error:", err);
      }
    }
    fetchActive();
  }, []);

  function onTileClick(flatIdx) {
    if (activeSession?.session_id) {
      alert("⚠️ Please complete the ongoing activity before starting a new one.");
      return;
    }
    const row = Math.floor(flatIdx / 2);
    const col = flatIdx % 2;
    const actionKey = ACTION_KEYS[row];
    const actId = ID_MAP[actionKey][col];
    const label = ACTIONS[row].acts[col];
    setSelected({ id: actId, label, flatIdx });
    setStarted(false);
    setModalOpen(true);
  }

  async function startSelected() {
    if (!selected) return;
    try {
      const res = await fetch(`${BASE_URL}/activity/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          activity_id: selected.id,
          state: "", // could store completedCats later
          deep_link_base: APP_DEEP_LINK_BASE,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.session_id) throw new Error(data?.error || "start failed");

      setStarted(true);
      setActiveSession({ session_id: data.session_id, activity_id: selected.id });
      pollStatus(data.session_id, selected.id);
    } catch (e) {
      console.error("[AI] start error:", e);
    }
  }

  // Poll DB until activity is completed
  async function pollStatus(sessionId, activityId, attempt = 0) {
    if (!sessionId) return;
    try {
      const res = await fetch(
        `${BASE_URL}/activity/status?session_id=${encodeURIComponent(sessionId)}`
      );
      const data = await res.json();

      if (data?.status === "completed") {
        const reward = ACTIVITY_META[activityId]?.points ?? 10;
        const state = ""; 
        const nextState = ""; 
        try {
          await fetch(`${BASE_URL}/update_q`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: userId,
              state,
              action: activityId,
              reward,
              next_state: nextState,
              available_actions: Object.values(ID_MAP).flat(),
            }),
          });
        } catch (err) {
          console.error("[AI] update_q error:", err);
        }

        setActiveSession(null);
        setStarted(false);
        setModalOpen(false);
        return;
      }
    } catch (err) {
      console.error("[AI] pollStatus error:", err);
    }
    const delay = Math.min(3000 + attempt * 250, 6000);
    setTimeout(() => pollStatus(sessionId, activityId, attempt + 1), delay);
  }

  return (
    <div className="actions-page">
      <h2 className="actions-heading">Choose a Sustainable Activity</h2>
      <div className="actions-grid">
        {ACTIONS.map((a, rowIndex) => (
          <div className="actions-row" key={a.id}>
            <button className="action-card" type="button">
              <div className="action-icon">{a.icon}</div>
              <div className="action-texts">
                <div className="action-title">{a.title}</div>
              </div>
            </button>
            {a.acts.map((label, colIndex) => {
              const flatIdx = rowIndex * 2 + colIndex;
              const row = Math.floor(flatIdx / 2);
              const col = flatIdx % 2;
              const actId = ID_MAP[ACTION_KEYS[row]][col];
              const isLocked = activeSession && activeSession.activity_id !== actId;
              return (
                <button
                  key={`${a.id}-${colIndex}`}
                  className={`activity-card ${isLocked ? "is-disabled" : ""}`}
                  type="button"
                  ref={(el) => (refs.current[flatIdx] = el)}
                  onClick={() => onTileClick(flatIdx)}
                  disabled={!!isLocked}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {selected && (
        <ActivityModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          activity={{
            label: ACTIVITY_META[selected.id]?.title || selected.label,
            desc: ACTIVITY_META[selected.id]?.desc,
          }}
          meta={ACTIVITY_META[selected.id]}
          started={started}
          onStart={startSelected}
        />
      )}
    </div>
  );
}
