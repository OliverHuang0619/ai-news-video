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
| Surface light | `rgba(255,255,255,0.08)` | Data card backgrounds, badge backgrounds |
| Surface med | `rgba(255,255,255,0.05)` | Subtle dividers |
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
- **Headline:** 48px, weight 700, max 2 lines
- **Summary:** 28px, weight 400
- **Stat number:** 96px, weight 800, accent cyan
- **Badge:** 14px, weight 600, uppercase tracking
- **Counter:** 14px — `"快讯 "` muted + index in cyan
- **Key point text:** 28px, weight 400
- **Key point number:** 18px, weight 700
- **Caption:** 32px, weight 600
- **Quote text:** 40px, weight 400, italic — for quote cards
- **Timeline year:** 48px, weight 800, accent color — for timeline markers
- **Comparison value:** 48px, weight 800 — side-by-side comparison numbers

## Rich Visual Elements

### 1. Animated Data Counter
Numbers that rise up with a dramatic entrance. For large metrics (融资 / 金额 / 参数量).

```html
<div className="data-counter">
  <span class="counter-value">140万亿</span>
  <span class="counter-label">日均 Token 调用量</span>
</div>
```

```css
.counter-value { font-size: 96px; font-weight: 800; color: #00d4ff; line-height: 1.1; }
.counter-label { font-size: 22px; color: #b0b0cc; margin-top: 8px; display: block; }
```

**Remotion animation:** `interpolate(frame, [startFrame, startFrame + 24], [0.1, 1])` for scale entrance, `interpolate()` for opacity.

### 2. Progress Bar / Ratio Display
Horizontal bar showing a proportion. Width animates from 0 to target value.

```html
<div className="ratio-bar">
  <div class="ratio-bar-track">
    <div class="ratio-bar-fill" style={{ width: animatedWidth }}></div>
  </div>
  <div class="ratio-bar-labels">
    <span class="bar-label">自动化流量占比</span>
    <span class="bar-value">57.4%</span>
  </div>
</div>
```

```css
.ratio-bar-track { width: 100%; height: 28px; background: rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden; }
.ratio-bar-fill { height: 100%; border-radius: 14px; background: linear-gradient(90deg, #00d4ff, #7c3aed); }
```

**Remotion animation:** Use `interpolate(frame, [startFrame, startFrame + 30], [0, targetWidthPct])` for the fill width.

### 3. Dual Bar / Comparison Display
Two stacked rows for before/after or A/B comparison. Each bar animates independently.

```html
<div className="comparison-block">
  <div class="comparison-row">
    <span class="comp-label">2024年初</span>
    <div class="comp-track"><div class="comp-fill" style={{ width: width1 }}></div></div>
    <span class="comp-value">0.1万亿</span>
  </div>
  <div class="comparison-row">
    <span class="comp-label">2026年3月</span>
    <div class="comp-track"><div class="comp-fill" style={{ width: width2 }}></div></div>
    <span class="comp-value accent">140万亿</span>
  </div>
</div>
```

### 4. Quote Block
For articles with notable statements. Large italic text with quotation marks.

```html
<div className="quote-block">
  <span class="quote-mark">"</span>
  <p class="quote-text">聊天已死</p>
  <span class="quote-attribution">— OpenAI 高级员工</span>
</div>
```

### 5. Timeline / Milestone Marker
For predictions, forecasts, or chronological data. Vertical line with labeled markers.

```html
<div className="timeline-block">
  <div class="tm-item active">
    <div class="tm-dot"></div>
    <span class="tm-date">2026</span>
    <span class="tm-desc">超级应用转型</span>
  </div>
</div>
```

### 6. Category Icon Accents
Small CSS symbols next to badges for instant visual categorization.

```css
.icon-product::before { content: "▲"; margin-right: 6px; font-size: 10px; }
.icon-data::before { content: "▬"; margin-right: 6px; letter-spacing: 1px; font-size: 12px; }
.icon-policy::before { content: "◆"; margin-right: 6px; font-size: 10px; color: #f59e0b; }
.icon-research::before { content: "⬡"; margin-right: 6px; font-size: 10px; color: #10b981; }
.icon-quote::before { content: "❝"; margin-right: 4px; font-size: 12px; }
```

## Scene Skeleton (fixed across all videos)

Every video uses the same structural template. Only content and visual elements change.

| Scene | Type | Fixed elements |
|-------|------|----------------|
| S1 | Title Card | channel name, date, hero title, decorative glow |
| S2–SN | News item | counter, badge, headline, visual elements (KPs / stat / comparison / timeline / quote / ratio), decorative glow |
| SN+1 | Closing | CTA + site URL, channel name, fade to dark |

**Depth layers (every scene):**
1. Background: `#0a0a1a` fill + gradient glow behind content
2. Mid: decorative glow (radial gradient, scene-specific hue)
3. Foreground: content stack (badge → headline → visual elements)

## Animation Character (Remotion)

| Verb | Function | Element |
|------|----------|---------|
| Pop-in | `spring()` with damping:12, stiffness:120 | Badge, icon accents |
| Slide-up | `interpolate(frame, [s, s+20], [40, 0])` + opacity fade | Headline |
| Subtle rise | `interpolate(frame, [s, s+15], [20, 0])` | Summary, key points |
| Dramatic | `spring()` with mass:0.3, stiffness:150 | Stat number, data counter |
| Bar fill | `interpolate(frame, [s, s+30], [0, target])` | Progress bar fill width |
| Scene enter | `interpolate(frame, [s, s+5], [0, 1])` for opacity | Whole scene |
| Scene exit | `interpolate(frame, [s-5, s], [1, 0])` for opacity | Last scene only (closing) |

## Scene Transitions (Remotion)

Remotion uses `<Sequence>` for scene ordering. Each scene component implements its own entrance fade-in via `interpolate()`. The transition IS the entrance animation of the next scene.

**Crossfade pattern (add to each NewsScene component start):**
```tsx
const fadeInOpacity = interpolate(
  frame,
  [sceneStart, sceneStart + 10],
  [0, 1],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
);

return (
  <AbsoluteFill style={{ opacity: fadeInOpacity }}>
    {/* scene content */}
  </AbsoluteFill>
);
```

The 10-frame (~0.33s) fade-in creates a smooth crossfade from the previous scene. No slide transitions — they break on video.

## Emphasis Rules

Wrap brands and numbers in accent color (cyan `#00d4ff`):
- Brand / product names (OpenAI, 千问, etc.)
- Numbers and statistics (融资额, 参数量, 百分比)
- Key action verbs when space allows

## Caption Style (karaoke overlay)

- Energy level: **natural** (clear news reading)
- Position: bottom 80px, full-width centered container
- Active word: `#00d4ff`, scale 1.08
- Read words: opacity 0.5
- Unread words: opacity 0.35
- Semi-transparent dark bar: `background: rgba(0,0,0,0.72)` + `text-shadow`
- Full spec: [caption-karaoke.md](caption-karaoke.md)
