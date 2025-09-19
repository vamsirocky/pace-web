# server/qlearning_app/router.py
import random, uuid
from fastapi import APIRouter, Query
from .models import (
    UserState, QUpdateRequest,
    ActivityStartRequest, ActivityCompleteRequest
)
from .qlearning import epsilon_decay, QLearningAgent
from .db_store_pg import (
    get_q_values, update_q as db_update_q, log_activity, popularity_slice,
    get_active_session_for_user, create_session, get_session_status, mark_session_completed,
    engine
)
from .constants.activities import ACTIVITY_MAP, ACTIVITY_META

router = APIRouter()
from sqlalchemy import text

def bucketize(n_done: int) -> str:
    if n_done == 0: return "0"
    if n_done <= 2: return "1-2"
    if n_done <= 4: return "3-4"
    return "5-6"

ALPHA = 0.2
GAMMA = 0.9
agent = QLearningAgent()  

ALL_ACTIONS = list(ACTIVITY_MAP.keys())

# ---------- Q-values ----------
@router.get("/qvalues")
def qvalues(user_id: str = "demo-user-1", state: str = "0"):
    try:
        qvals = get_q_values(state, ALL_ACTIONS)
        result = {a: float(qvals.get(a, 0.0)) for a in ALL_ACTIONS}
        return {"ok": True, "qvalues": result}
    except Exception as e:
        import traceback; traceback.print_exc()
        return {"ok": False, "error": str(e)}

# ---------- Recommender ----------
@router.post("/recommend")
def recommend_activity(s: UserState):
    actions = s.available_actions or []
    state = s.state_bucket or bucketize(len(s.completed_categories))
    eps = epsilon_decay(len(s.completed_categories))
    q_values = get_q_values(state, actions)

    if not actions:
        return {
            "recommended_activity": None,
            "epsilon_used": eps,
            "state": state,
            "q_values": q_values,
            "decision": "none",
            "popularity": {},
        }

    if random.random() < eps:
        rec, decision = random.choice(actions), "epsilon_random"
    else:
        best_q = max(q_values.values()) if q_values else 0.0
        ties = [a for a, qv in q_values.items() if abs(qv - best_q) < 1e-12]
        if len(ties) == 1:
            rec = ties[0]
        else:
            pop = popularity_slice(ties)
            rec = max(pop, key=pop.get) if pop else random.choice(ties)
        decision = "argmax_q"

    return {
        "recommended_activity": rec,
        "epsilon_used": eps,
        "state": state,
        "q_values": q_values,
        "decision": decision,
        "popularity": popularity_slice(actions),
    }

# ---------- Q Update ----------
@router.post("/update_q")
def update_q(q: QUpdateRequest):
    try:
        new_q = db_update_q(ALPHA, GAMMA, q.state, q.action, q.reward, q.next_state, q.available_actions)
        log_activity(q.user_id, q.state, q.action, q.reward, q.next_state)
        return {"ok": True, "new_q": new_q}
    except Exception as e:
        import traceback; traceback.print_exc()
        return {"ok": False, "error": str(e)}

# ---------- Activity session flow ----------
@router.post("/activity/start")
def activity_start(body: ActivityStartRequest):
    existing = get_active_session_for_user(body.user_id)
    if existing:
        return {
            "ok": True,
            "session_id": existing["session_id"],
            "deep_link": existing.get("deep_link"),
            "status": existing.get("status", "in_progress"),
            "reused": True,
        }

    sid = uuid.uuid4().hex
    base = (body.deep_link_base or "https://your.app/scan").rstrip("/")
    deep_link = f"{base}?session_id={sid}&activity_id={body.activity_id}&user_id={body.user_id}"
    create_session(sid, body.user_id, body.activity_id, body.state, deep_link)
    return {"ok": True, "session_id": sid, "deep_link": deep_link, "status": "in_progress", "reused": False}

@router.get("/activity/status")
def activity_status(session_id: str = Query(..., min_length=8)):
    status = get_session_status(session_id)
    if not status:
        return {"ok": False, "error": "not_found"}
    return {"ok": True, "status": status}

@router.post("/activity/complete")
def activity_complete(body: ActivityCompleteRequest):
    """Called by the mobile app after scanning/completing."""
    mark_session_completed(body.session_id)

    with engine.begin() as conn:
        row = conn.execute(
            text("""
                SELECT user_id, activity_id, state
                FROM activity_sessions
                WHERE session_id = :sid
            """),
            {"sid": body.session_id}
        ).mappings().first()

    if not row:
        return {"ok": False, "error": "session_not_found"}

    user_id = row["user_id"]
    action = row["activity_id"]
    state = row["state"] or ""

    #  Pull reward from ACTIVITY_META
    meta = ACTIVITY_META.get(action, {})
    reward = float(meta.get("points", 10))   # fallback = 10
    next_state = bucketize(1)

    # Update Q-values + log
    new_q = db_update_q(ALPHA, GAMMA, state, action, reward, next_state, [action])
    log_activity(user_id, state, action, reward, next_state)

    # Push reward points to profile service (5001)
    import requests
    try:
        resp = requests.post(
            f"https://pace-backend.onrender.com/profile/{user_id}/points",
            json={"points": int(reward)}   # adjust if redeemable differs
        )
        if resp.status_code != 200:
            print("⚠️ Failed to sync profile points:", resp.text)
    except Exception as e:
        print("⚠️ Profile sync error:", str(e))

    return {
        "ok": True,
        "updated_q": new_q,
        "state": state,
        "next_state": next_state,
        "reward": reward
    }


@router.get("/activity/active")
def activity_active(user_id: str = Query(..., min_length=3)):
    try:
        sess = get_active_session_for_user(user_id)
        if not sess:
            return {"ok": True, "status": "none"}
        return {
            "ok": True,
            "session_id": sess.get("session_id"),
            "activity_id": sess.get("activity_id"),
            "status": sess.get("status", "in_progress"),
            "deep_link": sess.get("deep_link"),
        }
    except Exception as e:
        import traceback; traceback.print_exc()
        return {"ok": False, "error": str(e)}

# ---------- Activity logs ----------
@router.get("/activity/logs")
def activity_logs(user_id: str = Query(..., min_length=3)):
    try:
        with engine.begin() as conn:
            rows = conn.execute(
                text("""
                    SELECT session_id, activity_id, state, completed_at, reward
                    FROM activity_sessions
                    WHERE user_id = :uid AND status = 'completed'
                    ORDER BY completed_at DESC
                """),
                {"uid": user_id}
            ).mappings().all()

        activities = []
        for r in rows:
            aid = r["activity_id"]
            cat_id = ACTIVITY_MAP.get(aid)
            meta = ACTIVITY_META.get(aid, {})

            #  map to human-readable category name
            CATEGORY_LABELS = {
                "donate": "Donate & Buy",
                "volunteer": "Volunteer & Lead",
                "advocate": "Advocate",
                "wellness": "Body • Mind",
                "recycle": "Reuse/Recycle",
                "wildlife": "Protect Wildlife",
            }

            activities.append({
                "id": r["session_id"],
                "activity_id": aid,
                "title": meta.get("title", aid),
                "category": cat_id,
                "category_label": CATEGORY_LABELS.get(cat_id, cat_id),  # 👈 add this
                "state": r["state"],
                "date": str(r["completed_at"].date()) if r["completed_at"] else None,
                "points": int(r["reward"] or meta.get("points", 0)),
                "sdgs": meta.get("sdgs", []),
            })

        return {"ok": True, "activities": activities}
    except Exception as e:
        import traceback; traceback.print_exc()
        return {"ok": False, "error": str(e)}

