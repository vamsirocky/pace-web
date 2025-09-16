# server/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Import routers using absolute paths (run `uvicorn server.main:app`)
from server.org_app.router import router as org_router
from server.qlearning_app.router import router as ql_router

# Import engine just to ensure the module loads and the psycopg event listeners are registered
from server.qlearning_app.db_store_pg import engine 

ALLOWED_ORIGINS = {"http://localhost:5173", "http://127.0.0.1:5173"}

app = FastAPI()




@app.get("/")
def root():
    return {"message": "Backend is live with ngrok!"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(ALLOWED_ORIGINS),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helpful error body in dev + keeps CORS headers on errors
@app.exception_handler(Exception)
async def catch_all(request, exc):
    import traceback
    tb = traceback.format_exc()
    origin = request.headers.get("origin")
    resp = JSONResponse(status_code=500, content={"error": str(exc), "trace": tb})
    if origin in ALLOWED_ORIGINS:
        resp.headers["Access-Control-Allow-Origin"] = origin
        resp.headers["Vary"] = "Origin"
    return resp

# Mount both routers
app.include_router(org_router, prefix="/org")
app.include_router(ql_router,  prefix="/ai")

@app.get("/healthz")
def healthz():
    return {"ok": True}

@app.on_event("startup")
def dump_routes():
    # quick visibility that /org endpoints are actually registered
    print("ROUTES:", [r.path for r in app.routes])
