# Data in this folder

Two small CSV files, both produced by hand on 2026-09-15. Read this before
quoting any number from them.

## How the numbers were produced

- Browser: a normal desktop Chrome (Windows 11), driven over the DevTools
  protocol. Not a headless crawler.
- Search results: `google.com/search?num=20&hl=en&gl=us`, one snapshot per
  keyword, taken 2026-09-15 around 16:20 GMT+8. Rank in the CSV is the order
  the `<h3>` headings appeared in the page source.
- Tool exports: four 64x64 PNG frames were uploaded to each tool that accepts
  files. Where a CSS export existed, the download was clicked for real and the
  file that landed on disk was opened and counted.
- Counts (`at_keyframes`, `animation`, `steps_open`, `background_position`) are
  literal substring counts inside the downloaded `.css` text. Nothing was
  parsed or interpreted.

## What is verified and what is not

- `css_export = yes` and a `css_bytes` value: a file was really downloaded and
  counted. Verified.
- `css_export = unknown`: the tool was opened, but no CSS option was seen. This
  is an absence of evidence, not evidence of absence. Do not read it as "this
  tool has no CSS export".
- `export_formats_observed = not observed`: the page gave nothing to read. Same
  caveat.
- `steps_open` counts the literal string `steps(`. A tool can animate a sprite
  sheet with `step-end` instead, which this column does not count. The
  cutmyimage.com row shows exactly that: `steps_open` 0 but `animation` 3.

## Known limits

- One snapshot, one location setting, one day. Search results move.
- The 14 tool rows come from the two result pages above, so they are a sample
  of what ranked that day, not a census of every sprite sheet tool.
- `texture packer` returned 10 headings, but number 2 is a Google Play app
  block, not a web page. Natural web results for that keyword: 9. Three of
  those 9 are sub-pages of codeandweb.com, so distinct hosts: 7.
- `sprite sheet maker` returned 10 headings, all natural web results, 10
  distinct hosts.

## Licence

The CSV files are released under CC0. Quote them freely, ideally with the date.
