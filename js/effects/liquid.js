/**
 * Liquid effect (organic blobs floating like a lava lamp, using blur blending)
 */
window.Effects = window.Effects || {};
window.Effects.liquid = (element) => {
    const container = element.querySelector('.glass');
    if (!container) return;
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '0';
    canvas.style.opacity = '0.35';
    canvas.style.pointerEvents = 'none';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = 0, height = 0;
    let blobs = [];

    const draw = () => {
        const size = window.Effects.checkCanvasSize(canvas, container);
        width = size.width;
        height = size.height;

        if (size.resized || blobs.length === 0) {
            blobs = [
                { x: Math.random() * width, y: Math.random() * height, vx: 0.35, vy: 0.25, r: Math.min(width, height) * 0.22, color: 'rgba(99, 102, 241, 0.45)' },
                { x: Math.random() * width, y: Math.random() * height, vx: -0.25, vy: 0.45, r: Math.min(width, height) * 0.25, color: 'rgba(168, 85, 247, 0.45)' },
                { x: Math.random() * width, y: Math.random() * height, vx: 0.45, vy: -0.35, r: Math.min(width, height) * 0.20, color: 'rgba(236, 72, 153, 0.45)' },
                { x: Math.random() * width, y: Math.random() * height, vx: -0.35, vy: -0.25, r: Math.min(width, height) * 0.24, color: 'rgba(59, 130, 246, 0.45)' }
            ];
        }

        ctx.clearRect(0, 0, width, height);

        ctx.filter = 'blur(24px)';
        blobs.forEach(b => {
            b.x += b.vx;
            b.y += b.vy;

            if (b.x - b.r < 0 || b.x + b.r > width) b.vx *= -1;
            if (b.y - b.r < 0 || b.y + b.r > height) b.vy *= -1;

            b.x = Math.max(b.r, Math.min(width - b.r, b.x));
            b.y = Math.max(b.r, Math.min(height - b.r, b.y));

            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.filter = 'none';
    };

    const interval = setInterval(draw, 35);

    window.Effects.activeCleanups.push(() => {
        clearInterval(interval);
    });
};
