# image-grid-kit

Zero-dependency helpers for two jobs that keep showing up when you work with
sprite sheets and tiled images:

1. **Splitting** — work out the exact pixel rectangles when an image is cut
   into rows, columns or a grid, including the case where the pieces have to
   come out at a fixed aspect ratio.
2. **Playback** — turn those rectangles into CSS: one class per frame plus a
   `@keyframes` block that steps through the sheet.

No build step, no dependencies, Node 18+.

## Install

```bash
npm install image-grid-kit
```

or use it straight from a clone:

```bash
node bin/cli.js grid --width 1600 --height 900 --cols 3 --rows 1
```

## Library

```js
import { planGrid, planAspect, spriteCss } from "image-grid-kit";

const { pieces } = planGrid({ width: 1600, height: 900, cols: 3, rows: 1 });
// -> [{ n:1, x:0,    y:0, w:534, h:900 },
//     { n:2, x:534,  y:0, w:533, h:900 },
//     { n:3, x:1067, y:0, w:533, h:900 }]

console.log(spriteCss({ pieces, sheetUrl: "walk.png", prefix: "walk" }));
```

### `planGrid({ width, height, mode, sizing, cols, rows, tileW, tileH })`

`mode` is `grid`, `columns` or `rows`. `sizing` is `count` (number of pieces)
or `pixel` (fixed cell size, with an optional `--dropPartial` to throw the
short remainder away).

When the width does not divide evenly, the first `width % cols` columns get one
extra pixel, so the pieces always add back up to the original width:

```js
planGrid({ width: 1600, height: 900, cols: 3, rows: 1 }).xs; // [534, 533, 533]
```

### `planAspect({ width, height, cols, rows, ratioW, ratioH })`

The largest centre crop whose shape makes every cell of a `cols x rows` grid
come out at exactly `ratioW : ratioH`. For a 3-piece grid at 4:5 on a 1600x900
image:

```js
planAspect({ width: 1600, height: 900, cols: 3, rows: 1, ratioW: 4, ratioH: 5 });
// { crop: { x: 2, y: 117, w: 1596, h: 665 },
//   cut:  { left: 2, right: 2, top: 117, bottom: 118 },
//   pieceW: 532, pieceH: 665 }
```

Returns `null` when the image is too small to hold even one cell at that ratio.

### `spriteCss({ pieces, sheetUrl, prefix, duration, timing, iterations })`

Emits a positioned class per frame, a `@keyframes` block, and an animation
class. `timing` defaults to `step-end`, which is what makes a sprite sheet play
frame by frame instead of sliding between frames:

```css
@keyframes walk-play {
  0%   { background-position: -0px -0px; }
  25%  { background-position: -48px -0px; }
  50%  { background-position: -96px -0px; }
  75%  { background-position: -144px -0px; }
  100% { background-position: -144px -0px; }
}
.walk-anim { animation: walk-play 800ms step-end infinite; }
```

## CLI

```
grid    --width N --height N [--mode grid|columns|rows] [--cols N --rows N]
                             [--sizing count|pixel --tileW N --tileH N] [--dropPartial] [--json]
aspect  --width N --height N --cols N --rows N [--ratio 4:5] [--json]
css     --width N --height N --cols N --rows N [--sheet FILE] [--prefix NAME]
                             [--duration 1s] [--timing step-end] [--iterations infinite]
```

`--json` prints the rectangles as JSON, which is the convenient form if you are
feeding them to an image library such as `sharp` or ImageMagick.

## Why `step-end` and not `steps()`

Both work, they just fail differently. `steps(n)` divides one animation cycle
into n equal slices and needs `background-position` to move linearly across the
whole sheet, which breaks as soon as frames are trimmed or the last row is
partial. `step-end` with explicit percentage keyframes pins every frame to a
known offset, so trimmed frames, ragged last rows and multi-row sheets all work.
The `data/` folder in this repo shows what three other tools actually ship.

## `data/`

- `sprite-sheet-tools-export-formats-2026-09-15.csv` — for each tool that ranked
  for `sprite sheet maker` or `texture packer` on 2026-09-15: what it exports,
  whether a CSS file was actually downloaded, and the literal keyword counts
  inside that file.
- `serp-top10-2026-09-15.csv` — the raw result lists behind that sample.

Read `data/README.md` before quoting any number: it says exactly which cells are
measured and which are "we looked and did not see one".

## Browser version

The same grid and crop math, with a preview and a ZIP download, runs at
[cutmyimage.com](https://cutmyimage.com) if you would rather not open a
terminal.

## Tests

```bash
npm test
```

10 tests, no dependencies, `node --test`.

## Licence

MIT. The CSV files in `data/` are CC0.
