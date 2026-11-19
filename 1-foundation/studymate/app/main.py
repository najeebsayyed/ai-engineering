from app.ai import ask_ai

def main():
    prompt = input("Ask StudyMate a question: ")

    answer = ask_ai(prompt)

    print("\nStudyMate:")
    print(answer)


if __name__ == "__main__":
    main()