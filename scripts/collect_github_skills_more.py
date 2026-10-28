#!/usr/bin/env python3
"""Collect public SKILL.md candidates from GitHub code search into a deduped JSON file."""
import json, os, subprocess, sys, time, urllib.error, urllib.parse, urllib.request

TOKEN = subprocess.check_output(["gh", "auth", "token"]).decode().strip()
QUERIES = [
    "filename:SKILL.md path:agents",
    "filename:SKILL.md path:agent",
    "filename:SKILL.md path:workflows",
    'filename:SKILL.md "user-invocable"',
    'filename:SKILL.md "disable-model-invocation"',
    'filename:SKILL.md "allowed-tools:"',
    'filename:SKILL.md "license:"',
    'filename:SKILL.md "metadata:"',
    "filename:SKILL.md path:.github/skills",
    "filename:SKILL.md path:prompts",
    "filename:SKILL.md path:ai",
    'filename:SKILL.md path:skills "SKILL.md"',
]
OUT = "library/raw-results.json"
LOG = "library/collect.log"

def log(message):
    line = time.strftime("%H:%M:%S ") + message
    print(line, flush=True)
    with open(LOG, "a", encoding="utf-8") as handle:
        handle.write(line + "\n")

def search(query, page):
    url = "https://api.github.com/search/code?" + urllib.parse.urlencode(
        {"q": query, "per_page": 100, "page": page}
    )
    request = urllib.request.Request(
        url,
        headers={
            "Authorization": "Bearer " + TOKEN,
            "Accept": "application/vnd.github+json",
            "User-Agent": "ronge-skill-studio",
        },
    )
    with urllib.request.urlopen(request, timeout=45) as response:
        return json.load(response)

def main():
    seen = {}
    if os.path.exists(OUT):
        try:
            old = json.load(open(OUT, encoding="utf-8"))
            for item in old.get("items", []):
                seen[item["repo"] + "::" + item["path"]] = item
            log(f"resume with {len(seen)} items")
        except Exception:
            seen = {}
    for query in QUERIES:
        log("QUERY " + query)
        for page in range(1, 11):
            attempt = 0
            while True:
                try:
                    data = search(query, page)
                    break
                except urllib.error.HTTPError as error:
                    if error.code in (403, 429) and attempt < 3:
                        attempt += 1
                        log(f"rate limited ({error.code}), sleep 65s")
                        time.sleep(65)
                        continue
                    log(f"HTTP {error.code} on page {page}")
                    data = None
                    break
                except Exception as error:
                    attempt += 1
                    if attempt < 3:
                        log("retry " + str(error)[:120])
                        time.sleep(10)
                        continue
                    data = None
                    break
            if not data:
                break
            items = data.get("items", [])
            added = 0
            for item in items:
                repo = item["repository"]
                full_name = repo["full_name"]
                path = item["path"]
                key = full_name + "::" + path
                if key in seen:
                    continue
                seen[key] = {
                    "name": path.split("/")[-2] if "/" in path else path,
                    "repo": full_name,
                    "path": path,
                    "html_url": item.get("html_url"),
                    "repo_description": repo.get("description") or "",
                    "repo_fork": bool(repo.get("forks_url") and repo.get("isFork")),
                }
                added += 1
            log(f"page {page}: {len(items)} items, +{added}, total {len(seen)}")
            with open(OUT, "w", encoding="utf-8") as handle:
                json.dump({"generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "items": list(seen.values())}, handle, ensure_ascii=False)
            if len(items) < 100:
                break
            time.sleep(6.5)
    log(f"DONE total {len(seen)}")

if __name__ == "__main__":
    main()
