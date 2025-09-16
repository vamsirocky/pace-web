# server/qlearning_app/db_store_pg.py
import os
from math import exp
from pathlib import Path
from typing import Iterable, Dict, Optional, Tuple

from sqlalchemy import create_engine, text, event
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv
from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse

# Load env from server/.env so DATABASE_URL is available when running uvicorn
load_dotenv(dotenv_path=(Path(__file__).resolve().parent.parent / ".env"))

DB_URL = os.getenv("DATABASE_URL") or os.getenv("SUPABASE_DB_URL")
if not DB_URL:
    raise RuntimeError("DATABASE_URL or SUPABASE_DB_URL not set.")

# ensure SQLAlchemy uses psycopg v3 driver
if DB_URL.startswith("postgresql://"):
    DB_URL = DB_URL.replace("postgresql://", "postgresql+psycopg://", 1)

def _ensure_query_param(url: str, key: str, value: str) -> str:
    """Ensure a query parameter (e.g. prepare_threshold=0) is present in the DSN."""
    u = urlparse(url)
    q = dict(parse_qsl(u.query, keep_blank_values=True))
    q.setdefault(key, value)
    new_q = urlencode(q)
    return urlunparse((u.scheme, u.netloc, u.path, u.params, new_q, u.fragment))

DB_URL = _ensure_query_param(DB_URL, "prepare_threshold", "0")

# --- ENGINE ---
engine = create_engine(
    DB_URL,
    future=True,
    poolclass=NullPool,
    pool_pre_ping=True,
    connect_args={"prepare_threshold": 0},
)

@event.listens_for(engine, "connect")
def _psycopg_no_prepares(dbapi_conn, _):
    """Disable prepared statements for every new DB connection."""
    try:
        dbapi_conn.prepare_threshold = 0
    except Exception:
        pass
    try:
        old = getattr(dbapi_conn, "autocommit", False)
        dbapi_conn.autocommit = True
        with dbapi_conn.cursor() as cur:
            cur.execute("DEALLOCATE ALL")
    except Exception:
        pass
    finally:
        try:
            dbapi_conn.autocommit = old
        except Exception:
            pass

# ---------- Schema bootstrap ----------
def init() -> None:
    ddl = """
    create table if not exists public.q_values (
      state text not null,
      action text not null,
      q_value double precision not null default 0,
      updated_at timestamptz not null default now(),
      primary key (state, action)
    );

    create table if not exists public.activity_log (
      id bigserial primary key,
      user_id text,
      action text not null,
      state text not null,
      next_state text not null,
      reward double precision not null,
      ts timestamptz not null default now()
    );

    create index if not exists idx_activity_action_ts
      on public.activity_log(action, ts);

    create table if not exists public.activity_sessions (
      session_id text primary key,
      user_id text not null,
      activity_id text not null,
      state text not null,
      status text not null default 'in_progress',
      deep_link text,
      created_at timestamptz not null default now(),
      completed_at timestamptz
    );

    create index if not exists idx_activity_sessions_user
      on public.activity_sessions(user_id)
      where status = 'in_progress';
    """

    statements = [
        s.strip()
        for s in ddl.split(";")
        if s.strip() and not s.strip().startswith("--")
    ]
    with engine.begin() as conn:
        for stmt in statements:
            conn.exec_driver_sql(stmt)

def _in_clause(names: Iterable[str], prefix: str) -> Tuple[str, Dict[str, str]]:
    items = list(names)
    if not items:
        return "", {}
    placeholders = ", ".join(f":{prefix}{i}" for i in range(len(items)))
    params = {f"{prefix}{i}": v for i, v in enumerate(items)}
    return placeholders, params

# ---------- Q-learning storage ----------
def get_q_values(state: str, actions: Iterable[str]) -> Dict[str, float]:
    acts = list(actions)
    if not acts:
        return {}
    ph, params = _in_clause(acts, "a")
    params.update({"s": state})
    with engine.begin() as conn:
        rows = conn.execute(
            text(f"""
                select action, q_value from q_values
                where state=:s and action in ({ph})
            """),
            params,
        ).mappings().all()
    found = {r["action"]: float(r["q_value"]) for r in rows}
    for a in acts:
        if a not in found:
            found[a] = 0.0
    return found

