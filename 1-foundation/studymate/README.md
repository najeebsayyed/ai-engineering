# StudyMate — AI-Powered Learning Assistant

StudyMate is an AI-powered learning assistant designed to help beginners master technical subjects with confidence. Built on modern full-stack engineering principles, StudyMate simplifies complex documentation, creates intuitive analogies, and enhances long-term retention through interactive quizzes and flashcards.

---

## 🌟 Key Features

1. **Study Material Summarizer (`POST /api/summarize`)**
   - Condenses lengthy textbook excerpts, documentation, and notes into structured key takeaways.
   - Extracts core concepts and bullet points without hallucinating or inventing facts.
   - One-click "Load Sample Text" and "Copy to Clipboard" support.

2. **Concept Explainer (`POST /api/explain`)**
   - Breaks down challenging technical topics using the Feynman technique.
   - Automatically provides:
     - **Quick Definition** in plain English.
     - **Real-World Analogy** for immediate mental intuition.
     - **How It Works** step-by-step.
     - **Practical Example** (code snippets, terminal commands, or scenarios).
     - **Core Takeaway** for lasting memory.

3. **Interactive Quiz Generator (`POST /api/quiz`)**
   - Generates customized multiple-choice quizzes with 4 options per question.
   - Uses OpenAI Structured Outputs via Pydantic schema validation (`client.responses.parse()`).
   - Instant scoring, option highlighting (green for correct, red for incorrect), and detailed explanations for every question.

4. **3D Interactive Flashcards (`POST /api/flashcards`)**
   - Creates revision card sets focusing on core definitions, syntax, and principles.
   - 3D card flip animation upon click or pressing <kbd>Space</kbd>.
   - Seamless card navigation using <kbd>&larr;</kbd> and <kbd>&rarr;</kbd> arrow keys or control buttons.
   - Real-time progress bar and card counter.

---

## 🛠️ Technology Stack

### Backend
- **Python 3.13**
- **FastAPI**: Modern, high-performance async REST API framework
- **OpenAI Python SDK (3.55+)**: Powered by the OpenAI Responses API (`client.responses.create()` and `client.responses.parse()`)
- **Pydantic (v2)**: Strict type validation and JSON schema generation
- **uv**: Ultra-fast Python package and project manager
- **Uvicorn**: Lightning-fast ASGI production web server
- **python-dotenv**: Environment variable management

### Frontend
- **React 19** with **TypeScript**
- **Vite 6**: Fast modern bundler and development server
- **Lucide React**: Clean, lightweight icons
- **Modern CSS**: Custom SaaS design system with light theme, responsive layout, subtle borders, and 3D card-flip transforms

---

## 📂 Project Structure

```text
studymate/
│
├── app/
│   ├── __init__.py           # Package indicator and version metadata
│   ├── main.py               # Interactive CLI tool & server launch runner
│   ├── config.py             # App configuration, env variables, & CORS setup
│   ├── ai.py                 # OpenAI client & AI generation logic
│   ├── prompts.py            # High-yield educational system prompts
│   ├── schemas.py            # Pydantic models for requests, responses, & validation
│   └── api.py                # FastAPI REST endpoints & error handlers
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable layout components (Sidebar, etc.)
│   │   ├── pages/            # Feature pages (Dashboard, Summarize, Explain, Quiz, Flashcards)
│   │   ├── services/         # Typed API service client (api.ts)
│   │   ├── types/            # TypeScript interfaces and types
│   │   ├── App.tsx           # Main application routing and state
│   │   ├── main.tsx          # React application entry point
│   │   └── index.css         # Global SaaS design styles & 3D flip card CSS
│   ├── public/               # Static assets & SVG favicon
│   ├── package.json          # Node dependencies and build scripts
│   ├── vite.config.ts        # Vite configuration with API proxy
│   ├── tsconfig.json         # TypeScript configuration
│   └── index.html            # HTML document template
│
├── .env                      # Local environment secrets (ignored by Git)
├── .env.example              # Template environment configuration
├── .gitignore                # Git ignore rules for Python & Node artifacts
├── pyproject.toml            # Backend dependencies and project configuration
├── README.md                 # Project documentation
└── uv.lock                   # Deterministic dependency lockfile
```

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:
- **Python 3.13+**
- **uv** (recommended) or `pip`
- **Node.js 18+** & **npm**
- An **OpenAI API Key** (compatible with modern OpenAI Responses API models, e.g. `gpt-5.5`)

---

## 🚀 Getting Started

### 1. Clone & Setup Backend Environment

From the root `studymate/` directory:

```bash
# 1. Install Python dependencies using uv
uv sync

# 2. Configure environment variables
# Copy .env.example to .env (if not already present)
cp .env.example .env
```

Open `.env` in your editor and configure your OpenAI API key:

```env
OPENAI_API_KEY=sk-proj-your-key-here
OPENAI_MODEL=gpt-5.5
APP_NAME=StudyMate
API_HOST=127.0.0.1
API_PORT=8000
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

> [!NOTE]
> The backend defaults to `gpt-5.5`, but can be set to any model supported by the OpenAI Responses API.

### 2. Run the Backend API Server

You can start the FastAPI server either via `uvicorn` or the `app/main.py` entry point:

```bash
# Option A: Run directly with uv and main.py
uv run python app/main.py --serve

# Option B: Run via uvicorn with live reload
uv run uvicorn app.api:app --reload --host 127.0.0.1 --port 8000
```

Once running, the API will be available at:
- **API URL:** `http://127.0.0.1:8000`
- **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`
- **ReDoc:** `http://127.0.0.1:8000/redoc`

