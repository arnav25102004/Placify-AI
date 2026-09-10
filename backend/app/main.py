from fastapi import FastAPI

from app.routers import auth, batches, documents

app = FastAPI(title="Placify AI — Teacher Portal API")

app.include_router(auth.router)
app.include_router(batches.router)
app.include_router(documents.router)
