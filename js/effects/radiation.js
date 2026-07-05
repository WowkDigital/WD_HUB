/**
 * Radiation effect (hexagonal ripples, geiger sparks, and slow nuclear hazard sign rotation)
 */
window.Effects = window.Effects || {};
window.Effects.radiation = (element) => {
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
    let ripples = [];
    let particles = [];
    let timeToNextPulse = 0;
    let hazardRotation = 0;
    let pulse = 0;

    const draw = () => {
        const size = window.Effects.checkCanvasSize(canvas, container);
        width = size.width;
        height = size.height;

        ctx.clearRect(0, 0, width, height);

        pulse += 0.03;

        // Draw background nuclear hazard symbol
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate(hazardRotation);
        hazardRotation += 0.0025;

        const hazardAlpha = 0.035 + Math.sin(pulse) * 0.015;
        ctx.fillStyle = `rgba(16, 185, 129, ${hazardAlpha})`;
        
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();

        const rOut = 32;
        const rIn = 12;
        for (let i = 0; i < 3; i++) {
            const angle = (i * Math.PI * 2) / 3;
            ctx.beginPath();
            ctx.arc(0, 0, rOut, angle, angle + Math.PI / 3);
            ctx.arc(0, 0, rIn, angle + Math.PI / 3, angle, true);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();

        timeToNextPulse--;
        if (timeToNextPulse <= 0) {
            ripples.push({
                x: width / 2,
                y: height / 2,
                radius: 8,
                maxRadius: Math.max(width, height) * 0.65,
                alpha: 0.8
            });
            timeToNextPulse = Math.random() * 120 + 80;
        }

        ripples.forEach((r, idx) => {
            r.radius += 1.8;
            r.alpha = 1 - (r.radius / r.maxRadius);
            if (r.alpha <= 0 || r.radius >= r.maxRadius) {
                ripples.splice(idx, 1);
                return;
            }

            ctx.strokeStyle = `rgba(16, 185, 129, ${r.alpha * 0.3})`;
            ctx.lineWidth = 1.5;
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#10b981';

            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3;
                const x = r.x + Math.cos(angle) * r.radius;
                const y = r.y + Math.sin(angle) * r.radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        });

        if (Math.random() < 0.12) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 2 + 1,
                alpha: 1.0,
                decay: Math.random() * 0.04 + 0.02
            });
        }

        ctx.shadowBlur = 0;
        particles.forEach((p, idx) => {
            p.alpha -= p.decay;
            if (p.alpha <= 0) {
                particles.splice(idx, 1);
                return;
            }
            ctx.fillStyle = `rgba(52, 211, 153, ${p.alpha * 0.45})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
    };

    const interval = setInterval(draw, 30);

    window.Effects.activeCleanups.push(() => {
        clearInterval(interval);
    });
};
