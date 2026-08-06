from fastapi import FastAPI

app = FastAPI(
    title="MailFlow API",
    version="1.0.0"
)

@app.get("/")
def home():
    return {
        "message": "Welcome to MailFlow API "
    }

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }