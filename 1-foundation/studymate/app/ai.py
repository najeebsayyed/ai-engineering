import logging
from typing import Optional
import openai
from openai import OpenAI
from pydantic import ValidationError

from app.config import OPENAI_API_KEY, OPENAI_MODEL, has_openai_key
from app.prompts import (
    SUMMARIZE_SYSTEM_PROMPT,
    EXPLAIN_SYSTEM_PROMPT,
    QUIZ_SYSTEM_PROMPT,
    FLASHCARDS_SYSTEM_PROMPT,
)
from app.schemas import QuizResponse, FlashcardsResponse

logger = logging.getLogger(__name__)

_client: Optional[OpenAI] = None


class AIError(Exception):
    """Custom exception raised when an AI service operation fails."""
    def __init__(self, message: str, status_code: int = 500):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def get_openai_client() -> OpenAI:
    """Retrieve or initialize the OpenAI client."""
    global _client
    if not has_openai_key():
        raise AIError(
            "OpenAI API key is missing. Please set OPENAI_API_KEY in your .env file.",
            status_code=401
        )
    if _client is None:
        _client = OpenAI(api_key=OPENAI_API_KEY)
    return _client


def _handle_openai_error(err: Exception) -> AIError:
    """Map OpenAI and network exceptions into sanitized, friendly AIErrors."""
    logger.error("AI service error: %s", type(err).__name__)
    if isinstance(err, openai.AuthenticationError):
        return AIError(
            "Authentication failed. Please verify your OPENAI_API_KEY in .env.",
            status_code=401
        )
    if isinstance(err, openai.RateLimitError):
        return AIError(
            "OpenAI rate limit reached. Please wait a few moments and try again.",
            status_code=429
        )
    if isinstance(err, openai.APITimeoutError):
        return AIError(
            "Request to OpenAI timed out. Please try again with shorter text or fewer items.",
            status_code=504
        )
    if isinstance(err, openai.APIConnectionError):
        return AIError(
            "Could not connect to OpenAI API. Please check your internet connection.",
            status_code=502
        )
    if isinstance(err, openai.BadRequestError):
        return AIError(
            f"Invalid request sent to AI model: {err.message}",
            status_code=400
        )
    if isinstance(err, ValidationError):
        return AIError(
            "AI output could not be validated against the required schema. Please try again.",
            status_code=502
        )
    if isinstance(err, openai.APIError):
        return AIError(
            "OpenAI service encountered an internal error. Please try again later.",
            status_code=502
        )
    return AIError(
        f"An unexpected AI error occurred: {str(err)}",
        status_code=500
    )


def summarize_text(content: str) -> str:
    """Generate a beginner-friendly summary of the provided study material."""
    if not content or not content.strip():
        raise AIError("Content to summarize cannot be empty.", status_code=400)

    client = get_openai_client()
    try:
        response = client.responses.create(
            model=OPENAI_MODEL,
            instructions=SUMMARIZE_SYSTEM_PROMPT,
            input=f"Please summarize the following study material thoroughly and clearly:\n\n{content.strip()}",
        )
        output = response.output_text
        if not output or not output.strip():
            raise AIError("AI returned an empty summary.", status_code=502)
        return output.strip()
    except AIError:
        raise
    except Exception as e:
        raise _handle_openai_error(e) from e


def explain_topic(topic: str) -> str:
    """Explain a complex or technical topic in simple, beginner-friendly terms."""
    if not topic or not topic.strip():
        raise AIError("Topic to explain cannot be empty.", status_code=400)

    client = get_openai_client()
    try:
        response = client.responses.create(
            model=OPENAI_MODEL,
            instructions=EXPLAIN_SYSTEM_PROMPT,
            input=f"Please explain the following topic for a beginner:\n\n{topic.strip()}",
        )
        output = response.output_text
        if not output or not output.strip():
            raise AIError("AI returned an empty explanation.", status_code=502)
        return output.strip()
    except AIError:
        raise
    except Exception as e:
        raise _handle_openai_error(e) from e


def generate_quiz(topic: str, num_questions: int = 5) -> QuizResponse:
    """Generate a multiple-choice quiz using OpenAI Responses structured output."""
    if not topic or not topic.strip():
        raise AIError("Topic for quiz cannot be empty.", status_code=400)
    if num_questions < 1 or num_questions > 20:
        raise AIError("Number of questions must be between 1 and 20.", status_code=400)

    client = get_openai_client()
    prompt = (
        f"Generate a {num_questions}-question multiple-choice quiz testing understanding of: {topic.strip()}.\n"
        f"Each question must include exactly 4 distinct options, the correct_answer matching one option verbatim, "
        f"and an insightful explanation."
    )
    try:
        response = client.responses.parse(
            model=OPENAI_MODEL,
            instructions=QUIZ_SYSTEM_PROMPT,
            input=prompt,
            text_format=QuizResponse,
        )
        parsed = response.output_parsed
        if not parsed or not parsed.questions:
            raise AIError("AI returned an empty quiz.", status_code=502)
        return parsed
    except AIError:
        raise
    except Exception as e:
        raise _handle_openai_error(e) from e


def generate_flashcards(topic: str, num_cards: int = 5) -> FlashcardsResponse:
    """Generate revision flashcards using OpenAI Responses structured output."""
    if not topic or not topic.strip():
        raise AIError("Topic for flashcards cannot be empty.", status_code=400)
    if num_cards < 1 or num_cards > 30:
        raise AIError("Number of cards must be between 1 and 30.", status_code=400)

    client = get_openai_client()
    prompt = (
        f"Generate a set of {num_cards} revision flashcards for: {topic.strip()}.\n"
        f"Each card must have a clear front (question/concept) and concise back (answer/explanation)."
    )
    try:
        response = client.responses.parse(
            model=OPENAI_MODEL,
            instructions=FLASHCARDS_SYSTEM_PROMPT,
            input=prompt,
            text_format=FlashcardsResponse,
        )
        parsed = response.output_parsed
        if not parsed or not parsed.flashcards:
            raise AIError("AI returned an empty flashcard set.", status_code=502)
        return parsed
    except AIError:
        raise
    except Exception as e:
        raise _handle_openai_error(e) from e


# Preserve backwards compatibility with existing ask_ai helper
def ask_ai(prompt: str) -> str:
    """General purpose prompt helper preserving earlier prototype compatibility."""
    return explain_topic(prompt)
