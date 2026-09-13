const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const crypto = require('node:crypto');
const assets = path.resolve(__dirname, '../assets/images/room');

// Decode the committed RGB/RGBA PNGs independently of the Python extraction code.
function readPng(file) {
  const png = fs.readFileSync(path.join(assets, file));
  const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
  assert.equal(png[24], 8);
  const channels = ({ 2: 3, 6: 4 })[png[25]];
  assert.ok(channels); assert.equal(png[28], 0);
  const chunks = [];
  for (let p = 8; p < png.length;) {
    const size = png.readUInt32BE(p);
    if (png.toString('ascii', p + 4, p + 8) === 'IDAT') chunks.push(png.subarray(p + 8, p + 8 + size));
    p += size + 12;
  }
  const filtered = zlib.inflateSync(Buffer.concat(chunks));
  const stride = width * channels, bytes = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    const filter = filtered[y * (stride + 1)];
    assert.ok(filter <= 4);
    for (let x = 0; x < stride; x++) {
      const i = y * stride + x, a = x >= channels ? bytes[i - channels] : 0;
      const b = y ? bytes[i - stride] : 0, c = y && x >= channels ? bytes[i - stride - channels] : 0;
      const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      const predictor = [0, a, b, Math.floor((a + b) / 2), pa <= pb && pa <= pc ? a : pb <= pc ? b : c][filter];
      bytes[i] = (filtered[y * (stride + 1) + x + 1] + predictor) & 255;
    }
  }
  return { width, height, channels, bytes };
}

test('all six original-pixel layers reconstruct the approved scene exactly', () => {
  const sourceBytes = fs.readFileSync(path.join(assets, 'source.png'));
  assert.equal(crypto.createHash('sha256').update(sourceBytes).digest('hex'), 'b1161a3db8dfd5b6801a4302a57e5fad6761f1892fb33d8877afe52ee3ca7667');
  const source = readPng('source.png');
  const spec = JSON.parse(fs.readFileSync(path.join(assets, 'layers.json'), 'utf8'));
  const layers = ['background.png', ...spec.layers.map(l => l.file)].map(readPng);
  for (const layer of layers) {
    assert.equal(layer.width, source.width); assert.equal(layer.height, source.height); assert.equal(layer.channels, 4);
  }
  let mismatches = 0, coverageErrors = 0;
  for (let i = 0; i < source.width * source.height; i++) {
    const total = [0, 0, 0, 0];
    for (const layer of layers) for (let c = 0; c < 4; c++) total[c] += layer.bytes[i * 4 + c];
    if (total[3] !== 255) coverageErrors++;
    if (total.slice(0, 3).some((v, c) => v !== source.bytes[i * source.channels + c])) mismatches++;
  }
  assert.equal(coverageErrors, 0, 'each original pixel belongs to exactly one layer');
  assert.equal(mismatches, 0, 'no redraw, displaced object, recolor or extra shadow');
});
