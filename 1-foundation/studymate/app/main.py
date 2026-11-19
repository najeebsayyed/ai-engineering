"""StudyMate CLI entry point.

Provides an interactive console interface for StudyMate learning tools,
as well as a convenient command to launch the FastAPI backend server.
"""

import os
import sys

# Ensure the project root directory is on sys.path so 'app' can be resolved
# regardless of whether the script is invoked as `python app/main.py` or `python -m app.main`
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

import uvicorn
from app.config import APP_NAME, OPENAI_MODEL, API_HOST, API_PORT
from app.ai import (
    AIError,
    summarize_text,
    explain_topic,
    generate_quiz,
    generate_flashcards,
)


def run_server():
    """Launch the FastAPI server."""
    print(f"\nStarting {APP_NAME} API server at http://{API_HOST}:{API_PORT} ...")
    uvicorn.run("app.api:app", host=API_HOST, port=API_PORT, reload=True, app_dir=ROOT_DIR)


def handle_summarize():
    print("\n--- Summarize Study Material ---")
    print("Paste your text below (enter an empty line or press Ctrl+Z / Enter when done):")
    lines = []
    while True:
        try:
            line = input()
            if not line and lines:
                break
            lines.append(line)
        except EOFError:
            break
    content = "\n".join(lines).strip()
    if not content:
        print("Error: No text provided.")
        return
    print("\nGenerating summary with AI...")
    try:
        summary = summarize_text(content)
        print("\n" + "=" * 50)
        print("SUMMARY:")
        print("=" * 50)
        print(summary)
    except AIError as e:
        print(f"\n[Error] {e.message}")


def handle_explain():
    print("\n--- Explain a Topic ---")
    topic = input("Enter a topic or concept to explain: ").strip()
    if not topic:
        print("Error: Topic cannot be empty.")
        return
    print(f"\nExplaining '{topic}' with AI...")
    try:
        explanation = explain_topic(topic)
        print("\n" + "=" * 50)
        print(f"EXPLANATION: {topic}")
        print("=" * 50)
        print(explanation)
    except AIError as e:
        print(f"\n[Error] {e.message}")


def handle_quiz():
    print("\n--- Generate Quiz ---")
    topic = input("Enter quiz topic: ").strip()
    if not topic:
        print("Error: Topic cannot be empty.")
        return
    num_str = input("Number of questions (default 3): ").strip()
    num = int(num_str) if num_str.isdigit() else 3

    print(f"\nGenerating {num}-question quiz on '{topic}'...")
    try:
        quiz = generate_quiz(topic, num)
        print("\n" + "=" * 50)
        print(f"QUIZ: {quiz.title}")
        print("=" * 50)
        score = 0
        for i, q in enumerate(quiz.questions, start=1):
            print(f"\nQuestion {i}: {q.question}")
            for j, opt in enumerate(q.options):
                letter = chr(ord('A') + j)
                print(f"  {letter}) {opt}")
            user_choice = input("Your answer (A/B/C/D): ").strip().upper()
            selected_opt = None
            if len(user_choice) == 1 and 'A' <= user_choice <= chr(ord('A') + len(q.options) - 1):
                idx = ord(user_choice) - ord('A')
                selected_opt = q.options[idx]
            
            if selected_opt == q.correct_answer:
                print("  -> Correct!")
                score += 1
            else:
                print(f"  -> Incorrect. Correct answer: {q.correct_answer}")
            print(f"  Explanation: {q.explanation}")
        
        print(f"\nFinal Score: {score}/{len(quiz.questions)}")
    except AIError as e:
        print(f"\n[Error] {e.message}")


def handle_flashcards():
    print("\n--- Generate Flashcards ---")
    topic = input("Enter flashcard topic: ").strip()
    if not topic:
        print("Error: Topic cannot be empty.")
        return
    num_str = input("Number of cards (default 4): ").strip()
    num = int(num_str) if num_str.isdigit() else 4

    print(f"\nGenerating {num} flashcards for '{topic}'...")
    try:
        deck = generate_flashcards(topic, num)
        print("\n" + "=" * 50)
        print(f"FLASHCARDS: {deck.title}")
        print("=" * 50)
        for i, card in enumerate(deck.flashcards, start=1):
            print(f"\nCard {i}/{len(deck.flashcards)}")
            print(f"  Front: {card.front}")
            input("  [Press Enter to reveal answer] ")
            print(f"  Back:  {card.back}")
    except AIError as e:
        print(f"\n[Error] {e.message}")


def interactive_menu():
    print("=" * 50)
    print(f"  Welcome to {APP_NAME} (AI: {OPENAI_MODEL})")
    print("  Your AI-powered learning assistant")
    print("=" * 50)

    while True:
        print("\nChoose an option:")
        print("  1) Summarize study material")
        print("  2) Explain a difficult topic")
        print("  3) Generate an interactive quiz")
        print("  4) Generate revision flashcards")
        print("  5) Start FastAPI web server")
        print("  0) Exit")

        choice = input("\nEnter choice [0-5]: ").strip()
        if choice == "1":
            handle_summarize()
        elif choice == "2":
            handle_explain()
        elif choice == "3":
            handle_quiz()
        elif choice == "4":
            handle_flashcards()
        elif choice == "5":
            run_server()
            break
        elif choice in ("0", "exit", "quit", "q"):
            print(f"\nGoodbye! Happy learning with {APP_NAME}.")
            break
        else:
            print("Invalid selection. Please choose a number between 0 and 5.")


def main():
    if len(sys.argv) > 1 and sys.argv[1] in ("serve", "--serve", "server", "-s"):
        run_server()
    else:
        interactive_menu()


if __name__ == "__main__":
    main()
