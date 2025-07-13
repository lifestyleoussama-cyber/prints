import { parentPort } from 'node:worker_threads';

if (!parentPort) throw new Error('No parent port.');

parentPort.on('message', ({ buffer, variant }) => {
    const raw = new Uint8ClampedArray(buffer);

    for (let i = 0; i < raw.length; i += 4) {
        const r = raw[i], g = raw[i + 1], b = raw[i + 2], a = raw[i + 3];

        const isWhite = isNearWhite([r,g,b]) && a > 0;

        raw[i] = isWhite ? variant[0] : 0;
        raw[i + 1] = isWhite ? variant[1] : 0;
        raw[i + 2] = isWhite ? variant[2] : 0;
        raw[i + 3] = isWhite ? variant[3] : 0;
    }

    parentPort.postMessage(raw.buffer, [raw.buffer]);
    parentPort.close();
});

function isNearWhite(color, tolerance = 8) {
    const [r, g, b] = color;
    return (
        r >= 255 - tolerance &&
        g >= 255 - tolerance &&
        b >= 255 - tolerance
    );
}