/**
 * VHS effect (flicker noise, scanlines, REC indicator, and horizontal chromatic aberration sweep lines)
 */
window.Effects = window.Effects || {};
window.Effects.vhs = (element) => {
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
        const size = window.Effects.checkCanvasSize(canvas, container);
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

    window.Effects.activeCleanups.push(() => {
        clearInterval(interval);
    });
};
