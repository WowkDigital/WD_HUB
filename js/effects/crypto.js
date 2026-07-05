/**
 * Crypto effect (scrolling cipher code grid with scanning horizontal line spotlight, no border pulse)
 */
window.Effects = window.Effects || {};
window.Effects.crypto = (element) => {
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
        const size = window.Effects.checkCanvasSize(canvas, container);
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

    window.Effects.activeCleanups.push(() => {
        clearInterval(interval);
    });
};
