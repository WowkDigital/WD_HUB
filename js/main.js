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
             onclick="window.open('${project.url}', '_blank')">
            <div class="glass glass-hover p-8 rounded-3xl transition-all duration-300 h-full flex flex-col relative overflow-hidden">
                <div class="w-12 h-12 bg-${project.color}/10 rounded-2xl flex items-center justify-center text-${project.color} group-hover:scale-110 transition-transform duration-300 mb-6">
                    <i data-lucide="${project.icon}" class="w-6 h-6"></i>
                </div>

                <h2 class="text-2xl font-bold mb-3 group-hover:text-${project.color} transition-colors">${project.title}</h2>
                <p class="text-gray-400 font-light leading-relaxed mb-6">
                    ${project.description}
                </p>
                
                <div class="mt-auto flex justify-between items-center">
                    <div class="flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-${project.color}/10 text-${project.color} group-hover:bg-${project.color} group-hover:text-white group-hover:scale-105 transition-all duration-300 border border-${project.color}/20 group-hover:border-transparent">
                        Launch Project <i data-lucide="arrow-up-right" class="w-4 h-4 ml-2"></i>
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

document.addEventListener('DOMContentLoaded', () => {
    // 1. Render projects
    renderProjects();
    
    // 2. Initialize effects
    if (typeof Effects !== 'undefined') {
        Effects.initAll(projects);
    }

    // 3. Initialize Footer
    if (typeof WowkDigitalFooter !== 'undefined') {
        WowkDigitalFooter.init({
            siteName: 'WD HUB',
            container: 'body',
            brandName: 'Wowk Digital',
            brandUrl: 'https://github.com/WowkDigital'
        });
    }
});
