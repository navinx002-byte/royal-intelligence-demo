import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from ..reports.pdf_generator import pdf_generator
from ..analytics.reliability_engine import reliability_engine

router = APIRouter(prefix="/api", tags=["Reports"])

@router.post("/reports/generate")
def generate_all_reports():
    pdf_path = pdf_generator.generate_methodology_report()
    bat_csv, bowl_csv = pdf_generator.generate_rankings_csv()
    
    return {
        "status": "success",
        "generated_files": {
            "methodology_report_pdf": os.path.basename(pdf_path),
            "top_batters_csv": os.path.basename(bat_csv),
            "top_bowlers_csv": os.path.basename(bowl_csv)
        },
        "message": "All official competition deliverables generated successfully."
    }

@router.get("/reports/download/{report_type}")
def download_report(report_type: str):
    reports_dir = pdf_generator.reports_dir
    
    if report_type == "methodology_pdf":
        target = os.path.join(reports_dir, "Royal_Intelligence_Methodology_Report.pdf")
        if not os.path.exists(target):
            pdf_generator.generate_methodology_report()
        return FileResponse(target, media_type="application/pdf", filename="Royal_Intelligence_Methodology_Report.pdf")
        
    elif report_type == "batters_csv":
        target = os.path.join(reports_dir, "Top_Batters_Under_Pressure.csv")
        if not os.path.exists(target):
            pdf_generator.generate_rankings_csv()
        return FileResponse(target, media_type="text/csv", filename="Top_Batters_Under_Pressure.csv")
        
    elif report_type == "bowlers_csv":
        target = os.path.join(reports_dir, "Top_Bowlers_Under_Pressure.csv")
        if not os.path.exists(target):
            pdf_generator.generate_rankings_csv()
        return FileResponse(target, media_type="text/csv", filename="Top_Bowlers_Under_Pressure.csv")
        
    else:
        raise HTTPException(status_code=404, detail="Invalid report type.")

@router.get("/methodology")
def get_methodology_documentation():
    return {
        "project": "ROYAL INTELLIGENCE",
        "competition": "Rajasthan Royals SupeRR Selector Season 2 – Round 1",
        "challenge": "Identify the Most Reliable Players Under Pressure",
        "deliverables": [
            "Top 10 Batters Under Pressure Ranking",
            "Top 10 Bowlers Under Pressure Ranking",
            "Official Methodology Document (PDF & Web)"
        ],
        "methodology_sections": [
            {
                "id": "pressure_definition",
                "title": "1. Multi-Dimensional Pressure Modeling",
                "content": "Pressure in T20 cricket differs starkly between chasing and target-setting. In chasing, pressure is driven by Required Run Rate (RRR) relative to balls remaining, wickets in hand, and death phase acceleration. In 1st innings, pressure is driven by early top-order collapse (crisis response) and death phase execution (overs 16–20)."
            },
            {
                "id": "batting_metrics",
                "title": "2. Batting Pressure Formulation",
                "content": "Measures Strike Rate Elevation (SR_pressure - SR_normal), Pressure Batting Average, Boundary Percentage under pressure, and match consistency. We do not reward players simply for scoring high aggregate runs in low-pressure situations."
            },
            {
                "id": "bowling_metrics",
                "title": "3. Bowling Pressure Formulation",
                "content": "Measures Economy Suppression (Econ_normal - Econ_pressure, where lower economy under pressure yields positive credit), Pressure Wickets, and Dot Ball percentage. Run-outs are strictly excluded from bowler wickets."
            },
            {
                "id": "statistical_shrinkage",
                "title": "4. Empirical Bayesian Shrinkage",
                "content": "To prevent low-sample outliers from dominating top ranks (e.g., a batter who hit 2 sixes in 10 pressure deliveries), a continuous shrinkage multiplier C = N / (N + K) is applied, balancing demonstrated peak performance with sample-size reliability."
            }
        ]
    }
