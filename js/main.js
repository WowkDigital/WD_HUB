/**
 * Main WD HUB Script
 * Handles project rendering and orchestration
 */

let currentView = 'featured';
let currentSort = 'default';
let searchQuery = '';
let githubStats = {};
let statsLoaded = false;

function formatDate(dateStr, short = false) {
    if (!dateStr) {
        return statsLoaded ? 'N/A' : 'Loading...';
    }
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'N/A';
        
        if (short) {
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${month}.${year}`;
        }
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        return 'N/A';
    }
}

async function fetchGitHubStats() {
    const cacheKey = 'hub-github-stats';

    // 1. Try to fetch from local backend server first
    try {
        const response = await fetch('/api/github-stats?t=' + Date.now());
        if (response.ok) {
            const data = await response.json();
            console.log('Successfully loaded GitHub stats from server.');
            localStorage.setItem(cacheKey, JSON.stringify({
                timestamp: Date.now(),
                data: data
            }));
            updateProjectDates(data);
            return;
        }
    } catch (e) {
        console.log('Server API not available, falling back to client-side cache/API.', e);
    }

    // 2. Client-side fallback: check localStorage cache
    const cached = localStorage.getItem(cacheKey);
    let cachedData = null;
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            cachedData = parsed.data;
            const age = Date.now() - parsed.timestamp;
            // 24 hours cache
            if (age < 24 * 60 * 60 * 1000 && Object.keys(parsed.data).length > 0) {
                console.log('Using cached GitHub stats from localStorage.');
                updateProjectDates(parsed.data);
                return;
            }
        } catch (e) {
            console.error('Error parsing cached stats:', e);
        }
    }

    // 3. Cache expired or missing: fetch from GitHub API directly
    console.log('Fetching live data from GitHub API...');
    const statsData = {};
    try {
        const promises = projects.map(async (project) => {
            if (!project.github) return;
            const match = project.github.match(/github\.com\/([^\/]+)\/([^\/]+)/);
            if (match) {
                const owner = match[1];
                const repo = match[2].replace(/.git$/, '');
                try {
                    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
                    if (res.ok) {
                        const data = await res.json();
                        statsData[project.github] = {
                            created_at: data.created_at,
                            pushed_at: data.pushed_at || data.updated_at,
                            updated_at: data.updated_at
                        };
                    }
                } catch (err) {
                    console.error(`Failed to fetch stats for ${owner}/${repo}:`, err);
                }
            }
        });

        await Promise.all(promises);
    } catch (e) {
        console.error('Error during batch fetch from GitHub API:', e);
    }

    // Save to localStorage if we got any data
    if (Object.keys(statsData).length > 0) {
        localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            data: statsData
        }));
        updateProjectDates(statsData);
    } else {
        // Mark as loaded with cached data or empty object
        updateProjectDates(cachedData || {});
    }
}

function updateProjectDates(stats) {
    statsLoaded = true;
    githubStats = stats || {};
    projects.forEach(project => {
        const repoStats = githubStats[project.github];
        if (repoStats) {
            project.createdAt = repoStats.created_at;
            project.updatedAt = repoStats.pushed_at || repoStats.updated_at;
        } else {
            project.createdAt = null;
            project.updatedAt = null;
        }
    });
    renderProjects();
}


function renderProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    // Filter projects based on search query
    let filteredProjects = projects.filter(project => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        return project.title.toLowerCase().includes(query) || 
               project.description.toLowerCase().includes(query) ||
               (project.longDescription && project.longDescription.toLowerCase().includes(query));
    });

    // Sort projects
    if (currentSort === 'name') {
        filteredProjects.sort((a, b) => a.title.localeCompare(b.title));
    } else if (currentSort === 'updated') {
        filteredProjects.sort((a, b) => {
            const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
            const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0);
            return dateB - dateA; // Newest first
        });
    } else if (currentSort === 'created') {
        filteredProjects.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
            return dateB - dateA; // Newest first
        });
    } else if (currentView === 'az') {
        // Default sort for A-Z view is Alphabetical
        filteredProjects.sort((a, b) => a.title.localeCompare(b.title));
    }

    // Set classes on the grid container based on view mode and count
    if (filteredProjects.length === 0) {
        grid.className = "w-full text-center py-20 text-gray-500 col-span-full";
        grid.innerHTML = `
            <div class="flex flex-col items-center justify-center space-y-4">
                <i data-lucide="search" class="w-12 h-12 text-gray-600 animate-bounce"></i>
                <p class="text-lg font-light text-gray-400">No applications match your search.</p>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
    }

    if (currentView === 'az') {
        grid.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full max-w-7xl mb-20 px-4";
    } else {
        grid.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mb-20 px-4";
    }

    // Clean up active effects before rendering new elements
    if (typeof Effects !== 'undefined') {
        Effects.cleanup();
    }

    grid.innerHTML = filteredProjects.map((project) => {
        const originalIndex = projects.indexOf(project);
        
        if (currentView === 'az') {
            return `
                <div class="card-glow group cursor-pointer" 
                     id="project-card-${originalIndex}"
                     onclick="openProject(${originalIndex})">
                    <div class="glass glass-hover p-4 rounded-2xl transition-all duration-300 flex items-center justify-between gap-4 h-full relative overflow-hidden border border-white/5 hover:border-white/10">
                        <div class="flex items-center gap-3.5 min-w-0">
                            <div class="w-10 h-10 bg-${project.color}/10 rounded-xl flex items-center justify-center text-${project.color} group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                                <i data-lucide="${project.icon}" class="w-5 h-5"></i>
                            </div>
                            <div class="min-w-0">
                                <h3 class="text-base font-semibold text-gray-100 group-hover:text-${project.color} transition-colors truncate">${project.title}</h3>
                                <p class="text-xs text-gray-400 font-light truncate mb-1">${project.description}</p>
                                <div class="flex items-center gap-1.5 text-[10px] text-gray-500 font-light">
                                    <span>Created: ${formatDate(project.createdAt, true)}</span>
                                    <span class="w-1 h-1 bg-gray-700 rounded-full"></span>
                                    <span>Updated: ${formatDate(project.updatedAt, true)}</span>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-1.5 flex-shrink-0">
                            <a href="${project.url}" target="_blank" onclick="event.stopPropagation()" class="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all duration-200 border border-white/5 hover:border-white/10" title="Launch App">
                                <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                            </a>
                            <a href="${project.github}" target="_blank" onclick="event.stopPropagation()" class="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all duration-200 border border-white/5 hover:border-white/10" title="GitHub Repository">
                                <i data-lucide="github" class="w-3.5 h-3.5"></i>
                            </a>
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="card-glow group cursor-pointer" 
                     id="project-card-${originalIndex}"
                     onclick="openProject(${originalIndex})">
                    <div class="glass glass-hover p-8 rounded-3xl transition-all duration-300 h-full flex flex-col relative overflow-hidden">
                        <div class="w-12 h-12 bg-${project.color}/10 rounded-2xl flex items-center justify-center text-${project.color} group-hover:scale-110 transition-transform duration-300 mb-6">
                            <i data-lucide="${project.icon}" class="w-6 h-6"></i>
                        </div>

                        <h2 class="text-2xl font-bold mb-3 group-hover:text-${project.color} transition-colors">${project.title}</h2>
                        <p class="text-gray-400 font-light leading-relaxed mb-4">
                            ${project.description}
                        </p>

                        <!-- Project Dates -->
                        <div class="flex items-center gap-4 text-xs text-gray-500 font-light mb-6 border-t border-white/5 pt-4">
                            <div class="flex items-center gap-1.5" title="Date Created">
                                <i data-lucide="calendar" class="w-3.5 h-3.5 text-primary/70"></i>
                                <span>Created: ${formatDate(project.createdAt)}</span>
                            </div>
                            <div class="flex items-center gap-1.5" title="Last Updated (GitHub Commit)">
                                <i data-lucide="git-commit" class="w-3.5 h-3.5 text-accent/70"></i>
                                <span>Updated: ${formatDate(project.updatedAt)}</span>
                            </div>
                        </div>
                        
                        <div class="mt-auto flex justify-between items-center">
                            <div class="flex items-center gap-2">
                                <a href="${project.url}" target="_blank" onclick="event.stopPropagation()" class="flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-${project.color}/10 text-${project.color} group-hover:bg-${project.color}/20 hover:bg-${project.color} hover:text-white transition-all duration-300 border border-${project.color}/20">
                                    Launch <i data-lucide="external-link" class="w-3.5 h-3.5 ml-1.5"></i>
                                </a>
                                <div class="flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all duration-200 border border-white/5 hover:border-white/10">
                                    Details <i data-lucide="maximize-2" class="w-3.5 h-3.5 ml-1.5"></i>
                                </div>
                            </div>
                            <a href="${project.github}" target="_blank" onclick="event.stopPropagation()" class="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-200 border border-white/5 hover:border-white/20" title="View Repository">
                                <i data-lucide="github" class="w-5 h-5"></i>
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }
    }).join('');

    // Re-initialize icons after rendering
    if (window.lucide) {
        lucide.createIcons();
    }

    // Re-initialize effects if in featured view
    if (currentView === 'featured' && typeof Effects !== 'undefined') {
        Effects.initAll(filteredProjects);
    }
}

function openProject(index) {
    const project = projects[index];
    const modal = document.getElementById('project-modal');
    const content = document.getElementById('modal-content');
    
    if (!modal || !content) return;

    let projectImages = project.imageFolder ? (assetsManifest[project.imageFolder] || []) : (project.images || []);
    
    // Ensure projectImages is always an array
    if (!Array.isArray(projectImages)) {
        projectImages = typeof projectImages === 'string' ? [projectImages] : [];
    }

    const imagesHtml = projectImages.length > 0 ? `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            ${projectImages.map(img => `
                <div class="rounded-2xl overflow-hidden border border-white/5">
                    <img src="${img}" alt="${project.title}" class="w-full h-48 object-cover hover:scale-105 transition-transform duration-500">
                </div>
            `).join('')}
        </div>
    ` : '';

    content.innerHTML = `
        <div class="p-8 md:p-12">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div class="flex items-center gap-6">
                    <div class="w-16 h-16 bg-${project.color}/10 rounded-2xl flex items-center justify-center text-${project.color}">
                        <i data-lucide="${project.icon}" class="w-8 h-8"></i>
                    </div>
                    <div>
                        <h2 class="text-3xl md:text-4xl font-bold">${project.title}</h2>
                        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 font-light mt-1">
                            <span class="text-${project.color} font-medium">Project Overview</span>
                            <span class="text-gray-600">|</span>
                            <span class="flex items-center gap-1"><i data-lucide="calendar" class="w-3.5 h-3.5"></i> Created: ${formatDate(project.createdAt)}</span>
                            <span class="text-gray-600">|</span>
                            <span class="flex items-center gap-1"><i data-lucide="git-commit" class="w-3.5 h-3.5"></i> Updated: ${formatDate(project.updatedAt)}</span>
                        </div>
                    </div>
                </div>
            </div>

            ${imagesHtml}

            <div class="prose prose-invert max-w-none">
                <p class="text-gray-300 text-lg leading-relaxed mb-8">
                    ${project.longDescription || project.description}
                </p>
            </div>

            <div class="flex flex-wrap gap-4 pt-8 border-t border-white/5">
                <a href="${project.url}" target="_blank" class="flex items-center px-8 py-4 rounded-2xl text-lg font-bold bg-${project.color} text-white hover:scale-105 transition-all duration-300 shadow-lg shadow-${project.color}/20">
                    Launch Project <i data-lucide="external-link" class="w-5 h-5 ml-2"></i>
                </a>
                <a href="${project.github}" target="_blank" class="flex items-center px-8 py-4 rounded-2xl text-lg font-bold bg-white/5 text-white hover:bg-white/10 transition-all duration-300 border border-white/10">
                    View on GitHub <i data-lucide="github" class="w-5 h-5 ml-2"></i>
                </a>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    if (window.lucide) {
        lucide.createIcons();
    }
}

function closeModal() {
    const modal = document.getElementById('project-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Toolbar & Search Initialization
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');
    const btnFeatured = document.getElementById('view-featured');
    const btnAZ = document.getElementById('view-az');
    const sortSelect = document.getElementById('sort-select');

    const setViewMode = (mode) => {
        currentView = mode;
        localStorage.setItem('hub-view-mode', mode);

        if (btnFeatured && btnAZ) {
            if (mode === 'featured') {
                btnFeatured.className = "flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 bg-primary text-white shadow-lg shadow-primary/25 border border-primary/20 flex-1 sm:flex-none";
                btnAZ.className = "flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 text-gray-400 hover:text-white border border-transparent flex-1 sm:flex-none";
            } else {
                btnFeatured.className = "flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 text-gray-400 hover:text-white border border-transparent flex-1 sm:flex-none";
                btnAZ.className = "flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 bg-primary text-white shadow-lg shadow-primary/25 border border-primary/20 flex-1 sm:flex-none";
            }
        }

        renderProjects();
    };

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            if (searchClear) {
                if (searchQuery.length > 0) {
                    searchClear.classList.remove('hidden');
                } else {
                    searchClear.classList.add('hidden');
                }
            }
            renderProjects();
        });
    }

    if (searchClear) {
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            searchQuery = '';
            searchClear.classList.add('hidden');
            renderProjects();
            searchInput.focus();
        });
    }

    if (btnFeatured) {
        btnFeatured.addEventListener('click', () => setViewMode('featured'));
    }
    if (btnAZ) {
        btnAZ.addEventListener('click', () => setViewMode('az'));
    }

    if (sortSelect) {
        currentSort = localStorage.getItem('hub-sort-mode') || 'default';
        sortSelect.value = currentSort;
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            localStorage.setItem('hub-sort-mode', currentSort);
            renderProjects();
        });
    }

    // Load view mode from localStorage or default to featured
    const savedView = localStorage.getItem('hub-view-mode') || 'featured';
    setViewMode(savedView);

    // Fetch GitHub statistics
    fetchGitHubStats();

    // Modal close events
    const modal = document.getElementById('project-modal');
    const closeBtn = document.getElementById('close-modal');
    
    if (closeBtn) closeBtn.onclick = closeModal;
    if (modal) {
        modal.querySelector('.modal-overlay').onclick = closeModal;
    }

    // Initialize Footer
    if (typeof WowkDigitalFooter !== 'undefined') {
        WowkDigitalFooter.init({
            siteName: 'WD HUB',
            container: 'body',
            brandName: 'Wowk Digital',
            brandUrl: 'https://github.com/WowkDigital'
        });
    }
});

