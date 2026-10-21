const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(width, height, drawPixelFn) {
  const bytesPerPixel = 4;
  const rowSize = width * bytesPerPixel + 1;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0;

    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawPixelFn(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * bytesPerPixel;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', deflated);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcData), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Draw a modern sleek glowing Quill/Pen & Letter G icon in violet/indigo gradient
function drawGrammarIcon(x, y, w, h) {
  const nx = (x / w) * 2 - 1; // -1 to 1
  const ny = (y / h) * 2 - 1; // -1 to 1

  // Outer circle background with smooth radius
  const dist = Math.hypot(nx, ny);
  if (dist > 0.88) return [0, 0, 0, 0];

  // Pen/Quill diagonal line: (-0.45, 0.45) to (0.45, -0.45)
  // Distance to diagonal line
  const diagDist = Math.abs(nx + ny) / Math.SQRT2;

  // Let's create an elegant Pen nib / checkmark shape
  let isNib = false;
  // Pen body angled at 45 deg
  if (diagDist < 0.28 && (nx - ny) > -0.65 && (nx - ny) < 0.65) {
    isNib = true;
  }
  // Nib tip at bottom-left (-0.48, 0.48)
  if (Math.hypot(nx - (-0.45), ny - 0.45) < 0.12) {
    isNib = true;
  }

  // Inside nib slit
  if (diagDist < 0.05 && nx < 0 && ny > 0) {
    isNib = false;
  }

  if (isNib) {
    return [255, 255, 255, 255]; // Pure white inner pen
  }

  // Background gradient: Rich Violet (#6366f1) to Deep Fuchsia (#a855f7)
  const grad = (nx + ny + 2) / 4;
  const r = Math.round(99 * (1 - grad) + 168 * grad);
  const g = Math.round(102 * (1 - grad) + 85 * grad);
  const b = Math.round(241 * (1 - grad) + 247 * grad);

  return [r, g, b, 255];
}

const sizes = [16, 32, 48, 128];
const iconsDir = path.join(__dirname, '..', 'icons');

sizes.forEach(size => {
  const pngBuf = createPng(size, size, drawGrammarIcon);
  fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), pngBuf);
  console.log(`Generated icon${size}.png`);
});
