/**
 * Pharma effect (EKG monitoring heartbeat line coupled with background medic-graph and pulsing heart)
 */
window.Effects = window.Effects || {};
window.Effects.pharma = (element) => {
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
        const size = window.Effects.checkCanvasSize(canvas, container);
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

    window.Effects.activeCleanups.push(() => {
        clearInterval(interval);
    });
};
