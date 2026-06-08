#!/usr/bin/env node
/**
 * fetch-detail.mjs — Fetch full article detail from aixiaoerke.com API
 *
 * Fetches the full summary/content for individual articles by ID.
 * Outputs structured markdown with the complete article body for
 * key-point extraction.
 *
 * Usage:
 *   node scripts/fetch-detail.mjs --ids 826,827,828
 *   node scripts/fetch-detail.mjs --ids 826,827,828 --output .hyperframes/article-details.md
 *   node scripts/fetch-detail.mjs --json   # also emit raw JSON per article
 *
 * Output: structured markdown per article with full summary.
 */

const BASE_URL = "https://aixiaoerke.com/api/news";
const fs = await import("fs");

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { ids: [], output: null, json: false };
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--ids":
        opts.ids = (args[++i] || "")
          .split(",")
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !isNaN(n));
        break;
      case "--output":
        opts.output = args[++i];
        break;
      case "--json":
        opts.json = true;
        break;
      case "--help": {
        const help = fs.readFileSync(process.argv[1], "utf8");
        console.log(
          help.split("\n").slice(2, 14).join("\n"),
        );
        process.exit(0);
      }
    }
  }
  return opts;
}

async function fetchArticle(id) {
  const resp = await fetch(`${BASE_URL}/${id}`, {
    headers: { Accept: "application/json" },
  });
  if (!resp.ok)
    throw new Error(`API returned ${resp.status} for article ${id}`);
  const body = await resp.json();
  if (body.code !== 200)
    throw new Error(`API error for article ${id}: ${body.message}`);
  return body.data;
}

function fmtDate(iso) {
  const d = new Date(iso);
  const f = (n, w) => String(n).padStart(w || 2, "0");
  return `${d.getFullYear()}-${f(d.getMonth() + 1)}-${f(d.getDate())}`;
}

function toMarkdown(articles) {
  const lines = ["# Article Details — Deep Dive Content", ""];
  lines.push(`> ${articles.length} articles, fetched ${fmtDate(new Date().toISOString())}`);
  lines.push("");
  for (const a of articles) {
    lines.push(`## ${a.title}`, "");
    lines.push(`- **ID**: ${a.id}`);
    lines.push(`- **分类**: \`${a.category}\``);
    lines.push(`- **来源**: ${a.source}`);
    lines.push(`- **时间**: ${fmtDate(a.publish_time)}`);
    lines.push("");

    // Full summary as article body
    lines.push("### 全文内容\n");
    lines.push(a.summary);
    lines.push("");

    // Word count hint
    const charCount = a.summary.replace(/\s/g, "").length;
    lines.push(`> 字数: ~${charCount} 字`);
    lines.push("");
    lines.push("---", "");
  }
  return lines.join("\n");
}

function toMarkdownWithKeyPointTemplate(articles) {
  const lines = ["# Article Details — Ready for Key Point Extraction", ""];
  lines.push(
    `> ${articles.length} articles, fetched ${fmtDate(new Date().toISOString())}`,
  );
  lines.push("");
  for (const a of articles) {
    lines.push(`## ${a.title}`, "");
    lines.push(`- **ID**: ${a.id}`);
    lines.push(`- **分类**: \`${a.category}\``);
    lines.push(`- **来源**: ${a.source}`);
    lines.push("");
    lines.push("### 全文内容\n");
    lines.push(a.summary);
    lines.push("");

    const charCount = a.summary.replace(/\s/g, "").length;
    lines.push(`> 字数: ~${charCount} 字`);
    lines.push("");

    // Key point extraction template
    lines.push("### 关键信息提炼（3点）\n");
    lines.push("<!--");
    lines.push("从以上全文内容中提炼出3个核心信息点，用于视频讲解：");
    lines.push("1. [要点1: 最核心的新闻事实]");
    lines.push("2. [要点2: 关键数据或具体影响]");
    lines.push("3. [要点3: 行业意义或未来展望]");
    lines.push("-->");
    lines.push("- **要点1**: ");
    lines.push("- **要点2**: ");
    lines.push("- **要点3**: ");
    lines.push("");
    lines.push("---", "");
  }
  return lines.join("\n");
}

const opts = parseArgs();

if (!opts.ids || opts.ids.length === 0) {
  console.error("Usage: node scripts/fetch-detail.mjs --ids 826,827,828");
  console.error("  --ids ID,ID,...   Article IDs to fetch (required)");
  console.error("  --output FILE     Write markdown to file");
  console.error("  --json            Also emit raw JSON to stderr");
  process.exit(1);
}

const articles = [];
for (const id of opts.ids) {
  process.stderr.write(`Fetching article ${id}...\n`);
  const article = await fetchArticle(id);
  articles.push(article);
}

if (opts.json) {
  process.stderr.write("--- RAW JSON ---\n");
  process.stderr.write(JSON.stringify(articles, null, 2) + "\n");
}

const md = toMarkdownWithKeyPointTemplate(articles);
if (opts.output) {
  fs.writeFileSync(opts.output, md, "utf8");
  console.log(`Written ${articles.length} article details → ${opts.output}`);
} else {
  console.log(md);
}
