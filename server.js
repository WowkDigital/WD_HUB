const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const CACHE_FILE = path.join(__dirname, 'github-stats-cache.json');

// Global cache object
let githubCache = {
    timestamp: 0,
    data: {}
};

// Cooldown timestamp to prevent hammering GitHub API after rate limit hits
let rateLimitCooldownUntil = 0;

// Load cache from file if it exists
if (fs.existsSync(CACHE_FILE)) {
    try {
        const fileContent = fs.readFileSync(CACHE_FILE, 'utf8');
        githubCache = JSON.parse(fileContent);
        console.log('Loaded GitHub stats cache from file.');
    } catch (e) {
        console.error('Error loading GitHub stats cache file:', e);
    }
}

// Function to fetch GitHub stats for a single repo
async function fetchRepoStats(owner, repo) {
    const url = `https://api.github.com/repos/${owner}/${repo}`;
    try {
        const headers = {
            'User-Agent': 'WowkDigital-WD-HUB-Server'
        };
        if (process.env.GITHUB_TOKEN) {
            headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
        }
        
        const response = await fetch(url, { headers });
        if (!response.ok) {
            console.error(`Failed to fetch stats for ${owner}/${repo}: ${response.status} ${response.statusText}`);
            if (response.status === 403 || response.status === 429) {
                return { rateLimited: true, status: response.status };
            }
            return null;
        }
        const data = await response.json();
        return {
            created_at: data.created_at,
            pushed_at: data.pushed_at,
            updated_at: data.updated_at
        };
    } catch (e) {
        console.error(`Error fetching stats for ${owner}/${repo}:`, e);
        return null;
    }
}

// Function to fetch stats for all projects and update cache
async function refreshCache() {
    console.log('Refreshing GitHub statistics cache...');
    try {
        // Clear require cache to get fresh copy if it changed
        delete require.cache[require.resolve('./js/data.js')];
        const { projects } = require('./js/data.js');
        
        const newData = {};
        let rateLimited = false;
        
        for (const project of projects) {
            if (!project.github) continue;
            
            // If we hit rate limit earlier in this batch, keep existing cache data for remaining projects
            if (rateLimited) {
                if (githubCache.data[project.github]) {
                    newData[project.github] = githubCache.data[project.github];
                }
                continue;
            }
            
            const match = project.github.match(/github\.com\/([^\/]+)\/([^\/]+)/);
            if (match) {
                const owner = match[1];
                const repo = match[2].replace(/.git$/, '');
                console.log(`Fetching stats for ${owner}/${repo}...`);
                const stats = await fetchRepoStats(owner, repo);
                
                if (stats && stats.rateLimited) {
                    console.warn(`GitHub API Rate limit hit. Suspending batch fetch.`);
                    rateLimited = true;
                    // Cooldown for 15 minutes
                    rateLimitCooldownUntil = Date.now() + 15 * 60 * 1000;
                    
                    // Copy existing data for this project and the rest
                    if (githubCache.data[project.github]) {
                        newData[project.github] = githubCache.data[project.github];
                    }
                    continue;
                }
                
                if (stats) {
                    newData[project.github] = stats;
                } else if (githubCache.data[project.github]) {
                    // Keep old data on failure
                    newData[project.github] = githubCache.data[project.github];
                }
                // Small delay to respect rate limiting during batch fetch
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        // Only update cache timestamp if we didn't get rate limited on the very first request
        githubCache = {
            timestamp: rateLimited && Object.keys(newData).length === 0 ? githubCache.timestamp : Date.now(),
            data: { ...githubCache.data, ...newData }
        };

        // Write cache to file
        fs.writeFileSync(CACHE_FILE, JSON.stringify(githubCache, null, 2), 'utf8');
        console.log('GitHub statistics cache refreshed successfully.');
    } catch (e) {
        console.error('Error refreshing GitHub statistics cache:', e);
    }
}

// Scheduled check: once a day (24 hours)
setInterval(() => {
    if (Date.now() > rateLimitCooldownUntil) {
        refreshCache();
    }
}, 24 * 60 * 60 * 1000);

// Helper for MIME types
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp'
};

const server = http.createServer(async (req, res) => {
    // API endpoint for GitHub stats
    if (req.url.startsWith('/api/github-stats') && req.method === 'GET') {
        res.writeHead(200, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        
        const cacheFileExists = fs.existsSync(CACHE_FILE);
        
        // Check if there are any new projects not in cache
        delete require.cache[require.resolve('./js/data.js')];
        const { projects } = require('./js/data.js');
        const hasNewProjects = projects.some(project => project.github && !githubCache.data[project.github]);
        
        // If cache is empty, older than 24 hours, cache file is missing on disk, or has new projects, trigger refresh
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const canRefresh = Date.now() > rateLimitCooldownUntil;
        
        if (canRefresh && (githubCache.timestamp < oneDayAgo || Object.keys(githubCache.data).length === 0 || !cacheFileExists || hasNewProjects)) {
            if (Object.keys(githubCache.data).length === 0 || !cacheFileExists || hasNewProjects) {
                // If cache is completely empty, file is missing, or we have new projects, wait for fetch
                await refreshCache();
            } else {
                // Otherwise refresh in background and serve stale cache immediately
                refreshCache();
            }
        }
        
        res.end(JSON.stringify(githubCache.data));
        return;
    }

    // Serve static files
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    // Strip query parameters or hashes
    filePath = filePath.split('?')[0].split('#')[0];

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code} ..\n`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    
    // Initial fetch if cache is empty
    if (Object.keys(githubCache.data).length === 0) {
        refreshCache();
    }
});
