from fastapi import FastAPI

from app.routers import auth, batches, documents, student

app = FastAPI(title="Placify AI — Placement Intelligence API")

app.include_router(auth.router)
app.include_router(batches.router)
app.include_router(documents.router)
app.include_router(student.router)
