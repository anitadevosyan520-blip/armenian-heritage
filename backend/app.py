"""
Armenian Heritage Churches - FastAPI Backend
Provides data API, Anthropic chat proxy, and submission handling
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import httpx
import os
import re
from typing import Optional, List
from collections import Counter

app = FastAPI(
    title="Armenian Heritage Churches API",
    description="API for the Armenian Heritage Churches cataloging system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Data Loading ────────────────────────────────────────────────────────────

def clean_value(val: str) -> Optional[str]:
    if val in ["-", "", None]:
        return None
    return val

def parse_year(year_str: str) -> Optional[int]:
    """Extract numeric year from Armenian date strings."""
    if not year_str or year_str in ["-", ""]:
        return None
    match = re.search(r'(\d{4})', year_str)
    if match:
        return int(match.group(1))
    # Handle "17-րդ դար" type strings
    match = re.search(r'^(\d+)-', year_str)
    if match:
        century = int(match.group(1))
        return century * 100 - 50  # midpoint of century
    return None

def get_century(year_str: str) -> Optional[int]:
    """Get century number from date string."""
    if not year_str or year_str in ["-", ""]:
        return None
    # "17-րդ դար" → 17
    match = re.search(r'^(\d+)-(?:րդ|ին|ֆ)', year_str)
    if match:
        return int(match.group(1))
    # "1633" → 17
    match = re.search(r'^(\d{4})', year_str)
    if match:
        year = int(match.group(1))
        return (year - 1) // 100 + 1
    # "20-րդ դար"
    match = re.search(r'(\d+).*դար', year_str)
    if match:
        return int(match.group(1))
    return None

def century_label(n: int) -> str:
    """Armenian ordinal century label."""
    suffixes = {1:'ա', 2:'ա', 3:'ա', 4:'ա',
                5:'ա', 6:'ա', 7:'ա', 8:'ա',
                9:'ա', 10:'ա', 11:'ա', 12:'ա',
                13:'ա', 14:'ա', 15:'ա',
                16:'ա', 17:'ա', 18:'ա', 19:'ա', 20:'ա', 21:'ա'}
    return f"{n}-ին դ."

with open("churches.json", encoding="utf-8") as f:
    raw_churches = json.load(f)

CHURCHES = []
for idx, c in enumerate(raw_churches):
    church = {
        "id": str(c.get("ID") or idx + 1),
        "type": c.get("Type", "").strip(),
        "name": (c.get("Name") or "").strip(),
        "building_year": clean_value(c.get("Building year", "")),
        "year_numeric": parse_year(c.get("Building year", "")),
        "century": get_century(c.get("Building year", "")),
        "country": (c.get("Country") or "").strip(),
        "city": (c.get("City/Village") or "").strip(),
        "state": (c.get("State") or "").strip(),
        "location": clean_value(c.get("Location", "")),
        "picture": clean_value(c.get("Picture", "")),
        "info": (c.get("Other  info") or "").strip(),
    }
    CHURCHES.append(church)

# In-memory submissions store (use DB in production)
SUBMISSIONS: List[dict] = []

# ─── Models ──────────────────────────────────────────────────────────────────

class SubmissionRequest(BaseModel):
    name: str
    type: str
    country: str
    city: str
    building_year: Optional[str] = None
    state: Optional[str] = None
    location: Optional[str] = None
    info: Optional[str] = None
    submitter_name: Optional[str] = None
    submitter_email: Optional[str] = None

class ChatMessage(BaseModel):
    message: str
    history: List[dict] = []

# ─── Routes ──────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "Armenian Heritage Churches API", "total": len(CHURCHES)}

@app.get("/api/churches")
def get_churches(
    country: Optional[str] = None,
    type: Optional[str] = None,
    state: Optional[str] = None,
    century: Optional[int] = None,
    search: Optional[str] = None,
    page: int = 1,
    per_page: int = 50,
):
    result = CHURCHES
    if country:
        result = [c for c in result if c["country"] == country]
    if type:
        result = [c for c in result if c["type"] == type]
    if state:
        result = [c for c in result if c["state"] == state]
    if century:
        result = [c for c in result if c["century"] == century]
    if search:
        s = search.lower()
        result = [c for c in result if
                  s in c["name"].lower() or
                  s in c["city"].lower() or
                  s in c["country"].lower() or
                  s in (c["info"] or "").lower()]

    total = len(result)
    start = (page - 1) * per_page
    end = start + per_page
    return {
        "data": result[start:end],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page,
    }

@app.get("/api/churches/{church_id}")
def get_church(church_id: str):
    church = next((c for c in CHURCHES if c["id"] == church_id), None)
    if not church:
        raise HTTPException(status_code=404, detail="Church not found")
    return church

@app.get("/api/filters")
def get_filters():
    return {
        "countries": sorted(set(c["country"] for c in CHURCHES if c["country"])),
        "types": sorted(set(c["type"] for c in CHURCHES if c["type"])),
        "states": sorted(set(c["state"] for c in CHURCHES if c["state"])),
        "centuries": sorted(set(c["century"] for c in CHURCHES if c["century"])),
    }

@app.get("/api/stats")
def get_stats():
    by_type = Counter(c["type"] for c in CHURCHES if c["type"])
    by_state = Counter(c["state"] for c in CHURCHES if c["state"])
    by_country = Counter(c["country"] for c in CHURCHES if c["country"])
    by_century = Counter(c["century"] for c in CHURCHES if c["century"])

    # Top names (strip prefixes for grouping)
    def simplify_name(name):
        # Group Surb Grigor variants
        n = name.strip()
        if "Գրիգոր Լուսավ" in n:
            return "Սուրբ Գրիգոր Լուսավորիչ"
        if "Աստվածածին" in n:
            return "Սուրբ Աստվածածին"
        if "Գևորգ" in n:
            return "Սուրբ Գևորգ"
        if "Հակոբ" in n:
            return "Սուրբ Հակոբ"
        if "Ստեփանոս" in n:
            return "Սուրբ Ստեփանոս"
        if "Խաչ" in n:
            return "Սուրբ Խաչ"
        if "Հովհաննես Մ" in n:
            return "Սուրբ Հովհ. Մկրտիչ"
        if "Հովհաննես" in n:
            return "Սուրբ Հովհաննես"
        if "Սարգիս" in n:
            return "Սուրբ Սարգիս"
        if "Կարապետ" in n:
            return "Սուրբ Կարապետ"
        if "Մարիամ" in n:
            return "Սուրբ Մարիամ"
        if "Հարություն" in n:
            return "Սուրբ Հարություն"
        if "Վարդան" in n:
            return "Սուրբ Վարդան"
        if "Ստ" in n:
            return n
        return n
    
    name_counts = Counter(simplify_name(c["name"]) for c in CHURCHES if c["name"] and c["name"] != "-")

    # Timeline data
    timeline = []
    for c in sorted(CHURCHES, key=lambda x: (x["year_numeric"] or 9999)):
        if c["year_numeric"]:
            timeline.append({
                "id": c["id"],
                "name": c["name"],
                "year": c["year_numeric"],
                "century": c["century"],
                "type": c["type"],
                "country": c["country"],
                "city": c["city"],
                "state": c["state"],
                "picture": c["picture"],
            })

    return {
        "by_type": [{"name": k, "value": v} for k, v in sorted(by_type.items(), key=lambda x: x[1], reverse=True)],
        "by_state": [{"name": k, "value": v} for k, v in sorted(by_state.items(), key=lambda x: x[1], reverse=True)],
        "by_country": [{"name": k, "value": v} for k, v in sorted(by_country.items(), key=lambda x: x[1], reverse=True)[:15]],
        "by_century": [{"name": f"{k}–րդ դ.", "value": v, "century": k} for k, v in sorted(by_century.items())],
        "top_names": [{"name": k, "value": v} for k, v in name_counts.most_common(15)],
        "timeline": timeline[:50],
        "total": len(CHURCHES),
        "standing": sum(1 for c in CHURCHES if c["state"] == "Կանգուն"),
        "ruined": sum(1 for c in CHURCHES if c["state"] == "Ավերված"),
        "semi_ruined": sum(1 for c in CHURCHES if c["state"] == "Կիսավեր"),
        "countries": len(set(c["country"] for c in CHURCHES if c["country"])),
    }

@app.post("/api/submit")
def submit_church(submission: SubmissionRequest):
    data = submission.model_dump()
    data["id"] = f"sub_{len(SUBMISSIONS) + 1}"
    data["pending"] = True
    SUBMISSIONS.append(data)
    return {
        "message": "Շնորհակալություն։ Ձեր հայտն ստացվել է և կդիտարկվի մեր թիմի կողմից։",
        "id": data["id"]
    }

@app.get("/api/submissions")
def get_submissions():
    return {"data": SUBMISSIONS, "total": len(SUBMISSIONS)}

@app.post("/api/chat")
async def chat(req: ChatMessage):
    """Proxy chat to Anthropic API with Armenian church context."""
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    
    # Build rich system context
    stats = {
        "total": len(CHURCHES),
        "countries": len(set(c["country"] for c in CHURCHES if c["country"])),
        "standing": sum(1 for c in CHURCHES if c["state"] == "Կանգուն"),
        "ruined": sum(1 for c in CHURCHES if c["state"] == "Ավերված"),
    }
    
    system_prompt = f"""Դու հայկական ճարտարապետական և կրոնական ժառանգության փորձագետ ես՝ «Հայկական Ժառանգություն» նախաձեռնության շրջանակներում։

