# AI 资讯速递 — Design Template

Copy this file to the project root as `design.md` before building any composition. All colors, fonts, and motion choices MUST come from here — do not invent values at render time.

## Channel Identity

- **Name:** AI 资讯速递
- **Mood:** Dark tech, clear, trustworthy
- **Audience:** Chinese-speaking AI industry followers
- **Platform:** 1920×1080 landscape, social + short-form

## Palette

| Role | Hex | Usage |
|------|-----|-------|
| Background | `#0a0a1a` | Full canvas, scene backgrounds |
| Background alt | `#12122a` | Subtle gradient stops |
| Surface light | `rgba(255,255,255,0.08)` | Data card backgrounds, bar chart tracks |
| Surface med | `rgba(255,255,255,0.05)` | Badges, subtle dividers |
| Primary text | `#ffffff` | Headlines, active caption words, key values |
| Summary text | `#b0b0cc` | Body copy, labels, inactive captions |
| Accent (cyan) | `#00d4ff` | Numbers, brand names, active karaoke, counter index, data highlights |
| Accent (purple) | `#7c3aed` | Badges, progress bar end, secondary glow |
| Accent (emerald) | `#10b981` | Green accent for positive metrics, comparison highlights |
| Accent (amber) | `#f59e0b` | Amber accent for warnings, timeline markers |
| Accent (rose) | `#f43f5e` | Rose accent for critical data points |
| Caption shadow | `rgba(0,0,0,0.8)` | `text-shadow` on subtitles (no opaque bar) |

**Glow rotation per news scene (cycle in order):** cyan → purple → blue (`#3b82f6`) → green (`#10b981`) → amber (`#f59e0b`) → rose (`#f43f5e`)

## Typography

- **Font stack:** `sans-serif` only (PingFang SC / Microsoft YaHei — no Google Fonts CDN)
- **Title card:** 72px, weight 800
- **Headline:** 56px, weight 700, max 2 lines
- **Summary:** 32px, weight 400
- **Stat number:** 140px, weight 800, accent cyan
- **Data counter (animated):** 96px, weight 800, accent cyan — for count-up numbers
- **Bar label:** 18px, weight 500 — for progress bar legends
- **Bar value:** 20px, weight 700, primary text — for bar end label
- **Badge:** 14px, weight 600, uppercase tracking
- **Counter:** 14px — `"快讯 "` muted + index in cyan
- **Caption:** 32px, weight 600
- **Quote text:** 40px, weight 400, italic — for quote cards
- **Timeline year:** 48px, weight 800, accent color — for timeline markers
- **Comparison value:** 64px, weight 800 — side-by-side comparison numbers
- **Icon symbol:** 24px, weight 400 — CSS shape icons for category cues

Use `window.__hyperframes.fitTextFontSize()` when headlines exceed 2 lines.

## Rich Visual Elements

### 1. Animated Data Counter
Numbers that count up with a dramatic entrance. For large metrics (± / 金额 / 参数量).

```html
<div class="data-counter">
  <span class="counter-value" id="sX-counter-val">140万亿</span>
  <span class="counter-label">日均 Token 调用量</span>
</div>
```

```css
.data-counter { text-align: center; margin: 20px 0; }
.counter-value { font-size: 96px; font-weight: 800; color: #00d4ff; line-height: 1.1; text-shadow: 0 0 40px rgba(0,212,255,0.3); }
.counter-label { font-size: 22px; color: #b0b0cc; margin-top: 8px; display: block; }
```

**GSAP:** `tl.fromTo("#sX-counter-val", { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.8, ease: "expo.out" }, srtStart);`

### 2. Progress Bar / Ratio Display
Horizontal bar showing a proportion. Width animates from 0% to target value.

```html
<div class="ratio-bar">
  <div class="ratio-bar-track">
    <div class="ratio-bar-fill" id="sX-bar1" style="width:0%"></div>
  </div>
  <div class="ratio-bar-labels">
    <span class="bar-label">自动化流量占比</span>
    <span class="bar-value" id="sX-bar1-val">57.4%</span>
  </div>
</div>
```

```css
.ratio-bar { width: 100%; max-width: 900px; margin: 12px 0; }
.ratio-bar-track { width: 100%; height: 28px; background: rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden; }
.ratio-bar-fill { height: 100%; border-radius: 14px; background: linear-gradient(90deg, #00d4ff, #7c3aed); transition: none; }
.ratio-bar-labels { display: flex; justify-content: space-between; margin-top: 6px; font-size: 18px; color: #b0b0cc; }
.bar-value { font-weight: 700; color: #ffffff; font-size: 20px; }
```

**GSAP:** `tl.to("#sX-bar1", { width: "57.4%", duration: 1.0, ease: "power2.out" }, srtStart);`

