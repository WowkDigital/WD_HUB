/**
 * Railway effect (rounded-corner coordinates matching the card radius, drawing rail tracks)
 */
window.Effects = window.Effects || {};
window.Effects.railway = (element) => {
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
        const size = window.Effects.checkCanvasSize(canvas, container);
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

    window.Effects.activeCleanups.push(() => {
        clearInterval(interval);
    });
};
