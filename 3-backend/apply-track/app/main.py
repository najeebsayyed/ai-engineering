from fastapi import FastAPI

# Create FastAPI application
app = FastAPI(
    title="ApplyTrack API",
    description="Backend API for tracking job applications",
    version="0.1.0"
)


@app.get("/")
def home():
    return {
        "message": "Welcome to ApplyTrack API",
        "status": "running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }

@app.get("/applications/{application_id}")
def get_application(application_id: int):
    return {
        "application_id": application_id
    }