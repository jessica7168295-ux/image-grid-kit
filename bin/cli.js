#!/usr/bin/env node
/**
 * image-grid-kit CLI
 *
 *   node bin/cli.js grid --width 1600 --height 900 --cols 3 --rows 1
 *   node bin/cli.js grid --width 1600 --height 900 --mode columns --cols 3 --json
 *   node bin/cli.js aspect --width 1600 --height 900 --cols 3 --rows 1 --ratio 4:5
 *   node bin/cli.js css --width 192 --height 64 --cols 4 --rows 1 --sheet walk.png --prefix walk
 */
import { planGrid, planAspect, splitFixed } from "../src/grid.js";
import { spriteCss } from "../src/css.js";

const argv = process.argv.slice(2);

function args() {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) { out[key] = true; }
    else { out[key] = next; i++; }
  }
  return out;
}

function num(v, dflt) {
  const n = Number(v);
  return Number.isFinite(n) ? n : dflt;
}

function help() {
  console.log(`image-grid-kit

  grid    --width N --height N [--mode grid|columns|rows] [--cols N --rows N]
                               [--sizing count|pixel --tileW N --tileH N] [--dropPartial] [--json]
  aspect  --width N --height N --cols N --rows N [--ratio 4:5] [--json]
  css     --width N --height N --cols N --rows N [--sheet FILE] [--prefix NAME]
                               [--duration 1s] [--timing step-end] [--iterations infinite]
`);
}

const cmd = argv[0];
const a = args();

if (!cmd || cmd === "help" || cmd === "--help" || cmd === "-h") { help(); process.exit(0); }

if (cmd === "grid") {
  const res = planGrid({
    width: num(a.width, 0),
    height: num(a.height, 0),
    mode: a.mode || "grid",
    sizing: a.sizing || "count",
    cols: num(a.cols, 3),
    rows: num(a.rows, 3),
    tileW: num(a.tileW, 500),
    tileH: num(a.tileH, 500),
    dropPartial: !!a.dropPartial
  });
  if (a.json) { console.log(JSON.stringify(res, null, 2)); }
  else {
    console.log("xs: " + res.xs.join(", "));
    console.log("ys: " + res.ys.join(", "));
    res.pieces.forEach((p) => {
      console.log(String(p.n).padStart(3) + "  x=" + p.x + " y=" + p.y + " w=" + p.w + " h=" + p.h);
    });
  }
} else if (cmd === "aspect") {
  const ratio = String(a.ratio || "4:5").split(":");
  const res = planAspect({
    width: num(a.width, 0),
    height: num(a.height, 0),
    cols: num(a.cols, 3),
    rows: num(a.rows, 1),
    ratioW: num(ratio[0], 4),
    ratioH: num(ratio[1], 5)
  });
  if (!res) {
    console.log("image too small for a single cell at that ratio");
    process.exit(1);
  }
  if (a.json) { console.log(JSON.stringify(res, null, 2)); }
  else {
    console.log("crop: " + res.crop.w + " x " + res.crop.h + " at (" + res.crop.x + "," + res.crop.y + ")");
    console.log("cut:  left " + res.cut.left + "  right " + res.cut.right +
                "  top " + res.cut.top + "  bottom " + res.cut.bottom);
    console.log("each piece: " + res.pieceW + " x " + res.pieceH);
  }
} else if (cmd === "css") {
  const res = planGrid({
    width: num(a.width, 0),
    height: num(a.height, 0),
    mode: "grid",
    sizing: "count",
    cols: num(a.cols, 4),
    rows: num(a.rows, 1)
  });
  process.stdout.write(spriteCss({
    pieces: res.pieces,
    sheetUrl: a.sheet || "spritesheet.png",
    prefix: a.prefix || "sprite",
    duration: a.duration || "1s",
    timing: a.timing || "step-end",
    iterations: a.iterations || "infinite"
  }));
} else {
  help();
  process.exit(1);
}
