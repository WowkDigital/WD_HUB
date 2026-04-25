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
        const container = element.querySelector('.glass');
        if (!container) return;

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '0';
        canvas.style.opacity = '0.15';
        canvas.style.pointerEvents = 'none';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let width, height, columns;
        const fontSize = 10; // Smaller font
        let drops = [];

        const resize = () => {
            // Get actual pixel dimensions for the canvas to prevent stretching
            const rect = container.getBoundingClientRect();
            width = canvas.width = rect.width;
            height = canvas.height = rect.height;
            
            // Fewer columns by adding more space between them
            columns = Math.floor(width / (fontSize * 1.5)); 
            drops = new Array(columns).fill(0).map(() => Math.random() * -100); // Random start positions
        };

        window.addEventListener('resize', resize);
        resize();

        const characters = '01';

        function draw() {
            // Fading trail
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = '#4ade80';
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = characters.charAt(Math.floor(Math.random() * characters.length));
                // i * fontSize * 1.5 to match the column spacing in resize()
                ctx.fillText(text, i * fontSize * 1.5, drops[i] * fontSize);

                if (drops[i] * fontSize > height && Math.random() > 0.985) { // Lower probability to restart
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }

        const interval = setInterval(draw, 80); // Slower animation (was 50ms)
    },

    /**
     * Floating effect removed
     */
    float: (element) => {
        // Disabled
    },

    /**
     * Neon pulse effect
     */
    neon: (element) => {
        // Neon highlight removed as per user request
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
