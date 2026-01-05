from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
    return {
        "status": "running",
        "service": "Rinexor Backend",
        "version": "1.0.0",
        "docs": "/api/docs",
        "health": "/api/health"
    }

@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "rinexor-backend",
        "version": "1.0.0"
    }

# Import and include routers
try:
    from app.api import auth, cases, dcas, admin, ai, reports
    
    app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
    app.include_router(cases.router, prefix="/api/v1/cases", tags=["cases"])
    app.include_router(dcas.router, prefix="/api/v1/dcas", tags=["dcas"])
    app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])
    app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"])
    app.include_router(reports.router, prefix="/api/v1/reports", tags=["reports"])
    
    logger.info("✅ All API routers loaded")
except ImportError as e:
    logger.error(f"❌ Failed to load API routers: {e}")

# For running directly
if __name__ == "__main__":
    import uvicorn
    port = 8001  # Default port
    print(f"🚀 Starting on port {port}")
    print(f"📚 Docs: http://localhost:{port}/api/docs")
    uvicorn.run(app, host="0.0.0.0", port=port)