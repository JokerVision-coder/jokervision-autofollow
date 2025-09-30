from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="JokerVision AutoFollow", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "JokerVision AutoFollow API", "status": "running"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "jokervision-backend"}

@app.get("/api/test")
async def test_endpoint():
    return {
        "message": "JokerVision backend is working!",
        "environment": "production",
        "database": "connected" if os.getenv("MONGO_URL") else "not_configured"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
