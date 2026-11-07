"""Licensed photo search and CLIP ranking for SocialCraft.

Google and Bing page scraping are not used. Openverse is a supported
catalog of images that already carry a license.
"""

from __future__ import annotations

import io
import re
from urllib.parse import urlparse
from urllib.request import Request, urlopen

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

ALLOWED_LICENSES = {"cc0", "pdm", "by", "by-sa"}
STOPWORDS = {
    "the", "and", "for", "with", "our", "your", "this", "that", "from", "into",
    "today", "very", "are", "was", "were", "have", "has", "had", "you", "we",
    "they", "about", "just", "will", "been", "its", "his", "her", "she", "him",
    "who", "what", "when", "where", "which", "while", "also", "than", "then",
    "because", "there", "their", "them", "here", "over", "under", "after",
    "before", "please", "post", "instagram", "photo", "picture", "image",
    "happy", "welcome", "arrived", "special", "really", "much", "good", "great",
}

_model = None
_processor = None


class SearchBody(BaseModel):
    prompt: str


def keywords(text: str) -> str:
    words = re.findall(r"[a-zA-Z]{3,}", text.lower())
    kept = [word for word in words if word not in STOPWORDS]
    query = " ".join(kept[:8]).strip()
    return query or text.strip()[:80]


def license_allows_commercial_edit(code: str) -> bool:
    normalized = (code or "").lower().strip()
    if "nc" in normalized or "nd" in normalized:
        return False
    return normalized in ALLOWED_LICENSES


def public_https(url: str) -> bool:
    try:
        parsed = urlparse(url)
    except Exception:
        return False
    if parsed.scheme != "https" or not parsed.hostname:
        return False
    host = parsed.hostname.lower()
    if host in {"localhost", "127.0.0.1", "0.0.0.0"} or host.endswith(".local"):
        return False
    return True


def load_clip():
    global _model, _processor
    if _model is None:
        import torch
        from transformers import CLIPModel, CLIPProcessor
        _processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
        _model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
        _model.eval()
        _model._device_torch = torch
    return _model, _processor


def fetch_json(url: str) -> dict:
    request = Request(url, headers={"User-Agent": "SocialCraft/1.0 (licensed image search)"})
    with urlopen(request, timeout=20) as response:
        import json
        return json.loads(response.read().decode("utf-8"))


def fetch_image(url: str):
    if not public_https(url):
        return None
    try:
        request = Request(url, headers={"User-Agent": "SocialCraft/1.0 (licensed image search)"})
        with urlopen(request, timeout=12) as response:
            kind = response.headers.get("Content-Type", "")
            data = response.read(2_500_000)
        if "image" not in kind and not url.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
            return None
        from PIL import Image
        image = Image.open(io.BytesIO(data)).convert("RGB")
        if min(image.size) < 64:
            return None
        image.thumbnail((224, 224))
        return image
    except Exception:
        return None


def search_openverse(query: str) -> list[dict]:
    from urllib.parse import urlencode

    url = "https://api.openverse.org/v1/images/?" + urlencode({
        "q": query,
        "page_size": "20",
        "license_type": "commercial",
    })
    payload = fetch_json(url)
    found = []
    for item in payload.get("results") or []:
        license_code = str(item.get("license") or "")
        image_url = item.get("url") or ""
        if not license_allows_commercial_edit(license_code):
            continue
        if not public_https(image_url):
            continue
        found.append({
            "title": item.get("title") or "Photo",
            "imageUrl": image_url,
            "thumbnailUrl": image_url,
            "sourcePage": item.get("foreign_landing_url") or item.get("detail_url") or "",
            "creator": item.get("creator") or "Unknown",
            "license": license_code,
            "provider": item.get("source") or "openverse",
        })
    return found


def rank_with_clip(prompt: str, candidates: list[dict]) -> list[dict]:
    images = []
    kept = []
    for candidate in candidates:
        image = fetch_image(candidate["thumbnailUrl"])
        if image is None:
            continue
        images.append(image)
        kept.append(candidate)
        if len(kept) >= 8:
            break
    if not kept:
        return []

    model, processor = load_clip()
    torch = model._device_torch
    inputs = processor(text=[prompt], images=images, return_tensors="pt", padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
        scores = outputs.logits_per_image.view(-1).softmax(dim=0).tolist()
    ranked = []
    for candidate, score in zip(kept, scores):
        ranked.append({**candidate, "score": round(float(score), 4)})
    ranked.sort(key=lambda item: item["score"], reverse=True)
    return ranked


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/search")
def search(body: SearchBody):
    prompt = body.prompt.strip()
    if len(prompt) < 3:
        return {"images": [], "query": ""}
    words = keywords(prompt).split()
    query = " ".join(words[:3])
    candidates = search_openverse(query)
    if len(candidates) < 4 and words:
        broader = max(words, key=len)
        if broader != query:
            seen = {item["imageUrl"] for item in candidates}
            for item in search_openverse(broader):
                if item["imageUrl"] not in seen:
                    candidates.append(item)
                    seen.add(item["imageUrl"])
    try:
        ranked = rank_with_clip(prompt, candidates)
    except Exception:
        ranked = []
    seen = {item["imageUrl"] for item in ranked}
    extras = [{**item, "score": 0} for item in candidates if item["imageUrl"] not in seen]
    return {"query": query, "images": (ranked + extras)[:8]}
