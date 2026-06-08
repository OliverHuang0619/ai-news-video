#!/usr/bin/env node
/**
 * fetch-news.mjs — Fetch AI news from aixiaoerke.com API
 *
 * Fetches latest articles and outputs structured markdown suitable for
 * video script planning.
 *
 * Usage:
 *   node scripts/fetch-news.mjs                             # latest 10
 *   node scripts/fetch-news.mjs --size 5                    # latest 5
 *   node scripts/fetch-news.mjs --page 2 --size 20          # page 2
 *   node scripts/fetch-news.mjs --output latest.md          # save to file
 *   node scripts/fetch-news.mjs --json                      # also raw JSON
 */

const BASE_URL = "https://aixiaoerke.com/api/news";
const fs = await import("fs");

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { page: 1, size: 10, output: null, json: false };
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--page": case "--size":
        opts[args[i].slice(2)] = parseInt(args[++i], 10);
        break;
      case "--output": opts.output = args[++i]; break;
      case "--json":   opts.json = true; break;
      case "--help": {
        const help = fs.readFileSync(process.argv[1], "utf8");
        console.log(help.split("\n").slice(2, 13).join("\n"));
        process.exit(0);
      }
    }
  }
  return opts;
}

async function fetchNews(page, size) {
  const resp = await fetch(`${BASE_URL}?page=${page}&size=${size}`, {
    headers: { Accept: "application/json" },
  });
  if (!resp.ok) throw new Error(`API returned ${resp.status}`);
  const body = await resp.json();
  if (body.code !== 200) throw new Error(`API error: ${body.message}`);
  return body.data;
}

function fmtDate(iso) {
  const d = new Date(iso);
  const f = (n, w = 2) => String(n).padStart(w, "0");
  return `${d.getFullYear()}-${f(d.getMonth()+1)}-${f(d.getDate())} ${f(d.getHours())}:${f(d.getMinutes())}`;
}

function ellipsis(text, max) {
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

function toMarkdown(data) {
  const lines = [`# AI News — Page ${data.page} (${data.total} total)`, ""];
  const start = (data.page - 1) * data.size + 1;
  const end = Math.min(data.page * data.size, data.total);
  lines.push(`> 共 ${data.total} 篇，当前显示第 ${start}-${end} 篇`);
  lines.push("");
  for (const a of data.list) {
    lines.push(`## ${a.title}`, "");
    lines.push(`- **时间**: ${fmtDate(a.publish_time)}`);
    lines.push(`- **分类**: \`${a.category}\``);
    lines.push(`- **来源**: ${a.source}`);
    lines.push("", ellipsis(a.summary, 300), "", "---", "");
  }
  return lines.join("\n");
}

const opts = parseArgs();
const data = await fetchNews(opts.page, opts.size);
if (opts.json) console.log(JSON.stringify(data, null, 2));
const md = toMarkdown(data);
if (opts.output) {
  fs.writeFileSync(opts.output, md, "utf8");
  console.log(`Written to ${opts.output}`);
} else {
  console.log(md);
}
