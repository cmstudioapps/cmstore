// api/fps.js

let lastTime = 0;
let frameCount = 0;
let fps = 0;

export default function handler(req, res) {
    const now = Date.now();

    frameCount++;

    // Calcular FPS a cada 1000ms (1 segundo)
    if (now - lastTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastTime = now;
    }

    // Retorna o FPS atual
    res.status(200).json({ fps });
}