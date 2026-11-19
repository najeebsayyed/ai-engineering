import os
import sys
import logging
from contextlib import asynccontextmanager

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.config import (
    APP_NAME,
    OPENAI_MODEL,
    CORS_ORIGINS,
    has_openai_key,
)
from app.schemas import (
    SummarizeRequest,
    SummarizeResponse,
    ExplainRequest,
    ExplainResponse,
    QuizRequest,
    QuizResponse,
    FlashcardsRequest,
    FlashcardsResponse,
    HealthResponse,
    ErrorResponse,
)
from app.ai import (
    AIError,
    summarize_text,
    explain_topic,
    generate_quiz,
    generate_flashcards,
)

logger = logging.getLogger("studymate.api")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting %s API server...", APP_NAME)
    if has_openai_key():
        logger.info("OpenAI API key configured. Model: %s", OPENAI_MODEL)
    else:
        logger.warning("OPENAI_API_KEY is not set. AI operations will return 401 until configured.")
    yield
    logger.info("Shutting down %s API server.", APP_NAME)


app = FastAPI(
    title=f"{APP_NAME} API",
    description="REST API for StudyMate — AI-Powered Learning Assistant",
    version="1.0.0",
    lifespan=lifespan,
    responses={
        400: {"model": ErrorResponse, "description": "Bad Request"},
        401: {"model": ErrorResponse, "description": "Unauthorized / Missing API Key"},
        422: {"model": ErrorResponse, "description": "Validation Error"},
        500: {"model": ErrorResponse, "description": "Internal Server Error"},
        502: {"model": ErrorResponse, "description": "Bad Gateway / Upstream AI Error"},
    },
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS if CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AIError)
async def ai_error_handler(request, exc: AIError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message},
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request, exc: RequestValidationError):
    errors = exc.errors()
    msg = errors[0].get("msg", "Invalid request parameters.") if errors else "Validation failed."
    field = " -> ".join(str(loc) for loc in errors[0].get("loc", [])) if errors else ""
    detail = f"{msg} (field: {field})" if field else msg
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": detail},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request, exc: Exception):
    logger.exception("Unhandled server exception: %s", exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."},
    )


@app.get("/api/health", response_model=HealthResponse, tags=["System"])
def get_health() -> HealthResponse:
    """Return application health status and AI model readiness."""
    return HealthResponse(
        status="ok",
        app_name=APP_NAME,
        model=OPENAI_MODEL,
        ai_ready=has_openai_key(),
    )


@app.post("/api/summarize", response_model=SummarizeResponse, tags=["AI Learning"])
def summarize_content(payload: SummarizeRequest) -> SummarizeResponse:
    """Summarize study material into structured, beginner-friendly key points."""
    summary = summarize_text(payload.content)
    return SummarizeResponse(summary=summary)


@app.post("/api/explain", response_model=ExplainResponse, tags=["AI Learning"])
def explain_concept(payload: ExplainRequest) -> ExplainResponse:
    """Explain a complex or technical topic with analogies, simple steps, and examples."""
    explanation = explain_topic(payload.topic)
    return ExplainResponse(topic=payload.topic, explanation=explanation)


@app.post("/api/quiz", response_model=QuizResponse, tags=["AI Learning"])
def create_quiz(payload: QuizRequest) -> QuizResponse:
    """Generate a multiple-choice quiz with 4 options per question, correct answer, and explanation."""
    return generate_quiz(payload.topic, payload.num_questions)


@app.post("/api/flashcards", response_model=FlashcardsResponse, tags=["AI Learning"])
def create_flashcards(payload: FlashcardsRequest) -> FlashcardsResponse:
    """Generate a set of revision flashcards with front prompt and back answer."""
    return generate_flashcards(payload.topic, payload.num_cards)
