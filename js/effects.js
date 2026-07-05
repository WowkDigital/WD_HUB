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

        Effects.activeCleanups.push(() => {
            clearInterval(interval);
            window.removeEventListener('resize', resize);
        });
    },

    /**
     * Liquid effect (slow auroral background gradient shifting)
     */
    liquid: (element) => {
        element.classList.add('liquid-active');
    },

    /**
     * Alchemy effect (rotating and activating transmutation circle on canvas)
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
        let width, height;
        let rotation = 0;
        let pulse = 0;
        let activeTimer = 0;
        let isActivating = false;

        const resize = () => {
            const rect = container.getBoundingClientRect();
            width = canvas.width = rect.width;
            height = canvas.height = rect.height;
        };
        window.addEventListener('resize', resize);
        resize();

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            const cx = width / 2;
            const cy = height / 2;
            const maxRadius = Math.min(width, height) * 0.38;

            rotation += 0.004;
            pulse += 0.04;

            // Alchemy activation cycle
            activeTimer++;
            if (activeTimer > 250) { // activation every ~7 seconds
                isActivating = true;
                if (activeTimer > 290) {
                    activeTimer = 0;
                    isActivating = false;
                }
            }

            let alpha = 0.25 + Math.sin(pulse) * 0.08;
            let glow = 0;
            if (isActivating) {
                const progress = (activeTimer - 250) / 40;
                alpha = progress < 0.5 ? 0.25 + progress * 1.5 : 1.0 - (progress - 0.5) * 1.5;
                glow = progress < 0.5 ? progress * 25 : (1.0 - progress) * 25;
            }

            ctx.shadowBlur = glow;
            ctx.shadowColor = 'rgba(239, 68, 68, 0.8)'; // Red alchemical energy
            ctx.strokeStyle = `rgba(239, 68, 68, ${alpha})`;
            ctx.lineWidth = 1.5;

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(rotation);

            // Outer circle
            ctx.beginPath();
            ctx.arc(0, 0, maxRadius, 0, Math.PI * 2);
            ctx.stroke();

            // Inner circle
            ctx.beginPath();
            ctx.arc(0, 0, maxRadius * 0.85, 0, Math.PI * 2);
            ctx.stroke();

            // Heptagram or triangles inside
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

            // Small center circle
            ctx.beginPath();
            ctx.arc(0, 0, maxRadius * 0.35, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();
        };

        const interval = setInterval(draw, 25);

        Effects.activeCleanups.push(() => {
            clearInterval(interval);
            window.removeEventListener('resize', resize);
        });
    },

    /**
     * Radiation effect (hexagonal expansion waves and Geiger counter spikes)
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
        let width, height;
        let ripples = [];
        let particles = [];
        let timeToNextPulse = 0;

        const resize = () => {
            const rect = container.getBoundingClientRect();
            width = canvas.width = rect.width;
            height = canvas.height = rect.height;
        };
        window.addEventListener('resize', resize);
        resize();

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

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

                ctx.strokeStyle = `rgba(16, 185, 129, ${r.alpha * 0.35})`;
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
                ctx.fillStyle = `rgba(52, 211, 153, ${p.alpha * 0.5})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
        };

        const interval = setInterval(draw, 30);

        Effects.activeCleanups.push(() => {
            clearInterval(interval);
            window.removeEventListener('resize', resize);
        });
    },

    /**
     * Quantum effect (particle collision and fusion explosion)
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
        let width, height;
        let particles = [];
        let sparks = [];
        let state = 'charging';
        let chargeTimer = 0;
        let collisionFlash = 0;

        const resize = () => {
            const rect = container.getBoundingClientRect();
            width = canvas.width = rect.width;
            height = canvas.height = rect.height;
        };
        window.addEventListener('resize', resize);
        resize();

        const initParticles = () => {
            particles = [
                { x: 15, y: height / 2, vx: 0, color: '#f59e0b', size: 5 },
                { x: width - 15, y: height / 2, vx: 0, color: '#3b82f6', size: 5 }
            ];
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            if (particles.length === 0) {
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

                if (Math.abs(p1.x - p2.x) < 6) {
                    state = 'explosion';
                    collisionFlash = 1.0;
                    sparks = [];
                    for (let i = 0; i < 12; i++) {
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
                    s.alpha -= 0.025;

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
            window.removeEventListener('resize', resize);
        });
    },

    /**
     * Gravity effect (satellites orbiting around card's central icon)
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
        let width, height;
        let bodies = [];

        const resize = () => {
            const rect = container.getBoundingClientRect();
            width = canvas.width = rect.width;
            height = canvas.height = rect.height;
        };
        window.addEventListener('resize', resize);
        resize();

        bodies = [
            { angle: 0, speed: 0.035, rx: 25, ry: 9, tilt: -0.15, color: '#a855f7', size: 2.8, trail: [] },
            { angle: Math.PI * 0.6, speed: 0.022, rx: 35, ry: 13, tilt: 0.35, color: '#ec4899', size: 2.2, trail: [] },
            { angle: Math.PI * 1.3, speed: 0.016, rx: 45, ry: 17, tilt: -0.4, color: '#6366f1', size: 1.8, trail: [] }
        ];

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            let cx = 56, cy = 56;
            const icon = element.querySelector('[data-lucide="orbit"], .rounded-2xl, .rounded-xl');
            if (icon) {
                const iconRect = icon.getBoundingClientRect();
                const cardRect = element.getBoundingClientRect();
                cx = (iconRect.left + iconRect.right) / 2 - cardRect.left;
                cy = (iconRect.top + iconRect.bottom) / 2 - cardRect.top;
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

                ctx.strokeStyle = `rgba(255, 255, 255, 0.02)`;
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
                    ctx.globalAlpha = 0.25;
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
            window.removeEventListener('resize', resize);
        });
    },

    /**
     * Railway effect (train light running along border perimeter)
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
        let width, height;
        let distance = 0;
        const speed = 1.6;
        const trainLength = 4;
        const carSpacing = 10;

        const resize = () => {
            const rect = container.getBoundingClientRect();
            width = canvas.width = rect.width;
            height = canvas.height = rect.height;
        };
        window.addEventListener('resize', resize);
        resize();

        const getPerimeterPoint = (dist) => {
            const inset = 3;
            const w = width - inset * 2;
            const h = height - inset * 2;
            const perimeter = 2 * w + 2 * h;
            
            let d = dist % perimeter;
            if (d < 0) d += perimeter;

            if (d < w) {
                return { x: inset + d, y: inset };
            } else if (d < w + h) {
                return { x: inset + w, y: inset + (d - w) };
            } else if (d < 2 * w + h) {
                return { x: inset + w - (d - w - h), y: inset + h };
            } else {
                return { x: inset, y: inset + h - (d - 2 * w - h) };
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

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
            window.removeEventListener('resize', resize);
        });
    },

    /**
     * Pharma effect (EKG monitoring heartbeat line across bottom)
     */
    pharma: (element) => {
        element.classList.add('pharma-active');

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
        let width, height;
        let time = 0;

        const resize = () => {
            const rect = container.getBoundingClientRect();
            width = canvas.width = rect.width;
            height = canvas.height = rect.height;
        };
        window.addEventListener('resize', resize);
        resize();

        const getEKGValue = (phase) => {
            if (phase < 0.1) return 0;
            if (phase < 0.15) { // P-wave
                const p = (phase - 0.1) / 0.05;
                return Math.sin(p * Math.PI) * 0.12;
            }
            if (phase < 0.18) return 0;
            if (phase < 0.20) { // Q-dip
                const p = (phase - 0.18) / 0.02;
                return -p * 0.18;
            }
            if (phase < 0.23) { // R-peak
                const p = (phase - 0.20) / 0.03;
                return -0.18 + p * 1.18;
            }
            if (phase < 0.26) { // S-dip
                const p = (phase - 0.23) / 0.03;
                return 1.0 - p * 1.35;
            }
            if (phase < 0.28) { // baseline
                const p = (phase - 0.26) / 0.02;
                return -0.35 + p * 0.35;
            }
            if (phase < 0.35) return 0;
            if (phase < 0.42) { // T-wave
                const p = (phase - 0.35) / 0.07;
                return Math.sin(p * Math.PI) * 0.25;
            }
            return 0;
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            time += 2;
            const baseY = height * 0.86;

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
            window.removeEventListener('resize', resize);
        });
    },

    /**
     * VHS effect (flickering CRT scanner and red camera recording status dot)
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
        let width, height;
        let frameCount = 0;

        const resize = () => {
            const rect = container.getBoundingClientRect();
            width = canvas.width = rect.width;
            height = canvas.height = rect.height;
        };
        window.addEventListener('resize', resize);
        resize();

        const draw = () => {
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
            window.removeEventListener('resize', resize);
        });
    },

    /**
     * Crypto effect (scrolling hex metrics decrypting into terms in the center)
     */
    crypto: (element) => {
        element.classList.add('neon-active');

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
        let width, height;
        let symbols = [];
        let timer = 0;

        const resize = () => {
            const rect = container.getBoundingClientRect();
            width = canvas.width = rect.width;
            height = canvas.height = rect.height;
        };
        window.addEventListener('resize', resize);
        resize();

        const chars = "01ABCDEFx_#@$!+";
        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            timer++;

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

                ctx.fillStyle = `rgba(59, 130, 246, ${s.alpha})`;
                ctx.font = '10px monospace';
                ctx.fillText(s.char, s.x, s.y);
            });
        };

        const interval = setInterval(draw, 40);

        Effects.activeCleanups.push(() => {
            clearInterval(interval);
            window.removeEventListener('resize', resize);
        });
    },

    /**
     * Draw effect (colorful bezier path drawn periodically, fading away)
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
        let width, height;
        let points = [];
        let drawingTimer = 0;
        let drawColor = 'rgba(99, 102, 241, 0.4)';
        let isDrawing = false;

        const resize = () => {
            const rect = container.getBoundingClientRect();
            width = canvas.width = rect.width;
            height = canvas.height = rect.height;
        };
        window.addEventListener('resize', resize);
        resize();

        const colors = [
            'rgba(99, 102, 241, 0.45)',
            'rgba(168, 85, 247, 0.45)',
            'rgba(236, 72, 153, 0.45)',
            'rgba(59, 130, 246, 0.45)'
        ];

        const draw = () => {
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
                } else if (points.length >= 30) {
                    isDrawing = false;
                    drawingTimer = 0;
                }
            }

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
            window.removeEventListener('resize', resize);
        });
    },

    /**
     * Neon pulse effect
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
     * Hue rotate effect
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
