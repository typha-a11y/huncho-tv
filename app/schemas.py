from typing import List, Optional
from pydantic import BaseModel, Field


class EventItem(BaseModel):
    id: int = Field(..., description="Unique sequential identifier for the event")
    title: str = Field(..., description="Full title of the sporting fixture or match")
    details: Optional[str] = Field(None, description="Match time, league, or additional event context")
    stream_url: Optional[str] = Field(None, description="Direct URL or target page link to resolve the stream")


class EventResponse(BaseModel):
    status: str = Field(default="success", description="Response status (e.g. success, error)")
    count: int = Field(..., description="Total number of event items returned")
    data: List[EventItem] = Field(default_factory=list, description="List of parsed event items")


class ResolutionResponse(BaseModel):
    status: str = Field(..., description="Resolution status (e.g. success, error)")
    embed_url: Optional[str] = Field(None, description="Direct embed player URL extracted from iframe")
    message: Optional[str] = Field(None, description="Detailed status or error message")
