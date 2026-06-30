// npm run update-stats

const fs = require('fs');
const path = require('path');

const CACHE_FILE = path.join(__dirname, '..', 'github-stats-cache.json');
const DATA_FILE = path.join(__dirname, '..', 'js', 'data.js');

async function fetchRepoStats(owner, repo, token) {
    const url = `https://api.github.com/repos/${owner}/${repo}`;
    const headers = {
        'User-Agent': 'WowkDigital-WD-HUB-Updater'
    };
    if (token) {
        headers['Authorization'] = `token ${token}`;
    }

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            console.error(`[ERROR] Failed to fetch stats for ${owner}/${repo}: ${response.status} ${response.statusText}`);
            if (response.status === 403 || response.status === 429) {
                return { rateLimited: true, status: response.status };
            }
            return null;
        }
        const data = await response.json();
        return {
            created_at: data.created_at,
            pushed_at: data.pushed_at || data.updated_at,
            updated_at: data.updated_at
        };
    } catch (e) {
        console.error(`[ERROR] Error fetching stats for ${owner}/${repo}:`, e.message);
        return null;
    }
}

async function run() {
    console.log('Loading projects from data.js...');
    if (!fs.existsSync(DATA_FILE)) {
        console.error(`[ERROR] Data file not found at: ${DATA_FILE}`);
        process.exit(1);
    }

    const { projects } = require(DATA_FILE);
    if (!projects || !Array.isArray(projects)) {
        console.error('[ERROR] Invalid projects structure in data.js');
        process.exit(1);
    }

    // Load existing cache if exists to keep on failure
    let existingCache = { data: {} };
    if (fs.existsSync(CACHE_FILE)) {
        try {
            existingCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
        } catch (e) {
            // Ignore parse errors
        }
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        console.log('[WARN] No GITHUB_TOKEN environment variable found. Rate limits may apply.');
    } else {
        console.log('[INFO] Using GitHub Token for authenticated API calls.');
    }

    const newData = {};
    let rateLimited = false;
    console.log(`Starting update for ${projects.length} projects...`);

    for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        if (!project.github) {
            console.log(`[INFO] [${i + 1}/${projects.length}] Skipping "${project.title}" (no GitHub URL)`);
            continue;
        }

        if (rateLimited) {
            if (existingCache.data[project.github]) {
                newData[project.github] = existingCache.data[project.github];
            }
            continue;
        }

        const match = project.github.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (match) {
            const owner = match[1];
            const repo = match[2].replace(/.git$/, '');
            console.log(`[FETCH] [${i + 1}/${projects.length}] Fetching stats for ${owner}/${repo}...`);

            const stats = await fetchRepoStats(owner, repo, token);
            if (stats && stats.rateLimited) {
                console.log(`   [RATE LIMIT] GitHub API Rate limit hit. Suspending further API requests.`);
                rateLimited = true;
                if (existingCache.data[project.github]) {
                    newData[project.github] = existingCache.data[project.github];
                }
                continue;
            }

            if (stats) {
                newData[project.github] = stats;
                console.log(`   [SUCCESS] Created: ${stats.created_at.split('T')[0]} | Updated: ${stats.pushed_at.split('T')[0]}`);
            } else if (existingCache.data[project.github]) {
                newData[project.github] = existingCache.data[project.github];
                console.log(`   [WARN] Kept existing cached stats.`);
            } else {
                console.log(`   [FAIL] Failed to get stats.`);
            }

            // Sleep 500ms to avoid hitting rate limit
            await new Promise(resolve => setTimeout(resolve, 500));
        } else {
            console.log(`[WARN] [${i + 1}/${projects.length}] Invalid GitHub URL format: ${project.github}`);
        }
    }

    const finalCache = {
        timestamp: Date.now(),
        data: newData
    };

    fs.writeFileSync(CACHE_FILE, JSON.stringify(finalCache, null, 2), 'utf8');
    console.log(`\nStats update completed! Saved to ${CACHE_FILE}`);
}

run();
