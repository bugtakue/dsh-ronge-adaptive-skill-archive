#!/usr/bin/env python3
"""Build the Ronge Scroll Library index from collected GitHub SKILL.md candidates."""
import concurrent.futures, json, os, re, time, urllib.request

RAW = "library/raw-results.json"
CACHE = "library/frontmatter-cache.json"
OUT = "library/skills-index.json"
PROGRESS = "library/build-progress.log"
OFFICIAL = {
    "anthropics", "openai", "microsoft", "google", "github", "deepseek-ai",
    "vercel", "cloudflare", "aws", "supabase", "stripe", "shopify", "figma",
    "huggingface", "langchain-ai", "modelcontextprotocol",
}
CATEGORY_RULES = [
    ("video", ["video", "ffmpeg", "subtitle", "caption", "animation", "motion", "hyperframes", "视频", "剪辑", "分镜", "字幕", "动画", "可灵", "镜头"]),
    ("design", ["design", "ui", "ux", "figma", "image", "photo", "logo", "brand", "css", "tailwind", "frontend", "front-end", "海报", "设计", "图片", "配色"]),
    ("office", ["docx", "xlsx", "pptx", "pdf", "word", "excel", "powerpoint", "office", "文档", "表格", "演示", "幻灯"]),
    ("data", ["data", "sql", "database", "analytics", "analysis", "chart", "数据", "分析", "数据库", "报表"]),
    ("ai", ["ai", "llm", "agent", "prompt", "mcp", "model", "machine-learning", "智能体", "模型", "提示词"]),
    ("writing", ["writing", "writer", "copywriting", "content", "blog", "article", "写作", "文案", "文章", "编辑"]),
    ("marketing", ["marketing", "seo", "social", "douyin", "tiktok", "ads", "growth", "营销", "运营", "抖音", "增长"]),
    ("coding", ["code", "coding", "developer", "git", "github", "api", "backend", "react", "python", "typescript", "testing", "debug", "代码", "开发", "编程", "测试"]),
    ("education", ["learn", "teach", "course", "tutor", "教育", "学习", "课程", "教学"]),
    ("productivity", ["productivity", "note", "task", "calendar", "email", "workflow", "效率", "笔记", "日程", "待办"]),
    ("research", ["research", "paper", "survey", "研究", "论文", "调研"]),
    ("business", ["business", "sales", "crm", "finance", "商业", "销售", "财务", "创业"]),
    ("security", ["security", "auth", "pentest", "安全", "渗透", "认证"]),
]

def log(message):
    line = time.strftime("%H:%M:%S ") + message
    print(line, flush=True)
    with open(PROGRESS, "a", encoding="utf-8") as handle:
        handle.write(line + "\n")

