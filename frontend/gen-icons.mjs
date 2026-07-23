import sharp from "sharp";

const jobs = [
  ["icon-mark.svg", "pwa-192.png", 192],
  ["icon-mark.svg", "pwa-512.png", 512],
  ["icon-mark.svg", "apple-touch-icon.png", 180],
  ["icon-mark.svg", "favicon-32.png", 32],
  ["icon-maskable.svg", "pwa-maskable-512.png", 512],
];

for (const [src, out, size] of jobs) {
  await sharp(`public/${src}`).resize(size, size).png().toFile(`public/${out}`);
  console.log("generated", out);
}
