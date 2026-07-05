/**
 * Battle effect (diagonal split line with blue/red combatant glows and electric arc crackles)
 */
window.Effects = window.Effects || {};
window.Effects.battle = (element) => {
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
    let sparks = [];
    let flashTimer = 0;

    const draw = () => {
        const size = window.Effects.checkCanvasSize(canvas, container);
        width = size.width;
        height = size.height;

        ctx.clearRect(0, 0, width, height);

        flashTimer++;

        // Draw side gradients (blue bottom-left, red top-right)
        const grad = ctx.createLinearGradient(0, height, width, 0);
        grad.addColorStop(0, 'rgba(59, 130, 246, 0.08)');
        grad.addColorStop(0.48, 'rgba(59, 130, 246, 0.0)');
        grad.addColorStop(0.52, 'rgba(239, 68, 68, 0.0)');
        grad.addColorStop(1, 'rgba(239, 68, 68, 0.08)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Draw diagonal line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(width, 0);
        ctx.stroke();

        // Emit sparks along the diagonal
        if (Math.random() < 0.16) {
            sparks.push({
                t: 0,
                speed: Math.random() * 0.02 + 0.012,
                color: Math.random() > 0.5 ? '#3b82f6' : '#ef4444',
                size: Math.random() * 2 + 1.2
            });
        }

        sparks.forEach((s, idx) => {
            s.t += s.speed;
            if (s.t > 1) {
                sparks.splice(idx, 1);
                return;
            }
            const x = s.t * width;
            const y = height - (s.t * height);

            ctx.fillStyle = s.color;
            ctx.shadowBlur = 6;
            ctx.shadowColor = s.color;
            ctx.beginPath();
            ctx.arc(x, y, s.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        // Periodically draw lightning crackle along the diagonal
        if (flashTimer > 150) {
            const step = flashTimer - 150;
            if (step < 12) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
                ctx.lineWidth = 1.2;
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#a855f7';
                
                ctx.beginPath();
                ctx.moveTo(0, height);
                const segments = 7;
                for (let i = 1; i <= segments; i++) {
                    const t = i / segments;
                    const tx = t * width;
                    const ty = height - (t * height);
                    const noise = (Math.random() - 0.5) * 15;
                    
                    if (i === segments) {
                        ctx.lineTo(width, 0);
                    } else {
                        ctx.lineTo(tx + noise, ty + noise);
                    }
                }
                ctx.stroke();
                ctx.shadowBlur = 0;
            } else {
                flashTimer = 0;
            }
        }
    };

    const interval = setInterval(draw, 30);

    window.Effects.activeCleanups.push(() => {
        clearInterval(interval);
    });
};
