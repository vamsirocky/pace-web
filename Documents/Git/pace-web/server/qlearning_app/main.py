# server/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.qlearning_app.router import router as ql_router

app = FastAPI()

# allow both localhost and 127.0.0.1 (Vite dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ql_router, prefix="/ai")

@app.get("/healthz")
def healthz():
    return {"ok": True}

# helpful on startup to see what's actually mounted
@app.on_event("startup")
def dump_routes():
    print("ROUTES:", [r.path for r in app.routes])
