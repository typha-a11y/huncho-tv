import logging
import re
from typing import List, Optional
from urllib.parse import urljoin
import requests
from bs4 import BeautifulSoup
from app.schemas import EventItem

logger = logging.getLogger(__name__)

DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/123.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "http://www.fawanews.sc/",
    "Connection": "keep-alive",
}

INDEX_URL = "http://www.fawanews.sc/index.html"


def fetch_schedule(index_url: str = INDEX_URL) -> List[EventItem]:
    """
    Sends an HTTP GET request to the index URL and parses the DOM
    to extract event titles, event descriptions/times, and target page links
    into a structured list of EventItem objects.
    """
    events: List[EventItem] = []

    try:
        response = requests.get(index_url, headers=DEFAULT_HEADERS, timeout=12)
        response.encoding = response.apparent_encoding or "utf-8"

        if response.status_code != 200:
            logger.warning(f"Fetch schedule failed with HTTP status code: {response.status_code}")
            return events

        soup = BeautifulSoup(response.text, "html.parser")

        # 1. Strategy A: Parse table rows or fixture list elements
        rows = soup.find_all(["tr", "li", "div"], class_=re.compile(r"(fixture|match|game|event|row|schedule)", re.I))
        
        # If no explicit class matches, search for all anchor links pointing to stream pages
        candidate_elements = rows if len(rows) > 0 else soup.find_all("a", href=True)

        event_id = 1
        seen_urls = set()

        for el in candidate_elements:
            # Look for anchor within element or element itself if it's an anchor
            link_tag = el if el.name == "a" else el.find("a", href=True)
            if not link_tag or not link_tag.get("href"):
                continue

            href = link_tag["href"].strip()
            # Ignore home, anchor links, and common non-event navigations
            if not href or href.startswith("#") or href.startswith("javascript:") or href in ["index.html", "/", ""]:
                continue

            absolute_url = urljoin(index_url, href)
            if absolute_url in seen_urls:
                continue

            # Extract title and text details
            title_text = link_tag.get_text(separator=" ", strip=True)
            if not title_text and el.name != "a":
                title_text = el.get_text(separator=" ", strip=True)

            # Skip short generic labels
            if len(title_text) < 3 or title_text.lower() in ["home", "contact", "about", "privacy", "dmca", "telegram", "vip"]:
                continue

            # Check if there is a separate time/detail span or sibling
            details_text = None
            time_tag = el.find(["span", "time", "small", "td"], class_=re.compile(r"(time|date|league|detail|clock)", re.I)) if el.name != "a" else None
            if time_tag:
                details_text = time_tag.get_text(strip=True)
            else:
                # Extract time pattern like "20:00", "15:30 EAT", "Live" if present in string
                time_match = re.search(r"(\b\d{1,2}:\d{2}(?:\s*(?:AM|PM|UTC|GMT|EAT|EST))?\b|\bLIVE\b|\bFT\b)", title_text, re.I)
                if time_match:
                    details_text = time_match.group(0)

            seen_urls.add(absolute_url)
            events.append(
                EventItem(
                    id=event_id,
                    title=title_text,
                    details=details_text or "Live Feed Available",
                    stream_url=absolute_url,
                )
            )
            event_id += 1

        # Strategy B: If no items found, fallback to parsing table cells
        if not events:
            tables = soup.find_all("table")
            for table in tables:
                for tr in table.find_all("tr"):
                    tds = tr.find_all("td")
                    if len(tds) >= 2:
                        a_tag = tr.find("a", href=True)
                        if a_tag:
                            full_url = urljoin(index_url, a_tag["href"])
                            title = a_tag.get_text(strip=True) or tds[0].get_text(strip=True)
                            details = tds[1].get_text(strip=True) if len(tds) > 1 else "Live Match"
                            if title and full_url not in seen_urls:
                                seen_urls.add(full_url)
                                events.append(
                                    EventItem(
                                        id=event_id,
                                        title=title,
                                        details=details,
                                        stream_url=full_url,
                                    )
                                )
                                event_id += 1

    except Exception as exc:
        logger.error(f"Error while parsing schedule from {index_url}: {exc}", exc_info=True)

    return events


def resolve_embed_player(target_url: str) -> Optional[str]:
    """
    Sends an HTTP GET request to a target link, parses the DOM for <iframe> elements,
    and returns the player `src` attribute.
    """
    if not target_url:
        return None

    try:
        headers = {
            **DEFAULT_HEADERS,
            "Referer": target_url,
        }
        response = requests.get(target_url, headers=headers, timeout=12)
        if response.status_code != 200:
            logger.warning(f"Resolve failed for {target_url} with HTTP {response.status_code}")
            return None

        soup = BeautifulSoup(response.text, "html.parser")

        # 1. Primary: Locate <iframe> with player/stream/embed src
        iframes = soup.find_all("iframe", src=True)
        for iframe in iframes:
            src = iframe["src"].strip()
            if not src or src.startswith("javascript:") or "ads" in src.lower() or "banner" in src.lower():
                continue
            embed_url = urljoin(target_url, src)
            return embed_url

        # 2. Fallback: Search for embedded player links, video elements or regex for stream URLs
        video_tag = soup.find("video")
        if video_tag and video_tag.get("src"):
            return urljoin(target_url, video_tag["src"])

        source_tag = soup.find("source", src=True)
        if source_tag:
            return urljoin(target_url, source_tag["src"])

        # Regex scan for common embed patterns (e.g. embed/player/stream URLs in script tags)
        match = re.search(r'https?://[^\s"\'<>]+\.(?:m3u8|mp4|html|php)\?[^\s"\'<>]*|https?://[^\s"\'<>]+(?:embed|player)[^\s"\'<>]*', response.text)
        if match:
            return match.group(0)

    except Exception as exc:
        logger.error(f"Error resolving embed player from {target_url}: {exc}", exc_info=True)

    return None
