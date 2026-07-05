import argparse
import os
import json
import time
import subprocess
import urllib.request
import urllib.error
import re
import sys
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

# Ensure stdout supports UTF-8, especially on Windows terminal
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


def get_repo_details(owner, repo):
    url = f"https://api.github.com/repos/{owner}/{repo}"
    headers = {'User-Agent': 'WD-HUB-Automation'}
    token = os.environ.get('GITHUB_TOKEN') or os.environ.get('GH_TOKEN')
    if token:
        headers['Authorization'] = f"token {token}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        print(f"Error fetching repo from GitHub API: {e.code} {e.reason}")
        return None
    except Exception as e:
        print(f"Error connecting to GitHub API: {e}")
        return None

def main():
    parser = argparse.ArgumentParser(description="Automate adding a new app card to WD HUB.")
    parser.add_argument("repo_url", help="GitHub repository URL (e.g. https://github.com/WowkDigital/MemoCard)")
    parser.add_argument("--url", help="App deployment URL (defaults to GitHub repo homepage or GitHub Pages URL)")
    parser.add_argument("--icon", default="globe", help="Lucide icon identifier (default: globe)")
    parser.add_argument("--color", default="primary", help="Tailwind color class (default: primary)")
    parser.add_argument("--effect", default="hueRotate", help="Hover effect: hueRotate, glitch, matrix, shake, neon (default: hueRotate)")
    parser.add_argument("--title", help="Custom title (defaults to Repository Name)")
    parser.add_argument("--desc", help="Custom short description")
    parser.add_argument("--long-desc", help="Custom long description")
    parser.add_argument("--no-screenshot", action="store_true", help="Skip capturing preview image via headless browser")

    args = parser.parse_args()

    # Parse repo url
    repo_url = args.repo_url.strip().rstrip('/')
    if not repo_url.startswith("https://github.com/"):
        print("Error: Repository URL must start with https://github.com/")
        return

    parts = repo_url.split('/')
    if len(parts) < 5:
        print("Error: Invalid GitHub URL format. Expected: https://github.com/owner/repo")
        return

    owner = parts[3]
    repo_name = parts[4]

    print(f"\n⚙️ Processing project: {repo_name} (Owner: {owner})")

    # 1. Fetch details from GitHub API
    print("Fetching repository details from GitHub API...")
    repo_data = get_repo_details(owner, repo_name)
    
    title = args.title or repo_name
    github_description = (repo_data.get('description') or '') if repo_data else ''
    
    # Clean up description
    short_desc = args.desc or (github_description[:100] + '...' if len(github_description) > 100 else github_description) or "A Wowk Digital project."
    long_desc = args.long_desc or github_description or "An interactive web application developed by Wowk Digital."

    # Guess / use URL
    app_url = args.url
    if not app_url:
        if repo_data and repo_data.get('homepage'):
            app_url = repo_data['homepage']
        else:
            app_url = f"https://{owner.lower()}.github.io/{repo_name}/"
    
    # Ensure trailing slash for uniformity
    if not app_url.endswith('/'):
        app_url += '/'

    print(f"App URL: {app_url}")
    print(f"Short Description: {short_desc}")
    
    # 2. Capture preview image
    assets_dir = os.path.join("assets", repo_name)
    os.makedirs(assets_dir, exist_ok=True)

    if args.no_screenshot:
        print("Skipping headless browser screenshot capture (--no-screenshot).")
    else:
        print("Launching headless browser to capture preview image...")
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--window-size=1536,1000')
        options.add_argument('--disable-gpu')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')

        try:
            driver = webdriver.Chrome(options=options)
            try:
                driver.get(app_url)
                time.sleep(4)
                
                # Look for buttons that look like Guest/Demo login to bypass auth if possible
                guest_keywords = ["Try as Guest", "Guest", "Zaloguj jako gość", "Demo", "Skip login", "Zacznij jako gość"]
                for keyword in guest_keywords:
                    try:
                        buttons = driver.find_elements(By.XPATH, f"//*[contains(text(), '{keyword}')]")
                        if buttons:
                            buttons[0].click()
                            print(f"Clicked guest button matching keyword '{keyword}', waiting for page transition...")
                            time.sleep(4)
                            break
                    except Exception:
                        continue
                
                screenshot_path = os.path.join(assets_dir, "preview.png")
                driver.save_screenshot(screenshot_path)
                print(f"Successfully saved preview image to {screenshot_path}")
            finally:
                driver.quit()
        except Exception as e:
            print(f"Warning: Error capturing preview image: {e}")
            print("Continuing without updating screenshot...")

    # 3. Synchronize assets (Python native version with Node fallback)
    print("Synchronizing assets...")
    sync_success = False
    try:
        data_file_path = os.path.join("js", "data.js")
        if os.path.exists("assets") and os.path.exists(data_file_path):
            manifest = {}
            for item in os.listdir("assets"):
                full_path = os.path.join("assets", item)
                if os.path.isdir(full_path):
                    files = []
                    for file in os.listdir(full_path):
                        if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp')):
                            files.append(f"assets/{item}/{file}")
                    manifest[f"assets/{item}"] = files

            with open(data_file_path, "r", encoding="utf-8") as f:
                content = f.read()

            manifest_json = json.dumps(manifest, indent=4)
            # Reformat to match JS format: use double quotes and format properly
            regex = r"const assetsManifest = \{[\s\S]*?\};"
            replacement = f"const assetsManifest = {manifest_json};"
            
            if re.search(regex, content):
                content = re.sub(regex, replacement, content)
                with open(data_file_path, "w", encoding="utf-8") as f:
                    f.write(content)
                print("Successfully synchronized assets (Python native).")
                sync_success = True
    except Exception as e:
        print(f"Warning: Python asset sync failed: {e}. Trying Node.js fallback...")

    if not sync_success:
        try:
            # Use shell=True for Windows compatibility
            subprocess.run(["node", "scripts/sync-assets.js"], shell=True, check=True)
            print("Successfully synchronized assets (Node.js fallback).")
        except Exception as e:
            print(f"Error running sync-assets.js fallback: {e}")
            return

    # 4. Register in js/data.js
    data_file_path = os.path.join("js", "data.js")
    if not os.path.exists(data_file_path):
        print(f"Error: Could not find {data_file_path}")
        return

    print("Registering project in js/data.js...")
    with open(data_file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Create the JS object string
    escaped_title = title.replace('"', '\\"')
    escaped_short_desc = short_desc.replace('"', '\\"')
    escaped_long_desc = long_desc.replace('"', '\\"')

    # Look for the ending of the projects list
    target_pattern = r"""];\s*if\s*\(\s*typeof\s+module\s*!==\s*'undefined'\s*\)"""
    match = re.search(target_pattern, content)
    if match:
        start_idx = match.start()
    else:
        # Fallback: simple search for last ];
        target_str = "];"
        start_idx = content.rfind(target_str)
        if start_idx == -1:
            print("Error: Could not find projects list ending in js/data.js")
            return

    left_part = content[:start_idx]
    stripped_left = left_part.rstrip()

    # Determine prefix syntax (comma and spacing) based on whether it ends with a closing brace
    if stripped_left.endswith("}"):
        new_project_js = f""",
    {{
        title: "{escaped_title}",
        description: "{escaped_short_desc}",
        longDescription: "{escaped_long_desc}",
        url: "{app_url}",
        github: "{repo_url}",
        icon: "{args.icon}",
        color: "{args.color}",
        effect: "{args.effect}",
        imageFolder: "assets/{repo_name}"
    }}"""
        new_content = stripped_left + new_project_js + "\n" + content[start_idx:]
    else:
        new_project_js = f"""    {{
        title: "{escaped_title}",
        description: "{escaped_short_desc}",
        longDescription: "{escaped_long_desc}",
        url: "{app_url}",
        github: "{repo_url}",
        icon: "{args.icon}",
        color: "{args.color}",
        effect: "{args.effect}",
        imageFolder: "assets/{repo_name}"
    }}"""
        new_content = left_part + new_project_js + "\n" + content[start_idx:]

    with open(data_file_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Project successfully registered in js/data.js")

    # 5. Update GitHub Stats cache directly
    cache_path = "github-stats-cache.json"
    
    # Get stats from repo_data or use defaults if rate limited / empty
    if repo_data:
        created_at = repo_data.get('created_at')
        pushed_at = repo_data.get('pushed_at') or repo_data.get('updated_at')
        updated_at = repo_data.get('updated_at')
    else:
        now_iso = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
        created_at = now_iso
        pushed_at = now_iso
        updated_at = now_iso
        
    cache_data = {"timestamp": int(time.time() * 1000), "data": {}}
    if os.path.exists(cache_path):
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                cache_data = json.load(f)
        except Exception as e:
            print(f"Warning: Could not read existing cache file: {e}")
            
    if "data" not in cache_data:
        cache_data["data"] = {}
        
    cache_data["data"][repo_url] = {
        "created_at": created_at,
        "pushed_at": pushed_at,
        "updated_at": updated_at
    }
    # Update cache timestamp
    cache_data["timestamp"] = int(time.time() * 1000)
    
    try:
        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump(cache_data, f, indent=2)
        print(f"Updated github-stats-cache.json with stats for {repo_name}.")
    except Exception as e:
        print(f"Error saving updated statistics cache: {e}")

    print("\n🚀 App registration complete! Cache has been updated. Refresh the page to see changes.")

if __name__ == "__main__":
    main()
