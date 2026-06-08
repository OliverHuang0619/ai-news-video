#!/usr/bin/env node
/**
 * Parse edge-tts SRT → caption-overlay.html (1:1 SRT entries).
 * Usage: node srt-to-captions.mjs assets/narration.srt compositions/caption-overlay.html
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const srtPath = resolve(process.argv[2] || "assets/narration.srt");
const outPath = resolve(process.argv[3] || "compositions/caption-overlay.html");

function toSec(t) {
  const [h, m, rest] = t.trim().split(":");
  const [s, ms] = rest.split(",");
  return (
    parseInt(h, 10) * 3600 +
    parseInt(m, 10) * 60 +
    parseInt(s, 10) +
    parseInt(ms, 10) / 1000
  );
}

function parseSrt(content) {
  return content
    .trim()
    .split(/\n\n+/)
    .map((block) => {
      const lines = block.trim().split("\n");
      if (lines.length < 3) return null;
      const [start, end] = lines[1].split(" --> ").map(toSec);
      const text = lines.slice(2).join(" ").trim();
      return { start, end, text };
    })
    .filter(Boolean);
}

function esc(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const entries = parseSrt(readFileSync(srtPath, "utf8"));

const captionDivs = entries
  .map(
    (e, i) =>
      `  <div class="caption-group" id="cg-${i}">${esc(e.text)}</div>`,
  )
  .join("\n");

const captionsJson = JSON.stringify(
  entries.map((e, i) => ({ id: i, start: e.start, end: e.end })),
);

const html = `<!doctype html>
<html lang="zh">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1920, height=1080" />
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: transparent; }
body { font-family: sans-serif; }

#caption-root {
  position: absolute; inset: 0;
  pointer-events: none;
  z-index: 1;
}

.caption-group {
  position: absolute;
  bottom: 80px;
  left: 0;
  right: 0;
  margin: 0 auto;
  max-width: 1600px;
  width: 90%;
  text-align: center;
  font-size: 32px;
  font-weight: 600;
  line-height: 1.5;
  color: #e8e8f0;
  padding: 12px 28px;
  background: rgba(0, 0, 0, 0.72);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
}

.caption-group.active {
  color: #00d4ff;
}
</style>
</head>
<body>
<div id="caption-root" data-composition-id="captions" data-width="1920" data-height="1080">
${captionDivs}
</div>
<script src="../assets/gsap.min.js"><\/script>
<script>
window.__timelines = window.__timelines || {};
var tl = gsap.timeline({ paused: true });
var CAPTIONS = ${captionsJson};

CAPTIONS.forEach(function (group) {
  var sel = "#cg-" + group.id;
  // Use selectors + tweens/sets only — no tl.add() callbacks (seek render won't run them)
  tl.set(sel, { opacity: 0, visibility: "hidden", y: 8, color: "#e8e8f0" }, 0);
  tl.set(sel, { visibility: "visible" }, group.start);
  tl.fromTo(sel, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.15, ease: "power2.out" }, group.start);
  tl.set(sel, { color: "#00d4ff" }, group.start + 0.05);
  tl.set(sel, { color: "#e8e8f0" }, group.end - 0.2);
  tl.to(sel, { opacity: 0, y: -6, duration: 0.12, ease: "power2.in", overwrite: "auto" }, group.end - 0.12);
  tl.set(sel, { opacity: 0, visibility: "hidden" }, group.end);
});

window.__timelines["captions"] = tl;
<\/script>
</body>
</html>
`;

writeFileSync(outPath, html);
console.log(`Wrote ${entries.length} captions (SRT 1:1) → ${outPath}`);
console.log(`Total duration: ${entries[entries.length - 1].end.toFixed(2)}s`);
