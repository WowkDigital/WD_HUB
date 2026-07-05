/**
 * Matrix effect (subtle pulse or green glow)
 */
window.Effects = window.Effects || {};
window.Effects.matrix = (element) => {
    const container = element.querySelector('.glass');
    if (!container) return;

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
    let width = 0, height = 0, columns = 0;
    const fontSize = 10;
    let drops = [];
    const characters = '01';

    const draw = () => {
        const size = window.Effects.checkCanvasSize(canvas, container);
        width = size.width;
        height = size.height;
        if (size.resized) {
            columns = Math.floor(width / (fontSize * 1.5));
            drops = new Array(columns).fill(0).map(() => Math.random() * -100);
        }

        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#4ade80';
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
            const text = characters.charAt(Math.floor(Math.random() * characters.length));
            ctx.fillText(text, i * fontSize * 1.5, drops[i] * fontSize);

            if (drops[i] * fontSize > height && Math.random() > 0.985) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    };

    const interval = setInterval(draw, 80);

    window.Effects.activeCleanups.push(() => {
        clearInterval(interval);
    });
};
