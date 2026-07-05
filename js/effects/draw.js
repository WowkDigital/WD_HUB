/**
 * Draw effect (colorful brush strokes leaving behind falling paint droplets at sharp curves)
 */
window.Effects = window.Effects || {};
window.Effects.draw = (element) => {
    const container = element.querySelector('.glass');
    if (!container) return;
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '0';
    canvas.style.opacity = '0.22';
    canvas.style.pointerEvents = 'none';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = 0, height = 0;
    let points = [];
    let droplets = [];
    let drawingTimer = 0;
    let drawColor = 'rgba(99, 102, 241, 0.4)';
    let isDrawing = false;

    const colors = [
        'rgba(99, 102, 241, 0.45)',
        'rgba(168, 85, 247, 0.45)',
        'rgba(236, 72, 153, 0.45)',
        'rgba(59, 130, 246, 0.45)'
    ];

    const draw = () => {
        const size = window.Effects.checkCanvasSize(canvas, container);
        width = size.width;
        height = size.height;

        ctx.clearRect(0, 0, width, height);

        drawingTimer++;

        if (!isDrawing && drawingTimer > 160) {
            isDrawing = true;
            points = [];
            drawColor = colors[Math.floor(Math.random() * colors.length)];
            points.push({
                x: Math.random() * width * 0.6 + width * 0.2,
                y: Math.random() * height * 0.6 + height * 0.2,
                alpha: 1.0
            });
        }

        if (isDrawing) {
            if (points.length < 30 && Math.random() < 0.65) {
                const last = points[points.length - 1];
                const angle = Math.random() * Math.PI * 2;
                const len = Math.random() * 14 + 6;
                points.push({
                    x: Math.max(10, Math.min(width - 10, last.x + Math.cos(angle) * len)),
                    y: Math.max(10, Math.min(height - 10, last.y + Math.sin(angle) * len)),
                    alpha: 1.0
                });

                if (Math.random() < 0.25) {
                    droplets.push({
                        x: last.x,
                        y: last.y,
                        vy: Math.random() * 0.6 + 0.35,
                        size: Math.random() * 2 + 1,
                        alpha: 0.85,
                        color: drawColor
                    });
                }
            } else if (points.length >= 30) {
                isDrawing = false;
                drawingTimer = 0;
            }
        }

        droplets.forEach((d, idx) => {
            d.y += d.vy;
            d.alpha -= 0.012;
            if (d.alpha <= 0 || d.y > height) {
                droplets.splice(idx, 1);
                return;
            }
            ctx.fillStyle = d.color;
            ctx.globalAlpha = d.alpha;
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        });

        if (points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
                if (!isDrawing) {
                    points[i].alpha -= 0.015;
                }
            }
            ctx.strokeStyle = drawColor;
            ctx.lineWidth = 3.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.shadowBlur = 5;
            ctx.shadowColor = drawColor;
            ctx.stroke();
            ctx.shadowBlur = 0;

            if (!isDrawing && points[points.length - 1].alpha <= 0) {
                points = [];
            }
        }
    };

    const interval = setInterval(draw, 30);

    window.Effects.activeCleanups.push(() => {
        clearInterval(interval);
    });
};
