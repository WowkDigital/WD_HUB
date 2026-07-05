/**
 * Card Effects Manager
 * Handles base configuration, cleanup, and lazy-loading of Canvas visual effects
 */

const Effects = window.Effects = {
    activeCleanups: [],
    loadedEffects: {}, // Maps effectName -> Promise (to prevent duplicate loading)

    /**
     * Clear all running intervals and event listeners
     */
    cleanup: () => {
        Effects.activeCleanups.forEach(cb => cb());
        Effects.activeCleanups = [];
    },

    /**
     * Helper to keep canvas resolution synchronized with client bounding rect
     */
    checkCanvasSize: (canvas, container) => {
        const rect = container.getBoundingClientRect();
        const w = Math.round(rect.width);
        const h = Math.round(rect.height);
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
            return { width: w, height: h, resized: true };
        }
        return { width: canvas.width, height: canvas.height, resized: false };
    },

    /**
     * Dynamically inject an effect's script on-demand
     */
    loadEffectScript: (effectName) => {
        if (Effects.loadedEffects[effectName]) {
            return Effects.loadedEffects[effectName];
        }

        Effects.loadedEffects[effectName] = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `js/effects/${effectName}.js`;
            script.onload = () => resolve();
            script.onerror = () => {
                console.error(`Failed to load effect script: ${effectName}`);
                reject(new Error(`Failed to load script for effect: ${effectName}`));
            };
            document.head.appendChild(script);
        });

        return Effects.loadedEffects[effectName];
    },

    /**
     * Glitch effect (Glitch Studio style)
     */
    glitch: (element) => {
        let timeoutId;
        const trigger = () => {
            element.classList.add('glitch-active');
            timeoutId = setTimeout(() => {
                element.classList.remove('glitch-active');
            }, 300);

            // Random interval between 2 and 4 seconds
            timeoutId = setTimeout(trigger, Math.random() * 2000 + 2000);
        };

        // Initial delay
        timeoutId = setTimeout(trigger, Math.random() * 3000 + 1000);

        Effects.activeCleanups.push(() => {
            clearTimeout(timeoutId);
        });
    },

    /**
     * Shake effect (triggered periodically)
     */
    shake: (element) => {
        let timeoutId;
        const trigger = () => {
            element.classList.add('shake-active');
            timeoutId = setTimeout(() => {
                element.classList.remove('shake-active');
            }, 500);
            timeoutId = setTimeout(trigger, Math.random() * 5000 + 5000);
        };
        timeoutId = setTimeout(trigger, 3000);

        Effects.activeCleanups.push(() => {
            clearTimeout(timeoutId);
        });
    },

    /**
     * Neon pulse effect (compatibility placeholder)
     */
    neon: (element) => {
        element.classList.add('neon-active');
    },

    /**
     * Hue rotate effect (compatibility placeholder)
     */
    hueRotate: (element) => {
        element.classList.add('hue-active');
    },

    /**
     * Initialize effects for all cards based on project data.
     * Dynamic themed effects are loaded asynchronously on-demand.
     */
    initAll: (projectData) => {
        projectData.forEach(async (project) => {
            const idx = typeof projects !== 'undefined' ? projects.indexOf(project) : -1;
            if (idx === -1 || !project.effect) return;

            const cardId = `project-card-${idx}`;
            const element = document.getElementById(cardId);
            if (!element) return;

            // Check if the effect is a built-in static or CSS animation
            if (Effects[project.effect]) {
                Effects[project.effect](element);
            } else {
                // Otherwise, load and initialize the dynamic Canvas script on-demand
                try {
                    await Effects.loadEffectScript(project.effect);
                    // Re-verify element and loaded effect callback exist after load completes
                    if (document.getElementById(cardId) && Effects[project.effect]) {
                        Effects[project.effect](element);
                    }
                } catch (err) {
                    console.error(`Could not initialize themed effect: ${project.effect}`, err);
                }
            }
        });
    }
};