### 3. Optional: Run the Interactive Terminal CLI

StudyMate also includes an interactive console interface:

```bash
uv run python app/main.py
```

### 4. Setup & Start the React Frontend

Open a new terminal window, navigate to the `frontend/` directory, install packages, and start the Vite dev server:

```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```

Open your browser at `http://localhost:5173` to start using StudyMate!

To create an optimized production build:

```bash
npm run build
```

---

## 📡 API Endpoint Documentation

### 1. Health Status
- **Endpoint:** `GET /api/health`
- **Description:** Checks application and AI model readiness.
- **Sample Request:**
  ```bash
  curl -X GET http://127.0.0.1:8000/api/health
  ```
- **Sample Response:**
  ```json
  {
    "status": "ok",
    "app_name": "StudyMate",
    "model": "gpt-5.5",
    "ai_ready": true
  }
  ```

---

### 2. Summarize Study Material
- **Endpoint:** `POST /api/summarize`
- **Description:** Condenses notes or articles into structured bullet points and takeaways.
- **Sample Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/api/summarize \
    -H "Content-Type: application/json" \
    -d '{
      "content": "FastAPI is a modern, fast web framework for building APIs with Python based on standard Python type hints..."
    }'
  ```
- **Sample Response:**
  ```json
  {
    "summary": "FastAPI is a high-performance Python framework for building APIs with automatic type validation.\n\n## Key Points\n- **Fast to Code**: Increases feature delivery speed.\n- **Fewer Bugs**: Catches developer mistakes early.\n\n**Core Takeaway**: Ideal for high-concurrency microservices."
  }
  ```

---

### 3. Explain Difficult Concepts
- **Endpoint:** `POST /api/explain`
- **Description:** Explains a topic in plain English with analogies and examples.
- **Sample Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/api/explain \
    -H "Content-Type: application/json" \
    -d '{
      "topic": "Binary Search"
    }'
  ```
- **Sample Response:**
  ```json
  {
    "topic": "Binary Search",
    "explanation": "## Quick Definition\nBinary search is an efficient algorithm for finding an item from a sorted list.\n\n## The Real-World Analogy\nLike looking up a word in a physical dictionary by opening to the middle...\n\n## Practical Example\n```python\ndef binary_search(arr, target):\n    # ...\n```"
  }
  ```

---

### 4. Generate Multiple-Choice Quiz
- **Endpoint:** `POST /api/quiz`
- **Description:** Generates a structured multiple-choice quiz with 4 options per question and explanations.
- **Sample Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/api/quiz \
    -H "Content-Type: application/json" \
    -d '{
      "topic": "HTTP Status Codes",
      "num_questions": 3
    }'
  ```
- **Sample Response:**
  ```json
  {
    "title": "HTTP Status Codes Fundamentals",
    "questions": [
      {
        "question": "Which HTTP status code indicates a resource was not found?",
        "options": ["200 OK", "404 Not Found", "500 Internal Error", "301 Redirect"],
        "correct_answer": "404 Not Found",
        "explanation": "404 indicates the origin server could not find a current representation for the requested target resource."
      }
    ]
  }
  ```

---

### 5. Generate Flashcards
- **Endpoint:** `POST /api/flashcards`
- **Description:** Generates high-yield revision flashcards with prompt and answer sides.
- **Sample Request:**
  ```bash
  curl -X POST http://127.0.0.1:8000/api/flashcards \
    -H "Content-Type: application/json" \
    -d '{
      "topic": "SQL Basics",
      "num_cards": 3
    }'
  ```
- **Sample Response:**
  ```json
  {
    "title": "SQL Basics Revision Deck",
    "flashcards": [
      {
        "front": "What does the SELECT statement do in SQL?",
        "back": "SELECT retrieves data from one or more database tables without altering existing records."
      }
    ]
  }
  ```

---

## 🖼️ Application UI Preview

```text
+-----------------------------------------------------------------------------------------+
| [GraduationCap] StudyMate                      [Status: Connected (gpt-5.5)]             |
+-------------------+---------------------------------------------------------------------+
| [Dashboard]       |  Welcome to StudyMate                                               |
| [Summarize]       |  Your AI-powered learning companion.                                |
| [Explain Topics]  |                                                                     |
| [Quiz Generator]  |  +--------------------+  +--------------------+                     |
| [Flashcards]      |  | Summarize Content  |  | Explain Topics     |                     |
|                   |  | Condense articles  |  | Plain-English      |                     |
|                   |  +--------------------+  +--------------------+                     |
|                   |  | Generate Quizzes   |  | Create Flashcards  |                     |
|                   |  | Multiple choice    |  | 3D Flip cards      |                     |
|                   |  +--------------------+  +--------------------+                     |
+-------------------+---------------------------------------------------------------------+
```

---

## 🔒 Security & Best Practices

- **Never exposes API keys**: OpenAI credentials are strictly confined to the backend server and never sent to or embedded within the React frontend.
- **Sanitized Errors**: Backend exception handlers return human-readable error messages and never leak internal stack traces or configuration values.
- **Schema Validation**: Requests and structured AI outputs are strictly validated using Pydantic models before returning to clients.
- **Configurable Origins**: Explicit CORS origin policies safeguard the API against unauthorized cross-origin requests.

---

## 📄 License

MIT License. Built for learning AI engineering foundations.
