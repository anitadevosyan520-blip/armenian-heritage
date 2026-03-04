"""
Armenian Heritage API - FastAPI backend
"""
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
import anthropic, json, os, re
from datetime import datetime

app = FastAPI(title="Հայkakan Zharangutyun API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

DATA_PATH = os.path.join(os.path.dirname(__file__), "data.json")

def parse_century(s: str) -> Optional[int]:
    if not s or s in ("-", ""): return None
    m = re.search(r'\b(\d{4})\b', s)
    if m: return ((int(m.group(1)) - 1) // 100) + 1
    mc = re.search(r'^(\d+)', s)
    if mc: return int(mc.group(1))
    return None

def cent_label(n: int) -> str:
    arm = {1:"Ա",2:"Բ",3:"Գ",4:"Դ",5:"Ե",6:"Զ",7:"Է",8:"Ը",9:"Թ",10:"Ժ",
           11:"ԺԱ",12:"ԺԲ",13:"ԺԳ",14:"ԺԴ",15:"ԺԵ",16:"ԺԶ",17:"ԺԷ",18:"ԺԸ",
           19:"ԺԹ",20:"Ի",21:"ԻԱ"}
    return f"{arm.get(n, str(n))} դ."

def load_churches():
    try:
        with open(DATA_PATH, encoding="utf-8") as f:
            raw = json.load(f)
    except: return []
    out = []
    for i, r in enumerate(raw):
        by = (r.get("Building year") or r.get("building_year") or "").strip()
        c = {
            "id": str(r.get("ID") or i+1),
            "name": (r.get("Name") or "").strip(),
            "type": (r.get("Type") or "").strip(),
            "country": (r.get("Country") or "").strip(),
            "city": (r.get("City/Village") or r.get("city") or "").strip(),
            "state": (r.get("State") or r.get("state") or "").strip(),
            "building_year": by,
            "location": (r.get("Location") or r.get("location") or "").strip(),
            "picture": (r.get("Picture") or r.get("picture") or "").strip() or None,
            "other_info": (r.get("Other  info") or r.get("other_info") or "").strip(),
            "century": parse_century(by),
        }
        if c["picture"] in ("-", ""): c["picture"] = None
        c["century_label"] = cent_label(c["century"]) if c["century"] else "Անhайт"
        out.append(c)
    return out

DB = load_churches()

class SubmitReq(BaseModel):
    name: str; type: str = "Եkeghetsi"; country: str; city: str = ""
    building_year: str = ""; location: str = ""; picture_url: str = ""
    other_info: str = ""; submitter_name: str = ""; submitter_email: str = ""

class ChatReq(BaseModel):
    message: str; history: List[Dict] = []

@app.get("/api/churches")
def list_churches(search: Optional[str]=None, country: Optional[str]=None,
                  type: Optional[str]=None, state: Optional[str]=None,
                  century: Optional[int]=None, skip: int=0, limit: int=60):
    items = DB
    if search:
        q = search.lower()
        items = [c for c in items if q in c["name"].lower() or q in c["city"].lower()
                 or q in c["country"].lower() or q in c["other_info"].lower()]
    if country: items = [c for c in items if c["country"] == country]
    if type:    items = [c for c in items if c["type"] == type]
    if state:   items = [c for c in items if c["state"] == state]
    if century is not None: items = [c for c in items if c.get("century") == century]
    return {"total": len(items), "items": items[skip:skip+limit]}

@app.get("/api/filters")
def filters():
    return {
        "countries": sorted({c["country"] for c in DB if c["country"]}),
        "types":     sorted({c["type"]    for c in DB if c["type"]}),
        "states":    sorted({c["state"]   for c in DB if c["state"]}),
        "centuries": sorted({c["century"] for c in DB if c["century"]}),
    }

@app.get("/api/stats")
def stats():
    bt, bc, bs, bce, nf = {},{},{},{},{}
    for c in DB:
        bt[c["type"]]    = bt.get(c["type"],0)+1
        bc[c["country"]] = bc.get(c["country"],0)+1
        bs[c["state"]]   = bs.get(c["state"],0)+1
        if c["century"]:
            lbl = cent_label(c["century"])
            bce[lbl] = bce.get(lbl,0)+1
        if c["name"] not in ("-",""):
            nf[c["name"]] = nf.get(c["name"],0)+1

    def s(d): return sorted(d.items(), key=lambda x:-x[1])

    return {
        "total": len(DB),
        "by_type":    [{"name":k,"value":v} for k,v in s(bt)],
        "by_country": [{"name":k,"value":v} for k,v in s(bc)[:15]],
        "by_state":   [{"name":k,"value":v} for k,v in s(bs)],
        "by_century": [{"century":k,"count":v} for k,v in
                       sorted(bce.items(), key=lambda x: int(re.search(r'\d+',x[0]).group()) if re.search(r'\d+',x[0]) else 99)],
        "top_names":  [{"name":n,"count":ct} for n,ct in s(nf)[:18]],
    }

@app.get("/api/timeline")
def timeline():
    grouped = {}
    unknown = []
    for ch in DB:
        cent = ch.get("century")
        if cent:
            grouped.setdefault(cent,[]).append({k:ch[k] for k in
                ("id","name","type","country","city","state","building_year","picture")})
        else:
            unknown.append({k:ch[k] for k in ("id","name","type","country")})
    return {
        "centuries": [{"century":k,"label":cent_label(k),"count":len(v),"churches":v}
                      for k,v in sorted(grouped.items())],
        "unknown_count": len(unknown),
    }

@app.post("/api/submit")
def submit(data: SubmitReq):
    sub = data.dict()
    sub["submitted_at"] = datetime.utcnow().isoformat()
    path = os.path.join(os.path.dirname(__file__), "pending.json")
    try:
        with open(path) as f: pending = json.load(f)
    except: pending = []
    pending.append(sub)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(pending, f, ensure_ascii=False, indent=2)
    return {"success": True, "message": "Ձеr hayty stacvel e. Shnorhakalutyun!"}

@app.post("/api/chat")
def chat(req: ChatReq):
    client = anthropic.Anthropic()
    system = f"""Dou haykakan ekeleciner, vankner, maturer u tachari masnaget es.
Bazaum ka {len(DB)} karuyts` amsboghj ashkarhits.
Pataskhani hayeren, hakim u chartsarashas.
Hayeric patmutyan, chartarapetutyan u ekelecakan zoghovi masin gitelikner uni.
Ankachkum` nergtsryal tarats namak mi el nakhavard pataskhani."""

    msgs = [{"role":h["role"],"content":h["content"]} for h in req.history[-8:]]
    msgs.append({"role":"user","content":req.message})
    r = client.messages.create(model="claude-opus-4-6", max_tokens=800,
                                system=system, messages=msgs)
    return {"response": r.content[0].text}

@app.get("/health")
def health(): return {"ok": True, "loaded": len(DB)}
