import os
import sys
import subprocess
import uvicorn

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(current_dir, "backend")
    sys.path.insert(0, backend_dir)

    print("==================================================================")
    print("  ROYAL INTELLIGENCE – SUPERR SELECTOR SEASON 2 BACKEND SERVER    ")
    print("==================================================================")
    print("  API running on: http://127.0.0.1:8000")
    print("  Interactive Docs: http://127.0.0.1:8000/docs")
    print("  To run frontend: cd frontend && npm run dev")
    print("==================================================================")

    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False)
