from openai import OpenAI
from app.config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)

def ask_ai(prompt: str) -> str:
    response = client.responses.create(
        model="gpt-6-luna",
        input=prompt
    )

    return response.output_text