### 3. Dual Bar / Comparison Display
Two stacked bars for before/after or A/B comparison. Each bar animates independently.

```html
<div class="comparison-block">
  <div class="comparison-row">
    <span class="comp-label">2024年初</span>
    <div class="comp-track"><div class="comp-fill" id="sX-comp1" style="width:0%"></div></div>
    <span class="comp-value">0.1万亿</span>
  </div>
  <div class="comparison-row">
    <span class="comp-label">2026年3月</span>
    <div class="comp-track"><div class="comp-fill" id="sX-comp2" style="width:0%"></div></div>
    <span class="comp-value accent">140万亿</span>
  </div>
</div>
```

```css
.comparison-block { width: 100%; max-width: 1000px; margin: 16px 0; display: flex; flex-direction: column; gap: 14px; }
.comparison-row { display: flex; align-items: center; gap: 14px; }
.comp-label { font-size: 18px; color: #b0b0cc; min-width: 100px; text-align: right; }
.comp-track { flex: 1; height: 24px; background: rgba(255,255,255,0.06); border-radius: 12px; overflow: hidden; }
.comp-fill { height: 100%; border-radius: 12px; background: linear-gradient(90deg, #00d4ff, #3b82f6); }
.comp-value { font-size: 22px; font-weight: 700; color: #e8e8f0; min-width: 120px; }
.comp-value.accent { color: #00d4ff; }
```

**GSAP:** `tl.to("#sX-comp1", { width: "10%", duration: 0.8, ease: "power2.out" }, srtStart); tl.to("#sX-comp2", { width: "90%", duration: 0.8, ease: "power2.out" }, srtStart);`

### 4. Quote Block
For articles with notable statements. Large italic text with quotation marks.

```html
<div class="quote-block">
  <span class="quote-mark">"</span>
  <p class="quote-text">聊天已死</p>
  <span class="quote-attribution">— OpenAI 高级员工</span>
</div>
```

```css
.quote-block { text-align: center; margin: 20px auto; max-width: 1100px; }
.quote-mark { font-size: 72px; color: #00d4ff; opacity: 0.4; line-height: 0.5; display: block; }
.quote-text { font-size: 40px; font-weight: 400; color: #ffffff; line-height: 1.4; padding: 10px 0; }
.quote-attribution { font-size: 20px; color: #b0b0cc; display: block; margin-top: 8px; }
```

### 5. Timeline / Milestone Marker
For predictions, forecasts, or chronological data. Vertical line with labeled markers.

```html
<div class="timeline-block">
  <div class="tm-item">
    <div class="tm-dot"></div>
    <span class="tm-date">2025</span>
    <span class="tm-desc">多产品布局</span>
  </div>
  <div class="tm-item active">
    <div class="tm-dot"></div>
    <span class="tm-date">2026</span>
    <span class="tm-desc">超级应用转型</span>
  </div>
</div>
```

```css
.timeline-block { position: relative; padding-left: 30px; border-left: 2px solid rgba(255,255,255,0.1); margin: 20px 0; }
.tm-item { position: relative; margin-bottom: 24px; padding-left: 20px; }
.tm-dot { position: absolute; left: -36px; top: 6px; width: 12px; height: 12px; border-radius: 50%; background: #b0b0cc; }
.tm-item.active .tm-dot { background: #00d4ff; box-shadow: 0 0 12px rgba(0,212,255,0.6); }
.tm-date { font-size: 48px; font-weight: 800; color: #00d4ff; display: block; line-height: 1; }
.tm-desc { font-size: 24px; color: #e8e8f0; margin-top: 4px; display: block; }
```

### 6. Category Icon Accents
Small CSS symbols next to badges for instant visual categorization.

```css
.badge.icon-product::before { content: "▲"; margin-right: 6px; font-size: 10px; }
.badge.icon-data::before { content: "▬"; margin-right: 6px; letter-spacing: 1px; font-size: 12px; }
.badge.icon-policy::before { content: "◆"; margin-right: 6px; font-size: 10px; color: #f59e0b; }
.badge.icon-research::before { content: "⬡"; margin-right: 6px; font-size: 10px; color: #10b981; }
.badge.icon-quote::before { content: "❝"; margin-right: 4px; font-size: 12px; }
```

Usage: `<span class="badge icon-data">行业数据</span>`

## Scene Background (Non-Negotiable)

HyperFrames headless render defaults to a **white canvas**. `body { background: #0a0a1a }` alone is not enough — scene clips mount/unmount by time, so a gap between clips flashes white.

**Always add a persistent `#bg-plate` behind all scenes** (not a clip — always rendered):

```html
<div id="root" ...>
  <div id="bg-plate"></div>
  <!-- progress, scenes, captions, audio -->
</div>
```

