import os
import json
import time
import urllib.request
import urllib.error
import re
import sys

# Ensure stdout supports UTF-8, especially on Windows terminal
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

CACHE_FILE = "github-stats-cache.json"
DATA_FILE = os.path.join("js", "data.js")

def get_repo_details(owner, repo, token):
    url = f"https://api.github.com/repos/{owner}/{repo}"
    headers = {'User-Agent': 'WowkDigital-WD-HUB-Updater'}
    if token:
        headers['Authorization'] = f"token {token}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            return {
                "created_at": data.get("created_at"),
                "pushed_at": data.get("pushed_at") or data.get("updated_at"),
                "updated_at": data.get("updated_at")
            }
    except urllib.error.HTTPError as e:
        print(f"[ERROR] Failed to fetch stats for {owner}/{repo}: {e.code} {e.reason}")
        if e.code in [403, 429]:
            return {"rateLimited": True, "status": e.code}
        return None
    except Exception as e:
        print(f"[ERROR] Error fetching stats for {owner}/{repo}: {e}")
        return None

def parse_projects_from_js():
    if not os.path.exists(DATA_FILE):
        print(f"[ERROR] Data file not found at: {DATA_FILE}")
        sys.exit(1)
        
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Extract projects array contents
    # Looking for: const projects = [ ... ];
    match = re.search(r"const\s+projects\s*=\s*\[([\s\S]*?)\];", content)
    if not match:
        print("[ERROR] Could not find projects list in js/data.js")
        sys.exit(1)
        
    projects_content = match.group(1)
    
    # We will use simple regexes to find title and github fields within the JS objects
    # Splitting into individual object strings
    objects = re.findall(r"\{([\s\S]*?)\}", projects_content)
    
    projects = []
    for obj in objects:
        title_match = re.search(r'title:\s*["\'](.*?)["\']', obj)
        github_match = re.search(r'github:\s*["\'](.*?)["\']', obj)
        
        if title_match:
            title = title_match.group(1)
            github = github_match.group(1) if github_match else None
            projects.append({"title": title, "github": github})
            
    return projects

def main():
    print("Loading projects from data.js...")
    projects = parse_projects_from_js()
    
    # Load existing cache
    existing_cache = {"data": {}}
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                existing_cache = json.load(f)
        except Exception:
            pass
            
    if "data" not in existing_cache:
        existing_cache["data"] = {}
        
    token = os.environ.get('GITHUB_TOKEN') or os.environ.get('GH_TOKEN')
    if not token:
        print("[WARN] No GITHUB_TOKEN environment variable found. Rate limits may apply.")
    else:
        print("[INFO] Using GitHub Token for authenticated API calls.")
        
    new_data = {}
    rate_limited = False
    print(f"Starting update for {len(projects)} projects...")
    
    for i, project in enumerate(projects):
        github_url = project.get("github")
        title = project.get("title")
        
        if not github_url:
            print(f"[INFO] [{i + 1}/{len(projects)}] Skipping \"{title}\" (no GitHub URL)")
            continue
            
        github_url = github_url.strip().rstrip('/')
        if rate_limited:
            if github_url in existing_cache["data"]:
                new_data[github_url] = existing_cache["data"][github_url]
            continue
            
        parts = github_url.split('/')
        if len(parts) >= 5 and "github.com" in parts[2]:
            owner = parts[3]
            repo = parts[4]
            print(f"[FETCH] [{i + 1}/{len(projects)}] Fetching stats for {owner}/{repo}...")
            
            stats = get_repo_details(owner, repo, token)
            if stats and stats.get("rateLimited"):
                print("   [RATE LIMIT] GitHub API Rate limit hit. Suspending further API requests.")
                rate_limited = True
                if github_url in existing_cache["data"]:
                    new_data[github_url] = existing_cache["data"][github_url]
                continue
                
            if stats:
                new_data[github_url] = stats
                print(f"   [SUCCESS] Created: {stats['created_at'].split('T')[0]} | Updated: {stats['pushed_at'].split('T')[0]}")
            elif github_url in existing_cache["data"]:
                new_data[github_url] = existing_cache["data"][github_url]
                print("   [WARN] Kept existing cached stats.")
            else:
                print("   [FAIL] Failed to get stats.")
                
            time.sleep(0.5)
        else:
            print(f"[WARN] [{i + 1}/{len(projects)}] Invalid GitHub URL format: {github_url}")
            
    final_cache = {
        "timestamp": int(time.time() * 1000),
        "data": new_data
    }
    
    try:
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(final_cache, f, indent=2)
        print(f"\nStats update completed! Saved to {CACHE_FILE}")
    except Exception as e:
        print(f"[ERROR] Failed to save cache: {e}")

if __name__ == "__main__":
    main()
