/**
 * Card Effects Manager
 * Handles periodic animations for project cards
 */

const Effects = {
    /**
     * Glitch effect (Glitch Studio style)
     */
    glitch: (element) => {
        const trigger = () => {
            element.classList.add('glitch-active');
            setTimeout(() => {
                element.classList.remove('glitch-active');
            }, 300);
            
            // Random interval between 3 and 10 seconds
            setTimeout(trigger, Math.random() * 7000 + 3000);
        };
        
        // Initial delay
        setTimeout(trigger, Math.random() * 3000 + 1000);
    },

    /**
     * Matrix effect (subtle pulse or green glow)
     */
    matrix: (element) => {
        // Just a placeholder for now, can be expanded with canvas or complex CSS
        const trigger = () => {
            element.classList.add('matrix-active');
            setTimeout(() => {
                element.classList.remove('matrix-active');
            }, 1000);
            
            setTimeout(trigger, 5000);
        };
        setTimeout(trigger, 2000);
    },

    /**
     * Floating effect
     */
    float: (element) => {
        element.classList.add('float-active');
    },

    /**
     * Neon pulse effect
     */
    neon: (element) => {
        element.classList.add('neon-active');
    },

    /**
     * Shake effect (triggered periodically)
     */
    shake: (element) => {
        const trigger = () => {
            element.classList.add('shake-active');
            setTimeout(() => {
                element.classList.remove('shake-active');
            }, 500);
            setTimeout(trigger, Math.random() * 5000 + 5000);
        };
        setTimeout(trigger, 3000);
    },

    /**
     * Hue rotate effect
     */
    hueRotate: (element) => {
        element.classList.add('hue-active');
    },

    /**
     * Initialize effects for all cards based on project data
     */
    initAll: (projectData) => {
        projectData.forEach((project, index) => {
            if (project.effect && Effects[project.effect]) {
                const cardId = `project-card-${index}`;
                const element = document.getElementById(cardId);
                if (element) {
                    Effects[project.effect](element);
                }
            }
        });
    }
};
