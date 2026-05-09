/**
 * Main WD HUB Script
 * Handles project rendering and orchestration
 */

function renderProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    grid.innerHTML = projects.map((project, index) => `
        <div class="card-glow group cursor-pointer" 
             id="project-card-${index}"
             onclick="openProject(${index})">
            <div class="glass glass-hover p-8 rounded-3xl transition-all duration-300 h-full flex flex-col relative overflow-hidden">
                <div class="w-12 h-12 bg-${project.color}/10 rounded-2xl flex items-center justify-center text-${project.color} group-hover:scale-110 transition-transform duration-300 mb-6">
                    <i data-lucide="${project.icon}" class="w-6 h-6"></i>
                </div>

                <h2 class="text-2xl font-bold mb-3 group-hover:text-${project.color} transition-colors">${project.title}</h2>
                <p class="text-gray-400 font-light leading-relaxed mb-6">
                    ${project.description}
                </p>
                
                <div class="mt-auto flex justify-between items-center">
                    <div class="flex items-center gap-2">
                        <div class="flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-${project.color}/10 text-${project.color} group-hover:bg-${project.color}/20 transition-all duration-300 border border-${project.color}/20">
                            Details <i data-lucide="maximize-2" class="w-3.5 h-3.5 ml-1.5"></i>
                        </div>
                        <a href="${project.url}" target="_blank" onclick="event.stopPropagation()" class="flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all duration-200 border border-white/5 hover:border-white/10">
                            Launch <i data-lucide="external-link" class="w-3.5 h-3.5 ml-1.5"></i>
                        </a>
                    </div>
                    <a href="${project.github}" target="_blank" onclick="event.stopPropagation()" class="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-200 border border-white/5 hover:border-white/20" title="View Repository">
                        <i data-lucide="github" class="w-5 h-5"></i>
                    </a>
                </div>
            </div>
        </div>
    `).join('');

    // Re-initialize icons after rendering
    if (window.lucide) {
        lucide.createIcons();
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
            <div class="flex items-center gap-6 mb-8">
                <div class="w-16 h-16 bg-${project.color}/10 rounded-2xl flex items-center justify-center text-${project.color}">
                    <i data-lucide="${project.icon}" class="w-8 h-8"></i>
                </div>
                <div>
                    <h2 class="text-3xl md:text-4xl font-bold">${project.title}</h2>
                    <p class="text-${project.color} font-medium">Project Overview</p>
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
    // 1. Render projects
    renderProjects();
    
    // 2. Initialize effects
    if (typeof Effects !== 'undefined') {
        Effects.initAll(projects);
    }

    // 3. Modal close events
    const modal = document.getElementById('project-modal');
    const closeBtn = document.getElementById('close-modal');
    
    if (closeBtn) closeBtn.onclick = closeModal;
    if (modal) {
        modal.querySelector('.modal-overlay').onclick = closeModal;
    }

    // 4. Initialize Footer
    if (typeof WowkDigitalFooter !== 'undefined') {
        WowkDigitalFooter.init({
            siteName: 'WD HUB',
            container: 'body',
            brandName: 'Wowk Digital',
            brandUrl: 'https://github.com/WowkDigital'
        });
    }
});
