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

app = FastAPI(
    title="Rinexor API",
    description="AI-powered Debt Collection Agency Management Platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("🚀 Starting Rinexor Backend...")
    
    # Initialize database
    try:
        from app.core.database import engine, Base
        # Import models
        from app.models import user, case, dca, case_note, audit
        
        # Create tables if they don't exist
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables verified")
    except Exception as e:
        logger.warning(f"⚠️ Database setup warning: {e}")
    
    # Initialize AI service
    try:
        from app.services.ai_service import AIService
        ai_service = AIService()
        ai_service.initialize()
        logger.info("✅ AI service initialized")
    except Exception as e:
        logger.warning(f"⚠️ AI service warning: {e}")
    
    # Start workflow scheduler
    try:
        from app.services.workflow_scheduler import start_background_scheduler
        start_background_scheduler()
        logger.info("✅ Workflow scheduler started")
    except Exception as e:
        logger.warning(f"⚠️ Scheduler warning: {e}")

@app.get("/")
def root():
    return {"status": "Rinexor backend running", "docs": "/docs"}

@app.get("/api/debug/users")
def debug_users():
    return {"users": list(DEMO_USERS.keys()), "count": len(DEMO_USERS)}

# For running directly
if __name__ == "__main__":
    import uvicorn
    port = 8001  # Default port
    print(f"🚀 Starting on port {port}")
    print(f"📚 Docs: http://localhost:{port}/api/docs")
    uvicorn.run(app, host="0.0.0.0", port=port)