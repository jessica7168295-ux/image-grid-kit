/**
 * image-grid-kit — grid math.
 *
 * These two functions mirror the behaviour of the browser tool at
 * https://cutmyimage.com so that a script and the web page agree on where
 * the cut lines fall.
 */

/**
 * Split `total` pixels into `n` integer parts. The first `total % n` parts
 * get one extra pixel, so the parts always sum back to `total`.
 *
 * splitEven(900, 3) -> [300, 300, 300]
 * splitEven(1600, 3) -> [534, 533, 533]
 */
export function splitEven(total, n) {
  const t = Math.floor(total);
  const count = Math.floor(n);
  if (!(t > 0) || !(count > 0)) return [];
  const base = Math.floor(t / count);
  const rem = t % count;
  const out = [];
  for (let i = 0; i < count; i++) out.push(base + (i < rem ? 1 : 0));
  return out;
}

/**
 * Split `total` pixels into parts of at most `step` pixels. The last part is
 * the remainder and may be shorter.
 *
 * splitFixed(1000, 300) -> [300, 300, 300, 100]
 */
export function splitFixed(total, step) {
  const t = Math.floor(total);
  const s = Math.floor(step);
  if (!(t > 0) || !(s > 0)) return [];
  const out = [];
  let left = t;
  while (left > 0) {
    const part = Math.min(s, left);
    out.push(part);
    left -= part;
  }
  return out.length ? out : [t];
}

/**
 * Lay a grid over an image and return one rectangle per piece.
 *
 * @param {object} o
 * @param {number} o.width   image width in px
 * @param {number} o.height  image height in px
 * @param {'grid'|'columns'|'rows'} [o.mode]
 * @param {'count'|'pixel'} [o.sizing]  'count' = number of pieces, 'pixel' = fixed cell size
 * @param {number} [o.cols]
 * @param {number} [o.rows]
 * @param {number} [o.tileW]  used when sizing === 'pixel'
 * @param {number} [o.tileH]  used when sizing === 'pixel'
 * @param {boolean} [o.dropPartial]  with sizing 'pixel': drop the short remainder piece
 * @returns {{xs:number[], ys:number[], pieces:Array<{n:number,x:number,y:number,w:number,h:number}>}}
 */
export function planGrid(o) {
  const width = Math.floor(o.width);
  const height = Math.floor(o.height);
  const mode = o.mode || "grid";
  const sizing = o.sizing || "count";
  let xs, ys;

  if (sizing === "count") {
    const cols = Math.max(1, Math.floor(o.cols || 1));
    const rows = Math.max(1, Math.floor(o.rows || 1));
    if (mode === "columns") { xs = splitEven(width, cols); ys = [height]; }
    else if (mode === "rows") { xs = [width]; ys = splitEven(height, rows); }
    else { xs = splitEven(width, cols); ys = splitEven(height, rows); }
  } else {
    const tileW = Math.max(1, Math.floor(o.tileW || 1));
    const tileH = Math.max(1, Math.floor(o.tileH || 1));
    if (mode === "columns") { xs = splitFixed(width, tileW); ys = [height]; }
    else if (mode === "rows") { xs = [width]; ys = splitFixed(height, tileH); }
    else { xs = splitFixed(width, tileW); ys = splitFixed(height, tileH); }
    if (o.dropPartial) {
      if (mode !== "rows") xs = xs.filter((v, i) => !(i === xs.length - 1 && v < tileW));
      if (mode !== "columns") ys = ys.filter((v, i) => !(i === ys.length - 1 && v < tileH));
    }
  }

  const pieces = [];
  let n = 0;
  let y = 0;
  for (let r = 0; r < ys.length; r++) {
    let x = 0;
    for (let c = 0; c < xs.length; c++) {
      n += 1;
      pieces.push({ n, x, y, w: xs[c], h: ys[r] });
      x += xs[c];
    }
    y += ys[r];
  }
  return { xs, ys, pieces };
}

/**
 * Plan the largest centre crop of `width` x `height` whose aspect ratio is
 * exactly (ratioW x cols) : (ratioH x rows), so that every piece of the
 * `cols` x `rows` grid comes out at exactly ratioW : ratioH.
 *
 * This is how the 4:5 (1080 x 1350) mode works on the Instagram page:
 * planAspect({width:1600, height:900, rows:1, cols:3, ratioW:4, ratioH:5})
 *   -> crop 1596 x 665, 4 px cut left and right, 235 px cut top and bottom,
 *      each piece 532 x 665.
 *
 * @returns {null|object} null when the image is too small for even one cell
 */
export function planAspect(o) {
  const w = Math.floor(o.width);
  const h = Math.floor(o.height);
  const rows = Math.max(1, Math.floor(o.rows || 1));
  const cols = Math.max(1, Math.floor(o.cols || 1));
  const rw = Math.floor(o.ratioW || 4);
  const rh = Math.floor(o.ratioH || 5);
  const aw = rw * cols;
  const ah = rh * rows;
  const k = Math.floor(Math.min(w / aw, h / ah));
  if (!(k >= 1)) return null;
  const cw = aw * k;
  const ch = ah * k;
  const sx = Math.floor((w - cw) / 2);
  const sy = Math.floor((h - ch) / 2);
  return {
    crop: { x: sx, y: sy, w: cw, h: ch },
    cut: { left: sx, right: w - cw - sx, top: sy, bottom: h - ch - sy },
    pieceW: rw * k,
    pieceH: rh * k
  };
}
