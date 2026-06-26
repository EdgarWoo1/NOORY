#!/usr/bin/env python3
# NOORY 정적 사이트 -> posts.json 추출기
import os, re, json, glob
from bs4 import BeautifulSoup

SRC = "/Users/shwoo/Desktop/NOORY"
OUT = None  # set by caller / printed

TRAVEL_LISTS = ["blog.html", "blog2.html"]
DIARY_LISTS = ["PageEtc.html","PageEtc2.html","PageEtc3.html","PageEtc4.html",
               "PageEtc5.html","PageEtc6.html","PageEtc7.html"]

def read(f):
    p = os.path.join(SRC, f)
    with open(p, encoding="utf-8") as fh:
        return fh.read()

# 실제 파일 해석: href가 'etc_2.html' 또는 'etc_46_이방인.html' 일 수 있고
# 실제 파일명과 다를 수 있으니 매핑한다.
ALL_FILES = {os.path.basename(p) for p in glob.glob(os.path.join(SRC, "*.html"))}

def resolve_file(href):
    href = href.strip()
    if not href or href in ("", "#"):
        return None
    base = os.path.basename(href)
    if base in ALL_FILES:
        return base
    # etc_46.html -> etc_46_*.html  /  etc_46_x.html -> etc_46_*.html
    m = re.match(r"(etc_\d+)", base)
    if m:
        stem = m.group(1)
        for f in ALL_FILES:
            if f.startswith(stem + "_") or f == stem + ".html":
                return f
    # numbered travel 1.html..9.html
    if base in ALL_FILES:
        return base
    return None

MONTHS = {"jan":1,"feb":2,"mar":3,"apr":4,"may":5,"jun":6,"jul":7,"aug":8,
          "sep":9,"oct":10,"nov":11,"dec":12}

def parse_date(top, bottom):
    """카드의 날짜 배지 -> ISO 날짜(가능하면). 못하면 None."""
    top = (top or "").strip()
    bottom = (bottom or "").strip()
    # 책 카드: top=요일(SUN), bottom='22.10.30'
    m = re.match(r"(\d{2})\.(\d{1,2})\.(\d{1,2})", bottom)
    if m:
        y,mo,d = m.groups()
        return f"20{y}-{int(mo):02d}-{int(d):02d}"
    # 여행 카드: top='01', bottom='Jan'  (placeholder) -> None
    return None

def extract_cards(list_files, category):
    cards = []
    for lf in list_files:
        if lf not in ALL_FILES:
            continue
        soup = BeautifulSoup(read(lf), "html.parser")
        for item in soup.select(".blog-item"):
            link = item.select_one("a.h5")
            href = link.get("href") if link else None
            if not href:
                img = item.select_one("img[onclick]")
                if img:
                    m = re.search(r"location\.href='([^']+)'", img.get("onclick",""))
                    href = m.group(1) if m else None
            target = resolve_file(href) if href else None
            if not target:
                continue
            title = link.get_text(" ", strip=True) if link else target
            img = item.select_one(".position-relative img")
            thumb = img.get("src") if img else None
            date_top = item.select_one(".blog-date h6")
            date_bot = item.select_one(".blog-date small")
            tags = item.select(".d-flex a.text-primary")
            tag = tags[-1].get_text(" ", strip=True) if len(tags) >= 1 else ""
            if tag.lower() == "admin":
                tag = ""
            cards.append({
                "slug": os.path.splitext(target)[0],
                "file": target,
                "title": title,
                "category": category,
                "tag": tag,
                "thumb": thumb,
                "dateLabel": (date_bot.get_text(strip=True) if date_bot else ""),
                "date": parse_date(date_top.get_text(strip=True) if date_top else "",
                                   date_bot.get_text(strip=True) if date_bot else ""),
            })
    return cards

def fix_src(tag_attr):
    # 'img/...' -> '/img/...'  (절대경로화). 외부 URL은 그대로.
    if not tag_attr:
        return tag_attr
    s = tag_attr.strip()
    if s.startswith("http://") or s.startswith("https://") or s.startswith("/"):
        return s
    if s.startswith("img/"):
        return "/" + s
    return s

def extract_body(file):
    soup = BeautifulSoup(read(file), "html.parser")
    # 본문: 첫 번째 div.bg-white.mb-3 (padding:20px) 우선
    body = None
    for c in soup.select("div.bg-white"):
        cls = c.get("class") or []
        style = c.get("style","")
        if "mb-3" in cls and "padding: 20px" in style:
            body = c
            break
    if body is None:
        # fallback: 가장 텍스트/이미지 많은 bg-white
        cands = soup.select("div.bg-white")
        if cands:
            body = max(cands, key=lambda c: len(c.get_text(strip=True)) + len(c.select("img"))*200)
    if body is None:
        return "", ""
    # 정리: 메타(Admin | tag) 줄, script/style 제거, onclick 제거, src 절대화
    for d in body.select("div.d-flex.mb-3"):
        d.decompose()
    for s in body.select("script, style"):
        s.decompose()
    for img in body.select("img"):
        img["src"] = fix_src(img.get("src"))
        if img.has_attr("onclick"): del img["onclick"]
        if img.has_attr("style"): pass
    for a in body.select("[onclick]"):
        del a["onclick"]
    # 페이지 헤더 제목(여행기) 보강용
    h3 = soup.select_one("h3.display-4")
    header = h3.get_text(" ", strip=True) if h3 else ""
    html = body.decode_contents()
    # 공백 정리
    html = re.sub(r"\n\s*\n+", "\n", html).strip()
    plain = body.get_text(" ", strip=True)
    plain = re.sub(r"\s+", " ", plain)
    return html, plain

def main():
    cards = []
    cards += extract_cards(TRAVEL_LISTS, "여행기")
    cards += extract_cards(DIARY_LISTS, "일기")
    # dedupe by slug, keep first, preserve order
    seen = {}
    ordered = []
    for c in cards:
        if c["slug"] in seen:
            continue
        seen[c["slug"]] = c
        ordered.append(c)
    posts = []
    for i, c in enumerate(ordered):
        html, plain = extract_body(c["file"])
        c["thumb"] = fix_src(c["thumb"])
        posts.append({
            "slug": c["slug"],
            "title": c["title"],
            "category": c["category"],
            "tag": c["tag"],
            "date": c["date"],
            "dateLabel": c["dateLabel"],
            "thumb": c["thumb"],
            "order": i,
            "bodyHtml": html,
            "text": plain[:4000],
        })
    out_path = os.environ.get("OUT", "/tmp/posts.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(posts, f, ensure_ascii=False, indent=1)
    # summary
    from collections import Counter
    cat = Counter(p["category"] for p in posts)
    print("total posts:", len(posts), dict(cat))
    nobody = [p["slug"] for p in posts if not p["bodyHtml"]]
    print("empty body:", nobody)
    nothumb = [p["slug"] for p in posts if not p["thumb"]]
    print("no thumb:", nothumb)
    print("--- sample travel ---")
    for p in posts:
        if p["category"]=="여행기":
            print(p["slug"], "|", p["title"][:40], "| thumb=",p["thumb"], "| imgs in body:", p["bodyHtml"].count("<img"))
            break
    print("--- sample diary ---")
    for p in posts:
        if p["category"]=="일기":
            print(p["slug"], "|", p["title"][:40], "| date=",p["date"], p["dateLabel"], "| bodylen=",len(p["bodyHtml"]))
            print("   bodyHtml head:", p["bodyHtml"][:300].replace("\n"," "))
            break

if __name__ == "__main__":
    main()