ՏՎՅԱԼՆԵՐԻ ԲԱԶԱՅԻ ԱՄՓՈՓ ՏԵՂԵԿՈՒԹՅՈՒՆ.
- Ընդհանուր կառույցներ՝ {stats['total']}
- Ներկայացված երկրներ՝ {stats['countries']}
- Կանգուն կառույցներ՝ {stats['standing']}
- Ավերված կառույցներ՝ {stats['ruined']}
- Ծածկված Ադրբեջան, ԱՄՆ, Բուլղարիա, Ավստրալիա, Կանադա, Արգենտինա, Բրազիլիա, Ավստրիա, Իտալիա, Բելգիա, Եգիպտոս, Եթովպիա, Էստոնիա, ԱՄԷ, Բելառուս, Բանգլադեշ, Աֆղ. և այլն

ԿԱՌՈՒՅՑՆԵՐԻ ՏԵՍԱԿՆԵՐ.
- Եկեղեցի, Վանք, Մատուռ, Տաճար

ՀԱՅՏՆԻ ԿԱՌՈՒՅՑՆԵՐ.
- Ուսթըրի Սուրբ Փրկիչ (1891) – ԱՄՆ-ի 1-ին հայ. ե.
- Վիեննայի Մխիթ. Վ. (1810) – 2800+ ձ. եւ 170000+ տ.
- Ջենովայի Ս. Բ. (1308) – Մ-ի Ս.Ա.-ի կ.
- Ադրբ-ի Ս.Թ-Բ. Տ. (1907) – 1937-ին պ.
- Աֆղ. Ս.Թ. Մ. (2010) – Ա-ի մ. հ. մ.

ՈՒՂՂՈՒԹՅԱՄԲ.
- Պատ. ա. հ., ե., ե. կ., ճ. ո, ե. ե.
- Ե. կ. ե., ժ., ա., ա.
- Ե. մ. ժ. ա.

Պատասխանիր նույն լեզվով, ինչ հարցը (հայ./անգ./ռուս./ֆր.)։
Եղիր ջերմ, ճշտասեր, հայ ժառ-ն ընդգծիր:
"""

    messages = []
    for h in (req.history or [])[-8:]:
        if h.get("role") in ("user", "assistant") and h.get("content"):
            messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": req.message})

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": "claude-sonnet-4-20250514",
                    "max_tokens": 1024,
                    "system": system_prompt,
                    "messages": messages,
                },
            )

        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail=f"Upstream error: {resp.text}")

        data = resp.json()
        return {"response": data["content"][0]["text"]}
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Chat service timeout")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
