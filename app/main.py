import logging
from typing import Optional
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import EventResponse, ResolutionResponse
from app.scraper import fetch_schedule, resolve_embed_player

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("huncho_tv_api")

app = FastAPI(
    title="Huncho TV Live Sports Schedule & Stream Resolver API",
    description="Backend microservice that parses real-time sports fixtures and extracts direct embed stream players.",
    version="1.0.0",
)

# Enable CORS middleware allowing all origins, headers, and HTTP methods
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health Check"])
async def root():
    """
    Health check endpoint returning API operational status.
    """
    return {
        "status": "ok",
        "service": "Huncho TV Live Sports API",
        "version": "1.0.0",
        "endpoints": [
            "/api/v1/fixtures",
            "/api/v1/resolve?target_url={url}"
        ]
    }


@app.get(
    "/api/v1/fixtures",
    response_model=EventResponse,
    tags=["Fixtures"],
    summary="Fetch real-time sports event schedules"
)
async def get_fixtures(index_url: Optional[str] = Query(None, description="Optional custom index URL to scrape")):
    """
    Scrapes the target sports index and returns structured event listings.
    """
    try:
        events = fetch_schedule(index_url) if index_url else fetch_schedule()
        return EventResponse(
            status="success",
            count=len(events),
            data=events
        )
    except Exception as exc:
        logger.error(f"Error fetching fixtures: {exc}", exc_info=True)
        return EventResponse(
            status="error",
            count=0,
            data=[]
        )


@app.get(
    "/api/v1/resolve",
    response_model=ResolutionResponse,
    tags=["Resolver"],
    summary="Resolve embed player URL from a stream page"
)
async def resolve_fixture_stream(
    target_url: str = Query(..., description="Target stream webpage URL containing the embed player")
):
    """
    Parses the target page DOM to extract the stream <iframe> player src.
    """
    try:
        embed_url = resolve_embed_player(target_url)
        if embed_url:
            return ResolutionResponse(
                status="success",
                embed_url=embed_url,
                message="Stream player iframe resolved successfully"
            )
        else:
            return ResolutionResponse(
                status="error",
                embed_url=None,
                message="No valid player iframe or stream source found on target page"
            )
    except Exception as exc:
        logger.error(f"Error resolving stream from {target_url}: {exc}", exc_info=True)
        return ResolutionResponse(
            status="error",
            embed_url=None,
            message=f"Resolver error: {str(exc)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
