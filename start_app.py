import os
import sys

# Ensure backend directory is in sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = "0.0.0.0"
    print("==================================================================")
    print("  ROYAL INTELLIGENCE – SUPERR SELECTOR SEASON 2 WEB PLATFORM      ")
    print(f"  Running on: http://{host}:{port}")
    print("==================================================================")
    uvicorn.run(app, host=host, port=port)