def parse_frontmatter(text):
    match = re.match(r"^---\r?\n([\s\S]*?)\r?\n---", text)
    if not match:
        return {}
    data = {}
    lines = match.group(1).splitlines()
    i = 0
    while i < len(lines):
        field = re.match(r"^([A-Za-z0-9_-]+):\s*(.*)$", lines[i])
        if not field:
            i += 1
            continue
        key, value = field.group(1), field.group(2).strip()
        i += 1
        if value in (">", "|", ">-", "|-"):
            buffer = []
            while i < len(lines) and (lines[i].startswith(" ") or lines[i].startswith("\t") or lines[i].strip() == ""):
                buffer.append(lines[i].strip())
                i += 1
            value = " ".join(item for item in buffer if item)
        elif (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
            value = value[1:-1]
        data[key] = value
    return data

def raw_url(item):
    html = item.get("html_url") or ""
    marker = "/blob/"
    if marker not in html:
        return None
    head, tail = html.split(marker, 1)
    return head.replace("https://github.com/", "https://raw.githubusercontent.com/") + "/" + tail

def fetch_one(item):
    url = raw_url(item)
    if not url:
        return item["repo"] + "::" + item["path"], None
    try:
        request = urllib.request.Request(url, headers={"User-Agent": "ronge-skill-studio"})
        text = urllib.request.urlopen(request, timeout=20).read().decode("utf-8", errors="replace")
        if len(text) > 262144:
            return item["repo"] + "::" + item["path"], None
        return item["repo"] + "::" + item["path"], parse_frontmatter(text)
    except Exception:
        return item["repo"] + "::" + item["path"], None

def keyword_match(lower, keyword):
    if re.fullmatch(r"[a-z0-9-]+", keyword):
        return re.search(r"(?<![a-z0-9])" + re.escape(keyword) + r"(?![a-z0-9])", lower) is not None
    return keyword in lower

def category_for(text):
    lower = text.lower()
    for category, keywords in CATEGORY_RULES:
        if any(keyword_match(lower, keyword) for keyword in keywords):
            return category
    return "other"

def build_entry(item, front):
    repo = item["repo"]
    owner = repo.split("/")[0].lower()
    path = item["path"]
    name = (front or {}).get("name") or (path.split("/")[-2] if "/" in path else "skill")
    name = re.sub(r"[^a-z0-9-]+", "-", str(name).lower()).strip("-")
    if not name:
        name = "skill"
    description = ((front or {}).get("description") or item.get("repo_description") or "").replace("\n", " ").strip()
    when_to_use = ((front or {}).get("whenToUse") or (front or {}).get("when_to_use") or "").replace("\n", " ").strip()
    text = " ".join([name, description, when_to_use, repo, path]).lower()
    category = category_for(text)
    rating = 2.5
    if owner in OFFICIAL:
        rating += 1.2
    if description and len(description) >= 80:
        rating += 0.5
    if path.startswith("skills/") or "/skills/" in path or path.startswith(".claude/skills/"):
        rating += 0.4
    if front and front.get("name") and front.get("description"):
        rating += 0.4
    if when_to_use:
        rating += 0.2
    if not description:
        rating -= 0.8
    rating = max(1.0, min(5.0, round(rating, 1)))
    return {
        "name": name,
        "description": description,
        "whenToUse": when_to_use or None,
        "category": category,
        "rating": rating,
        "repo": repo,
        "path": path,
        "url": item.get("html_url"),
        "rawUrl": raw_url(item),
        "trust": "official" if owner in OFFICIAL else "community",
    }

def main():
    raw = json.load(open(RAW, encoding="utf-8"))
    items = raw.get("items", [])
    log(f"loaded {len(items)} candidates")
    cache = {}
    if os.path.exists(CACHE):
        try:
            cache = json.load(open(CACHE, encoding="utf-8"))
        except Exception:
            cache = {}
    pending = [item for item in items if item["repo"] + "::" + item["path"] not in cache]
    limit = int(os.environ.get("BUILD_ENRICH_LIMIT", "3000"))
    pending = pending[:limit]
    log(f"need frontmatter for {len(pending)} (enrich limit {limit})")
    with concurrent.futures.ThreadPoolExecutor(max_workers=24) as pool:
        futures = [pool.submit(fetch_one, item) for item in pending]
        for index, future in enumerate(concurrent.futures.as_completed(futures), 1):
            key, front = future.result()
            cache[key] = front
            if index % 200 == 0:
                log(f"frontmatter {index}/{len(pending)}")
                with open(CACHE, "w", encoding="utf-8") as handle:
                    json.dump(cache, handle, ensure_ascii=False)
    with open(CACHE, "w", encoding="utf-8") as handle:
        json.dump(cache, handle, ensure_ascii=False)
    entries = []
    seen = set()
    for item in items:
        key = item["repo"] + "::" + item["path"]
        if key in seen:
            continue
        seen.add(key)
        entry = build_entry(item, cache.get(key))
        entries.append(entry)
    entries.sort(key=lambda item: (-item["rating"], item["repo"], item["path"]))
    categories = {}
    for entry in entries:
        categories[entry["category"]] = categories.get(entry["category"], 0) + 1
    result = {
        "name": "荣哥技能卷轴收藏馆",
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "total": len(entries),
        "categories": categories,
        "entries": entries,
    }
    with open(OUT, "w", encoding="utf-8") as handle:
        json.dump(result, handle, ensure_ascii=False)
    log(f"wrote {OUT} total={len(entries)} categories={categories}")

if __name__ == "__main__":
    main()
