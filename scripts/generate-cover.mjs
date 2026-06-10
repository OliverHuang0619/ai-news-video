#!/usr/bin/env node
/**
 * @ai-news-video
 * generate-cover.mjs — Generate video cover image & scene HTML
 *
 * Reads .hyperframes/key-points.md for article data, optionally reads
 * design.md for palette overrides. Two output modes:
 *   (default) Generate cover PNG via playwright-cli screenshot
 *   --scene   Generate a self-contained scene div for video composition
 *
 * Usage:
 *   node scripts/generate-cover.mjs                                   # PNG
 *   node scripts/generate-cover.mjs --scene                           # Scene HTML
 *   node scripts/generate-cover.mjs --scene --output assets/cover-scene.html
 *
 * Defaults:
 *   --key-points  .hyperframes/key-points.md
 *   --design      design.md (optional; uses palette defaults if not found)
 *   --output      assets/cover.png (or assets/cover-scene.html with --scene)
 *   --date        auto-detected from article publish_time or falls back to today
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname, join, basename } from 'path';
import { execSync, spawn } from 'child_process';
import { homedir } from 'os';

// ─── Palette defaults (matching design-template.md) ────────────────────
const DEFAULT_PALETTE = {
  background: '#0a0a1a',
  backgroundAlt: '#12122a',
  surfaceLight: 'rgba(255,255,255,0.06)',
  surfaceMed: 'rgba(255,255,255,0.04)',
  primaryText: '#ffffff',
  summaryText: '#b0b0cc',
  accent: '#00d4ff',
  accentPurple: '#7c3aed',
  accentEmerald: '#10b981',
  accentAmber: '#f59e0b',
  accentRose: '#f43f5e',
  captionShadow: 'rgba(0,0,0,0.8)',
};

const LABEL_COLORS = {
  product: '#00d4ff',
  industry: '#10b981',
  policy: '#f59e0b',
  research: '#7c3aed',
  data: '#f43f5e',
};

function categoryLabel(cat) {
  const map = {
    product: '产品', industry: '行业', policy: '政策',
    research: '研究', data: '数据', company: '公司', tool: '工具',
  };
  return map[cat] || cat || '资讯';
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── CLI args ────────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    keyPoints: resolve('.hyperframes/key-points.md'),
    design: 'design.md',
    output: null,
    date: null,
    noScreenshot: false,
    sceneHtml: false,
    help: false,
  };
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--key-points': opts.keyPoints = resolve(args[++i]); break;
      case '--design':     opts.design = resolve(args[++i]); break;
      case '--output':     opts.output = resolve(args[++i]); break;
      case '--date':       opts.date = args[++i]; break;
      case '--no-screenshot': opts.noScreenshot = true; break;
      case '--scene':      opts.sceneHtml = true; break;
      case '--help':
      case '-h':           opts.help = true; break;
    }
  }
  if (!opts.output) {
    opts.output = opts.sceneHtml ? resolve('assets/cover-scene.html') : resolve('assets/cover.png');
  }
  return opts;
}

// ─── Parse key-points.md ─────────────────────────────────────────────
function parseKeyPoints(filePath) {
  if (!existsSync(filePath)) {
    console.error(`❌ key-points file not found: ${filePath}`);
    process.exit(1);
  }
  const md = readFileSync(filePath, 'utf8');
  const articles = [];
  const lines = md.split('\n');
  let current = null;

  for (const line of lines) {
    const titleMatch = line.match(/^## (.+?)(?:\s*\{#[^}]+\})?\s*$/);
    if (titleMatch) {
      if (current) articles.push(current);
      current = { title: titleMatch[1].trim(), id: null, category: null, keyPoints: [], pubTime: null };
      continue;
    }
    if (!current) continue;

    const idMatch = line.match(/- \*\*ID\*\*: (\d+)/);
    if (idMatch) { current.id = parseInt(idMatch[1], 10); }

    const catMatch = line.match(/\*\*分类\*\*: `(.+?)`/);
    if (catMatch) { current.category = catMatch[1]; }

    const timeMatch = line.match(/publish_time["': ]+([\d-]+)/) || line.match(/- \*\*时间\*\*: (.+)/);
    if (timeMatch) { current.pubTime = timeMatch[1].trim(); }
  }
  if (current) articles.push(current);
  return articles;
}

// ─── Read design.md colors ───────────────────────────────────────────
function readPalette(designPath) {
  if (!designPath || !existsSync(designPath)) return { ...DEFAULT_PALETTE };
  const md = readFileSync(designPath, 'utf8');
  const p = { ...DEFAULT_PALETTE };
  const named = {
    Background: 'background',
    'Background alt': 'backgroundAlt',
    'Surface light': 'surfaceLight',
    'Surface med': 'surfaceMed',
    'Primary text': 'primaryText',
    'Summary text': 'summaryText',
    'Accent (cyan)': 'accent',
    'Accent (purple)': 'accentPurple',
    'Accent (emerald)': 'accentEmerald',
    'Accent (amber)': 'accentAmber',
    'Accent (rose)': 'accentRose',
    'Caption shadow': 'captionShadow',
  };
  for (const [label, key] of Object.entries(named)) {
    const re = new RegExp(`\\|\\s*${label}\\s*\\|\\s*\`(#.+?)\``);
    const m = md.match(re);
    if (m) p[key] = m[1];
  }
  return p;
}

// ─── Generate cover PNG HTML ─────────────────────────────────────────
function generateCoverHTML(articles, palette, dateStr) {
  const items = articles.map((a, i) => {
    const num = String(i + 1).padStart(2, '0');
    const cat = a.category || 'news';
    const catLabel = categoryLabel(cat);
    const accentColor = LABEL_COLORS[cat] || palette.accent;
    return `
    <div class="article-item" style="--accent: ${accentColor};">
      <div class="item-left">
        <span class="item-num" style="color: ${accentColor};">${num}</span>
        <div class="accent-bar" style="background: linear-gradient(to bottom, ${accentColor}, ${palette.accentPurple});"></div>
      </div>
      <div class="item-body">
        <span class="item-title">${escapeHtml(a.title)}</span>
        <span class="item-cat" style="color: ${accentColor};">${catLabel}</span>
      </div>
    </div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=1920, height=1080">
<title>AI 资讯速递 — 封面</title>
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: 1920px; height: 1080px; overflow: hidden;
    background: ${palette.background};
    font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif;
    color: ${palette.primaryText};
  }
  body {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    position: relative;
  }
  .bg-grid { position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.03)1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03)1px,transparent 1px);background-size:48px 48px;z-index:0; }
  .bg-glow { position:absolute;top:50%;left:50%;width:960px;height:600px;transform:translate(-50%,-50%);background:radial-gradient(ellipse,${palette.accent}08 0%,${palette.accentPurple}04 40%,transparent 70%);z-index:1;pointer-events:none; }
  .cover-content { position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;width:1400px;max-height:1000px;padding:60px 40px; }
  .cover-header { text-align:center;margin-bottom:36px; }
  .cover-title { font-size:52px;font-weight:800;color:${palette.primaryText};letter-spacing:6px;text-shadow:0 0 60px ${palette.accent}30;line-height:1.2; }
  .cover-date { font-size:20px;font-weight:400;color:${palette.summaryText};margin-top:10px;letter-spacing:2px; }
  .cover-divider { width:200px;height:2px;background:linear-gradient(90deg,transparent,${palette.accent}60,${palette.accentPurple}60,transparent);margin:20px auto 0; }
  .article-list { width:100%;display:flex;flex-direction:column;gap:10px;max-width:1200px; }
  .article-item { display:flex;align-items:stretch;gap:16px;padding:14px 20px;border-radius:8px;background:${palette.surfaceLight};backdrop-filter:blur(4px); }
  .item-left { display:flex;align-items:center;gap:14px;flex-shrink:0; }
  .item-num { font-size:22px;font-weight:700;min-width:32px;text-align:center; }
  .accent-bar { width:3px;height:32px;border-radius:2px;flex-shrink:0; }
  .item-body { display:flex;flex-direction:column;justify-content:center;min-width:0;gap:4px; }
  .item-title { font-size:26px;font-weight:600;color:${palette.primaryText};line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
  .item-cat { font-size:12px;font-weight:500;letter-spacing:1px;text-transform:uppercase;opacity:0.7; }
  .cover-footer { text-align:center;margin-top:28px; }
  .footer-divider { width:320px;height:1px;background:linear-gradient(90deg,transparent,${palette.summaryText}40,transparent);margin:0 auto 14px; }
  .footer-domain { font-size:15px;font-weight:500;color:${palette.summaryText};letter-spacing:3px; }
  .footer-accent { color:${palette.accent};font-weight:600; }
</style>
</head>
<body>
  <div class="bg-grid"></div>
  <div class="bg-glow"></div>
  <div class="cover-content">
    <div class="cover-header">
      <div class="cover-title">AI 资讯速递</div>
      <div class="cover-date">${escapeHtml(dateStr)} · ${articles.length} 条速览</div>
      <div class="cover-divider"></div>
    </div>
    <div class="article-list">${items}</div>
    <div class="cover-footer">
      <div class="footer-divider"></div>
      <div class="footer-domain"><span class="footer-accent">aixiaoerke</span>.com</div>
    </div>
  </div>
</body>
</html>`;
}

// ─── Generate cover scene HTML for video composition ────────────────
function generateSceneHTML(articles, palette, dateStr, sceneId, sceneStart, sceneDur) {
  const items = articles.map((a, i) => {
    const num = String(i + 1).padStart(2, '0');
    const cat = a.category || 'news';
    const catLabel = categoryLabel(cat);
    const accentColor = LABEL_COLORS[cat] || palette.accent;
    return `
    <div class="cv-item" style="display:flex;align-items:stretch;gap:12px;padding:10px 16px;border-radius:8px;background:rgba(255,255,255,0.05);">
      <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
        <span style="font-size:18px;font-weight:700;min-width:28px;text-align:center;color:${accentColor};">${num}</span>
        <div style="width:3px;height:26px;border-radius:2px;flex-shrink:0;background:linear-gradient(to bottom,${accentColor},${palette.accentPurple});"></div>
      </div>
      <div style="display:flex;flex-direction:column;justify-content:center;gap:2px;min-width:0;flex:1;">
        <span style="font-size:22px;font-weight:600;color:${palette.primaryText};line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(a.title)}</span>
        <span style="font-size:10px;font-weight:500;color:${accentColor};opacity:0.7;letter-spacing:1px;">${catLabel}</span>
      </div>
    </div>`;
  }).join('\n');

  return `\
<!-- Scene: Cover — all ${articles.length} news items overview (auto-generated) -->
<div id="s${sceneId}-cover" class="clip scene" data-track-index="1" data-start="${sceneStart}" data-duration="${sceneDur}" style="position:absolute;inset:0;background:${palette.background};z-index:1;overflow:hidden;">
<div class="deco-grid" style="position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px);background-size:48px 48px;z-index:2;"></div>
<div id="s${sceneId}-cover-glow" class="deco-glow" style="position:absolute;top:50%;left:50%;width:800px;height:500px;transform:translate(-50%,-50%);background:radial-gradient(ellipse,${palette.accent}10 0%,${palette.accentPurple}08 40%,transparent 70%);z-index:3;pointer-events:none;"></div>
<div id="s${sceneId}-cover-content" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 80px;overflow:hidden;z-index:5;font-family:sans-serif;">
  <div id="s${sceneId}-cover-header" style="text-align:center;margin-bottom:24px;">
    <div id="s${sceneId}-cover-brand" style="font-size:44px;font-weight:800;color:#ffffff;letter-spacing:6px;text-shadow:0 0 60px ${palette.accent}40;line-height:1.2;">AI 资讯速递</div>
    <div id="s${sceneId}-cover-date" style="font-size:16px;font-weight:400;color:#b0b0cc;margin-top:6px;letter-spacing:2px;">${escapeHtml(dateStr)} · ${articles.length} 条速览</div>
    <div style="width:140px;height:2px;background:linear-gradient(90deg,transparent,${palette.accent}70,${palette.accentPurple}60,transparent);margin:12px auto 0;"></div>
  </div>
  <div id="s${sceneId}-cover-items" style="width:100%;max-width:1050px;display:flex;flex-direction:column;gap:6px;">
    ${items}
  </div>
  <div id="s${sceneId}-cover-footer" style="text-align:center;margin-top:18px;">
    <div style="width:240px;height:1px;background:linear-gradient(90deg,transparent,rgba(176,176,204,0.25),transparent);margin:0 auto 10px;"></div>
    <div style="font-size:13px;font-weight:500;color:#b0b0cc;letter-spacing:3px;"><span style="color:${palette.accent};font-weight:600;">aixiaoerke</span>.com</div>
  </div>
</div>
</div>`;
}

// ─── Screenshot via playwright-cli ────────────────────────────────────
function screenshotViaPlaywright(htmlPath, outputPath) {
  const pwcli = join(homedir(), '.codex/skills/playwright/scripts/playwright_cli.sh');
  if (!existsSync(pwcli)) {
    console.warn('\u26a0 playwright-cli not available at ' + pwcli);
    console.warn('  Cover HTML saved to file://' + htmlPath);
    console.warn('  Manual: open in 1920x1080 browser and save as ' + resolve(outputPath));
    return false;
  }

  const absOutput = resolve(outputPath);
  mkdirSync(dirname(absOutput), { recursive: true });

  const htmlDir = dirname(htmlPath);
  const htmlFile = basename(htmlPath);
  const port = 9876;
  let server = null;

  try {
    server = spawn('python3', ['-m', 'http.server', String(port), '--directory', htmlDir, '--bind', '127.0.0.1'], {
      stdio: 'pipe', detached: true,
    });
    server.unref();
    execSync('sleep 1.0', { stdio: 'inherit' });

    const url = 'http://127.0.0.1:' + port + '/' + htmlFile;
    const cmds = [
      '"' + pwcli + '" open',
      '"' + pwcli + '" resize 1920 1080',
      '"' + pwcli + '" goto "' + url + '"',
      'sleep 1.0',
      '"' + pwcli + '" screenshot --filename "' + absOutput + '"',
      '"' + pwcli + '" close',
    ].join('\n');
    execSync(cmds, { shell: '/bin/bash', stdio: 'inherit' });
    return true;
  } catch (err) {
    console.warn('\u26a0 playwright-cli screenshot failed: ' + err.message);
    console.warn('  Cover HTML saved at file://' + htmlPath);
    console.warn('  Manual: open in 1920x1080 browser and save as ' + absOutput);
    return false;
  } finally {
    if (server) {
      try { process.kill(-server.pid, 'SIGTERM'); } catch (e) {}
      setTimeout(function() { try { process.kill(-server.pid, 'SIGKILL'); } catch (e) {} }, 3000);
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────
async function main() {
  const opts = parseArgs();
  if (opts.help) {
    const help = readFileSync(process.argv[1], 'utf8').split('\n').slice(2, 20).join('\n');
    console.log(help);
    process.exit(0);
  }

  // Parse articles
  const articles = parseKeyPoints(opts.keyPoints);
  if (articles.length === 0) {
    console.error('❌ No articles found in key-points.md');
    process.exit(1);
  }
  console.log(`📰 Found ${articles.length} articles`);

  // Read palette
  const palette = readPalette(resolve(opts.design));
  console.log(`🎨 Using palette background=${palette.background} accent=${palette.accent}`);

  // Determine date
  let dateStr = opts.date;
  if (!dateStr) {
    const pubTimes = articles.filter(a => a.pubTime).map(a => a.pubTime);
    if (pubTimes.length > 0) {
      const d = new Date(pubTimes.sort().pop());
      dateStr = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    } else {
      const d = new Date();
      dateStr = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    }
  }
  console.log(`📅 Date: ${dateStr}`);

  // ---- Scene HTML mode ----
  if (opts.sceneHtml) {
    const sceneHtml = generateSceneHTML(articles, palette, dateStr, 0, 0, 5);
    const outPath = resolve(opts.output);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, sceneHtml, 'utf8');
    console.log(`✅ Cover scene HTML → ${outPath}`);
    return;
  }

  // ---- PNG cover mode ----
  const html = generateCoverHTML(articles, palette, dateStr);
  const htmlPath = resolve('/tmp/ai-news-cover.html');
  writeFileSync(htmlPath, html, 'utf8');
  console.log(`📄 Cover HTML → ${htmlPath}`);

  if (opts.noScreenshot) {
    console.log('🔍 --no-screenshot: HTML only');
    console.log(`   Open: file://${htmlPath}`);
    // Also write scene HTML
    const sceneHtml = generateSceneHTML(articles, palette, dateStr, 0, 0, 5);
    const scenePath = resolve(opts.output.replace(/\.png$/, '-scene.html'));
    writeFileSync(scenePath, sceneHtml, 'utf8');
    console.log(`📄 Cover scene HTML → ${scenePath}`);
    return;
  }

  const success = screenshotViaPlaywright(htmlPath, opts.output);
  if (success) {
    const stat = existsSync(opts.output) ? ` (${(readFileSync(opts.output).length / 1024).toFixed(0)} KB)` : '';
    console.log(`✅ Cover image → ${opts.output}${stat}`);
  } else {
    console.log(`ℹ️  Cover HTML at file://${htmlPath}`);
    console.log(`   To generate manually: open in browser, screenshot at 1920×1080, save as ${opts.output}`);
  }

  // Always write scene HTML alongside cover
  const sceneHtml = generateSceneHTML(articles, palette, dateStr, 0, 0, 5);
  const scenePath = resolve(dirname(opts.output), 'cover-scene.html');
  writeFileSync(scenePath, sceneHtml, 'utf8');
  console.log(`📄 Cover scene HTML → ${scenePath}`);
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
