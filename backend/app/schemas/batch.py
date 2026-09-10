from datetime import datetime

from pydantic import BaseModel


class BatchCreateResponse(BaseModel):
    id: int
    file_count: int
    status: str


class BatchSummary(BaseModel):
    id: int
    created_at: datetime
    file_count: int
    status: str

    class Config:
        from_attributes = True
