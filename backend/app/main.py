import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .routers import dataset, analytics, rankings, players, auction, reports
from .data_processing.loader import data_loader
from .analytics.pressure_engine import pressure_engine
from .analytics.batting_analytics import batting_analytics
from .analytics.bowling_analytics import bowling_analytics
from .analytics.reliability_engine import reliability_engine
from .reports.pdf_generator import pdf_generator

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure pipeline is warm and reports generated
    print("Initializing Royal Intelligence Analytics Pipeline...")
    _ = data_loader.data_summary
    _ = pressure_engine.df_reconstructed
    _ = batting_analytics.df_batting
    _ = bowling_analytics.df_bowling
    _ = reliability_engine.calculate_all_rankings()
    # Pre-generate initial reports
    try:
        pdf_generator.generate_methodology_report()
        pdf_generator.generate_rankings_csv()
    except Exception as e:
        print(f"Initial report generation notice: {e}")
    print("Royal Intelligence Backend is ready.")
    yield

app = FastAPI(
    title="Royal Intelligence API",
    description="Backend Analytics Engine for Rajasthan Royals SupeRR Selector Season 2",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all modular routers
app.include_router(dataset.router)
app.include_router(analytics.router)
app.include_router(rankings.router)
app.include_router(players.router)
app.include_router(auction.router)
app.include_router(reports.router)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "system": "Royal Intelligence Engine",
        "version": "2.0.0",
        "environment": "Rajasthan Royals SupeRR Selector Season 2"
    }

# Serve Frontend static assets if built
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
assets_dir = os.path.join(frontend_dist, "assets")
if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

if os.path.exists(frontend_dist):
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Don't intercept API routes or documentation
        if full_path.startswith("api/") or full_path in ["docs", "redoc", "openapi.json"]:
            return None
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"message": "Royal Intelligence API is running. Build frontend for UI."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