```css
#root { position: relative; width: 1920px; height: 1080px; }
#bg-plate { position: absolute; inset: 0; background: #0a0a1a; z-index: 0; }
.scene { background: #0a0a1a; z-index: 1; /* required on every scene clip */ }
```

Without `#bg-plate` + `.scene` background, crossfades between news items flash white for 1–2 frames.

## Scene Skeleton (fixed across all videos)

Every video uses the same structural template. Only content and visual elements change.

| Scene | Type | Fixed elements |
|-------|------|----------------|
| S1 | Title Card | channel name, date, hero title, `.deco-glow` |
| S2–SN | News item | counter, badge, headline, visual elements (KPs / stat / comparison / timeline / quote / ratio), `.deco-glow`, `.deco-grid` |
| SN+1 | Closing | CTA + site URL, channel name, fade to dark |

**Depth layers (every scene):**
1. Background: `.deco-grid` or `.deco-dots` (slow drift)
2. Mid: `.deco-glow` (radial gradient, scene-specific hue)
3. Foreground: content stack (badge → headline → visual elements)

### Key Points Layout (Left-Aligned)

All numbered key-point lists (1. 2. 3.) must be left-aligned, not centered. Add these CSS rules:

```css
.key-points {
  text-align: left;
  width: 100%;
  max-width: 1100px;
  margin: 16px 0 0 0;
}
.kp-item {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  margin-bottom: 18px;
  width: 100%;
}
.kp-num {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0,212,255,0.12);
  color: #00d4ff;
  font-size: 18px;
  font-weight: 700;
}
.kp-text {
  font-size: 30px;
  color: #e8e8f0;
  line-height: 1.4;
  flex: 1;
  text-align: left;
}
```

The number circle is fixed-width and the text fills remaining width, creating a clean left-aligned vertical list.


## Motion Character

| Verb | Ease | Element |
|------|------|---------|
| Pop-in | `back.out(2.0)` + rotation -15° | Badge, icon accents |
| Slide-up | `power3.out` | Headline |
| Subtle rise | `power2.out` | Summary, KPs, labels |
| Dramatic | `expo.out` | Stat number, data counter value, comparison values |
| Bar fill | `power2.out` | Progress bar fill width, comp bar fill |
| Pulse | `none, yoyo:true` | Data ring pulse, timeline dots |
| Text fade | `power2.out` | Quote text, attribution |
| Scene enter | `opacity 0→1`, 0.1s | Whole scene |
| Scene exit | `power2.in`, 0.3s | Starts 0.3s before scene end |
| Ambient | `none` | `.deco-glow` scale 1→1.05 over scene duration |
| Progress | `none` | `.progress-fill` scaleX 0→1 over total duration |

**Hard kill:** `tl.set("#sX", { opacity: 0 }, sceneEnd)` after every scene exit tween.

## Transitions (mandatory — no jump cuts)

| From → To | Type | Duration | Ease |
|-----------|------|----------|------|
| Title → News 1 | Crossfade + scale | 0.4s | `power2.inOut` |
| News N → News N+1 | Crossfade + scale | 0.35s | `power2.inOut` |
| Last news → Closing | Fade to dark | 0.6s | `power2.in` |

Animate every element IN via `gsap.from()`. The transition IS the exit — do not add separate exit tweens before a transition (except closing scene).

## Emphasis Rules

Wrap in `<span class="accent">` (color `#00d4ff`, weight 700):
- Brand / product names (OpenAI, 千问, etc.)
- Numbers and statistics (融资额, 参数量, 百分比)
- Key action verbs when space allows

For data-rich articles, combine multiple visual elements:
- **Key number + ratio bar** for percentage-based stories (e.g., "57.4% robot traffic")
- **Animated counter + comparison bars** for growth metrics (e.g., "140万亿 Token, 千倍增长")
- **Timeline markers** for prediction/forecast stories
- **Quote block** for notable statements ("Chat is dead")
- See [news-video-patterns.md](news-video-patterns.md) for full scene types and selection criteria.

## Caption Style (karaoke overlay)

- Energy level: **natural** (clear news reading)
- Position: bottom 100px, full-width centered container
- Active word: `#00d4ff`, scale 1.08
- Read words: opacity 0.5
- Unread words: opacity 0.3
- Semi-transparent dark bar: `background: rgba(0,0,0,0.72)` + `text-shadow`
- Caption opacity: `1` when visible (not `0.5` — washes out on any light bleed)
- Full spec: [caption-karaoke.md](caption-karaoke.md)

## Tracks

| Track | Content |
|-------|---------|
| 0 | Progress bar |
| 1 | Scene clips (title + news + closing) |
| 2 | Caption overlay sub-composition |
| 3 | Narration audio |

