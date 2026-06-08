#!/usr/bin/env node
/**
 * extract-key-points.mjs — Extract 3 key points from article details
 *
 * Reads article details markdown (output of fetch-detail.mjs), strips out
 * the empty key-point template, and outputs a clean analysis structure
 * ready for the agent to fill during narration writing.
 *
 * Usage:
 *   node scripts/extract-key-points.mjs --input .hyperframes/article-details.md
 *   node scripts/extract-key-points.mjs --input .hyperframes/article-details.md \
 *     --output .hyperframes/key-points.md
 *   node scripts/extract-key-points.mjs --input .hyperframes/article-details.md \
 *     --fill    # interactive: agent fills key points after reading each article
 *   node scripts/extract-key-points.mjs --input .hyperframes/article-details.md \
 *     --script  # also emit a narration script skeleton per article
 *
 * The agent (Codex) reads the `## 全文内容` field for each article, analyzes
 * it, and fills in 3 key points before writing the narration script.
 */

const fs = await import("fs");
const path = await import("path");

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { input: null, output: null, fill: false, script: false };
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--input":
        opts.input = args[++i];
        break;
      case "--output":
        opts.output = args[++i];
        break;
      case "--fill":
        opts.fill = true;
        break;
      case "--script":
        opts.script = true;
        break;
      case "--help":
        const help = fs.readFileSync(process.argv[1], "utf8");
        console.log(help.split("\n").slice(2, 17).join("\n"));
        process.exit(0);
    }
  }
  return opts;
}

/**
 * Parse article details markdown into structured article objects.
 * Expects format: ## Title \n - ID: \n - 分类: \n ... ### 全文内容 \n body \n ---
 */
function parseArticles(md) {
  const articles = [];
  const lines = md.split("\n");
  let current = null;
  let inBody = false;
  let bodyLines = [];

  for (const line of lines) {
    const titleMatch = line.match(/^## (.+?)(?:\s*\{#[^}]+\})?\s*$/);
    if (titleMatch) {
      if (current) {
        current.body = bodyLines.join("\n").trim();
        articles.push(current);
      }
      current = { title: titleMatch[1], id: null, category: null, source: null, body: "" };
      bodyLines = [];
      inBody = false;
      continue;
    }
    if (!current) continue;

    const idMatch = line.match(/- \*\*ID\*\*: (\d+)/);
    if (idMatch) { current.id = parseInt(idMatch[1], 10); continue; }

    const catMatch = line.match(/- \*\*分类\*\*: `(.+?)`/);
    if (catMatch) { current.category = catMatch[1]; continue; }

    const srcMatch = line.match(/- \*\*来源\*\*: (.+)/);
    if (srcMatch) { current.source = srcMatch[1]; continue; }

    if (line.trim() === "### 全文内容") {
      bodyLines = [];
      inBody = true;
      continue;
    }

    // Stop collecting body at --- or next heading section
    if (inBody) {
      if (line.startsWith("---") || line.startsWith("### ")) {
        if (line.startsWith("### ")) inBody = false;
        continue;
      }
      bodyLines.push(line);
    }
  }

  if (current) {
    current.body = bodyLines.join("\n").trim();
    articles.push(current);
  }

  return articles;
}

/**
 * Generate analysis prompt for each article.
 */
function generateAnalysisBlock(article, withNarrationSkeleton) {
  const charCount = article.body.replace(/\s/g, "").length;
  const lines = [];
  lines.push(`## ${article.title}`);
  lines.push("");
  lines.push(`- **ID**: ${article.id}  |  **分类**: \`${article.category}\``);
  lines.push(`- **字数**: ~${charCount} 字`);
  lines.push("");

  lines.push("### 全文内容\n");
  lines.push(article.body);
  lines.push("");

  lines.push("### 分析指引\n");
  lines.push("阅读以上全文，提取以下3个关键信息点：");
  lines.push("");
  lines.push("| 要点 | 描述 | 示例方向 |");
  lines.push("|------|------|----------|");
  lines.push("| **要点1: 核心事实** | 本条新闻最核心的发生了什么 | 谁 + 做了什么 + 时间/地点 |");
  lines.push("| **要点2: 关键数据/影响** | 具体的数据、数字、影响范围 | 金额/百分比/用户数/效果 |");
  lines.push("| **要点3: 行业意义** | 这件事为什么重要，对行业/用户的影响 | 趋势/变革/未来展望 |");
  lines.push("");

  if (withNarrationSkeleton) {
    lines.push("### 讲解草稿\n");
    lines.push("<!--");
    lines.push("基于3个要点编写15-25秒的口播讲解稿：");
    lines.push("第一条消息，[文章标题]。");
    lines.push("其一，[要点1: 核心事实]；");
    lines.push("其二，[要点2: 关键数据]；");
    lines.push("其三，[要点3: 行业意义]。");
    lines.push("-->");
    lines.push("");
  }

  lines.push("### 关键信息提炼\n");
  lines.push("<!-- AGENT: 阅读全文后填写以下3点，每点控制在20字以内 -->");
  lines.push("1. ");
  lines.push("2. ");
  lines.push("3. ");
  lines.push("");
  lines.push("---");
  lines.push("");
  return lines.join("\n");
}

const opts = parseArgs();
if (!opts.input) {
  console.error("Usage: node scripts/extract-key-points.mjs --input <article-details.md> [--output FILE] [--fill] [--script]");
  console.error("  --input FILE    Article details markdown from fetch-detail.mjs (required)");
  console.error("  --output FILE   Write analysis output to file");
  console.error("  --script        Include narration script skeleton per article");
  process.exit(1);
}

const md = fs.readFileSync(path.resolve(opts.input), "utf8");
const articles = parseArticles(md);

const outputLines = [
  "# Key Points Analysis — AI News",
  "",
  `> ${articles.length} articles analyzed for 3-point extraction`,
  `> Instructions: Read each article's "全文内容", extract 3 key points,`,
  `> then use them to write the narration script in .hyperframes/script.txt`,
  "",
];

for (const article of articles) {
  outputLines.push(generateAnalysisBlock(article, opts.script));
}

const output = outputLines.join("\n");

if (opts.output) {
  fs.writeFileSync(path.resolve(opts.output), output, "utf8");
  console.log(`Written ${articles.length} article analyses → ${opts.output}`);
  console.log("");
  console.log("NEXT STEP: Read each article's '全文内容', fill in the 3 key points,");
  console.log("then write narration script in .hyperframes/script.txt");
} else {
  console.log(output);
}
