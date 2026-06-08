import argparse
import os
import json
import time
import subprocess
import urllib.request
import urllib.error
import re
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

def get_repo_details(owner, repo):
    url = f"https://api.github.com/repos/{owner}/{repo}"
    req = urllib.request.Request(url, headers={'User-Agent': 'WD-HUB-Automation'})
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
    print("Launching headless browser to capture preview image...")
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--window-size=1536,1000')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')

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
        
        assets_dir = os.path.join("assets", repo_name)
        os.makedirs(assets_dir, exist_ok=True)
        screenshot_path = os.path.join(assets_dir, "preview.png")
        driver.save_screenshot(screenshot_path)
        print(f"Successfully saved preview image to {screenshot_path}")
    except Exception as e:
        print(f"Warning: Error capturing preview image: {e}")
        print("Creating directory structure without screenshot...")
        assets_dir = os.path.join("assets", repo_name)
        os.makedirs(assets_dir, exist_ok=True)
    finally:
        driver.quit()

    # 3. Synchronize assets (run scripts/sync-assets.js)
    print("Synchronizing assets (running sync-assets.js)...")
    try:
        # Use shell=True for Windows compatibility
        subprocess.run(["node", "scripts/sync-assets.js"], shell=True, check=True)
    except Exception as e:
        print(f"Error running sync-assets.js: {e}")
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

    new_project_js = f"""    }},
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

    # Look for the ending of the projects list
    target_pattern = r"""];\s*if\s*\(\s*typeof\s+module\s*!==\s*'undefined'\s*\)"""
    match = re.search(target_pattern, content)
    if not match:
        # Fallback: simple search for last ];
        target_str = "];"
        last_idx = content.rfind(target_str)
        if last_idx != -1:
            new_content = content[:last_idx] + new_project_js + "\n" + content[last_idx:]
        else:
            print("Error: Could not find projects list ending in js/data.js")
            return
    else:
        start_idx = match.start()
        new_content = content[:start_idx] + new_project_js + "\n" + content[start_idx:]

    with open(data_file_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Project successfully registered in js/data.js")

    # 5. Clear GitHub Stats cache
    cache_path = "github-stats-cache.json"
    if os.path.exists(cache_path):
        try:
            os.remove(cache_path)
            print("Deleted github-stats-cache.json (will be rebuilt on server load)")
        except Exception as e:
            print(f"Error removing statistics cache: {e}")
    else:
        print("No cache file to delete, skipping.")

    print("\n🚀 App registration complete! If the server is running, refresh the page to fetch fresh stats.")

if __name__ == "__main__":
    main()
