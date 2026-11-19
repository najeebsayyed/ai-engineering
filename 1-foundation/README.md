# AI Engineering Foundations: From Python to Production LLMs

Welcome to the **Foundations of AI Engineering** guide.

This guide is designed for developers, students, and engineers starting their journey into AI Engineering. You will learn how to transition from writing basic Python scripts to building robust, production-ready applications powered by Large Language Models (LLMs).

Throughout this guide, we use **[StudyMate](./studymate)**—an AI-powered learning assistant built with Python, FastAPI, and OpenAI—as our central hands-on example. Every concept taught here directly connects to real code in the StudyMate project.

---

## Table of Contents

1. [What is AI Engineering?](#1-what-is-ai-engineering)
2. [What You'll Learn](#2-what-youll-learn)
3. [Our Hands-On Project: StudyMate](#3-our-hands-on-project-studymate)
4. [The 10 Foundation Steps](#4-the-10-foundation-steps)
   - [Step 1: Python Basics](#step-1-python-basics)
   - [Step 2: uv and pip](#step-2-uv-and-pip)
   - [Step 3: Git and GitHub](#step-3-git-and-github)
   - [Step 4: Python Project Structure](#step-4-python-project-structure)
   - [Step 5: Environment Variables & Secret Management](#step-5-environment-variables--secret-management)
   - [Step 6: OpenAI Python SDK](#step-6-openai-python-sdk)
   - [Step 7: Handling Responses & Token Usage](#step-7-handling-responses--token-usage)
   - [Step 8: Prompt Engineering](#step-8-prompt-engineering)
   - [Step 9: Structured Outputs with Pydantic](#step-9-structured-outputs-with-pydantic)
   - [Step 10: Error Handling & Resilience](#step-10-error-handling--resilience)
5. [How to Follow This Guide](#5-how-to-follow-this-guide)
6. [Prerequisites and Tools](#6-prerequisites-and-tools)
7. [Official Documentation & References](#7-official-documentation--references)
8. [What's Next: Moving to RAG](#8-whats-next-moving-to-rag)

---

## 1. What is AI Engineering?

Many people believe that working with AI requires a PhD in machine learning or training multi-billion-parameter neural networks from scratch on clusters of GPUs. That is the role of an **AI Researcher** or **Machine Learning Engineer**.

An **AI Engineer**, by contrast, takes existing foundation models (like GPT-4, GPT-5, or Claude) and integrates them into software products that solve real human problems. 

An AI application is roughly **80% traditional software engineering** and **20% model orchestration**:

```
┌─────────────────────────────────────────────────────────────┐
│                     AI Application                          │
├──────────────────────────────┬──────────────────────────────┤
│    Software Engineering      │      AI Orchestration        │
│    (The Foundation)          │      (The Capability)        │
│                              │                              │
│  - Project organization      │  - Prompt engineering        │
│  - Environment & secrets     │  - SDK client integration    │
│  - Virtual environments (uv) │  - Token & cost management   │
│  - Type validation (Pydantic)│  - Structured outputs (JSON) │
│  - Exception handling        │  - Embeddings & RAG          │
│  - REST APIs (FastAPI)       │  - Evaluation & Guardrails   │
└──────────────────────────────┴──────────────────────────────┘
```

If your software foundation is shaky—if your API keys leak into public git repositories, if your dependencies break on deployment, or if an unhandled network error crashes your server—even the most sophisticated prompt cannot save your application. Mastering these fundamentals is what distinguishes an AI engineer from someone who merely copies text into a web chat.

---

## 2. What You'll Learn

This guide progresses logically through 10 essential milestones:

| Step | Topic | Core Focus |
| :--- | :--- | :--- |
| **01** | **Python Basics** | Variables, control flow, loops, functions, and user input |
| **02** | **uv and pip** | Modern package management, virtual environments, and lockfiles |
| **03** | **Git and GitHub** | Version control, atomic commits, branching, and `.gitignore` |
| **04** | **Project Structure** | Modules, packages, imports, and separation of concerns |
| **05** | **Environment Variables** | Secrets management, `.env` files, and Twelve-Factor configuration |
| **06** | **OpenAI Python SDK** | Authentication, client lifecycle, and the Responses API |
| **07** | **Handling Responses** | Text extraction, response schemas, and token usage tracking |
| **08** | **Prompt Engineering** | System instructions, few-shot prompting, and tone calibration |
| **09** | **Structured Outputs** | Strict JSON extraction using Pydantic models and validation |
| **10** | **Error Handling** | Catching API exceptions, rate limiting, and defensive recovery |

### Your Learning Checklist

Track your progress as you work through each chapter:

- [ ] **Step 1:** I understand functions, loops, and conditional logic in Python.
- [ ] **Step 2:** I can manage virtual environments and dependencies using `uv`.
- [ ] **Step 3:** I can track changes with Git and protect sensitive files.
- [ ] **Step 4:** I can organize application code into packages and modules.
- [ ] **Step 5:** I can load API keys securely from environment variables.
- [ ] **Step 6:** I can instantiate an OpenAI client and send an API request.
- [ ] **Step 7:** I can parse model responses and calculate token costs.
- [ ] **Step 8:** I can write effective, constrained system prompts.
- [ ] **Step 9:** I can enforce structured outputs using Pydantic schemas.
- [ ] **Step 10:** I can handle API errors and network timeouts gracefully.

---

## 3. Our Hands-On Project: StudyMate

To ground these abstract principles in concrete code, we will explore **[StudyMate](./studymate)**, an educational assistant located in this repository.

StudyMate helps learners study technical concepts using four core features:
1. **Material Summarizer:** Condenses long technical notes into bullet points and takeaways.
2. **Concept Explainer:** Explains difficult topics using the Feynman technique (definitions, analogies, step-by-step logic, and code examples).
3. **Quiz Generator:** Produces 4-option multiple-choice quizzes with verified answers and explanations.
4. **Flashcard Deck Generator:** Creates revision card decks with front prompts and back answers.

StudyMate offers both an **interactive terminal interface (CLI)** for command-line learning and a **FastAPI backend** connected to a React frontend.

```
studymate/
├── app/
│   ├── __init__.py      # Step 4: Package initialization
│   ├── config.py        # Step 5: Environment variables & settings
│   ├── prompts.py       # Step 8: System prompts & templates
│   ├── schemas.py       # Step 9: Pydantic request/response schemas
│   ├── ai.py            # Steps 6, 7, 10: OpenAI client, inference, error handling
│   ├── api.py           # Step 10: FastAPI REST endpoints & HTTP exception handlers
│   └── main.py          # Step 1: Interactive terminal CLI & runner
├── .env.example         # Step 5: Secret configuration template
├── .gitignore           # Step 3: Git ignore rules
└── pyproject.toml       # Step 2: uv dependency definitions
```

---

## 4. The 10 Foundation Steps

---

### Step 1: Python Basics

#### What is it?
Python is a clean, readable programming language. At its core are foundational constructs:
- **Variables & Data Types:** Storing numbers (`int`, `float`), text (`str`), collections (`list`, `dict`), and booleans (`bool`).
- **User Input:** Gathering input from a user via the terminal with `input()`.
- **Conditionals:** Directing program logic using `if`, `elif`, and `else`.
- **Loops:** Repeating actions over data using `for` and `while`.
- **Functions:** Reusable, parameterized blocks of code declared with `def`.

#### Why do we need it in AI Engineering?
Every prompt you send to an LLM is a Python string. Every API response you receive is parsed into Python dictionaries, lists, or custom objects. User questions must be captured, validated, routed to the correct helper, and presented clearly. Without solid fundamentals, building interfaces, orchestrating data pipelines, and transforming model outputs becomes impossible.

#### StudyMate Example
In [`studymate/app/main.py`](./studymate/app/main.py), we use a `while True` loop and `if/elif/else` conditionals to present an interactive menu in the terminal. We also use a `for` loop to display quiz questions and score user answers:

```python
# From studymate/app/main.py
def handle_quiz():
    topic = input("Enter quiz topic: ").strip()
    if not topic:
        print("Error: Topic cannot be empty.")
        return

    # Generate quiz using our AI module
    quiz = generate_quiz(topic, num_questions=3)
    score = 0

    # Loop through questions and evaluate answers
    for i, q in enumerate(quiz.questions, start=1):
        print(f"\nQuestion {i}: {q.question}")
        for j, opt in enumerate(q.options):
            letter = chr(ord('A') + j)
            print(f"  {letter}) {opt}")

        user_choice = input("Your answer (A/B/C/D): ").strip().upper()
        # Verify user choice against q.correct_answer...
```

#### What you'll learn
- Writing modular functions with typed arguments and return values.
- Validating and sanitizing raw string input using `.strip()`.
- Iterating over lists with `enumerate()` to generate human-readable numbering.
- Building interactive terminal user experiences.

---

### Step 2: uv and pip

#### What is it?
`pip` is Python's standard package installer. `uv` is an ultra-fast, modern Python package and project manager written in Rust by Astral. It serves as a unified replacement for `pip`, `pip-tools`, `virtualenv`, and `poetry`.

A **virtual environment** is an isolated folder (typically named `.venv`) containing a specific Python executable and a dedicated set of installed libraries, preventing version conflicts between different projects.

#### Why do we need it in AI Engineering?
The AI ecosystem evolves rapidly. The `openai` SDK, `pydantic`, `fastapi`, and LangChain frequently release updates. If you install packages globally on your computer:
1. Different projects will experience conflicting dependency versions.
2. Code that worked yesterday may break when a global package updates.
3. Teammates or production servers will fail to reproduce your setup.

`uv` solves this by creating instant virtual environments and generating a deterministic `uv.lock` file that locks the exact version of every single sub-dependency.

#### StudyMate Example
In StudyMate, dependencies are declared inside [`studymate/pyproject.toml`](./studymate/pyproject.toml):

```toml
[project]
name = "studymate"
version = "0.1.0"
requires-python = ">=3.13"
dependencies = [
    "fastapi>=0.165.0",
    "openai>=3.55.1",
    "pydantic>=2.14.3",
    "python-dotenv>=1.2.4",
    "uvicorn>=0.54.0",
]
```

Essential `uv` terminal commands used in StudyMate:

```bash
# 1. Create a virtual environment and install all locked dependencies
uv sync

# 2. Add a new dependency to pyproject.toml
uv add httpx

# 3. Run a Python script inside the virtual environment without manual activation
uv run python app/main.py
```

#### What you'll learn
- Initializing reproducible projects with `pyproject.toml`.
- Creating and managing isolated virtual environments with `.venv`.
- Freezing exact dependency trees using `uv.lock`.
- Executing project tools seamlessly using `uv run`.

---

### Step 3: Git and GitHub

#### What is it?
- **Git** is a distributed version control system that tracks the history of changes made to files in a repository.
- **GitHub** is a cloud-based hosting platform for Git repositories, facilitating collaboration, code review, issue tracking, and continuous integration.

#### Why do we need it in AI Engineering?
AI Engineering involves constant experimentation: trying new prompt templates, testing different temperature settings, swapping models, or restructuring JSON output schemas. 

Version control allows you to:
- Experiment fearlessly on isolated **branches** without breaking working code.
- Compare differences in prompt behavior between commits.
- Revert immediately if a new model version produces regressions.
- Collaborate cleanly with team members through Pull Requests (PRs).
- Keep secrets safe by ignoring sensitive local files.

#### StudyMate Example
StudyMate uses a comprehensive [`.gitignore`](./studymate/.gitignore) file to ensure sensitive API keys, virtual environments, and temporary files never get committed to GitHub:

```gitignore
# Virtual environment (managed by uv)
.venv/

# Environment secrets (NEVER commit your actual API keys!)
.env

# Python bytecode caches
__pycache__/
*.py[cod]

# Node / frontend dependencies
frontend/node_modules/
frontend/dist/
```

Key Git workflow commands for your AI journey:

```bash
# Check modified files and repository status
git status

# Stage specific changes
git add app/prompts.py

# Commit with a clear, descriptive message
git commit -m "feat(prompts): add Feynman technique explanation template"

# Push to your remote repository on GitHub
git push origin main
```

#### What you'll learn
- Tracking iterative code and prompt enhancements with atomic commits.
- Protecting sensitive credentials from accidental public exposure using `.gitignore`.
- Branching for experimental features and creating descriptive pull requests.

---

### Step 4: Python Project Structure

#### What is it?
A Python **module** is a single `.py` file containing functions, classes, or variables. A Python **package** is a directory containing one or more modules along with an `__init__.py` file (which tells Python the directory should be treated as an importable namespace).

#### Why do we need it in AI Engineering?
Beginner AI scripts often start as a single 600-line file containing raw API keys, long prompt strings, OpenAI API calls, FastAPI routes, and print statements. This quickly becomes impossible to test, debug, or maintain.

A modular project structure separates concerns:
- **Configuration** lives separately from business logic.
- **Prompt templates** live separately from SDK execution code.
- **Data schemas** are independent of API endpoints.
- Modules can be imported into both a terminal CLI and a web server without duplication.

#### StudyMate Example
StudyMate structures its backend under the `app/` package:

```text
studymate/
└── app/
    ├── __init__.py      # Declares the app package and version
    ├── config.py        # Centralized settings (API keys, ports, models)
    ├── prompts.py       # Educational prompt templates
    ├── schemas.py       # Pydantic data models for validation
    ├── ai.py            # Core OpenAI SDK interactions & error mapping
    ├── api.py           # FastAPI web router
    └── main.py          # Interactive CLI entry point
```

In [`studymate/app/main.py`](./studymate/app/main.py), we cleanly import only what the CLI needs:

```python
# Clean, unambiguous absolute imports from our package
from app.config import APP_NAME, OPENAI_MODEL
from app.ai import summarize_text, explain_topic, generate_quiz, AIError
```

#### What you'll learn
- Structuring Python applications for clean separation of concerns.
- Avoiding circular imports using proper package boundaries.
- Reusing business and AI logic across different presentation layers (CLI vs. Web API).

---

### Step 5: Environment Variables & Secret Management

#### What is it?
**Environment variables** are key-value pairs stored in the operating system environment where your program executes. A `.env` file is a local configuration file containing these variables, which can be loaded into Python at runtime using libraries like `python-dotenv`.

#### Why do we need it in AI Engineering?
AI models require paid API keys (such as `OPENAI_API_KEY`). 

> [!CAUTION]
> **Never hardcode API keys directly into your Python files.** If you commit a hardcoded key to a public GitHub repository, automated bots will scrape it within seconds. This can lead to unauthorized API usage, account suspension, or thousands of dollars in unexpected charges.

Using environment variables allows you to:
1. Keep secrets completely out of source control.
2. Switch models or settings (`OPENAI_MODEL=gpt-5.5` vs `OPENAI_MODEL=gpt-4o-mini`) without modifying code.
3. Configure different settings for local development, staging, and production environments.

#### StudyMate Example
StudyMate provides a template file named [`.env.example`](./studymate/.env.example):

```env
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-5.5
APP_NAME=StudyMate
API_HOST=127.0.0.1
API_PORT=8000
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

In [`studymate/app/config.py`](./studymate/app/config.py), we load the `.env` file using `python-dotenv` and export typed variables:

```python
import os
from dotenv import load_dotenv

# Load key-value pairs from .env into process environment
load_dotenv()

# Read secrets with sensible defaults for non-sensitive values
OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-5.5")
APP_NAME: str = os.getenv("APP_NAME", "StudyMate")

def has_openai_key() -> bool:
    """Check if the user has configured an API key."""
    return bool(OPENAI_API_KEY and OPENAI_API_KEY.strip())
```

#### What you'll learn
- Storing secrets securely outside of code repositories.
- Using `python-dotenv` to load local `.env` files during development.
- Providing `.env.example` templates so collaborators know which variables are required.
- Inspecting configuration state safely without leaking secrets into logs.

---

### Step 6: OpenAI Python SDK

#### What is it?
The `openai` Python package is the official software development kit (SDK) provided by OpenAI. It wraps the raw HTTP endpoints of the OpenAI API into clean, typed Python classes and methods.

#### Why do we need it in AI Engineering?
Instead of manually creating HTTP requests with `urllib` or `requests`—formatting bearer token authorization headers, serializing JSON payloads, and manually checking HTTP status codes—the official SDK provides:
- Automatic connection pooling and resource management.
- Built-in exponential backoff retries for transient network drops.
- Modern API support, including the **Responses API** (`client.responses.create()` and `client.responses.parse()`).
- Full type annotations for autocomplete and static analysis.

#### StudyMate Example
In [`studymate/app/ai.py`](./studymate/app/ai.py), we instantiate an `OpenAI` client singleton and use it to send requests:

```python
from typing import Optional
from openai import OpenAI
from app.config import OPENAI_API_KEY, OPENAI_MODEL, has_openai_key

_client: Optional[OpenAI] = None

def get_openai_client() -> OpenAI:
    """Retrieve or lazily initialize the OpenAI client singleton."""
    global _client
    if not has_openai_key():
        raise AIError("OpenAI API key missing. Please configure .env.", status_code=401)
    
    if _client is None:
        _client = OpenAI(api_key=OPENAI_API_KEY)
    return _client
```

Using the client to generate an explanation:

```python
client = get_openai_client()

response = client.responses.create(
    model=OPENAI_MODEL,
    instructions="You are an expert tutor. Explain concepts clearly.",
    input="Explain what an API is in simple terms."
)
```

#### What you'll learn
- Installing and initializing the `OpenAI` client.
- Managing client lifecycles using the singleton pattern.
- Understanding the difference between model instructions (system persona) and user inputs.

---

### Step 7: Handling Responses & Token Usage

#### What is it?
When an LLM completes an inference request, it returns a structured response object. This object contains the generated text along with valuable metadata: model information, response identifiers, finish reasons, and **token usage metrics**.

A **token** is the basic unit of text processed by language models:
- 1 token is roughly 4 characters or 0.75 words in English.
- 100 tokens $\approx$ 75 English words.
- API billing is calculated directly based on the number of **input tokens** (your prompt) and **output tokens** (the model's response).

#### Why do we need it in AI Engineering?
A language model does not simply return a bare string. You must know how to:
1. Safely extract generated content from the response object.
2. Check that the output is not empty or prematurely truncated.
3. Track token consumption to estimate costs, monitor performance, and stay within provider rate limits.

#### StudyMate Example
In [`studymate/app/ai.py`](./studymate/app/ai.py), our `summarize_text()` function sends study material to the model, extracts the generated text via `response.output_text`, and validates the output before returning it:

```python
def summarize_text(content: str) -> str:
    client = get_openai_client()
    
    response = client.responses.create(
        model=OPENAI_MODEL,
        instructions=SUMMARIZE_SYSTEM_PROMPT,
        input=f"Summarize the following study material:\n\n{content.strip()}",
    )

    # Extract generated output text cleanly
    output = response.output_text
    if not output or not output.strip():
        raise AIError("AI returned an empty summary.", status_code=502)

    return output.strip()
```

Under the hood, the `response` object also tracks token consumption:

```python
# Inspecting token usage from the response
usage = response.usage
input_tokens = usage.input_tokens
output_tokens = usage.output_tokens
total_tokens = usage.total_tokens

print(f"Tokens consumed: {input_tokens} prompt + {output_tokens} output = {total_tokens} total")
```

#### What you'll learn
- Accessing generated content using `response.output_text`.
- Guarding against empty or malformed model responses.
- Inspecting token metrics (`input_tokens`, `output_tokens`) to calculate costs.

---

### Step 8: Prompt Engineering

#### What is it?
**Prompt engineering** is the deliberate design of instructions, context, rules, and constraints provided to an LLM to elicit accurate, relevant, and consistently formatted results.

Effective prompt engineering relies on three core components:
1. **Role / Persona:** Who the model is acting as (e.g., *"You are StudyMate, an expert educational assistant..."*).
2. **Clear Task & Guidelines:** Specific criteria the model must satisfy (e.g., *"Highlight key terms in bold"*, *"Do not exceed 3 paragraphs"*).
3. **Negative Constraints:** Explicitly defining what the model must *not* do (e.g., *"Do NOT hallucinate or extrapolate facts not present in the input text"*).

#### Why do we need it in AI Engineering?
LLMs are probabilistic prediction engines. If you send a vague prompt like *"Explain recursion"*, the model might return a college-level mathematical proof, a children's fairy tale, or a 5-page dissertation.

Prompt engineering allows you to control:
- **Tone and difficulty:** Tailoring explanations to beginner or advanced audiences.
- **Structural consistency:** Ensuring headings and sections follow an identical pattern on every request.
- **Factual groundedness:** Reducing hallucinations by anchoring responses strictly to provided study material.

#### StudyMate Example
StudyMate isolates all prompt templates in [`studymate/app/prompts.py`](./studymate/app/prompts.py). Notice how `EXPLAIN_SYSTEM_PROMPT` enforces the Feynman technique with predefined Markdown headings:

```python
# From studymate/app/prompts.py
EXPLAIN_SYSTEM_PROMPT = """You are StudyMate, a friendly and brilliant technical educator who excels at explaining complex topics to beginners.
Your goal is to make any technical concept instantly understandable without dumbing it down so much that accuracy is lost.

Structure your response using these Markdown sections:
1. **Quick Definition**: 1-2 clear, approachable sentences defining the concept.
2. **The Real-World Analogy**: A vivid, relatable analogy from everyday life that builds immediate intuition.
3. **How It Works**: A step-by-step breakdown in plain English.
4. **Practical Example**: A concrete, beginner-friendly example (such as a simple code snippet, terminal command, or workflow scenario).
5. **Key Takeaway**: One memorable sentence encapsulating what to remember.

Use friendly, encouraging tone and avoid unexplained jargon.
"""
```

Because the prompt specifies the exact section headers, the frontend can render structured, predictable educational cards every single time.

#### What you'll learn
- Structuring system prompts with clear roles, rules, and constraints.
- Applying educational frameworks (like the Feynman technique) to prompt design.
- Storing prompts as reusable constants in dedicated modules rather than scattered inline strings.

---

### Step 9: Structured Outputs with Pydantic

#### What is it?
By default, language models output unstructured natural language text. **Structured Outputs** is a mechanism where the model is constrained to return data that strictly conforms to a defined schema (such as a JSON schema).

**Pydantic** is Python's leading data validation and settings management library. By defining a Python class that inherits from `pydantic.BaseModel`, you declare the exact types and rules your data must satisfy.

#### Why do we need it in AI Engineering?
Unstructured text is fine for a chat bubble, but software applications require structured data:
- A quiz component needs a list of questions, each with an array of exactly 4 strings, a matching correct answer, and an explanation.
- A flashcard component needs a distinct `front` and `back` string for each card.

If an LLM returns unstructured text, writing regex or custom string parsers to extract answers will fail whenever the model changes formatting. Structured Outputs guarantee that the model's output validates against your Pydantic model **100% of the time**.

#### StudyMate Example
In [`studymate/app/schemas.py`](./studymate/app/schemas.py), we define the exact data contract for a quiz question using Pydantic:

```python
from typing import List
from pydantic import BaseModel, Field, model_validator

class QuizQuestion(BaseModel):
    question: str = Field(..., description="The question text.")
    options: List[str] = Field(..., description="Exactly four distinct answer options.")
    correct_answer: str = Field(..., description="The correct answer matching one of the options.")
    explanation: str = Field(..., description="Clear explanation for why this answer is correct.")

class QuizResponse(BaseModel):
    title: str = Field(..., description="A concise title for the quiz.")
    questions: List[QuizQuestion] = Field(..., description="List of generated quiz questions.")
```

In [`studymate/app/ai.py`](./studymate/app/ai.py), we pass this schema directly to `client.responses.parse()` using `text_format=QuizResponse`:

```python
def generate_quiz(topic: str, num_questions: int = 5) -> QuizResponse:
    client = get_openai_client()
    
    response = client.responses.parse(
        model=OPENAI_MODEL,
        instructions=QUIZ_SYSTEM_PROMPT,
        input=f"Generate a {num_questions}-question quiz on: {topic}",
        text_format=QuizResponse,  # Pydantic model enforces the schema
    )

    # response.output_parsed is an actual, validated QuizResponse instance!
    return response.output_parsed
```

#### What you'll learn
- Defining type-safe data schemas using Pydantic `BaseModel` and `Field`.
- Enforcing strict JSON generation using `client.responses.parse(text_format=...)`.
- Accessing validated, typed Python objects without manual JSON deserialization.

---

### Step 10: Error Handling & Resilience

#### What is it?
**Error handling** is the practice of anticipating and responding to potential failures during program execution. In Python, this is achieved using `try`, `except`, and custom `Exception` classes.

#### Why do we need it in AI Engineering?
AI applications rely on external third-party services over the network. Failures are not an anomaly—they are an expected reality:
- An API key may be invalid or expired (`AuthenticationError`).
- A user may send requests too quickly (`RateLimitError` / HTTP 429).
- An upstream server may be overloaded or unresponsive (`APITimeoutError` / `APIConnectionError`).
- The user may submit empty input or requests exceeding length limits.

Without defensive error handling:
1. Your server crashes or hangs indefinitely.
2. Sensitive internal stack traces or configuration details leak to end users.
3. Users receive cryptic error messages instead of actionable guidance.

#### StudyMate Example
In [`studymate/app/ai.py`](./studymate/app/ai.py), we create a custom exception `AIError` and an error mapper `_handle_openai_error()`:

```python
import openai
from pydantic import ValidationError

class AIError(Exception):
    """Custom exception raised when an AI operation fails."""
    def __init__(self, message: str, status_code: int = 500):
        super().__init__(message)
        self.message = message
        self.status_code = status_code

def _handle_openai_error(err: Exception) -> AIError:
    """Map raw SDK exceptions to clean, user-friendly AIErrors."""
    if isinstance(err, openai.AuthenticationError):
        return AIError("Invalid OpenAI API key. Check your .env file.", status_code=401)
    if isinstance(err, openai.RateLimitError):
        return AIError("Rate limit reached. Please wait a moment before trying again.", status_code=429)
    if isinstance(err, openai.APITimeoutError):
        return AIError("Request to OpenAI timed out. Try with shorter text.", status_code=504)
    if isinstance(err, openai.APIConnectionError):
        return AIError("Network error: Could not reach OpenAI API.", status_code=502)
    if isinstance(err, ValidationError):
        return AIError("Model output failed schema validation.", status_code=502)
    
    return AIError(f"Unexpected AI error: {str(err)}", status_code=500)
```

In [`studymate/app/api.py`](./studymate/app/api.py), FastAPI intercepts `AIError` and converts it into a clean JSON response:

```python
@app.exception_handler(AIError)
async def ai_error_handler(request, exc: AIError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message},
    )
```

#### What you'll learn
- Defining domain-specific custom exceptions.
- Catching specific OpenAI SDK exceptions (`AuthenticationError`, `RateLimitError`).
- Translating low-level errors into safe, sanitized HTTP responses with appropriate status codes.

---

## 5. How to Follow This Guide

Follow this hands-on path to test your knowledge against the live StudyMate application:

### Step 1: Open the Project
Open your terminal and navigate to the StudyMate directory:

```bash
cd 1-foundation/studymate
```

### Step 2: Install Dependencies with uv
Synchronize the virtual environment with the project dependencies:

```bash
uv sync
```

### Step 3: Configure Your Environment Variables
Copy the template configuration file to `.env`:

```bash
cp .env.example .env
```

Open `.env` in your editor and enter your OpenAI API key:

```env
OPENAI_API_KEY=sk-proj-your-actual-api-key-here
OPENAI_MODEL=gpt-5.5
```

### Step 4: Run the Interactive Terminal CLI
Test the Python basics, prompt engineering, and structured output concepts directly in your terminal:

```bash
uv run python app/main.py
```

Try each option:
1. Choose **1** to summarize a paragraph of text.
2. Choose **2** to generate a Feynman-style explanation of a topic (e.g., *"How does DNS work?"*).
3. Choose **3** to generate an interactive quiz and test the scoring loop.
4. Choose **4** to review flip-style flashcards in the console.

### Step 5: Run the Backend Web Server
Start the FastAPI server:

```bash
uv run python app/main.py --serve
```

Open your browser to the interactive API documentation at:
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

Test the endpoints (`POST /api/summarize`, `POST /api/quiz`) directly from the Swagger UI to see Pydantic validation in action.

---

## 6. Prerequisites and Tools

Before you begin, ensure you have the following installed on your machine:

| Tool | Recommended Version | Purpose |
| :--- | :--- | :--- |
| **Python** | `3.13` or higher | Core programming language |
| **uv** | Latest (`>=0.5.0`) | Modern package manager and virtual environment runner |
| **Git** | Latest (`>=2.40`) | Version control and code tracking |
| **OpenAI Account** | Valid API Key | Access to LLM endpoints (e.g., `gpt-5.5` or `gpt-4o-mini`) |
| **Code Editor** | VS Code / Cursor | Recommended for Python syntax highlighting and debugging |

To install `uv` on macOS/Linux:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

To install `uv` on Windows (PowerShell):
```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

---

## 7. Official Documentation & References

Bookmark these official resources for deeper study:

| Technology | Documentation Link | What It Covers |
| :--- | :--- | :--- |
| **Python** | [docs.python.org](https://docs.python.org/3/) | Official Python language tutorial and standard library reference |
| **uv** | [docs.astral.sh/uv](https://docs.astral.sh/uv/) | Fast Python package management, virtual environments, and CLI tools |
| **OpenAI Python SDK** | [github.com/openai/openai-python](https://github.com/openai/openai-python) | Official SDK repository, client methods, and Responses API guide |
| **Pydantic** | [docs.pydantic.dev](https://docs.pydantic.dev/) | Data validation, type hints, models, and JSON schema generation |
| **FastAPI** | [fastapi.tiangolo.com](https://fastapi.tiangolo.com/) | Modern async web framework for building high-performance REST APIs |
| **Git** | [git-scm.com/doc](https://git-scm.com/doc) | Git version control reference manual and tutorials |

---

## 8. What's Next: Moving to RAG

Congratulations on mastering the foundations of AI Engineering!

With these 10 steps, you now understand how to write clean Python, manage virtual environments, secure API credentials, instruct LLMs with targeted prompts, enforce structured data schemas with Pydantic, and build resilient services.

However, standalone LLMs have a critical limitation: **they can only answer from the static knowledge they memorized during pre-training**. They cannot read your private company PDFs, private documentation, or live knowledge bases.

The next stage of your AI Engineering journey is **Retrieval-Augmented Generation (RAG)**:

```
Foundation (This Guide)            Next Stage: RAG
┌────────────────────────┐         ┌──────────────────────────────────────┐
│  - Python Basics       │         │  - Document Parsing (PyMuPDF)        │
│  - Environment & Keys  │  ─────► │  - Text Chunking & Overlap           │
│  - OpenAI SDK & Prompts│         │  - Vector Embeddings                 │
│  - Structured Outputs  │         │  - Vector Databases (ChromaDB)       │
│  - Error Handling      │         │  - Grounded Q&A with Source Citation │
└────────────────────────┘         └──────────────────────────────────────┘
```

When you are ready, continue to our comprehensive deep-dive into RAG:
👉 **[Stage 4: Retrieval-Augmented Generation (RAG) Guide](../4-rag/README.md)**
