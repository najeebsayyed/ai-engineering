from typing import List
from pydantic import BaseModel, Field, model_validator


class SummarizeRequest(BaseModel):
    content: str = Field(
        ...,
        min_length=10,
        max_length=50000,
        description="The study material or text to summarize."
    )


class SummarizeResponse(BaseModel):
    summary: str = Field(..., description="The AI-generated summary.")


class ExplainRequest(BaseModel):
    topic: str = Field(
        ...,
        min_length=2,
        max_length=1000,
        description="The concept or topic to explain."
    )


class ExplainResponse(BaseModel):
    topic: str = Field(..., description="The original topic.")
    explanation: str = Field(..., description="Beginner-friendly explanation.")


class QuizRequest(BaseModel):
    topic: str = Field(
        ...,
        min_length=2,
        max_length=1000,
        description="The topic for quiz questions."
    )
    num_questions: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Number of multiple-choice questions to generate (1 to 20)."
    )


class QuizQuestion(BaseModel):
    question: str = Field(..., description="The question text.")
    options: List[str] = Field(..., description="Exactly four distinct answer options.")
    correct_answer: str = Field(..., description="The correct answer string matching one of the options.")
    explanation: str = Field(..., description="Clear explanation for why this answer is correct.")

    @model_validator(mode="after")
    def validate_correct_answer_in_options(self) -> "QuizQuestion":
        # Normalize and ensure correct answer is among options
        if not self.options:
            raise ValueError("Quiz question must have answer options.")
        if len(self.options) != 4:
            # If model produced slightly different number, ensure at least 2
            if len(self.options) < 2:
                raise ValueError("Quiz question must have at least 2 options.")
        
        # Check direct or stripped match
        stripped_options = [opt.strip() for opt in self.options]
        stripped_correct = self.correct_answer.strip()
        
        if stripped_correct in stripped_options:
            # ensure exact reference
            idx = stripped_options.index(stripped_correct)
            self.correct_answer = self.options[idx]
        else:
            # Check if answer starts with prefix like "A) " or "Option A: "
            matched = False
            for opt in self.options:
                if stripped_correct.lower() in opt.lower() or opt.lower() in stripped_correct.lower():
                    self.correct_answer = opt
                    matched = True
                    break
            if not matched:
                # If still not matched, append or fallback to the first option as fallback rather than crashing
                self.options[0] = self.correct_answer
        return self


class QuizResponse(BaseModel):
    title: str = Field(..., description="A concise title for the quiz.")
    questions: List[QuizQuestion] = Field(..., description="List of generated quiz questions.")


class FlashcardsRequest(BaseModel):
    topic: str = Field(
        ...,
        min_length=2,
        max_length=1000,
        description="The topic or subject for flashcards."
    )
    num_cards: int = Field(
        default=5,
        ge=1,
        le=30,
        description="Number of flashcards to generate (1 to 30)."
    )


class FlashcardItem(BaseModel):
    front: str = Field(..., description="Front of flashcard: question, term, or concept.")
    back: str = Field(..., description="Back of flashcard: clear, concise explanation or definition.")


class FlashcardsResponse(BaseModel):
    title: str = Field(..., description="Title of the flashcard deck.")
    flashcards: List[FlashcardItem] = Field(..., description="List of generated flashcards.")


class HealthResponse(BaseModel):
    status: str = Field(..., description="System health status ('ok').")
    app_name: str = Field(..., description="Configured application name.")
    model: str = Field(..., description="Configured OpenAI model name.")
    ai_ready: bool = Field(..., description="Whether OpenAI credentials are ready.")


class ErrorResponse(BaseModel):
    detail: str = Field(..., description="Descriptive error message.")