def get_max_next(next_state: str, actions: Iterable[str]) -> float:
    acts = list(actions)
    if not acts:
        return 0.0
    ph, params = _in_clause(acts, "a")
    params.update({"s": next_state})
    with engine.begin() as conn:
        row = conn.execute(
            text(f"""
                select max(q_value) as mx from q_values
                where state=:s and action in ({ph})
            """),
            params,
        ).fetchone()
    return float(row[0]) if row and row[0] is not None else 0.0

def upsert_q(state: str, action: str, new_q: float) -> None:
    with engine.begin() as conn:
        conn.execute(
            text("""
                insert into q_values(state, action, q_value, updated_at)
                values (:s, :a, :q, now())
                on conflict (state, action) do update
                   set q_value = excluded.q_value,
                       updated_at = now()
            """),
            {"s": state, "a": action, "q": float(new_q)},
        )

def log_activity(user_id: str, state: str, action: str, reward: float, next_state: str) -> None:
    with engine.begin() as conn:
        conn.execute(
            text("""
                insert into activity_log(user_id, action, state, next_state, reward)
                values (:u, :a, :s, :n, :r)
            """),
            {"u": user_id, "a": action, "s": state, "n": next_state, "r": float(reward)},
        )

def popularity_slice(actions: Iterable[str], lookback_days: int = 90, half_life_days: int = 30) -> Dict[str, float]:
    acts = list(actions)
    if not acts:
        return {}
    ph, params = _in_clause(acts, "a")
    params.update({"lb": lookback_days})
    with engine.begin() as conn:
        rows = conn.execute(
            text(f"""
                select action, extract(epoch from now()-ts) as age
                from activity_log
                where action in ({ph}) and ts > now() - (:lb || ' days')::interval
            """),
            params,
        ).mappings().all()
    tau = (half_life_days * 86400) / 0.69314718056
    scores = {a: 0.0 for a in acts}
    for r in rows:
        age = float(r["age"])
        scores[r["action"]] += exp(-age / tau)
    return scores

def update_q(alpha: float, gamma: float, state: str, action: str,
             reward: float, next_state: str, next_actions: Iterable[str]) -> float:
    cur_q = get_q_values(state, [action]).get(action, 0.0)
    max_next = get_max_next(next_state, next_actions)
    new_q = cur_q + alpha * (reward + gamma * max_next - cur_q)
    upsert_q(state, action, new_q)
    return new_q

# ---------- Activity session storage ----------
def get_active_session_for_user(user_id: str) -> Optional[Dict]:
    with engine.begin() as conn:
        row = conn.execute(
            text("""
                select session_id, activity_id, state, status, deep_link
                  from activity_sessions
                 where user_id=:u and status='in_progress'
                 order by created_at desc
                 limit 1
            """),
            {"u": user_id},
        ).mappings().first()
    return dict(row) if row else None

def create_session(session_id: str, user_id: str, activity_id: str, state: str, deep_link: str) -> None:
    with engine.begin() as conn:
        conn.execute(
            text("""
                insert into activity_sessions(session_id, user_id, activity_id, state, deep_link, status)
                values (:sid, :u, :a, :s, :dl, 'in_progress')
            """),
            {"sid": session_id, "u": user_id, "a": activity_id, "s": state, "dl": deep_link},
        )

def get_session_status(session_id: str) -> Optional[str]:
    with engine.begin() as conn:
        row = conn.execute(
            text("select status from activity_sessions where session_id=:sid"),
            {"sid": session_id},
        ).fetchone()
    return row[0] if row else None

def mark_session_completed(session_id: str, reward: int = 10) -> None:
    with engine.begin() as conn:
        conn.execute(
            text("""
                update activity_sessions
                   set status='completed',
                       completed_at=now(),
                       reward=:r
                 where session_id=:sid
            """),
            {"sid": session_id, "r": reward},
        )

