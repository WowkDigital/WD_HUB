/**
 * Gravity effect (satellites orbiting on tilted planes around space-time gravity well sheet under icon)
 */
window.Effects = window.Effects || {};
window.Effects.gravity = (element) => {
    const container = element.querySelector('.glass');
    if (!container) return;
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '0';
    canvas.style.opacity = '0.45';
    canvas.style.pointerEvents = 'none';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = 0, height = 0;
    let bodies = [];

    const draw = () => {
        const size = window.Effects.checkCanvasSize(canvas, container);
        width = size.width;
        height = size.height;

        if (size.resized || bodies.length === 0) {
            bodies = [
                { angle: 0, speed: 0.035, rx: 25, ry: 9, tilt: -0.15, color: '#a855f7', size: 2.8, trail: [] },
                { angle: Math.PI * 0.6, speed: 0.022, rx: 35, ry: 13, tilt: 0.35, color: '#ec4899', size: 2.2, trail: [] },
                { angle: Math.PI * 1.3, speed: 0.016, rx: 45, ry: 17, tilt: -0.4, color: '#6366f1', size: 1.8, trail: [] }
            ];
        }

        ctx.clearRect(0, 0, width, height);

        let cx = 56, cy = 56;
        const icon = element.querySelector('[data-lucide="orbit"], .rounded-2xl, .rounded-xl');
        if (icon) {
            const iconRect = icon.getBoundingClientRect();
            const cardRect = element.getBoundingClientRect();
            cx = (iconRect.left + iconRect.right) / 2 - cardRect.left;
            cy = (iconRect.top + iconRect.bottom) / 2 - cardRect.top;
        }

        ctx.strokeStyle = 'rgba(168, 85, 247, 0.025)';
        ctx.lineWidth = 1;
        for (let r = 18; r < 80; r += 14) {
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
        }

        bodies.forEach(b => {
            b.angle += b.speed;
            const x0 = Math.cos(b.angle) * b.rx;
            const y0 = Math.sin(b.angle) * b.ry;

            const cosT = Math.cos(b.tilt);
            const sinT = Math.sin(b.tilt);
            const px = cx + (x0 * cosT - y0 * sinT);
            const py = cy + (x0 * sinT + y0 * cosT);

            b.trail.push({ x: px, y: py });
            if (b.trail.length > 15) b.trail.shift();

            ctx.strokeStyle = `rgba(255, 255, 255, 0.018)`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let a = 0; a < Math.PI * 2; a += 0.15) {
                const lx0 = Math.cos(a) * b.rx;
                const ly0 = Math.sin(a) * b.ry;
                const lpx = cx + (lx0 * cosT - ly0 * sinT);
                const lpy = cy + (lx0 * sinT + ly0 * cosT);
                if (a === 0) ctx.moveTo(lpx, lpy);
                else ctx.lineTo(lpx, lpy);
            }
            ctx.closePath();
            ctx.stroke();

            if (b.trail.length > 1) {
                ctx.beginPath();
                ctx.moveTo(b.trail[0].x, b.trail[0].y);
                for (let i = 1; i < b.trail.length; i++) {
                    ctx.lineTo(b.trail[i].x, b.trail[i].y);
                }
                ctx.strokeStyle = b.color;
                ctx.globalAlpha = 0.22;
                ctx.lineWidth = b.size;
                ctx.stroke();
                ctx.globalAlpha = 1.0;
            }

            ctx.fillStyle = b.color;
            ctx.shadowBlur = 5;
            ctx.shadowColor = b.color;
            ctx.beginPath();
            ctx.arc(px, py, b.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });
    };

    const interval = setInterval(draw, 30);

    window.Effects.activeCleanups.push(() => {
        clearInterval(interval);
    });
};
