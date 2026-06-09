#!/usr/bin/env node
/**
 * Parse edge-tts SRT → captions-data.json for Remotion consumption.
 * Usage: node srt-to-captions.mjs assets/narration.srt assets/captions-data.json
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const srtPath = resolve(process.argv[2] || "assets/narration.srt");
const outPath = resolve(process.argv[3] || "assets/captions-data.json");

function toSec(t) {
  const [h, m, rest] = t.trim().split(":");
  const [s, ms] = rest.split(",");
  return parseInt(h, 10) * 3600 + parseInt(m, 10) * 60 + parseInt(s, 10) + parseInt(ms, 10) / 1000;
}

function parseSrt(content) {
  const blocks = content.trim().split(/\n\n+/).filter(Boolean);
  const words = [];
  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length < 3) continue;
    const [start, end] = lines[1].split(" --> ").map(toSec);
    const text = lines.slice(2).join(" ").trim();
    // Split into word-level entries for karaoke
    const tokens = text.split(/(?<=[，。！？、；：\s])|(?=[，。！？、；：\s])/).filter(Boolean);
    const dur = end - start;
    const tokenCount = tokens.length;
    const wordDur = tokenCount > 0 ? dur / tokenCount : dur;
    for (let wi = 0; wi < tokenCount; wi++) {
      const word = tokens[wi].trim();
      if (!word) continue;
      words.push({
        start: start + wi * wordDur,
        end: start + (wi + 1) * wordDur,
        text: word,
      });
    }
  }
  return words;
}

/** TTS script uses spoken brand「AI小儿科」; on-screen captions show the site URL. */
function toDisplayText(text) {
  return text.replace(/AI\s*小儿科/g, "aixiaoerke.com").replace(/\s+/g, " ");
}

const raw = parseSrt(readFileSync(srtPath, "utf8"));
const words = raw.map((w) => ({ ...w, text: toDisplayText(w.text) })).filter((w) => w.text.length > 0);

// Group into caption groups (~4-6 Chinese chars per group for smooth karaoke)
const groups = [];
let currentGroup = { start: 0, end: 0, words: [] };
const MAX_GROUP_CHARS = 8;

for (const word of words) {
  if (word.text.match(/^\s*$/)) {
    if (currentGroup.words.length > 0) {
      groups.push(currentGroup);
      currentGroup = { start: word.end, end: word.end, words: [] };
    }
    continue;
  }
  if (currentGroup.words.length === 0) {
    currentGroup.start = word.start;
  }
  currentGroup.words.push(word);
  currentGroup.end = word.end;
  const totalChars = currentGroup.words.reduce((sum, w) => sum + w.text.length, 0);
  if (totalChars >= MAX_GROUP_CHARS) {
    groups.push(currentGroup);
    currentGroup = { start: word.end, end: word.end, words: [] };
  }
}
if (currentGroup.words.length > 0) {
  groups.push(currentGroup);
}

// Build caption data for Remotion (per-word timing within groups)
const captionData = groups.map((g, gi) => ({
  id: gi,
  start: g.start,
  end: g.end,
  text: g.words.map((w) => w.text).join(""),
  words: g.words.map((w, wi) => ({ idx: wi, start: w.start, end: w.end, text: w.text })),
}));

const json = JSON.stringify(captionData, null, 2);
writeFileSync(outPath, json);

console.log(`Wrote ${captionData.length} caption groups (${words.length} word tokens) → ${outPath}`);
const lastEnd = captionData.length > 0 ? captionData[captionData.length - 1].end : 0;
console.log(`Total duration: ${lastEnd.toFixed(2)}s`);
