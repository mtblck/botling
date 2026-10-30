// PNG, JPG and GIF downloads. The robot's SVG is drawn into a canvas through an <img>
// with a data: URI (the CSP's img-src allows data:, not blob:); the frame maths and
// the GIF encoder are pure modules so the tests can reach them.
import { encodeGif } from '/gif.js';
import { frameAt, loopLength, periods } from '/motion.js';

/** Hundredths of a second per GIF frame: 20 frames a second catches a blink. */
const DELAY = 5;

/** Draws an SVG string onto a canvas the same size. */
async function draw(ctx, svg) {
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await img.decode();
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
}

function canvas(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return c.getContext('2d', { willReadFrequently: true });
}

/**
 * A still robot as a PNG or JPEG. JPEG has no transparency, so a round frame's
 * corners turn white.
 *
 * @param {string} svg - A still botling
 * @param {number} size - Pixels per side
 * @param {'png' | 'jpeg'} type - The image format
 * @returns {Promise<Blob>} The image
 */
export async function still(svg, size, type) {
  const ctx = canvas(size);
  await draw(ctx, svg);
  if (type === 'jpeg') {
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
  return new Promise((resolve, reject) =>
    ctx.canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), `image/${type}`, 0.92),
  );
}

/**
 * A robot as a GIF: one loop of its motion, or a single frame when it's still.
 *
 * @param {string} svg - A botling, animated or not
 * @param {number} size - Pixels per side
 * @returns {Promise<Blob>} The GIF
 */
export async function gif(svg, size) {
  const ctx = canvas(size);
  const loop = loopLength(periods(svg));
  const count = Math.max(1, Math.round((loop * 100) / DELAY));
  const frames = [];
  for (let i = 0; i < count; i++) {
    await draw(ctx, loop ? frameAt(svg, loop, (i * DELAY) / 100) : svg);
    frames.push(ctx.getImageData(0, 0, size, size).data);
  }
  return new Blob([encodeGif(frames, size, size, DELAY)], { type: 'image/gif' });
}
