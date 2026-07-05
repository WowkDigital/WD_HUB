/**
 * Quantum effect (particles colliding and scattering sparks, drawing background vacuum collapse)
 */
window.Effects = window.Effects || {};
window.Effects.quantum = (element) => {
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
    let particles = [];
    let sparks = [];
    let backgroundDust = [];
    let state = 'charging';
    let chargeTimer = 0;
    let collisionFlash = 0;

    const initParticles = () => {
        particles = [
            { x: 15, y: height / 2, vx: 0, color: '#f59e0b', size: 5 },
            { x: width - 15, y: height / 2, vx: 0, color: '#3b82f6', size: 5 }
        ];
    };

    const draw = () => {
        const size = window.Effects.checkCanvasSize(canvas, container);
        width = size.width;
        height = size.height;

        if (size.resized || particles.length === 0) {
            initParticles();
        }

        const p1 = particles[0];
        const p2 = particles[1];

        if (state === 'charging') {
            chargeTimer++;
            const offset = Math.sin(chargeTimer * 0.12) * 6;
            p1.y = height / 2 + offset;
            p2.y = height / 2 - offset;

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(width / 2, height / 2);
            ctx.moveTo(p2.x, p2.y);
            ctx.lineTo(width / 2, height / 2);
            ctx.stroke();
            ctx.setLineDash([]);

            if (chargeTimer > 80) {
                state = 'dashing';
            }
        } else if (state === 'dashing') {
            const targetX = width / 2;
            const speed = 0.18;
            p1.vx += (targetX - p1.x) * speed;
            p2.vx += (targetX - p2.x) * speed;

            p1.x += p1.vx;
            p2.x += p2.vx;

            if (Math.random() < 0.35) {
                backgroundDust.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    alpha: 0.6
                });
            }

            if (Math.abs(p1.x - p2.x) < 6) {
                state = 'explosion';
                collisionFlash = 1.0;
                sparks = [];
                backgroundDust = [];
                for (let i = 0; i < 14; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = Math.random() * 3.5 + 1.5;
                    sparks.push({
                        x: width / 2,
                        y: height / 2,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        color: Math.random() > 0.5 ? '#f59e0b' : '#3b82f6',
                        alpha: 1.0,
                        size: Math.random() * 2 + 1
                    });
                }
            }
        } else if (state === 'explosion') {
            if (collisionFlash > 0) {
                ctx.fillStyle = `rgba(255, 255, 255, ${collisionFlash})`;
                ctx.beginPath();
                ctx.arc(width / 2, height / 2, 20 * collisionFlash, 0, Math.PI * 2);
                ctx.fill();
                collisionFlash -= 0.06;
            }

            sparks.forEach((s, idx) => {
                s.x += s.vx;
                s.y += s.vy;
                s.vx *= 0.94;
                s.vy *= 0.94;
                s.alpha -= 0.022;

                if (s.alpha <= 0) {
                    sparks.splice(idx, 1);
                    return;
                }

                ctx.fillStyle = s.color;
                ctx.globalAlpha = s.alpha;
                ctx.shadowBlur = 4;
                ctx.shadowColor = s.color;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
                ctx.shadowBlur = 0;
            });

            if (sparks.length === 0 && collisionFlash <= 0) {
                state = 'charging';
                chargeTimer = 0;
                initParticles();
            }
        }

        backgroundDust.forEach((d, idx) => {
            const dx = width / 2 - d.x;
            const dy = height / 2 - d.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 8) {
                backgroundDust.splice(idx, 1);
                return;
            }
            d.x += (dx / dist) * 2.8;
            d.y += (dy / dist) * 2.8;
            ctx.fillStyle = `rgba(255, 255, 255, ${d.alpha * 0.25})`;
            ctx.beginPath();
            ctx.arc(d.x, d.y, 1.2, 0, Math.PI * 2);
            ctx.fill();
        });

        if (state !== 'explosion') {
            particles.forEach(p => {
                ctx.fillStyle = p.color;
                ctx.shadowBlur = 8;
                ctx.shadowColor = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            });
        }
    };

    const interval = setInterval(draw, 30);

    window.Effects.activeCleanups.push(() => {
        clearInterval(interval);
    });
};
