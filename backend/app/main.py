from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, batches, documents, student

app = FastAPI(title="Placify AI — Placement Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

app.include_router(auth.router)
app.include_router(batches.router)
app.include_router(documents.router)
app.include_router(student.router)

