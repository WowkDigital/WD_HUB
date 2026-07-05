/**
 * Alchemy effect (rotating transmutation circle and floating alchemical sparks)
 */
window.Effects = window.Effects || {};
window.Effects.alchemy = (element) => {
    const container = element.querySelector('.glass');
    if (!container) return;
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '0';
    canvas.style.opacity = '0.25';
    canvas.style.pointerEvents = 'none';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = 0, height = 0;
    let rotation = 0;
    let pulse = 0;
    let activeTimer = 0;
    let isActivating = false;
    let sparks = [];

    const draw = () => {
        const size = window.Effects.checkCanvasSize(canvas, container);
        width = size.width;
        height = size.height;

        ctx.clearRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height / 2;
        const maxRadius = Math.min(width, height) * 0.38;

        rotation += 0.004;
        pulse += 0.04;

        activeTimer++;
        if (activeTimer > 250) {
            isActivating = true;
            if (activeTimer > 290) {
                activeTimer = 0;
                isActivating = false;
            }
        }

        let alpha = 0.22 + Math.sin(pulse) * 0.07;
        let glow = 0;
        if (isActivating) {
            const progress = (activeTimer - 250) / 40;
            alpha = progress < 0.5 ? 0.22 + progress * 1.5 : 1.0 - (progress - 0.5) * 1.5;
            glow = progress < 0.5 ? progress * 25 : (1.0 - progress) * 25;
        }

        // Draw alchemical floating sparks
        if (Math.random() < 0.14 && sparks.length < 22) {
            sparks.push({
                x: Math.random() * width,
                y: height - 10,
                vy: -(Math.random() * 0.8 + 0.4),
                vx: (Math.random() - 0.5) * 0.3,
                size: Math.random() * 1.8 + 1,
                alpha: 1.0
            });
        }
        sparks.forEach((s, idx) => {
            s.x += s.vx;
            s.y += s.vy;
            s.alpha -= 0.012;
            if (s.alpha <= 0 || s.y < 0) {
                sparks.splice(idx, 1);
                return;
            }
            ctx.fillStyle = `rgba(239, 68, 68, ${s.alpha * 0.4})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.shadowBlur = glow;
        ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
        ctx.strokeStyle = `rgba(239, 68, 68, ${alpha})`;
        ctx.lineWidth = 1.5;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);

        ctx.beginPath();
        ctx.arc(0, 0, maxRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, maxRadius * 0.85, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
            const angle = (i * Math.PI * 2) / 3;
            const x = Math.cos(angle) * maxRadius * 0.85;
            const y = Math.sin(angle) * maxRadius * 0.85;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
            const angle = (i * Math.PI * 2) / 3 + Math.PI;
            const x = Math.cos(angle) * maxRadius * 0.85;
            const y = Math.sin(angle) * maxRadius * 0.85;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, maxRadius * 0.35, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
        ctx.shadowBlur = 0;
    };

    const interval = setInterval(draw, 25);

    window.Effects.activeCleanups.push(() => {
        clearInterval(interval);
    });
};
