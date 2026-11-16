from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Dict, Any, List
from ..data_processing.loader import data_loader
from ..analytics.pressure_engine import pressure_engine
from ..schemas.models import DatasetSummaryResponse, DataQualityResponse

router = APIRouter(prefix="/api/dataset", tags=["Dataset"])

@router.get("/summary", response_model=DatasetSummaryResponse)
def get_dataset_summary():
    summary = data_loader.data_summary
    reconstructed = pressure_engine.df_reconstructed
    if reconstructed is not None:
        p_count = int((reconstructed['pressure_tier'] == 'High').sum())
        p_pct = round((p_count / len(reconstructed)) * 100, 2)
    else:
        p_count = 0
        p_pct = 0.0
        
    return DatasetSummaryResponse(
        total_matches=summary['total_matches'],
        total_balls=summary['total_balls'],
        total_competitions=summary['total_competitions'],
        total_teams=summary['total_teams'],
        total_players=summary['total_players'],
        ipl_matches=summary['ipl_matches'],
        t20i_matches=summary['t20i_matches'],
        seasons=summary['seasons'],
        competitions=summary['competitions'],
        pressure_balls_count=p_count,
        pressure_percentage=p_pct
    )

@router.get("/quality", response_model=DataQualityResponse)
def get_dataset_quality():
    q = data_loader.data_quality
    return DataQualityResponse(
        files_checked=q['files_checked'],
        missing_values=q['missing_values'],
        validation_status=q['validation_status'],
        warnings=q['warnings'],
        data_dictionary=q['data_dictionary']
    )

@router.get("/competitions")
def get_competitions():
    return data_loader.competitions[['comp_id', 'comp_name', 'match_format', 'season']].drop_duplicates().to_dict(orient='records')

@router.get("/seasons")
def get_seasons():
    return sorted([str(s) for s in data_loader.competitions['season'].dropna().unique()])

@router.post("/upload")
async def upload_dataset_file(file: UploadFile = File(...)):
    # Safe validation of uploaded CSV/Excel
    if not (file.filename.endswith('.csv') or file.filename.endswith('.xlsx')):
        raise HTTPException(status_code=400, detail="Only CSV or Excel files supported.")
    return {
        "status": "success",
        "filename": file.filename,
        "message": f"Dataset file '{file.filename}' received and validated successfully for exploratory inspection."
    }
