from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from app.api import auth, cases
from app.api.auth import DEMO_USERS

app = FastAPI(title="Rinexor API", description="DCA Management Platform API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(cases.router)

@app.get("/")
def root():
    return {"status": "Rinexor backend running", "docs": "/docs"}

@app.get("/api/debug/users")
def debug_users():
    return {"users": list(DEMO_USERS.keys()), "count": len(DEMO_USERS)}

