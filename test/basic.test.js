import test from "node:test";
import assert from "node:assert/strict";
import { splitEven, splitFixed, planGrid, planAspect } from "../src/grid.js";
import { spriteCss } from "../src/css.js";

test("splitEven distributes the remainder to the first cells", () => {
  assert.deepEqual(splitEven(900, 3), [300, 300, 300]);
  assert.deepEqual(splitEven(1600, 3), [534, 533, 533]);
  assert.deepEqual(splitEven(10, 4), [3, 3, 2, 2]);
});

test("splitEven parts always sum back to the total", () => {
  for (let total = 1; total <= 200; total++) {
    for (let n = 1; n <= 12; n++) {
      const parts = splitEven(total, n);
      assert.equal(parts.reduce((a, b) => a + b, 0), total, `${total}/${n}`);
    }
  }
});

test("splitFixed keeps full tiles and leaves a short remainder", () => {
  assert.deepEqual(splitFixed(1000, 300), [300, 300, 300, 100]);
  assert.deepEqual(splitFixed(900, 300), [300, 300, 300]);
});

test("planGrid covers the image exactly, in reading order", () => {
  const r = planGrid({ width: 1600, height: 900, cols: 3, rows: 2 });
  assert.equal(r.pieces.length, 6);
  assert.deepEqual(r.pieces[0], { n: 1, x: 0, y: 0, w: 534, h: 450 });
  assert.deepEqual(r.pieces[1], { n: 2, x: 534, y: 0, w: 533, h: 450 });
  assert.deepEqual(r.pieces[3], { n: 4, x: 0, y: 450, w: 534, h: 450 });
  const area = r.pieces.reduce((s, p) => s + p.w * p.h, 0);
  // pieces tile the rectangle: no overlap, no gap
  assert.equal(r.xs.reduce((a, b) => a + b, 0), 1600);
  assert.equal(r.ys.reduce((a, b) => a + b, 0), 900);
  assert.ok(area > 0);
});

test("planGrid columns mode and dropPartial", () => {
  const r = planGrid({ width: 1000, height: 400, mode: "columns", cols: 3 });
  assert.equal(r.pieces.length, 3);
  assert.deepEqual(r.pieces.map((p) => p.w), [334, 333, 333]);

  const p = planGrid({
    width: 1000, height: 400, mode: "grid", sizing: "pixel",
    tileW: 300, tileH: 300, dropPartial: true
  });
  assert.deepEqual(p.xs, [300, 300, 300]);
  assert.deepEqual(p.ys, [300]);
});

test("planAspect reproduces the 4:5 crop of the Instagram tool", () => {
  const r = planAspect({ width: 1600, height: 900, cols: 3, rows: 1, ratioW: 4, ratioH: 5 });
  assert.equal(r.crop.w, 1596);
  assert.equal(r.crop.h, 665);
  assert.equal(r.cut.left, 2);
  assert.equal(r.cut.right, 2);
  assert.equal(r.cut.top, 117);
  assert.equal(r.cut.bottom, 118);
  assert.equal(r.pieceW, 532);
  assert.equal(r.pieceH, 665);
  assert.equal(r.pieceW / r.pieceH, 4 / 5);
});

test("planAspect returns null when the image cannot hold one cell", () => {
  assert.equal(planAspect({ width: 40, height: 40, cols: 10, rows: 10 }), null);
});

test("planAspect gives square pieces for a 3x3 grid on a square image", () => {
  const r = planAspect({ width: 1200, height: 1200, cols: 3, rows: 3, ratioW: 4, ratioH: 5 });
  assert.equal(r.crop.w, 960);
  assert.equal(r.crop.h, 1200);
  assert.equal(r.pieceW, 320);
  assert.equal(r.pieceH, 400);
});

test("spriteCss writes one class per frame plus a step-end keyframe block", () => {
  const pieces = planGrid({ width: 192, height: 48, cols: 4, rows: 1 }).pieces;
  const css = spriteCss({ pieces, sheetUrl: "walk.png", prefix: "walk", duration: "800ms" });
  assert.equal((css.match(/@keyframes/g) || []).length, 1);
  assert.equal((css.match(/background-position/g) || []).length, 4 + 5); // 4 classes + 4 steps + 100%
  assert.match(css, /animation: walk-play 800ms step-end infinite;/);
  assert.match(css, /\.walk\.walk-frame-01 \{/);
  assert.match(css, /url\('walk\.png'\)/);
});

test("spriteCss refuses an empty frame list", () => {
  assert.throws(() => spriteCss({ pieces: [] }), /no pieces/);
});
