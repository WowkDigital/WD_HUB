/**
 * Card Effects Manager
 * Handles periodic animations for project cards
 */

const Effects = {
    activeCleanups: [],

    cleanup: () => {
        Effects.activeCleanups.forEach(cb => cb());
        Effects.activeCleanups = [];
    },

    /**
     * Helper to keep canvas resolution synchronized with client bounding rect
     */
    checkCanvasSize: (canvas, container) => {
        const rect = container.getBoundingClientRect();
        const w = Math.round(rect.width);
        const h = Math.round(rect.height);
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
            return { width: w, height: h, resized: true };
        }
        return { width: canvas.width, height: canvas.height, resized: false };
    },

    /**
     * Glitch effect (Glitch Studio style)
     */
    glitch: (element) => {
        let timeoutId;
        const trigger = () => {
            element.classList.add('glitch-active');
            timeoutId = setTimeout(() => {
                element.classList.remove('glitch-active');
            }, 300);

            // Random interval between 3 and 10 seconds
            timeoutId = setTimeout(trigger, Math.random() * 2000 + 2000);
        };

        // Initial delay
        timeoutId = setTimeout(trigger, Math.random() * 3000 + 1000);

        Effects.activeCleanups.push(() => {
            clearTimeout(timeoutId);
        });
    },

    /**
     * Matrix effect (subtle pulse or green glow)
     */
    matrix: (element) => {
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
            const size = Effects.checkCanvasSize(canvas, container);
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

        Effects.activeCleanups.push(() => {
            clearInterval(interval);
        });
    },

    /**
     * Battle effect (diagonal split line with blue/red combatant glows and electric arc crackles)
     */
    battle: (element) => {
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
            const size = Effects.checkCanvasSize(canvas, container);
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

        Effects.activeCleanups.push(() => {
            clearInterval(interval);
        });
    },

    /**
     * Liquid effect (organic blobs floating like a lava lamp, using blur blending)
     */
    liquid: (element) => {
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
            const size = Effects.checkCanvasSize(canvas, container);
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

        Effects.activeCleanups.push(() => {
            clearInterval(interval);
        });
    },

    /**
     * Alchemy effect (rotating transmutation circle and floating alchemical sparks)
     */
    alchemy: (element) => {
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
            const size = Effects.checkCanvasSize(canvas, container);
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

        Effects.activeCleanups.push(() => {
            clearInterval(interval);
        });
    },

    /**
     * Radiation effect (hexagonal ripples, geiger sparks, and slow nuclear hazard sign rotation)
     */
    radiation: (element) => {
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
            const size = Effects.checkCanvasSize(canvas, container);
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

        Effects.activeCleanups.push(() => {
            clearInterval(interval);
        });
    },

    /**
     * Quantum effect (particles colliding and scattering sparks, drawing background vacuum collapse)
     */
    quantum: (element) => {
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
            const size = Effects.checkCanvasSize(canvas, container);
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

        Effects.activeCleanups.push(() => {
            clearInterval(interval);
        });
    },

    /**
     * Gravity effect (satellites orbiting on tilted planes around space-time gravity well sheet under icon)
     */
    gravity: (element) => {
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
            const size = Effects.checkCanvasSize(canvas, container);
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

        Effects.activeCleanups.push(() => {
            clearInterval(interval);
        });
    },

    /**
     * Railway effect (rounded-corner coordinates matching the card radius, drawing rail tracks)
     */
    railway: (element) => {
        const container = element.querySelector('.glass');
        if (!container) return;
        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '0';
        canvas.style.opacity = '0.55';
        canvas.style.pointerEvents = 'none';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let width = 0, height = 0;
        let distance = 0;
        const speed = 1.6;
        const trainLength = 4;
        const carSpacing = 10;

        const getPerimeterPoint = (dist) => {
            const inset = 3;
            const r = 24;
            const w_seg = width - inset * 2 - r * 2;
            const h_seg = height - inset * 2 - r * 2;
            const arc_len = r * Math.PI / 2;
            const perimeter = 2 * w_seg + 2 * h_seg + 4 * arc_len;
            
            let d = dist % perimeter;
            if (d < 0) d += perimeter;

            if (d < w_seg) {
                return { x: inset + r + d, y: inset };
            }
            d -= w_seg;

            if (d < arc_len) {
                const a = -Math.PI / 2 + d / r;
                return {
                    x: width - inset - r + Math.cos(a) * r,
                    y: inset + r + Math.sin(a) * r
                };
            }
            d -= arc_len;

            if (d < h_seg) {
                return { x: width - inset, y: inset + r + d };
            }
            d -= h_seg;

            if (d < arc_len) {
                const a = 0 + d / r;
                return {
                    x: width - inset - r + Math.cos(a) * r,
                    y: height - inset - r + Math.sin(a) * r
                };
            }
            d -= arc_len;

            if (d < w_seg) {
                return { x: width - inset - r - d, y: height - inset };
            }
            d -= w_seg;

            if (d < arc_len) {
                const a = Math.PI / 2 + d / r;
                return {
                    x: inset + r + Math.cos(a) * r,
                    y: height - inset - r + Math.sin(a) * r
                };
            }
            d -= arc_len;

            if (d < h_seg) {
                return { x: inset, y: height - inset - r - d };
            }
            d -= h_seg;

            const a = Math.PI + d / r;
            return {
                x: inset + r + Math.cos(a) * r,
                y: inset + r + Math.sin(a) * r
            };
        };

        const draw = () => {
            const size = Effects.checkCanvasSize(canvas, container);
            width = size.width;
            height = size.height;

            ctx.clearRect(0, 0, width, height);

            const inset = 3;
            const r = 24;
            const w_seg = width - inset * 2 - r * 2;
            const h_seg = height - inset * 2 - r * 2;
            const arc_len = r * Math.PI / 2;
            const totalLen = 2 * w_seg + 2 * h_seg + 4 * arc_len;

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let d = 0; d < totalLen; d += 4) {
                const p = getPerimeterPoint(d);
                if (d === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            }
            ctx.closePath();
            ctx.stroke();

            distance += speed;

            for (let i = 0; i < trainLength; i++) {
                const carDist = distance - (i * carSpacing);
                const pos = getPerimeterPoint(carDist);
                const isLocomotive = i === 0;

                ctx.fillStyle = isLocomotive ? '#3b82f6' : 'rgba(59, 130, 246, 0.45)';
                ctx.shadowBlur = isLocomotive ? 6 : 2;
                ctx.shadowColor = '#3b82f6';

                ctx.beginPath();
                ctx.arc(pos.x, pos.y, isLocomotive ? 3 : 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        };

        const interval = setInterval(draw, 25);

        Effects.activeCleanups.push(() => {
            clearInterval(interval);
        });
    },

    /**
     * Pharma effect (EKG monitoring heartbeat line coupled with background medic-graph and pulsing heart)
     */
    pharma: (element) => {
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
        let time = 0;

        const getEKGValue = (phase) => {
            if (phase < 0.1) return 0;
            if (phase < 0.15) {
                const p = (phase - 0.1) / 0.05;
                return Math.sin(p * Math.PI) * 0.12;
            }
            if (phase < 0.18) return 0;
            if (phase < 0.20) {
                const p = (phase - 0.18) / 0.02;
                return -p * 0.18;
            }
            if (phase < 0.23) {
                const p = (phase - 0.20) / 0.03;
                return -0.18 + p * 1.18;
            }
            if (phase < 0.26) {
                const p = (phase - 0.23) / 0.03;
                return 1.0 - p * 1.35;
            }
            if (phase < 0.28) {
                const p = (phase - 0.26) / 0.02;
                return -0.35 + p * 0.35;
            }
            if (phase < 0.35) return 0;
            if (phase < 0.42) {
                const p = (phase - 0.35) / 0.07;
                return Math.sin(p * Math.PI) * 0.25;
            }
            return 0;
        };

        const drawHeart = (c, x, y, size) => {
            c.beginPath();
            c.moveTo(x, y + size / 4);
            c.bezierCurveTo(x - size / 2, y - size / 2, x - size, y + size / 3, x, y + size);
            c.bezierCurveTo(x + size, y + size / 3, x + size / 2, y - size / 2, x, y + size / 4);
            c.closePath();
        };

        const draw = () => {
            const size = Effects.checkCanvasSize(canvas, container);
            width = size.width;
            height = size.height;

            ctx.clearRect(0, 0, width, height);

            time += 2;

            ctx.strokeStyle = 'rgba(16, 185, 129, 0.015)';
            ctx.lineWidth = 0.5;
            for (let x = 0; x < width; x += 12) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
            for (let y = 0; y < height; y += 12) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            const baseY = height * 0.86;

            const centerPhase = ((width / 2 - time) % 240 + 240) % 240 / 240;
            const ekgVal = getEKGValue(centerPhase);

            const hX = width / 2;
            const hY = height * 0.46;
            const hSize = 15 * (1.0 + Math.max(0, ekgVal) * 0.35);

            ctx.strokeStyle = `rgba(16, 185, 129, ${0.04 + Math.max(0, ekgVal) * 0.18})`;
            ctx.fillStyle = `rgba(16, 185, 129, ${0.01 + Math.max(0, ekgVal) * 0.04})`;
            ctx.lineWidth = 1.5;
            drawHeart(ctx, hX, hY, hSize);
            ctx.fill();
            ctx.stroke();

            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 1.5;
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#10b981';

            ctx.beginPath();
            for (let x = 0; x < width; x++) {
                const phase = ((x - time) % 240 + 240) % 240 / 240;
                const val = getEKGValue(phase);
                const y = baseY - (val * 24);

                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
        };

        const interval = setInterval(draw, 30);

        Effects.activeCleanups.push(() => {
            clearInterval(interval);
        });
    },

    /**
     * VHS effect (flicker noise, scanlines, REC indicator, and horizontal chromatic aberration sweep lines)
     */
    vhs: (element) => {
        element.classList.add('vhs-active');

        const container = element.querySelector('.glass');
        if (!container) return;
        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '0';
        canvas.style.opacity = '0.045';
        canvas.style.pointerEvents = 'none';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let width = 0, height = 0;
        let frameCount = 0;
        let glitchBarY = 0;

        const draw = () => {
            const size = Effects.checkCanvasSize(canvas, container);
            width = size.width;
            height = size.height;

            frameCount++;
            ctx.clearRect(0, 0, width, height);

            const imgData = ctx.createImageData(width, height);
            const data = imgData.data;
            for (let i = 0; i < data.length; i += 4) {
                const val = Math.random() * 255;
                data[i] = val;
                data[i+1] = val;
                data[i+2] = val;
                data[i+3] = 255;
            }
            ctx.putImageData(imgData, 0, 0);

            if (Math.random() < 0.06 && glitchBarY === 0) {
                glitchBarY = Math.random() * height * 0.5;
            }
            if (glitchBarY > 0) {
                ctx.fillStyle = 'rgba(0, 255, 255, 0.08)';
                ctx.fillRect(0, glitchBarY, width, 5);
                ctx.fillStyle = 'rgba(255, 0, 0, 0.08)';
                ctx.fillRect(0, glitchBarY + 3, width, 5);
                glitchBarY += 2.5;
                if (glitchBarY > height) glitchBarY = 0;
            }

            ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
            for (let y = (frameCount % 7); y < height; y += 7) {
                ctx.fillRect(0, y, width, 2);
            }

            if (Math.floor(frameCount / 18) % 2 === 0) {
                ctx.fillStyle = 'rgba(239, 68, 68, 0.65)';
                ctx.beginPath();
                ctx.arc(width - 25, 25, 4.5, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        const interval = setInterval(draw, 50);

        Effects.activeCleanups.push(() => {
            clearInterval(interval);
        });
    },

    /**
     * Crypto effect (scrolling cipher code grid with scanning horizontal line spotlight, no border pulse)
     */
    crypto: (element) => {
        const container = element.querySelector('.glass');
        if (!container) return;
        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '0';
        canvas.style.opacity = '0.14';
        canvas.style.pointerEvents = 'none';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let width = 0, height = 0;
        let symbols = [];
        let timer = 0;
        let scannerY = 0;
        const chars = "01ABCDEFx_#@$!+";

        const draw = () => {
            const size = Effects.checkCanvasSize(canvas, container);
            width = size.width;
            height = size.height;

            timer++;

            ctx.strokeStyle = 'rgba(59, 130, 246, 0.015)';
            ctx.lineWidth = 1;
            for (let x = 0; x < width; x += 16) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
            for (let y = 0; y < height; y += 16) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            scannerY += 1.8;
            if (scannerY > height) scannerY = 0;

            ctx.strokeStyle = 'rgba(59, 130, 246, 0.07)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, scannerY);
            ctx.lineTo(width, scannerY);
            ctx.stroke();

            if (Math.random() < 0.4 && symbols.length < 20) {
                symbols.push({
                    x: Math.random() * width,
                    y: 0,
                    char: chars[Math.floor(Math.random() * chars.length)],
                    speed: Math.random() * 2 + 1,
                    alpha: 1.0
                });
            }

            if (timer > 180) {
                ctx.fillStyle = 'rgba(59, 130, 246, 0.85)';
                ctx.font = 'bold 12px monospace';
                ctx.textAlign = 'center';
                const words = ["V O I D", "S E C U R E", "C R Y P T O"];
                const word = words[Math.floor((timer / 180) % words.length)];
                
                let display = "";
                const progress = Math.min(1.0, (timer % 180) / 35);
                for (let i = 0; i < word.length; i++) {
                    if (Math.random() > progress) {
                        display += chars[Math.floor(Math.random() * chars.length)];
                    } else {
                        display += word[i];
                    }
                }
                ctx.fillText(display, width / 2, height / 2 + 25);
                
                if (timer % 180 > 75) {
                    timer = 0;
                }
            }

            symbols.forEach((s, idx) => {
                s.y += s.speed;
                s.alpha -= 0.012;

                if (s.y > height || s.alpha <= 0) {
                    symbols.splice(idx, 1);
                    return;
                }

                const nearScan = Math.abs(s.y - scannerY) < 16;
                ctx.fillStyle = nearScan ? `rgba(96, 165, 250, ${s.alpha * 0.95})` : `rgba(59, 130, 246, ${s.alpha})`;
                ctx.font = nearScan ? 'bold 11px monospace' : '10px monospace';
                ctx.fillText(s.char, s.x, s.y);
            });
        };

        const interval = setInterval(draw, 40);

        Effects.activeCleanups.push(() => {
            clearInterval(interval);
        });
    },

    /**
     * Draw effect (colorful brush strokes leaving behind falling paint droplets at sharp curves)
     */
    draw: (element) => {
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
            const size = Effects.checkCanvasSize(canvas, container);
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

        Effects.activeCleanups.push(() => {
            clearInterval(interval);
        });
    },

    /**
     * Neon pulse effect (compatibility placeholder)
     */
    neon: (element) => {
        element.classList.add('neon-active');
    },

    /**
     * Shake effect (triggered periodically)
     */
    shake: (element) => {
        let timeoutId;
        const trigger = () => {
            element.classList.add('shake-active');
            timeoutId = setTimeout(() => {
                element.classList.remove('shake-active');
            }, 500);
            timeoutId = setTimeout(trigger, Math.random() * 5000 + 5000);
        };
        timeoutId = setTimeout(trigger, 3000);

        Effects.activeCleanups.push(() => {
            clearTimeout(timeoutId);
        });
    },

    /**
     * Hue rotate effect (compatibility placeholder)
     */
    hueRotate: (element) => {
        element.classList.add('hue-active');
    },

    /**
     * Initialize effects for all cards based on project data
     */
    initAll: (projectData) => {
        projectData.forEach((project) => {
            const idx = typeof projects !== 'undefined' ? projects.indexOf(project) : -1;
            if (idx !== -1 && project.effect && Effects[project.effect]) {
                const cardId = `project-card-${idx}`;
                const element = document.getElementById(cardId);
                if (element) {
                    Effects[project.effect](element);
                }
            }
        });
    }
};
