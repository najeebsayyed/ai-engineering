from fastapi import FastAPI

app = FastAPI(title="PDF Chatbot")

@app.get('/')
def home():
    return {"message": "PDF Chatbot API is running!"}